/**
 * 製品ページ Chart.js 初期化（モバイル横はみ出し対策込み）
 * チャートはスクロールで表示領域に入ったとき初めて描画し、アニメーションさせる
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

    /**
     * IntersectionObserver 用の監視対象（サイズのある親を優先）
     */
    function resolveObserveTarget(element) {
        if (!element) return null;
        return (
            element.closest('.chart-container') ||
            element.closest('.keyword-chart-wrap') ||
            element.closest('.card') ||
            element
        );
    }

    /**
     * スクロールが落ち着いてから描画（スマホでアニメ欠落する対策）
     */
    function runAfterScrollSettle(callback) {
        if (typeof callback !== 'function') return;

        if (!isMobileViewport()) {
            requestAnimationFrame(function () {
                callback();
            });
            return;
        }

        var finished = false;
        var timer = null;

        function finish() {
            if (finished) return;
            finished = true;
            window.removeEventListener('scroll', onScroll, true);
            window.removeEventListener('touchend', onScroll, true);
            requestAnimationFrame(function () {
                requestAnimationFrame(callback);
            });
        }

        function onScroll() {
            clearTimeout(timer);
            timer = setTimeout(finish, 140);
        }

        window.addEventListener('scroll', onScroll, true);
        window.addEventListener('touchend', onScroll, true);
        timer = setTimeout(finish, 160);
    }

    /**
     * 要素がビューポートに入ったら一度だけ callback を実行する
     */
    function whenVisible(element, callback) {
        var target = resolveObserveTarget(element);
        if (!target || typeof callback !== 'function') return;

        var run = function () {
            runAfterScrollSettle(callback);
        };

        if (typeof IntersectionObserver === 'undefined') {
            run();
            return;
        }

        var mobile = isMobileViewport();
        var started = false;
        var observer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting || started) return;
                started = true;
                obs.unobserve(entry.target);
                obs.disconnect();
                run();
            });
        }, {
            // スマホは画面が狭いので早めに発火させる
            threshold: mobile ? 0.12 : 0.2,
            rootMargin: mobile ? '0px 0px -6% 0px' : '0px 0px -8% 0px'
        });

        observer.observe(target);
    }

    function buildKeywordBarOptions() {
        const mobile = isMobileViewport();
        return {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: mobile ? 900 : 1200,
                easing: 'easeOutQuart',
                delay: function (context) {
                    if (context.type !== 'data' || context.mode !== 'default') return 0;
                    return context.dataIndex * (mobile ? 45 : 80);
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
                    ? { left: 2, right: 4, top: 8, bottom: 8 }
                    : { left: 4, right: 12, top: 10, bottom: 10 }
            },
            datasets: {
                bar: {
                    categoryPercentage: mobile ? 0.72 : 0.68,
                    barPercentage: mobile ? 0.78 : 0.72
                }
            },
            scales: {
                y: {
                    ticks: {
                        autoSkip: false,
                        padding: mobile ? 6 : 10,
                        font: {
                            size: mobile ? 11 : 13,
                            weight: '600',
                            family: "'Noto Sans JP', sans-serif"
                        },
                        color: '#334155',
                        callback: function (value) {
                            const label = this.getLabelForValue(value);
                            return truncateLabel(label, mobile ? 9 : 16);
                        }
                    },
                    grid: {
                        display: false
                    },
                    afterFit: function (scale) {
                        if (isMobileViewport()) {
                            scale.width = Math.min(
                                scale.width,
                                Math.max(78, window.innerWidth * 0.34)
                            );
                        } else {
                            scale.width = Math.max(scale.width, 160);
                        }
                    }
                },
                x: {
                    beginAtZero: true,
                    ticks: {
                        maxTicksLimit: mobile ? 4 : 8,
                        font: { size: mobile ? 10 : 12 },
                        color: '#64748b',
                        callback: function (value) {
                            if (Number.isInteger(value)) {
                                return value + '件';
                            }
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.25)'
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
            borderRadius: 6,
            barThickness: mobile ? 18 : 22,
            maxBarThickness: mobile ? 22 : 28
        };
    }

    function createRadarChart(data) {
        var canvas = document.getElementById('radarChart');
        if (!data.radarChartData || !canvas) return;
        if (typeof Chart !== 'undefined' && Chart.getChart && Chart.getChart(canvas)) return;

        try {
            var ctx = canvas.getContext('2d');
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
                        duration: mobile ? 1100 : 1500,
                        easing: 'easeOutQuart',
                        delay: function (context) {
                            if (context.type !== 'data' || context.mode !== 'default') return 0;
                            return context.dataIndex * (mobile ? 70 : 100);
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
                            }
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

    function initRadarChart(data) {
        var canvas = document.getElementById('radarChart');
        if (!data.radarChartData || !canvas) return;
        whenVisible(canvas, function () {
            createRadarChart(data);
        });
    }

    function createKeywordChart(canvasId, items, colors) {
        var canvas = document.getElementById(canvasId);
        if (!canvas || !items || !items.length) return;
        if (typeof Chart !== 'undefined' && Chart.getChart && Chart.getChart(canvas)) return;

        try {
            var topItems = items.slice(0, 10);
            var wrap = canvas.closest('.keyword-chart-wrap');
            if (wrap) {
                var mobile = isMobileViewport();
                var rowH = mobile ? 44 : 52;
                var chrome = mobile ? 72 : 90;
                wrap.style.height = Math.max(
                    mobile ? 420 : 560,
                    topItems.length * rowH + chrome
                ) + 'px';
            }
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

    function initKeywordChart(canvasId, items, colors) {
        var canvas = document.getElementById(canvasId);
        if (!canvas || !items || !items.length) return;
        whenVisible(canvas, function () {
            createKeywordChart(canvasId, items, colors);
        });
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
            console.log('📊 チャート表示待ち（スクロールで描画）');
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
