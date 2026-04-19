もしも「かんたんリンク」HTMLを一括で入れるとき
========================================

1. このフォルダに、もしも管理画面からコピーした配布HTMLを置く。
   ファイル名は製品IDと同じにする（例: anker-eufy-c10.html）。
   拡張子は .html のみ対象。

2. リポジトリのルートで次を実行する。

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
