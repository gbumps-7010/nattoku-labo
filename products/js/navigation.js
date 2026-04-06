/**
 * ナビゲーションバー＆関連製品システム V3.14
 * - 固定ナビゲーションバー（製品ドロップダウン、メーカーフィルター、価格帯フィルター）
 * - 関連製品セクション（同メーカー・同価格帯の製品を自動表示）
 */

// 全製品データ（価格・メーカー情報のみ）
const ALL_PRODUCTS = [
    { id: 'switchbot-k11-plus', name: 'SwitchBot K11+', manufacturer: 'SwitchBot', price: 59800, rating: 4.6 },
    { id: 'roborock-qrevo-l', name: 'Roborock Qrevo L', manufacturer: 'Roborock', price: 79980, rating: 4.7 },
    { id: 'anker-eufy-c10', name: 'Eufy C10 Auto-Empty', manufacturer: 'Anker', price: 59800, rating: 4.7 },
    { id: 'ecovacs-deebot-n20-pro-plus', name: 'DEEBOT N20 PRO PLUS', manufacturer: 'ECOVACS', price: 69800, rating: 4.6 },
    { id: 'roomba-mini-autoempty', name: 'Roomba Mini + AutoEmpty', manufacturer: 'iRobot', price: 44800, rating: 4.65 },
    { id: 'roomba-105-combo', name: 'Roomba 105 Combo', manufacturer: 'iRobot', price: 69800, rating: 4.62 },
    { id: 'roomba-plus-405-combo', name: 'Roomba Plus 405 Combo', manufacturer: 'iRobot', price: 197800, rating: 4.8 },
    { id: 'eufy-robot-vacuum-omni-c28', name: 'Eufy Omni C28', manufacturer: 'Anker', price: 99800, rating: 4.4 },
    { id: 'dreame-l10s-ultra-gen2', name: 'Dreame L10s Ultra Gen2', manufacturer: 'Dreame', price: 56000, rating: 4.7 },
    { id: 'dreame-l40s-pro-ultra', name: 'Dreame L40s Pro Ultra', manufacturer: 'Dreame', price: 188000, rating: 4.5 },
    { id: 'dreame-x50-ultra', name: 'Dreame X50 Ultra', manufacturer: 'Dreame', price: 228000, rating: 4.8 },
    { id: 'ecovacs-deebot-x8-pro-omni', name: 'DEEBOT X8 PRO OMNI', manufacturer: 'ECOVACS', price: 199800, rating: 4.6 },
    { id: 'roomba-plus-505-combo', name: 'Roomba Plus 505 Combo', manufacturer: 'iRobot', price: 69800, rating: 4.6 },
    { id: 'deebot-t80-omni', name: 'DEEBOT T80 OMNI', manufacturer: 'ECOVACS', price: 139800, rating: 4.7 },
    { id: 'deebot-t50-omni', name: 'DEEBOT T50 OMNI', manufacturer: 'ECOVACS', price: 159800, rating: 4.8 },
    { id: 'ecovacs-deebot-mini', name: 'DEEBOT mini', manufacturer: 'ECOVACS', price: 15800, rating: 4.3 },
    { id: 'ecovacs-deebot-t90-omni', name: 'DEEBOT T90 OMNI', manufacturer: 'ECOVACS', price: 149800, rating: 4.8 },
    { id: 'eufy-robot-vacuum-omni-e25', name: 'Eufy Robot Vacuum Omni E25', manufacturer: 'Anker', price: 74800, rating: 4.6 },
    { id: 'eufy-x10-pro-omni', name: 'Eufy X10 Pro Omni', manufacturer: 'Anker', price: 99990, rating: 4.6 },
    { id: 'eufy-robot-vacuum-omni-c20', name: 'Eufy Robot Vacuum Omni C20', manufacturer: 'Anker', price: 89900, rating: 4.6 },
    { id: 'eufy-robot-vacuum-omni-s1-pro', name: 'Eufy Robot Vacuum Omni S1 Pro', manufacturer: 'Anker', price: 199900, rating: 4.6 },
    { id: 'eufy-robovac-g30-hybrid', name: 'Eufy RoboVac G30 Hybrid', manufacturer: 'Anker', price: 29990, rating: 4.5 },
    { id: 'eufy-robovac-g30', name: 'Anker Eufy RoboVac G30', manufacturer: 'Anker', price: 24800, rating: 4.3 },
    { id: 'roomba-max-705-combo-autowash', name: 'Roomba Max 705 Combo + AutoWash', manufacturer: 'iRobot', price: 184800, rating: 4.7 },
    { id: 'roomba-max-705-vac-autoempty', name: 'Roomba Max 705 Vac + AutoEmpty', manufacturer: 'iRobot', price: 79800, rating: 4.6 },
    { id: 'roomba-combo-10-max', name: 'Roomba Combo 10 Max', manufacturer: 'iRobot', price: 197800, rating: 4.6 },
    { id: 'roborock-saros-10r', name: 'Roborock Saros 10R', manufacturer: 'Roborock', price: 149800, rating: 4.8 }
];

// メーカー一覧
const MANUFACTURERS = ['すべて', 'SwitchBot', 'Roborock', 'Anker', 'ECOVACS', 'iRobot', 'Dreame'];

// 価格帯一覧
const PRICE_RANGES = [
    { label: 'すべて', min: 0, max: Infinity },
    { label: '5万円未満', min: 0, max: 50000 },
    { label: '5万〜10万円', min: 50000, max: 100000 },
    { label: '10万〜15万円', min: 100000, max: 150000 },
    { label: '15万円以上', min: 150000, max: Infinity }
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
                <a href="../index.html">
                    <i class="fas fa-chart-line"></i>
                    <span>ナットクLabo</span>
                </a>
            </div>
            
            <div class="nav-menu">
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
                                <div class="dropdown-item price-filter" data-min="${r.min}" data-max="${r.max}">
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
            <button class="mobile-menu-toggle">
                <i class="fas fa-bars"></i>
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
    
    // メーカーフィルター
    document.querySelectorAll('.manufacturer-filter').forEach(item => {
        item.addEventListener('click', () => {
            const manufacturer = item.dataset.manufacturer;
            window.location.href = `../index.html?manufacturer=${encodeURIComponent(manufacturer)}`;
        });
    });
    
    // 価格帯フィルター
    document.querySelectorAll('.price-filter').forEach(item => {
        item.addEventListener('click', () => {
            const min = item.dataset.min;
            const max = item.dataset.max;
            window.location.href = `../index.html?priceMin=${min}&priceMax=${max}`;
        });
    });
    
    // 外側クリックでドロップダウンを閉じる
    document.addEventListener('click', () => {
        document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('open'));
    });
    
    // モバイルメニュートグル
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            document.querySelector('.nav-menu').classList.toggle('mobile-open');
        });
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
                        似た価格帯の製品（¥${Math.round(priceMin/1000)}k〜¥${Math.round(priceMax/1000)}k）
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
                <a href="../index.html" class="btn-view-all">
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
 * 初期化
 */
function initNavigation() {
    console.log('🚀 ナビゲーションシステム V3.14 初期化');
    createNavigationBar();
    createRelatedProductsSection();
    console.log('✅ ナビゲーションバー＆関連製品セクション 生成完了');
}

// DOMContentLoaded時に実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}
