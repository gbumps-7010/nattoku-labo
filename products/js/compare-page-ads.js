/**
 * 価格帯比較ページ（当初プラン）:
 * - 詳細リンク一覧はそのまま（製品ページ誘導が主）
 * - 「最新価格をチェック」は総合点トップの1機種だけ出す
 * - メーカーバナー・EC横断バナーは出さない
 */
(function () {
  'use strict';

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

  /** 製品ページと同じ: 機能平均×0.85 + 口コミ信頼度×0.15 */
  function scoreOf(data) {
    const feat = featureAverage(data);
    const rel = Number(data && data.reliabilityScore);
    if (Number.isFinite(feat) && Number.isFinite(rel)) return feat * 0.85 + rel * 0.15;
    if (Number.isFinite(feat)) return feat;
    if (Number.isFinite(rel)) return rel;
    return 0;
  }

  function reviewsOf(data) {
    const n = Number(data && (data.totalReviews || data.reviewCount));
    return Number.isFinite(n) ? n : 0;
  }

  async function loadProduct(slug) {
    const res = await fetch('/products/data/' + slug + '.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  function updateCopy(section, data) {
    if (!section) return;
    const h2 = section.querySelector('h2');
    if (h2) h2.textContent = '迷ったらこの1台の価格を確認';
    let sub = section.querySelector('.section-sub');
    if (!sub) {
      sub = document.createElement('p');
      sub.className = 'section-sub';
      if (h2 && h2.nextSibling) section.insertBefore(sub, h2.nextSibling);
      else section.appendChild(sub);
    }
    const name = (data && (data.productName || data.name)) || '';
    const score = scoreOf(data);
    sub.textContent = name
      ? `この価格帯で総合点が最も高いのは「${name}」（${score.toFixed(1)}点）です。詳細な口コミ分析は製品ページへ。`
      : 'この価格帯の候補から、総合点が最も高い1機種の購入導線だけを表示しています。';
  }

  function ensureDetailLink(card, slug, data) {
    if (!card || card.querySelector('.aff-card-detail-link')) return;
    const a = document.createElement('a');
    a.className = 'aff-card-detail-link';
    a.href = '/products/' + slug + '.html';
    a.textContent = ((data && data.productName) || slug) + ' の口コミ詳細を見る →';
    a.style.cssText =
      'display:block;margin-top:0.55rem;text-align:center;font-weight:700;font-size:0.9rem;color:#0f766e;text-decoration:none;';
    card.appendChild(a);
  }

  /**
   * @param {(el: Element) => void|Promise<void>} mountCard
   */
  async function initCards(mountCard) {
    const section = document.getElementById('price-check');
    const cards = Array.from(document.querySelectorAll('.aff-card[data-slug]'));
    if (!cards.length) return;

    const scored = await Promise.all(
      cards.map(async (el) => {
        const slug = el.getAttribute('data-slug');
        try {
          const data = await loadProduct(slug);
          const aff = data.affiliate || {};
          const has =
            !!(aff.moshimo && String(aff.moshimo).trim()) ||
            !!(aff.direct && String(aff.direct).trim());
          return {
            el,
            slug,
            data,
            has,
            score: scoreOf(data),
            reviews: reviewsOf(data),
          };
        } catch (e) {
          return { el, slug, data: null, has: false, score: -1, reviews: 0 };
        }
      })
    );

    const usable = scored.filter((x) => x.has).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.reviews - a.reviews;
    });
    const winner = usable[0] || scored.sort((a, b) => b.score - a.score)[0];
    if (!winner) return;

    cards.forEach((el) => {
      if (el !== winner.el) el.remove();
    });

    const grid = section && section.querySelector('.affiliate-grid');
    if (grid) {
      grid.style.gridTemplateColumns = '1fr';
      grid.style.maxWidth = '560px';
      grid.style.margin = '0 auto';
    }

    // 表の「最新価格を見る」は削除済みカードIDを指すため、結論枠へ統一
    document.querySelectorAll('a.price-jump[href^="#price-check"]').forEach((a) => {
      a.setAttribute('href', '#price-check');
    });

    updateCopy(section, winner.data);
    await mountCard(winner.el);
    ensureDetailLink(winner.el, winner.slug, winner.data);
    console.log('✅ 比較ページ: 結論1機種のみ', winner.slug, winner.score);
  }

  window.NattokuCompareAds = { initCards };
})();
