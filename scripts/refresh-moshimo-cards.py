# -*- coding: utf-8 -*-
"""もしも「かんたんリンク」のカード表示（商品名・画像・Yahoo!/Amazon の検索語）を楽天の最新情報で更新する。

かんたんリンクの埋め込みコードは作成時点の楽天商品名・画像を固定で持つため、
セール文句入りの商品名やクーポン画像がそのまま残る。楽天から最新の情報を取り直して書き換える。

取得元:
  環境変数 RAKUTEN_APP_ID と RAKUTEN_ACCESS_KEY があれば楽天市場商品検索API（楽天ウェブサービス）。
  なければ楽天の商品ページを直接読む（楽天はクラウドからの直接アクセスを拒否するため、GitHub Actions ではAPI必須）。

計測に使う a_id / p_id / pc_id / pl_id と楽天の商品URL（u）は変更しない。
（もしもの bundle.js はクリック時に af.moshimo.com/af/c/click?a_id=…&url=遷移先 を組み立てるため、
  商品名・画像・検索語を変えてもアフィリエイトの計測は保たれる）

更新対象:
  products/data/<slug>.json の affiliate.moshimo
  products/data/moshimo-embed-*.html（同じ eid のもの）
  makers/*.html の window.__AFFILIATE__

  python scripts/refresh-moshimo-cards.py           # 差分の表示のみ
  python scripts/refresh-moshimo-cards.py --apply   # 書き込み
"""
from __future__ import annotations

import argparse
import html
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "products" / "data"
MAKERS = ROOT / "makers"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
MAX_IMAGES = 3
SEARCH_URLS = {
    "yahoo": ("shopping.yahoo.co.jp/search", "https://shopping.yahoo.co.jp/search?first=1&p={}"),
    "amazon": (
        "amazon.co.jp/s/",
        "https://www.amazon.co.jp/s/ref=nb_sb_noss_1?__mk_ja_JP=%E3%82%AB%E3%82%BF%E3%82%AB%E3%83%8A"
        "&url=search-alias%3Daps&field-keywords={}",
    ),
}
RAKUTEN_SEARCH = "https://search.rakuten.co.jp/search/mall/{}/"
RAKUTEN_API = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701"
SITE_URL = "https://nattoku-labo.com/"
MSM_RE = re.compile(r"msmaflink\((\{.*?\})\);", re.S)
AFF_RE = re.compile(r"^([ \t]*window\.__AFFILIATE__ = )(.*?);[ \t]*\r?$", re.M)


def read_keep_newline(path: Path) -> tuple[str, str]:
    raw = io.open(path, encoding="utf-8", newline="").read()
    return raw, ("\r\n" if "\r\n" in raw else "\n")


def write_text(path: Path, text: str) -> None:
    io.open(path, "w", encoding="utf-8", newline="").write(text)


def dump_data_json(data: dict, raw: str, nl: str) -> str:
    text = json.dumps(data, ensure_ascii=False, indent=2).replace("\n", nl)
    return text + (nl if raw.endswith("\n") else "")


def dump_msm(obj: dict) -> str:
    """かんたんリンクの配布コードと同じく / と & をエスケープする（<script> 内で安全にするため）。"""
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":")).replace("/", "\\/").replace("&", "\\u0026")


def fetch(url: str) -> tuple[int | None, str | None]:
    """(HTTPステータス, 本文)。通信エラーで判定できないときは (None, None)。"""
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ja"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                body = res.read()
                charset = res.headers.get_content_charset() or "utf-8"
                return res.status, body.decode(charset, errors="replace")
        except urllib.error.HTTPError as e:
            if e.code in (404, 410):
                return e.code, None
        except (urllib.error.URLError, TimeoutError):
            pass
        time.sleep(3 * (attempt + 1))
    return None, None


def strip_promos(name: str) -> str:
    t = re.sub(r"【[^】]*】|［[^］]*］|\[[^\]]*\]|★[^★]*★|＼[^／]*／|＜[^＞]*＞", " ", name)
    return re.sub(r"\s+", " ", t).strip()


def clean_title(title: str) -> str:
    """楽天の og:title「【楽天市場】商品名：店名」から店名とセール文句を除く。"""
    t = re.sub(r"^【楽天市場】", "", html.unescape(title))
    if "：" in t:
        t = t.rsplit("：", 1)[0]
    return strip_promos(t)


def parse_item_page(page: str) -> dict | None:
    m = re.search(r'<meta[^>]+property="og:title"[^>]+content="([^"]*)"', page)
    if not m:
        return None
    images = []
    im = re.search(r'"images":\[(.*?)\]', page, re.S)
    if im:
        images = re.findall(r'"type":"CABINET","location":"([^"]+)"', im.group(1))
    return {
        "name": clean_title(m.group(1)),
        "images": images[:MAX_IMAGES],
        "inStock": "schema.org/InStock" in page,
    }


def item_code(url: str) -> str | None:
    """https://item.rakuten.co.jp/<店舗>/<商品>/ -> 「店舗:商品」"""
    parts = [p for p in urllib.parse.urlparse(url).path.split("/") if p]
    return f"{parts[0]}:{parts[1]}" if len(parts) >= 2 else None


def fetch_api(code: str, app_id: str, access_key: str) -> tuple[str, dict | None]:
    """("ok", 商品) / ("missing", None) 検索に出ない / ("error", None) 判定できない。"""
    query = urllib.parse.urlencode({
        "applicationId": app_id,
        "accessKey": access_key,
        "itemCode": code,
        "availability": 0,
        "formatVersion": 2,
        "elements": "itemName,mediumImageUrls,availability",
    })
    req = urllib.request.Request(
        f"{RAKUTEN_API}?{query}",
        headers={"User-Agent": UA, "Referer": SITE_URL, "Origin": SITE_URL.rstrip("/")},
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as res:
                body = json.load(res)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return "missing", None
            if e.code in (400, 401, 403):
                detail = e.read().decode("utf-8", errors="replace")[:200]
                raise SystemExit(f"楽天APIの認証・パラメータエラー（HTTP {e.code}）: {detail}")
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
            pass
        else:
            items = body.get("Items") or body.get("items") or []
            if not items:
                return "missing", None
            item = items[0]
            return "ok", item.get("Item", item)
        time.sleep(5 * (attempt + 1))
    return "error", None


def parse_api_item(item: dict, obj: dict) -> dict:
    """APIの商品情報をカードの形に合わせる。画像はカードの d + c_p に続くパスだけを使う。"""
    prefix = (obj.get("d") or "") + (obj.get("c_p") or "") + "/"
    images = []
    for im in item.get("mediumImageUrls") or []:
        url = (im.get("imageUrl") if isinstance(im, dict) else im) or ""
        url = url.split("?", 1)[0]
        if obj.get("c_p") and url.startswith(prefix):
            images.append(url[len(prefix) - 1:])
    return {
        "name": strip_promos(item.get("itemName") or ""),
        "images": images[:MAX_IMAGES],
        "inStock": item.get("availability") == 1,
    }


def search_keyword(data: dict) -> str:
    maker = (data.get("manufacturer") or "").strip()
    name = re.sub(r"\s+", " ", re.sub(r"[®™©]", "", data.get("productName") or "")).strip()
    if maker and name.lower().startswith(maker.lower()):
        return name
    return f"{maker} {name}".strip()


def point_rakuten_to_search(obj: dict, keyword: str) -> list[str]:
    """楽天の商品ページが削除済みのとき、楽天ボタンの行き先を楽天の検索結果に切り替える。
    検索URLは bundle.js 自身が楽天用のひな形として持つ形式で、a_id などは変えないため計測は保たれる。"""
    if not keyword:
        return []
    url = RAKUTEN_SEARCH.format(urllib.parse.quote(keyword, safe=""))
    old = obj["u"]["u"]
    obj["u"]["u"] = url
    for btn in obj.get("b_l") or []:
        if btn.get("s_n") == "rakuten" and btn.get("u_url") == old:
            btn["u_url"] = url
    return [f"楽天の商品ページが削除済みのため、楽天ボタンを「{keyword}」の検索結果に切り替え"]


def refresh_card(obj: dict, item: dict | None, keyword: str) -> list[str]:
    changes = []
    name = item["name"] if item else strip_promos(obj.get("n") or "")
    if name and obj.get("n") != name:
        changes.append(f"商品名: {obj.get('n', '')[:40]}… -> {name[:40]}…")
        obj["n"] = name
    if item:
        if item["images"] and obj.get("p") != item["images"]:
            changes.append(f"画像: {len(obj.get('p') or [])}枚 -> {len(item['images'])}枚（更新）")
            obj["p"] = item["images"]
    if keyword and "search.rakuten.co.jp/search/mall/" in (obj.get("u") or {}).get("u", ""):
        url = RAKUTEN_SEARCH.format(urllib.parse.quote(keyword, safe=""))
        if obj["u"]["u"] != url:
            for btn in obj.get("b_l") or []:
                if btn.get("s_n") == "rakuten" and btn.get("u_url") == obj["u"]["u"]:
                    btn["u_url"] = url
            obj["u"]["u"] = url
            changes.append(f"rakuten の検索語: {keyword}")
    if keyword:
        for btn in obj.get("b_l") or []:
            spec = SEARCH_URLS.get(btn.get("s_n"))
            if not spec or spec[0] not in (btn.get("u_url") or ""):
                continue
            url = spec[1].format(urllib.parse.quote(keyword, safe=""))
            if btn["u_url"] != url:
                changes.append(f"{btn['s_n']} の検索語: {keyword}")
                btn["u_url"] = url
    return changes


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--only", help="カンマ区切りの slug だけ処理する")
    args = ap.parse_args()
    only = set(args.only.split(",")) if args.only else None
    app_id = os.environ.get("RAKUTEN_APP_ID", "").strip()
    access_key = os.environ.get("RAKUTEN_ACCESS_KEY", "").strip()
    use_api = bool(app_id and access_key)
    if not use_api and os.environ.get("GITHUB_ACTIONS"):
        print("RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が未設定です。リポジトリの Settings → Secrets に登録してください。")
        return 1

    embed_files = {p: read_keep_newline(p)[0] for p in DATA.glob("moshimo-embed-*.html")}
    new_moshimo: dict[str, str] = {}
    report, warnings = [], []

    for path in sorted(DATA.glob("*.json")):
        if path.name == "products-index.json" or (only and path.stem not in only):
            continue
        raw, nl = read_keep_newline(path)
        data = json.loads(raw)
        moshimo = (data.get("affiliate") or {}).get("moshimo") or ""
        m = MSM_RE.search(moshimo)
        if not m:
            continue
        obj = json.loads(m.group(1))
        main = obj.get("u") or {}
        keyword = search_keyword(data)
        item = None
        changes = []
        if main.get("t") == "rakuten" and "item.rakuten.co.jp" in (main.get("u") or ""):
            status = None
            if use_api:
                state, api_item = fetch_api(item_code(main["u"]) or "", app_id, access_key)
                time.sleep(1.2)
                if state == "ok":
                    item = parse_api_item(api_item, obj)
                elif state == "missing":
                    # 検索に出ないのは削除・非公開のどちらか。削除（404）かどうかはページで確かめる
                    status, _ = fetch(main["u"])
                    if status not in (404, 410):
                        warnings.append(f"{path.stem}: 楽天APIの検索に出ません（今回は変更なし）: {main['u']}")
                else:
                    warnings.append(f"{path.stem}: 楽天APIから取得できませんでした（今回は変更なし）: {main['u']}")
            else:
                status, page = fetch(main["u"])
                item = parse_item_page(page) if page else None
                time.sleep(1.5)
                if item is None and status not in (404, 410):
                    warnings.append(f"{path.stem}: 楽天の商品ページを取得できませんでした（今回は変更なし）: {main['u']}")
            if status in (404, 410):
                warnings.append(f"{path.stem}: 楽天の商品ページが削除されています。新しいかんたんリンクの作成をおすすめします: {main['u']}")
                changes += point_rakuten_to_search(obj, keyword)
            elif item and not item["inStock"]:
                warnings.append(f"{path.stem}: 楽天の商品が在庫切れです: {main['u']}")

        changes += refresh_card(obj, item, keyword)
        if not changes:
            continue
        report.append((path.stem, changes))
        new_json = dump_msm(obj)
        new_html = moshimo[: m.start(1)] + new_json + moshimo[m.end(1):]
        new_moshimo[path.stem] = new_html
        if args.apply:
            data["affiliate"]["moshimo"] = new_html
            write_text(path, dump_data_json(data, raw, nl))
            eid = obj.get("eid")
            for ep, etext in embed_files.items():
                em = MSM_RE.search(etext)
                if em and eid and f'"eid":"{eid}"' in em.group(1):
                    write_text(ep, etext[: em.start(1)] + new_json + etext[em.end(1):])

    n_makers = 0
    if args.apply and new_moshimo:
        for mp in sorted(MAKERS.glob("*.html")):
            text, _ = read_keep_newline(mp)
            am = AFF_RE.search(text)
            if not am:
                continue
            aff = json.loads(am.group(2))
            hit = False
            for slug, pack in aff.items():
                if slug in new_moshimo and isinstance(pack, dict):
                    pack["moshimo"] = new_moshimo[slug].strip()
                    hit = True
            if hit:
                dumped = json.dumps(aff, ensure_ascii=False).replace("</", "<\\/")
                write_text(mp, text[: am.start(2)] + dumped + text[am.end(2):])
                n_makers += 1

    lines = []
    for slug, changes in report:
        lines.append(f"- {slug}")
        lines.extend(f"    - {c}" for c in changes)
    lines.append(f"更新{'した' if args.apply else 'する'}カード: {len(report)} 件 / メーカー別ページ: {n_makers} 件")
    if warnings:
        lines.append("要確認:")
        lines.extend(f"- {w}" for w in warnings)
    out = "\n".join(lines)
    print(out)
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write("## かんたんリンクの自動更新\n\n" + out + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
