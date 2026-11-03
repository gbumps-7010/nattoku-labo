# Cursorへの依頼：製品データの追加（2026-11-01）

**正規の置き場:** `docs/ops/cursor-request-2026-11-01.md`
**背景資料:** [new-products-2026-11.md](new-products-2026-11.md)（HP未掲載の新製品の調査結果）

```
【Cursor担当】元データ作成（スクショ→JSON等）／push はユーザー指示時のみ
【聖域】計算済み点数・信頼度・属性スコア・計算ロジックは変更しない
【手順】docs/ops/handoff-claude.md §5（products/NEW_PRODUCT_GUIDE.md ほか）のとおり
【価格】価格の全面更新は保留中。新規製品の price は公式ストアの販売価格（調査日を priceCheckedAt に）
【完了後】git status 確認 → commit（push はユーザーの指示があってから）
【除外】__pycache__、意図しない navigation.js の改行だけの差分
```

---

## 依頼1（最優先）：Dreame D20 Pro・D20 Pro Plus を再公開する

ユーザー決定（2026-11-01）：**公開する**。

| 項目 | D20 Pro | D20 Pro Plus |
|---|---|---|
| 管理表の行 | Dreame!A4 | Dreame!A5 |
| 口コミURL（B・C列） | あり | あり |
| かんたんリンク（F列） | あり | あり |
| 公式ストア | https://www.dreametech.jp/products/d20-pro （¥47,800） | https://www.dreametech.jp/products/d20-pro-plus （¥68,800） |
| 製品ID（スラッグ） | **`d20-pro`** | **`d20-pro-plus`** |

- 製品IDは、今の命名ルール（メーカー接頭辞なし。例：`d20-ultra`・`d10-plus`）に合わせる。旧ID `dreame-d20-pro`・`dreame-d20-pro-plus` は使わない
- 2026-06-17（484963c）のスラッグ移行で削除されたため、旧データ（2026-04 時点、口コミ43件・44件）が git 履歴に残っている。**点数は流用せず、今の口コミで取り直す**
- `products/data/d20-pro.json`・`d20-pro-plus.json` を作り、`affiliate`（moshimo＝管理表F列、direct＝G列があれば）と `hpPublish: true` を入れる
- 管理表 Dreame!E4・E5（HP掲載）は **2026-11-01 に TRUE にした**。口コミURLは Amazon（C列）のみで、楽天（B列）は空

**Claude Code 側で続けてやること（JSON ができたら）**
- 旧URLの「公開終了（410）」を外し、`/products/dreame-d20-pro(-plus)` → `/products/d20-pro(-plus)` の 301 に切り替える（`_redirects`・`functions/_middleware.js`）
- 本体・ステーション寸法（`scripts/data/dims/dreame.json`）を公式仕様から追加
- `scripts/data/seo-overrides.json` のラベル、`scripts/data/purchase-flow.json` の姉妹機（D20 Pro ⇔ D20 Pro Plus）
- 製品ページのプリレンダ、サイトマップ、ランキング再生成
- 価格帯ページ（〜5万円・5〜7万円）、Dreame メーカーページ、ガイドへの追加（手作業。削除のときの逆の手順）

---

## 依頼2：新製品の口コミデータ集め（優先順）

発売直後の機種は口コミが少なく「参考値」になりやすい。**口コミが20件以上たまっているものから**着手し、少ないものは時期をずらす。

| 優先 | メーカー | 製品 | 発売 | 管理表 | 公式ページ |
|---|---|---|---|---|---|
| 1 | iRobot | Roomba Max 775 Combo + AutoWash | 2026-07-17 | iRobot!A5（口コミURL・かんたんリンクあり） | https://store.irobot-jp.com/item/X285060.html |
| 2 | iRobot | Roomba Max Monster 875（Max 875 Combo + AutoWash） | 2026-10-21 | **行の追加が必要** | https://store.irobot-jp.com/item/Z183060.html |
| 2 | ECOVACS | DEEBOT X12S PRO OMNI | 2026-10-02 | **行の追加が必要** | https://www.ecovacs.com/jp/shop/deebot-robotic-vacuum-cleaner/deebot-x12s-pro-omni |
| 2 | ECOVACS | DEEBOT T90 MAX OMNI | 2026-10-02 | **行の追加が必要** | https://www.ecovacs.com/jp/shop/deebot-robotic-vacuum-cleaner/deebot-t90-max-omni-white |
| 2 | iRobot | Roomba Plus 515 Combo + AutoWash | 2026-05-29 | **行の追加が必要** | https://store.irobot-jp.com/item/N285060.html |
| 3 | iRobot | Roomba Max 715 Vac + AutoEmpty | 2026-07-17 | iRobot!A6（データなし） | https://store.irobot-jp.com/item/W255060.html |
| 3 | ECOVACS | DEEBOT T90 PRO OMNI | 2026-02-20 | **行の追加が必要** | https://www.ecovacs.com/jp/shop/deebot-robotic-vacuum-cleaner/bundle-deebot-t90-pro-omni |
| 3 | Dreame | D10s | 2026-09（ストア掲載） | **行の追加が必要** | https://www.dreametech.jp/products/dreame-d10s |
| 3 | Dreame | Aqua10s Roller AE | 2026-07（ストア掲載） | **行の追加が必要** | https://www.dreametech.jp/products/aqua10s-roller-ae |
| 3 | Roborock | Q7B / Q7B+ | 2025-07 / 2025-10 | **行の追加が必要** | https://jp.roborock.com/pages/roborock-q7b |
| 4 | Dreame | L40 Ultra CE | 2026-03（ストア掲載） | Dreame!A16（データなし） | https://www.dreametech.jp/products/dreame-l40ultra-ce-ロボット掃除機 |
| 4 | Dreame | Aqua10 Ultra Roller | 2026-04 | Dreame!A2（データなし） | https://www.dreametech.jp/products/aqua10-ultra-roller-black |
| 4 | Roborock | Saros 20 Sonic（ヤマダ電機） | 2026-06-01 | Roborock!A19（データなし） | https://jp.roborock.com/pages/roborock-saros-20-sonic |
| 4 | Roborock | Qrevo Curv 2 Pro（ヤマダ電機） | 2026-02-04 | Roborock!A10（データなし） | https://jp.roborock.com/pages/roborock-qrevo-curv-2-pro |
| 4 | Roborock | Qrevo 2 Pro（ヤマダ電機限定）／Qrevo Edge 2（Amazon限定）／Qrevo L Pro | 2026-04〜10 | **行の追加が必要** | jp.roborock.com/pages/ の各ページ |

- 管理表の行追加・かんたんリンク／直販リンクの作成は**ユーザーが手作業で行う**（アフィリエイトリンクは手動管理の方針）。Cursor は口コミURLが入った行からデータを作る
- 掲載基準A：アフィリエイトリンク先に製品が出れば掲載（売り切れでも可）
- 寸法（dims）は Claude Code 側で公式仕様から追加する

---

## 依頼3：確認のみ

- **DEEBOT X8 PRO OMNI（掲載中）**：ECOVACS 公式で在庫切れ、メニューからも外れている。販売終了かどうか、管理表とかんたんリンク先を確認してユーザーに報告（販売終了なら X8 Pro・G10・L20 と同じ削除手順を Claude Code 側で行う）
