/**
 * Shared prose formatting: emphasis + Japanese line-wrap (browser / Node).
 */
const EMPHASIS_PHRASES = [
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
];

const JA_NO_LINE_START = new Set("、。，．）］｝」』】〉》をにではがのともへやや");
const JA_NO_LINE_END = new Set("（［｛「『【〈《");
const EMPH_MARK = "\x00E";

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

function markPhrase(text, phrase) {
  const wrapped = `${EMPH_MARK}${phrase}${EMPH_MARK}`;
  return text.includes(phrase) && !text.includes(wrapped)
    ? text.replaceAll(phrase, wrapped)
    : text;
}

function formatProse(text) {
  if (!text) return "";
  let work = String(text).trim();
  for (const phrase of [...EMPHASIS_PHRASES].sort((a, b) => b.length - a.length)) {
    work = markPhrase(work, phrase);
  }
  work = work.replace(/「([^」]+)」/g, (_, inner) => `「${EMPH_MARK}${inner}${EMPH_MARK}」`);
  work = work.replace(
    /(?<!特に)特に([^。、]{2,28})(?=について|が|を|に|で)/g,
    (_, inner) => `特に${EMPH_MARK}${inner}${EMPH_MARK}`,
  );
  const safe = escapeHtml(jaWrap(work));
  const markPat = new RegExp(
    EMPH_MARK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
      "(.+?)" +
      EMPH_MARK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "g",
  );
  return safe.replace(markPat, '<strong class="em-key">$1</strong>');
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { formatProse, escapeHtml, EMPHASIS_PHRASES };
}
