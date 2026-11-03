# ナットクLabo — Claude Code 必読

このリポジトリ（`C:\Users\naoto\Desktop\nattoku-labo`）を Claude Code で編集する前提。

## セッション開始時（必須）

他の作業に入る**前に**、次を必ず読むこと。読まずに編集・提案を始めない。

1. [`docs/ops/handoff-claude.md`](docs/ops/handoff-claude.md) — 運用分担・聖域・現状・依頼テンプレ
2. [`docs/ops/keyword-audit.md`](docs/ops/keyword-audit.md) — キーワード設計監査と次の作業順

読み終わったら、要約せずに作業に入ってよい。必要なら「引継ぎ読了」と一言だけ返す。

## 役割（要約）

| 担当 | 範囲 |
|------|------|
| **Claude Code（ここ）** | SEO・タイトル／本文・導線・ページ統合・301/dims/seo-overrides/makers・guides 追記（**点数以外**） |
| **Cursor** | スクショ→分析JSON→`products/data` 投入・現行HTML雛形＋prerender/sync、**git push**（ユーザー指示時） |

### 製品追加のバトン

1. **ユーザー** … 管理表の行・アフィリンク  
2. **Cursor** … 口コミ取得〜JSON〜現行製品HTMLを雛形にしたページ＋prerender（`template-unified.html` は使わない）  
3. **Claude** … 410→301、dims、seo-overrides、purchase-flow、メーカー／価格帯／ガイド追記  
4. **Cursor** … ユーザー指示時に commit / push  

詳細は [`docs/ops/handoff-claude.md`](docs/ops/handoff-claude.md) §0.2。

## 聖域（絶対）

- 口コミから計算された**点数・信頼度・属性スコア・順位計算ロジックを変えない**
- SEOや見た目のために JSON のスコア／件数／％を「きれいに」しない
- 表示とデータの不一致 → **点数を合わせるな**。生成／表示バグとして扱い、データ改変はしない
- `aggregateRating` を付けない／価格の全面更新は保留／口コミ10件未満の機種は機能別ランキングに載せない（2026-11-03 ユーザー決定。点数・順位計算は変えず、載せる機種を絞るだけ。10〜19件は「参考値」バッジで掲載）

点数の更新は **Cursor 経由の元データ収集ルートのみ**。

## 次の作業の入口

**直近の作業記録:** [`docs/ops/claude-handoff-2026-11-03-new-products.md`](docs/ops/claude-handoff-2026-11-03-new-products.md)  
（2026-11-03 に新規13機種＋Roborock 4機種の makers / compare / guides / rankings 反映まで完了・掲載68製品。S8 Max Ultra はリンク先不一致で見送り。commit / push は Cursor 待ち）

SEO全体の作業順は `docs/ops/keyword-audit.md` 末尾。  
並行候補：ルンバ／Eufy タイトル、makers/irobot・anker、floor→水拭き転換、small に小型・一人暮らし。

## push

本番反映の `git push` は、原則 Cursor 側（またはユーザー明示指示時のみ）。Claude Code だけで勝手に push しない。
