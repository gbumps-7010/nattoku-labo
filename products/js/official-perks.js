/**
 * メーカー公式ストアの購入特典ボックス。
 * 製品ページ（product-loader.js）とメーカー別ページ・選び方ガイド（生成ページ）の両方から使う。
 * 特典は変わるため、内容を更新したら CHECKED_AT も更新すること。
 */
(function () {
  'use strict';

  const CHECKED_AT = '2026年10月4日';
  const FAILURE_RE = /故障|初期不良|不具合|壊れ/;
  const FAILURE_MIN_COUNT = 5;

  const MAKERS = {
    iRobot: {
      store: 'アイロボット公式オンラインストア',
      perks: [
        { key: 'warranty', icon: 'fa-shield-halved', title: '無料2年保証', short: '無料2年保証', note: 'メーカー1年＋延長1年（要ユーザー登録）' },
        { key: 'warranty5', icon: 'fa-shield-heart', title: '有料5年保証も選べる', short: '物損も対象の5年保証', note: '落下・水漏れなどの物損も対象' },
        { key: 'pickup', icon: 'fa-recycle', title: '古い掃除機を無料引き取り', short: '古い掃除機の無料引き取り', note: '他社製・故障品もOK（注文時に申込）', exclude: ['roomba-max-705-combo-autowash'] },
        { key: 'shipping', icon: 'fa-truck', title: '送料無料', short: '送料無料', note: '税込3,980円以上' },
      ],
      failureTail: '公式ストアなら無料で2年保証が付き、物損も対象の有料5年保証も選べます。',
      highPriceTail: '高額なモデルほど保証の手厚さが効いてきます。公式ストアなら無料で2年保証、有料で5年保証まで延ばせます。',
      defaultTail: { perk: 'pickup', text: '買い替えなら、今の掃除機を無料で引き取ってもらえます（他社製・故障品もOK）。' },
    },
    Anker: {
      store: 'Anker Japan 公式オンラインストア',
      perks: [
        { key: 'warranty', icon: 'fa-shield-halved', title: '最長24ヶ月保証', short: '最長24ヶ月保証', note: '会員登録で18ヶ月→24ヶ月に延長' },
        { key: 'return', icon: 'fa-rotate-left', title: '30日間 返品・返金保証', short: '30日間返品OK', note: '届いてから30日以内' },
        { key: 'points', icon: 'fa-coins', title: '会員マイルが貯まる', short: 'マイル還元', note: '購入額に応じて最大10%還元' },
        { key: 'shipping', icon: 'fa-truck', title: '送料無料', short: '送料無料', note: '税込4,000円以上' },
      ],
      failureTail: '公式ストアで会員登録すると、保証が18ヶ月から24ヶ月に延びます。',
      highPriceTail: '高額なモデルほど保証の長さが効いてきます。公式ストアなら会員登録で保証が24ヶ月に延びます。',
      defaultTail: { perk: 'return', text: '公式ストアなら、届いてから30日以内の返品・返金に対応しています。' },
    },
    SwitchBot: {
      store: 'SwitchBot公式サイト',
      perks: [
        { key: 'tradein', icon: 'fa-recycle', title: '下取りで5%キャッシュバック', short: '下取りで5%還元', note: '古い掃除機の無料回収つき（他社製OK）', exclude: ['k20-pro'] },
        { key: 'genuine', icon: 'fa-circle-check', title: 'メーカー保証が確実', short: 'メーカー保証が確実', note: '保証は正規販売ルートでの購入が条件' },
        { key: 'points', icon: 'fa-coins', title: '公式ポイントが貯まる', short: 'ポイント還元', note: '次回のお買い物に使える' },
        { key: 'shipping', icon: 'fa-truck', title: '送料無料', short: '送料無料', note: '税込2,000円以上' },
      ],
      failureTail: 'メーカー保証は正規の販売ルートで買うことが条件です。公式サイトなら確実に保証を受けられます。',
      highPriceTail: '高額なモデルほど、確実にメーカー保証を受けられる買い方が安心です。',
      defaultTail: { perk: 'tradein', text: '買い替えなら、古い掃除機の無料回収に加えて購入額の5%がキャッシュバックされます。' },
    },
    Dreame: {
      store: 'Dreame Japan 公式オンラインストア',
      perks: [
        {
          key: 'warranty', icon: 'fa-shield-halved', title: '3年のメーカー保証', short: '3年保証', note: '本体・ステーションが対象（バッテリーは1年）',
          only: ['d20-ultra', 'f20', 'f20-plus', 'l10s-ultra-gen-3', 'l40-ultra-ae', 'l40s-pro-ultra', 'x50-ultra'],
        },
        { key: 'genuine', icon: 'fa-circle-check', title: 'メーカー保証が確実', short: 'メーカー保証が確実', note: '保証は正規販売ルートでの購入が条件' },
        { key: 'points', icon: 'fa-coins', title: '公式ポイントが貯まる', short: 'ポイント還元', note: 'アプリ経由でポイントアップ' },
        { key: 'shipping', icon: 'fa-truck', title: '送料無料', short: '送料無料', note: '税込2,999円以上' },
      ],
      failureTail: 'メーカー保証は正規の販売ルートで買うことが条件です。公式ストアなら確実に保証を受けられます。',
      highPriceTail: '高額なモデルほど、確実にメーカー保証を受けられる買い方が安心です。',
      warrantyTail: 'この機種は3年のメーカー保証の対象です。公式ストアで買えば確実に保証を受けられます。',
      defaultTail: { perk: 'points', text: '公式ストアで買うとポイントが貯まり、消耗品の買い足しに使えます。' },
    },
  };

  function perksFor(maker, productId) {
    const m = MAKERS[maker];
    if (!m) return [];
    return m.perks.filter((p) => {
      if (p.only && p.only.indexOf(productId) === -1) return false;
      if (p.exclude && p.exclude.indexOf(productId) !== -1) return false;
      return true;
    });
  }

  /** topComplaints（製品JSON）から故障系の不満を1件取り出す */
  function failureFrom(complaints) {
    if (!Array.isArray(complaints)) return null;
    for (const c of complaints.slice(0, 3)) {
      if (!c || !FAILURE_RE.test(c.title || '')) continue;
      return { title: c.title, count: Number(c.reviewCount) || 0, pct: Number(c.percentage) || 0 };
    }
    return null;
  }

  function nudgeText(maker, productId, price, failure) {
    const m = MAKERS[maker];
    if (!m) return '';
    const keys = perksFor(maker, productId).map((p) => p.key);
    const warrantyTail = m.warrantyTail && keys.indexOf('warranty') !== -1 ? m.warrantyTail : '';
    if (failure && failure.title && failure.count >= FAILURE_MIN_COUNT) {
      const pct = failure.pct ? `・口コミの約${Math.round(failure.pct)}%` : '';
      return `口コミ分析では、よくある不満に「${failure.title}」（${failure.count}件${pct}）が挙がっています。` +
        (warrantyTail || m.failureTail);
    }
    if (price >= 100000) return warrantyTail || m.highPriceTail;
    if (warrantyTail) return warrantyTail;
    const tail = m.defaultTail;
    if (tail && keys.indexOf(tail.perk) !== -1) return tail.text;
    if (keys.indexOf('genuine') !== -1) return m.failureTail;
    return '';
  }

  function injectStyle() {
    if (document.getElementById('official-perks-style')) return;
    const style = document.createElement('style');
    style.id = 'official-perks-style';
    style.textContent =
      '.op-box{box-sizing:border-box;width:100%;margin:0;padding:12px 14px;border:1px solid #cfe6df;border-radius:12px;background:#f6fbf9;color:#0f172a;text-align:left}' +
      '.op-head{display:flex;align-items:center;gap:.45em;margin:0 0 8px;font-size:.9rem;font-weight:800;color:#065f46;line-height:1.4}' +
      '.op-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 8px;padding:0;list-style:none}' +
      '.op-chip{display:inline-flex;align-items:baseline;gap:.35em;margin:0;padding:4px 10px;border:1px solid #d7ebe5;border-radius:999px;background:#fff;font-size:.8rem;line-height:1.5}' +
      '.op-chip>i{color:#0f766e;font-size:.85em}' +
      '.op-chip strong{font-weight:800}' +
      '.op-chip small{font-size:.72rem;color:#64748b}' +
      '.op-nudge{margin:0 0 10px;font-size:.84rem;line-height:1.7;color:#334155}' +
      '.op-box .affiliate-official-wrap,.op-box .aff-direct,.op-slim .affiliate-official-wrap,.op-slim .aff-direct,.op-slim .aff-card-direct{margin:0}' +
      '.op-note{margin:6px 0 0;font-size:.7rem;line-height:1.55;color:#64748b}' +
      '.op-slim{box-sizing:border-box;width:100%;margin:.55rem 0 0}' +
      '.op-slim-perks{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:2px 12px;margin:6px 0 0;font-size:.76rem;line-height:1.5;color:#475569}' +
      '.op-slim-perks span{white-space:nowrap}' +
      '.op-slim-perks i{margin-right:.3em;color:#0f766e;font-size:.85em}' +
      '.op-slim-label{font-weight:700;color:#065f46}';
    document.head.appendChild(style);
  }

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  /**
   * 公式ストアの特典表示を作る。対象メーカーでなければ null。
   * opts: { maker, productId, price, failure, button(Element), mode('slim'|'full') }
   * slim: ボタン＋特典キーワード1行（記事の流れを邪魔しない場所用）
   * full: 特典・口コミに基づく一言・注記つき（購入を検討する場所用）
   */
  function build(opts) {
    const perks = perksFor(opts.maker, opts.productId);
    if (!perks.length) return null;
    injectStyle();

    if (opts.mode !== 'full') {
      const wrap = el('div', 'op-slim');
      if (opts.button) wrap.appendChild(opts.button);
      const line = el('p', 'op-slim-perks');
      line.appendChild(el('span', 'op-slim-label', '公式ストア特典'));
      perks.slice(0, 3).forEach((p) => {
        const item = el('span');
        item.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
        item.appendChild(document.createTextNode(p.short || p.title));
        line.appendChild(item);
      });
      wrap.appendChild(line);
      return wrap;
    }

    const box = el('div', 'op-box');
    const head = el('p', 'op-head');
    head.innerHTML = '<i class="fas fa-store" aria-hidden="true"></i>';
    head.appendChild(document.createTextNode('メーカー公式ストアで買うと'));
    box.appendChild(head);

    const list = el('ul', 'op-chips');
    perks.forEach((p) => {
      const li = el('li', 'op-chip');
      li.innerHTML = `<i class="fas ${p.icon}" aria-hidden="true"></i>`;
      li.appendChild(el('strong', '', p.title));
      li.appendChild(el('small', '', p.note));
      list.appendChild(li);
    });
    box.appendChild(list);

    const text = nudgeText(opts.maker, opts.productId, Number(opts.price) || 0, opts.failure);
    if (text) box.appendChild(el('p', 'op-nudge', text));
    if (opts.button) box.appendChild(opts.button);
    box.appendChild(el('p', 'op-note',
      `※${CHECKED_AT}時点の${MAKERS[opts.maker].store}の情報です。条件・対象機種は変わることがあるため、購入前に公式ストアでご確認ください。`));
    return box;
  }

  window.NattokuOfficialPerks = { CHECKED_AT, build, failureFrom, has: (maker, id) => perksFor(maker, id).length > 0 };
})();
