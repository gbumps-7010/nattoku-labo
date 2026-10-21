# ナットクLabo 運用引継ぎ（Claude向け）／2026-10-20

**更新 2026-10-21（main @ 3169307）:** 生成スクリプトが公開中HTMLを再現できない件（§4.1）、SEO上書きファイル・プリレンダ修正・改行処理（§2.4）を追記。記事・文言の編集は Claude Code で実施する運用に変更。作戦は [`strategy.md`](./strategy.md)。

このドキュメントは、今後の作業分担と現状の正確な引き継ぎ用です。  
**正規の置き場:** リポジトリ `docs/ops/`（Claude Code はルート `CLAUDE.md` 経由で最初に読む）。  
あわせて読む：**[`keyword-audit.md`](./keyword-audit.md)**（同ディレクトリ）。

---

## 0. 作業分担（確定）

### 0.1 絶対ルール：点数・計算ロジックは聖域

このサイトの核は、口コミから導いた**計算済みの点数・順位・信頼度**である。  
**Claude（およびSEO／文言担当）が、都合よく・ロジカルに見せるために点数を書き換えたり、計算式を変えたりすることは禁止。**

| 触ってよい | 触ってはいけない |
|------------|------------------|
| title / meta / h1 の文言・検索語 | `performanceAnalysis.*.score` など**機能点** |
| 説明文・リード・内部リンク | **総合点**（機能平均×0.85＋信頼度×0.15 等） |
| ページ統合・301・カニバリ整理の**設計** | **口コミ信頼度**・DRI内訳 |
| プレースホルダー除去・表示バグ修正の**指示** | **ライフスタイル別スコア**・属性詳細点 |
| 「参考値」「口コミ少なめ」など**表示上のラベル** | ランキングの**並び替えロジックを点数改ざんで変える**こと |
| 新規記事の構成案（既存JSONの点数を**引用のみ**） | JSON内の件数・％・不満発生率を「きれいに」丸め直すこと |

**点数を更新してよい唯一の経路**  
スクショ等の**元データ収集 → 分析パイプライン／所定のJSON更新手順（Cursor側）**のみ。  
SEOのために「この機種を上げたい」等の理由で手入力修正は不可。

表示とデータの不一致（例：「最も高い」と表の点が違う）を見つけた場合：
1. **点数側を合わせるな**（勝手に書き換えない）
2. 生成ロジック／表示文言のバグとして報告し、Cursor側で調査させる

### 0.2 担当表

| 担当 | やること | やらないこと |
|------|----------|--------------|
| **Cursor** | **元データの作成に徹する**：スクショ収集、口コミ／製品JSON化、所定手順でのデータ反映、prerender等の再生成、**git commit / push**、ローカル確認 | SEO設計・タイトル案・記事構成の主担当にはしない。Claude指示でも**点数・計算式は変更しない** |
| **Claude** | SEO設計、タイトル／本文方針、ページ統合・新規記事の設計、カニバリ整理、keyword-audit の実装指示（**表示・文言・導線のみ**）、品質チェック方針 | 本番 push。スクショからのデータ抽出の主担当。**いかなる理由でも計算済み点数・順位ロジックの改変を指示／実行しない** |

**連携の型**
1. Claudeが「何を直すか・どのファイル・完成条件」を指示書に落とす（**点数変更を含めない**）  
2. Cursorが元データ更新 or 表示実装 → push  
3. GSC・スクショは Cursor側で集め、必要なら Claude に渡して次の設計へ

---

## 1. リポジトリ現状

| 項目 | 値 |
|------|-----|
| リポジトリ | `https://github.com/gbumps-7010/nattoku-labo.git` |
| 本番 | `https://nattoku-labo.com/`（Cloudflare Pages想定） |
| ブランチ | `main`（`origin/main` と同期済み） |
| 最新コミット | `3169307` — *Retitle the quietness ranking, link product cards to rankings, and break hero text at punctuation.*（2026-10-21） |
| 作業ディレクトリ（Claude Code / Cursor 共通） | `C:\Users\naoto\Desktop\nattoku-labo` |

**注意:** ローカルに `__pycache__` の未追跡があってもコミットしない。

---

## 2. すでに本番反映済み（2.1 は Cursor、2.4 は Claude Code で実施）

参照：修正指示書 `nattoku-labo-fix-list.md`（2026-10-19）＋その後の合意。

### 2.1 SEO・構造（P0〜P2の主要部）

- **トップ** title/description/h1 に「ロボット掃除機」入り（P0-2）
- **エコバックス比較** title/h1 に DEEBOT・評判（P0-3）
- **製品ページプリレンダ（P0-1）**  
  静的HTMLに焼き込み済み：総合性能8項目、口コミキーワード、不満点と対策、ライフスタイル別スコア、価格チェック用静的フォールバック、パンくず実名、更新バッジ（60日超は「○月時点」）
- **JSON-LD** Product + 編集部 Review（**aggregateRating は付けない**方針で確定）
- **メーカー比較** 機能別・暮らし方別は**コンパクト化**（詳細ブロックは予算別のみ）
- **「機種名＋です。」** 除去、太字途中切れロジック修正
- **トップ全製品リンク** 54機種同期
- **時間創出「年間115.6時間」** 製品ページから削除 → about へのリンクのみ
- **ランキング** 口コミ20件未満に「参考値」バッジ（除外はしない）
- U+2060：SEO枠（title/meta/h1〜h3/JSON-LD）除去用スクリプトあり。**本文にはまだ残る**

### 2.2 以前確定した「勝ち筋5入口」（GSCベース・旧方針）

| 優先 | 意図 | ページ |
|------|------|--------|
| 1 | エコバックス評判／比較／T50差 | `/makers/ecovacs` + 製品 |
| 2 | 静音 | `/rankings/quietness` |
| 3 | 安い／5万以下 | `/compare/...under-5man` + `/guides/...cheap` |
| 4 | ドリーミー比較 | `/makers/dreame` |
| 5 | 機種口コミ | `/products/*` |

※ **2026-10-20 の keyword-audit がより詳細で、次の優先は監査書の「作業順」に更新する。**  
旧勝ち筋は捨てないが、ルンバ／Eufyタイトル・水拭き転換などが上位に来る。

### 2.3 保留のまま（触らない）

- **価格表示の全面更新**（公式価格とのずれ）— 別タスク
- **aggregateRating** — 付けない
- 口コミ少数機種のランキング**除外** — しない（参考値のみ）

### 2.4 2026-10-21 に本番反映（Claude Code で実施）

| コミット | 内容 |
|---|---|
| `55065a0` | `functions/_middleware.js` で内部ファイルを 404（`/docs/`・`/scripts/`・`/drafts/`・`/products/examples/`・`*.md`・`*.backup`・`.` で始まるパス〔`/.well-known/` は除く〕・作業用 txt など）。旧 `/drafts/` URL の 301 は維持 |
| `735faff` | エコバックス T50S・T50・N30 のタイトル／説明文を個別化、N30⇔N30 PLUS の相互リンク、ブラウザ側の SEO 上書き停止、プリレンダの重複バグ修正 |
| `3169307` | 静音ランキングのタイトル等変更、製品カードからランキングへのリンク、見出し・リード文の改行処理 |

**製品ページのタイトル・説明文の個別上書き: `scripts/data/seo-overrides.json`**
- 製品IDごとに `title` / `description` を書くと、`scripts/prerender-product-pages.js` の `buildMetadata()` がそれを使う。書いていない製品は共通書式のまま。
- `description` の `{totalReviews}` は製品JSONの総口コミ数に置き換わる。点数・件数を手書きしない。
- 現在の対象: `deebot-t50s-omni` / `deebot-t50-omni` / `deebot-n30`。

**ブラウザ側（`products/js/product-loader.js`）はプリレンダ済みページを上書きしない**
- `isPrerenderedPage()`（`BreadcrumbList` の JSON-LD があるか）で判定し、title・meta・og・JSON-LD・パンくず・H1・総合性能分析カードを作り直さない。
- 以前は表示時に JSON-LD を Review なしの Product に置き換え、パンくずも ® 付きの名前に戻していた（どちらも解消）。
- SEO枠の正はプリレンダ側。loader の挙動を変えたら `prerender-product-pages.js` の `LOADER_V` を上げてキャッシュを切る（現在 `20261021b`）。

**プリレンダの修正（再実行しても壊れない）**
- ライフスタイル別の相性診断（`injectAttributeScores`）が入れ子の `</div>` の手前までしか置き換えず、実行のたびに項目が重複していた。カード内の最後の `</div>` まで置き換えるよう修正。
- 本番の T50S ページは既にこの重複で壊れていた（`735faff` で修復済み）。
- 確認方法: `node scripts/prerender-product-pages.js --all` を2回続けて実行し、2回目が `0 updated` になること。

**総合性能分析カードからランキングへのリンク（`scripts/lib/prerender-sections.js` の `PERF_MAPPING`）**
- フローリング・カーペット・静音性のカードに各ランキングへのリンク。点数 80 以上かどうかで文言だけ変える（点数は変えない）。
- floor-cleaning を水拭き軸に転換して URL を変える場合は、ここの `href` も直す。

**見出し・リード文の改行（句読点と「｜」で改行）**
- 仕組み: h1 と `<p class="lede">` を節ごとの `span.clause`（`display:inline-block; word-break:auto-phrase; text-wrap:pretty`）で包む。10文字未満の節は次の節とつなげる。
- rankings: `scripts/generate-floor-ranking-page.py` が生成時に処理（`scripts/lib/format_prose.py` の `clause_lines()`）。
- guides / makers / compare: 生成スクリプトでは処理できないため（§4.1）、後処理の **`scripts/apply_clause_breaks.py`** で公開中HTMLを直接加工する。何度実行しても結果は同じ。
- `products/js/prose-init.js`（compare/ と トップで使用）は `.clause` を含む要素を作り直さない。


---

## 3. 次にやるべきこと（Claude主担当）

**一次ソース:** [`docs/ops/keyword-audit.md`](./keyword-audit.md)

### すぐ（作業小・効果大）

1. ルンバ8ページ・Eufy9ページの**タイトルを検索表記に揃える**（テンプレ一括）
2. `/makers/irobot`・`/makers/anker` のタイトル修正（比較・おすすめ・Eufy）
3. `/rankings/floor-cleaning` を**「水拭き」軸に転換**（中身スコア流用可）
4. `/guides/robot-vacuum-small` に「小型・一人暮らし」を入れる

### 構造整理

5. `under-5man` → `cheap` へ統合（301）
6. 15-20man と 20man-plus の統合検討
7. `/makers/` ハブと `/guides/robot-vacuum-makers` のカニバリ解消
8. 価格帯比較ページは回訴求用に割り切り、タイトル先頭を価格帯に

### 技術・品質（実装は Cursor でも可／設計は Claude）

9. サイトマップ自動生成＋lastmod（575 Combo 等が欠けている指摘あり）
10. 「かんたんリンクを読み込み中…」等のプレースホルダーを静的HTMLから除去
11. 口コミ0件項目を「—」表示
12. 「最も高い／総合1位」と表の点数不一致のロジック確認
13. description の件数（総数 vs 採用数）表記統一

### 新規ページ候補（期限・優先）

| 優先 | キーワード | メモ |
|------|------------|------|
| 高・期限 | ふるさと納税（390、伸び中） | 年末前 |
| 高 | 段差ランキング（880） | スコア既存 |
| 高 | 日本製（1,900） | 受け皿なし |
| 中 | ロボロック vs ルンバ（390） | |
| 中 | ルンバ 405/505 違い（320） | |

---

## 4. 重要ファイルマップ（実装時）

| 用途 | パス |
|------|------|
| 製品プリレンダ | `scripts/prerender-product-pages.js` + `scripts/lib/prerender-sections.js` |
| 製品ごとの title / description 上書き | `scripts/data/seo-overrides.json` |
| 製品JSON | `products/data/{id}.json` |
| 製品HTML | `products/{id}.html` |
| メーカー比較生成 ⚠ | `drafts/build-manufacturer-compare-preview.py`（§4.1：実行禁止） |
| フラットレイアウト再適用 | `scripts/apply_flat_layout_prototype.py` |
| ランキング生成 | `scripts/generate-floor-ranking-page.py`（再現OK） |
| ガイド生成 ⚠ | `scripts/generate-guide-articles.py`（§4.1：実行禁止） |
| 価格帯比較生成 ⚠ | `scripts/generate-compare-band-pages.js`（§4.1：実行禁止） |
| 見出し・リード文の改行（後処理） | `scripts/apply_clause_breaks.py` |
| トップ製品一覧同期 | `scripts/sync-index-product-list.js` |
| SEO枠から WJ 除去 | `scripts/strip-wj-from-seo.js` |
| 強調・改行 | `scripts/lib/format_prose.py`（`clause_lines()` を含む）/ `format-prose.js` |
| 口コミローダー（ランタイム） | `products/js/product-loader.js` |
| 静的テキストの強調（ランタイム） | `products/js/prose-init.js`（compare/ とトップ） |
| 内部ファイルの 404 | `functions/_middleware.js` |

**よく使うコマンド**
```bash
node scripts/prerender-product-pages.js --all   # 2回目が 0 updated になることを確認
python scripts/generate-floor-ranking-page.py
python scripts/apply_clause_breaks.py           # guides / makers / compare の改行処理（再実行OK）
node scripts/sync-index-product-list.js
git push origin HEAD   # ユーザー指示時のみ
```

### 4.1 ⚠ 生成スクリプトが公開中のHTMLを再現できない（guides / makers / compare）

2026-10-21 に、変更を入れる前の状態で次の3本を実行して確認した。**どれも公開中のページを再現できず、大量に削除が出る。**

| スクリプト | 出力先 | 変更前のコードで実行した結果 |
|---|---|---|
| `scripts/generate-guide-articles.py` | `guides/` 8ページ | +491 / −3,671 行 |
| `scripts/generate-compare-band-pages.js` | `compare/robot-vacuum-*` 6ページ | +324 / −2,514 行 |
| `drafts/build-manufacturer-compare-preview.py` | `makers/` 6ページ | −2,521 行 |

- 原因: 公開中のページには、生成のあとに別のスクリプトや手作業で加えた内容（レイアウト調整、結論ブロック、ショップのカード、広告の差し込みなど）が入っており、生成スクリプトにはそれが反映されていない。
- **当面のルール: この3本は実行しない。** 実行すると本番の内容が消える。うっかり実行したら `git checkout -- guides/ compare/ makers/` で戻す。
- これらのページの文言を変えるときは、公開中のHTMLを直接編集するか、`apply_clause_breaks.py` のような**再実行しても壊れない後処理スクリプト**で加工する。
- 生成スクリプトを再び使うには、後から加えた加工をすべて生成スクリプト側に取り込み、「実行しても差分が出ない」状態を確認する必要がある（別タスク）。
- 再現できるもの: `prerender-product-pages.js`（2回目 0 updated）、`generate-floor-ranking-page.py`（差分は更新日のみ）。

---

## 5. データ収集（Cursor専任）の手順メモ

- 製品追加・口コミ更新は **スクショ → JSON（Geminiプロンプト系ドキュメントあり）→ `products/data/` → prerender / sync**
- 参照ドキュメント（リポ内）:  
  `products/NEW_PRODUCT_GUIDE.md`、`products/GEMINI_ADD_PRODUCT_FROM_JSON.md`、`products/GEMINI_PROMPT_CORE.md`
- 価格の公式突き合わせは別タスクとして保留中。スクショ収集時も「価格を本番に載せ替える」は指示があるまでやらない。

---

## 6. Claudeへの依頼テンプレ（コピペ用）

```
【役割】ナットクLaboのSEO／コンテンツ設計（実装・push・元データはCursor）
【必読】docs/ops/handoff-claude.md と docs/ops/keyword-audit.md（CLAUDE.md からも指定）
【現状】main @ 92c16c6、fix-list主要項は本番反映済み
【聖域】performanceAnalysis / 総合点 / 信頼度 / 属性スコア / 順位計算は変更禁止。
       不一致は「表示バグ」として報告し、点数を合わせる指示は出さない。
【今回やってほしいこと】
（例）ルンバ8＋Eufy9のタイトル修正案を、検索語付きの変更表で出して。
      実装用に「どの生成スクリプト／どのフィールドを直すか」まで書いて。
【やってほしくないこと】aggregateRating、価格全面更新、口コミ少数のランキング除外、
点数・％・件数の手直し、計算式の変更提案
【成果物】変更表＋完成条件＋Cursor向け実装指示（ファイルパス付き・データ改変なし）
```

---

## 7. Cursorへの依頼テンプレ（コピペ用）

```
【Cursor担当】元データ作成（スクショ→JSON等）／表示実装の反映／push
【聖域】Claude指示でも、計算済み点数・計算ロジックは変更しない
【指示書】Claudeの変更表に従う（文言・導線・生成HTMLの表示系のみ）
【完了後】git status確認 → commit → push origin main
【除外】__pycache__、意図しない navigation.js の改行だけの差分
```

---

## 8. 判断済みポリシー（再掲）

- **点数・計算ロジックは聖域**（§0.1）。更新は元データ収集ルートのみ
- Reviewスニペット: **編集部 Review のみ**（第三者集計の aggregateRating なし）
- 低口コミ: **参考値バッジ**、ランキング除外なし
- 時間創出の共通数値: 製品ページに載せない
- WORD JOINER: SEO枠優先で除去、本文は段階的
- 価格の古さ: **保留**

---

## 9. 引継ぎチェックリスト

- [x] 引継ぎを `docs/ops/` に配置し、ルート `CLAUDE.md` で「最初に必読」にした
- [ ] Claude Code でこのフォルダを開き、初回に引継ぎ読了を確認した
- [ ] Claudeは「次の1スプリント」を監査の作業順1〜3に限定し、**データ改変なし**で進める
- [ ] Cursorは元データ作成に徹する／pushはユーザー指示時（点数は所定パイプライン以外で触らない）
- [ ] push後、GSCでルンバ／Eufy／水拭き／irobotタイトルの表示・CTRを2〜4週間後に見る

---

以上。更新したら日付とコミットハッシュをこのファイル先頭に追記すること。
