/**
 * ナビゲーションバー＆関連製品システム V3.14
 * - 固定ナビゲーションバー（製品ドロップダウン、メーカーフィルター、価格帯フィルター）
 * - 関連製品セクション（同メーカー・同価格帯の製品を自動表示）
 */

// 全製品データ（価格・メーカー情報のみ）
const ALL_PRODUCTS = [
    { id: 'eufy-clean-x8-pro-with-self-empty-station', name: 'Eufy Clean X8 Pro with Self-Empty Station', manufacturer: 'Anker', price: 69990, rating: 3.72 },
    { id: 'eufy-robovac-g10-hybrid', name: 'Eufy RoboVac G10 Hybrid', manufacturer: 'Anker', price: 29990, rating: 3.47 },
    { id: 'eufy-robovac-g30', name: 'Eufy RoboVac G30', manufacturer: 'Anker', price: 29490, rating: 4.16 },
    { id: 'eufy-robovac-g30-hybrid', name: 'Eufy RoboVac G30 Hybrid', manufacturer: 'Anker', price: 39990, rating: 4.09 },
    { id: 'eufy-robovac-x8-hybrid', name: 'Eufy RoboVac X8 Hybrid', manufacturer: 'Anker', price: 59800, rating: 3.53 },
    { id: 'eufy-robot-vacuum-auto-empty-c10', name: 'Eufy Robot Vacuum Auto-Empty C10', manufacturer: 'Anker', price: 29990, rating: 4.01 },
    { id: 'eufy-robot-vacuum-omni-c20', name: 'Eufy Robot Vacuum Omni C20', manufacturer: 'Anker', price: 69990, rating: 4.26 },
    { id: 'eufy-robot-vacuum-omni-c28', name: 'Eufy Robot Vacuum Omni C28', manufacturer: 'Anker', price: 99990, rating: 4.19 },
    { id: 'eufy-robot-vacuum-omni-e25', name: 'Eufy Robot Vacuum Omni E25', manufacturer: 'Anker', price: 119920, rating: 4.46 },
    { id: 'eufy-robot-vacuum-omni-s1-pro', name: 'Eufy Robot Vacuum Omni S1 Pro', manufacturer: 'Anker', price: 199900, rating: 4.09 },
    { id: 'eufy-x10-pro-omni', name: 'Eufy X10 Pro Omni', manufacturer: 'Anker', price: 69990, rating: 4.0 },
    { id: 'd10-plus', name: 'D10 Plus', manufacturer: 'Dreame', price: 26900, rating: 4.19 },
    { id: 'l20-ultra-complete', name: 'L20 Ultra Complete', manufacturer: 'Dreame', price: 52000, rating: 4.42 },
    { id: 'l40-ultra-ae', name: 'L40 Ultra AE', manufacturer: 'Dreame', price: 99800, rating: 4.26 },
    { id: 'l40s-pro-ultra', name: 'L40s Pro Ultra', manufacturer: 'Dreame', price: 99800, rating: 4.36 },
    { id: 'x30-ultra', name: 'X30 Ultra', manufacturer: 'Dreame', price: 69800, rating: 4.27 },
    { id: 'x50-ultra', name: 'X50 Ultra', manufacturer: 'Dreame', price: 199800, rating: 4.53 },
    { id: 'deebot-n30', name: 'DEEBOT N30', manufacturer: 'ECOVACS', price: 34800, rating: 4.3 },
    { id: 'deebot-n30-plus', name: 'DEEBOT N30 PLUS', manufacturer: 'ECOVACS', price: 69800, rating: 4.34 },
    { id: 'deebot-t50-omni', name: 'DEEBOT T50 OMNI', manufacturer: 'ECOVACS', price: 64820, rating: 4.18 },
    { id: 'deebot-t50s-omni', name: 'DEEBOT T50S OMNI', manufacturer: 'ECOVACS', price: 89800, rating: 3.86 },
    { id: 'deebot-t80-omni', name: 'DEEBOT T80 OMNI', manufacturer: 'ECOVACS', price: 149800, rating: 4.46 },
    { id: 'deebot-t90-omni', name: 'DEEBOT T90 OMNI', manufacturer: 'ECOVACS', price: 149800, rating: 4.36 },
    { id: 'deebot-x11-omnicyclone', name: 'DEEBOT X11 OmniCyclone', manufacturer: 'ECOVACS', price: 229900, rating: 4.46 },
    { id: 'deebot-x8-pro-omni', name: 'DEEBOT X8 PRO OMNI', manufacturer: 'ECOVACS', price: 199800, rating: 4.24 },
    { id: 'deebot-mini', name: 'DEEBOT mini', manufacturer: 'ECOVACS', price: 69800, rating: 4.04 },
    { id: 'q10p', name: 'Q10P+', manufacturer: 'Roborock', price: 41800, rating: 4.41 },
    { id: 'q10v', name: 'Q10V', manufacturer: 'Roborock', price: 35999, rating: 4.14 },
    { id: 'qrevo-curvc', name: 'Qrevo CurvC', manufacturer: 'Roborock', price: 146900, rating: 4.46 },
    { id: 'saros-10r', name: 'Saros 10R', manufacturer: 'Roborock', price: 269800, rating: 4.44 },
    { id: 's10', name: 'お掃除ロボットS10', manufacturer: 'SwitchBot', price: 119820, rating: 3.53 },
    { id: 's20', name: 'お掃除ロボットS20', manufacturer: 'SwitchBot', price: 91800, rating: 4.14 },
    { id: 'k10-pro', name: 'ロボット掃除機 K10+ Pro', manufacturer: 'SwitchBot', price: 64800, rating: 3.66 },
    { id: 'k11', name: 'ロボット掃除機 K11+', manufacturer: 'SwitchBot', price: 59800, rating: 4.36 },
    { id: 'roomba-105-combo-autoempty', name: 'Roomba® 105 Combo + AutoEmpty™', manufacturer: 'iRobot', price: 59200, rating: 3.94 },
    { id: 'roomba-max-705-combo-autowash', name: 'Roomba® Max 705 Combo + AutoWash™', manufacturer: 'iRobot', price: 179800, rating: 3.91 },
    { id: 'roomba-max-705-vac-autoempty', name: 'Roomba® Max 705 Vac + AutoEmpty™', manufacturer: 'iRobot', price: 98800, rating: 3.98 },
    { id: 'roomba-mini-autoempty', name: 'Roomba® Mini + AutoEmpty™', manufacturer: 'iRobot', price: 49800, rating: 4.22 },
    { id: 'roomba-mini-slim-slimcharge', name: 'Roomba® Mini Slim + SlimCharge™', manufacturer: 'iRobot', price: 39800, rating: 3.75 },
    { id: 'roomba-plus-405-combo-autowash', name: 'Roomba® Plus 405 Combo + AutoWash™', manufacturer: 'iRobot', price: 98800, rating: 4.22 },
    { id: 'roomba-plus-505-combo-autowash', name: 'Roomba® Plus 505 Combo + AutoWash™', manufacturer: 'iRobot', price: 128400, rating: 3.87 }
];

// メーカー一覧
const MANUFACTURERS = ['すべて', 'Anker', 'Dreame', 'ECOVACS', 'Roborock', 'SwitchBot', 'iRobot'];

// 価格帯一覧（トップページ / products-data.js の priceRanges と一致させる）
const PRICE_RANGES = [
    { label: 'すべて', min: 0, max: Infinity },
    { label: '5万円未満', min: 0, max: 50000 },
    { label: '5万円〜10万円', min: 50000, max: 100000 },
    { label: '10万円以上', min: 100000, max: Infinity }
];

/**
 * 固定ナビゲーションバーを作成
 */
function createNavigationBar() {
    const nav = document.createElement('nav');
    nav.id = 'fixed-navigation';
    nav.className = 'fixed-navigation';
    
    nav.innerHTML = `
        <div class="nav-container">
            <div class="nav-logo">
                <a href="../">
                    <i class="fas fa-chart-line"></i>
                    <span>ナットクLabo</span>
                </a>
            </div>
            
            <div class="nav-menu" id="nav-menu-panel">
                <a href="../index.html" class="nav-link">
                    <i class="fas fa-home"></i> ホーム
                </a>
                
                <div class="nav-dropdown">
                    <button class="nav-link dropdown-toggle">
                        <i class="fas fa-list"></i> 製品一覧 <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-menu products-dropdown">
                        ${ALL_PRODUCTS.map(p => `
                            <a href="${p.id}.html" class="dropdown-item ${getCurrentProductId() === p.id ? 'active' : ''}">
                                <span class="product-name">${p.name}</span>
                                <span class="product-meta">
                                    <span class="manufacturer">${p.manufacturer}</span>
                                    <span class="price">¥${p.price.toLocaleString()}</span>
                                    <span class="rating">★${p.rating}</span>
                                </span>
                            </a>
                        `).join('')}
                    </div>
                </div>
                
                <div class="nav-dropdown">
                    <button class="nav-link dropdown-toggle">
                        <i class="fas fa-industry"></i> メーカー <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-menu manufacturer-dropdown">
                        ${MANUFACTURERS.filter(m => m !== 'すべて').map(m => {
                            const count = ALL_PRODUCTS.filter(p => p.manufacturer === m).length;
                            return `
                                <div class="dropdown-item manufacturer-filter" data-manufacturer="${m}">
                                    <span class="manufacturer-name">${m}</span>
                                    <span class="product-count">(${count}製品)</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="nav-dropdown">
                    <button class="nav-link dropdown-toggle">
                        <i class="fas fa-yen-sign"></i> 価格帯 <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-menu price-dropdown">
                        ${PRICE_RANGES.filter(r => r.label !== 'すべて').map(r => {
                            const count = ALL_PRODUCTS.filter(p => p.price >= r.min && p.price < r.max).length;
                            return `
                                <div class="dropdown-item price-filter" data-min="${r.min}" data-max="${r.max}" data-label="${r.label}">
                                    <span class="price-label">${r.label}</span>
                                    <span class="product-count">(${count}製品)</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <a href="../about.html" class="nav-link">
                    <i class="fas fa-info-circle"></i> サイトについて
                </a>
            </div>
            
            <!-- モバイルメニューボタン -->
            <button type="button" class="mobile-menu-toggle" aria-label="メニューを開く" aria-expanded="false" aria-controls="nav-menu-panel">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
        </div>
    `;
    
    document.body.insertBefore(nav, document.body.firstChild);
    
    // イベントリスナー設定
    setupNavigationEvents();
    setupScrollBehavior();
}

/**
 * 現在の製品IDを取得
 */
function getCurrentProductId() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
}

/**
 * ナビゲーションのイベントリスナーを設定
 */
function setupNavigationEvents() {
    // ドロップダウントグル
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = toggle.closest('.nav-dropdown');
            const isOpen = dropdown.classList.contains('open');
            
            // 他のドロップダウンを閉じる
            document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
            
            // 現在のドロップダウンをトグル
            if (!isOpen) {
                dropdown.classList.add('open');
            }
        });
    });
    
    // メーカーフィルター → トップページの製品一覧へ
    document.querySelectorAll('.manufacturer-filter').forEach(item => {
        item.addEventListener('click', () => {
            const manufacturer = item.dataset.manufacturer;
            const url = new URL('../index.html', window.location.href);
            url.searchParams.set('manufacturer', manufacturer);
            window.location.href = url.pathname + url.search;
        });
    });
    
    // 価格帯フィルター → トップページの製品一覧へ
    document.querySelectorAll('.price-filter').forEach(item => {
        item.addEventListener('click', () => {
            const url = new URL('../index.html', window.location.href);
            const label = item.dataset.label;
            if (label) {
                url.searchParams.set('price', label);
            } else {
                url.searchParams.set('priceMin', item.dataset.min);
                url.searchParams.set('priceMax', item.dataset.max);
            }
            window.location.href = url.pathname + url.search;
        });
    });
    
    // 外側クリックでドロップダウンを閉じる・モバイルメニューを閉じる
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        if (navMenu && mobileToggle && navMenu.classList.contains('mobile-open')) {
            if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                setMobileNavOpen(false);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu?.classList.contains('mobile-open')) {
            setMobileNavOpen(false);
        }
    });
    
    // モバイルメニュートグル
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const navMenu = document.querySelector('.nav-menu');
            const open = !navMenu.classList.contains('mobile-open');
            setMobileNavOpen(open);
        });
    }
}

function setMobileNavOpen(open) {
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (!navMenu) return;
    navMenu.classList.toggle('mobile-open', open);
    document.body.classList.toggle('nav-mobile-open', open);
    if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        mobileToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
            icon.className = open ? 'fas fa-times' : 'fas fa-bars';
        }
    }
}

/**
 * スクロール時の固定動作を設定
 */
function setupScrollBehavior() {
    let lastScroll = 0;
    const nav = document.getElementById('fixed-navigation');
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        // スクロールダウン時に隠す（オプション - コメント解除で有効化）
        // if (currentScroll > lastScroll && currentScroll > 200) {
        //     nav.classList.add('hidden');
        // } else {
        //     nav.classList.remove('hidden');
        // }
        
        lastScroll = currentScroll;
    });
}

/**
 * 関連製品セクションを作成
 */
function createRelatedProductsSection() {
    const currentProductId = getCurrentProductId();
    const currentProduct = ALL_PRODUCTS.find(p => p.id === currentProductId);
    
    if (!currentProduct) {
        console.warn('現在の製品が見つかりません:', currentProductId);
        return;
    }
    
    // 同メーカー製品（現在の製品を除く）
    const sameManufacturer = ALL_PRODUCTS.filter(p => 
        p.manufacturer === currentProduct.manufacturer && p.id !== currentProductId
    );
    
    // 同価格帯製品（±30%の範囲、現在の製品を除く）
    const priceMin = currentProduct.price * 0.7;
    const priceMax = currentProduct.price * 1.3;
    const samePriceRange = ALL_PRODUCTS.filter(p => 
        p.price >= priceMin && p.price <= priceMax && p.id !== currentProductId
    ).slice(0, 4);
    
    // おすすめ製品（評価順、現在の製品を除く）
    const recommended = [...ALL_PRODUCTS]
        .filter(p => p.id !== currentProductId)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 4);
    
    const section = document.createElement('section');
    section.className = 'related-products-section';
    section.innerHTML = `
        <div class="container">
            <h2 class="section-title">
                <i class="fas fa-lightbulb"></i>
                他の製品も見てみる
            </h2>
            
            ${sameManufacturer.length > 0 ? `
                <div class="related-group">
                    <h3 class="related-subtitle">
                        <i class="fas fa-industry"></i>
                        同じメーカー（${currentProduct.manufacturer}）の製品
                    </h3>
                    <div class="related-products-grid">
                        ${sameManufacturer.map(p => createProductCard(p)).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${samePriceRange.length > 0 ? `
                <div class="related-group">
                    <h3 class="related-subtitle">
                        <i class="fas fa-yen-sign"></i>
                        似た価格帯の製品（¥${Math.round(priceMin).toLocaleString()}〜¥${Math.round(priceMax).toLocaleString()}）
                    </h3>
                    <div class="related-products-grid">
                        ${samePriceRange.map(p => createProductCard(p)).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="related-group">
                <h3 class="related-subtitle">
                    <i class="fas fa-star"></i>
                    高評価の製品
                </h3>
                <div class="related-products-grid">
                    ${recommended.map(p => createProductCard(p)).join('')}
                </div>
            </div>
            
            <div class="view-all-link">
                <a href="../" class="btn-view-all">
                    <i class="fas fa-th"></i>
                    全製品を見る（${ALL_PRODUCTS.length}製品）
                </a>
            </div>
        </div>
    `;
    
    // ページの最後に挿入（フッターの前）
    const footer = document.querySelector('footer');
    if (footer) {
        footer.parentNode.insertBefore(section, footer);
    } else {
        document.body.appendChild(section);
    }
}

/**
 * 製品カードを作成
 */
function createProductCard(product) {
    return `
        <a href="${product.id}.html" class="related-product-card">
            <div class="related-product-info">
                <div class="related-manufacturer">${product.manufacturer}</div>
                <div class="related-name">${product.name}</div>
                <div class="related-meta">
                    <span class="related-price">¥${product.price.toLocaleString()}</span>
                    <span class="related-rating">★${product.rating}</span>
                </div>
            </div>
            <div class="related-arrow">
                <i class="fas fa-arrow-right"></i>
            </div>
        </a>
    `;
}

/**
 * フッターを作成
 */
function createFooter() {
    if (document.querySelector('footer.site-footer')) return;

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.style.cssText = `
        background: #0f172a;
        color: #e2e8f0;
        margin-top: 3rem;
        padding: 2.5rem 1.5rem;
        border-top: 1px solid rgba(148, 163, 184, 0.2);
    `;

    footer.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto;">
            <h2 style="font-size: 1.1rem; margin: 0 0 1rem 0; color: #f8fafc;">運営者情報</h2>
            <div style="display: grid; gap: 0.45rem; line-height: 1.8; font-size: 0.95rem;">
                <p style="margin: 0;"><strong>媒体名:</strong> ナットクLabo</p>
                <p style="margin: 0;"><strong>運営組織:</strong> GBumps</p>
                <p style="margin: 0;"><strong>運営管理責任者:</strong> 代表 岩田 直人</p>
                <p style="margin: 0;"><strong>所在地:</strong> 東京都北区</p>
                <p style="margin: 0;"><strong>お問い合わせ:</strong> <a href="https://nattoku-labo.com/privacy.html" style="color: #93c5fd; text-decoration: underline;">https://nattoku-labo.com/privacy.html</a></p>
                <p style="margin: 0;"><strong>事業内容:</strong> 家電・ガジェットの比較分析メディア運営、Webライティング、コンテンツ制作</p>
            </div>
            <h3 style="font-size: 1.0rem; margin: 1.5rem 0 0.75rem 0; color: #f8fafc;">責任の所在に関する明記</h3>
            <p style="margin: 0; line-height: 1.9; font-size: 0.95rem;">
                本ウェブサイト「ナットクLabo」に掲載されているすべてのコンテンツ（記事執筆、画像制作、データ分析、編集等）は、
                GBumps 代表 岩田直人が全責任を持って制作・管理しております。外部委託を行わず、すべてのプロセスを代表自らが監修・執行することで、
                情報の正確性と中立性の維持に努めています。
            </p>
            <p style="margin: 1.25rem 0 0 0; font-size: 0.85rem; color: #94a3b8;">
                © ${new Date().getFullYear()} ナットクLabo All Rights Reserved.
            </p>
        </div>
    `;

    document.body.appendChild(footer);
}

/**
 * 初期化
 */
function initNavigation() {
    console.log('🚀 ナビゲーションシステム V3.14 初期化');
    createNavigationBar();
    createRelatedProductsSection();
    createFooter();
    console.log('✅ ナビゲーションバー＆関連製品セクション 生成完了');
}

// DOMContentLoaded時に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}
