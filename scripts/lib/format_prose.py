"""Shared prose formatting: emphasis + Japanese line-wrap."""
from __future__ import annotations

import html
import re

# 行頭に来ると不自然な文字（助詞・句読点など）を直前に食い付かせる
_JA_NO_LINE_START = set("、。，．）］｝」』】〉》をにではがのともへやや")
# 行末に来ると不自然な開き記号
_JA_NO_LINE_END = set("（［｛「『【〈《")

# サイトUI・ナビ用（製品口コミ文脈ではない）
SITE_UI_PHRASES = (
    "購入前に現在の販売価格の確認を強くおすすめ",
    "90点台が緑",
    "80点台が青",
    "70点台が黄",
    "70点未満が赤",
    "加重点",
    "総合点",
    "口コミ傾向",
    "強み・注意点",
    "2大ECサイト",
    "２大ECサイト",
    "口コミ分析",
    "8つの性能",
    "機能評価85%",
    "口コミ信頼度15%",
    "最も高い",
    "横断比較",
    "口コミデータ",
    "比較表",
    "実体験に近いおすすめ順",
    "口コミ件数",
    "口コミ信頼度",
    "価格帯",
)

# ユーザーのメリット・デメリット（口コミ要約向け）
BENEFIT_PATTERNS = (
    r"[^。、\n\x00]{0,30}(?:心配(?:も)?(?:なく|ない|ありません))[^。、\n\x00]{0,20}(?:安心(?:です|して|できます|して任せられます)?)?",
    r"[^。、\n\x00]{0,20}(?:濡らす|汚す|傷つける)[^。、\n\x00]{0,30}(?:心配|安心)[^。、\n\x00]{0,20}",
    r"[^。、\n\x00]{0,22}(?:しっかり吸引|きれいに|問題なく|スムーズに|簡単に|手間が少な|衛生的に)",
    r"[^。、\n\x00]{4,48}(?:満足しており|満足です|好評|評価されています|支持されています|任せられます|助かります|便利です|楽になり|掃除が楽|買って良かった|期待以上|うれしい|コスパが良)",
)

DEMERIT_PATTERNS = (
    r"[^。、\n]{4,50}(?:不満|懸念|課題|注意が必要|トラブル|散見され|取り残|手間がかか|難しい|ストレス|失望|不具合|故障|劣化|限界|苦労|つまず)",
    r"[^。、\n]{4,45}(?:減点要因|事前の片付け|購入前に確認)",
)

_EMPH_BENEFIT = "\uf000"
_EMPH_DEMERIT = "\uf001"
_EMPH_NEUTRAL = "\uf002"


def ja_wrap(text: str) -> str:
    """Insert word joiners so 1–2 character orphans are less likely."""
    if not text:
        return text
    out: list[str] = []
    for i, ch in enumerate(text):
        if i > 0 and ch in _JA_NO_LINE_START:
            out.append("\u2060")
        out.append(ch)
        if ch in _JA_NO_LINE_END and i + 1 < len(text):
            out.append("\u2060")
    return "".join(out)


def _mark_phrase(text: str, phrase: str, mark: str) -> str:
    wrapped = f"{mark}{phrase}{mark}"
    return text.replace(phrase, wrapped) if phrase in text and wrapped not in text else text


def _mark_patterns(text: str, patterns: tuple[str, ...], mark: str) -> str:
    marks = (_EMPH_BENEFIT, _EMPH_DEMERIT, _EMPH_NEUTRAL)

    def repl(m: re.Match[str]) -> str:
        chunk = m.group(0)
        if any(mk in chunk for mk in marks):
            return chunk
        return f"{mark}{chunk}{mark}"

    for pattern in patterns:
        text = re.sub(pattern, repl, text)
    return text


def format_prose(text: str) -> str:
    """Escape HTML and emphasize user benefits/drawbacks in review prose."""
    if not text:
        return ""
    if "<" in text and ">" in text:
        return text
    work = text.strip()
    work = _mark_patterns(work, DEMERIT_PATTERNS, _EMPH_DEMERIT)
    work = _mark_patterns(work, BENEFIT_PATTERNS, _EMPH_BENEFIT)
    for phrase in sorted(SITE_UI_PHRASES, key=len, reverse=True):
        work = _mark_phrase(work, phrase, _EMPH_NEUTRAL)
    safe = html.escape(ja_wrap(work))
    safe = re.sub(
        re.escape(_EMPH_BENEFIT) + r"(.+?)" + re.escape(_EMPH_BENEFIT),
        r'<strong class="em-key benefit">\1</strong>',
        safe,
    )
    safe = re.sub(
        re.escape(_EMPH_DEMERIT) + r"(.+?)" + re.escape(_EMPH_DEMERIT),
        r'<strong class="em-key demerit">\1</strong>',
        safe,
    )
    safe = re.sub(
        re.escape(_EMPH_NEUTRAL) + r"(.+?)" + re.escape(_EMPH_NEUTRAL),
        r'<strong class="em-key">\1</strong>',
        safe,
    )
    return safe
