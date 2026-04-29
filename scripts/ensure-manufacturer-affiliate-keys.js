#!/usr/bin/env node
/**
 * products/data/*.json にメーカー公式アフィリ用キーを用意する（未設定のファイルのみ追記）。
 * URL は空文字のまま。後から一括で visit URL / 計測ピクセルを流し込む想定。
 *
 * 使い方: node scripts/ensure-manufacturer-affiliate-keys.js
 */
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'products', 'data');
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json'));

let updated = 0;
for (const file of files) {
    const fp = path.join(dataDir, file);
    let j;
    try {
        j = JSON.parse(fs.readFileSync(fp, 'utf8'));
    } catch (e) {
        console.error('skip (parse error)', file, e.message);
        continue;
    }
    let changed = false;
    if (!Object.prototype.hasOwnProperty.call(j, 'manufacturerOfficialAffiliateUrl')) {
        j.manufacturerOfficialAffiliateUrl = '';
        changed = true;
    }
    if (!Object.prototype.hasOwnProperty.call(j, 'manufacturerOfficialAffiliateTrackingPixelUrl')) {
        j.manufacturerOfficialAffiliateTrackingPixelUrl = '';
        changed = true;
    }
    if (changed) {
        fs.writeFileSync(fp, JSON.stringify(j, null, 2) + '\n', 'utf8');
        updated++;
        console.log('updated', file);
    }
}
console.log('done:', updated, 'file(s)');
