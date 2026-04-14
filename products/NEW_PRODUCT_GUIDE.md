# 新製品追加完全ガイド 🚀（V2.1 - 2026-04-14更新）

このガイドに従えば、**GeminiからのJSONを入力するだけで、完璧な製品ページが5分で完成します**。

## Cursorから1コマンド追加（新）

`nattoku-labo` 直下で次を実行すると、以下を自動処理します。

- `products/data/[product-id].json` を保存
- `products/[product-id].html` を `template-unified.html` から生成
- `products-data.js` の製品一覧に追記

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\add-product-from-json.ps1 "C:\path\to\product.json"
```

必須フィールドは `productId` `productName` `manufacturer` `imageUrl` `overallRating` `totalReviews` `price` `reliabilityScore` です。  
`cta.amazon` と `cta.rakuten` も必要です。

Node.jsが入っている環境では、`node scripts/add-product-from-json.js "C:\path\to\product.json"` でも実行できます。

---

## ✅ **現在のシステム状態（2026-03-26）**

### 完璧に整っているもの
- ✅ **template-unified.html**: 最新の完全版テンプレート（71,178バイト、9セクション完備）
  - ヨドバシCTA削除済み
  - 運用コストセクション含む
  - 時間節約セクション含む
  - 信頼度セクション含む
  
- ✅ **product-loader.js**: 動的データ読み込み100%自動化
  - 全data-dynamic要素を自動更新
  - レーダーチャート自動描画
  - 消耗品リスト自動生成（"undefined"なし）
  - ヨドバシCTAコードはコメントアウト済み

- ✅ **products-data.js**: トップページ用製品リスト（12製品登録済み）

- ✅ **GEMINI_PROMPT_V3.14.md**: Gemini用プロンプト（JSON自動生成）

---

## 🎯 **新製品追加ワークフロー（5〜6分で完了）**

### ステップ1: GeminiにプロンプトとデータCollectionを送信（3分）

1. `GEMINI_PROMPT_V3.14.md`のプロンプトをコピー
2. 製品の基本情報と口コミデータをGeminiに送信
3. Geminiが完全なJSONを自動生成（全フィールド計算済み）

**重要な注意**: 
- ✅ GeminiはJSONの`cta`セクションに`yodobashi`フィールドを含めることがありますが、**問題ありません**
- ✅ HTMLテンプレートとJavaScriptで自動的に無視されます（2026-03-26にヨドバシCTA完全削除済み）
- ✅ JSONに`yodobashi`が含まれていても、製品ページには一切表示されません

---

### ステップ2: JSONファイルを保存（30秒）

GeminiからのJSONを以下のパスに保存：

```bash
products/data/[product-id].json
```

**例**: `products/data/xiaomi-x20-pro.json`

**フィールド名の注意**（よくある間違い）：
- ✅ `radarChartData`（正しい）← ❌ `radarChart`（間違い）
- ✅ `replacementFrequency`（正しい）← ❌ `frequency`（間違い）
- ✅ `reliability.*.description`（正しい）← ❌ `reliability.*.note`（間違い）
- ✅ `failureRate.breakdown`（必須）

---

### ステップ3: HTMLページを作成（30秒）

**`products/template-unified.html`をコピーして新製品HTMLを作成**：

```bash
コピー元: products/template-unified.html
コピー先: products/[product-id].html
```

**例**: `products/xiaomi-x20-pro.html`

**それだけです！** テンプレートには全9セクションが含まれており、product-loader.jsが自動的にJSONデータを読み込んで反映します。

---

### ステップ4: products-data.jsに製品情報を追加（1分）

`products-data.js`の`productsData`配列に新製品を追加：

```javascript
{
    id: 'xiaomi-x20-pro',
    name: 'Xiaomi X20 Pro',
    manufacturer: 'Xiaomi',
    price: 89800,
    rating: 4.6,
    reviews: {
        amazon: 120,
        rakuten: 180,
        yahoo: 90,
        total: 390
    },
    badges: ['12,000Pa吸引力', '5.1cm薄型', 'AI障害物回避'],
    specs: {
        floorCleaning: 96,
        mopping: 94,
        obstacleAvoidance: 98
    },
    trustScore: 89.5,
    platform: 'Amazon',
    url: 'https://www.amazon.co.jp/dp/[ASIN]'
}
```

---

### ステップ5: README.md & about.html を更新（30秒）

#### README.md
```markdown
**製品数**: 12製品 → 13製品
**最終更新**: 2026-03-26 → 2026-03-XX
```

#### about.html
```html
<!-- 製品数 -->
<div class="stat-number">12</div> → <div class="stat-number">13</div>

<!-- レビュー数（必要に応じて） -->
<div class="stat-number">3,200+</div> → <div class="stat-number">3,500+</div>
```

---

### ステップ6: 動作確認（30秒）

PlaywrightConsoleCapture で製品ページをテスト：

```
✅ 製品データ読み込み成功
✅ data-dynamic 要素検出
✅ レーダーチャート描画完了
✅ 消耗品リスト X項目 表示完了
✅ 全180項目の自動ロード完了
✅ Amazon CTA更新
✅ 楽天 CTA更新
✅ Yahoo CTA更新
❌ ヨドバシCTAログなし（正常）
```

---

## 📋 **完全なチェックリスト**

### ✅ ファイル作成
- [ ] `products/data/[product-id].json` - GeminiからのJSON（そのまま保存）
- [ ] `products/[product-id].html` - `template-unified.html`をコピー

### ✅ データ更新
- [ ] `products-data.js` - 新製品エントリー追加
- [ ] `README.md` - 製品数・製品リスト・最終更新日
- [ ] `about.html` - 製品数・レビュー数（統計カード）

### ✅ 動作確認（必須）
- [ ] PlaywrightConsoleCapture で製品ページをテスト
- [ ] 全9セクションが表示されることを確認：
  - [ ] ①この分析データの信頼度
  - [ ] ②総合性能分析（レーダーチャート）
  - [ ] ③レビューキーワード
  - [ ] ④主な不満点と対策
  - [ ] ⑤ライフスタイル別の相性診断
  - [ ] ⑥毎日の掃除から解放されて、自由な時間が増えます
  - [ ] ⑦毎日使い続けるためのコスト（維持費）
  - [ ] ⑧データ品質保証
  - [ ] ⑨購入先を比較（Amazon・楽天・Yahooの3つのみ）
- [ ] 消耗品リストに"undefined"がないこと
- [ ] ヨドバシCTAが表示されないこと（3つのCTAボタンのみ）

---

## 🔍 **トラブルシューティング**

### 問題: レーダーチャートが表示されない
**原因**: JSONの`radarChart`フィールド名が間違っている  
**解決**: `radarChart` → `radarChartData` にリネーム

### 問題: 消耗品リストに"undefined"が表示される
**原因**: JSONの`frequency`フィールド名が間違っている  
**解決**: `frequency` → `replacementFrequency` にリネーム（全消耗品）

### 問題: セクションが欠けている
**原因**: 古い`template-unified.html`を使用している  
**解決**: 2026-03-26以降の`template-unified.html`（71KB）を使用（9セクション完備）

### 問題: ヨドバシCTAが表示される
**原因**: ブラウザキャッシュが残っている  
**解決**: 全HTMLファイルは2026-03-26にヨドバシCTA削除済み。キャッシュをクリアしてください

---

## 📊 **正しいJSON構造（重要フィールド）**

### 必須トップレベルフィールド
```json
{
  "productId": "product-id",
  "productName": "製品名",
  "manufacturer": "メーカー名",
  "modelNumber": "型番",
  "imageUrl": "画像URL",
  "overallRating": 4.7,
  "totalReviews": 326,
  "price": 79980,
  "reliabilityScore": 89.42,
  "asin": "B0XXXXXX",
  "metaTitle": "...",
  "metaDescription": "...",
  
  "categoryC": { ... },
  "reliability": { ... },
  "updateInfo": { ... },
  "timeSaving": { ... },
  "operationalCost": { ... },
  "performanceAnalysis": { ... },
  "radarChartData": { ... },  // ⚠️ "radarChart"ではない！
  "attributeScores": { ... },
  "keywords": { ... },
  "successStrategies": [ ... ],
  "topComplaints": [ ... ],
  "dataQuality": { ... },
  "cta": {
    "amazon": "URL",
    "rakuten": "URL", 
    "yahoo": "URL"
    // "yodobashi"が含まれていてもOK（無視されます）
  }
}
```

### よくある間違い

#### ❌ 間違い1: radarChart
```json
"radarChart": { ... }  // ❌ 間違い
```
✅ **正しい**:
```json
"radarChartData": { ... }  // ✅ 正しい
```

#### ❌ 間違い2: frequency
```json
"consumables": [
  {
    "item": "HEPAフィルター",
    "frequency": "6ヶ月ごと",  // ❌ 間違い
    ...
  }
]
```
✅ **正しい**:
```json
"consumables": [
  {
    "item": "HEPAフィルター",
    "replacementFrequency": "6ヶ月ごと",  // ✅ 正しい
    ...
  }
]
```

#### ❌ 間違い3: reliability.*.note
```json
"reliability": {
  "dataAdequacy": {
    "note": "..."  // ❌ 間違い
  }
}
```
✅ **正しい**:
```json
"reliability": {
  "dataAdequacy": {
    "description": "..."  // ✅ 正しい
  }
}
```

#### ❌ 間違い4: failureRate.breakdownなし
```json
"failureRate": {
  "percentage": 3,
  "reviewCount": 326,
  // breakdownがない！ ❌
  "comment": "..."
}
```
✅ **正しい**:
```json
"failureRate": {
  "percentage": 3,
  "reviewCount": 326,
  "breakdown": {  // ✅ 必須！
    "hardware": 1,
    "software": 1,
    "environmental": 1
  },
  "comment": "..."
}
```

---

## 🎉 **成功の確認ポイント**

### PlaywrightConsoleCapture出力で以下を確認
```
✅ 製品データ読み込み成功: [製品名]
✅ 総レビュー数: XXX 件
✅ 総合評価: X.X /5.0
✅ 信頼度スコア: XX 点
✅ data-dynamic 要素: XX個検出
✅ 消耗品リスト X項目 表示完了
✅ レーダーチャート描画完了
✅ ポジティブキーワードチャート描画完了
✅ ネガティブキーワードチャート描画完了
✅ Amazon CTA更新: [URL]
✅ 楽天 CTA更新: [URL]
✅ Yahoo CTA更新: [URL]
✅ 全180項目の自動ロード完了
```

**重要**: `✅ ヨドバシ CTA更新` のログが**一切表示されないこと**を確認してください（正常動作）。

---

## 📝 **完璧な製品ページの9セクション**

新製品ページには以下の9セクションがすべて自動表示されます：

1. ✅ **この分析データの信頼度**（信頼度スコア、データ十分性、一致度、最新性）
2. ✅ **総合性能分析**（レーダーチャート + 8項目の詳細）
3. ✅ **レビューキーワード**（ポジティブ・ネガティブのチャート）
4. ✅ **主な不満点と対策**（TOP5の問題と解決策）
5. ✅ **ライフスタイル別の相性診断**（ペット、集合住宅、共働き、ファミリー）
6. ✅ **毎日の掃除から解放されて、自由な時間が増えます**（時間節約の可視化）
7. ✅ **毎日使い続けるためのコスト（維持費）**（日額・月額・年額、消耗品リスト）
8. ✅ **データ品質保証**（総レビュー数、採用データ、除外データ、信頼スコア）
9. ✅ **購入先を比較**（Amazon・楽天・Yahooの3つ）← ヨドバシなし

---

## 🚀 **実際の作業時間**

| ステップ | 所要時間 | 作業内容 |
|---------|----------|----------|
| 1. Gemini送信 | 3分 | GEMINI_PROMPT_V3.14.md + データ |
| 2. JSON保存 | 30秒 | products/data/[id].json |
| 3. HTMLコピー | 30秒 | template-unified.html → [id].html |
| 4. products-data.js更新 | 1分 | 新製品エントリー追加 |
| 5. README & about更新 | 30秒 | 製品数・レビュー数 |
| 6. 動作確認 | 30秒 | PlaywrightConsoleCapture |
| **合計** | **約6分** | 🎉 完璧な製品ページ完成！ |

---

## 📖 **詳細ドキュメント**

- 📄 **GEMINI_PROMPT_V3.14.md**: Gemini用プロンプト（最新版）
- 📄 **NEW_PRODUCT_WORKFLOW_PERFECT.md**: 完璧なワークフロー詳細ガイド
- 📄 **docs/ROBOROCK_SAROS_10R_COMPLETION_REPORT.md**: 最新製品追加の実例

---

## 🎊 **結論: 完璧です！**

**GeminiからのJSONを入力すれば、完璧な製品ページが自動生成されます。**

- ✅ 9セクション完備
- ✅ 全180項目自動ロード
- ✅ ヨドバシCTA完全削除
- ✅ 統一デザイン適用
- ✅ レスポンシブ対応
- ✅ SEO最適化済み

**所要時間: わずか5〜6分で完璧な製品ページが完成します！** 🚀

---

最終更新: 2026-03-26  
バージョン: V2.0（完全自動化版）
        "method": "公式マニュアルの事前確認",
        "effectiveness": "高",
        "difficulty": "初心者向け",
        "estimatedCost": 0,
        "implementationTime": "3日",
        "successRate": 90,
        "reviewSupport": 10,
        "steps": [...],
        "expectedResult": "..."
      }
    ],
    "preventionTips": [...]
  }
]
```

### **7. 消耗品データ**
```json
{
  "daily": 85,
  "monthly": 2550,
  "annual": 30600,
  "consumables": [
    {
      "item": "HEPAフィルター",
      "replacementFrequency": "6ヶ月ごと",
      "unitCost": 2200,
      "annualCost": 4400
    }
  ]
}
```

### **8. 時間節約データ**
```json
{
  "dailyMinutes": 20,
  "monthlyHours": 10,
  "annualHours": 120,
  "workDaysEquivalent": 15,
  "methodology": "..."
}
```

### **9. CTAリンク**
```json
{
  "amazon": "https://www.amazon.co.jp/dp/ASIN番号",
  "rakuten": "https://search.rakuten.co.jp/search/mall/製品名/",
  "yahoo": "https://shopping.yahoo.co.jp/search?p=製品名",
  "yodobashi": "https://www.yodobashi.com/?word=製品名"
}
```

---

## 🎯 **Geminiへのプロンプト（コピペ用）**

以下のプロンプトをコピーして、データを埋めてGeminiに送信してください：

```
新しいロボット掃除機の製品ページを追加してください。

【製品情報】
- 製品ID: [product-id]
- 製品名: [Product Name]
- メーカー: [Manufacturer]
- 価格: [price]
- 総レビュー数: [totalReviews]
- 総合評価: [rating]
- ASIN: [asin]
- 信頼性スコア: [reliabilityScore]

【手順】
1. `products/data/[product-id].json` を作成
   - 添付のJSONデータをそのまま保存

2. `products/template-unified.html` を `products/[product-id].html` にコピー

3. 動作確認
   - `products/[product-id].html` を開いてコンソールログを確認
   - 48個の data-dynamic 要素が更新されることを確認
   - 全180項目の自動ロードを確認
   - レーダーチャート + 棒グラフの描画を確認

4. README.mdを更新
   - 製品リストに新製品を追加
   - 製品数を更新（11製品 → 12製品）

【添付JSONデータ】
（ここに完全なJSONデータを貼り付け）

```

---

## ✅ **チェックリスト**

新製品追加後、以下を確認してください：

### **1. JSONファイル**
- [ ] `products/data/[product-id].json` が作成されている
- [ ] すべての必須フィールドが存在する
- [ ] 価格が数値型（文字列ではない）
- [ ] `operationalCost.consumables` が配列形式
- [ ] `timeSaving` のフィールドが数値型

### **2. HTMLファイル**
- [ ] `products/[product-id].html` が存在する
- [ ] ファイル名が製品IDと一致している
- [ ] `template-unified.html` の最新版がベースになっている

### **3. 動作確認**
- [ ] ページが正常に読み込まれる
- [ ] 48個の data-dynamic 要素が更新される
- [ ] 価格ツールチップが表示される（水色アイコン + 自動表示）
- [ ] 「参考価格（メーカー希望小売価格）」テキストが表示される
- [ ] レーダーチャートが描画される
- [ ] ポジティブ・ネガティブキーワードの棒グラフが描画される
- [ ] 性能スコアバッジ（上位3項目）が表示される
- [ ] ライフスタイル別適性（4カテゴリ）が表示される
- [ ] 消耗品リストが表示される（カード形式）
- [ ] 不満点と対策が表示される

### **4. README.md更新**
- [ ] 製品リストに新製品が追加されている
- [ ] 製品数が更新されている
- [ ] 最終更新日が更新されている

---

## 🔧 **トラブルシューティング**

### **問題: 価格が表示されない**
- **原因**: `price` が文字列形式になっている
- **解決**: `"price": "59800"` → `"price": 59800` に修正

### **問題: undefined エラーが表示される**
- **原因**: `operationalCost` または `timeSaving` が文字列形式
- **解決**: すべてのフィールドを数値型に変更

### **問題: 消耗品リストが表示されない**
- **原因**: `consumables` が配列形式ではない
- **解決**: 配列形式に変更（上記例参照）

### **問題: チャートが描画されない**
- **原因**: `radarChartData` または `reviewKeywords` が欠けている
- **解決**: 必須フィールドを追加

### **問題: ツールチップが自動表示されない**
- **原因**: JavaScriptが古いバージョン
- **解決**: `template-unified.html` の最新版を使用

---

## 📚 **参考情報**

### **完璧な製品例**
- `products/data/switchbot-k11-plus.json`
- `products/switchbot-k11-plus.html`

### **最新テンプレート**
- `products/template-unified.html`

### **自動ロードスクリプト**
- `products/js/product-loader.js` (V3.2)

### **現在のバージョン**
- V3.12 (価格ツールチップ視認性向上)
- V3.11 (価格ツールチップ実装)
- V3.10 (データ形式統一)

---

## 🎉 **完了！**

以上の手順に従えば、Geminiからのプロンプト1つで新製品ページを**完璧に**追加できます！
