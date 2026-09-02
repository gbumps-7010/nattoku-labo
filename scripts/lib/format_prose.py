"""Shared prose formatting: emphasis + Japanese line-wrap."""

from __future__ import annotations

import html

import re

_JA_NO_LINE_START = set("、。，．）］｝」』】〉》をにではがのともへやや")

_JA_NO_LINE_END = set("（［｛「『【〈《")

MAX_MARKERS_PER_PARAGRAPH = 2

MAX_MARKER_CHARS = 15

# マーカー先頭にしてはいけない接続詞・助詞など

_FORBIDDEN_STARTS = (

    "ですが",

    "そして",

    "また",

    "ただし",

    "特に",

    "しかし",

    "なお",

    "および",

    "または",

    "から",

    "ので",

    "ため",

    "について",

    "に対して",

    "といった",

    "など",

)

# サイトUI（15文字以内のみ・neutral）

SITE_UI_PHRASES = tuple(

    p

    for p in (

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

        "最も高い",

        "横断比較",

        "口コミデータ",

        "比較表",

        "口コミ件数",

        "口コミ信頼度",

        "価格帯",

    )

    if len(p) <= MAX_MARKER_CHARS

)

# ベネフィットの核心（15文字以内）

CORE_BENEFITS = tuple(

    p

    for p in (

        "床のベタつき解消",

        "モップ自動洗浄",

        "もっと早く買えばよかった",

        "買って良かった",

        "心配もなく安心",

        "濡らす心配もなく",

        "手間が大幅に削減",

        "負担が劇的に減",

        "生活の質が向上",

        "しっかり吸引",

        "驚くほど静か",

        "任せられます",

        "満足しており",

    )

    if len(p) <= MAX_MARKER_CHARS

)

# 致命的デメリット・注意の結論（15文字以内）

CORE_DEMERITS = tuple(

    p

    for p in (

        "動作音が大きい",

        "コード巻き込み注意",

        "設定が難しい",

        "接続できない",

        "購入前に寸法を確認",

        "購入前に確認",

        "注意が必要",

        "事前の片付け",

        "減点要因",

        "立ち往生",

        "取り残",

    )

    if len(p) <= MAX_MARKER_CHARS

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

    "大きい",

    "注意",

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

    "解消",

    "自動",

)

_EMPH_BENEFIT = "\uf000"

_EMPH_DEMERIT = "\uf001"

_EMPH_NEUTRAL = "\uf002"

_ALL_MARKS = (_EMPH_BENEFIT, _EMPH_DEMERIT, _EMPH_NEUTRAL)

_TONE_MARK = {

    "benefit": _EMPH_BENEFIT,

    "demerit": _EMPH_DEMERIT,

    "neutral": _EMPH_NEUTRAL,

}

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

def _starts_forbidden(text: str) -> bool:

    return any(text.startswith(prefix) for prefix in _FORBIDDEN_STARTS)

def _valid_span(text: str) -> bool:

    if not text or not text.strip():

        return False

    if len(text) > MAX_MARKER_CHARS:

        return False

    if _starts_forbidden(text):

        return False

    return True

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

def _best_quote_span(inner: str, tone: str) -> str | None:

    if len(inner) <= MAX_MARKER_CHARS and _valid_span(inner):

        return inner

    core = CORE_DEMERITS if tone == "demerit" else CORE_BENEFITS

    matches = [p for p in core if p in inner and _valid_span(p)]

    if matches:

        return max(matches, key=len)

    hints = _QUOTE_DEMERIT_HINTS if tone == "demerit" else _QUOTE_BENEFIT_HINTS

    for hint in sorted(hints, key=len, reverse=True):

        if hint not in inner:

            continue

        idx = inner.index(hint)

        start = max(0, idx - (MAX_MARKER_CHARS - len(hint)) // 2)

        end = min(len(inner), start + MAX_MARKER_CHARS)

        start = max(0, end - MAX_MARKER_CHARS)

        span = inner[start:end]

        if _valid_span(span):

            return span

    return None

def _add_candidate(

    candidates: list[tuple[int, int, str, int]],

    text: str,

    start: int,

    end: int,

    tone: str,

    priority: int,

) -> None:

    span = text[start:end]

    if not _valid_span(span):

        return

    if _has_mark(span):

        return

    for s, e, _, _ in candidates:

        if not (end <= s or start >= e):

            return

    candidates.append((start, end, tone, priority))

def _collect_candidates(text: str) -> list[tuple[int, int, str, int]]:

    candidates: list[tuple[int, int, str, int]] = []

    for m in re.finditer(r"「([^」]+)」", text):

        inner = m.group(1)

        if _has_mark(inner):

            continue

        tone = _quote_tone(inner)

        if not tone:

            continue

        span = _best_quote_span(inner, tone)

        if not span:

            continue

        rel = inner.index(span)

        start = m.start(1) + rel

        _add_candidate(candidates, text, start, start + len(span), tone, 100)

    for phrase in CORE_DEMERITS:

        for m in re.finditer(re.escape(phrase), text):

            _add_candidate(candidates, text, m.start(), m.end(), "demerit", 60)

    for phrase in CORE_BENEFITS:

        for m in re.finditer(re.escape(phrase), text):

            _add_candidate(candidates, text, m.start(), m.end(), "benefit", 50)

    for phrase in SITE_UI_PHRASES:

        for m in re.finditer(re.escape(phrase), text):

            _add_candidate(candidates, text, m.start(), m.end(), "neutral", 10)

    return candidates

def _select_candidates(

    text: str, candidates: list[tuple[int, int, str, int]]

) -> list[tuple[int, int, str]]:

    if not candidates:

        return []

    ranked = sorted(candidates, key=lambda c: (-c[3], -(c[1] - c[0]), c[0]))

    selected: list[tuple[int, int, str]] = []

    for start, end, tone, _prio in ranked:

        if len(selected) >= MAX_MARKERS_PER_PARAGRAPH:

            break

        if any(not (end <= s or start >= e) for s, e, _ in selected):

            continue

        selected.append((start, end, tone))

    selected.sort(key=lambda c: c[0])

    return selected

def _apply_marks(text: str, selected: list[tuple[int, int, str]]) -> str:

    work = text

    for start, end, tone in sorted(selected, key=lambda c: c[0], reverse=True):

        mark = _TONE_MARK[tone]

        inner = work[start:end]

        work = work[:start] + f"{mark}{inner}{mark}" + work[end:]

    return work

def format_prose(text: str) -> str:

    """Escape HTML and emphasize core benefit/demerit phrases (strict limits)."""

    if not text:

        return ""

    if "<" in text and ">" in text:

        return text

    work = text.strip()

    candidates = _collect_candidates(work)

    selected = _select_candidates(work, candidates)

    work = _apply_marks(work, selected)

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
