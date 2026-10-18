/**
 * 価格帯比較ページのアフィリエイト描画。
 * 製品カードのもしも／公式は従来どおり全件出す（CTA削減はしない）。
 */
(function () {
  'use strict';

  /**
   * @param {(el: Element) => void|Promise<void>} mountCard
   */
  async function initCards(mountCard) {
    const cards = Array.from(document.querySelectorAll('.aff-card[data-slug]'));
    for (const el of cards) {
      el.hidden = false;
      el.style.display = '';
      await mountCard(el);
    }
    console.log('✅ 比較ページ: 価格カードを全件表示', cards.length);
  }

  window.NattokuCompareAds = { initCards };
})();
