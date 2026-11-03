# アフィリエイトリンク点検リスト（2026-10-22 夜間調査）

**正規の置き場:** `docs/ops/affiliate-link-audit.md`。リンクの差し替えは管理表（ロボット掃除機管理表）で手作業で行う前提のメモ。

調べ方:
- 楽天: かんたんリンク（もしも）の楽天ボタンの行き先ページを開き、出品ショップと在庫（`itemprop=availability`）を確認。各メーカーの楽天公式ショップ内を製品名で検索し、見つからないものは商品番号から推測したURLも開いて確認
- 公式ストア: 直販リンク（A8・バリューコマース）に埋め込まれた遷移先URLを直接開いて確認。**計測用URLそのものは開いていない**（偽クリックを避けるため）
- Amazon: 管理表の口コミURLにある ASIN の商品ページを開き、カートの販売元を確認（カートの販売元は時間で入れ替わる）
- 掲載可否の基準（10-21決定）: アフィリエイトリンク先にその製品が出れば掲載（売り切れでも可）。今回の不自然なリンクは掲載可否には影響しない

## A. 楽天ボタンの行き先が公式ショップではない（10機種）

| 製品 | 今の楽天リンク先 | 楽天公式ショップの該当商品 | Amazon の商品ページ | 公式ストア |
|---|---|---|---|---|
| eufy-clean-x8-pro-with-self-empty-station | https://item.rakuten.co.jp/giashopp/compass1764154394/（giashopp・楽天在庫:OutOfStock） | なし（anker に本体の出品なし） | https://www.amazon.co.jp/dp/B0C4NN6GGY（カートなし＝在庫切れか出品なし） | https://www.ankerjapan.com/products/t2276 |
| eufy-robot-vacuum-omni-s1-pro | https://item.rakuten.co.jp/youplan/100007649453/（youplan・楽天在庫:OutOfStock） | https://item.rakuten.co.jp/anker/t2080/（在庫あり）→ **差し替え可** | https://www.amazon.co.jp/dp/B0CPYBYCVG（販売元：COZY☆安心ストア／その他の出品者） | https://www.ankerjapan.com/products/t2080 |
| eufy-robovac-g10-hybrid | https://item.rakuten.co.jp/value-shopping/4571411191008/（value-shopping・楽天在庫:OutOfStock） | なし（anker に本体の出品なし） | https://www.amazon.co.jp/dp/B07SM64VZZ（販売元：Ritu shop fast／その他の出品者） | https://www.ankerjapan.com/products/t2150 |
| k10-pro | https://item.rakuten.co.jp/rikusyouya/k10plus-3011021/（rikusyouya・楽天在庫:OutOfStock） | なし（switchbot に本体の出品なし） | https://www.amazon.co.jp/dp/B0D2NDWC5Q（カートなし＝在庫切れか出品なし） | https://www.switchbot.jp/products/switchbot-robot-vacuum-cleaner-k10-pro |
| l10s-ultra-gen-2 | https://item.rakuten.co.jp/fleurette01/gr-e9ge84g4av/（fleurette01・楽天在庫:InStock） | https://item.rakuten.co.jp/dreame-shop/l10sultragen2/（在庫あり）→ **差し替え可** | https://www.amazon.co.jp/dp/B0DBTHDHYS（販売元：Dreame公式ストア／公式・Amazon本体） | https://www.dreametech.jp/products/l10s-ultra-gen-2 |
| l20-ultra-complete | https://item.rakuten.co.jp/lapistores/bellkwpvb7ia26qscepbqals7q/（lapistores・楽天在庫:InStock） | https://item.rakuten.co.jp/dreame-shop/l20ultracomplete/（売り切れ）→ **差し替え可** | https://www.amazon.co.jp/dp/B0CH268VB9（カートなし＝在庫切れか出品なし） | https://www.dreametech.jp/products/l20-ultra |
| q10v-plus | https://item.rakuten.co.jp/myr2026/gr-e9z0wr6h0x/（myr2026・楽天在庫:InStock） | なし（roborockjapandirect に本体の出品なし） | https://www.amazon.co.jp/dp/B0F9KCJ493（販売元：Roborock JP／公式・Amazon本体） | https://www.amazon.co.jp/dp/B0F9KCJ493 |
| q10v | https://item.rakuten.co.jp/myr2026/gr-e9z0wtw8az/（myr2026・楽天在庫:InStock） | なし（roborockjapandirect に本体の出品なし） | https://www.amazon.co.jp/dp/B0F9K8KTYF（販売元：Roborock JP／公式・Amazon本体） | https://www.amazon.co.jp/dp/B0F9K8KTYF |
| qrevo-curv-2-flow | https://item.rakuten.co.jp/happymasaya/gr-e9d3eqcf0a/（happymasaya・楽天在庫:InStock） | なし（roborockjapandirect に本体の出品なし） | https://www.amazon.co.jp/dp/B0GXB2RZ9Y（販売元：Roborock JP／公式・Amazon本体） | https://www.amazon.co.jp/dp/B0GXB2RZ9Y |
| roomba-max-705-combo-autowash | https://item.rakuten.co.jp/denkichiweb/885155045805/（denkichiweb・楽天在庫:OutOfStock） | なし（irobotstore に本体の出品なし） | https://www.amazon.co.jp/dp/B0FLYLR5XV（販売元：Amazon.co.jp／公式・Amazon本体） | https://store.irobot-jp.com/item/X185060.html |

補足:
- **Q10V・Q10V+・Qrevo Curv 2 Flow** は Amazon で Roborock JP が販売。楽天公式ショップには本体なし → Amazon の商品ページを主にしたかんたんリンクに作り直すのがおすすめ
- **Eufy X8 Pro・G10 Hybrid** は楽天の Anker 公式ショップにも公式ストアにも在庫がない（公式ストアのページは在庫切れ表示）
- **SwitchBot K10+ Pro** は楽天公式ショップに本体なし（K10+ Pro Combo は別製品として出品あり）。公式ストアも在庫切れ
- **ルンバ Max 705 Combo** は楽天の iRobot 公式ショップに出品なし（後継の Max 775 に置き換え済みとみられる）
- 購入ブロック（試作）では、この10機種に「正規販売店で」の文言を出さないよう `scripts/data/purchase-flow.json` の `ecNotOfficial` に登録済み（overnight ブランチ）。差し替えたら外す

## B. 公式アフィリエイトがあるメーカーなのに直販リンクがない

| 製品 | 公式ストアの商品ページ（A8でリンク作成） |
|---|---|
| roomba-plus-575-combo-autowash | https://store.irobot-jp.com/item/R285060.html |

## C. 売り切れ・在庫切れ（基準Aにより掲載は継続）

| 製品 | 楽天リンク先 | 公式ストア | Amazon カート |
|---|---|---|---|
| d10-plus | 在庫あり | — | カートなし |
| d9-max-gen-2 | 売り切れ | — | カートなし |
| eufy-clean-x8-pro-with-self-empty-station | 売り切れ | 在庫切れ | カートなし |
| eufy-robot-vacuum-omni-s1-pro | 売り切れ | 在庫あり | あり |
| eufy-robovac-g10-hybrid | 売り切れ | 在庫切れ | あり |
| eufy-x10-pro-omni | 在庫あり | 在庫切れ | あり |
| k10-pro | 売り切れ | 在庫切れ | カートなし |
| l20-ultra-complete | 在庫あり | — | カートなし |
| roomba-max-705-combo-autowash | 売り切れ | — | あり |
| roomba-max-705-vac-autoempty | 売り切れ | — | あり |
| roomba-plus-505-combo-autowash | 売り切れ | — | カートなし |

## D. かんたんリンクのカード名に古い販促文が残っている

カード名（商品名）は作成時の楽天の商品名がそのまま入るため、期限切れのセール文言が表示され続ける。作り直しの際に販促文のない商品名にするとよい。

- **roomba-105-combo-autoempty**: 「Roomba 105 Combo + AutoEmpty ルンバ オンライン限定 アイロボット ロボット掃除機 2025 お掃除ロボット 水…」
- **roomba-plus-405-combo-autowash**: 「Roomba Plus 405 Combo + AutoWash ルンバ オンライン限定 アイロボット ロボット掃除機 2025 お掃除ロボ…」
- **roomba-plus-575-combo-autowash**: 「Roomba Plus 575 Combo + AutoWash ルンバ オンライン限定 アイロボット ロボット掃除機 お掃除ロボット 水拭…」
- **s10**: 「SwitchBot スイッチボット ロボット掃除機 S10 走行中のモップ洗浄 - 水道直結 水交換不要 90日間自動ゴミ収集 水拭き 65…」

## E. かんたんリンクの Amazon ボタンが検索結果ページに飛ぶ（全製品共通）

もしもの既定では Amazon ボタンが「商品名での Amazon 検索」になっている。検索結果の先頭が別の出品者・別モデルになることがあるため、商品ページ（/dp/ASIN）に向けると確実。カートの販売元が公式でない製品は、検索経由だと非正規の出品に流れやすい。

| 製品 | Amazon 商品ページ（販売元） |
|---|---|
| d10-plus | https://www.amazon.co.jp/dp/B0B59452FZ（カートなし＝在庫切れか出品なし） |
| d20-ultra | https://www.amazon.co.jp/dp/B0FBRJVLDT（販売元：Dreame公式ストア／公式・Amazon本体） |
| d9-max-gen-2 | https://www.amazon.co.jp/dp/B0D8PHF6JX（カートなし＝在庫切れか出品なし） |
| deebot-mini-2 | https://www.amazon.co.jp/dp/B0GJCCTQMC（販売元：ECOVACS／公式・Amazon本体） |
| deebot-mini | ASIN不明（管理表に口コミURLなし） |
| deebot-n30-plus | https://www.amazon.co.jp/dp/B0FMR9YY83（販売元：ECOVACS／公式・Amazon本体） |
| deebot-n30 | https://www.amazon.co.jp/dp/B0FMRCXBTJ（販売元：ECOVACS／公式・Amazon本体） |
| deebot-n50-omni | https://www.amazon.co.jp/dp/B0H8DN7BSK（販売元：ECOVACS／公式・Amazon本体） |
| deebot-t50-omni | https://www.amazon.co.jp/dp/B0DRVB4DVC（販売元：ECOVACS／公式・Amazon本体） |
| deebot-t50s-omni | https://www.amazon.co.jp/dp/B0GKYMNQ86（販売元：ECOVACS／公式・Amazon本体） |
| deebot-t80-omni | https://www.amazon.co.jp/dp/B0F66LKTV6（販売元：ECOVACS／公式・Amazon本体） |
| deebot-t80s-omni | https://www.amazon.co.jp/dp/B0GKLCSKGG（販売元：ECOVACS／公式・Amazon本体） |
| deebot-t90-omni | https://www.amazon.co.jp/dp/B0GKHB5SV9（販売元：ECOVACS／公式・Amazon本体） |
| deebot-x11-omnicyclone | https://www.amazon.co.jp/dp/B0FMRLWXJJ（販売元：ECOVACS／公式・Amazon本体） |
| deebot-x8-pro-omni | https://www.amazon.co.jp/dp/B0DRV9GSCG（販売元：ECOVACS／公式・Amazon本体） |
| eufy-clean-x8-pro-with-self-empty-station | https://www.amazon.co.jp/dp/B0C4NN6GGY（カートなし＝在庫切れか出品なし） |
| eufy-robot-vacuum-auto-empty-c10 | https://www.amazon.co.jp/dp/B0FLX57RL5（販売元：AnkerDirect／公式・Amazon本体） |
| eufy-robot-vacuum-omni-c28 | https://www.amazon.co.jp/dp/B0FX81HWQ3（販売元：DOORS SHOP  [インボイス対応]／その他の出品者） |
| eufy-robot-vacuum-omni-e25 | https://www.amazon.co.jp/dp/B0F9JGVSDX（販売元：ばねっちショップ／その他の出品者） |
| eufy-robot-vacuum-omni-s1-pro | https://www.amazon.co.jp/dp/B0CPYBYCVG（販売元：COZY☆安心ストア／その他の出品者） |
| eufy-robot-vacuum-omni-s2 | https://www.amazon.co.jp/dp/B0FX9NZTQJ（販売元：AnkerDirect／公式・Amazon本体） |
| eufy-robovac-g10-hybrid | https://www.amazon.co.jp/dp/B07SM64VZZ（販売元：Ritu shop fast／その他の出品者） |
| eufy-robovac-g30-hybrid | https://www.amazon.co.jp/dp/B08KD938WQ（販売元：ばねっちショップ／その他の出品者） |
| eufy-x10-pro-omni | https://www.amazon.co.jp/dp/B0CPHYJRRP（販売元：AnkerDirect／公式・Amazon本体） |
| f20-plus | https://www.amazon.co.jp/dp/B0GVNN41NZ（販売元：Dreame公式ストア／公式・Amazon本体） |
| f20 | https://www.amazon.co.jp/dp/B0GVNN41P1（販売元：Dreame公式ストア／公式・Amazon本体） |
| k10-pro | https://www.amazon.co.jp/dp/B0D2NDWC5Q（カートなし＝在庫切れか出品なし） |
| k11-pro | https://www.amazon.co.jp/dp/B0GYSGM9NC（販売元：Amazon.co.jp／公式・Amazon本体） |
| k11 | https://www.amazon.co.jp/dp/B0F7GGN94D（販売元：Amazon.co.jp／公式・Amazon本体） |
| k20-pro | https://www.amazon.co.jp/dp/B0F3DBGYLZ（販売元：Amazon.co.jp／公式・Amazon本体） |
| l10s-ultra-gen-2 | https://www.amazon.co.jp/dp/B0DBTHDHYS（販売元：Dreame公式ストア／公式・Amazon本体） |
| l10s-ultra-gen-3 | https://www.amazon.co.jp/dp/B0GRFN53XB（販売元：Dreame公式ストア／公式・Amazon本体） |
| l20-ultra-complete | https://www.amazon.co.jp/dp/B0CH268VB9（カートなし＝在庫切れか出品なし） |
| l40-ultra-ae | https://www.amazon.co.jp/dp/B0F5QGFCXQ（販売元：Dreame公式ストア／公式・Amazon本体） |
| l40s-pro-ultra | https://www.amazon.co.jp/dp/B0F2MZF2MT（販売元：Dreame公式ストア／公式・Amazon本体） |
| q10p | ASIN不明（管理表に口コミURLなし） |
| q10v-plus | https://www.amazon.co.jp/dp/B0F9KCJ493（販売元：Roborock JP／公式・Amazon本体） |
| q10v | https://www.amazon.co.jp/dp/B0F9K8KTYF（販売元：Roborock JP／公式・Amazon本体） |
| qrevo-curv-2-flow | https://www.amazon.co.jp/dp/B0GXB2RZ9Y（販売元：Roborock JP／公式・Amazon本体） |
| qrevo-l | https://www.amazon.co.jp/dp/B0F6NGXD99（販売元：roborock japan direct／公式・Amazon本体） |
| roomba-105-combo-autoempty | https://www.amazon.co.jp/dp/B0F1FCYBLT（販売元：セントラルオンラインストア／その他の出品者） |
| roomba-max-705-combo-autowash | https://www.amazon.co.jp/dp/B0FLYLR5XV（販売元：Amazon.co.jp／公式・Amazon本体） |
| roomba-max-705-vac-autoempty | https://www.amazon.co.jp/dp/B0F1FFDWQ6（販売元：Amazon.co.jp／公式・Amazon本体） |
| roomba-mini-autoempty | https://www.amazon.co.jp/dp/B0GN252LY5（販売元：Amazon.co.jp／公式・Amazon本体） |
| roomba-mini-slim-slimcharge | https://www.amazon.co.jp/dp/B0GN2PRQN8（販売元：Amazon.co.jp／公式・Amazon本体） |
| roomba-plus-405-combo-autowash | https://www.amazon.co.jp/dp/B0GWDD6F19（販売元：Amazon.co.jp／公式・Amazon本体） |
| roomba-plus-505-combo-autowash | https://www.amazon.co.jp/dp/B0F1FCR538（カートなし＝在庫切れか出品なし） |
| roomba-plus-575-combo-autowash | https://www.amazon.co.jp/dp/B0GWDG6XPC（販売元：星輝（ライト）本店／その他の出品者） |
| s10 | https://www.amazon.co.jp/dp/B0CQK6R9HJ（販売元：Amazon.co.jp／公式・Amazon本体） |
| s20 | https://www.amazon.co.jp/dp/B0DTYJMPQL（販売元：Amazon.co.jp／公式・Amazon本体） |
| saros-10r | https://www.amazon.co.jp/dp/B0F6MYQ8SD（販売元：roborock japan direct／公式・Amazon本体） |
| saros-20 | https://www.amazon.co.jp/dp/B0GY85CQ2N（販売元：roborock japan direct／公式・Amazon本体） |
| x30-ultra | https://www.amazon.co.jp/dp/B0D5DJWV1H（販売元：Amazon.co.jp／公式・Amazon本体） |
| x50-ultra | https://www.amazon.co.jp/dp/B0DYHTN3PS（販売元：Dreametech JP／公式・Amazon本体） |

## F. 全製品のリンク先一覧（参考）

| 製品 | 楽天リンク先（在庫） | 直販リンク（遷移先） |
|---|---|---|
| d10-plus | https://item.rakuten.co.jp/dreame-shop/d10plus/（InStock） | afi-b → None |
| d20-ultra | https://item.rakuten.co.jp/dreame-shop/d20ultra/（InStock） | afi-b → None |
| d9-max-gen-2 | https://item.rakuten.co.jp/dreame-shop/d9maxgen2/（OutOfStock） | afi-b → None |
| deebot-mini-2 | https://item.rakuten.co.jp/store-ecovacs-japan/djx28-01ee/（InStock） | —（公式アフィリなし） |
| deebot-mini | https://item.rakuten.co.jp/store-ecovacs-japan/djx11-11ee/（InStock） | —（公式アフィリなし） |
| deebot-n30-plus | https://item.rakuten.co.jp/store-ecovacs-japan/ydlx11-35ee/（InStock） | —（公式アフィリなし） |
| deebot-n30 | https://item.rakuten.co.jp/store-ecovacs-japan/ydlx11-32df/（InStock） | —（公式アフィリなし） |
| deebot-n50-omni | https://item.rakuten.co.jp/store-ecovacs-japan/dlx88-0204/（InStock） | —（公式アフィリなし） |
| deebot-t50-omni | https://item.rakuten.co.jp/store-ecovacs-japan/ddx57-12ee/（InStock） | —（公式アフィリなし） |
| deebot-t50s-omni | https://item.rakuten.co.jp/store-ecovacs-japan/ddx47-0401/（InStock） | —（公式アフィリなし） |
| deebot-t80-omni | https://item.rakuten.co.jp/store-ecovacs-japan/dex68-21ee/（InStock） | —（公式アフィリなし） |
| deebot-t80s-omni | https://item.rakuten.co.jp/store-ecovacs-japan/dex62-0402/（InStock） | —（公式アフィリなし） |
| deebot-t90-omni | https://item.rakuten.co.jp/store-ecovacs-japan/dex96-12ee/（InStock） | —（公式アフィリなし） |
| deebot-x11-omnicyclone | https://item.rakuten.co.jp/store-ecovacs-japan/dex99-10ee/（InStock） | —（公式アフィリなし） |
| deebot-x8-pro-omni | https://item.rakuten.co.jp/store-ecovacs-japan/dex56-14ee/（InStock） | —（公式アフィリなし） |
| eufy-clean-x8-pro-with-self-empty-station | https://item.rakuten.co.jp/giashopp/compass1764154394/（OutOfStock） | VC → https://www.ankerjapan.com/products/t2276 |
| eufy-robot-vacuum-auto-empty-c10 | https://item.rakuten.co.jp/anker/t2292/（InStock） | VC → https://www.ankerjapan.com/products/t2292 |
| eufy-robot-vacuum-omni-c28 | https://item.rakuten.co.jp/anker/t211a/（InStock） | VC → https://www.ankerjapan.com/products/t211a |
| eufy-robot-vacuum-omni-e25 | https://item.rakuten.co.jp/anker/t2353/（InStock） | VC → https://www.ankerjapan.com/products/t2353 |
| eufy-robot-vacuum-omni-s1-pro | https://item.rakuten.co.jp/youplan/100007649453/（OutOfStock） | VC → https://www.ankerjapan.com/products/t2080 |
| eufy-robot-vacuum-omni-s2 | https://item.rakuten.co.jp/anker/t2081/（InStock） | VC → https://www.ankerjapan.com/products/t2081 |
| eufy-robovac-g10-hybrid | https://item.rakuten.co.jp/value-shopping/4571411191008/（OutOfStock） | VC → https://www.ankerjapan.com/products/t2150 |
| eufy-robovac-g30-hybrid | https://item.rakuten.co.jp/anker/t2253/（InStock） | VC → https://www.ankerjapan.com/products/t2253 |
| eufy-x10-pro-omni | https://item.rakuten.co.jp/anker/t2351/（InStock） | VC → https://www.ankerjapan.com/products/t2351 |
| f20-plus | https://item.rakuten.co.jp/dreame-shop/f20series/（InStock） | afi-b → None |
| f20 | https://item.rakuten.co.jp/dreame-shop/f20series/（InStock） | afi-b → None |
| k10-pro | https://item.rakuten.co.jp/rikusyouya/k10plus-3011021/（OutOfStock） | A8 → https://www.switchbot.jp/products/switchbot-robot-vacuum-cleaner-k10-pro |
| k11-pro | https://item.rakuten.co.jp/switchbot/k11-pro/（InStock） | A8 → https://www.switchbot.jp/products/switchbot-robot-vacuum-cleaner-k11-pro |
| k11 | https://item.rakuten.co.jp/switchbot/k11/（InStock） | A8 → https://www.switchbot.jp/products/switchbot-robot-vacuum-cleaner-k11 |
| k20-pro | https://item.rakuten.co.jp/switchbot/k20pro/（InStock） | A8 → https://www.switchbot.jp/products/switchbot-robot-vacuum-cleaner-k20-pro |
| l10s-ultra-gen-2 | https://item.rakuten.co.jp/fleurette01/gr-e9ge84g4av/（InStock） | afi-b → None |
| l10s-ultra-gen-3 | https://item.rakuten.co.jp/dreame-shop/l10sultragen3/（InStock） | afi-b → None |
| l20-ultra-complete | https://item.rakuten.co.jp/lapistores/bellkwpvb7ia26qscepbqals7q/（InStock） | afi-b → None |
| l40-ultra-ae | https://item.rakuten.co.jp/dreame-shop/l40ultraae/（InStock） | afi-b → None |
| l40s-pro-ultra | https://item.rakuten.co.jp/dreame-shop/l40sproultra/（InStock） | afi-b → None |
| q10p | https://item.rakuten.co.jp/roborockjapandirect/6936905902108/（InStock） | —（公式アフィリなし） |
| q10v-plus | https://item.rakuten.co.jp/myr2026/gr-e9z0wr6h0x/（InStock） | —（公式アフィリなし） |
| q10v | https://item.rakuten.co.jp/myr2026/gr-e9z0wtw8az/（InStock） | —（公式アフィリなし） |
| qrevo-curv-2-flow | https://item.rakuten.co.jp/happymasaya/gr-e9d3eqcf0a/（InStock） | —（公式アフィリなし） |
| qrevo-l | https://item.rakuten.co.jp/roborockjapandirect/6936905903426/（InStock） | —（公式アフィリなし） |
| roomba-105-combo-autoempty | https://item.rakuten.co.jp/irobotstore/y35/（InStock） | A8 → https://store.irobot-jp.com/item/Y351260.html |
| roomba-max-705-combo-autowash | https://item.rakuten.co.jp/denkichiweb/885155045805/（OutOfStock） | A8 → https://store.irobot-jp.com/item/X185060.html |
| roomba-max-705-vac-autoempty | https://item.rakuten.co.jp/irobotstore/w155060/（OutOfStock） | A8 → https://store.irobot-jp.com/item/W155060.html |
| roomba-mini-autoempty | https://item.rakuten.co.jp/irobotstore/f15/（InStock） | A8 → https://store.irobot-jp.com/item/F155260.html |
| roomba-mini-slim-slimcharge | https://item.rakuten.co.jp/irobotstore/f11/（InStock） | A8 → https://store.irobot-jp.com/item/F115260.html |
| roomba-plus-405-combo-autowash | https://item.rakuten.co.jp/irobotstore/g185060/（InStock） | A8 → https://store.irobot-jp.com/item/G185060.html |
| roomba-plus-505-combo-autowash | https://item.rakuten.co.jp/irobotstore/n185060/（OutOfStock） | A8 → https://store.irobot-jp.com/item/N185060.html |
| roomba-plus-575-combo-autowash | https://item.rakuten.co.jp/irobotstore/r285060/（InStock） | **なし** |
| s10 | https://item.rakuten.co.jp/switchbot/1000010908/（InStock） | A8 → https://www.switchbot.jp/products/switchbot-robot-vacuum-cleaner-s10 |
| s20 | https://item.rakuten.co.jp/switchbot/s20/（InStock） | A8 → https://www.switchbot.jp/products/switchbot-robot-vacuum-cleaner-s20 |
| saros-10r | https://item.rakuten.co.jp/roborockjapandirect/6936905903761/（InStock） | —（公式アフィリなし） |
| saros-20 | https://item.rakuten.co.jp/roborockjapandirect/6936905906625/（InStock） | —（公式アフィリなし） |
| x30-ultra | https://item.rakuten.co.jp/dreame-shop/dreame-x30/（InStock） | afi-b → None |
| x50-ultra | https://item.rakuten.co.jp/dreame-shop/x50-ultra/（InStock） | afi-b → None |
