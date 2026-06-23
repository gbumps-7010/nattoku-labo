/**
 * 製品ページ Chart.js 初期化（モバイル横はみ出し対策込み）
 */
(function () {
    'use strict';

    function isMobileViewport() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    function truncateLabel(label, maxLen) {
        if (label == null) return '';
        const text = String(label);
        return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
    }

    function buildKeywordBarOptions() {
        const mobile = isMobileViewport();
        return {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: mobile ? 800 : 1200,
                easing: 'easeOutQuart',
                delay: function (context) {
                    return context.dataIndex * (mobile ? 50 : 80);
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: function (items) {
                            return items[0] && items[0].label ? items[0].label : '';
                        }
                    }
                }
            },
            layout: {
                padding: mobile
                    ? { left: 0, right: 2, top: 0, bottom: 0 }
                    : { right: 8 }
            },
            scales: {
                y: {
                    ticks: {
                        autoSkip: false,
                        font: { size: mobile ? 10 : 12 },
                        callback: function (value) {
                            const label = this.getLabelForValue(value);
                            return truncateLabel(label, mobile ? 7 : 14);
                        }
                    },
                    afterFit: function (scale) {
                        if (isMobileViewport()) {
                            scale.width = Math.min(
                                scale.width,
                                Math.max(60, window.innerWidth * 0.30)
                            );
                        }
                    }
                },
                x: {
                    beginAtZero: true,
                    ticks: {
                        maxTicksLimit: mobile ? 4 : 8,
                        font: { size: mobile ? 9 : 11 },
                        callback: function (value) {
                            if (Number.isInteger(value)) {
                                return value + '件';
                            }
                        }
                    }
                }
            }
        };
    }

    function buildKeywordDataset(items, colors) {
        const mobile = isMobileViewport();
        return {
            label: '言及数',
            data: items.map(function (item) { return item.count; }),
            backgroundColor: colors.bg,
            borderColor: colors.border,
            borderWidth: 1,
            barThickness: mobile ? 14 : 18,
            maxBarThickness: mobile ? 16 : 24
        };
    }

    function initRadarChart(data) {
        if (!data.radarChartData || !document.getElementById('radarChart')) return;

        try {
            var ctx = document.getElementById('radarChart').getContext('2d');
            var mobile = isMobileViewport();
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: data.radarChartData.labels,
                    datasets: [{
                        label: '性能スコア',
                        data: data.radarChartData.values,
                        backgroundColor: 'rgba(37, 99, 235, 0.2)',
                        borderColor: 'rgba(37, 99, 235, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(37, 99, 235, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: {
                        duration: mobile ? 1000 : 1500,
                        easing: 'easeOutQuart',
                        delay: function (context) {
                            return context.dataIndex * 100;
                        }
                    },
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                font: { size: mobile ? 9 : 11 },
                                callback: function (value) {
                                    return value + '点';
                                }
                            },
                            pointLabels: {
                                font: { size: mobile ? 10 : 12 }
                            },
                            animate: true
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
            console.log('✅ レーダーチャート描画完了');
        } catch (error) {
            console.error('❌ レーダーチャートエラー:', error);
        }
    }

    function initKeywordChart(canvasId, items, colors) {
        var canvas = document.getElementById(canvasId);
        if (!canvas || !items || !items.length) return;

        try {
            var topItems = items.slice(0, 10);
            new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: topItems.map(function (item) { return item.keyword; }),
                    datasets: [buildKeywordDataset(topItems, colors)]
                },
                options: buildKeywordBarOptions()
            });
            console.log('✅ ' + canvasId + ' 描画完了');
        } catch (error) {
            console.error('❌ ' + canvasId + ' エラー:', error);
        }
    }

    function initKeywordCharts(data) {
        if (!data.reviewKeywords) return;

        initKeywordChart(
            'positiveKeywordsChart',
            data.reviewKeywords.positive,
            { bg: 'rgba(16, 185, 129, 0.8)', border: 'rgba(16, 185, 129, 1)' }
        );
        initKeywordChart(
            'negativeKeywordsChart',
            data.reviewKeywords.negative,
            { bg: 'rgba(239, 68, 68, 0.8)', border: 'rgba(239, 68, 68, 1)' }
        );
    }

    function initPriceTooltipHint() {
        window.addEventListener('load', function () {
            setTimeout(function () {
                var tooltip = document.querySelector('.price-info-tooltip .tooltip-text');
                if (!tooltip) return;

                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';

                setTimeout(function () {
                    tooltip.style.visibility = 'hidden';
                    tooltip.style.opacity = '0';
                }, 3000);
            }, 1000);
        });
    }

    function initCharts() {
        if (typeof Chart === 'undefined') {
            console.log('⏳ Chart.js読み込み待機中...');
            setTimeout(initCharts, 100);
            return;
        }

        console.log('✅ Chart.js読み込み完了');

        window.addEventListener('productDataLoaded', function (e) {
            var data = e.detail;
            console.log('📊 チャート描画開始');
            initRadarChart(data);
            initKeywordCharts(data);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCharts);
    } else {
        initCharts();
    }

    initPriceTooltipHint();
})();
