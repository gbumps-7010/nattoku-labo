# Gemini 製品 JSON：不足フィールド追記用サプリメント

**口コミ分析・計算式・キー名厳守の本編**は [GEMINI_PROMPT_CORE.md](GEMINI_PROMPT_CORE.md) を**先に**置く（**口コミ＝提供スクショ中心・件数点呼・JSON 上は EC 固有名を出さない・運用コスト数値はメーカー公式**、は本編先頭の「一次情報・表記・コストの絶対ルール」に集約）。**本書の表は、本編の `performanceAnalysis` 等と同じトップレベルオブジェクトにマージ**する（「分析JSON」と「補足JSON」の**二重出力・後から貼る**は、欠落の原因になるため非推奨）。  
**貼るだけで新製品追加まで誘導**する短い枠は [GEMINI_ADD_PRODUCT_FROM_JSON.md](GEMINI_ADD_PRODUCT_FROM_JSON.md)。本ファイルは**本編の直後に足す**サイト用スキーマ追記です。  

既存のカスタム指示（計算ロジック・`performanceAnalysis` / `attributeScores` / `topComplaints` のルール・キー名厳守など）は**変更せず**、その**末尾にそのまま追記**（実際には**1回答＝1 JSON**に本書キーを**統合**）してください。  
かんたんリンク（`moshimoAffiliate*`）は別作業のため **JSON に含めない**。

---

## 出力形式（厳守）

- **トップレベルにすべてのキーを置く**（`productInfo` などのラッパーオブジェクトは禁止）。
- **`productId`**: 英小文字・数字・ハイフンのみ。`products/data/{productId}.json` および `products/{productId}.html` のファイル名と一致させる。

---

## 必須：サイトが読むが、分析ブロック以外のフィールド

以下は `products/js/product-loader.js` および `products/template-unified.html` が参照します。**既存の計算式・レビュー集計ルールは変えず**、出力 JSON に**必ず含める**こと。

### メタ・基本

| キー | 型 | 説明 |
|------|-----|------|
| `productId` | string | 上記 |
| `productName` | string | |
| `manufacturer` | string | |
| `modelNumber` | string | 不明時は製品名から推測可能な表記 |
| `overallRating` | number | 例: 4.5 |
| `totalReviews` | number | 既存ルールの分母 |
| `price` | number | 円・整数 |
| `reliabilityScore` | number | 既存の信頼度計算結果（トップレベル） |
| `asin` | string | 不明時は `""` |
| `imageUrl` | string | 任意。使わない場合は `""` |
| `metaTitle` | string | `document.title` 用 |
| `metaDescription` | string | meta description 用 |

### `categoryC`（満足度3カード）

既存指示のまま、次の構造を必須とする。

- `userSatisfaction`: `score`（数値）, `reviewCount`, `comment`
- `repurchaseIntention`: `percentage`, `reviewCount`, `comment`
- `failureRate`: `percentage`, `reviewCount`, **`breakdown`**（`hardware` / `software` / `environmental` の数値）, `comment`

### `reliability`（信頼度サブカード）

既存の **ReliabilityScore および加重配分の計算**はそのまま。出力は次の形に揃える（キー名は実装と一致）。

- `score`（数値。`reliabilityScore` と整合させる）
- `dataAdequacy`: `score`, `weight`, `description`（**`description`**。`note` 禁止）
- `consistency`: **`score`**（0–100 台。コアの加重式用）, `weight`, `description`（**`description`**。`note` 禁止）。表示用に **`percentage`** を併記してもよい（`product-loader` は表示に `percentage` または `score` を使用）
- `freshness`: `score`, `weight`, `description`

### `updateInfo`

- `lastUpdated`（例: `"2026-04-18"`）
- `note`（任意。あればテンプレの注記ボックスに表示）
- `isLatest`（任意。`true` / `false` でバッジ文言が変わる）

### `radarChartData`（レーダーチャート必須）

```json
"radarChartData": {
  "labels": ["床掃除", "カーペット", "ペット毛", "静音性", "段差", "メンテ", "アプリ", "電池"],
  "values": [ /* 8個。順序は labels と performanceAnalysis の8軸に対応 */ ]
}
```

- `values` の各要素は **`performanceAnalysis` の同名スコア**と一致させる（ズレ防止）。

### `dataQuality`

- `totalReviews`, `sampledReviews`, `adoptedReviews`, `excludedReviews`（数値）
- `trustScore`（数値。表示は小数第2位まで）
- `comment`（**提供スクリーンショット**による点呼・分母根拠を明記。[CORE] の一次情報ルール。**表示文に EC 固有名を書かない**）
- プラットフォーム別件数（`amazonConfirmedReviews` 等）は**任意**（スキーマ互換用。中身の**説明文**は中立表現に置き換えてよい）

### `reviewKeywords`（チャート用）

```json
"reviewKeywords": {
  "positive": [ { "keyword": "…", "count": 10 }, … ],
  "negative": [ { "keyword": "…", "count": 5 }, … ]
}
```

- 正のキーワードは多めに（テンプレでは最大8件使用）、負は最大7件程度を想定。

### `timeSaving`

```json
"timeSaving": {
  "dailyMinutes": 19,
  "monthlyHours": 9.7,
  "annualHours": 116,
  "workDaysEquivalent": 14.5,
  "methodology": "（算出根拠の短文）"
}
```

- 数値は**数値型**。既存の「時間節約の計算ルール」があればそれに従う。  
- **省略不可**: `product-loader.js` は `timeSaving` 無しなら**時短ブロックを更新しない**（枠が空のまま）。Gemini 生成の**完成JSONには必ず含める**。

### `operationalCost`

```json
"operationalCost": {
  "daily": 120,
  "dailyNote": "（説明）",
  "monthly": 3600,
  "annual": 43200,
  "consumables": [
    {
      "item": "…",
      "replacementFrequency": "…",
      "unitCost": 1000,
      "annualCost": 6000
    }
  ]
}
```

- `replacementFrequency`（**`frequency` 禁止**）。既存の運用コスト計算ルールを維持。`unitCost` / `annualCost` 等の**円**の根拠は **[CORE] ルール4（メーカー公式・公式引用）**。口コミの感想だけで価格を埋めない。  
- **省略不可**: 無いと**運用コスト枠**が空のまま。`add-product` の検証必須項目ではないが、**ページ完成**には必要。

### `cta`（必須）

```json
"cta": {
  "amazon": "https://…",
  "rakuten": "https://…",
  "yahoo": "https://…"
}
```

- キー名は **`cta`**。`ctaLinks` は使わない。  
- 上記のキー名は**既存 `product-loader` 互換**の識別子。ユーザー向け**説明文**（`comment` 等）に EC 固有名を出さないのは [CORE] に従う。URL 自体は従来どおり入れてよい。

### `keywords`（任意・推奨）

文字列の配列: `[ "製品名", "メーカー", … ]`

---

## 明示的に出力しないこと

- **`resaleValue`**: サイトから削除済み。キーを含めない。
- **`moshimoAffiliate*`**（かんたんリンク等）: 別パイプラインで挿入。JSON に含めない。

---

## リポジトリ側のメンテ（開発者向け）

**2026-04-18 時点で反映済み**: `product-loader.js`（および `product-loader.js.backup`）から `updateResaleValue` を削除し、`products/data/*.json`（31 ファイル）から `resaleValue` キーを除去済み。

---

## 補足: 完璧な1回答の条件（人間用チェック）

本書の各キーは、**[GEMINI_PROMPT_CORE.md](GEMINI_PROMPT_CORE.md) の口コミ分析と同一のトップレベル**に**すべて**乗ること。下記のどれかが欠けると、実運用で Cursor 側の手戻りが出る。  

- トップ: `productId`・`reliabilityScore`（`dataQuality` 内に入れていない）  
- `dataQuality`: 6キー＋`comment` 無 EC 名  
- 本表のメタ / `categoryC` / `reliability` / `updateInfo` / `radarChartData` / `reviewKeywords` / `timeSaving` / `operationalCost` / `cta` / `keywords`（推奨）  
- [GEMINI_ADD_PRODUCT_FROM_JSON.md](GEMINI_ADD_PRODUCT_FROM_JSON.md) の**「完璧用・マスター枠」**に記載の**最終自己検証(1)〜(11)**がすべて満たせるか

Gemini には **CORE 全文 ＋ 本サプリ全文 ＋ マスター枠**の順を貼るのが最も事故が少ない。
