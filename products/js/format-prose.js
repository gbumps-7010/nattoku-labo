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

const BENEFIT_ANCHORS = [
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
];

const DEMERIT_ANCHORS = [
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
];

const BENEFIT_PATTERNS = [
  /[^。、\n\uf000\uf001\uf002]{0,35}(?:心配(?:も)?(?:なく|ない|ありません))[^。、\n\uf000\uf001\uf002]{0,25}/g,
  /[^。、\n\uf000\uf001\uf002]{0,25}(?:濡らす|汚す|傷つける)[^。、\n\uf000\uf001\uf002]{0,35}/g,
];

const DEMERIT_PATTERNS = [
  /[^。、\n\uf000\uf001\uf002]{4,55}(?:減点要因|事前の片付け|購入前に(?:確認|寸法))/g,
];

const JA_NO_LINE_START = new Set("、。，．）］｝」』】〉》をにではがのともへやや");
const JA_NO_LINE_END = new Set("（［｛「『【〈《");
const EMPH_BENEFIT = "\uf000";
const EMPH_DEMERIT = "\uf001";
const EMPH_NEUTRAL = "\uf002";
const ALL_MARKS = [EMPH_BENEFIT, EMPH_DEMERIT, EMPH_NEUTRAL];
const MIN_CLAUSE = 5;
const MAX_CLAUSE = 88;

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

function clauseBounds(text, pos) {
  const prev = Math.max(text.lastIndexOf("。", pos), text.lastIndexOf("、", pos));
  const start = prev === -1 ? 0 : prev + 1;
  const endDot = text.indexOf("。", pos);
  const end = endDot === -1 ? text.length : endDot + 1;
  return [start, end];
}

function hasMark(text) {
  return ALL_MARKS.some((mk) => text.includes(mk));
}

function collectClauseSpans(text, anchors, mark) {
  const spans = [];
  for (const anchor of anchors) {
    let pos = 0;
    while (pos !== -1) {
      pos = text.indexOf(anchor, pos);
      if (pos === -1) break;
      const [start, end] = clauseBounds(text, pos);
      const chunk = text.slice(start, end);
      if (chunk.trim().length >= MIN_CLAUSE && chunk.length <= MAX_CLAUSE) {
        spans.push([start, end, mark]);
      }
      pos += Math.max(anchor.length, 1);
    }
  }
  return spans;
}

function collectPatternSpans(text, patterns, mark) {
  const spans = [];
  for (const pattern of patterns) {
    const re = new RegExp(pattern.source, pattern.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      spans.push([m.index, m.index + m[0].length, mark]);
    }
  }
  return spans;
}

function mergeSpans(spans) {
  if (!spans.length) return [];
  const priority = { [EMPH_DEMERIT]: 0, [EMPH_BENEFIT]: 1, [EMPH_NEUTRAL]: 2 };
  const ordered = [...spans].sort((a, b) => a[0] - b[0] || b[1] - b[0] - (a[1] - a[0]) || priority[a[2]] - priority[b[2]]);
  const merged = [];
  for (const span of ordered) {
    const [start, end, mark] = span;
    if (merged.length && start < merged[merged.length - 1][1]) {
      if (priority[mark] < priority[merged[merged.length - 1][2]]) {
        merged[merged.length - 1] = [start, Math.max(merged[merged.length - 1][1], end), mark];
      }
      continue;
    }
    merged.push(span);
  }
  return merged;
}

function applySpans(text, spans) {
  const sorted = [...spans].sort((a, b) => b[0] - a[0]);
  for (const [start, end, mark] of sorted) {
    const chunk = text.slice(start, end);
    if (hasMark(chunk)) continue;
    text = text.slice(0, start) + mark + chunk + mark + text.slice(end);
  }
  return text;
}

function markPhrase(text, phrase, mark) {
  const wrapped = `${mark}${phrase}${mark}`;
  return text.includes(phrase) && !text.includes(wrapped) ? text.replaceAll(phrase, wrapped) : text;
}

function markQuotedSentiment(text) {
  return text.replace(/「([^」]+)」/g, (full, inner) => {
    if (hasMark(inner)) return full;
    const dem = DEMERIT_ANCHORS.slice(0, 20).some((a) => inner.includes(a));
    const ben = BENEFIT_ANCHORS.slice(0, 25).some((a) => inner.includes(a));
    if (dem && !ben) return `「${EMPH_DEMERIT}${inner}${EMPH_DEMERIT}」`;
    if (ben) return `「${EMPH_BENEFIT}${inner}${EMPH_BENEFIT}」`;
    return full;
  });
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
  work = markQuotedSentiment(work);

  let spans = [];
  spans = spans.concat(collectClauseSpans(work, DEMERIT_ANCHORS, EMPH_DEMERIT));
  spans = spans.concat(collectPatternSpans(work, DEMERIT_PATTERNS, EMPH_DEMERIT));
  spans = spans.concat(collectClauseSpans(work, BENEFIT_ANCHORS, EMPH_BENEFIT));
  spans = spans.concat(collectPatternSpans(work, BENEFIT_PATTERNS, EMPH_BENEFIT));
  work = applySpans(work, mergeSpans(spans));

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
