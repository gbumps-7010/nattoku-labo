/**
 * メーカーページ向け広告（当初プラン）:
 * - アフィありメーカー: まとめ直前にメーカーバナー1本 ＋ 既存のもしもはそのまま
 * - アフィなしメーカー: バナーなし。既存のもしものみ
 * - EC横断バナーは出さない
 */
(function () {
  'use strict';

  function mountAdHtml(container, html) {
    if (!container || !html) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    Array.from(tmp.childNodes).forEach((node) => {
      if (node.nodeName === 'SCRIPT') {
        const s = document.createElement('script');
        for (const attr of Array.from(node.attributes || [])) {
          s.setAttribute(attr.name, attr.value);
        }
        if (node.src) s.src = node.src;
        else s.textContent = node.textContent;
        container.appendChild(s);
        return;
      }
      container.appendChild(node);
    });
    container.querySelectorAll('img').forEach((img) => {
      const w = Number(img.getAttribute('width') || 0);
      const h = Number(img.getAttribute('height') || 0);
      if (w <= 1 && h <= 1) return;
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'inline-block';
    });
  }

  function injectMakerBanner(maker, html) {
    if (!html || document.getElementById('maker-ad-banner')) return;
    const wrap = document.createElement('aside');
    wrap.id = 'maker-ad-banner';
    wrap.className = 'maker-ad-banner article-card';
    wrap.style.cssText =
      'max-width:860px;margin:1.75rem auto 1.25rem;padding:1rem 1.15rem;text-align:center;';
    const caption = document.createElement('p');
    caption.textContent = 'メーカー公式ストア';
    caption.style.cssText =
      'margin:0 0 0.55rem;font-size:0.78rem;font-weight:700;color:#64748b;letter-spacing:0.04em;';
    wrap.appendChild(caption);
    const inner = document.createElement('div');
    inner.style.cssText = 'display:inline-block;max-width:100%;line-height:0;';
    mountAdHtml(inner, html);
    wrap.appendChild(inner);
    const note = document.createElement('p');
    note.style.cssText = 'margin:0.75rem 0 0;font-size:0.85rem;line-height:1.6;color:#475569;';
    note.innerHTML =
      '気になる機種の<strong>口コミ詳細ページ</strong>で、仕様・価格・保証をもう一段確認できます。';
    wrap.appendChild(note);

    const summary = document.getElementById('summary');
    if (summary && summary.parentNode) {
      summary.parentNode.insertBefore(wrap, summary);
    } else {
      const main = document.querySelector('main') || document.body;
      main.appendChild(wrap);
    }
  }

  function pickMakerBanner(catalog, maker) {
    const list = (catalog && catalog.byManufacturer && catalog.byManufacturer[maker]) || [];
    return (
      list.find((x) => x.role === 'mid_banner' && x.html) ||
      list.find((x) => x.role === 'official_banner' && x.html) ||
      null
    );
  }

  function loadCatalog() {
    return fetch('/products/data/ad-links.json')
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null);
  }

  /**
   * @param {(el: Element) => void} mountFn 既存のもしも描画関数
   */
  function initMounts(mountFn) {
    const mounts = Array.from(document.querySelectorAll('.aff-mount[data-slug]'));
    const maker =
      (mounts[0] && mounts[0].getAttribute('data-maker')) ||
      (document.querySelector('[data-maker]') || {}).getAttribute('data-maker') ||
      '';

    // もしもは従来どおり全枠を描画
    mounts.forEach((el) => {
      el.hidden = false;
      el.style.display = '';
      mountFn(el);
    });

    if (!maker) return;
    loadCatalog().then((catalog) => {
      const banner = pickMakerBanner(catalog, maker);
      if (banner && banner.html) {
        injectMakerBanner(maker, banner.html);
        console.log('✅ メーカーページ: 公式バナー追加（もしもは従来どおり）', maker);
      }
    });
  }

  window.NattokuMakerAds = { initMounts, injectMakerBanner, pickMakerBanner };
})();