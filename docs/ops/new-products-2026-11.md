# HP未掲載のロボット掃除機（新製品中心・2026-11-01 調査）

**正規の置き場:** `docs/ops/new-products-2026-11.md`

調べ方: 6メーカーの公式サイト（Anker・SwitchBot・Dreame は公式ストアの商品データ、ECOVACS は商品ページ、iRobot は公式ストアの一覧、Roborock は公式サイト＋プレスリリース）と、管理表（ロボット掃除機管理表）の「HP掲載」FALSE の行を突き合わせた。価格は調査日の表示（セール価格の場合あり）。発売日は主に公式プレスリリース・報道。

掲載には、①Cursor による口コミの元データ収集 → JSON 化、②アフィリエイトリンクの準備（掲載基準A：リンク先に製品が出れば掲載）が必要。

## 1. 2025年7月以降の新製品で、HPに未掲載のもの

| メーカー | 製品 | 価格（税込） | 発売 | 管理表 | 備考 |
|---|---|---|---|---|---|
| iRobot | Roomba Max Monster 875（Max 875 Combo + AutoWash） | ¥249,800（通常¥289,600） | 2026-10-21 | **行なし** | 最上位の新製品。公式ストアに Mini Slim とのセットもあり |
| iRobot | Roomba Max 775 Combo + AutoWash | ¥199,800 | 2026-07-17 | 行あり（口コミURL・かんたんリンクあり） | 掲載にいちばん近い |
| iRobot | Roomba Max 715 Vac + AutoEmpty | ¥99,800 | 2026-07-17 | 行あり（データなし） | |
| iRobot | Roomba Plus 515 Combo + AutoWash | ¥129,800 | 2026-05-29 | **行なし** | 405・505 の後継筋 |
| ECOVACS | DEEBOT X12S PRO OMNI | ¥229,900 | 2026-10-02 | **行なし** | 最上位の新製品 |
| ECOVACS | DEEBOT T90 MAX OMNI | ¥139,800 | 2026-10-02 | **行なし** | |
| ECOVACS | DEEBOT T90 PRO OMNI | ¥159,800（公式は消耗品セットで¥177,600） | 2026-02-20 | **行なし** | |
| ECOVACS | DEEBOT T90 MAX PRO OMNI | ¥149,800（報道） | 2026-10-02 | **行なし** | 公式サイトのメニューになし（販売店のみの可能性） |
| Dreame | Aqua10s Roller AE | ¥99,800（通常¥169,800） | 2026-07（ストア掲載） | **行なし** | |
| Dreame | Aqua10 Ultra Roller | ¥249,800 | 2026-04（報道） | 行あり（データなし） | |
| Dreame | L40 Ultra CE | ¥55,800（通常¥89,800） | 2026-03（ストア掲載） | 行あり（データなし） | |
| Dreame | D10s | ¥16,800（通常¥29,800） | 2026-09（ストア掲載） | **行なし** | 低価格帯 |
| Roborock | Qrevo 2 Pro | ¥164,780 | 2026-10-02 | **行なし** | ヤマダ電機限定 |
| Roborock | Saros 20 Sonic | ¥285,780 | 2026-06-01 | 行あり（データなし） | ヤマダ電機 |
| Roborock | Qrevo Edge 2 | ¥163,900 | 2026-05-28 | **行なし** | Amazon限定 |
| Roborock | Qrevo L Pro | 公式に表示なし | 2026-04-28 | **行なし** | |
| Roborock | Qrevo Curv 2 Pro | ¥219,780（報道） | 2026-02-04 | 行あり（データなし） | ヤマダ電機 |
| Roborock | Q7B / Q7B+ | ¥44,800 / ¥69,800 | 2025-07 / 2025-10 | **行なし** | 低価格帯 |
| Anker（Eufy） | — | | | | 新製品（S2・C28）は掲載済み |
| SwitchBot | — | | | | 新製品（K11+ Pro）は掲載済み |

## 2. 発表済み・日本未発売（または未確認）

- Dreame Aqua20 Pro Ultra Roller X Complete（IFA 2026、日本の発売日・価格は未発表）
- Dreame X60 Ultra Extreme（IFA 2026、日本発売の情報なし）
- Roborock Saros Rover（開発中、発売日未定）
- iRobot Roomba Duo（IFA 2026 のコンセプト展示のみ）

## 3. 新製品ではないが、販売中で未掲載のもの（参考）

- **Dreame D20 Pro・D20 Pro Plus**（¥47,800・¥68,800）：公式ストアで販売中。管理表に口コミURL・かんたんリンクあり。**サイトでは以前に削除して 410（公開終了）にしている** → 掲載し直すなら `_redirects`・`functions/_middleware.js` の 410 を外す必要あり
- iRobot Roomba 205 DustCompactor Combo（¥44,200〜）：管理表に行なし
- ECOVACS DEEBOT X5 PRO OMNI（¥209,800）：管理表に行あり（データなし）
- Roborock S8 Max Ultra：管理表に口コミURLあり。そのほか Q7T / Q7T+（2025-06）、Qrevo C・Qrevo・Saros 10 など旧モデル多数
- SwitchBot K10+ Pro Combo（¥99,800）・S1 Plus W（¥64,800）：管理表に行あり（データなし）

## 4. HP掲載中だが公式ラインナップにないもの（確認用）

- **Roomba Plus 575**：iRobot 公式ストアの一覧になし（楽天 iRobot 公式では販売中・10-21 に掲載判断済み）
- **DEEBOT X8 PRO OMNI**：ECOVACS 公式で在庫切れ、メニューからも外れている → 販売終了の可能性。要確認

## 優先度の考え方（案）

1. **掲載に近いもの**：Roomba Max 775（管理表に口コミURL・リンクあり）
2. **検索されやすい各社の新しい上位機種**：Roomba Max Monster 875、DEEBOT X12S PRO OMNI、T90 MAX OMNI、Roomba Plus 515
3. **予算帯の穴埋め**：Dreame D10s（〜2万円）、Roborock Q7B、Dreame Aqua10s Roller AE（〜10万円）
4. 販売店限定モデル（Qrevo 2 Pro・Qrevo Edge 2 など）は購入先が限られるため後回し

発売直後の機種は口コミが少なく、掲載しても「参考値」になりやすい。発売から1〜2か月おいてから集めるほうが点数が安定する。
