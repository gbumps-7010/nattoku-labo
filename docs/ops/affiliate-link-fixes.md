# アフィリエイトリンク差し替え作業リスト（2026-10-22・10-23 更新）

**10-23 反映済み:** 1・2 の6機種（管理表の新リンクを製品JSON・メーカー/ガイドの埋め込みに反映）、575 の直販リンク。**残り:** K10+ Pro（楽天ボタンが非公式のまま）、5 のカード名・ASIN。

**正規の置き場:** `docs/ops/affiliate-link-fixes.md`。調査の詳細は [affiliate-link-audit.md](affiliate-link-audit.md)。

管理表の列: **F = かんたんリンクHTML**（楽天・Amazon・Yahoo ボタンのカード）、**G = 直販リンク**。セル番地は 10-20 時点の管理表の並びから算出（行を足していたらずれるので製品名で確認）。

10-23 に再確認：L20 Ultra Complete・X8 Pro・G10 は公式が「販売終了」と明記。K10+ Pro は在庫切れのみ。575 は販売中。差し替えが終わったら知らせてください。overnight ブランチの `ecNotOfficial` と購入ブロックの見出しを合わせて直します。

## 1. 楽天公式に差し替えられる（すぐ直せる）

| ☐ | 製品 | セル | 今の状態 | やること | 差し替え先 | 差し替え先の状態 |
|---|---|---|---|---|---|---|
| ☑ | Eufy Robot Vacuum Omni S1 Pro | Anker!F9 | 楽天ボタンが非公式ショップ（youplan・売り切れ） | かんたんリンクを楽天公式の商品で作り直す | https://item.rakuten.co.jp/anker/t2080/ | 楽天公式 在庫あり |
| ☑ | L10s Ultra Gen 2 | Dreame!F12 | 楽天ボタンが非公式ショップ（fleurette01） | かんたんリンクを楽天公式の商品で作り直す | https://item.rakuten.co.jp/dreame-shop/l10sultragen2/ | 楽天公式 在庫あり |

## 2. 楽天公式に出品なし → Amazon 商品ページを主にして作り直す

| ☐ | 製品 | セル | 今の状態 | やること | 差し替え先 | 差し替え先の状態 |
|---|---|---|---|---|---|---|
| ☑ | Q10V | Roborock!F4 | 楽天ボタンが非公式ショップ（myr2026） | Amazon 商品ページでかんたんリンクを作り直す | https://www.amazon.co.jp/dp/B0F9K8KTYF | Amazon 販売元 Roborock JP |
| ☑ | Q10V+ | Roborock!F5 | 楽天ボタンが非公式ショップ（myr2026） | Amazon 商品ページでかんたんリンクを作り直す | https://www.amazon.co.jp/dp/B0F9KCJ493 | Amazon 販売元 Roborock JP |
| ☑ | Qrevo Curv 2 Flow | Roborock!F9 | 楽天ボタンが非公式ショップ（happymasaya） | Amazon 商品ページでかんたんリンクを作り直す | https://www.amazon.co.jp/dp/B0GXB2RZ9Y | Amazon 販売元 Roborock JP |
| ☑ | Roomba® Max 705 Combo + AutoWash™ | iRobot!F3 | 楽天ボタンが非公式ショップ（denkichiweb・売り切れ） | Amazon 商品ページでかんたんリンクを作り直す | https://www.amazon.co.jp/dp/B0FLYLR5XV | Amazon 販売元 Amazon.co.jp |

## 3. 販売終了 → サイトから削除済み（10-23・管理表 HP掲載 FALSE 済み）

公式が販売終了と明記しているもの。G30 を削除したとき（e1235f9）と同じ手順で、製品ページ・データの削除、一覧・比較・サイトマップからの除外、旧URLの 410 化を行う。管理表の HP掲載（E列）は FALSE に。

| ☐ | 製品 | HP掲載セル | 根拠 |
|---|---|---|---|
| ☑ | Eufy Clean X8 Pro with Self-Empty Station | Anker!E3 | Anker 公式ストア「販売終了しました。後継機 Eufy Robot Vacuum Omni C28」 |
| ☑ | Eufy RoboVac G10 Hybrid | Anker!E11 | Anker 公式ストア「販売終了しました。後継機 Eufy Robot Vacuum Auto-Empty C10」 |
| ☑ | L20 Ultra Complete | Dreame!E14 | 楽天 Dreame 公式「本製品は完売につき販売終了いたしました」。Dreame 公式ストアも売り切れ、Amazon も在庫切れ |

### 販売終了ではないので残すもの
| ☐ | 製品 | セル | 状態 | やること |
|---|---|---|---|---|
| ☐ | ロボット掃除機 K10+ Pro | SwitchBot!F7 | 公式ストアは「在庫切れ」表示のみ（販売終了の記載なし）。楽天公式に本体なし、Amazon カートなし | 楽天ボタンが非公式ショップ（rikusyouya・売り切れ）なので、直販リンク（A8・公式ストア）を主にしたカードにするか検討。K10+ Pro Combo は別製品なので差し替えない |

## 4. Plus 575 は販売中（10-23 管理表 G10 に A8 直販リンクが入り、サイトに反映済み）

- 楽天 iRobot 公式ショップで販売中：https://item.rakuten.co.jp/irobotstore/r285060/（¥169,800・在庫あり・「オンライン限定」モデル）。今のかんたんリンクの楽天ボタンはここに向いていて正しい
- Amazon では 2026年5月発売の表記。カートは第三者出品者
- iRobot 公式ストアの商品ページ（R285060）は残っているが**購入ボタンが出ない**。公式ラインナップ一覧にも載っていない（一覧は 105・405・505・515・715・775・875）
- → 公式ストアへの直販リンク（G列）は作らなくてよい。G10 は空欄のままで問題なし

## 5. 作り直すついでに直したいこと

### カード名の古い販促文（F 列のカードの商品名）
作り直すときに、商品名を販促文のない名前に書き換える。

- ☐ **Roomba® 105 Combo + AutoEmpty™**（iRobot!F2）: 「Roomba 105 Combo + AutoEmpty ルンバ オンライン限定 アイロボット ロボ…」
- ☐ **Roomba® Plus 405 Combo + AutoWash™**（iRobot!F9）: 「Roomba Plus 405 Combo + AutoWash ルンバ オンライン限定 アイロボッ…」
- ☐ **Roomba Plus 575 Combo + AutoWash**（iRobot!F10）: 「Roomba Plus 575 Combo + AutoWash ルンバ オンライン限定 アイロボッ…」
- ☐ **お掃除ロボットS10**（SwitchBot!F2）: 「SwitchBot スイッチボット ロボット掃除機 S10 走行中のモップ洗浄 - 水道直結 水交換…」

### 管理表の ASIN（C 列 amazon_url）
- ☐ **DEEBOT mini**・**Q10P**: 口コミURLがなく ASIN 不明。Amazon 商品ページを確認して C 列に入れる
- ☐ **Roomba Plus 405**: C 列の ASIN（B0GWDD6F19）が今は「Plus 415」の表示。正しい ASIN か確認

### Amazon ボタン（全製品・任意）
かんたんリンクの Amazon ボタンは商品名検索に飛ぶ。作り直す機種だけでも、Amazon を商品ページ（/dp/ASIN）指定にすると別出品者に流れにくい。下は販売元が公式・Amazon 本体以外の機種（検索経由だと特にずれやすい）。

- Eufy Robot Vacuum Omni C28: https://www.amazon.co.jp/dp/B0FX81HWQ3（販売元：DOORS SHOP  [インボイス対応]）
- Eufy Robot Vacuum Omni E25: https://www.amazon.co.jp/dp/B0F9JGVSDX（販売元：ばねっちショップ）
- Eufy Robot Vacuum Omni S1 Pro: https://www.amazon.co.jp/dp/B0CPYBYCVG（販売元：COZY☆安心ストア）
- Eufy RoboVac G10 Hybrid: https://www.amazon.co.jp/dp/B07SM64VZZ（販売元：Ritu shop fast）
- Eufy RoboVac G30 Hybrid: https://www.amazon.co.jp/dp/B08KD938WQ（販売元：ばねっちショップ）
- Roomba® 105 Combo + AutoEmpty™: https://www.amazon.co.jp/dp/B0F1FCYBLT（販売元：セントラルオンラインストア）
- Roomba Plus 575 Combo + AutoWash: https://www.amazon.co.jp/dp/B0GWDG6XPC（販売元：星輝（ライト）本店）

## 6. 差し替え後にこちらでやること

- overnight ブランチの `scripts/data/purchase-flow.json` の `ecNotOfficial` から、楽天公式に差し替えた機種（S1 Pro・L10s Gen2）を外す。削除した3機種もリストから外す → 購入ブロックの見出しが「公式ストアで」系になる
- Amazon 主に作り直した機種（Q10V・Q10V+・Qrevo Curv 2 Flow・705 Combo）は見出しを確認して必要なら調整
- Cursor 側で管理表 → JSON を反映したあと、製品ページを再生成して楽天ボタンの行き先を再点検
