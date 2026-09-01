"""Shared prose formatting: emphasis + Japanese line-wrap."""
from __future__ import annotations

import html
import re

_JA_NO_LINE_START = set("、。，．）］｝」』】〉》をにではがのともへやや")
_JA_NO_LINE_END = set("（［｛「『【〈《")

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

# 「」以外で強調する、はっきりしたメリット表現（語句単位・最大限控えめ）
PHRASE_BENEFITS = (
    "もっと早く買えばよかった",
    "買って良かった",
    "心配もなく安心",
    "濡らす心配もなく",
    "心配もなく",
    "満足しており",
    "手間が大幅に削減",
    "負担が劇的に減",
    "生活の質が向上",
    "しっかり吸引",
    "任せられます",
)

# 「」以外で強調する、はっきりしたデメリット表現
PHRASE_DEMERITS = (
    "購入前に寸法を確認",
    "購入前に確認",
    "注意が必要",
    "事前の片付け",
    "減点要因",
    "立ち往生",
    "取り残",
)

_QUOTE_DEMERIT_HINTS = (
    "難しい",
    "できない",
    "しない",
    "失敗",
    "不満",
    "不便",
    "困",
    "うるさ",
    "弱",
    "残",
    "故障",
    "止ま",
    "エラー",
    "苦労",
    "戸惑",
    "分かりにく",
    "見つけにく",
    "接続でき",
)

_QUOTE_BENEFIT_HINTS = (
    "良かった",
    "買えばよかった",
    "満足",
    "便利",
    "安心",
    "静か",
    "きれい",
    "サラサラ",
    "ピカピカ",
    "助か",
    "楽",
    "最高",
    "快適",
    "任せ",
    "十分",
    "好評",
    "絶賛",
)

_EMPH_BENEFIT = "\uf000"
_EMPH_DEMERIT = "\uf001"
_EMPH_NEUTRAL = "\uf002"
_ALL_MARKS = (_EMPH_BENEFIT, _EMPH_DEMERIT, _EMPH_NEUTRAL)


def ja_wrap(text: str) -> str:
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


def _has_mark(text: str) -> bool:
    return any(mk in text for mk in _ALL_MARKS)


def _quote_tone(inner: str) -> str | None:
    dem = any(h in inner for h in _QUOTE_DEMERIT_HINTS)
    ben = any(h in inner for h in _QUOTE_BENEFIT_HINTS)
    if dem and not ben:
        return "demerit"
    if ben and not dem:
        return "benefit"
    if dem and ben:
        return "demerit"
    return None


def _mark_quotes(text: str) -> str:
    def repl(m: re.Match[str]) -> str:
        inner = m.group(1)
        if _has_mark(inner):
            return m.group(0)
        tone = _quote_tone(inner)
        if tone == "demerit":
            return f"「{_EMPH_DEMERIT}{inner}{_EMPH_DEMERIT}」"
        if tone == "benefit":
            return f"「{_EMPH_BENEFIT}{inner}{_EMPH_BENEFIT}」"
        return m.group(0)

    return re.sub(r"「([^」]+)」", repl, text)


def _mark_phrases(text: str, phrases: tuple[str, ...], mark: str) -> str:
    for phrase in sorted(phrases, key=len, reverse=True):
        if phrase not in text:
            continue
        wrapped = f"{mark}{phrase}{mark}"
        if wrapped in text:
            continue
        text = text.replace(phrase, wrapped)
    return text


def _mark_phrase(text: str, phrase: str, mark: str) -> str:
    wrapped = f"{mark}{phrase}{mark}"
    return text.replace(phrase, wrapped) if phrase in text and wrapped not in text else text


def format_prose(text: str) -> str:
    """Escape HTML and emphasize user-voice quotes + a few key phrases."""
    if not text:
        return ""
    if "<" in text and ">" in text:
        return text
    work = text.strip()
    work = _mark_quotes(work)
    work = _mark_phrases(work, PHRASE_DEMERITS, _EMPH_DEMERIT)
    work = _mark_phrases(work, PHRASE_BENEFITS, _EMPH_BENEFIT)
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
