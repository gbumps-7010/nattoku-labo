/**

 * Shared prose formatting: emphasis + Japanese line-wrap (browser / Node).

 * Strict marker rules: max 2 per paragraph, max 15 chars each, core phrases only.

 */

const MAX_MARKERS_PER_PARAGRAPH = 2;

const MAX_MARKER_CHARS = 15;

const FORBIDDEN_STARTS = [

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

];

const SITE_UI_PHRASES = [

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

].filter((p) => p.length <= MAX_MARKER_CHARS);

const CORE_BENEFITS = [

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
  "思うほど静か",
  "と思うほど静か",
  "任せられます",

  "満足しており",

].filter((p) => p.length <= MAX_MARKER_CHARS);

const CORE_DEMERITS = [

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

].filter((p) => p.length <= MAX_MARKER_CHARS);

const QUOTE_DEMERIT_HINTS = [

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


  "エラー",

  "苦労",

  "戸惑",

  "分かりにく",

  "見つけにく",

  "接続でき",



];

const QUOTE_BENEFIT_HINTS = [

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

];

const JA_NO_LINE_START = new Set("、。，．）］｝」』】〉》をにではがのともへやや");

const JA_NO_LINE_END = new Set("（［｛「『【〈《");

const EMPH_BENEFIT = "\uf000";

const EMPH_DEMERIT = "\uf001";

const EMPH_NEUTRAL = "\uf002";

const ALL_MARKS = [EMPH_BENEFIT, EMPH_DEMERIT, EMPH_NEUTRAL];

const TONE_MARK = {

  benefit: EMPH_BENEFIT,

  demerit: EMPH_DEMERIT,

  neutral: EMPH_NEUTRAL,

};

function escapeHtml(s) {

  return String(s)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;");

}

function jaWrap(text) {

  if (!text) return text;

  let out = "";

  for (let i = 0; i < text.length; i++) {

    const ch = text[i];

    if (i > 0 && JA_NO_LINE_START.has(ch)) out += "\u2060";

    out += ch;

    if (JA_NO_LINE_END.has(ch) && i + 1 < text.length) out += "\u2060";

  }

  return out;

}

function hasMark(text) {

  return ALL_MARKS.some((mk) => text.includes(mk));

}

function startsForbidden(text) {

  return FORBIDDEN_STARTS.some((prefix) => text.startsWith(prefix));

}

function validSpan(text) {

  if (!text || !text.trim()) return false;

  if (text.length > MAX_MARKER_CHARS) return false;

  if (startsForbidden(text)) return false;

  return true;

}

function quoteTone(inner) {

  const dem = QUOTE_DEMERIT_HINTS.some((h) => inner.includes(h));

  const ben = QUOTE_BENEFIT_HINTS.some((h) => inner.includes(h));

  if (dem && !ben) return "demerit";

  if (ben && !dem) return "benefit";

  if (dem && ben) return "demerit";

  return null;

}

function bestQuoteSpan(inner, tone) {

  if (inner.length <= MAX_MARKER_CHARS && validSpan(inner)) return inner;

  const core = tone === "demerit" ? CORE_DEMERITS : CORE_BENEFITS;

  const matches = core.filter((p) => inner.includes(p) && validSpan(p));

  if (matches.length) return matches.sort((a, b) => b.length - a.length)[0];

  const hints = tone === "demerit" ? QUOTE_DEMERIT_HINTS : QUOTE_BENEFIT_HINTS;

  for (const hint of [...hints].sort((a, b) => b.length - a.length)) {

    if (!inner.includes(hint)) continue;

    const idx = inner.indexOf(hint);

    let start = Math.max(0, idx - Math.floor((MAX_MARKER_CHARS - hint.length) / 2));

    let end = Math.min(inner.length, start + MAX_MARKER_CHARS);

    start = Math.max(0, end - MAX_MARKER_CHARS);

    const span = inner.slice(start, end);

    if (validSpan(span)) return span;

  }

  return null;

}

function addCandidate(candidates, text, start, end, tone, priority) {

  const span = text.slice(start, end);

  if (!validSpan(span) || hasMark(span)) return;

  if (candidates.some((c) => !(end <= c.start || start >= c.end))) return;

  candidates.push({ start, end, tone, priority });

}

function collectCandidates(text) {

  const candidates = [];

  const quoteRe = /「([^」]+)」/g;

  let m;

  while ((m = quoteRe.exec(text)) !== null) {

    const inner = m[1];

    if (hasMark(inner)) continue;

    const tone = quoteTone(inner);

    if (!tone) continue;

    const span = bestQuoteSpan(inner, tone);

    if (!span) continue;

    const rel = inner.indexOf(span);

    addCandidate(candidates, text, m.index + 1 + rel, m.index + 1 + rel + span.length, tone, 100);

  }

  for (const phrase of CORE_DEMERITS) {

    let idx = text.indexOf(phrase);

    while (idx !== -1) {

      addCandidate(candidates, text, idx, idx + phrase.length, "demerit", 60);

      idx = text.indexOf(phrase, idx + 1);

    }

  }

  for (const phrase of CORE_BENEFITS) {

    let idx = text.indexOf(phrase);

    while (idx !== -1) {

      addCandidate(candidates, text, idx, idx + phrase.length, "benefit", 50);

      idx = text.indexOf(phrase, idx + 1);

    }

  }

  for (const phrase of SITE_UI_PHRASES) {

    let idx = text.indexOf(phrase);

    while (idx !== -1) {

      addCandidate(candidates, text, idx, idx + phrase.length, "neutral", 10);

      idx = text.indexOf(phrase, idx + 1);

    }

  }

  return candidates;

}

function selectCandidates(text, candidates) {

  if (!candidates.length) return [];

  const ranked = [...candidates].sort(

    (a, b) => b.priority - a.priority || b.end - b.start - (a.end - a.start) || a.start - b.start

  );

  const selected = [];

  for (const c of ranked) {

    if (selected.length >= MAX_MARKERS_PER_PARAGRAPH) break;

    if (selected.some((s) => !(c.end <= s.start || c.start >= s.end))) continue;

    selected.push(c);

  }

  return selected.sort((a, b) => a.start - b.start);

}

function applyMarks(text, selected) {

  let work = text;

  for (const { start, end, tone } of [...selected].sort((a, b) => b.start - a.start)) {

    const mark = TONE_MARK[tone];

    const inner = work.slice(start, end);

    work = work.slice(0, start) + `${mark}${inner}${mark}` + work.slice(end);

  }

  return work;

}

function replaceMarks(safe, mark, className) {

  const esc = mark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const cls = className ? `em-key ${className}` : "em-key";

  return safe.replace(new RegExp(`${esc}(.+?)${esc}`, "g"), `<strong class="${cls}">$1</strong>`);

}

function formatProse(text) {

  if (!text) return "";

  if (String(text).includes("<") && String(text).includes(">")) return String(text);

  const raw = String(text).trim();

  const selected = selectCandidates(raw, collectCandidates(raw));

  let work = applyMarks(raw, selected);

  let safe = escapeHtml(jaWrap(work));

  safe = replaceMarks(safe, EMPH_BENEFIT, "benefit");

  safe = replaceMarks(safe, EMPH_DEMERIT, "demerit");

  safe = replaceMarks(safe, EMPH_NEUTRAL, "");

  return safe;

}

if (typeof module !== "undefined" && module.exports) {

  module.exports = { formatProse, escapeHtml, SITE_UI_PHRASES };

}
