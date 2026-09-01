/**
 * Shared prose formatting: emphasis + Japanese line-wrap (browser / Node).
 */
const SITE_UI_PHRASES = [
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
];

const PHRASE_BENEFITS = [
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
];

const PHRASE_DEMERITS = [
  "購入前に寸法を確認",
  "購入前に確認",
  "注意が必要",
  "事前の片付け",
  "減点要因",
  "立ち往生",
  "取り残",
];

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
  "止ま",
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
];

const JA_NO_LINE_START = new Set("、。，．）］｝」』】〉》をにではがのともへやや");
const JA_NO_LINE_END = new Set("（［｛「『【〈《");
const EMPH_BENEFIT = "\uf000";
const EMPH_DEMERIT = "\uf001";
const EMPH_NEUTRAL = "\uf002";
const ALL_MARKS = [EMPH_BENEFIT, EMPH_DEMERIT, EMPH_NEUTRAL];

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

function quoteTone(inner) {
  const dem = QUOTE_DEMERIT_HINTS.some((h) => inner.includes(h));
  const ben = QUOTE_BENEFIT_HINTS.some((h) => inner.includes(h));
  if (dem && !ben) return "demerit";
  if (ben && !dem) return "benefit";
  if (dem && ben) return "demerit";
  return null;
}

function markQuotes(text) {
  return text.replace(/「([^」]+)」/g, (full, inner) => {
    if (hasMark(inner)) return full;
    const tone = quoteTone(inner);
    if (tone === "demerit") return `「${EMPH_DEMERIT}${inner}${EMPH_DEMERIT}」`;
    if (tone === "benefit") return `「${EMPH_BENEFIT}${inner}${EMPH_BENEFIT}」`;
    return full;
  });
}

function markPhrases(text, phrases, mark) {
  let out = text;
  for (const phrase of [...phrases].sort((a, b) => b.length - a.length)) {
    const wrapped = `${mark}${phrase}${mark}`;
    if (out.includes(phrase) && !out.includes(wrapped)) {
      out = out.replaceAll(phrase, wrapped);
    }
  }
  return out;
}

function markPhrase(text, phrase, mark) {
  const wrapped = `${mark}${phrase}${mark}`;
  return text.includes(phrase) && !text.includes(wrapped) ? text.replaceAll(phrase, wrapped) : text;
}

function replaceMarks(safe, mark, className) {
  const esc = mark.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const cls = className ? `em-key ${className}` : "em-key";
  return safe.replace(new RegExp(`${esc}(.+?)${esc}`, "g"), `<strong class="${cls}">$1</strong>`);
}

function formatProse(text) {
  if (!text) return "";
  if (String(text).includes("<") && String(text).includes(">")) return String(text);
  let work = String(text).trim();
  work = markQuotes(work);
  work = markPhrases(work, PHRASE_DEMERITS, EMPH_DEMERIT);
  work = markPhrases(work, PHRASE_BENEFITS, EMPH_BENEFIT);
  for (const phrase of [...SITE_UI_PHRASES].sort((a, b) => b.length - a.length)) {
    work = markPhrase(work, phrase, EMPH_NEUTRAL);
  }

  let safe = escapeHtml(jaWrap(work));
  safe = replaceMarks(safe, EMPH_BENEFIT, "benefit");
  safe = replaceMarks(safe, EMPH_DEMERIT, "demerit");
  safe = replaceMarks(safe, EMPH_NEUTRAL, "");
  return safe;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { formatProse, escapeHtml, SITE_UI_PHRASES };
}
