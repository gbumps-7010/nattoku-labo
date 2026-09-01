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

# メリットを示す語（長い順でマッチ）
BENEFIT_ANCHORS = (
    "買って良かった",
    "もっと早く買えばよかった",
    "期待以上",
    "満足しており",
    "満足度は非常に高い",
    "満足度は高い",
    "高く評価",
    "高い満足",
    "評価されています",
    "支持されています",
    "任せられます",
    "任せることができます",
    "安心して使用",
    "安心して使",
    "安心して任せ",
    "心配もなく安心",
    "心配もなく",
    "心配が少なく",
    "心配がない",
    "心配ありません",
    "手間が大幅に削減",
    "手間が削減",
    "手間は汚水",
    "手間が少な",
    "負担が劇的に減",
    "負担の軽減",
    "負担が軽減",
    "家事の負担",
    "生活の質が向上",
    "サラサラ",
    "ピカピカ",
    "しっかり吸引",
    "しっかり掃除",
    "しっかりと掃除",
    "問題なく",
    "問題なく乗り越え",
    "スムーズに",
    "簡単に",
    "全自動",
    "自動化",
    "衛生的に",
    "清掃効果",
    "掃除が楽",
    "掃除を任せ",
    "掃除を完結",
    "掃除を完全に自動化",
    "助かります",
    "助かる",
    "便利です",
    "便利に",
    "快適に",
    "快適になり",
    "魅力です",
    "理想的な",
    "実感",
    "コスパが良",
    "うれしい",
    "好評です",
    "好評",
    "絶賛",
    "高評価",
    "満足です",
    "満足",
    "安心です",
    "安心",
    "便利",
    "十分です",
    "十分",
    "静か",
    "きれいに",
    "綺麗に",
    "効率的",
)

# デメリット・注意を示す語
DEMERIT_ANCHORS = (
    "購入前に確認",
    "購入前に寸法を確認",
    "注意が必要",
    "事前の片付け",
    "減点要因",
    "立ち往生",
    "見つけにくい",
    "分かりにくい",
    "戸惑う",
    "在庫がない",
    "巻き込んでしまう",
    "誤認識",
    "取り残",
    "散見され",
    "散見",
    "手間がかか",
    "手間取",
    "不具合",
    "トラブル",
    "ストレス",
    "ネガティブ",
    "可能性があります",
    "可能性があ",
    "報告があり",
    "報告も",
    "指摘も",
    "懸念",
    "課題",
    "不便",
    "困る",
    "苦労",
    "難しい",
    "失望",
    "限定的",
    "限界",
    "劣化",
    "故障",
    "停止",
    "エラー",
    "不満",
    "問題",
    "注意",
)

BENEFIT_PATTERNS = (
    r"[^。、\n\uf000\uf001\uf002]{0,35}(?:心配(?:も)?(?:なく|ない|ありません))[^。、\n\uf000\uf001\uf002]{0,25}",
    r"[^。、\n\uf000\uf001\uf002]{0,25}(?:濡らす|汚す|傷つける)[^。、\n\uf000\uf001\uf002]{0,35}",
)

DEMERIT_PATTERNS = (
    r"[^。、\n\uf000\uf001\uf002]{4,55}(?:減点要因|事前の片付け|購入前に(?:確認|寸法))",
)

_EMPH_BENEFIT = "\uf000"
_EMPH_DEMERIT = "\uf001"
_EMPH_NEUTRAL = "\uf002"
_ALL_MARKS = (_EMPH_BENEFIT, _EMPH_DEMERIT, _EMPH_NEUTRAL)
_MIN_CLAUSE = 5
_MAX_CLAUSE = 88


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


def _clause_bounds(text: str, pos: int) -> tuple[int, int]:
    prev = max(text.rfind("。", 0, pos), text.rfind("、", 0, pos))
    start = 0 if prev == -1 else prev + 1
    end_dot = text.find("。", pos)
    end = end_dot + 1 if end_dot != -1 else len(text)
    return start, end


def _has_mark(text: str) -> bool:
    return any(mk in text for mk in _ALL_MARKS)


def _collect_clause_spans(text: str, anchors: tuple[str, ...], mark: str) -> list[tuple[int, int, str]]:
    spans: list[tuple[int, int, str]] = []
    for anchor in anchors:
        pos = 0
        while True:
            pos = text.find(anchor, pos)
            if pos == -1:
                break
            start, end = _clause_bounds(text, pos)
            chunk = text[start:end]
            if _MIN_CLAUSE <= len(chunk.strip()) <= _MAX_CLAUSE:
                spans.append((start, end, mark))
            pos += max(len(anchor), 1)
    return spans


def _collect_pattern_spans(text: str, patterns: tuple[str, ...], mark: str) -> list[tuple[int, int, str]]:
    spans: list[tuple[int, int, str]] = []
    for pattern in patterns:
        for m in re.finditer(pattern, text):
            spans.append((m.start(), m.end(), mark))
    return spans


def _merge_spans(spans: list[tuple[int, int, str]]) -> list[tuple[int, int, str]]:
    if not spans:
        return []
    priority = {_EMPH_DEMERIT: 0, _EMPH_BENEFIT: 1, _EMPH_NEUTRAL: 2}
    ordered = sorted(spans, key=lambda s: (s[0], -(s[1] - s[0]), priority[s[2]]))
    merged: list[tuple[int, int, str]] = []
    for start, end, mark in ordered:
        if merged and start < merged[-1][1]:
            if priority[mark] < priority[merged[-1][2]]:
                merged[-1] = (start, max(merged[-1][1], end), mark)
            continue
        merged.append((start, end, mark))
    return merged


def _apply_spans(text: str, spans: list[tuple[int, int, str]]) -> str:
    for start, end, mark in sorted(spans, key=lambda s: s[0], reverse=True):
        chunk = text[start:end]
        if _has_mark(chunk):
            continue
        text = text[:start] + f"{mark}{chunk}{mark}" + text[end:]
    return text


def _mark_phrase(text: str, phrase: str, mark: str) -> str:
    wrapped = f"{mark}{phrase}{mark}"
    return text.replace(phrase, wrapped) if phrase in text and wrapped not in text else text


def _mark_quoted_sentiment(text: str) -> str:
    def repl(m: re.Match[str]) -> str:
        inner = m.group(1)
        if _has_mark(inner):
            return m.group(0)
        dem = any(a in inner for a in DEMERIT_ANCHORS[:20])
        ben = any(a in inner for a in BENEFIT_ANCHORS[:25])
        if dem and not ben:
            return f"「{_EMPH_DEMERIT}{inner}{_EMPH_DEMERIT}」"
        if ben:
            return f"「{_EMPH_BENEFIT}{inner}{_EMPH_BENEFIT}」"
        return m.group(0)

    return re.sub(r"「([^」]+)」", repl, text)


def format_prose(text: str) -> str:
    if not text:
        return ""
    if "<" in text and ">" in text:
        return text
    work = text.strip()
    work = _mark_quoted_sentiment(work)

    spans: list[tuple[int, int, str]] = []
    spans.extend(_collect_clause_spans(work, DEMERIT_ANCHORS, _EMPH_DEMERIT))
    spans.extend(_collect_pattern_spans(work, DEMERIT_PATTERNS, _EMPH_DEMERIT))
    spans.extend(_collect_clause_spans(work, BENEFIT_ANCHORS, _EMPH_BENEFIT))
    spans.extend(_collect_pattern_spans(work, BENEFIT_PATTERNS, _EMPH_BENEFIT))
    work = _apply_spans(work, _merge_spans(spans))

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
