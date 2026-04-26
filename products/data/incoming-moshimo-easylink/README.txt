もしも「かんたんリンク」HTMLを一括で入れるとき
========================================

■ Googleスプレッドシートを「ウェブページ（.html）」で1ファイルに落とした場合
   （セル内にかんたんリンク、製品名の列あり・ECOVACS 管理表など）

   node scripts/apply-moshimo-from-sheets-export.js --from path/to/ECOVACS.html
   node scripts/apply-moshimo-from-sheets-export.js --from path/to/ECOVACS.html --dry-run
   別名マップ: --name-map path/to/override.json

■ 手間が少ない方法（推奨）: もしもが付けたファイル名のまま置き、マップで対応

1. このフォルダ（または好きなフォルダ）に、管理画面の配布HTMLをそのまま保存する。
2. 同じ階層にマップを1つ作る。例: easylink-map.tsv

   1行1件、<TAB> 区切り（Excelから貼り付け可）
   例:
     roborock-q10v	もしもからDL/roborock_q10v.htm
     deebot-n30	deebot_n30_ラクマ.htm

3. リポジトリのルートで:

   node scripts/apply-moshimo-kantan-easylink-batch.js --from products/data/incoming-moshimo-easylink --map products/data/incoming-moshimo-easylink/easylink-map.tsv

   .json マップ可: { "roborock-q10v": "相対/パス.html" }  （パスは --from からの相対）

■ 従来: ファイル名＝製品IDに揃える場合

1. 配布HTMLを anker-eufy-c10.html のように置く（拡張子 .html のみ列挙対象）
2. 次を実行:

   node scripts/apply-moshimo-kantan-easylink-batch.js --from products/data/incoming-moshimo-easylink

3. 実行後、各HTMLは products/data/moshimo-embed-{製品ID}.html にコピーされ、
   products/data/{製品ID}.json に
     "moshimoAffiliateEasyLinkHtmlFile": "moshimo-embed-{製品ID}.html"
   が設定される。

※ ドライラン: 同コマンドに --dry-run を付ける。
※ 取り込み後にこのフォルダの元ファイルを消す: --move を付ける（省略時はコピーのみで元ファイルは残る）。

JSONに直接HTML文字列を書く場合（ファイルにしない）:
  "moshimoAffiliateEasyLinkHtml": "<script>...</script><div>...</div>"
  （product-loader がヘッダー・「今の価格」枠に反映）
