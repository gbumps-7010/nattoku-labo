# -*- coding: utf-8 -*-
"""GSC Performance sheet → winning query / page priorities."""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlparse

import gspread
from google.oauth2.service_account import Credentials

sys.stdout.reconfigure(encoding="utf-8")

KEY = r"c:\Users\naoto\Desktop\ナットクLabo\py\google-key.json"
URL = "https://docs.google.com/spreadsheets/d/1impx6v7y899WMEsBaGrPpALeu3Ns11pdT3VEN98L-Y4/edit?usp=sharing"

# Existing owned pages (path → intent label)
OWNED = {
    "/makers/dreame": "メーカー",
    "/makers/ecovacs": "メーカー",
    "/makers/roborock": "メーカー",
    "/makers/anker": "メーカー",
    "/makers/irobot": "メーカー",
    "/makers/switchbot": "メーカー",
    "/rankings/quietness": "静音",
    "/rankings/floor-cleaning": "床掃除",
    "/rankings/carpet-cleaning": "カーペット",
    "/compare/robot-vacuum-under-5man": "安い/5万以下",
    "/compare/robot-vacuum-5-7man": "価格帯",
    "/compare/robot-vacuum-7-10man": "価格帯",
    "/compare/robot-vacuum-10-15man": "価格帯",
    "/compare/robot-vacuum-15-20man": "価格帯",
    "/compare/robot-vacuum-20man-plus": "価格帯",
    "/guides/robot-vacuum-cheap": "安い",
    "/guides/robot-vacuum-pet": "ペット",
    "/guides/robot-vacuum-cat": "猫",
    "/guides/robot-vacuum-thin": "薄い",
    "/guides/robot-vacuum-height": "高さ",
    "/guides/robot-vacuum-small": "小型",
    "/guides/robot-vacuum-makers": "メーカー選び",
    "/guides/robot-vacuum-cost-performance": "コスパ",
}


def num(s: str) -> float:
    s = (s or "").strip().replace(",", "").replace("%", "")
    if not s:
        return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0


def path_of(url: str) -> str:
    p = urlparse(url).path.rstrip("/") or "/"
    return p


def bucket_query(q: str) -> str:
    q = q.lower()
    rules = [
        ("静音|静か", "静音"),
        ("ペット|猫|犬|毛", "ペット/猫"),
        ("安い|5万|コスパ|コ スパ", "安い/コスパ"),
        ("薄い|薄型|高さ|スリム", "薄い/高さ"),
        ("小型|コンパクト|ミニ", "小型"),
        ("メーカー|どれ|比較|おすすめ|ランキング", "比較/おすすめ"),
        ("口コミ|評判|レビュー", "機種口コミ"),
        ("dreame|ドリーミ|エコバックス|ecovacs|deebot|ロボロック|roborock|eufy|ルンバ|roomba|switchbot|スイッチボット", "ブランド/機種"),
    ]
    for pat, label in rules:
        if re.search(pat, q):
            return label
    return "その他"


def load_ws(ss, title: str):
    vals = ss.worksheet(title).get_all_values()
    if not vals:
        return []
    headers = vals[0]
    rows = []
    for r in vals[1:]:
        if not any(r):
            continue
        rows.append({headers[i]: (r[i] if i < len(r) else "") for i in range(len(headers))})
    return rows


def main():
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.readonly",
    ]
    creds = Credentials.from_service_account_file(KEY, scopes=scopes)
    ss = gspread.authorize(creds).open_by_url(URL)

    pages = load_ws(ss, "ページ")
    queries = load_ws(ss, "クエリ")

    # normalize page headers (JP export)
    def pick(row, *names):
        for n in names:
            if n in row:
                return row[n]
        # fuzzy
        for k, v in row.items():
            for n in names:
                if n in k:
                    return v
        return ""

    page_rows = []
    for r in pages:
        url = pick(r, "上位のページ", "ページ", "Top pages")
        if not url or "nattoku-labo.com" not in url:
            continue
        clicks = num(pick(r, "クリック数", "Clicks"))
        imps = num(pick(r, "表示回数", "Impressions"))
        ctr = num(pick(r, "CTR"))
        if ctr > 1:  # already percent
            ctr = ctr / 100 if ctr > 1 and ctr <= 100 else ctr
        # CTR column often like 1.2%
        ctr_raw = pick(r, "CTR")
        if "%" in str(ctr_raw):
            ctr = num(ctr_raw) / 100
        pos = num(pick(r, "掲載順位", "Position"))
        page_rows.append(
            {
                "path": path_of(url),
                "url": url,
                "clicks": clicks,
                "imps": imps,
                "ctr": ctr,
                "pos": pos,
            }
        )

    q_rows = []
    for r in queries:
        q = pick(r, "上位のクエリ", "クエリ", "Top queries")
        if not q:
            continue
        clicks = num(pick(r, "クリック数", "Clicks"))
        imps = num(pick(r, "表示回数", "Impressions"))
        ctr_raw = pick(r, "CTR")
        ctr = num(ctr_raw) / 100 if "%" in str(ctr_raw) else num(ctr_raw)
        if ctr > 1:
            ctr = ctr / 100
        pos = num(pick(r, "掲載順位", "Position"))
        q_rows.append(
            {
                "q": q,
                "clicks": clicks,
                "imps": imps,
                "ctr": ctr,
                "pos": pos,
                "bucket": bucket_query(q),
            }
        )

    tot_c = sum(p["clicks"] for p in page_rows)
    tot_i = sum(p["imps"] for p in page_rows)
    print("=== TOTAL（ページ）===")
    print(f"clicks={tot_c:.0f} imps={tot_i:.0f} ctr={(tot_c/tot_i*100 if tot_i else 0):.2f}% pages={len(page_rows)}")

    print("\n=== ページ種別 ===")
    by_type = defaultdict(lambda: {"c": 0.0, "i": 0.0, "n": 0})
    for p in page_rows:
        path = p["path"]
        if path.startswith("/products/"):
            t = "products"
        elif path.startswith("/makers/"):
            t = "makers"
        elif path.startswith("/compare/"):
            t = "compare"
        elif path.startswith("/rankings/"):
            t = "rankings"
        elif path.startswith("/guides/"):
            t = "guides"
        else:
            t = "other"
        by_type[t]["c"] += p["clicks"]
        by_type[t]["i"] += p["imps"]
        by_type[t]["n"] += 1
    for t, v in sorted(by_type.items(), key=lambda x: -x[1]["i"]):
        ctr = v["c"] / v["i"] * 100 if v["i"] else 0
        print(f"  {t:10} n={v['n']:3} clk={v['c']:5.0f} imp={v['i']:6.0f} ctr={ctr:5.2f}%")

    print("\n=== 勝ち筋候補A: 表示あり・CTR低い（改善でクリック増） ===")
    low = [
        p
        for p in page_rows
        if p["imps"] >= 50 and p["pos"] <= 15 and p["ctr"] < 0.02
    ]
    low.sort(key=lambda p: (-p["imps"], p["ctr"]))
    for p in low[:15]:
        owned = OWNED.get(p["path"], "製品" if p["path"].startswith("/products/") else "")
        print(
            f"  {p['imps']:6.0f}imp  ctr={p['ctr']*100:4.1f}%  pos={p['pos']:4.1f}  [{owned}] {p['path']}"
        )

    print("\n=== 勝ち筋候補B: すでにクリックが取れる入口 ===")
    winners = [p for p in page_rows if p["clicks"] >= 2]
    winners.sort(key=lambda p: (-p["clicks"], -p["imps"]))
    for p in winners[:12]:
        print(
            f"  {p['clicks']:4.0f}clk  {p['imps']:5.0f}imp  ctr={p['ctr']*100:4.1f}%  pos={p['pos']:4.1f}  {p['path']}"
        )

    print("\n=== クエリ意図バケット ===")
    qb = defaultdict(lambda: {"c": 0.0, "i": 0.0, "n": 0, "samples": []})
    for r in q_rows:
        b = r["bucket"]
        qb[b]["c"] += r["clicks"]
        qb[b]["i"] += r["imps"]
        qb[b]["n"] += 1
        if len(qb[b]["samples"]) < 5 and r["imps"] >= 5:
            qb[b]["samples"].append((r["q"], r["imps"], r["pos"], r["ctr"]))
    for b, v in sorted(qb.items(), key=lambda x: -x[1]["i"]):
        ctr = v["c"] / v["i"] * 100 if v["i"] else 0
        print(f"\n[{b}] n={v['n']} clk={v['c']:.0f} imp={v['i']:.0f} ctr={ctr:.2f}%")
        for q, im, pos, ctr in sorted(v["samples"], key=lambda x: -x[1])[:5]:
            print(f"    {im:5.0f}imp pos={pos:4.1f} ctr={ctr*100:4.1f}%  {q}")

    print("\n=== 推奨フォーカス（既存ページに紐づけ） ===")
    # Intent → best owned page by impressions among that intent
    intent_pages = {
        "静音": ["/rankings/quietness"],
        "安い/5万以下": ["/compare/robot-vacuum-under-5man", "/guides/robot-vacuum-cheap"],
        "ペット/猫": ["/guides/robot-vacuum-pet", "/guides/robot-vacuum-cat"],
        "メーカー": ["/makers/dreame", "/makers/ecovacs", "/guides/robot-vacuum-makers"],
        "薄い/高さ": ["/guides/robot-vacuum-thin", "/guides/robot-vacuum-height"],
        "小型": ["/guides/robot-vacuum-small"],
        "コスパ": ["/guides/robot-vacuum-cost-performance"],
    }
    path_map = {p["path"]: p for p in page_rows}
    for intent, paths in intent_pages.items():
        print(f"\n# {intent}")
        for path in paths:
            p = path_map.get(path)
            if p:
                print(
                    f"  OWNED  {p['imps']:5.0f}imp {p['clicks']:.0f}clk ctr={p['ctr']*100:.1f}% pos={p['pos']:.1f}  {path}"
                )
            else:
                print(f"  OWNED  (GSCにほぼ未登場)  {path}")


if __name__ == "__main__":
    main()
