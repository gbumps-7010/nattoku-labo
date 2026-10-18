/**
 * 選び方ガイドのアフィリエイト描画。
 * 本文中の各機種セクションにもしもを出し、製品の区切りが分かるようにする。
 * （まとめ直前への集約はしない）
 */
(function () {
  'use strict';

  /**
   * @param {(el: Element) => void|Promise<void>} mountFn
   */
  async function initMounts(mountFn) {
    const mounts = Array.from(document.querySelectorAll('.aff-mount[data-slug]'));
    for (const el of mounts) {
      el.hidden = false;
      el.style.display = '';
      await mountFn(el);
    }
    // 以前の結論集約ブロックが残っていれば外す
    const legacy = document.getElementById('guide-conclusion-cta');
    if (legacy) legacy.remove();
    console.log('✅ ガイドページ: 本文のもしもを各機種に表示', mounts.length);
  }

  window.NattokuGuideAds = { initMounts };
})();
