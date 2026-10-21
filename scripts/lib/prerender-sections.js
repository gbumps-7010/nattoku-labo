"use strict";

/**
 * Static HTML builders for product-page sections that used to be JS-only.
 * Mirrors products/js/product-loader.js output so crawlers see the content.
 */

const { formatProse, escapeHtml } = require("./format-prose");

function fp(text) {
  if (!text) return "";
  try {
    return formatProse(String(text));
  } catch {
    return escapeHtml(String(text));
  }
}

function scoreLevel(score) {
  const n = Number(score);
  if (n >= 90) return { key: "excellent", label: "優秀" };
  if (n >= 80) return { key: "good", label: "良好" };
  if (n >= 70) return { key: "fair", label: "普通" };
  return { key: "poor", label: "要注意" };
}

function scoreBarWidth(score) {
  const n = Number(score);
  return Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
}

function overallColor(score) {
  const n = Number(score);
  if (n >= 90) return "#10b981";
  if (n >= 80) return "#2563eb";
  if (n >= 70) return "#f59e0b";
  return "#ef4444";
}

// ranking: 機能別ランキングへの導線。点数が80点（良好）以上かどうかで文言だけ変える
const PERF_MAPPING = [
  {
    keys: ["floorCleaning"],
    label: "フローリング清掃",
    ranking: {
      href: "/rankings/floor-cleaning",
      high: "フローリング掃除ランキングでほかの機種と比べる",
      low: "床掃除が得意な機種をフローリング掃除ランキングで探す",
    },
  },
  {
    keys: ["carpetCleaning"],
    label: "カーペット清掃",
    ranking: {
      href: "/rankings/carpet-cleaning",
      high: "カーペット掃除ランキングでほかの機種と比べる",
      low: "カーペットに強い機種をカーペット掃除ランキングで探す",
    },
  },
  { keys: ["petHair", "petHairRemoval"], label: "ペット毛対応" },
  {
    keys: ["nightQuietness", "quietness"],
    label: "静音性（夜間）",
    ranking: {
      href: "/rankings/quietness",
      high: "静音性ランキングでほかの静かな機種と比べる",
      low: "もっと静かな機種を静音性ランキングで探す",
    },
  },
  { keys: ["stepClimbing"], label: "段差乗り越え" },
  { keys: ["maintenance"], label: "メンテナンス性" },
  { keys: ["appStability"], label: "アプリ安定性" },
  { keys: ["batteryLife"], label: "バッテリー持続" },
];

function buildPerformanceDetailsHtml(perfData) {
  if (!perfData || typeof perfData !== "object") return "";
  return PERF_MAPPING.map((item) => {
    let data = null;
    for (const key of item.keys) {
      if (perfData[key]) {
        data = perfData[key];
        break;
      }
    }
    if (!data) return "";
    const score = data.score;
    const lv = scoreLevel(score);
    const reviewCount = data.reviewCount != null ? data.reviewCount : 0;
    const rankingLink = item.ranking
      ? `
                        <p class="perf-ranking-link" style="margin:.6rem 0 0;font-size:.85rem;"><a href="${item.ranking.href}" style="color:var(--primary-color);font-weight:700;">${escapeHtml(
          Number(score) >= 80 ? item.ranking.high : item.ranking.low,
        )} →</a></p>`
      : "";
    return `
                <div class="performance-detail-card score-lv-${lv.key}">
                    <div class="performance-detail-head">
                        <h4>${escapeHtml(item.label)}</h4>
                        <span class="score-level">${lv.label}</span>
                    </div>
                    <div class="performance-detail-main">
                        <div class="performance-detail-score"><b>${escapeHtml(score)}</b><small>/ 100点</small></div>
                        <div class="score-bar"><i style="width:${scoreBarWidth(score)}%"></i></div>
                        <p class="rank-badge">${escapeHtml(reviewCount)}件の口コミから算出</p>
                        <p class="performance-detail-comment">${fp(data.comment || "詳細評価情報なし")}</p>${rankingLink}
                    </div>
                </div>`;
  }).join("");
}

function buildKeywordListHtml(items, tone) {
  const list = Array.isArray(items) ? items : [];
  if (!list.length) {
    return `<p class="keyword-fallback-empty">該当キーワードはありません。</p>`;
  }
  const color = tone === "negative" ? "#b91c1c" : "#047857";
  const rows = list
    .slice(0, 12)
    .map((item) => {
      const kw = item.keyword || item.word || item.text || "";
      const count = item.count != null ? item.count : "";
      return `<li><span class="kw">${escapeHtml(kw)}</span>${
        count !== "" ? `<span class="kw-count">${escapeHtml(count)}件</span>` : ""
      }</li>`;
    })
    .join("");
  return `<ul class="keyword-fallback" style="list-style:none;margin:0.75rem 0 0;padding:0;display:flex;flex-direction:column;gap:0.35rem;color:${color};font-size:0.92rem;font-weight:700;">${rows}</ul>`;
}

function buildComplaintsHtml(data) {
  const complaints = data.topComplaints;
  if (!Array.isArray(complaints) || !complaints.length) {
    // Fall back to successStrategies shape when topComplaints is absent
    const strategies = data.successStrategies;
    if (!Array.isArray(strategies) || !strategies.length) return "";
    return strategies
      .map((item, index) => {
        const rank = item.rank || index + 1;
        const title = item.complaint || item.issue || item.title || "データなし";
        const pct = item.percentage != null ? item.percentage : item.occurrenceRate || 0;
        const desc = item.technicalDescription || item.description || "";
        let solutionsHTML = "";
        if (Array.isArray(item.avoidanceStrategies)) {
          solutionsHTML = item.avoidanceStrategies
            .map((s) => `<li>${escapeHtml(s.method || "")}</li>`)
            .join("");
        } else if (item.solution) {
          solutionsHTML = String(item.solution)
            .split(/[。\n]/)
            .filter((s) => s.trim())
            .map((s) => `<li>${escapeHtml(s.trim())}。</li>`)
            .join("");
        }
        return `
            <div class="problem-card">
                <span class="problem-rank">お悩み ${rank}</span>
                <h3 class="problem-title">${escapeHtml(title)}</h3>
                <p class="problem-percentage">${escapeHtml(pct)}% の方が経験</p>
                ${desc ? `<p class="problem-description prose-warn">${fp(desc)}</p>` : ""}
                ${
                  solutionsHTML
                    ? `<div class="solutions"><h4 style="font-weight:700;margin-bottom:0.75rem;">対策</h4><ul style="margin:0;padding-left:1.5rem;line-height:1.8;">${solutionsHTML}</ul></div>`
                    : ""
                }
            </div>`;
      })
      .join("");
  }

  return complaints
    .map((item) => {
      let importanceBadge = "";
      let cardClass = "problem-card";
      const pct = item.percentage != null ? item.percentage : 0;
      if (pct >= 10) {
        importanceBadge = '<span class="complaint-tag">重要度：高</span>';
        cardClass = "problem-card critical-issue";
      } else if (pct >= 5) {
        importanceBadge = '<span class="complaint-tag">重要度：中</span>';
        cardClass = "problem-card high-issue";
      } else if (pct >= 3) {
        importanceBadge = '<span class="complaint-tag">注意</span>';
        cardClass = "problem-card medium-issue";
      }

      let solutionHTML = "";
      if (Array.isArray(item.solutions)) {
        solutionHTML = item.solutions
          .filter((s) => String(s).trim())
          .map((s) => `<li>${escapeHtml(s)}</li>`)
          .join("");
      } else if (item.solution && String(item.solution).trim()) {
        solutionHTML = String(item.solution)
          .split(/[。\n]/)
          .filter((s) => s.trim().length > 0)
          .map((s) => `<li>${escapeHtml(s.trim())}。</li>`)
          .join("");
      }

      const reviewCount = item.reviewCount || item.count || 0;
      const title = item.complaint || item.title || "データなし";
      const details = item.details || item.description || "";

      return `
            <div class="${cardClass}">
                <div class="complaint-head">
                    ${importanceBadge}
                    <h3 class="problem-title">${escapeHtml(title)}</h3>
                </div>
                <div class="complaint-main">
                    <div class="complaint-stats-hero" style="display:flex;align-items:baseline;gap:0.65rem;margin-bottom:0.85rem;padding:0.75rem 1rem;background:#fef2f2;border:1px solid #fecaca;border-radius:10px;">
                        <span style="font-size:2rem;font-weight:900;color:#dc2626;line-height:1;">${escapeHtml(pct)}%</span>
                        <span style="font-size:1.05rem;font-weight:700;color:#991b1b;">（${escapeHtml(reviewCount)}件）</span>
                    </div>
                    ${details ? `<p class="problem-description prose-warn">${fp(details)}</p>` : ""}
                    ${
                      solutionHTML
                        ? `<div class="solutions"><h4 style="font-weight:700;margin-bottom:0.75rem;">対策</h4><ul style="margin:0;padding-left:1.5rem;line-height:1.8;">${solutionHTML}</ul></div>`
                        : ""
                    }
                </div>
            </div>`;
    })
    .join("");
}

function attributeItemHTML(label, score, commentText) {
  const lv = scoreLevel(score);
  return `
        <div class="attribute-item score-lv-${lv.key}">
            <div class="attribute-item-head">
                <span class="attribute-item-name">${escapeHtml(label)}</span>
                <span class="score-level">${lv.label}</span>
                <span class="attribute-item-score">${escapeHtml(score)}</span>
            </div>
            <div class="score-bar"><i style="width:${scoreBarWidth(score)}%"></i></div>
            ${commentText ? `<p class="attribute-item-comment">${fp(commentText)}</p>` : ""}
        </div>`;
}

const ATTR_SECTIONS = {
  petOwner: [
    { key: "suctionPower", altKey: "suction", label: "吸引力" },
    { key: "noiseLevel", altKey: "odorControl", altKey2: "odor", label: "静音性/臭い対策" },
    { key: "easeOfMaintenance", altKey: "maintenance", label: "メンテ性" },
    { key: "petSafety", label: "ペット安全" },
  ],
  apartment: [
    { key: "quietOperation", altKey: "noise", label: "静音性" },
    { key: "compactSize", altKey: "size", altKey2: "sizeSuitability", label: "サイズ適合" },
    { key: "storageSpace", altKey: "obstacle", altKey2: "obstacleHandling", label: "収納スペース" },
    { key: "neighborConsideration", label: "近隣への配慮" },
  ],
  workingProfessional: [
    { key: "automationLevel", altKey: "schedule", altKey2: "scheduleCompatibility", label: "自動化レベル" },
    { key: "appUsability", altKey: "app", label: "アプリ使いやすさ" },
    { key: "timeSaving", altKey: "automation", altKey2: "automationFeatures", label: "時短効果" },
    { key: "remoteControl", label: "リモート操作" },
  ],
  familyHome: [
    { key: "coverageArea", altKey: "range", altKey2: "areaCoverage", label: "カバーエリア" },
    { key: "batteryPerformance", altKey: "battery", altKey2: "batteryDuration", label: "バッテリー性能" },
    { key: "multiRoomSupport", altKey: "multifloor", altKey2: "multiFloorSupport", label: "複数部屋対応" },
    { key: "childSafety", label: "子供の安全" },
  ],
};

function buildAttributeDetailsHtml(attrData, sectionKey) {
  if (!attrData) return "";
  if (Array.isArray(attrData.details) && attrData.details.length) {
    return attrData.details
      .map((item) => {
        const commentText =
          item.comment ||
          (item.reviewCount ? `実数${item.reviewCount}件の口コミから算出` : "");
        return attributeItemHTML(item.attribute || item.field, item.score, commentText);
      })
      .join("");
  }
  const fields = ATTR_SECTIONS[sectionKey] || [];
  return fields
    .map((field) => {
      const value = attrData[field.key] || attrData[field.altKey] || attrData[field.altKey2];
      if (value === undefined || value === null) return "";
      const fieldData = typeof value === "number" ? { score: value } : value;
      const score = fieldData.score != null ? fieldData.score : fieldData;
      const commentText =
        fieldData.comment ||
        (fieldData.reviewCount ? `実数${fieldData.reviewCount}件の口コミから算出` : "");
      return attributeItemHTML(field.label, score, commentText);
    })
    .filter(Boolean)
    .join("");
}

function buildStaticAffiliateHtml(data) {
  const price = Number(data.price);
  const priceText = Number.isFinite(price)
    ? `価格目安：約¥${price.toLocaleString("ja-JP")}`
    : "";
  const direct = String(data.affiliate?.direct || "").trim();
  // Prefer plain URL from cta fields when affiliate.direct is HTML
  const ctaUrl =
    data.cta?.official ||
    data.cta?.amazon ||
    data.officialUrl ||
    (direct.startsWith("http") ? direct : "");

  const links = [];
  if (ctaUrl && /^https?:\/\//i.test(String(ctaUrl))) {
    links.push(
      `<a href="${escapeHtml(ctaUrl)}" target="_blank" rel="noopener sponsored" style="display:inline-block;margin:0.35rem 0.25rem;padding:0.7rem 1.1rem;background:#059669;color:#fff;border-radius:10px;font-weight:800;text-decoration:none;">公式・販売ページで価格を確認</a>`,
    );
  }
  if (data.cta?.amazon) {
    links.push(
      `<a href="${escapeHtml(data.cta.amazon)}" target="_blank" rel="noopener sponsored" style="display:inline-block;margin:0.35rem 0.25rem;padding:0.65rem 1rem;background:#fff;color:#0f172a;border:2px solid #cbd5e1;border-radius:10px;font-weight:700;text-decoration:none;">Amazon</a>`,
    );
  }
  if (data.cta?.rakuten) {
    links.push(
      `<a href="${escapeHtml(data.cta.rakuten)}" target="_blank" rel="noopener sponsored" style="display:inline-block;margin:0.35rem 0.25rem;padding:0.65rem 1rem;background:#fff;color:#0f172a;border:2px solid #cbd5e1;border-radius:10px;font-weight:700;text-decoration:none;">楽天</a>`,
    );
  }

  return `<!-- AFFILIATE_STATIC_START -->
            <div class="affiliate-static-fallback" style="text-align:center;padding:0.5rem 0 1rem;">
                ${priceText ? `<p style="margin:0 0 0.75rem;font-size:1.05rem;font-weight:800;color:#0f172a;">${priceText}</p>` : ""}
                <p style="margin:0 0 0.85rem;font-size:0.92rem;color:#334155;line-height:1.6;">メーカー公式ストアや各ECサイトの最新価格を確認できます。</p>
                <div>${links.join("") || '<p style="margin:0;color:#64748b;font-size:0.9rem;">購入リンクはページ表示後に読み込まれます。</p>'}</div>
            </div>
            <!-- AFFILIATE_STATIC_END -->`;
}

function buildTimeSavingLinkSection() {
  return `<!-- TIME_SAVING_START -->
        <section>
            <h2 class="section-title">
                <i class="fas fa-clock"></i>
                掃除の手間を減らすという視点
            </h2>
            <div class="card" style="padding:1.5rem 1.75rem;">
                <p style="margin:0 0 1rem;color:#0f172a;font-size:1rem;line-height:1.75;font-weight:600;">
                    ロボット掃除機の価値は「掃除そのものを減らす」ことにあります。機種ごとの創出時間は条件で大きく変わるため、製品ページでは共通の試算数値を載せていません。
                </p>
                <p style="margin:0;">
                    <a href="/about" style="display:inline-flex;align-items:center;gap:0.4rem;font-weight:800;color:#1e40af;text-decoration:none;">
                        サイトの分析方針を見る <i class="fas fa-arrow-right" aria-hidden="true"></i>
                    </a>
                </p>
            </div>
        </section>
        <!-- TIME_SAVING_END -->`;
}

function updateBadgeHtml(lastUpdated, now = new Date()) {
  const raw = String(lastUpdated || "").trim();
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    return `<div class="update-status-badge" data-dynamic="updateInfo.badge" style="padding: 0.5rem 1rem; background: #e2e8f0; color: #334155; border-radius: 8px; font-weight: 700; font-size: 0.85rem;">更新日未設定</div>`;
  }
  const updated = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const ageDays = Math.floor((now.getTime() - updated.getTime()) / 86400000);
  if (ageDays <= 60) {
    return `<div class="update-status-badge" data-dynamic="updateInfo.badge" style="padding: 0.5rem 1rem; background: #dcfce7; color: #166534; border-radius: 8px; font-weight: 700; font-size: 0.85rem;"><i class="fas fa-check-circle"></i> 最新対応済</div>`;
  }
  const monthLabel = `${Number(m[2])}月時点`;
  return `<div class="update-status-badge" data-dynamic="updateInfo.badge" style="padding: 0.5rem 1rem; background: #fef3c7; color: #92400e; border-radius: 8px; font-weight: 700; font-size: 0.85rem;">${escapeHtml(monthLabel)}</div>`;
}

function scoreToFive(overall) {
  const n = Number(overall);
  if (!Number.isFinite(n)) return null;
  // 100-point editorial score → 5-point reviewRating
  return Math.round((n / 20) * 10) / 10;
}

function buildEditorialReview(data, metadata) {
  const rating = scoreToFive(data.overallScore);
  if (rating == null) return null;
  const bodyParts = [];
  if (metadata.description) bodyParts.push(metadata.description);
  const floor = data.performanceAnalysis?.floorCleaning?.comment;
  if (floor) bodyParts.push(String(floor).slice(0, 120));
  return {
    "@type": "Review",
    author: {
      "@type": "Organization",
      name: "ナットクLabo編集部",
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(rating),
      bestRating: "5",
      worstRating: "1",
    },
    reviewBody: bodyParts.join(" ").slice(0, 280),
  };
}

module.exports = {
  buildPerformanceDetailsHtml,
  buildKeywordListHtml,
  buildComplaintsHtml,
  buildAttributeDetailsHtml,
  buildStaticAffiliateHtml,
  buildTimeSavingLinkSection,
  updateBadgeHtml,
  buildEditorialReview,
  overallColor,
  ATTR_SECTIONS,
};
