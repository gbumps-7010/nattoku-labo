# Cursorへの依頼：Roborock 5機種の追加（2026-11-03）

**正規の置き場:** `docs/ops/cursor-request-2026-11-03-roborock.md`

```
【Cursor担当】元データ作成（スクショ→JSON等）／push はユーザー指示時のみ
【聖域】計算済み点数・信頼度・属性スコア・計算ロジックは変更しない
【手順】docs/ops/handoff-claude.md §0.2 の製品追加バトン（現行の同メーカー製品HTMLを雛形に。template-unified.html は使わない）
【完了後】git status 確認 → commit（push はユーザーの指示があってから）
【除外】__pycache__、意図しない navigation.js の改行だけの差分
```

ユーザー決定（2026-11-03）：次の5機種をサイトに掲載する。

| 管理表の行 | 製品 | 口コミURL | かんたんリンク（F列）のリンク先 | 直販（G列） | 管理表の価格 |
|---|---|---|---|---|---|
| Roborock!A2 | E5 | Amazon（C列） | Amazon B09MW6LN35 | なし | 空欄 |
| Roborock!A7 | Q7T+ | 楽天（B列） | 楽天 ヤマダ電機 | なし | 空欄 |
| Roborock!A9 | Q7 Max | Amazon（C列は商品ページのURL。口コミ一覧はそこから） | Amazon B0BBPKSL1K | なし | 空欄 |
| Roborock!A13 | Qrevo C | 楽天（B列） | 楽天 ヤマダ電機 | なし | 空欄 |
| Roborock!A22 | S8 Max Ultra | Amazon（C列） | Amazon B0DB5TR54Z | なし | 98,000 |

**守ること**
- 製品IDは今の命名ルール（メーカー接頭辞なし）にする。例：`e5`・`q7t-plus`・`q7-max`・`qrevo-c`・`s8-max-ultra`
- `qrevo-c`（Qrevo C）は削除済みの `qrevo-curvc`（Qrevo CurvC）とは別の機種。CurvC は戻さない
- `affiliate.moshimo` は管理表F列、`hpPublish: true`
- 削除済みの機種（X8 Pro・G10 Hybrid・L20 Ultra Complete・Qrevo CurvC）は戻さない。未公開の JSON は `products/data` に置かない（生成スクリプトが拾って掲載してしまう）
- 口コミ10件未満の機種は機能別ランキングに自動で載らない（2026-11-03 決定）。点数や件数は調整しない

**価格（2026-11-03 ユーザー決定：かんたんリンク先の今の価格）**
Roborock は公式サイトに価格がなく、SoftBank Selection もこの5機種を扱っていないため、リンク先の新品価格を使う。管理表D列に入力済み。`priceSource` にリンク先を書き、`priceCheckedAt` は 2026-11-03。

| 製品 | 価格 | 出どころ（2026-11-03 確認） |
|---|---|---|
| E5 | ¥19,800 | Amazon 新品（販売元はマーケットプレイス出品者、残り1点） |
| Q7T+ | ¥44,880 | 楽天 ヤマダ電機 |
| Q7 Max | **空欄** | Amazon は中古品（¥11,800）だけで新品の出品なし。中古価格は入れない。掲載は基準Aどおり続行し、価格は空欄のまま |
| Qrevo C | ¥65,780 | 楽天 ヤマダ電機 |
| S8 Max Ultra | ¥98,000 | 管理表の既存値 |

**Claude Code 側で続けてやること（JSON ができたら）**
- specs・dims（公式仕様から）、seo-overrides のラベル、purchase-flow（ecNotOfficial の要否）
- 製品ページのプリレンダ、メーカー・価格帯・ガイド・ランキングの再生成、sitemap
