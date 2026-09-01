/**
 * ✅ 製品データ自動ロードシステム V3.2.1 (2026-03-17)
 * - Gemini出力JSONから180項目を完全自動反映
 * - 構文エラーを完全修正
 */

function fp(text) {
    if (!text) return '';
    return typeof formatProse === 'function' ? formatProse(text) : text;
}

// 1. データ読み込み
function getProductId() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    
    if (!productId) {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename;
    }
    
    return productId;
}

async function loadProductData(productId) {
    try {
        const response = await fetch(`data/${productId}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('❌ 製品データの読み込みに失敗:', error);
        return null;
    }
}

function manufacturerKatakana(manufacturer) {
    const m = String(manufacturer || '').trim();
    const map = {
        iRobot: 'アイロボット',
        Roborock: 'ロボロック',
        ECOVACS: 'エコバックス',
        Dreame: 'ドリーミー',
        Anker: 'ユーフィー',
        eufy: 'ユーフィー',
        Eufy: 'ユーフィー',
        SwitchBot: 'スイッチボット',
    };
    return map[m] || m;
}

function manufacturerEnglish(manufacturer) {
    const m = String(manufacturer || '').trim();
    const map = {
        iRobot: 'iRobot',
        Roborock: 'Roborock',
        ECOVACS: 'ECOVACS',
        Dreame: 'Dreame',
        Anker: 'eufy',
        eufy: 'eufy',
        Eufy: 'eufy',
        SwitchBot: 'SwitchBot',
    };
    return map[m] || m;
}

function seoProductLabel(data) {
    let name = String(data.productName || data.productId || '').trim();
    // タイトル先頭のカタカナと重複しやすい接頭辞を整理
    name = name
        .replace(/^ロボット掃除機\s*/u, '')
        .replace(/^お掃除ロボット\s*/u, '')
        .replace(/^Eufy\s+(Clean\s+)?/i, '')
        .replace(/^Robot Vacuum\s+/i, '')
        .replace(/^RoboVac\s+/i, '')
        .replace(/^iRobot\s+/i, '')
        .replace(/^Roborock\s+/i, '')
        .replace(/^ECOVACS\s+/i, '')
        .replace(/^Dreame\s+/i, '')
        .replace(/^SwitchBot\s+/i, '')
        .replace(/^Anker\s+/i, '')
        .trim();
    return name || String(data.productId || '').trim();
}

function buildSeoMetadata(data) {
    const manufacturer = String(data.manufacturer || '').trim();
    const productName = String(data.productName || data.productId).trim();
    const name = manufacturer && !productName.toLowerCase().includes(manufacturer.toLowerCase())
        ? `${manufacturer} ${productName}`
        : productName;
    const kana = manufacturerKatakana(manufacturer);
    const eng = manufacturerEnglish(manufacturer);
    const label = seoProductLabel(data);
    // カタカナ（英語） → ロボット掃除機口コミ比較 → 製品名
    const brandPart = eng ? `${kana}（${eng}）` : kana;
    const title = `${brandPart}｜ロボット掃除機口コミ比較｜${label}`;

    return {
        name,
        title,
        brandPart,
        comparePart: 'ロボット掃除機口コミ比較',
        labelPart: label,
        description: data.metaDescription || `${name}の口コミ統計分析。詳細データを公開。`
    };
}

/** H1を「｜」単位で改行できる構造にし、各ブロック内の変な改行を防ぐ */
function setProductTitleHeading(element, metadata) {
    if (!element || !metadata) return;
    const parts = [
        metadata.brandPart,
        metadata.comparePart,
        metadata.labelPart,
    ].filter(Boolean);
    element.textContent = '';
    parts.forEach((part, idx) => {
        const unit = document.createElement('span');
        unit.className = 'product-title-unit';
        if (idx > 0) {
            const sep = document.createElement('span');
            sep.className = 'product-title-sep';
            sep.setAttribute('aria-hidden', 'true');
            sep.textContent = '｜';
            unit.appendChild(sep);
        }
        const span = document.createElement('span');
        span.className = 'product-title-part';
        span.textContent = part;
        unit.appendChild(span);
        element.appendChild(unit);
    });
}

// 2. メタデータ更新
function updateMetadata(data) {
    const metadata = buildSeoMetadata(data);
    const productUrl = `https://nattoku-labo.com/products/${data.productId}`;
    document.title = metadata.title;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', metadata.description);
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
        ogTitle.setAttribute('content', metadata.title);
    }
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
        ogDesc.setAttribute('content', metadata.description);
    }
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${productUrl}#product`,
        "url": productUrl,
        "name": metadata.name,
        "description": metadata.description,
        "brand": {
            "@type": "Brand",
            "name": data.manufacturer
        },
        "offers": {
            "@type": "Offer",
            "url": productUrl,
            "price": Number(data.price),
            "priceCurrency": "JPY",
            "availability": "https://schema.org/InStock"
        }
    };
    if (data.imageUrl) structuredData.image = data.imageUrl;
    if (data.modelNumber) structuredData.model = data.modelNumber;
    if (data.asin) structuredData.sku = data.asin;
    
    let structuredScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredScript) {
        structuredScript = document.createElement('script');
        structuredScript.type = 'application/ld+json';
        document.head.appendChild(structuredScript);
    }
    structuredScript.textContent = JSON.stringify(structuredData, null, 2);
}

function formatScoreDisplay(n) {
    if (!Number.isFinite(n)) return null;
    return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

function computeOverallScores(data) {
    const perf = data?.performanceAnalysis;
    if (!perf || typeof perf !== 'object') return null;

    const axisKeys = [
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
    for (const key of axisKeys) {
        const node =
            key === 'petHairRemoval'
                ? (perf.petHairRemoval || perf.petHair)
                : key === 'quietness'
                    ? (perf.quietness || perf.nightQuietness)
                    : perf[key];
        const n = Number(node?.score);
        if (Number.isFinite(n)) scores.push(n);
    }

    if (!scores.length) {
        for (const value of Object.values(perf)) {
            const n = Number(value?.score);
            if (Number.isFinite(n)) scores.push(n);
        }
    }
    if (!scores.length) return null;

    const featureAverageScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    const reliability = Number(data.reliabilityScore ?? data.reliability?.score);
    if (!Number.isFinite(reliability)) {
        return { featureAverageScore, overallScore: null };
    }
    const overallScore = Math.round((featureAverageScore * 0.85 + reliability * 0.15) * 10) / 10;
    return { featureAverageScore, overallScore };
}

// 3. data-dynamic 属性更新
function updateDynamicElements(data) {
    const dynamicElements = document.querySelectorAll('[data-dynamic]');
    console.log(`🔍 data-dynamic 要素: ${dynamicElements.length}個検出`);
    
    dynamicElements.forEach(element => {
        const path = element.getAttribute('data-dynamic');
        const value = getNestedValue(data, path);
        
        if (value !== undefined && value !== null) {
            if (element.tagName === 'IMG' && path === 'imageUrl') {
                if (value) {
                    element.src = value;
                    element.alt = data.productName || '製品画像';
                    element.style.display = '';
                    console.log(`✅ 画像更新`);
                } else {
                    element.style.display = 'none';
                    console.log('ℹ️ 画像なし（アフィリエイト画像未設定）→ 非表示');
                }
            } else if (path === 'productName' && element.tagName === 'H1') {
                // ページ見出し（H1）はSEOタイトルを表示（改行位置を制御）
                setProductTitleHeading(element, buildSeoMetadata(data));
            } else if (path === 'price') {
                // 価格を「約」付きでカンマ区切りでフォーマット
                element.textContent = `約¥${value.toLocaleString()}`;
                console.log(`✅ 価格更新: 約¥${value.toLocaleString()}`);
            } else if (path === 'totalReviews') {
                element.textContent = Number(value).toLocaleString();
                console.log(`✅ 総口コミ件数: ${Number(value).toLocaleString()}件`);
            } else if (path === 'overallScore' || path === 'featureAverageScore' || path === 'reliabilityScore') {
                const display = formatScoreDisplay(Number(value));
                element.textContent = display ?? value;
                console.log(`✅ ${path} = ${display ?? value}`);
            } else if (path === 'updateInfo.lastUpdated') {
                element.textContent = formatUpdateDate(value);
                console.log(`✅ データ更新日: ${formatUpdateDate(value)}`);
            } else if (path.includes('percentage')) {
                element.textContent = `${value}%`;
                console.log(`✅ ${path} = ${value}%`);
            } else if (element.tagName === 'A' && path.startsWith('cta.')) {
                // CTA リンクの場合（文字列またはオブジェクト対応）
                const url = typeof value === 'string' ? value : (value.url || value);
                if (url) {
                    element.href = url;
                    console.log(`✅ ${path} = ${url}`);
                }
            } else if (path === 'operationalCost.consumables' && Array.isArray(value)) {
                // 消耗品の詳細リスト表示
                let consumablesHTML = '';
                value.forEach(item => {
                    consumablesHTML += `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem; background: #f8fafc; border-radius: 8px; border-left: 3px solid #0284c7;">
                            <div style="flex: 1;">
                                <p style="font-size: 0.95rem; font-weight: 600; color: #1e293b; margin-bottom: 0.25rem;">${item.item}</p>
                                <p style="font-size: 0.8rem; color: #0f172a; margin: 0;">交換頻度: ${item.replacementFrequency}</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-size: 0.85rem; color: #0f172a; margin-bottom: 0.25rem;">単価: ¥${item.unitCost.toLocaleString()}</p>
                                <p style="font-size: 0.95rem; font-weight: 700; color: #059669; margin: 0;">年間: ¥${item.annualCost.toLocaleString()}</p>
                            </div>
                        </div>
                    `;
                });
                element.innerHTML = consumablesHTML;
                console.log(`✅ 消耗品リスト ${value.length}項目 表示完了`);
            } else if (typeof value === 'object') {
                // オブジェクトの場合はスキップ
                console.log(`⏩ ${path} (オブジェクト)`);
            } else {
                element.textContent = value;
                console.log(`✅ ${path} = ${value}`);
            }
        }
    });
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

// 4. 基本情報更新
function updateBasicInfo(data) {
    const breadcrumbCurrent = document.querySelector('.breadcrumb-current');
    if (breadcrumbCurrent && data.productName) {
        breadcrumbCurrent.textContent = data.productName;
    }

    const productTitle = document.querySelector('h1.product-title, .product-header h1.product-title');
    if (productTitle) setProductTitleHeading(productTitle, buildSeoMetadata(data));
    
    const productImage = document.querySelector('.product-image-header');
    if (productImage) {
        if (data.imageUrl) {
            productImage.src = data.imageUrl;
            productImage.alt = data.productName;
            productImage.style.display = '';
        } else {
            productImage.style.display = 'none';
        }
    }
    
    // 総合点ブロック（機能平均点 × 0.85 ＋ 口コミ信頼度 × 0.15）
    const scores = computeOverallScores(data);
    const hero = document.getElementById('overallScoreHero');
    if (scores && hero) {
        data.featureAverageScore = scores.featureAverageScore;
        if (scores.overallScore != null) data.overallScore = scores.overallScore;
        const overallEl = hero.querySelector('[data-dynamic="overallScore"]');
        const featureEl = hero.querySelector('[data-dynamic="featureAverageScore"]');
        const relEl = hero.querySelector('[data-dynamic="reliabilityScore"]');
        if (overallEl && scores.overallScore != null) {
            overallEl.textContent = formatScoreDisplay(scores.overallScore);
        }
        if (featureEl) {
            featureEl.textContent = formatScoreDisplay(scores.featureAverageScore);
        }
        if (relEl) {
            const rel = Number(data.reliabilityScore ?? data.reliability?.score);
            if (Number.isFinite(rel)) relEl.textContent = formatScoreDisplay(rel);
        }
        console.log(
            `✅ 総合点 ${formatScoreDisplay(scores.overallScore)}（機能平均 ${formatScoreDisplay(scores.featureAverageScore)} ×0.85 ＋ 信頼度 ${data.reliabilityScore} ×0.15）`
        );
    } else if (hero && !scores) {
        hero.style.display = 'none';
    }
}

// 5. 性能分析更新
function updatePerformanceData(data) {
    const perfData = data.performanceAnalysis;
    if (!perfData) return;
    
    // radarChart または radarChartData フィールドに対応
    const radarData = data.radarChart || data.radarChartData;
    if (radarData) {
        window.radarChartData = {
            labels: radarData.labels,
            values: radarData.values
        };
        console.log('✅ レーダーチャートデータ設定完了:', radarData);
    } else {
        console.warn('⚠️ レーダーチャートデータが見つかりません');
    }
    
    window.performanceScores = {
        floorCleaning: perfData.floorCleaning?.score || 0,
        carpetCleaning: perfData.carpetCleaning?.score || 0,
        petHair: (perfData.petHair || perfData.petHairRemoval)?.score || 0,
        nightQuietness: (perfData.nightQuietness || perfData.quietness)?.score || 0,
        stepClimbing: perfData.stepClimbing?.score || 0,
        maintenance: perfData.maintenance?.score || 0,
        appStability: perfData.appStability?.score || 0,
        batteryLife: perfData.batteryLife?.score || 0
    };
    
    updatePerformanceCards(perfData);
}

function updatePerformanceCards(perfData) {
    const perfMapping = [
        { keys: ['floorCleaning'], label: 'フローリング清掃' },
        { keys: ['carpetCleaning'], label: 'カーペット清掃' },
        { keys: ['petHair', 'petHairRemoval'], label: 'ペット毛対応' },
        { keys: ['nightQuietness', 'quietness'], label: '静音性（夜間）' },
        { keys: ['stepClimbing'], label: '段差乗り越え' },
        { keys: ['maintenance'], label: 'メンテナンス性' },
        { keys: ['appStability'], label: 'アプリ安定性' },
        { keys: ['batteryLife'], label: 'バッテリー持続' }
    ];
    
    const detailsGrid = document.querySelector('.performance-details-grid');
    
    if (detailsGrid && perfData) {
        const html = perfMapping.map(item => {
            // 複数キーに対応（petHair/petHairRemoval, quietness/nightQuietnessなど）
            let data = null;
            for (const key of item.keys) {
                if (perfData[key]) {
                    data = perfData[key];
                    break;
                }
            }
            if (!data) return '';
            
            const score = data.score;
            const scoreClass = score >= 80 ? 'high-score' : (score >= 60 ? 'medium-score' : 'low-score');
            
            return `
                <div class="performance-detail-card ${scoreClass}">
                    <h4>${item.label}: ${score}/100点</h4>
                    <p class="rank-badge">${data.reviewCount}件の口コミから算出</p>
                    <p>${fp(data.comment || '詳細評価情報なし')}</p>
                </div>
            `;
        }).join('');
        
        detailsGrid.innerHTML = html;
    }
}

// 7. キーワード更新（Chart.jsで描画するため、この関数は不要）
function updateReviewKeywords(data) {
    // Chart.jsがキーワードを横棒グラフとして描画するため、
    // ここでは何もしない
    console.log('✅ キーワードはChart.jsで描画されます');
}

// 7.5. データ信頼性（DRI 2.0）更新
// 理論: 信頼度 = 口コミ件数(配点60) + 意見一致度(配点30) + 鮮度(配点10)
//   各要素の0-100スコアを配点に換算して表示（例: 十分性77点→46.2/60点）
function reliabilityWeightedPoints(raw, maxPts) {
    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    const pts = Math.round(n * maxPts / 100 * 10) / 10;
    return pts;
}

function formatReliabilityPoints(raw, maxPts) {
    const pts = reliabilityWeightedPoints(raw, maxPts);
    if (pts == null) return '—';
    return Number.isInteger(pts) ? String(pts) : pts.toFixed(1);
}

function renderReliabilityFactors(rel) {
    const host = document.getElementById('reliability-factors');
    if (!host) return;

    const cards = [
        {
            tone: 'adequacy',
            title: '口コミ件数の十分さ',
            weight: '重要度 60%',
            hint: '口コミの件数が多いほど、分析の信頼度は高くなります。',
            maxPts: 60,
            scoreAttr: 'reliability.dataAdequacy.score',
            descAttr: 'reliability.dataAdequacy.description',
            score: formatReliabilityPoints(
                rel.dataAdequacy?.score ?? rel.dataAdequacy?.percentage,
                60,
            ),
            description:
                fp(rel.dataAdequacy?.description ||
                rel.dataAdequacy?.note ||
                ''),
        },
        {
            tone: 'consistency',
            title: '口コミの意見の一致度',
            weight: '重要度 30%',
            hint: '高評価・低評価ともに、多くの口コミが同じ論点に集まるほど高得点です。',
            maxPts: 30,
            scoreAttr: 'reliability.consistency.percentage',
            descAttr: 'reliability.consistency.description',
            score: formatReliabilityPoints(
                rel.consistency?.percentage ?? rel.consistency?.score,
                30,
            ),
            description:
                fp(rel.consistency?.description ||
                rel.consistency?.note ||
                ''),
        },
        {
            tone: 'freshness',
            title: '口コミの鮮度',
            weight: '重要度 10%',
            hint: '新しい口コミが多いほど、いまの製品品質やサポート状況を反映しやすいです。',
            maxPts: 10,
            scoreAttr: 'reliability.freshness.score',
            descAttr: 'reliability.freshness.description',
            score: formatReliabilityPoints(
                rel.freshness?.score ?? rel.freshness?.percentage,
                10,
            ),
            description:
                fp(rel.freshness?.description ||
                rel.freshness?.note ||
                ''),
        },
    ];

    host.innerHTML = cards
        .map(
            (card) => `
        <article class="reliability-factor-card reliability-factor-${card.tone}">
            <h3 class="reliability-factor-title">${card.title}</h3>
            <span class="reliability-weight-badge">${card.weight}</span>
            <p class="reliability-factor-hint">${card.hint}</p>
            <div class="reliability-factor-score">
                <span data-dynamic="${card.scoreAttr}">${card.score}</span>
                <span class="reliability-factor-denom">/ ${card.maxPts}点</span>
            </div>
            <p class="reliability-factor-desc" data-dynamic="${card.descAttr}">${fp(card.description)}</p>
        </article>
    `,
        )
        .join('');
}

function updateReliability(data) {
    if (!data.reliability) return;

    const rel = data.reliability;

    const scoreEl = document.querySelector('[data-dynamic="reliability.score"]');
    if (scoreEl && rel.score !== undefined) {
        scoreEl.textContent = Number(rel.score).toFixed(1);
    }

    renderReliabilityFactors(rel);
}

function formatUpdateDate(value) {
    const raw = String(value || '').trim();
    const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return raw;
    return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

// 7.6. 更新情報更新
function updateUpdateInfo(data) {
    if (!data.updateInfo) return;
    
    const ui = data.updateInfo;
    
    // 最終更新日（ヒーロー＋信頼度セクションなど複数箇所）
    if (ui.lastUpdated) {
        const formatted = formatUpdateDate(ui.lastUpdated);
        document.querySelectorAll('[data-dynamic="updateInfo.lastUpdated"]').forEach((el) => {
            el.textContent = formatted;
        });
    }
    
    // ステータスバッジ
    const badgeEl = document.querySelector('[data-dynamic="updateInfo.badge"]');
    if (badgeEl && ui.isLatest !== undefined) {
        if (ui.isLatest) {
            badgeEl.innerHTML = '<i class="fas fa-check-circle"></i> 最新対応済';
            badgeEl.style.background = '#dcfce7';
            badgeEl.style.color = '#166534';
        } else {
            badgeEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> 更新推奨';
            badgeEl.style.background = '#fef3c7';
            badgeEl.style.color = '#92400e';
        }
    }
    
    // 注記
    if (ui.note) {
        const noteEl = document.querySelector('[data-dynamic="updateInfo.note"]');
        if (noteEl) noteEl.textContent = ui.note;
        
        const containerEl = document.querySelector('[data-dynamic="updateInfo.note-container"]');
        if (containerEl) containerEl.style.display = 'block';
    }
}

// 7.7. 創出時間（タイムセービング）更新
function updateTimeSaving(data) {
    if (!data.timeSaving) return;
    
    const ts = data.timeSaving;
    
    // 日次分数
    const dailyMinutesEls = document.querySelectorAll('[data-dynamic="timeSaving.dailyMinutes"]');
    dailyMinutesEls.forEach(el => {
        if (ts.dailyMinutes !== undefined) {
            el.textContent = ts.dailyMinutes;
        }
    });

    const vacuumMinutesEls = document.querySelectorAll('[data-dynamic="timeSaving.vacuumMinutes"]');
    vacuumMinutesEls.forEach(el => {
        if (ts.vacuumMinutes !== undefined) {
            el.textContent = ts.vacuumMinutes;
        }
    });

    const mopMinutesEls = document.querySelectorAll('[data-dynamic="timeSaving.mopMinutes"]');
    mopMinutesEls.forEach(el => {
        if (ts.mopMinutes !== undefined) {
            el.textContent = ts.mopMinutes;
        }
    });
    
    // 月次時間
    const monthlyHoursEls = document.querySelectorAll('[data-dynamic="timeSaving.monthlyHours"]');
    monthlyHoursEls.forEach(el => {
        if (ts.monthlyHours !== undefined) {
            el.textContent = ts.monthlyHours;
        }
    });
    
    // 年間時間
    const annualHoursEls = document.querySelectorAll('[data-dynamic="timeSaving.annualHours"]');
    annualHoursEls.forEach(el => {
        if (ts.annualHours !== undefined) {
            el.textContent = ts.annualHours;
        }
    });
    
    // 労働日換算
    const workDaysEls = document.querySelectorAll('[data-dynamic="timeSaving.workDaysEquivalent"]');
    workDaysEls.forEach(el => {
        if (ts.workDaysEquivalent !== undefined) {
            el.textContent = ts.workDaysEquivalent;
        }
    });
}

// 7.8. 運用コスト更新
function updateOperationalCost(data) {
    if (!data.operationalCost) return;
    
    const oc = data.operationalCost;
    
    // 年間時間創出価値
    const annualValueEl = document.querySelector('[data-dynamic="operationalCost.annualTimeSavingValue"]');
    if (annualValueEl && oc.annualTimeSavingValue) {
        annualValueEl.textContent = oc.annualTimeSavingValue;
    }
    
    // 日次コスト
    const dailyEl = document.querySelector('[data-dynamic="operationalCost.daily"]');
    if (dailyEl && oc.daily !== undefined) {
        dailyEl.textContent = oc.daily.toLocaleString();
    }
    
    const dailyNoteEl = document.querySelector('[data-dynamic="operationalCost.dailyNote"]');
    if (dailyNoteEl && oc.dailyNote) {
        dailyNoteEl.textContent = oc.dailyNote;
    }
    
    // 月次コスト
    const monthlyEl = document.querySelector('[data-dynamic="operationalCost.monthly"]');
    if (monthlyEl && oc.monthly !== undefined) {
        monthlyEl.textContent = oc.monthly.toLocaleString();
    }
    
    const monthlyOutsourcingEl = document.querySelector('[data-dynamic="operationalCost.monthlyOutsourcing"]');
    if (monthlyOutsourcingEl && oc.monthlyOutsourcing !== undefined) {
        monthlyOutsourcingEl.textContent = oc.monthlyOutsourcing.toLocaleString();
    }
    
    // 年次コスト
    const annualEl = document.querySelector('[data-dynamic="operationalCost.annual"]');
    if (annualEl && oc.annual !== undefined) {
        annualEl.textContent = oc.annual.toLocaleString();
    }
    
    const annualOutsourcingEl = document.querySelector('[data-dynamic="operationalCost.annualOutsourcing"]');
    if (annualOutsourcingEl && oc.annualOutsourcing !== undefined) {
        annualOutsourcingEl.textContent = oc.annualOutsourcing.toLocaleString();
    }
    
    // ROI説明
    const roiDescEl = document.querySelector('[data-dynamic="operationalCost.roiDescription"]');
    if (roiDescEl && oc.roiDescription) {
        roiDescEl.innerHTML = fp(oc.roiDescription);
    }
    
    // 消耗品リスト
    if (oc.consumables && Array.isArray(oc.consumables)) {
        const listContainer = document.querySelector('[data-dynamic="operationalCost.consumables"]');
        if (listContainer) {
            const html = oc.consumables.map(item => `
                <div class="consumable-item">
                    <div class="consumable-name">
                        <i class="fas fa-box" style="color: #0f172a; margin-right: 0.5rem;"></i>
                        ${item.item}
                    </div>
                    <div class="consumable-details">
                        <span class="consumable-frequency">${item.replacementFrequency}</span>
                        <span class="consumable-cost">¥${item.unitCost.toLocaleString()}</span>
                        <span style="color: #0f172a; font-size: 0.8rem;">(年間 ¥${item.annualCost.toLocaleString()})</span>
                    </div>
                </div>
            `).join('');
            listContainer.innerHTML = html;
        }
    }
}

// 8. 不満点更新（強化版：運用成功率向上対策）
function updateSuccessStrategies(data) {
    // 新フォーマット（successStrategies）と旧フォーマット（topComplaints）の両方に対応
    const strategies = data.successStrategies || data.topComplaints;
    if (!strategies) return;
    
    const container = document.querySelector('.success-strategies, .problems-grid');
    if (!container) return;
    
    const html = strategies.map((item, index) => {
        const rank = item.rank || (index + 1);
        const occurrenceCount = item.occurrenceCount || item.reviewCount || item.count || 0;
        
        // 環境要因バッジ
        const envFactorHTML = item.environmentalFactor ? 
            `<span class="environmental-factor-badge">
                <i class="fas fa-info-circle"></i> ${item.environmentalFactor}
            </span>` : '';
        
        // 技術的説明
        const technicalDesc = item.technicalDescription || item.description || '';
        
        // 回避策の処理（新形式・旧形式両対応）
        let solutionsHTML = '';
        if (item.avoidanceStrategies && Array.isArray(item.avoidanceStrategies)) {
            // 新形式：技術的根拠を含む詳細な回避策
            solutionsHTML = item.avoidanceStrategies.map(strategy => {
                const effectivenessClass = strategy.effectiveness === '高' ? 'effectiveness-high' : 'effectiveness-medium';
                return `
                    <div class="technical-solution">
                        <div class="solution-header">
                            <div class="solution-method-name">
                                <i class="fas fa-circle-check" style="color: #10b981;"></i>
                                ${strategy.method}
                            </div>
                            <div class="solution-badges">
                                <span class="effectiveness-badge ${effectivenessClass}">
                                    ${strategy.effectiveness === '高' ? '◎ とても効果的' : '○ 効果あり'}
                                </span>
                                <span class="technical-level-badge">
                                    <i class="fas fa-user"></i>
                                    ${strategy.technicalLevel}
                                </span>
                            </div>
                        </div>
                        ${strategy.technicalLevelDescription ? `
                            <p style="color: #0f172a; font-size: 0.85rem; line-height: 1.6; margin: 0.5rem 0;">
                                <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                                ${fp(strategy.technicalLevelDescription)}
                            </p>
                        ` : ''}
                        ${strategy.detailedSteps ? `
                            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-top: 0.75rem;">
                                <div style="font-weight: 600; color: #334155; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                    <i class="fas fa-list-check"></i> 具体的な手順
                                </div>
                                <p style="color: #1e293b; font-size: 0.9rem; line-height: 1.7; margin: 0; white-space: pre-line;">
                                    ${fp(strategy.detailedSteps)}
                                </p>
                            </div>
                        ` : ''}
                        ${strategy.expectedResult ? `
                            <div style="margin-top: 0.75rem; padding: 0.75rem; background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%); border-left: 3px solid #3b82f6; border-radius: 4px;">
                                <div style="font-weight: 600; color: #1e40af; margin-bottom: 0.25rem; font-size: 0.85rem;">
                                    <i class="fas fa-bullseye"></i> 期待される結果
                                </div>
                                <p style="color: #1e40af; font-size: 0.85rem; line-height: 1.6; margin: 0;">
                                    ${fp(strategy.expectedResult)}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else if (Array.isArray(item.solutions)) {
            // 旧形式：単純な文字列配列
            solutionsHTML = `<ul style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
                ${item.solutions.map(s => `<li>${s}</li>`).join('')}
            </ul>`;
        } else if (item.solution) {
            // 旧形式：文字列をsplit
            const solutions = item.solution.split(/[。\n]/).filter(s => s.trim().length > 0);
            solutionsHTML = `<ul style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
                ${solutions.map(s => `<li>${s.trim()}。</li>`).join('')}
            </ul>`;
        }
        
        // 予防ポイント
        let preventionHTML = '';
        if (item.preventionTips) {
            if (Array.isArray(item.preventionTips)) {
                preventionHTML = `
                    <div class="prevention-note">
                        <div class="prevention-note-title">
                            <i class="fas fa-shield-halved"></i>
                            事前に知っておくと安心
                        </div>
                        <ul style="color: #1e40af; font-size: 0.9rem; line-height: 1.7; margin: 0.5rem 0 0 1.5rem; padding: 0;">
                            ${item.preventionTips.map(tip => `<li>${tip}</li>`).join('')}
                        </ul>
                    </div>
                `;
            } else {
                preventionHTML = `
                    <div class="prevention-note">
                        <div class="prevention-note-title">
                            <i class="fas fa-shield-halved"></i>
                            事前に知っておくと安心
                        </div>
                        <p style="color: #1e40af; font-size: 0.9rem; line-height: 1.7; margin: 0;">
                            ${item.preventionTips}
                        </p>
                    </div>
                `;
            }
        }
        
        return `
        <div class="problem-card">
            <span class="problem-rank">お悩み ${rank}</span>
            <h3 class="problem-title">${item.complaint || item.issue || item.title || 'データなし'}</h3>
            <p class="problem-percentage">${item.percentage || item.occurrenceRate}% の方が経験</p>
            ${envFactorHTML}
            ${technicalDesc ? `<p class="problem-description prose-warn" style="margin-top: 1rem;">${fp(technicalDesc)}</p>` : ''}
            <div class="solutions" style="margin-top: 1.5rem;">
                <h4 style="font-weight: 700; color: #10b981; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-circle-check"></i>
                    うまく使えている方のコツ
                </h4>
                ${solutionsHTML}
            </div>
            ${preventionHTML}
        </div>
        `;
    }).join('');
    
    container.innerHTML = html;
}

// 旧updateTopComplaints関数（後方互換性のため残す）
function updateTopComplaints(data) {
    const complaints = data.topComplaints;
    if (!complaints) return;
    
    console.log(`✅ topComplaints データ: ${complaints.length}件`);
    
    // より具体的なセレクタを使用（success-strategiesではないproblems-grid）
    const container = document.querySelector('.problems-grid.complaints-list') || 
                      document.querySelector('.top-complaints') ||
                      document.querySelector('.problems-grid:not(.success-strategies)');
    if (container) {
        console.log(`✅ topComplaints コンテナ見つかりました`);
        const html = complaints.map((item, index) => {
            // 重要度判定（発生率で判定）
            let importanceBadge = '';
            let cardClass = 'problem-card';
            
            if (item.percentage >= 10) {
                importanceBadge = '<span class="importance-badge critical">重要度：高</span>';
                cardClass = 'problem-card critical-issue';
            } else if (item.percentage >= 5) {
                importanceBadge = '<span class="importance-badge high">重要度：中</span>';
                cardClass = 'problem-card high-issue';
            } else if (item.percentage >= 3) {
                importanceBadge = '<span class="importance-badge medium">注意</span>';
                cardClass = 'problem-card medium-issue';
            }
            
            // solutionsが配列の場合と文字列の場合に対応
            let solutionHTML = '';
            if (Array.isArray(item.solutions)) {
                solutionHTML = item.solutions.filter(s => String(s).trim()).map(s => `<li>${s}</li>`).join('');
            } else if (item.solution && String(item.solution).trim()) {
                const solutions = item.solution.split(/[。\n]/).filter(s => s.trim().length > 0);
                solutionHTML = solutions.map(s => `<li>${s.trim()}。</li>`).join('');
            }
            
            // reviewCountとcountの両方に対応
            const reviewCount = item.reviewCount || item.count || 0;
            const pct = item.percentage != null ? item.percentage : 0;
            
            // titleとcomplaintの両方に対応
            const title = item.complaint || item.title || 'データなし';
            
            return `
            <div class="${cardClass}">
                <div class="complaint-stats-hero" style="display:flex;align-items:baseline;gap:0.65rem;margin-bottom:0.85rem;padding:0.75rem 1rem;background:linear-gradient(135deg,#fef2f2 0%,#fff1f2 100%);border:2px solid #fecaca;border-radius:10px;">
                    <span style="font-size:2rem;font-weight:900;color:#dc2626;line-height:1;">${pct}%</span>
                    <span style="font-size:1.05rem;font-weight:700;color:#991b1b;">（${reviewCount}件）</span>
                </div>
                ${importanceBadge}
                <h3 class="problem-title">${title}</h3>
                ${item.details || item.description ? `<p class="problem-description prose-warn">${fp(item.details || item.description)}</p>` : ''}
                ${solutionHTML ? `
                <div class="solutions">
                    <h4 style="font-weight: 700; margin-bottom: 0.75rem;">対策</h4>
                    <ul style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
                        ${solutionHTML}
                    </ul>
                </div>` : ''}
            </div>
        `}).join('');
        container.innerHTML = html;
        console.log(`✅ topComplaints ${complaints.length}件 表示完了`);
    } else {
        console.warn('⚠️ topComplaints コンテナが見つかりません');
    }
}

// 9. 属性スコア更新
function updateAttributeScores(data) {
    if (!data.attributeScores) return;
    
    const sections = {
        petOwner: { selector: '[data-attribute="petOwner"]', fields: [
            { key: 'suctionPower', altKey: 'suction', label: '吸引力' },
            { key: 'noiseLevel', altKey: 'odorControl', altKey2: 'odor', label: '静音性/臭い対策' },
            { key: 'easeOfMaintenance', altKey: 'maintenance', label: 'メンテ性' },
            { key: 'petSafety', label: 'ペット安全' }
        ]},
        apartment: { selector: '[data-attribute="apartment"]', fields: [
            { key: 'quietOperation', altKey: 'noise', label: '静音性' },
            { key: 'compactSize', altKey: 'size', altKey2: 'sizeSuitability', label: 'サイズ適合' },
            { key: 'storageSpace', altKey: 'obstacle', altKey2: 'obstacleHandling', label: '収納スペース' },
            { key: 'neighborConsideration', label: '近隣への配慮' }
        ]},
        workingProfessional: { selector: '[data-attribute="workingProfessional"]', fields: [
            { key: 'automationLevel', altKey: 'schedule', altKey2: 'scheduleCompatibility', label: '自動化レベル' },
            { key: 'appUsability', altKey: 'app', label: 'アプリ使いやすさ' },
            { key: 'timeSaving', altKey: 'automation', altKey2: 'automationFeatures', label: '時短効果' },
            { key: 'remoteControl', label: 'リモート操作' }
        ]},
        familyHome: { selector: '[data-attribute="familyHome"]', fields: [
            { key: 'coverageArea', altKey: 'range', altKey2: 'areaCoverage', label: 'カバーエリア' },
            { key: 'batteryPerformance', altKey: 'battery', altKey2: 'batteryDuration', label: 'バッテリー性能' },
            { key: 'multiRoomSupport', altKey: 'multifloor', altKey2: 'multiFloorSupport', label: '複数部屋対応' },
            { key: 'childSafety', label: '子供の安全' }
        ]}
    };
    
    Object.keys(sections).forEach(key => {
        const attrData = data.attributeScores[key];
        if (!attrData) return;
        
        const section = document.querySelector(sections[key].selector);
        if (!section) return;
        
        const overallEl = section.querySelector('.attribute-overall-score');
        if (overallEl) {
            overallEl.textContent = attrData.overall;
            // スコアに応じて色を変更
            if (attrData.overall >= 90) {
                overallEl.style.color = '#10b981';  // 緑
            } else if (attrData.overall >= 80) {
                overallEl.style.color = '#2563eb';  // 青
            } else if (attrData.overall >= 70) {
                overallEl.style.color = '#f59e0b';  // オレンジ
            } else {
                overallEl.style.color = '#ef4444';  // 赤
            }
        }
        
        const detailsEl = section.querySelector('.attribute-details');
        if (detailsEl) {
            let html = '';
            
            // details配列形式のデータをサポート（新形式）
            if (attrData.details && Array.isArray(attrData.details)) {
                html = attrData.details.map(item => {
                    const score = item.score;
                    
                    // スコアに応じて色とアイコンを変更
                    let scoreColor = '#64748b';
                    let scoreIcon = '○';
                    if (score >= 90) {
                        scoreColor = '#10b981';
                        scoreIcon = '◎';
                    } else if (score >= 80) {
                        scoreColor = '#2563eb';
                        scoreIcon = '○';
                    } else if (score >= 70) {
                        scoreColor = '#f59e0b';
                        scoreIcon = '△';
                    } else {
                        scoreColor = '#ef4444';
                        scoreIcon = '×';
                    }
                    
                    const commentText = item.comment || 
                        (item.reviewCount ? `実数${item.reviewCount}件の口コミから算出` : '');
                    
                    return `
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; border-left: 4px solid ${scoreColor};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 700; color: #1e293b;">${scoreIcon} ${item.attribute || item.field}</span>
                                <span style="font-size: 1.3rem; font-weight: 900; color: ${scoreColor};">${score}</span>
                            </div>
                            ${commentText ? `<p style="font-size: 0.85rem; color: #1e293b; margin: 0; line-height: 1.5;">${fp(commentText)}</p>` : ''}
                        </div>
                    `;
                }).join('');
            }
            // 旧形式のフィールド別データをサポート（後方互換）
            else {
                html = sections[key].fields.map(field => {
                    // keyまたはaltKey、altKey2で値を取得
                    const value = attrData[field.key] || attrData[field.altKey] || attrData[field.altKey2];
                    if (value === undefined || value === null) return '';
                    
                    // valueが数値の場合、オブジェクト形式に変換
                    const fieldData = typeof value === 'number' ? { score: value } : value;
                    
                    // スコアに応じて色とアイコンを変更
                    let scoreColor = '#64748b';
                    let scoreIcon = '○';
                    const score = fieldData.score || fieldData;
                    if (score >= 90) {
                        scoreColor = '#10b981';
                        scoreIcon = '◎';
                    } else if (score >= 80) {
                        scoreColor = '#2563eb';
                        scoreIcon = '○';
                    } else if (score >= 70) {
                        scoreColor = '#f59e0b';
                        scoreIcon = '△';
                    } else {
                        scoreColor = '#ef4444';
                        scoreIcon = '×';
                    }
                    
                    // commentがない場合は、reviewCountを表示
                    const commentText = fieldData.comment || 
                        (fieldData.reviewCount ? `実数${fieldData.reviewCount}件の口コミから算出` : '');
                    
                    return `
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; border-left: 4px solid ${scoreColor};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 700; color: #1e293b;">${scoreIcon} ${field.label}</span>
                                <span style="font-size: 1.3rem; font-weight: 900; color: ${scoreColor};">${score}</span>
                            </div>
                            ${commentText ? `<p style="font-size: 0.85rem; color: #1e293b; margin: 0; line-height: 1.5;">${fp(commentText)}</p>` : ''}
                        </div>
                    `;
                }).filter(html => html !== '').join('');
            }
            
            detailsEl.innerHTML = html;
            console.log(`✅ ${key} の詳細項目 ${html ? html.split('<div').length - 1 : 0}個 表示完了`);
        }
        
        // コメント（overall配下）
        const commentEl = section.querySelector('.attribute-comment');
        if (commentEl && attrData.comment) {
            commentEl.innerHTML = fp(attrData.comment);
        }
    });
}

// 10. データ品質更新
function updateDataQuality(data) {
    const dq = data.dataQuality;
    if (!dq) return;
    
    const totalEl = document.querySelector('[data-dynamic="dataQuality.totalReviews"]');
    if (totalEl) totalEl.textContent = dq.totalReviews || 0;
    
    const adoptedEl = document.querySelector('[data-dynamic="dataQuality.adoptedReviews"]');
    if (adoptedEl) adoptedEl.textContent = dq.adoptedReviews || 0;
    
    const excludedEl = document.querySelector('[data-dynamic="dataQuality.excludedReviews"]');
    if (excludedEl) excludedEl.textContent = dq.excludedReviews || 0;
    
    const trustScoreEl = document.querySelector('[data-dynamic="dataQuality.trustScore"]');
    if (trustScoreEl && dq.trustScore !== undefined) {
        trustScoreEl.textContent = dq.trustScore.toFixed(2);
    }
}

// 11. リセールバリュー更新
function updateResaleValue(data) {
    const resale = data.resaleValue;
    if (!resale) return;
    
    const newPriceEl = document.querySelector('.resale-new-price');
    if (newPriceEl) newPriceEl.textContent = `約¥${resale.newPrice.toLocaleString()}`;
    
    const usedMinEl = document.querySelector('.resale-used-min');
    if (usedMinEl) usedMinEl.textContent = `約¥${resale.usedMin.toLocaleString()}`;
    
    const usedMaxEl = document.querySelector('.resale-used-max');
    if (usedMaxEl) usedMaxEl.textContent = `約¥${resale.usedMax.toLocaleString()}`;
}

// 12. CTAボタン更新
function updateCTAButtons(data) {
    const cta = data.cta;
    if (!cta) return;
    
    // Amazon
    if (cta.amazon) {
        const btn = document.querySelector('a[href*="amazon"]');
        if (btn) {
            btn.href = typeof cta.amazon === 'string' ? cta.amazon : cta.amazon.url;
            console.log('✅ Amazon CTA更新:', btn.href);
        }
    }
    
    // 楽天
    if (cta.rakuten) {
        const btn = document.querySelector('a[href*="rakuten"]');
        if (btn) {
            btn.href = typeof cta.rakuten === 'string' ? cta.rakuten : cta.rakuten.url;
            console.log('✅ 楽天 CTA更新:', btn.href);
        }
    }
    
    // Yahoo
    if (cta.yahoo) {
        const btn = document.querySelector('a[href*="yahoo"]');
        if (btn) {
            btn.href = typeof cta.yahoo === 'string' ? cta.yahoo : cta.yahoo.url;
            console.log('✅ Yahoo CTA更新:', btn.href);
        }
    }
    
    // ヨドバシ（削除済み - 2026-03-26）
    // if (cta.yodobashi) {
    //     const btn = document.querySelector('a[href*="yodobashi"]');
    //     if (btn) {
    //         btn.href = typeof cta.yodobashi === 'string' ? cta.yodobashi : cta.yodobashi.url;
    //         console.log('✅ ヨドバシ CTA更新:', btn.href);
    //     }
    // }
}

// 12.5 アフィリエイト注入（もしも「かんたんリンク」/ 直販リンクのHTMLウィジェット）
//   innerHTMLで挿入した<script>は実行されないため、<script>を作り直して再実行する。
function injectHtmlWithScripts(container, htmlStr) {
    container.innerHTML = htmlStr || '';
    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach(old => {
        const s = document.createElement('script');
        if (old.src) {
            s.src = old.src;
        } else {
            s.textContent = old.textContent;
        }
        if (old.type) s.type = old.type;
        old.parentNode.replaceChild(s, old);
    });
}

// もしものbundle.js URLをhttps固定化（//... のままだとfile/混在で失敗することがある）
function normalizeMoshimoEasyLinkHtml(html) {
    if (typeof html !== 'string') return html;
    return html.replace(
        /(["'])\/\/dn\.msmstatic\.com\/site\/cardlink\/bundle\.js/g,
        '$1https://dn.msmstatic.com/site/cardlink/bundle.js',
    );
}

// もしも「かんたんリンク」は配布HTMLが document.currentScript に依存するため、
//   メイン文書へ動的appendしたscriptでは currentScript=null となり「リンク」プレースホルダのまま
//   描画されないことがある。iframe(srcdoc)内でmarkupとして解析・実行させて確実に描画する。
//   各iframeは独立コンテキストなので、2枠並べてもeid(id)衝突は起きない。
function injectMoshimoIframe(container, html) {
    if (!container || !html) return;
    container.innerHTML = '';
    const safe = normalizeMoshimoEasyLinkHtml(html);
    const iframe = document.createElement('iframe');
    iframe.title = '価格・購入先（もしもアフィリエイト）';
    iframe.setAttribute('scrolling', 'no');
    // もしも cardlink は viewport<704px で縮小レイアウトになる。
    // 画像枠(.easyLink-img-box)を240px固定し、flexで潰さない（リンクHTML自体は変更しない）。
    iframe.srcdoc =
        '<!DOCTYPE html><html><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width,initial-scale=1">' +
        '<base target="_blank" rel="noopener noreferrer">' +
        '<style>' +
        '*,*::before,*::after{box-sizing:border-box}' +
        'html,body{width:100%;margin:0;padding:0;background:#fff;color:#0f172a;overflow-x:hidden}' +
        'body{display:block}' +
        '[id^="msmaflink-"]{width:100%!important;max-width:100%!important}' +
        'div.easyLink-box{width:100%!important;max-width:100%!important;box-sizing:border-box!important}' +
        'div.easyLink-box div.easyLink-img,' +
        'div.easyLink-box div.easyLink-img p.easyLink-img-box{' +
        'width:240px!important;min-width:240px!important;max-width:240px!important;' +
        'height:240px!important;flex:0 0 240px!important;flex-shrink:0!important;' +
        'margin-right:16px!important;box-sizing:border-box!important}' +
        'div.easyLink-box div.easyLink-img::before{display:none!important;padding-top:0!important;content:none!important}' +
        'div.easyLink-box div.easyLink-img p.easyLink-img-box span{' +
        'width:240px!important;height:240px!important}' +
        'div.easyLink-box div.easyLink-img p.easyLink-img-box span>img,' +
        'div.easyLink-box img.js-item-image{' +
        'max-width:240px!important;max-height:240px!important;' +
        'width:auto!important;height:auto!important;min-width:0!important;object-fit:contain!important}' +
        '@media screen and (max-width:480px){' +
        'div.easyLink-box{display:block!important}' +
        'div.easyLink-box div.easyLink-img,' +
        'div.easyLink-box div.easyLink-img p.easyLink-img-box{' +
        'width:220px!important;min-width:220px!important;max-width:220px!important;' +
        'height:220px!important;flex-basis:220px!important;margin:0 auto 12px!important}' +
        'div.easyLink-box div.easyLink-img p.easyLink-img-box span{width:220px!important;height:220px!important}' +
        'div.easyLink-box div.easyLink-img p.easyLink-img-box span>img,' +
        'div.easyLink-box img.js-item-image{max-width:220px!important;max-height:220px!important}' +
        '}' +
        '</style></head><body>' +
        safe +
        '</body></html>';
    iframe.style.width = '100%';
    iframe.style.maxWidth = '100%';
    iframe.style.minWidth = '0';
    iframe.style.border = '0';
    iframe.style.display = 'block';
    iframe.addEventListener('load', () => {
        const resize = () => {
            try {
                const d = iframe.contentDocument;
                if (!d || !d.body) return;
                const mount = d.querySelector('[id^="msmaflink-"]');
                let h = 0;
                if (mount) {
                    const r = mount.getBoundingClientRect();
                    h = Math.max(Math.ceil(r.height), mount.offsetHeight, mount.scrollHeight);
                }
                if (!h) {
                    h = Math.max(d.documentElement ? d.documentElement.scrollHeight : 0, d.body.scrollHeight);
                    h = Math.min(h, 900);
                }
                if (h > 0) iframe.style.height = Math.ceil(h + 12) + 'px';
            } catch (_) {}
        };
        resize();
        const id = window.setInterval(resize, 400);
        window.setTimeout(() => window.clearInterval(id), 10000);
    });
    container.appendChild(iframe);
}

// 公式HPアフィリンク(direct HTML)から「公式HP」選択肢ボタンを生成。
//   directは A8等の画像リンク or テキストリンク。href を抜き出してボタン化し、
//   計測ピクセル(1x1 img)があれば維持する（withPixelで重複発火を抑制）。
function extractOfficialHref(directHtml) {
    if (!directHtml) return null;
    const hrefM = directHtml.match(/href=["']([^"']+)["']/i);
    if (hrefM) return hrefM[1];
    // A8商品リンク: "ejp":"h"+"ttps://..."
    const a8 = directHtml.match(/"ejp"\s*:\s*"([^"]*)"\s*\+\s*"([^"]*)"/i);
    if (a8) {
        const url = (a8[1] + a8[2]).replace(/^h+ttps:/i, 'https:');
        if (/^https?:\/\//i.test(url)) return url;
    }
    const a8b = directHtml.match(/"h"\s*\+\s*"(ttps:\/\/[^"]+)"/i);
    if (a8b) return 'h' + a8b[1];
    return null;
}

function buildOfficialButton(directHtml, withPixel, label, size) {
    if (!directHtml) return null;
    const href = extractOfficialHref(directHtml);
    if (!href) return null;
    const wrap = document.createElement('div');
    wrap.className = 'affiliate-official-wrap';
    wrap.style.cssText = 'position:relative; margin:0; width:100%;';
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener sponsored nofollow';
    a.className = 'affiliate-official-btn';
    a.textContent = label || 'メーカー公式HPで見る';

    if (size === 'large') {
        a.style.cssText =
            'display:block; width:100%; box-sizing:border-box; text-align:center; ' +
            'text-decoration:none; color:#fff; font-weight:800; ' +
            'font-size:clamp(1.02rem, 3.6vw, 1.18rem); line-height:1.35; padding:1rem 1.25rem; ' +
            'border-radius:12px; letter-spacing:0.02em; ' +
            'background:#047857; border:1px solid #065f46; ' +
            'box-shadow:0 2px 8px rgba(5,150,105,0.22); ' +
            'transition:background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;';
    } else {
        a.style.cssText =
            'display:block; width:100%; box-sizing:border-box; text-align:center; ' +
            'text-decoration:none; color:#fff; font-weight:800; ' +
            'font-size:0.98rem; line-height:1.35; padding:0.85rem 1.1rem; border-radius:10px; ' +
            'background:#0f766e; border:1px solid #0d9488; ' +
            'box-shadow:0 1px 4px rgba(13,148,136,0.18); ' +
            'transition:background 0.15s ease, transform 0.15s ease;';
    }
    a.addEventListener('mouseenter', () => {
        a.style.background = size === 'large' ? '#059669' : '#0d9488';
        a.style.transform = 'translateY(-1px)';
    });
    a.addEventListener('mouseleave', () => {
        a.style.background = size === 'large' ? '#047857' : '#0f766e';
        a.style.transform = '';
    });
    wrap.appendChild(a);
    if (withPixel) {
        const pixM = directHtml.match(/<img[^>]+src=["']([^"']+)["'][^>]*(?:width=["']?1\b|height=["']?1\b)/i);
        if (pixM) {
            const img = document.createElement('img');
            img.src = pixM[1];
            img.width = 1; img.height = 1; img.alt = '';
            img.setAttribute('aria-hidden', 'true');
            img.style.cssText = 'position:absolute; width:1px; height:1px; border:none; opacity:0; pointer-events:none;';
            wrap.appendChild(img);
        }
    }
    return wrap;
}

function ensureAffiliatePanel(section, opts) {
    let panel = section.querySelector('.affiliate-options-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.className = 'affiliate-options-panel';
        const children = Array.from(section.children);
        children.forEach((el) => panel.appendChild(el));
        section.appendChild(panel);
    }
    panel.style.cssText = opts.prominent
        ? 'background:#fff; border:1.5px solid #a7f3d0; border-radius:16px; overflow:hidden; ' +
          'box-shadow:0 6px 20px rgba(5,150,105,0.08);'
        : 'background:#fff; border:1.5px solid #cbd5e1; border-radius:16px; overflow:hidden; ' +
          'box-shadow:0 4px 14px rgba(15,23,42,0.06);';
    return panel;
}

function renderAffiliate(data) {
    const aff = data.affiliate;
    const hasMoshimo = aff && aff.moshimo;
    const hasDirect = aff && aff.direct;

    // 1枠分を描画（見出し＋公式HP・各ECを同じ「確認先」グループに）
    function fillSlot(opts) {
        const section = document.getElementById(opts.secId);
        const moshimoEl = document.getElementById(opts.moshId);
        const directEl = document.getElementById(opts.dirId);
        if (!section && !moshimoEl && !directEl) return;
        if (!hasMoshimo && !hasDirect) {
            if (section) section.style.display = 'none';
            return;
        }
        if (section) {
            section.style.display = '';
            section.style.cssText = opts.prominent
                ? 'max-width:920px; margin:3.5rem auto 2.5rem; padding:0 1rem;'
                : 'max-width:860px; margin:2.5rem auto; padding:0 1rem;';
        }

        const panel = section ? ensureAffiliatePanel(section, opts) : null;

        // 見出し：ボタンではなく「確認する」ための親ラベル
        const h = panel ? panel.querySelector('h2') : (section ? section.querySelector('h2') : null);
        if (h) {
            h.innerHTML =
                (opts.headerIcon ? `<i class="fas ${opts.headerIcon}" aria-hidden="true"></i>` : '') +
                `<span>${opts.headerText}</span>`;
            h.style.cssText = opts.prominent
                ? 'display:flex; align-items:center; justify-content:center; gap:0.55rem; margin:0; ' +
                  'padding:1.15rem 1.25rem 0.35rem; text-align:center; color:#065f46; font-weight:900; ' +
                  'font-size:clamp(1.35rem, 4.2vw, 1.75rem); letter-spacing:0.02em; background:transparent;'
                : 'display:flex; align-items:center; justify-content:center; gap:0.5rem; margin:0; ' +
                  'padding:1rem 1.15rem 0.25rem; text-align:center; color:#0f172a; font-weight:900; ' +
                  'font-size:clamp(1.1rem, 3.5vw, 1.35rem); background:transparent; border:none; box-shadow:none;';
        }

        let sub = panel ? panel.querySelector('.affiliate-cta-subtitle') : null;
        if (panel && !sub) {
            sub = document.createElement('p');
            sub.className = 'affiliate-cta-subtitle';
            if (h && h.nextSibling) {
                panel.insertBefore(sub, h.nextSibling);
            } else if (h) {
                h.after(sub);
            } else {
                panel.prepend(sub);
            }
        }
        if (sub) {
            sub.textContent = opts.subText || 'メーカー公式HP・各ECサイトから確認できます';
            sub.style.cssText =
                'text-align:center; color:#0f172a; font-size:0.92rem; font-weight:600; ' +
                'margin:0; padding:0 1.15rem 1rem; line-height:1.55;';
        }

        // 選択肢グループ本体
        let body = panel ? panel.querySelector('.affiliate-options-body') : null;
        if (panel && !body) {
            body = document.createElement('div');
            body.className = 'affiliate-options-body';
            body.style.cssText =
                'display:flex; flex-direction:column; gap:0.75rem; ' +
                'padding:0 0.85rem 1.1rem;';
            if (moshimoEl) body.appendChild(moshimoEl);
            if (directEl) body.appendChild(directEl);
            panel.appendChild(body);
        } else if (body) {
            body.style.cssText =
                'display:flex; flex-direction:column; gap:0.75rem; ' +
                'padding:0 0.85rem 1.1rem;';
        }

        // 公式HPを「確認先のひとつ」として先頭に
        if (directEl) { directEl.innerHTML = ''; directEl.style.cssText = 'display:none; margin:0;'; }
        if (hasDirect) {
            const btn = buildOfficialButton(aff.direct, opts.withPixel, opts.btnLabel, opts.buttonSize || 'default');
            if (btn) {
                if (body) {
                    body.insertBefore(btn, body.firstChild);
                } else if (moshimoEl && moshimoEl.parentNode) {
                    moshimoEl.parentNode.insertBefore(btn, moshimoEl);
                } else if (directEl) {
                    directEl.style.display = '';
                    directEl.appendChild(btn);
                }
            }
        }

        // もしもかんたんリンク（楽天/Yahoo/Amazon）をiframeで確実描画
        if (moshimoEl && hasMoshimo) {
            injectMoshimoIframe(moshimoEl, aff.moshimo);
        }
    }

    fillSlot({
        secId: 'affiliate-cta', moshId: 'affiliate-moshimo', dirId: 'affiliate-direct',
        eidSuffix: '', withPixel: true,
        headerStyle: 'group', headerText: '製品の詳細を確認する',
        headerIcon: 'fa-search',
        subText: 'メーカー公式HP・各ECサイトから、仕様や最新情報を確認できます',
        btnLabel: 'メーカー公式HPで見る'
    });
    fillSlot({
        secId: 'affiliate-cta-2', moshId: 'affiliate-moshimo-2', dirId: 'affiliate-direct-2',
        eidSuffix: 'b', withPixel: false, prominent: true, buttonSize: 'large',
        headerStyle: 'group', headerText: '今の価格を確認する', headerIcon: 'fa-yen-sign',
        subText: 'メーカー公式HP・各ECサイトから、現在の価格を確認できます',
        btnLabel: 'メーカー公式HPで価格を確認'
    });
    console.log('✅ アフィリエイトCTA描画（詳細／価格を同一グループで表示）');
}

// 13. メイン初期化
/** 製品ヘッダー直下にサイト価値の短い説明を差し込む（控えめ表示） */
function ensureProductValueNote() {
    if (document.getElementById('product-value-note')) return;

    const header =
        document.querySelector('body > header') ||
        document.querySelector('header');
    if (!header || !header.parentNode) return;

    const note = document.createElement('div');
    note.id = 'product-value-note';
    note.className = 'product-value-note';
    note.innerHTML =
        '<p>口コミは重要でも、どれを信じればよいか分からないし、読み疲れしてしまう。このサイトでは、ECサイトの口コミを横断的に分析・点数化し、メリットとデメリットを公平に示して失敗しない購入をサポートします。</p>';

    const container = document.querySelector('body > .container, .container');
    if (container && container.parentNode === header.parentNode) {
        container.parentNode.insertBefore(note, container);
    } else {
        header.insertAdjacentElement('afterend', note);
    }
}

async function initializePage() {
    ensureProductValueNote();
    const productId = getProductId();
    console.log('🔍 製品ID:', productId);
    
    const data = await loadProductData(productId);
    if (!data) {
        console.error('❌ 製品データが見つかりません');
        return;
    }
    
    console.log('✅ 製品データ読み込み成功:', data.productName);
    console.log('📊 総口コミ数:', data.totalReviews, '件');
    console.log('🔒 信頼度スコア:', data.reliabilityScore, '点');
    
    try {
        const computed = computeOverallScores(data);
        if (computed) {
            data.featureAverageScore = computed.featureAverageScore;
            if (computed.overallScore != null) data.overallScore = computed.overallScore;
        }
        updateMetadata(data);
        updateDynamicElements(data);
        updateBasicInfo(data);
        updateReliability(data);
        updateUpdateInfo(data);
        updatePerformanceData(data);
        updateReviewKeywords(data);
        updateSuccessStrategies(data);
        updateTopComplaints(data);
        updateAttributeScores(data);
        updateTimeSaving(data);
        updateOperationalCost(data);
        updateDataQuality(data);
        updateResaleValue(data);
        updateCTAButtons(data);
        renderAffiliate(data);
        
        window.productData = data;
        
        console.log('✅ 全180項目の自動ロード完了');
        
        window.dispatchEvent(new CustomEvent('productDataLoaded', { detail: data }));
        
    } catch (error) {
        console.error('❌ データ更新中にエラー:', error);
    }
}

// 14. 実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
