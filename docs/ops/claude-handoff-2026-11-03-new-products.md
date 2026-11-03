# Claude 引継ぎ — 新規製品公開後の追記（2026-11-03）

**作成:** Cursor（製品追加バトン ②まで完了）  
**宛先:** Claude Code（バトン ③）  
**リポジトリ:** `C:\Users\naoto\Desktop\nattoku-labo`  
**本番 push:** まだしない。ユーザー指示後に Cursor が commit / push。

---

## 0. いまの状態（事実）

| 層 | 状態 |
|----|------|
| 製品 JSON / HTML / prerender | **更新済み**（新規含む） |
| `products-index.json` / `navigation.js` / トップ製品一覧 | **68機種**に同期済み |
| `sitemap.xml` | **再生成済み**（99 URL / 製品68） |
| `/makers/*` `/compare/*` `/rankings/*` `/guides/*` | **未追記**（新規スラッグは未出現） |
| `seo-overrides` / dims / purchase-flow | **未追記**（要確認・必要分のみ） |

**聖域:** 点数・信頼度・属性スコア・順位ロジックは触らない。JSON のスコア／件数を「きれいに」しない。  
**禁止:** `guides` / `makers` / `compare` の一括再生成3本（公開HTMLを壊す）。手作業追記のみ。

---

## 1. Cursor が公開済みにした製品（Claude が足す対象）

すべて `affiliate.hpPublish=true`・index/nav/sitemap 済み。価格は公式（割引後）・確認日 2026-11-03。

| productId | 表示名 | メーカー | 口コミ件数 | 価格（税込） | 注意 |
|-----------|--------|----------|------------|--------------|------|
| `d20-pro` | D20 Pro | Dreame | 101 | 47,800 | |
| `d20-pro-plus` | D20 Pro Plus | Dreame | 106 | 68,800 | |
| `l40-ultra-ce` | L40 Ultra CE | Dreame | 17 | 55,800 | 公式割引後（通常 89,800） |
| `aqua10s-roller-ae` | Aqua10s Roller AE | Dreame | 18 | 99,800 | 公式割引後 |
| `aqua10-ultra-roller` | Aqua10 Ultra Roller | Dreame | 3 | 249,800 | **口コミ少**・参考表示に注意 |
| `deebot-t90-max-omni` | T90 MAX OMNI | ECOVACS | 12 | 139,800 | |
| `deebot-t90-pro-omni` | T90 PRO OMNI | ECOVACS | 18 | 159,800 | |
| `deebot-x12s-pro-omni` | DEEBOT X12S PRO OMNI | ECOVACS | 7 | 229,900 | 口コミ少め |
| `q7b-plus` | Q7B+ | Roborock | 71 | 49,980 | Amazon公式直販の現売価 |
| `qrevo-l-pro` | Qrevo L Pro | Roborock | 32 | 89,990 | |
| `qrevo-edge-2` | Qrevo Edge 2 | Roborock | 19 | 163,900 | |
| `roomba-plus-515-combo-autowash` | Roomba Plus 515 Combo | iRobot | 2 | 99,800 | **口コミ極少**・公式割引後 |
| `roomba-max-monster-875` | Roomba Max Monster 875 | iRobot | 1 | 249,800 | **口コミ極少** |

**保留（未公開）**
- `roomba-max-775-combo-autowash` … Amazon 口コミ0件のため JSON/ページ未作成

**既存で sitemap に載っていなかったが今回再生成で解消**
- `d20-pro` / `d20-pro-plus` / `qrevo-curvc`

---

## 2. Claude の作業（優先順）

### P0 — メーカー比較への手作業追記

対象ファイル例:
- `makers/dreame.html` … D20 Pro / Pro Plus / L40 Ultra CE / Aqua10s / Aqua10 Ultra
- `makers/ecovacs.html` … T90 MAX / T90 PRO / X12S PRO
- `makers/roborock.html` … Q7B+ / Qrevo L Pro / Qrevo Edge 2
- `makers/irobot.html` … Plus 515 / Max Monster 875

やること:
- 既存カード／表と同じ型で機種を追加（点数は JSON を**引用のみ**・改変禁止）
- 口コミ1〜3件の機種は「参考値」「口コミ少なめ」など**表示ラベル**で扱う（2026-11-03 決定：10件未満は機能別ランキングに載せない）
- タイトル／h1 は [`keyword-audit.md`](./keyword-audit.md) の makers 指摘も併せて直してよい（irobot・anker 等）

### P1 — 価格帯・ガイド・ランキング（手作業）

- 価格帯ページ（`compare/robot-vacuum-*-man.html` 等）に、価格が該当する新規を**手で**足す  
  ※ `scripts/generate-compare-band-pages.js` は**実行しない**
- 関連ガイド／ランキングで機種リストが固定列挙されている箇所のみ追記  
  ※ 一括再生成スクリプトは**実行しない**
- keyword-audit の作業順（ルンバ／Eufy タイトル、floor→水拭き、small に小型・一人暮らし）は並行可

### P2 — メタ／導線データ

必要なら（既存パターンに合わせて）:
- `scripts/data/seo-overrides.json`
- `scripts/data/dims/`（寸法など）
- `scripts/data/purchase-flow.json`
- 旧URLがあれば 301（`functions` / リダイレクト設定の既存流儀に従う）

変更後、製品ページの見た目確認が必要なら Cursor に prerender 再実行を依頼。

### やらないこと

- JSON の `performanceAnalysis` / 信頼度 / 属性スコアの書き換え
- `aggregateRating` の追加
- guides / makers / compare の生成スクリプト一括実行
- `git push`（ユーザーが Cursor に指示）

---

## 3. 完成条件（Claude）

1. 上記13機種が、少なくとも**所属メーカーの makers ページ**に掲載されている  
2. 価格帯ページで明らかに該当するものに抜けがない（手作業範囲で）  
3. 口コミ極少機種（515 / Monster 875 / Aqua10 Ultra 等）に過大な「おすすめ1位」表現を足していない  
4. 点数・件数を改変していない  
5. 作業ログをこのファイル末尾か `handoff-claude.md` に短く追記

---

## 4. ユーザー／Cursor への戻し方

Claude 作業後:
1. ユーザーが内容確認  
2. ユーザーが Cursor に **commit / push** を指示  
3. 必要なら Cursor が prerender / 表示バグ修正のみ担当

---

## 5. 参照

- 運用分担: [`handoff-claude.md`](./handoff-claude.md) §0.2  
- SEO優先: [`keyword-audit.md`](./keyword-audit.md)  
- 新規候補の経緯: [`new-products-2026-11.md`](./new-products-2026-11.md)（当時の未掲載リスト。本引継ぎの公開済み表を正とする）

---

## 6. Claude 作業ログ（2026-11-03 夜）

- **削除済み4機種の再混入を外した**：X8 Pro・G10 Hybrid・L20 Ultra Complete・Qrevo CurvC の JSON/HTML を退避し、index・nav・トップ・sitemap から除外（本番は410のまま）。製品数は64
- **未公開JSON5件を products/data から退避**（f10-plus・c20・x8-hybrid・n20-pro-plus・combo-10-max）。生成スクリプトは hpPublish を見ないため、置いたままだと掲載されてしまう
- **navigation.js の PRICE_RANGES 二重宣言を修正**（ナビ全体が止まるエラー）
- D20 Pro / Pro Plus の旧URLを 410 → 301（`_redirects`・`_middleware.js`）
- 13機種の specs（`products/data/specs/`）と dims（`scripts/data/dims/`）を公式情報から追加。未記載は null
- seo-overrides に13機種のラベル、purchase-flow に D20 Pro ⇔ Pro Plus、ecNotOfficial に l40-ultra-ce（楽天リンク先が正規店でない）
- 製品ページ再プリレンダ、makers 6ページ・価格帯6ページ・ガイド8ページ・ランキング5ページを再生成（ガイドは live の `<style>` を戻してから後処理）。compare/index の件数を更新
- makers の価格帯おすすめで口コミ20件未満の機種には「口コミはまだN件のため、点数は参考値です」と添える（選定ロジックは変更なし）
- 退避先：Claude のスクラッチ（`scratchpad/cursor1103/removed`・`unpublished`）

**確認済み**：Eufy Omni S2 の価格 ¥249,900 → ¥199,900 はユーザー判断でこのまま公開（2026-11-03）

## 7. 口コミ10件未満のランキング除外（2026-11-03 ユーザー決定）

- 機能別ランキング4ページから口コミ10件未満を除外（`generate-floor-ranking-page.py` の `MIN_RANK_REVIEWS = 10`）。点数・順位の式は変更なし。各ランキング55機種、見方ボックスに除外数を明記
- 製品ページの本文冒頭に注意書き（`prerender-product-pages.js` の `injectLowSampleNotice`）。10件未満は「ランキングに載せていない」、10〜19件は「参考値」
- 聖域の文言を CLAUDE.md・handoff-claude.md・strategy.md で更新
- メーカー／価格帯／ガイドのおすすめ枠は対象外（ランキングのみ除外。2026-11-03 ユーザー決定）。20件未満の推しには参考値の注記あり

## 8. S2 の価格を公式価格に戻した（2026-11-03 ユーザー決定）

- `eufy-robot-vacuum-omni-s2.json` の price を 199,900 → 249,900（公式ストア価格、`priceCheckedAt` 2026-11-03）。products-index.json・products-data.js・navigation.js も同じ値に
- 価格帯が 15〜20万円 → 20万円〜 に移動（15〜20万円 8製品、20万円〜 5製品）。Anker メーカーページの15〜20万円のおすすめは S1 Pro に、20万円〜は S2 に
- 製品ページのプリレンダ、メーカー・価格帯・ガイド（height・makers）・ランキングを再生成、compare/index の件数を手で更新

## 9. Roborock 4機種を公開（2026-11-03）

- 公開：E5・Q7T+・Q7 Max・Qrevo C（掲載68製品）。依頼書は `cursor-request-2026-11-03-roborock.md`
- **S8 Max Ultra は見送り**（ユーザー決定）。かんたんリンク先の Amazon B0DB5TR54Z が今は Saros 10R／Saros 20 の商品ページで、S8 Max Ultra を選べないため。口コミ93件も同じ商品番号から集めたもので、Saros 10R の口コミが混ざっている可能性がある。JSON とページは scratchpad の `cursor1103/unpublished/` に退避
- 価格：リンク先の今の価格（`priceSource: "shop"`）。Q7 Max は新品の出品がなく、ユーザー指示で Amazon の中古品価格 ¥11,800（`priceSource: "amazon-used"`）。製品ページの価格注記とガイドに「中古品」と明記
- 製品ページの価格注記を priceSource からプリレンダ時に静的HTMLへ書くようにした（`injectPriceNote`。これまでは JS だけで差し替えていた）
- `sync-products-data-from-json.js` が navigation.js に PRICE_RANGES を二重に入れる不具合を修正（2つ目以降を取り除く）
- specs・dims（roborock.json）・seo-overrides・purchase-flow（E5・Q7 Max を ecNotOfficial に）を追加
- 再生成：メーカー（Roborock 14機種、5〜7万円のおすすめが Qrevo C・口コミ18件で参考値の注記つき）、価格帯（〜5万円 22製品、5〜7万円 10製品）、ガイド（cheap・height・makers・small・thin）、ランキング（57製品。Q7T+ 2件・Q7 Max 9件は除外）
- 安いガイドの「1万円台の機種は分析していません」を、2万円未満の機種があるときはその機種を挙げる文に変更

## 口コミの出典を明記（2026-11-03 ユーザー決定）

- 「2大ECサイト／２大ECサイト」を **「Amazon・楽天市場」** に置換（compare・guides・makers の本文と meta、生成元 `generate-compare-band-pages.js` / `generate-guide-articles.py` / `drafts/build-manufacturer-compare-preview.py`、強調語リスト `format-prose.js`×2・`format_prose.py`）。メーカーの「すべての口コミ」は誇張になるため「口コミ」に。
- 製品ページ69件：「口コミの信頼度」の件数の直下に `p.review-source-note`（集計の元データ：Amazon・楽天市場の公開レビュー／文章は転載せず分類・集計）。**新製品ページも既存ページを雛形にすればこの一文が入る**。
- ランキング：「このランキングの見方」に同趣旨の一文（生成元に追加済み）。
- about：分析アプローチ01を「Amazon・楽天市場の口コミ横断分析」に、「口コミデータの出典と扱い方」ボックス（出典・転載しない・除外・非公認）を追加。
- 方針：title・h1・ロゴには出さない。口コミ本文の転載、サイト別の星評価表示、aggregateRating はしない。
