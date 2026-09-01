"""Shared prose formatting: emphasis + Japanese line-wrap."""
from __future__ import annotations

import html
import re

# 行頭に来ると不自然な文字（助詞・句読点など）を直前に食い付かせる
_JA_NO_LINE_START = set("、。，．）］｝」』】〉》をにではがのともへやや")
# 行末に来ると不自然な開き記号
_JA_NO_LINE_END = set("（［｛「『【〈《")

EMPHASIS_PHRASES = (
    "一貫した高評価",
    "減点要因",
    "注意が必要",
    "推奨されます",
    "事前の片付け",
    "限界",
    "高く評価",
    "好評",
    "不満",
    "苦労",
    "つまず",
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
    "吸引力",
    "水拭き",
    "静音性",
    "口コミ件数",
    "口コミ信頼度",
    "フローリング",
    "カーペット",
    "メンテナンス",
    "コスパ",
    "価格帯",
    "おすすめ",
)

_EMPH_MARK = "\x00E"


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


def _mark_phrase(text: str, phrase: str) -> str:
    wrapped = f"{_EMPH_MARK}{phrase}{_EMPH_MARK}"
    return text.replace(phrase, wrapped) if phrase in text and wrapped not in text else text


def format_prose(text: str) -> str:
    """Escape HTML and emphasize quoted review lines / key phrases."""
    if not text:
        return ""
    work = text.strip()
    for phrase in sorted(EMPHASIS_PHRASES, key=len, reverse=True):
        work = _mark_phrase(work, phrase)
    work = re.sub(
        r"「([^」]+)」",
        lambda m: f"「{_EMPH_MARK}{m.group(1)}{_EMPH_MARK}」",
        work,
    )
    work = re.sub(
        r"(?<!特に)特に([^。、]{2,28})(?=について|が|を|に|で)",
        lambda m: f"特に{_EMPH_MARK}{m.group(1)}{_EMPH_MARK}",
        work,
    )
    safe = html.escape(ja_wrap(work))
    mark_pat = re.escape(_EMPH_MARK) + r"(.+?)" + re.escape(_EMPH_MARK)
    return re.sub(mark_pat, r'<strong class="em-key">\1</strong>', safe)
