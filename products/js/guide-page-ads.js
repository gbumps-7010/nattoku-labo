/**
 * 選び方ガイド（当初プラン）:
 * - 本文中のもしもは出さず、まとめ直前に総合点上位1〜2機種だけ置く
 * - 主戦場は製品ページへの内部リンク
 * - メーカーバナー・EC横断バナーは出さない
 */
(function () {
  'use strict';

  const MAX_PICKS = 2;

  function featureAverage(data) {
    const perf = data && data.performanceAnalysis;
    if (!perf || typeof perf !== 'object') return null;
    const keys = [
      'floorCleaning',
      'carpetCleaning',
      'petHairRemoval',
      'quietness',
      'stepClimbing',
      'maintenance',
      'appStability',
      'batteryLife',
    ];
    const scores = [];
    keys.forEach((key) => {
      const node =
        key === 'petHairRemoval'
          ? perf.petHairRemoval || perf.petHair
          : key === 'quietness'
            ? perf.quietness || perf.nightQuietness
            : perf[key];
      const n = Number(node && node.score);
      if (Number.isFinite(n)) scores.push(n);
    });
    if (!scores.length) return null;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  function scoreOf(data) {
    const feat = featureAverage(data);
    const rel = Number(data && data.reliabilityScore);
    if (Number.isFinite(feat) && Number.isFinite(rel)) return feat * 0.85 + rel * 0.15;
    if (Number.isFinite(feat)) return feat;
    if (Number.isFinite(rel)) return rel;
    return 0;
  }

  async function loadProduct(slug) {
    const res = await fetch('/products/data/' + slug + '.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  function hideMount(el) {
    if (!el) return;
    el.innerHTML = '';
    el.hidden = true;
    el.style.display = 'none';
  }

  function buildConclusionBox(picks) {
    const box = document.createElement('section');
    box.id = 'guide-conclusion-cta';
    box.className = 'chapter article-card';
    box.style.cssText = 'max-width:860px;margin:1.75rem auto;';
    const h2 = document.createElement('h2');
    h2.textContent = picks.length > 1 ? '結論のおすすめ（価格を確認）' : '結論のおすすめ（価格を確認）';
    box.appendChild(h2);
    const lead = document.createElement('p');
    lead.className = 'sec-lead';
    lead.textContent =
      picks.length > 1
        ? 'このガイドの条件に合い、総合点が高い機種です。くわしい口コミは各製品ページへ。'
        : 'このガイドの条件に合う総合点トップの機種です。くわしい口コミは製品ページへ。';
    box.appendChild(lead);
    const list = document.createElement('div');
    list.className = 'guide-conclusion-list';
    list.style.cssText = 'display:flex;flex-direction:column;gap:1rem;';
    picks.forEach((pick, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'guide-conclusion-item';
      const label = document.createElement('p');
      label.style.cssText = 'margin:0 0 0.35rem;font-weight:800;color:#0f172a;';
      const name = (pick.data && pick.data.productName) || pick.slug;
      label.textContent = (picks.length > 1 ? (i === 0 ? 'おすすめ① ' : 'おすすめ② ') : '') + name;
      wrap.appendChild(label);
      wrap.appendChild(pick.el);
      pick.el.hidden = false;
      pick.el.style.display = '';
      const detail = document.createElement('a');
      detail.href = '/products/' + pick.slug + '.html';
      detail.textContent = name + ' の口コミ詳細を見る →';
      detail.style.cssText =
        'display:inline-block;margin-top:0.35rem;font-weight:700;font-size:0.9rem;color:#0f766e;text-decoration:none;';
      wrap.appendChild(detail);
      list.appendChild(wrap);
    });
    box.appendChild(list);
    return box;
  }

  /**
   * @param {(el: Element) => void|Promise<void>} mountFn
   */
  async function initMounts(mountFn) {
    const mounts = Array.from(document.querySelectorAll('.aff-mount[data-slug]'));
    if (!mounts.length) return;

    const scored = await Promise.all(
      mounts.map(async (el) => {
        const slug = el.getAttribute('data-slug');
        try {
          const data = await loadProduct(slug);
          const aff = data.affiliate || {};
          const has =
            !!(aff.moshimo && String(aff.moshimo).trim()) ||
            !!(aff.direct && String(aff.direct).trim());
          return { el, slug, data, has, score: scoreOf(data) };
        } catch (e) {
          return { el, slug, data: null, has: false, score: -1 };
        }
      })
    );

    // 同じ slug が複数ある場合は先頭だけ残す
    const seen = new Set();
    const unique = [];
    scored.forEach((item) => {
      if (seen.has(item.slug)) {
        hideMount(item.el);
        return;
      }
      seen.add(item.slug);
      unique.push(item);
    });

    const usable = unique.filter((x) => x.has).sort((a, b) => b.score - a.score);
    const picks = (usable.length ? usable : unique.sort((a, b) => b.score - a.score)).slice(
      0,
      MAX_PICKS
    );
    const pickSet = new Set(picks.map((p) => p.el));

    unique.forEach((item) => {
      if (!pickSet.has(item.el)) hideMount(item.el);
    });

    const box = buildConclusionBox(picks);
    const summary = document.getElementById('summary');
    if (summary && summary.parentNode) {
      summary.parentNode.insertBefore(box, summary);
    } else {
      const main = document.querySelector('main') || document.body;
      main.appendChild(box);
    }

    for (const pick of picks) {
      await mountFn(pick.el);
    }
    console.log(
      '✅ ガイドページ: 結論',
      picks.length,
      '機種',
      picks.map((p) => p.slug + '(' + p.score.toFixed(1) + ')')
    );
  }

  window.NattokuGuideAds = { initMounts };
})();
