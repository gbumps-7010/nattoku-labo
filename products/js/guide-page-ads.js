/**
 * 選び方ガイドのアフィリエイト。
 * - 本文のもしもは各機種セクションにそのまま出す
 * - 「メーカー比較ガイド」だけ、メーカー節ごとに公式バナーを追加できる
 */
(function () {
  'use strict';

  const SECTION_TO_MAKER = {
    'maker-dreame': 'Dreame',
    'maker-anker': 'Anker',
    'maker-irobot': 'iRobot',
    'maker-switchbot': 'SwitchBot',
    // ECOVACS / Roborock はバナー素材がないため対象外
  };

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

  function pickMakerBanner(catalog, maker) {
    const list = (catalog && catalog.byManufacturer && catalog.byManufacturer[maker]) || [];
    return (
      list.find((x) => x.role === 'mid_banner' && x.html) ||
      list.find((x) => x.role === 'official_banner' && x.html) ||
      null
    );
  }

  function injectBannerBeforePick(sectionId, maker, html) {
    const sid = 'guide-maker-banner-' + sectionId;
    if (document.getElementById(sid) || !html) return;
    const pick = document.getElementById(sectionId + '-pick');
    const section = document.getElementById(sectionId);
    const wrap = document.createElement('aside');
    wrap.id = sid;
    wrap.className = 'guide-maker-banner';
    wrap.style.cssText = 'margin:1rem 0 1.25rem;text-align:center;';
    const caption = document.createElement('p');
    caption.textContent = 'メーカー公式ストア';
    caption.style.cssText =
      'margin:0 0 0.45rem;font-size:0.78rem;font-weight:700;color:#64748b;letter-spacing:0.04em;';
    wrap.appendChild(caption);
    const inner = document.createElement('div');
    inner.style.cssText = 'display:inline-block;max-width:100%;line-height:0;';
    mountAdHtml(inner, html);
    wrap.appendChild(inner);

    if (pick && pick.parentNode) {
      pick.parentNode.insertBefore(wrap, pick);
    } else if (section) {
      section.appendChild(wrap);
    }
  }

  function injectMakersGuideBanners() {
    const sections = Object.keys(SECTION_TO_MAKER).filter((id) => document.getElementById(id));
    if (!sections.length) return Promise.resolve(0);
    return fetch('/products/data/ad-links.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((catalog) => {
        if (!catalog) return 0;
        let n = 0;
        sections.forEach((id) => {
          const maker = SECTION_TO_MAKER[id];
          const banner = pickMakerBanner(catalog, maker);
          if (banner && banner.html) {
            injectBannerBeforePick(id, maker, banner.html);
            n += 1;
          }
        });
        return n;
      })
      .catch(() => 0);
  }

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
    const legacy = document.getElementById('guide-conclusion-cta');
    if (legacy) legacy.remove();

    const added = await injectMakersGuideBanners();
    console.log('✅ ガイド: もしも', mounts.length, '枠 / メーカーバナー', added, '本');
  }

  window.NattokuGuideAds = { initMounts };
})();
