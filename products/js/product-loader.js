/**
 * ✅ 製品データ自動ロードシステム V3.2.1 (2026-03-17)
 * - Gemini出力JSONから180項目を完全自動反映
 * - 構文エラーを完全修正
 */

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

// 2. メタデータ更新
function updateMetadata(data) {
    document.title = data.metaTitle || `${data.productName} 詳細分析 | もう失敗しない。ナットクLabo`;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
        metaDesc.setAttribute('content', data.metaDescription);
    }
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": data.productName,
        "description": data.metaDescription,
        "brand": {
            "@type": "Brand",
            "name": data.manufacturer
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": data.overallRating.toString(),
            "reviewCount": data.totalReviews.toString(),
            "bestRating": "5",
            "worstRating": "1"
        },
        "offers": {
            "@type": "Offer",
            "price": data.price.toString(),
            "priceCurrency": "JPY",
            "availability": "https://schema.org/InStock"
        }
    };
    
    let structuredScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredScript) {
        structuredScript = document.createElement('script');
        structuredScript.type = 'application/ld+json';
        document.head.appendChild(structuredScript);
    }
    structuredScript.textContent = JSON.stringify(structuredData, null, 2);
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
                element.src = value;
                element.alt = data.productName || '製品画像';
                console.log(`✅ 画像更新`);
            } else if (path === 'stars') {
                updateStarRating(element, data.overallRating);
                console.log(`✅ 星評価更新: ${data.overallRating}`);
            } else if (path === 'price') {
                // 価格を「約」付きでカンマ区切りでフォーマット
                element.textContent = `約¥${value.toLocaleString()}`;
                console.log(`✅ 価格更新: 約¥${value.toLocaleString()}`);
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
                                <p style="font-size: 0.8rem; color: #64748b; margin: 0;">交換頻度: ${item.replacementFrequency}</p>
                            </div>
                            <div style="text-align: right;">
                                <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.25rem;">単価: ¥${item.unitCost.toLocaleString()}</p>
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

function updateStarRating(element, rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    element.innerHTML = starsHTML;
}

// 4. 基本情報更新
function updateBasicInfo(data) {
    const productTitle = document.querySelector('.product-title');
    if (productTitle) productTitle.textContent = data.productName;
    
    const productImage = document.querySelector('.product-image-header');
    if (productImage) {
        productImage.src = data.imageUrl;
        productImage.alt = data.productName;
    }
    
    // 性能スコアの表示（上位3項目を自動選択）
    if (data.performanceAnalysis) {
        const scoresContainer = document.getElementById('performanceScores');
        if (scoresContainer) {
            const perfData = data.performanceAnalysis;
            
            // すべての性能項目をスコア順にソート
            const allScores = [
                { key: 'floorCleaning', label: '床掃除', value: perfData.floorCleaning?.score },
                { key: 'carpetCleaning', label: 'カーペット', value: perfData.carpetCleaning?.score },
                { key: 'petHairRemoval', label: 'ペット毛', value: perfData.petHairRemoval?.score || perfData.petHair?.score },
                { key: 'quietness', label: '静音性', value: perfData.quietness?.score || perfData.nightQuietness?.score },
                { key: 'stepClimbing', label: '段差', value: perfData.stepClimbing?.score },
                { key: 'maintenance', label: 'メンテ', value: perfData.maintenance?.score },
                { key: 'appStability', label: 'アプリ', value: perfData.appStability?.score },
                { key: 'batteryLife', label: 'バッテリー', value: perfData.batteryLife?.score }
            ].filter(item => item.value !== undefined && item.value !== null)
             .sort((a, b) => b.value - a.value)
             .slice(0, 3); // 上位3項目を取得
            
            scoresContainer.innerHTML = allScores
                .map(s => `
                    <div class="score-item">
                        <span class="score-label">${s.label}:</span>
                        <span class="score-value">${s.value}点</span>
                    </div>
                `).join('');
            console.log(`✅ 性能スコア 上位${allScores.length}項目 表示完了:`, allScores.map(s => `${s.label}(${s.value}点)`).join(', '));
        }
    }
}

// 5. カテゴリC更新
function updateCategoryC(data) {
    const categoryC = data.categoryC;
    if (!categoryC) return;
    
    const satCards = document.querySelectorAll('.stat-card');
    if (satCards.length >= 1) {
        const satNumber = satCards[0].querySelector('.stat-number');
        if (satNumber) satNumber.textContent = categoryC.userSatisfaction.score;
    }
    
    if (satCards.length >= 2) {
        const repeatNumber = satCards[1].querySelector('.stat-number');
        if (repeatNumber) repeatNumber.textContent = `${categoryC.repurchaseIntention.percentage}%`;
    }
    
    if (satCards.length >= 3) {
        const failureNumber = satCards[2].querySelector('.stat-number');
        if (failureNumber) failureNumber.textContent = `${categoryC.failureRate.percentage}%`;
    }
}

// 6. 性能分析更新
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
        { keys: ['floorCleaning'], icon: '📊', label: 'フローリング清掃' },
        { keys: ['carpetCleaning'], icon: '⚠️', label: 'カーペット清掃' },
        { keys: ['petHair', 'petHairRemoval'], icon: '🐕', label: 'ペット毛対応' },
        { keys: ['nightQuietness', 'quietness'], icon: '🌙', label: '静音性（夜間）' },
        { keys: ['stepClimbing'], icon: '📏', label: '段差乗り越え' },
        { keys: ['maintenance'], icon: '🔧', label: 'メンテナンス性' },
        { keys: ['appStability'], icon: '📱', label: 'アプリ安定性' },
        { keys: ['batteryLife'], icon: '🔋', label: 'バッテリー持続' }
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
                    <h4>${item.icon} ${item.label}: ${score}/100点</h4>
                    <p class="rank-badge">${data.reviewCount}件のレビューから算出</p>
                    <p>${data.comment || '詳細評価情報なし'}</p>
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
function updateReliability(data) {
    if (!data.reliability) return;
    
    const rel = data.reliability;
    
    // 総合スコア
    const scoreEl = document.querySelector('[data-dynamic="reliability.score"]');
    if (scoreEl && rel.score !== undefined) {
        scoreEl.textContent = rel.score.toFixed(1);
    }
    
    // 検証データ充足率
    if (rel.dataAdequacy) {
        const adequacyScoreEl = document.querySelector('[data-dynamic="reliability.dataAdequacy.score"]');
        if (adequacyScoreEl) {
            // scoreまたはpercentageに対応
            const adequacyValue = rel.dataAdequacy.score || rel.dataAdequacy.percentage;
            if (adequacyValue) adequacyScoreEl.textContent = adequacyValue;
        }
        
        const adequacyDescEl = document.querySelector('[data-dynamic="reliability.dataAdequacy.description"]');
        if (adequacyDescEl) {
            const adequacyDesc = rel.dataAdequacy.description || rel.dataAdequacy.note;
            if (adequacyDesc) adequacyDescEl.textContent = adequacyDesc;
        }
    }
    
    // 評価一致率
    if (rel.consistency) {
        const consistencyPercentEl = document.querySelector('[data-dynamic="reliability.consistency.percentage"]');
        if (consistencyPercentEl) {
            const consistencyValue = rel.consistency.percentage || rel.consistency.score;
            if (consistencyValue) consistencyPercentEl.textContent = consistencyValue;
        }
        
        const consistencyDescEl = document.querySelector('[data-dynamic="reliability.consistency.description"]');
        if (consistencyDescEl) {
            const consistencyDesc = rel.consistency.description || rel.consistency.note;
            if (consistencyDesc) consistencyDescEl.textContent = consistencyDesc;
        }
    }
    
    // 情報最新性
    if (rel.freshness) {
        const freshnessScoreEl = document.querySelector('[data-dynamic="reliability.freshness.score"]');
        if (freshnessScoreEl) {
            // scoreまたはpercentageに対応
            const freshnessValue = rel.freshness.score || rel.freshness.percentage;
            if (freshnessValue) freshnessScoreEl.textContent = freshnessValue;
        }
        
        const freshnessDescEl = document.querySelector('[data-dynamic="reliability.freshness.description"]');
        if (freshnessDescEl) {
            const freshnessDesc = rel.freshness.description || rel.freshness.note;
            if (freshnessDesc) freshnessDescEl.textContent = freshnessDesc;
        }
    }
}

// 7.6. 更新情報更新
function updateUpdateInfo(data) {
    if (!data.updateInfo) return;
    
    const ui = data.updateInfo;
    
    // 最終更新日
    const lastUpdatedEl = document.querySelector('[data-dynamic="updateInfo.lastUpdated"]');
    if (lastUpdatedEl && ui.lastUpdated) {
        lastUpdatedEl.textContent = ui.lastUpdated;
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
    
    // 計算根拠
    const methodologyEl = document.querySelector('[data-dynamic="timeSaving.methodology"]');
    if (methodologyEl && ts.methodology) {
        methodologyEl.textContent = ts.methodology;
    }
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
        roiDescEl.innerHTML = oc.roiDescription;
    }
    
    // 消耗品リスト
    if (oc.consumables && Array.isArray(oc.consumables)) {
        const listContainer = document.querySelector('[data-dynamic="operationalCost.consumables"]');
        if (listContainer) {
            const html = oc.consumables.map(item => `
                <div class="consumable-item">
                    <div class="consumable-name">
                        <i class="fas fa-box" style="color: #64748b; margin-right: 0.5rem;"></i>
                        ${item.item}
                    </div>
                    <div class="consumable-details">
                        <span class="consumable-frequency">${item.replacementFrequency}</span>
                        <span class="consumable-cost">¥${item.unitCost.toLocaleString()}</span>
                        <span style="color: #64748b; font-size: 0.8rem;">(年間 ¥${item.annualCost.toLocaleString()})</span>
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
                            <p style="color: #64748b; font-size: 0.85rem; line-height: 1.6; margin: 0.5rem 0;">
                                <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                                ${strategy.technicalLevelDescription}
                            </p>
                        ` : ''}
                        ${strategy.detailedSteps ? `
                            <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-top: 0.75rem;">
                                <div style="font-weight: 600; color: #334155; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                    <i class="fas fa-list-check"></i> 具体的な手順
                                </div>
                                <p style="color: #475569; font-size: 0.9rem; line-height: 1.7; margin: 0; white-space: pre-line;">
                                    ${strategy.detailedSteps}
                                </p>
                            </div>
                        ` : ''}
                        ${strategy.expectedResult ? `
                            <div style="margin-top: 0.75rem; padding: 0.75rem; background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%); border-left: 3px solid #3b82f6; border-radius: 4px;">
                                <div style="font-weight: 600; color: #1e40af; margin-bottom: 0.25rem; font-size: 0.85rem;">
                                    <i class="fas fa-bullseye"></i> 期待される結果
                                </div>
                                <p style="color: #1e40af; font-size: 0.85rem; line-height: 1.6; margin: 0;">
                                    ${strategy.expectedResult}
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
            ${technicalDesc ? `<p class="problem-description" style="margin-top: 1rem;">${technicalDesc}</p>` : ''}
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
                importanceBadge = '<span class="importance-badge critical">🔴 重要度：高</span>';
                cardClass = 'problem-card critical-issue';
            } else if (item.percentage >= 5) {
                importanceBadge = '<span class="importance-badge high">🟡 重要度：中</span>';
                cardClass = 'problem-card high-issue';
            } else if (item.percentage >= 3) {
                importanceBadge = '<span class="importance-badge medium">🟢 注意</span>';
                cardClass = 'problem-card medium-issue';
            }
            
            // solutionsが配列の場合と文字列の場合に対応
            let solutionHTML = '';
            if (Array.isArray(item.solutions)) {
                solutionHTML = item.solutions.map(s => `<li>${s}</li>`).join('');
            } else if (item.solution) {
                const solutions = item.solution.split(/[。\n]/).filter(s => s.trim().length > 0);
                solutionHTML = solutions.map(s => `<li>${s.trim()}。</li>`).join('');
            }
            
            // reviewCountとcountの両方に対応
            const reviewCount = item.reviewCount || item.count || 0;
            
            // titleとcomplaintの両方に対応
            const title = item.complaint || item.title || 'データなし';
            
            return `
            <div class="${cardClass}">
                <span class="problem-rank">TOP ${index + 1}</span>
                ${importanceBadge}
                <h3 class="problem-title">${title}</h3>
                <p class="problem-percentage">${item.percentage}% (${reviewCount}件)</p>
                ${item.details || item.description ? `<p class="problem-description">${item.details || item.description}</p>` : ''}
                <div class="solutions">
                    <h4 style="font-weight: 700; margin-bottom: 0.75rem;">💡 対策</h4>
                    <ul style="margin: 0; padding-left: 1.5rem; line-height: 1.8;">
                        ${solutionHTML}
                    </ul>
                </div>
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
                        (item.reviewCount ? `実数${item.reviewCount}件のレビューから算出` : '');
                    
                    return `
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; border-left: 4px solid ${scoreColor};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 700; color: #1e293b;">${scoreIcon} ${item.attribute || item.field}</span>
                                <span style="font-size: 1.3rem; font-weight: 900; color: ${scoreColor};">${score}</span>
                            </div>
                            ${commentText ? `<p style="font-size: 0.85rem; color: #64748b; margin: 0; line-height: 1.5;">${commentText}</p>` : ''}
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
                        (fieldData.reviewCount ? `実数${fieldData.reviewCount}件のレビューから算出` : '');
                    
                    return `
                        <div style="background: #f8fafc; padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; border-left: 4px solid ${scoreColor};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <span style="font-weight: 700; color: #1e293b;">${scoreIcon} ${field.label}</span>
                                <span style="font-size: 1.3rem; font-weight: 900; color: ${scoreColor};">${score}</span>
                            </div>
                            ${commentText ? `<p style="font-size: 0.85rem; color: #64748b; margin: 0; line-height: 1.5;">${commentText}</p>` : ''}
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
            commentEl.textContent = attrData.comment;
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

// 13. メイン初期化
async function initializePage() {
    const productId = getProductId();
    console.log('🔍 製品ID:', productId);
    
    const data = await loadProductData(productId);
    if (!data) {
        console.error('❌ 製品データが見つかりません');
        return;
    }
    
    console.log('✅ 製品データ読み込み成功:', data.productName);
    console.log('📊 総レビュー数:', data.totalReviews, '件');
    console.log('⭐ 総合評価:', data.overallRating, '/5.0');
    console.log('🔒 信頼度スコア:', data.reliabilityScore, '点');
    
    try {
        updateMetadata(data);
        updateDynamicElements(data);
        updateBasicInfo(data);
        updateCategoryC(data);
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
