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

const BENEFIT_PATTERNS = [
  /[^。、\n\x00]{0,30}(?:心配(?:も)?(?:なく|ない|ありません))[^。、\n\x00]{0,20}(?:安心(?:です|して|できます|して任せられます)?)?/g,
  /[^。、\n\x00]{0,20}(?:濡らす|汚す|傷つける)[^。、\n\x00]{0,30}(?:心配|安心)[^。、\n\x00]{0,20}/g,
  /[^。、\n\x00]{0,22}(?:しっかり吸引|きれいに|問題なく|スムーズに|簡単に|手間が少な|衛生的に)/g,
  /[^。、\n\x00]{4,48}(?:満足しており|満足です|好評|評価されています|支持されています|任せられます|助かります|便利です|楽になり|掃除が楽|買って良かった|期待以上|うれしい|コスパが良)/g,
];

const DEMERIT_PATTERNS = [
  /[^。、\n]{4,50}(?:不満|懸念|課題|注意が必要|トラブル|散見され|取り残|手間がかか|難しい|ストレス|失望|不具合|故障|劣化|限界|苦労|つまず)/g,
  /[^。、\n]{4,45}(?:減点要因|事前の片付け|購入前に確認)/g,
];

const JA_NO_LINE_START = new Set("、。，．）］｝」』】〉》をにではがのともへやや");
const JA_NO_LINE_END = new Set("（［｛「『【〈《");
const EMPH_BENEFIT = "\uf000";
const EMPH_DEMERIT = "\uf001";
const EMPH_NEUTRAL = "\uf002";

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

function markPhrase(text, phrase, mark) {
  const wrapped = `${mark}${phrase}${mark}`;
  return text.includes(phrase) && !text.includes(wrapped)
    ? text.replaceAll(phrase, wrapped)
    : text;
}

function markPatterns(text, patterns, mark) {
  const marks = [EMPH_BENEFIT, EMPH_DEMERIT, EMPH_NEUTRAL];
  let out = text;
  for (const pattern of patterns) {
    out = out.replace(pattern, (match) => {
      if (marks.some((mk) => match.includes(mk))) return match;
      return `${mark}${match}${mark}`;
    });
  }
  return out;
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
  work = markPatterns(work, DEMERIT_PATTERNS, EMPH_DEMERIT);
  work = markPatterns(work, BENEFIT_PATTERNS, EMPH_BENEFIT);
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
