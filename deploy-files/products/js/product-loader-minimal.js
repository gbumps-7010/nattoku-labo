/**
 * ✅ 製品データ自動ロードシステム V3.2.1 (2026-03-17)
 * - 構文エラーを修正
 * - data-dynamic 属性による汎用データバインディング
 */

// 製品IDを取得
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

// 製品データを読み込み
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

// メイン初期化
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
    
    // グローバルに保存
    window.productData = data;
    
    console.log('✅ データロード完了');
}

// 実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}
