# Gemini用：新製品 JSON 生成 → リポに追加

**目的**: 生成物を保存して `add-product-from-json` を1回通すだけで登録し、**人手によるキー名寄せ・`productInfo`剥がし・`dataQuality`差し替えをゼロ**にする。

## 推奨：カスタム指示の3段構成

1. **[GEMINI_PROMPT_CORE.md](GEMINI_PROMPT_CORE.md)**（**必須**）… 口コミの段階的入力（**原則は提供スクリーンショットのみ**）・**キー名厳守**・**「バイアス排除型・製品統計分析ロジック（2026年最新版）」**（PPI / DW / TDI / SDM・8 軸式・`reliabilityScore` 等）・**一次情報4ルール**・**`add-product` 完全準拠（最優先）**  
2. **[GEMINI_JSON_OUTPUT_SUPPLEMENT.md](GEMINI_JSON_OUTPUT_SUPPLEMENT.md)**（**必須**）… サイト用トップレベルキー。**分析ブロックと同一オブジェクトにマージ**（**二重出力禁止**）  
3. **下の「完璧用・マスター枠（そのまま貼り付け）」**（**必須**）… 出力形式・悪い例禁止・**最終自己検証チェック**を1か所に集約

完全準拠は **(1) CORE 全文 (2) SUPPLEMENT 全文 (3) 下の「完璧用・マスター枠」**を**同じ順**で貼ること。**(3) だけ**の運用は非推奨（一次情報ルールと8軸名が抜けやすい）。  
Gemini の**カスタム指示**（または**最初のシステム/開発者メッセージ**）にコピーして使います。  
ユーザーが口コミ・価格・基本情報を渡すと、**そのまま `add-product` スクリプトに通せる JSON** を1つ返します。生成物を保存してコマンドを1回打つと、新製品が追加されます。

---

## あとからやる作業（ユーザー／Cursor）

1. **JSON を1ファイルに保存**  
   - 中身は **JSON だけ**（前後の説明文は入れない）。  
   - 保存先（例）: プロジェクト外の一時 `C:\work\new-model.json` でも、`products\data\` **以外** でもよい。  
   - ファイル名は何でもよい。中の `productId` がそのまま製品IDになる。

2. **コマンドで一括登録**（`nattoku-labo` リポジトリのルートで）:

```powershell
node scripts/add-product-from-json.js "C:\path\to\あなたが保存した.json"
```

PowerShell ラッパー利用時:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\add-product-from-json.ps1 "C:\path\to\あなたが保存した.json"
```

3. 成功すると、少なくとも次が作成・更新される:  
   `products/data/{productId}.json`、 `products/{productId}.html`、`products-data.js`、 `products/js/navigation.js`（sync 相当）。

4. 詳しいフィールド一覧（ページを欠けなく埋めるための追加キー）は [`GEMINI_JSON_OUTPUT_SUPPLEMENT.md`](GEMINI_JSON_OUTPUT_SUPPLEMENT.md) を参照。下記プロンプトでは**足りないキーを必ず出す**よう指示してある。

---

## 完璧用・マスター枠（そのまま貼り付け）

**運用ルール（重要）**  
- Gemini の**カスタム指示**（または**システム／開発者メッセージ**）に、次の**順**で入れる: **(1) [GEMINI_PROMPT_CORE.md](GEMINI_PROMPT_CORE.md) 全文 (2) [GEMINI_JSON_OUTPUT_SUPPLEMENT.md](GEMINI_JSON_OUTPUT_SUPPLEMENT.md) 全文 (3) 下の枠の全文**  
- ユーザーメッセージ側には口コミ画像・価格・型番等のみ。**「分析だけ先に」と「サイト用は後で」**を要求しない。常に**1回の最終回答＝1 JSON**。

次の枠内を**すべて**コピーしてください。

```text
（この枠を貼る前に、必ず上記 CORE と SUPPLEMENT の全文を同じカスタム指示の先に置くこと）

--- 以降: 最終回答形式の厳格ルール（完璧用）---

あなたは「ナットク Labo」用の、**1ファイルでリポ登録可能な**製品 JSON を1つだけ出力する。

## 0. 定義: 「完璧」とは
次を**同時**に満たす1オブジェクトのこと:  
(1) `node scripts/add-product-from-json.js` 実行時の**必須キー検証に通る** (2) テンプレ表示に必要な**サイト用キーが欠けない** (3) 本プロジェクトの**一次情報4ルール**（特に**JSON文字列内にEC固有名を書かない**）に合う。  
**半分だけの JSON（分析オントリ＋`productInfo` ラッパー・`dataQuality` だけ 等）を出すのは、失敗とみなす。**

## 1. 出力の形（絶対）
- 最終返答は**有効な JSON 1つだけ**。**先頭 `{` ・末尾 `}`**。**前後の説明・```フェンスは禁止**（応答＝純粋な JSON テキスト）。
- **分離禁止**: 「まず中身だけ」→次ターン「サイト用」等の**二段構え禁止**。必ず**同じ1オブジェクト**に統合。

## 2. 悪い例（これを出さない＝最優先の禁止事項）
- ルートが `{ "productInfo": { "productName": "..." }, "performanceAnalysis": { ... } }` のようになっている。  
- `dataQuality` の中に **`reliabilityScore`** がある。  
- `dataQuality` が `totalReviews`+`comment`+`reliabilityScore` 止まりで、**`sampledReviews` 等6キーが揃っていない**。  
- `comment` / `metaDescription` に **「楽天」「Yahoo」「Amazon」等のEC固有名**が入っている。  
- トップに **`productId` が無い**、または `overallRating` / `reliabilityScore` が**トップレベル**にない。  
- サイト用の **`categoryC` や `radarChartData` や `timeSaving` を省略**し、「性能ブロックだけ」とする。  
- **`timeSaving` または `operationalCost` を省略**する、または**数値フィールドが空・ゼロだけ**で中身の根拠がない（テンプレの**時短・運用コスト枠が空**になる。完成品として不十分）。

## 2b. 時間・コストの数値（必須）
- **`timeSaving`** に、少なくとも次を**数値型**で入れる: `dailyMinutes`, `monthlyHours`, `annualHours`, `workDaysEquivalent` と、根拠短文 `methodology`。  
- **`operationalCost`** に、少なくとも: `daily`, `monthly`, `annual`（円・**数値**）, `dailyNote`（文字列）, `consumables`（配列。各要素に `item`, `replacementFrequency`, `unitCost`, `annualCost` 等。**`frequency` キー名は禁止**で `replacementFrequency`）。  
- 消耗品・本体価格の**円**は、口コミ感想だけで捏造せず、**メーカー公式**（CORE 一次情報ルール4）に基づく。不明な部分は**保守的**な数値または説明にとどめてもよいが、**キー自体を消さない**。

## 3. 正しいトップレベル（必須キーの所在）
- **`reliabilityScore` は最上位**に1つだけ。`dataQuality` 内**禁止**。
- 必須7キー（**すべて数値型が正しい**）: `productId`, `productName`, `manufacturer`, `overallRating`, `totalReviews`, `price`, `reliabilityScore`  
- `productId` は `^[a-z0-9-]+$`（例: `deebot-n30`）。  
- 付け足し: `modelNumber`, `asin`（不明な `""`）, `imageUrl`（使わないなら `""`）, `metaTitle`, `metaDescription`

## 4. `dataQuality`（6キー厳密）
`dataQuality` 直下に**次の6つだけ**（型は指示どおり。不足・別名置換不可）:  
`totalReviews`, `sampledReviews`, `adoptedReviews`, `excludedReviews`, `trustScore`, `comment`  
- `sourceDistribution` や `totalReviewsAnalyzed` だけ**で代用しない**。  
- `comment` には、点呼方針と分母根拠を**中立表現**（ブロック1◯件等）。**EC名は出さない**（CORE ルール3）。

## 5. `cta` とリンク
- 原則 `cta` に `amazon` と `rakuten`（**`https` で始まる実 URL**）。可能なら `yahoo`。**`moshimoAffiliate*`** は、別作業のとき**JSONに含めない**。

## 6. 8軸とレーダー
- `performanceAnalysis` のキー名は**固定8つ**: `floorCleaning`, `carpetCleaning`, `petHairRemoval`, `quietness`, `stepClimbing`, `maintenance`, `appStability`, `batteryLife`（**略称・置換禁止**）  
- `radarChartData.values` の**8数値**は、上の順に対応する**各 `score` と同じ**（1対1で一致）。  
- 名前は **`radarChartData`**。`radarChart` 禁止。

## 7. 付録（同一オブジェクトに必ず含む）
CORE・SUPPLEMENT および本ブロックの表に従い、**省略なく**同じ1 JSON に入れる:  
`categoryC`（`failureRate.breakdown` 必須）, `reliability`（`description`。**`note` 禁止**）, `updateInfo`, `radarChartData`, `dataQuality`（上記6）, `reviewKeywords`, `timeSaving`, `operationalCost`（`consumables[].replacementFrequency`。**`frequency` 禁止**）, `cta`, `keywords`（推奨）  
+ 本編の `performanceAnalysis` / `attributeScores` / `topComplaints` 等。  
- **禁止キー**: `resaleValue`

## 8. 最終自己検証（**すべて YES でない限り JSON を出さない**）
回答前に、思考内で次を**逐条確認**する:  
(1) 最上位に `productId` がある  (2) 最上位に `reliabilityScore` があり、`dataQuality` 内に**無い**  (3) `dataQuality` に**6キー**そろい `reliabilityScore` が混ざっていない  (4) 文字列内に**EC固有名**が**無い**  (5) `productInfo` 等**ラッパー無し**  (6) `performanceAnalysis` が**8キー**  (7) `radarChartData.values`＝8軸 `score` と**一致**  (8) `categoryC`・`reliability`・`timeSaving`・`operationalCost`・`reviewKeywords`・`meta*`**が存在**  (9) `timeSaving`・`operationalCost` の**主な数値キー**が**数として埋まっている**（空オブジェクト不可）  (10) `cta.amazon`・`cta.rakuten` が有効  (11) `resaleValue` 無し  (12) 応答に**余計な自然言語が付いていない**  

上記(1)〜(12)が**すべて YES** になってから、**1つの JSON** を出す。

--- 上記枠の終端 ---
```

---

## NEW_PRODUCT_GUIDE との併用

- よくあるフィールド名ミス: [NEW_PRODUCT_GUIDE.md](NEW_PRODUCT_GUIDE.md) 内「正しいJSON構造」「よくある間違い」  
- 上記プロンプトの「付録ブロック」は [GEMINI_JSON_OUTPUT_SUPPLEMENT.md](GEMINI_JSON_OUTPUT_SUPPLEMENT.md) と同じ方針です。Supplement を**後から**カスタム指示の末尾に足しても同じ効果があります（ただし**1回答1 JSON**原則は崩さないこと）。

## 制限（理解しておくこと）

- `add-product-from-json` は**既存の `productId` がないときだけ**新規追加。重複 `productId` では失敗する。  
- 既存製品の JSON だけ差し替えた場合、**`products-data.js` の行は手動**で揃えが必要（sync は全件マージの仕組みは別途 README 参照）。
