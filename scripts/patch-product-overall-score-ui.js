#!/usr/bin/env node
"use strict";

/**
 * Replace header top-3 performance pills with 総合点 score-hero UI
 * across all product HTML pages.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const PRODUCTS_DIR = path.join(ROOT, "products");
const EXCLUDED = new Set(["template-unified.html", "template-unified-old.html", "test-js.html"]);

const SCORE_HERO_CSS = `        .score-hero {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 0;
            margin: 0 0 0.95rem;
            width: 100%;
            background: rgba(255, 255, 255, 0.12);
            border: 1px solid rgba(255, 255, 255, 0.22);
            border-radius: 14px;
            overflow: hidden;
        }

        @media (max-width: 560px) {
            .score-hero {
                grid-template-columns: 1fr;
            }
        }

        .score-badge {
            background: #fff;
            color: var(--secondary-color);
            padding: 0.85rem 1.15rem 0.9rem;
            text-align: center;
            min-width: 8.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .score-badge .label {
            font-size: 0.78rem;
            font-weight: 900;
            letter-spacing: 0.04em;
            color: var(--primary-color);
            margin-bottom: 0.1rem;
        }

        .score-badge .num {
            font-size: 2.75rem;
            font-weight: 900;
            line-height: 1;
            color: var(--primary-color);
            font-variant-numeric: tabular-nums;
        }

        .score-badge .unit {
            margin-top: 0.15rem;
            font-size: 0.72rem;
            font-weight: 800;
            color: #64748b;
        }

        .score-break {
            padding: 0.85rem 1.25rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 0.4rem;
            min-width: 0;
        }

        .score-break .row {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 0.65rem;
            width: 100%;
            font-size: 0.9rem;
            font-weight: 700;
            line-height: 1.3;
        }

        .score-break .row .k {
            opacity: 0.92;
            white-space: nowrap;
        }

        .score-break .row .v {
            font-variant-numeric: tabular-nums;
            font-weight: 900;
            font-size: 1.15rem;
        }

        .score-break .formula {
            margin-top: 0.2rem;
            font-size: 0.76rem;
            opacity: 0.9;
            font-weight: 600;
            line-height: 1.45;
        }

        @media (max-width: 560px) {
            .score-badge {
                min-width: 0;
                padding: 0.8rem 1rem;
            }

            .score-break {
                align-items: stretch;
                text-align: left;
            }
        }
`;

const SCORE_HERO_HTML = `                    <div class="score-hero" id="overallScoreHero">
                        <div class="score-badge">
                            <div class="label">総合点</div>
                            <div class="num"><span data-dynamic="overallScore">—</span></div>
                            <div class="unit">/ 100点</div>
                        </div>
                        <div class="score-break">
                            <div class="row">
                                <span class="k">機能平均点</span>
                                <span class="v"><span data-dynamic="featureAverageScore">—</span>点</span>
                            </div>
                            <div class="row">
                                <span class="k">口コミ信頼度</span>
                                <span class="v"><span data-dynamic="reliabilityScore">—</span>点</span>
                            </div>
                            <p class="formula">算出式：機能平均点 × 0.85 ＋ 口コミ信頼度 × 0.15</p>
                        </div>
                    </div>
`;

function replaceExactCssBlock(html, selector) {
  const start = html.indexOf(selector);
  if (start === -1) return { html, found: false };
  const openBrace = html.indexOf("{", start);
  if (openBrace === -1) return { html, found: false };
  let depth = 0;
  for (let i = openBrace; i < html.length; i += 1) {
    if (html[i] === "{") depth += 1;
    else if (html[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        return {
          html: html.slice(0, start) + html.slice(i + 1),
          found: true,
        };
      }
    }
  }
  return { html, found: false };
}

function patchCss(html) {
  if (html.includes(".score-hero {") && !html.includes(".performance-scores {")) {
    return html;
  }

  let next = html;
  for (const selector of [".performance-scores", ".score-item", ".score-label", ".score-value"]) {
    // Only remove top-level (non-mobile) first occurrences before product-title.
    // Mobile overrides are replaced later by prerender ensureMobileOverrides.
    const marker = next.indexOf(".product-title");
    const searchAreaEnd = marker === -1 ? next.length : marker;
    const head = next.slice(0, searchAreaEnd);
    const tail = next.slice(searchAreaEnd);
    const result = replaceExactCssBlock(head, `\n        ${selector} {`);
    if (!result.found) {
      const alt = replaceExactCssBlock(head, `        ${selector} {`);
      next = alt.html + tail;
    } else {
      next = result.html + tail;
    }
  }

  if (!next.includes(".score-hero {")) {
    next = next.replace(/(\n\s*\.product-title\s*\{)/, `\n\n${SCORE_HERO_CSS}$1`);
  }
  return next;
}

function patchMarkup(html) {
  let next = html;

  if (!next.includes('id="overallScoreHero"')) {
    const replaced = next.replace(
      /\s*(?:<!--\s*性能スコア表示\s*-->\s*)?<div class="performance-scores" id="performanceScores">\s*(?:<!--[\s\S]*?-->\s*)?<\/div>/,
      `\n\n${SCORE_HERO_HTML}`,
    );
    if (replaced === next) {
      throw new Error("could not find performanceScores block");
    }
    next = replaced;
  }

  // Remove only the header stats pill for 口コミ信頼度 (not other sections)
  next = next.replace(
    /\n\s*<div class="product-header-stat">\s*\n\s*口コミ信頼度:\s*<span data-dynamic="reliabilityScore">[^<]*<\/span>点\s*\n\s*<\/div>/,
    "",
  );

  return next;
}

function main() {
  const files = fs
    .readdirSync(PRODUCTS_DIR)
    .filter((name) => name.endsWith(".html") && !EXCLUDED.has(name));

  let ok = 0;
  const failed = [];

  for (const name of files) {
    const filePath = path.join(PRODUCTS_DIR, name);
    const before = fs.readFileSync(filePath, "utf8");
    const beforeLen = before.length;

    try {
      let html = patchCss(before);
      html = patchMarkup(html);

      if (!html.includes('id="overallScoreHero"')) {
        failed.push(`${name}: missing score-hero`);
        continue;
      }
      if (html.includes('id="performanceScores"')) {
        failed.push(`${name}: performanceScores remains`);
        continue;
      }
      // Guard: patch must not delete large chunks of the page
      if (html.length < beforeLen * 0.85) {
        failed.push(`${name}: file shrank too much (${beforeLen} -> ${html.length})`);
        continue;
      }
      if (!html.includes("口コミの信頼度") && before.includes("口コミの信頼度")) {
        failed.push(`${name}: reliability section missing after patch`);
        continue;
      }

      fs.writeFileSync(filePath, html, "utf8");
      ok += 1;
    } catch (error) {
      failed.push(`${name}: ${error.message}`);
    }
  }

  console.log(`Patched ${ok}/${files.length} product pages`);
  if (failed.length) {
    console.error("Failures:");
    for (const item of failed) console.error(" -", item);
    process.exit(1);
  }
}

main();
