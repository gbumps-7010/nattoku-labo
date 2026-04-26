// 製品データベース
const productsData = [
    {
        id: 'roborock-qrevo-curv-c',
        name: 'Roborock Qrevo Curv (C)',
        manufacturer: 'Roborock',
        price: 119900,
        rating: 4.8,
        reviewCount: 53,
        totalReviewCount: 53,
        image: 'https://m.media-amazon.com/images/I/51I7oY+p8iL._AC_SL1500_.jpg',
        badges: ['18,500Pa吸引', '4cm段差対応', '毛絡み防止ブラシ'],
        specs: {
            suction: 98,
            mopping: 93,
            noise: 85,
            obstacle: 99,
            app: 90,
            maintenance: 96
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roborock+Qrevo+Curv',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roborock+Qrevo+Curv/'
    },
    {
        id: 'switchbot-s10',
        name: 'SwitchBot お掃除ロボットS10',
        manufacturer: 'SwitchBot',
        price: 119820,
        rating: 3.8,
        reviewCount: 108,
        totalReviewCount: 108,
        image: 'https://m.media-amazon.com/images/I/61M0vPzS-NL._AC_SL1500_.jpg',
        badges: ['水道直結', '全自動給排水', '清掃性能高評価'],
        specs: {
            suction: 97,
            mopping: 86,
            noise: 88,
            obstacle: 83,
            app: 62,
            maintenance: 98
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=SwitchBot+S10',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/SwitchBot+S10/'
    },
    {
        id: 'switchbot-s20',
        name: 'SwitchBot お掃除ロボットS20',
        manufacturer: 'SwitchBot',
        price: 91800,
        rating: 4.65,
        reviewCount: 158,
        totalReviewCount: 158,
        image: 'https://m.media-amazon.com/images/I/61M0vPzS-NL._AC_SL1500_.jpg',
        badges: ['床掃除98点', '信頼度79点', '年182h目安'],
        specs: { suction: 98, mopping: 94, noise: 96, obstacle: 88, app: 94, maintenance: 97 },
        problems: [
            { rank: 1, title: 'ベース設置スペース', percentage: 15, description: 'クリアランス・給排水の確保。', solutions: ['図面どおり余白', '帰庫前に動線を空ける'] },
            { rank: 2, title: '2.4GHz Wi-Fi初期設定', percentage: 8, description: '帯の制約。', solutions: ['2.4GHzに接続', 'FAQの手順'] }
        ],
        recommendations: { petOwner: 95, apartment: 95, working: 96, overall: 96 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=SwitchBot+S20',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/SwitchBot+S20/'
    },
    {
        id: 'switchbot-k10-plus-pro',
        name: 'SwitchBot ロボット掃除機 K10+ Pro',
        manufacturer: 'SwitchBot',
        price: 64800,
        rating: 4.75,
        reviewCount: 350,
        totalReviewCount: 350,
        image: 'https://m.media-amazon.com/images/I/61M0vPzS-NL._AC_SL1500_.jpg',
        badges: ['小型設計', '3000Pa', '自動収集'],
        specs: {
            suction: 98,
            mopping: 88,
            noise: 94,
            obstacle: 85,
            app: 94,
            maintenance: 92
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=SwitchBot+K10+Pro',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/SwitchBot+K10%2B+Pro/'
    },
    {
        id: 'roomba-max-705-vac-autoempty',
        name: 'Roomba Max 705 Vac + AutoEmpty',
        manufacturer: 'iRobot',
        price: 98800,
        rating: 4.7,
        reviewCount: 105,
        totalReviewCount: 105,
        image: 'https://m.media-amazon.com/images/I/71z7-Y3K4RL._AC_SL1500_.jpg',
        badges: ['180倍吸引力', '自動ゴミ収集', '最新モデル'],
        specs: {
            suction: 97,
            mopping: 96,
            noise: 70,
            obstacle: 85,
            app: 92,
            maintenance: 94
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+Max+705',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+Max+705/'
    },
    {
        id: 'switchbot-k11-plus',
        name: 'SwitchBot ロボット掃除機 K11+',
        manufacturer: 'SwitchBot',
        price: 59800,
        rating: 4.63,
        reviewCount: 532,
        totalReviewCount: 532,
        image: 'https://m.media-amazon.com/images/I/51uIu30oWTL._AC_SL1500_.jpg',
        badges: ['信頼93.1', '月12h目安', '直径25cm'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F8VWZ2J6',
                totalReviews: 160,
                sampleSize: 160,
                adoptedSize: 155,
                excludedSize: 5,
                sakuraScore: 5,
                trustScore: 91.0,
                collectionDate: '2026-04-18'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 260,
                sampleSize: 260,
                adoptedSize: 252,
                excludedSize: 8,
                sakuraScore: 4,
                trustScore: 93.0,
                collectionDate: '2026-04-18'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 95,
                sampleSize: 95,
                adoptedSize: 93,
                excludedSize: 2,
                sakuraScore: 3,
                trustScore: 92.0,
                collectionDate: '2026-04-18'
            },
            yodobashi: {
                platform: 'ヨドバシ.com',
                totalReviews: 17,
                sampleSize: 17,
                adoptedSize: 15,
                excludedSize: 2,
                sakuraScore: 0,
                trustScore: 88.0,
                collectionDate: '2026-04-18',
                note: '件数少なめ。採択率は採用ルールに基づく。'
            }
        },

        overallTrustScore: 93.1,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 532,
            adoptedSize: 515,
            excludedSize: 17,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 4,
            status: '合格',
            checkDate: '2026-04-18',
            trustScore: 93.1,
            badge: '🟢 信頼93.1・主要モール採用'
        },

        specs: {
            suction: 94,
            mopping: 76,
            noise: 96,
            obstacle: 70,
            app: 92,
            maintenance: 95
        },
        problems: [
            {
                rank: 1,
                title: 'パワー最大時のバッテリー不足',
                percentage: 9,
                description: '5000Pa最大時は減りが早く、広いリビングの途中で充電に戻ることがある',
                solutions: [
                    '通常モードを基本にし、汚れエリアだけ部分で強力清掃',
                    '掃除予約を部屋・時間帯で分割',
                    'MAXは週1程度に限定',
                    '充電台を床の中心寄りに置き帰庫距離を短くする'
                ]
            },
            {
                rank: 2,
                title: '厚手のラグやマットで停止',
                percentage: 7,
                description: '小型軽量ゆえ乗り上げ失敗・マット巻き込みが起きることがある',
                solutions: [
                    'ラグ端に滑り止め、またはアプリで進入禁止',
                    '厚手ラグは水拭き禁止エリアにして吸引のみ他ルート',
                    'キッチンマットは重しで固定',
                    '段差を越える導線にスロープを検討'
                ]
            },
            {
                rank: 3,
                title: '専用消耗品の販路',
                percentage: 6,
                description: '紙パック等が量販で欠品しづらい、という声',
                solutions: [
                    'Amazon・楽天のセールで半年分まとめ買い',
                    '純正と市販床用シートの併用でコスト平準化',
                    '在庫通知をオンにする',
                    '次回交換日をアプリのメモに固定'
                ]
            },
            {
                rank: 4,
                title: '初回Wi-Fi（2.4GHz）設定',
                percentage: 3,
                description: 'スマホが5GHzのままだとペアリング失敗しやすい',
                solutions: [
                    '設定中だけスマホを2.4GHz SSIDに接続',
                    '自動帯切替を一時オフ',
                    'ルーター近くで完走',
                    'ファーム更新後に再トライ'
                ]
            },
            {
                rank: 5,
                title: 'ゴミ収集ステーションの専有面積',
                percentage: 2,
                description: '本体は小さくても基地の前後左右に余白が要る',
                solutions: [
                    '左右20cm前後のデッドスペースに設置',
                    '配線の出し入れを考慮して壁際を選定',
                    '基地正面に家具を置かない',
                    '高さのある下駄箱下などは避け帰庫性をテスト'
                ]
            }
        ],
        attributes: {
            pet: { suction: 88, odor: 85, maintenance: 94 },
            apartment: { noise: 98, size: 99, obstacle: 93 },
            working: { schedule: 96, app: 92, automation: 94 },
            house: { range: 78, battery: 72, multifloor: 90 }
        },
        recommendation: {
            pet: 89,
            apartment: 97,
            working: 94,
            house: 80,
            overall: 91
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=SwitchBot+K11%2B',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/SwitchBot+K11%2B/'
    },
    {
        id: 'roborock-qrevo-l',
        name: 'Roborock Qrevo L',
        manufacturer: 'Roborock',
        price: 79980,
        rating: 4.7,
        reviewCount: 326,
        totalReviewCount: 326,
        image: 'https://m.media-amazon.com/images/I/51I7oY+p8iL._AC_SL1500_.jpg',
        badges: ['信頼度89.4', '年156h目安', '1万Pa級'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F6NGXD99',
                totalReviews: 104,
                sampleSize: 104,
                adoptedSize: 92,
                excludedSize: 12,
                sakuraScore: 5,
                trustScore: 84.5,
                collectionDate: '2026-04-18'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 204,
                sampleSize: 204,
                adoptedSize: 192,
                excludedSize: 12,
                sakuraScore: 2,
                trustScore: 92.8,
                collectionDate: '2026-04-18'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 18,
                sampleSize: 18,
                adoptedSize: 18,
                excludedSize: 0,
                sakuraScore: 0,
                trustScore: 91.0,
                collectionDate: '2026-04-18'
            },
            yodobashi: {
                platform: 'ヨドバシ',
                totalReviews: 0,
                sampleSize: 0,
                adoptedSize: 0,
                excludedSize: 0,
                sakuraScore: 0,
                trustScore: 0.0,
                collectionDate: '2026-04-18'
            }
        },

        overallTrustScore: 89.42,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 326,
            adoptedSize: 302,
            excludedSize: 24,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-04-18',
            trustScore: 89.42,
            badge: '🟢 主要モール採用・サクラチェック済み'
        },

        specs: {
            suction: 98,
            mopping: 85,
            noise: 86,
            obstacle: 75,
            app: 94,
            maintenance: 96
        },
        problems: [
            {
                rank: 1,
                title: 'ドック設置スペースの確保',
                percentage: 15.2,
                description: '全自動ドックの寸法に対し、限られた住空間で置き場に困る・圧迫感を感じる、という層',
                solutions: [
                    '設置前に幅34cm、奥行き49cm、高さ56cmを確保',
                    '左右に放熱とマッピング用の5cm程度の余白を作る',
                    '白背景の壁面に設置し視覚的な圧迫感を抑える',
                    'コンセント直結可能な位置への配置を最優先する'
                ]
            },
            {
                rank: 2,
                title: '給排水タンクの管理頻度',
                percentage: 10.5,
                description: '水拭き回数が多いと、給水・汚水の補充・捨ての手間が目立つ、という層',
                solutions: [
                    '水拭き強度を標準設定にし水消費効率を最適化',
                    '汚水タンクは雑菌抑制のため週1回の洗浄を推奨',
                    '給排水直結キット(別売)による運用の自動化',
                    '定期的な清掃予約で水の入れ替えタイミングを固定'
                ]
            },
            {
                rank: 3,
                title: 'Wi-Fi接続（2.4GHz）トラブル',
                percentage: 5.8,
                description: '初回ペアリングで周波数帯の混在に起因し接続に失敗する、という層',
                solutions: [
                    'スマートフォンを一時的に2.4GHz帯に固定して設定を行う',
                    'SSIDやパスワードに特殊記号を使用しない',
                    'ルーターの近くでペアリングを完了させる',
                    '最新ファームウェアへのアップデートを即時実施'
                ]
            },
            {
                rank: 4,
                title: '進入禁止エリアの微調整',
                percentage: 4.2,
                description: '仮想壁・禁止エリアの境界詰めに手間を感じる、という層',
                solutions: [
                    '浴室入口や絡まりやすい配線付近を事前に設定',
                    'マッピング1回目は障害物を徹底的に排除する',
                    '部分清掃機能で境界線の精度をテストする',
                    '仮想壁機能を使い物理的な衝突を完全に防ぐ'
                ]
            },
            {
                rank: 5,
                title: '消耗品費のランニング管理',
                percentage: 3.1,
                description: '純正消耗品の年間費用が積もることへの懸念、という層',
                solutions: [
                    '公式セール時やポイント還元日にまとめ買いする',
                    '互換品ではなく純正品を使い故障リスクを低減',
                    'フィルタの乾拭き清掃で交換サイクルを延伸',
                    'ダストバッグの満杯検知まで確実に使い切る'
                ]
            }
        ],
        attributes: {
            pet: { suction: 98, odor: 92, maintenance: 95 },
            apartment: { noise: 88, size: 65, obstacle: 75 },
            working: { schedule: 96, app: 94, automation: 98 },
            house: { range: 95, battery: 90, multifloor: 85 }
        },
        recommendation: {
            pet: 95,
            apartment: 82,
            working: 96,
            house: 90,
            overall: 91
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roborock+Qrevo+L',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roborock+Qrevo+L/'
    },
    {
        id: 'anker-eufy-c10',
        name: 'Anker Eufy Robot Vacuum Auto-Empty C10',
        manufacturer: 'Anker',
        price: 59800,
        rating: 4.7,
        reviewCount: 502,
        totalReviewCount: 502,
        image: 'https://m.media-amazon.com/images/I/61-B9+P0eLL._AC_SL1500_.jpg',
        badges: ['信頼88.5', '静音98', '採用485件'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0D1XY7Z6S',
                totalReviews: 130,
                sampleSize: 130,
                adoptedSize: 125,
                excludedSize: 5,
                sakuraScore: 4,
                trustScore: 86.5,
                collectionDate: '2026-04-18'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 284,
                sampleSize: 284,
                adoptedSize: 273,
                excludedSize: 11,
                sakuraScore: 4,
                trustScore: 91.2,
                collectionDate: '2026-04-18'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 88,
                sampleSize: 88,
                adoptedSize: 87,
                excludedSize: 1,
                sakuraScore: 3,
                trustScore: 87.8,
                collectionDate: '2026-04-18'
            }
        },

        overallTrustScore: 88.45,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 502,
            adoptedSize: 485,
            excludedSize: 17,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 4,
            status: '合格',
            checkDate: '2026-04-18',
            trustScore: 88.45,
            badge: '🟢 3サイト統合・サクラチェック済み'
        },

        specs: {
            suction: 92,
            mopping: 65,
            noise: 98,
            obstacle: 75,
            app: 86,
            maintenance: 93
        },
        problems: [
            {
                rank: 1,
                title: '薄いラグ・マットの巻き込み',
                percentage: 28,
                description: '軽いキッチンマットや薄いラグを吸い込みエラーで停止しやすい。進入禁止・固定で回避する層が多いです。',
                solutions: [
                    'Eufyアプリで当該エリアを進入禁止',
                    'ラグ四隅を滑り止め・テープで固定',
                    '掃除日だけラグを巻き上げる',
                    'フリンジ付きは禁止エにする'
                ]
            },
            {
                rank: 2,
                title: 'ゴミ収集時の瞬間的な騒音',
                percentage: 20,
                description: '帰庫時の吸引は約10秒だが掃除機級の音量。在宅帯に刺さる、という帯です。',
                solutions: [
                    '「おやすみモード」等で深夜の収集を抑止',
                    '外出中に掃完するスケジュール',
                    'ステーションを寝室・書斎から遠ざける',
                    '在宅帯は収集回数を減らす'
                ]
            },
            {
                rank: 3,
                title: '水拭き機能が物足りない',
                percentage: 15,
                description: 'モップを引きずる方式のため、固着汚れは弱い。日々の埃押さえ割り切り、という帯も。',
                solutions: [
                    '週1の手拭きを併用',
                    '吸引のみの日と水拭き日を分ける',
                    'モップ交換をこまめに',
                    'こびり付き用にスティック併用'
                ]
            },
            {
                rank: 4,
                title: 'マップの保存失敗・回転',
                percentage: 12,
                description: 'マップが90度回転したり禁止エがズレる報告。再起動・再マッピングで沈静化、という帯です。',
                solutions: [
                    'センサー・Cliff周りを清掃',
                    '初回は床面の小物を完全撤去',
                    'ファームを最新化してから作り直し',
                    'Wi-Fi電波弱い箇所を避けて学習'
                ]
            },
            {
                rank: 5,
                title: 'コードや細い障害物の回避',
                percentage: 10,
                description: 'レーザー系ゆえ床のケーブル類を巻き込みやすい。事前片付けが必須、という帯です。',
                solutions: [
                    'ケーブルボックス・結線で床から上げる',
                    '配線多い部屋を進入禁止',
                    '清掃前に足元のコード撤去',
                    '禁止エ＋仮想壁の併用'
                ]
            }
        ],
        recommendations: {
            petOwner: 87,
            apartment: 96,
            working: 92,
            house: 82,
            overall: 89
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Anker+Eufy+C10+Auto-Empty',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Anker+Eufy+C10+Auto-Empty/'
    },
    {
        id: 'ecovacs-deebot-n20-pro-plus',
        name: 'ECOVACS DEEBOT N20 PRO PLUS',
        manufacturer: 'ECOVACS',
        price: 69800,
        rating: 4.6,
        reviewCount: 278,
        totalReviewCount: 278,
        image: 'https://m.media-amazon.com/images/I/61kX-mNfWKL._AC_SL1500_.jpg',
        badges: ['信頼89.2', '紙パック不要', '採用262件'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0D45R4YVL',
                totalReviews: 144,
                sampleSize: 144,
                adoptedSize: 136,
                excludedSize: 8,
                sakuraScore: 4,
                trustScore: 86.4,
                collectionDate: '2026-04-18'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 82,
                sampleSize: 82,
                adoptedSize: 78,
                excludedSize: 4,
                sakuraScore: 3,
                trustScore: 91.2,
                collectionDate: '2026-04-18'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 52,
                sampleSize: 52,
                adoptedSize: 48,
                excludedSize: 4,
                sakuraScore: 2,
                trustScore: 89.5,
                collectionDate: '2026-04-18'
            }
        },

        overallTrustScore: 89.15,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 278,
            adoptedSize: 262,
            excludedSize: 16,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-04-18',
            trustScore: 89.15,
            badge: '🟢 3サイト統合・サクラチェック済み'
        },

        specs: {
            suction: 96,
            mopping: 70,
            noise: 75,
            obstacle: 82,
            app: 80,
            maintenance: 98
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションのゴミ吸引音が爆音',
                percentage: 35,
                description: '本機走行は静かな層が多い一方、帰庫後の吸い上げが短時間「ジェット機級」と感じる、という報告が目立ちます。',
                solutions: [
                    '「おやすみモード」で深夜・早朝の自動収集をオフ',
                    '外出中に掃完するスケジュール',
                    'ステーションを寝室・子ども部屋から遠ざける',
                    '在宅帯は収集タイミングを手動に寄せる'
                ]
            },
            {
                rank: 2,
                title: '水拭き用タンクが小さすぎる',
                percentage: 22,
                description: '25畳超を一度に水拭きすると水切れしやすく、手動給水が入る、という帯です。',
                solutions: [
                    'アプリの水量を「低」に設定',
                    'リビング等エリアに絞って水拭き',
                    '水拭き日と吸引日を分ける',
                    '広い家は部屋分割で2周運用'
                ]
            },
            {
                rank: 3,
                title: '細いコード類や紐の巻き込み',
                percentage: 18,
                description: '8000Pa帯の吸引力でケーブル・靴下等を巻き込み停止、という層が一定数います。',
                solutions: [
                    '配線多い箇所を進入禁止に設定',
                    '掃除前に床のケーブルを巻き上げ',
                    '室内を明るくして認識安定を図る',
                    'ケーブルボックスで足元を整理'
                ]
            },
            {
                rank: 4,
                title: 'アプリのWi-Fiペアリング失敗',
                percentage: 12,
                description: '5GHz掴みの端末で2.4GHz専用機との初回接続に失敗、という層が報告されています。',
                solutions: [
                    '設定中のみモバイルデータをオフ',
                    '2.4GHzのSSIDに手動接続',
                    'ルーター近くで再試行',
                    'ECOVACS HOMEを最新版に'
                ]
            },
            {
                rank: 5,
                title: 'サイクロンフィルターの詰まり',
                percentage: 8,
                description: '紙パック無し分、ステーション内フィルに塵が蓄積し吸引力が落ちる、という帯です。',
                solutions: [
                    '月1程度でフィルを叩き・掃除',
                    '水洗いする場合は十分乾燥',
                    '予備フィルでローテーション',
                    'アプリのメンテ通知を有効化'
                ]
            }
        ],
        recommendations: {
            petOwner: 92,
            apartment: 80,
            working: 88,
            house: 83,
            overall: 86
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=ECOVACS+DEEBOT+N20+PRO+PLUS',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+N20+PRO+PLUS/'
    },
    {
        id: 'roomba-mini-autoempty',
        name: 'Roomba Mini + AutoEmpty',
        manufacturer: 'iRobot',
        price: 44800,
        rating: 4.65,
        reviewCount: 66,
        totalReviewCount: 66,
        image: 'https://m.media-amazon.com/images/I/71u9S+f8uGL._AC_SL1500_.jpg',
        badges: ['信頼82.4', '超静音', '楽天66件'],

        dataSources: {
            rakuten: {
                platform: '楽天市場',
                asin: '',
                totalReviews: 66,
                sampleSize: 66,
                adoptedSize: 64,
                excludedSize: 2,
                sakuraScore: 2,
                trustScore: 91.5,
                collectionDate: '2026-04-18'
            }
        },

        overallTrustScore: 82.4,

        dataSource: {
            platform: '楽天市場',
            collectionMethod: '独自調査',
            sampleSize: 66,
            adoptedSize: 64,
            excludedSize: 2,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '合格',
            checkDate: '2026-04-18',
            trustScore: 82.4,
            badge: '🟢 信頼82.4・有効採用64件'
        },

        specs: {
            suction: 88,
            mopping: 0,
            noise: 96,
            obstacle: 78,
            app: 84,
            maintenance: 94
        },
        problems: [
            {
                rank: 1,
                title: 'ゴミ収集時の音',
                percentage: 16,
                description: '吸い上げの数秒間だけ騒音が大きい、という層',
                solutions: [
                    'アプリで就寝・在宅帯外にスケジュール',
                    'テレカン中は収集を避ける',
                    '基地を執務・寝室から離す',
                    '在宅時は手動一時停止を活用'
                ]
            },
            {
                rank: 2,
                title: '軽量ゆえにマットが動く',
                percentage: 12,
                description: '薄いマットの押し出し・巻き込み、という層',
                solutions: [
                    '滑り止め付きマットに替える',
                    '進入禁止でマット域を保護',
                    '掃除前に軽量マットを畳む',
                    '重めのラグに差し替え'
                ]
            },
            {
                rank: 3,
                title: '初期Wi-Fi接続',
                percentage: 8,
                description: '2.4GHz手順で再試行が要る、という層',
                solutions: [
                    '5GHzを一時オフ',
                    'スマホの自動帯切替をオフ',
                    'ルータ近くでペアリング完走',
                    '公式手順のQR・手動入力'
                ]
            },
            {
                rank: 4,
                title: '紙マニュアルが簡素',
                percentage: 6,
                description: 'トラブル時の辿り方が初見で曖昧、という層',
                solutions: [
                    'iRobot Home内のヘルプ',
                    '公式PDFを入手',
                    'サポート番号をメモ',
                    '初期は時間に余裕を取る'
                ]
            },
            {
                rank: 5,
                title: '消耗品の予備がない',
                percentage: 5,
                description: '開梱直後に予備の紙パック等が少ない、という層',
                solutions: [
                    '購入時にダスト袋セットを同梱発注',
                    'セール時の半年分まとめ買い',
                    '交換周期をアプリ通知と同期',
                    '純正と公式セール価格を比較'
                ]
            }
        ],
        recommendations: {
            petOwner: 81,
            apartment: 91,
            working: 89,
            house: 70,
            overall: 83
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+Mini+AutoEmpty',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+Mini+AutoEmpty/'
    },
    {
        id: 'roomba-105-combo',
        name: 'Roomba 105 Combo ロボット + AutoEmpty',
        manufacturer: 'iRobot',
        price: 69800,
        rating: 4.62,
        reviewCount: 285,
        trustScore: 89.15,
        image: 'https://m.media-amazon.com/images/I/placeholder_roomba_105_combo.jpg',
        badges: ['水拭き一体型', '自動ゴミ収集', '3サイト統合'],
        specs: {
            suction: 92,
            mopping: 88,
            noise: 85,
            obstacle: 82,
            app: 72,
            maintenance: 95
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+105+Combo',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+105+Combo/'
    },
    {
        id: 'roomba-plus-405-combo',
        name: 'Roomba Plus 405 Combo ロボット + AutoWash',
        manufacturer: 'iRobot',
        price: 197800,
        rating: 4.8,
        reviewCount: 321,
        totalReviewCount: 321,
        image: 'https://m.media-amazon.com/images/I/61MvU-T6j0L._AC_SL1500_.jpg',
        badges: ['AutoWash搭載', '信頼94.2', '321件解析'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F1FCZYV6',
                totalReviews: 200,
                sampleSize: 200,
                adoptedSize: 195,
                excludedSize: 5,
                sakuraScore: 3,
                trustScore: 94.0,
                collectionDate: '2026-04-18'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 80,
                sampleSize: 80,
                adoptedSize: 78,
                excludedSize: 2,
                sakuraScore: 3,
                trustScore: 94.2,
                collectionDate: '2026-04-18'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 41,
                sampleSize: 41,
                adoptedSize: 39,
                excludedSize: 2,
                sakuraScore: 3,
                trustScore: 94.4,
                collectionDate: '2026-04-18'
            }
        },
        
        overallTrustScore: 94.20,
        
        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 321,
            adoptedSize: 312,
            excludedSize: 9,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-04-18',
            trustScore: 94.20,
            badge: '🟢 3サイト統合・サクラチェック済み'
        },
        
        specs: {
            suction: 98,
            mopping: 95,
            noise: 78,
            obstacle: 90,
            app: 96,
            maintenance: 98
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションが想像以上に大きく場所を取る',
                percentage: 18,
                description: 'AutoWash機能のためにステーションが大型化しており、日本の住宅では設置スペースの確保が最大の難関です。',
                solutions: [
                    '購入前に幅45cm、高さ50cm、奥行き50cm以上（メンテ用の余白含む）の設置可能スペースがあるか確認',
                    '図面・実物寸法の出品ページを比較し、動線（扉開閉含む）を先に想定',
                    '設置候補が狭い場合は、ドック前後の引き出しを避けた水回り近く等へ寄せる',
                    '導線上の物を減らし、掃除ロボ用の専用コーナーを確保'
                ]
            },
            {
                rank: 2,
                title: '本体および消耗品のランニングコストが高い',
                percentage: 16,
                description: '高性能ゆえに本体価格が高く、さらに純正消耗品の価格設定も高めであることに不満を感じるユーザーもいます。',
                solutions: [
                    '公式ストアの定期便を活用して単価を平準化',
                    '楽天・Amazonの大型セール時に消耗品をまとめ買い',
                    '交換周期を見直し、まだ使える部品の早期交換を避ける',
                    'ポイント還元率の高い販路で同梱注文'
                ]
            },
            {
                rank: 3,
                title: 'モップ洗浄・乾燥時の音が数時間続く',
                percentage: 13,
                description: '清掃終了後の洗浄音と、その後の乾燥用ファンの音が数時間続くため、静かな環境では気になります。',
                solutions: [
                    'アプリのスケジュールで、家族の外出中に清掃・洗浄を完了',
                    '夜間は洗浄・乾燥の自動実行をオフにし、帰宅後の帯に寄せる',
                    '洗浄はリビングより水回り・角部屋側へステーションを寄せる',
                    '在宅会議中は一時停止・静音優先の運用'
                ]
            },
            {
                rank: 4,
                title: '汚水タンクを放置すると臭いが発生する',
                percentage: 9,
                description: '自動洗浄された後の汚水を数日放置すると、夏場などはタンク内から異臭が発生することがあります。',
                solutions: [
                    '満水通知を待たず、2〜3日に一度は排水し軽くすすぐ',
                    '排水のたびにタンク内を乾燥しやすい場所で自然乾燥',
                    '夏季は頻度を上げ、ニオイが出る前に小まめに捨てる',
                    'アプリのメンテ通知と連動して習慣化'
                ]
            },
            {
                rank: 5,
                title: 'ラグの形状によっては乗り越えに失敗する',
                percentage: 5,
                description: '非常に薄く軽いラグや、逆に毛足が長すぎるラグの場合、タイヤが空転したり巻き込んだりすることがあります。',
                solutions: [
                    'ラグ端を両面テープ等で床に固定',
                    'アプリでラグ周辺を進入禁止（キープアウト）に設定',
                    '巻き込みやすいラグは清掃日だけ撤去',
                    '毛足の長いラグは高さ制限ゾーンで回避'
                ]
            }
        ],
        recommendations: {
            petOwner: 95,
            apartment: 79,
            working: 97,
            house: 93,
            overall: 91
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+Plus+405+Combo',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+Plus+405+Combo/'
    },
    {
        id: 'eufy-robot-vacuum-omni-c28',
        name: 'Eufy Robot Vacuum Omni C28',
        manufacturer: 'Anker',
        price: 99990,
        rating: 4.1,
        reviewCount: 12,
        totalReviewCount: 12,
        image: 'https://m.media-amazon.com/images/I/61Nl-H6kG0L._AC_SL1500_.jpg',
        badges: ['ローラーモップ', '実数12件', '信頼42.2'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0FX7M29RP',
                totalReviews: 8,
                sampleSize: 8,
                adoptedSize: 8,
                excludedSize: 0,
                sakuraScore: 2,
                trustScore: 44.0,
                collectionDate: '2026-04-18'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 3,
                sampleSize: 3,
                adoptedSize: 3,
                excludedSize: 0,
                sakuraScore: 2,
                trustScore: 40.0,
                collectionDate: '2026-04-18'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 1,
                sampleSize: 1,
                adoptedSize: 1,
                excludedSize: 0,
                sakuraScore: 2,
                trustScore: 38.0,
                collectionDate: '2026-04-18'
            }
        },

        overallTrustScore: 42.15,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 12,
            adoptedSize: 12,
            excludedSize: 0,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '参考（実数小）',
            checkDate: '2026-04-18',
            trustScore: 42.15,
            badge: '🟡 実数12件・信頼度低め（傾向参考）'
        },

        specs: {
            suction: 95,
            mopping: 95,
            noise: 94,
            obstacle: 40,
            app: 75,
            maintenance: 92
        },
        problems: [
            {
                rank: 1,
                title: '家具下でのスイッチ接触による強制リセット',
                percentage: 8,
                description: '本体上部のボタンが物理的に出っ張っており、低いソファ下でボタンが長押しされ、設定が初期化されるトラブルがあります。',
                solutions: [
                    'Eufyアプリで当該エリアを進入禁止にする',
                    '継ぎ脚などで家具を数ミリ上げる',
                    '高さ制限ゾーンをマップで区切る',
                    '下が狭い家具周辺は手動清掃に切替'
                ]
            },
            {
                rank: 2,
                title: '落下防止センサーの精度不足（玄関での脱輪）',
                percentage: 8,
                description: '玄関の段差で2回に1回は脱輪し、立ち往生するという実体験が報告されています。',
                solutions: [
                    '境界線テープで段差手前にラインを引く',
                    '仮想壁で玄関ゾーンを厳格に制限',
                    '段差プレートで傾斜を緩める',
                    '清掃はリビング寄せにし玄関先を避ける'
                ]
            },
            {
                rank: 3,
                title: '壁や家具への衝突回避が甘い',
                percentage: 8,
                description: '壁を検知しても減速せず、強い衝撃で当たりに行く挙動が指摘されています。',
                solutions: [
                    '角・天板付近に透明クッションを貼る',
                    '衝突しやすい箇所を清掃禁止にする',
                    '照明を明るくし誤認識を減らす',
                    '在宅帯に限ってファーム更新後の挙動を再確認'
                ]
            },
            {
                rank: 4,
                title: '交換用アクセサリーのランニングコスト',
                percentage: 8,
                description: '純正の交換パーツ（モップ、バッグ等）が高価で、長期的な維持費が負担になるとの声があります。',
                solutions: [
                    '大型セール・公式キャンペーンでまとめ買い',
                    'ポイント還元の高い通販で定常品を揃える',
                    '純正互換品の有無を定期的に再チェック',
                    '交換周期を無理に前倒ししない'
                ]
            },
            {
                rank: 5,
                title: '初期設定（ファームウェア更新）の遅延',
                percentage: 8,
                description: '最初のファームウェアアップデートに時間がかかりすぎ、不安を感じるユーザーがいます。',
                solutions: [
                    '2.4GHz帯の安定したWi‑Fi近くで実施',
                    'スマホをスリープさせず完了まで待つ',
                    '夜間帯の混雑を避け昼間に再試行',
                    '挙動に問題がなければ一晩置いてから再確認'
                ]
            }
        ],
        recommendations: {
            petOwner: 87,
            apartment: 81,
            working: 86,
            house: 73,
            overall: 82
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+Omni+C28',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+Omni+C28/'
    },
    {
        id: 'dreame-l40s-pro-ultra',
        name: 'Dreame L40s Pro Ultra',
        manufacturer: 'Dreame',
        price: 188000,
        rating: 4.6,
        reviewCount: 29,
        totalReviewCount: 29,
        image: 'https://m.media-amazon.com/images/I/61e2A-2D-hL._AC_SL1500_.jpg',
        badges: ['信頼87.7', '1.1万Pa級', 'MopExtend'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0DGX7Y1V6',
                totalReviews: 18,
                sampleSize: 18,
                adoptedSize: 16,
                excludedSize: 2,
                sakuraScore: 3,
                trustScore: 86.0,
                collectionDate: '2026-04-26'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 11,
                sampleSize: 11,
                adoptedSize: 11,
                excludedSize: 0,
                sakuraScore: 2,
                trustScore: 90.0,
                collectionDate: '2026-04-26'
            }
        },

        overallTrustScore: 87.7,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 29,
            adoptedSize: 27,
            excludedSize: 2,
            collectionDate: '2026-04-26',
            lastUpdated: '2026-04-26'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '合格',
            checkDate: '2026-04-26',
            trustScore: 87.7,
            badge: '🟢 信頼87.7・有効採用27件'
        },

        specs: {
            suction: 99,
            mopping: 95,
            noise: 84,
            obstacle: 93,
            app: 87,
            maintenance: 98
        },
        problems: [
            {
                rank: 1,
                title: 'ステーション（ドック）のサイズ',
                percentage: 7,
                description: '全自動基地は多機能分占有面積が大きく、導入前の採寸が重要、という層',
                solutions: [
                    '設置面の幅・奥行・高さ＋左右5〜10cm余白を先に確保',
                    '給排水・汚水捨ての導線を最優先で決める',
                    'デッドスペース（廊下脇・ユーティリティ）を候補に',
                    '動線上の衝突を防ぐため試運転で帰庫を確認'
                ]
            },
            {
                rank: 2,
                title: '初期のWi-Fi接続',
                percentage: 3,
                description: '2.4GHz手順で再試行が要る、という層',
                solutions: [
                    'スマホのモバイルデータを一時オフ',
                    '2.4GHz SSIDに固定',
                    'ルータ近くでペアリング完走',
                    '公式アプリ内ガイドに沿って再設計'
                ]
            }
        ],
        recommendations: {
            petOwner: 96,
            apartment: 86,
            working: 94,
            house: 95,
            overall: 92
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+L40s+Pro+Ultra',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+L40s+Pro+Ultra/'
    },
    {
        id: 'dreame-l10s-ultra-gen2',
        name: 'Dreame L10s Ultra Gen2',
        manufacturer: 'Dreame',
        price: 99800,
        rating: 4.45,
        reviewCount: 65,
        totalReviewCount: 65,
        image: 'https://m.media-amazon.com/images/I/61kYF6D5mGL._AC_SL1500_.jpg',
        badges: ['信頼92.2', '週280分目安', '1万Pa級'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0DBTHDHYS',
                totalReviews: 32,
                sampleSize: 32,
                adoptedSize: 30,
                excludedSize: 2,
                sakuraScore: 3,
                trustScore: 90.0,
                collectionDate: '2026-04-18'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 22,
                sampleSize: 22,
                adoptedSize: 22,
                excludedSize: 0,
                sakuraScore: 2,
                trustScore: 93.0,
                collectionDate: '2026-04-18'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 9,
                sampleSize: 9,
                adoptedSize: 8,
                excludedSize: 1,
                sakuraScore: 1,
                trustScore: 91.0,
                collectionDate: '2026-04-18'
            },
            yodobashi: {
                platform: 'ヨドバシ.com',
                totalReviews: 2,
                sampleSize: 2,
                adoptedSize: 2,
                excludedSize: 0,
                sakuraScore: 0,
                trustScore: 89.0,
                collectionDate: '2026-04-18'
            }
        },

        overallTrustScore: 92.15,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 65,
            adoptedSize: 62,
            excludedSize: 3,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '合格',
            checkDate: '2026-04-18',
            trustScore: 92.15,
            badge: '🟢 信頼92.2・有効採用62件'
        },

        specs: {
            suction: 97,
            mopping: 93,
            noise: 86,
            obstacle: 84,
            app: 90,
            maintenance: 96
        },
        problems: [
            {
                rank: 1,
                title: '自動ゴミ収集時の瞬間的な騒音',
                percentage: 9,
                description: 'ダスト回収の吸引音は短いが大きく、深夜・早朝のスケジュールでは配慮が必要',
                solutions: [
                    'アプリのおやすみモードで夜間の自動収集をオフ',
                    '帰宅後・在宅帯に収集予約',
                    'ステーションを寝室から遠ざける',
                    '収集直後の稼働を避ける週次ルールにする'
                ]
            },
            {
                rank: 2,
                title: 'ベースステーションの設置場所',
                percentage: 8,
                description: '全自動基地は寸法が大きく、ユーティリティ以外では圧迫感が出やすい',
                solutions: [
                    '幅35cm・高さ60cm・奥行50cm前後の目安を事前採寸',
                    '水補充・汚水捨ての導線を最優先で決める',
                    '脱衣所・廊下尽きなどデッドスペースを検討',
                    '図面とコンセント位置を併せて確認'
                ]
            },
            {
                rank: 3,
                title: '専用洗浄液のランニングコスト',
                percentage: 6,
                description: '純正洗浄液の年間負担が気になる、という層',
                solutions: [
                    '半年周期を前提に日割りで試算',
                    '公式セールのまとめ買い',
                    '消耗品を年間で予算化',
                    '推奨希釈倍率を守り無駄打ちを防ぐ'
                ]
            },
            {
                rank: 4,
                title: '初期Wi-Fi（2.4GHz）接続',
                percentage: 4,
                description: '5GHzのままペアリングに失敗する、VPNや端末制限のケース',
                solutions: [
                    'ルータの2.4GHz SSIDに接続してセットアップ',
                    'VPNとプライベートアドレスを一時オフ',
                    'ルータ近くで初回接続完走',
                    '公式手順のQR・手動入力を併用'
                ]
            },
            {
                rank: 5,
                title: '隅付近の取り残し',
                percentage: 3,
                description: 'サイドブラシの到達限界で微細塵が稀に残る、という層',
                solutions: [
                    'エッジ清掃の回数をアプリで増やす',
                    '週1は手掃除で角をフォロー',
                    '障害物を初回マッピング前に片付け',
                    '部屋区画の分割清掃で通過回数を稼ぐ'
                ]
            }
        ],
        recommendations: {
            petOwner: 92,
            apartment: 88,
            working: 96,
            house: 91,
            overall: 92
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+L10s+Ultra+Gen2',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+L10s+Ultra+Gen2/'
    },
    {
        id: 'roborock-saros-10r',
        name: 'Roborock Saros 10R',
        manufacturer: 'Roborock',
        price: 149800,
        rating: 4.8,
        reviewCount: 226,
        totalReviewCount: 226,
        image: 'https://m.media-amazon.com/images/I/61NlU9C4vYL._AC_SL1500_.jpg',
        badges: ['床掃除98点', '8.05cm薄型', '年152h目安'],
        specs: {
            suction: 98,
            mopping: 92,
            noise: 84,
            obstacle: 86,
            app: 94,
            maintenance: 97
        },
        problems: [
            {
                rank: 1,
                title: '初期投資（約15万円）',
                percentage: 15,
                description: 'フラッグシップ価格帯のため、導入のハードルが高い、という層。',
                solutions: ['高還元時期に購入', '延長保証の検討', '年152h目安の時短で再試算']
            },
            {
                rank: 2,
                title: 'ドックの設置',
                percentage: 10,
                description: '全自動ドックの寸法で置き場に困る、という層。',
                solutions: ['左右5cm・前方1.2mの目安', '薄型本体を活かしたレイアウト', '図面で採寸']
            },
            {
                rank: 3,
                title: '給排水・初期設定',
                percentage: 7,
                description: '排水管理やネット初期設定に戸惑う、という層。',
                solutions: ['水場近くにドック', '公式ガイド', '2.4GHz帯の確認']
            }
        ],
        recommendations: {
            petOwner: 96,
            apartment: 95,
            working: 97,
            house: 93,
            overall: 95
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roborock+Saros+10R',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roborock+Saros+10R/'
    },
    {
        id: 'dreame-x50-ultra',
        name: 'Dreame X50 Ultra',
        manufacturer: 'Dreame',
        price: 228000,
        rating: 4.8,
        reviewCount: 45,
        totalReviewCount: 45,
        image: 'https://m.media-amazon.com/images/I/61NlUu1zS6L._AC_SL1500_.jpg',
        badges: ['19,500Pa', '信頼度64', '年128h目安'],
        specs: {
            suction: 100,
            mopping: 96,
            noise: 82,
            obstacle: 92,
            app: 90,
            maintenance: 99
        },
        problems: [
            {
                rank: 1,
                title: '導入コスト',
                percentage: 26,
                description: '20万円超の価格帯で、購入の心理的ハードルが高い、という層。',
                solutions: ['年128h目安の時短で再試算', 'セール・ポイント併用', '長年使う日割りで判断']
            },
            {
                rank: 2,
                title: 'ベースの設置面積',
                percentage: 22,
                description: '多機能ドックの寸法で、日本の住居では置き場の確保に苦慮する、という層。',
                solutions: ['ARで事前採寸', '背面10cm排気', '水場近くの平坦面']
            },
            {
                rank: 3,
                title: 'アプリの項目の多さ・消耗費',
                percentage: 11,
                description: '初期設定の画面が多い・年間の消耗品負担が気になる、という層。',
                solutions: ['ガイドに沿って段階設定', '純正／代替の使い分け', '掃除頻度で消耗を調整']
            }
        ],
        recommendations: {
            petOwner: 99,
            apartment: 89,
            working: 94,
            house: 95,
            overall: 95
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+X50+Ultra',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+X50+Ultra/'
    },
    {
        id: 'ecovacs-deebot-x8-pro-omni',
        name: 'DEEBOT X8 PRO OMNI',
        manufacturer: 'ECOVACS',
        price: 199800,
        rating: 4.6,
        reviewCount: 371,
        totalReviewCount: 371,
        image: 'https://m.media-amazon.com/images/I/61M07Z8YVTL._AC_SL1500_.jpg',
        badges: ['床掃除98点', 'オズモTurbo3.0+', '年128h目安'],
        specs: {
            suction: 98,
            mopping: 98,
            noise: 84,
            obstacle: 88,
            app: 90,
            maintenance: 97
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションの設置スペース',
                percentage: 10,
                description: '多機能ドックの寸法で、賃貸・狭小住宅では置き場の確保に苦慮する、という層。',
                solutions: ['左右30cm・前方1mの目安', '平坦面への設置', '家具配置の見直し']
            },
            {
                rank: 2,
                title: '価格と消耗品',
                percentage: 8,
                description: '本体価格と年間の消耗品負担が購入のハードル、という層。',
                solutions: ['公式の定期便', '水拭き頻度の調整', '必要部位のみ交換の計画立て']
            },
            {
                rank: 3,
                title: 'Wi-Fi初期設定',
                percentage: 5,
                description: '2.4GHz・バンド混在でペアリングに戸惑う、という層。',
                solutions: ['設定時2.4GHz固定', 'バンドステアリング一時オフ', 'ルーター近接']
            }
        ],
        recommendations: {
            petOwner: 96,
            apartment: 89,
            working: 94,
            house: 95,
            overall: 94
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+X8+PRO+OMNI',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+X8+PRO+OMNI/'
    },
    {
        id: 'roomba-plus-505-combo',
        name: 'Roomba Plus 505 Combo',
        manufacturer: 'iRobot',
        price: 69800,
        rating: 4.6,
        reviewCount: 360,
        totalReviewCount: 360,
        image: 'https://m.media-amazon.com/images/I/71u9S+7HkFL._AC_SL1500_.jpg',
        badges: ['床掃除97点', '信頼度92.5点', '口コミ360件'],
        specs: { suction: 97, mopping: 92, noise: 75, obstacle: 84, app: 89, maintenance: 96 },
        problems: [
            { rank: 1, title: '収集音が大きい', percentage: 14, description: 'クリーンベース集塵時。', solutions: ['スケジュールを日中に', 'おやすみモード', '設置位置の見直し'] },
            { rank: 2, title: '2.4GHz接続', percentage: 4, description: '初期ペアリング。', solutions: ['スマホを2.4GHzに', 'ルーター近接', 'FAQ手順'] }
        ],
        recommendations: { petOwner: 97, apartment: 82, working: 96, house: 92, overall: 94 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+Plus+505+Combo',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+Plus+505+Combo/'
    },
    {
        id: 'deebot-t80-omni',
        name: 'DEEBOT T80 OMNI',
        manufacturer: 'ECOVACS',
        price: 149800,
        rating: 4.76,
        reviewCount: 922,
        totalReviewCount: 922,
        image: 'https://m.media-amazon.com/images/I/61m9f7nE9lL._AC_SL1500_.jpg',
        badges: ['床掃除100点', '信頼度100点', '年182h目安'],
        specs: {
            suction: 100,
            mopping: 100,
            noise: 86,
            obstacle: 95,
            app: 95,
            maintenance: 98
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションの圧倒的サイズ',
                percentage: 12,
                description: '多機能ドックの寸法で設置位置の確保が課題。賃貸の設置面で評価が分かれます。',
                solutions: [
                    '図面で採寸',
                    '帰庫・給排水のクリアランス',
                    '補助スペースの検討'
                ]
            },
            {
                rank: 2,
                title: 'ローラーモップ周りの衛生',
                percentage: 5,
                description: '汚水の長時間放置は臭い要因。常時洗浄でも排水・乾燥の運用が重要です。',
                solutions: [
                    '汚水の即排水',
                    '専用洗浄液の常時使用',
                    'アプリの乾燥時間（長め）'
                ]
            }
        ],
        recommendations: {
            petOwner: 98,
            apartment: 88,
            working: 99,
            house: 97,
            overall: 97
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+T80+OMNI',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+T80+OMNI/'
    },
    {
        id: 'deebot-t50-omni',
        name: 'DEEBOT T50 OMNI',
        manufacturer: 'ECOVACS',
        price: 159800,
        rating: 4.8,
        reviewCount: 184,
        totalReviewCount: 184,
        image: 'https://m.media-amazon.com/images/I/61jC8VvG61L._AC_SL1500_.jpg',
        badges: ['81mm最薄', '床掃除99点', '年122h目安'],
        specs: {
            suction: 99,
            mopping: 99,
            noise: 92,
            obstacle: 90,
            app: 93,
            maintenance: 98
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションの設置・給排水',
                percentage: 10,
                description: '多機能ドックの寸法と水タンクの給排水の手間が、設置面で不満に繋がりやすいです。',
                solutions: [
                    '左右5cm・前方1.5mの目安を事前採寸',
                    '水拭き強度を調整して補水頻度を最適化',
                    '給排水の動線を確保'
                ]
            },
            {
                rank: 2,
                title: 'Wi-Fi 2.4GHz帯のペアリング',
                percentage: 4,
                description: '5GHz接続のままだと初期ペアリングに失敗しやすい、という声があります。',
                solutions: [
                    'ペアリング時だけスマホを2.4GHzに固定',
                    'ルーター近くで設定',
                    '完了後5GHzに戻して可'
                ]
            }
        ],
        recommendations: {
            petOwner: 96,
            apartment: 98,
            working: 95,
            house: 93,
            overall: 96
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+T50+OMNI',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+T50+OMNI/'
    },
    {
        id: 'ecovacs-deebot-mini',
        name: 'DEEBOT mini',
        manufacturer: 'ECOVACS',
        price: 15800,
        rating: 4.2,
        reviewCount: 52,
        totalReviewCount: 52,
        image: 'https://m.media-amazon.com/images/I/61mZ6U-yZtL._AC_SL1500_.jpg',
        badges: ['信頼64.3', '5.7cm薄型', '採用48件'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F32SK8QX',
                totalReviews: 24,
                sampleSize: 24,
                adoptedSize: 22,
                excludedSize: 2,
                sakuraScore: 2,
                trustScore: 64.0,
                collectionDate: '2026-04-26'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 16,
                sampleSize: 16,
                adoptedSize: 15,
                excludedSize: 1,
                sakuraScore: 2,
                trustScore: 64.5,
                collectionDate: '2026-04-26'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 12,
                sampleSize: 12,
                adoptedSize: 11,
                excludedSize: 1,
                sakuraScore: 2,
                trustScore: 64.0,
                collectionDate: '2026-04-26'
            }
        },

        overallTrustScore: 64.25,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 52,
            adoptedSize: 48,
            excludedSize: 4,
            collectionDate: '2026-04-26',
            lastUpdated: '2026-04-26'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '参考（小サンプル）',
            checkDate: '2026-04-26',
            trustScore: 64.25,
            badge: '🟡 実数52件・採用48件'
        },

        specs: {
            suction: 88,
            mopping: 20,
            noise: 82,
            obstacle: 50,
            app: 0,
            maintenance: 96
        },
        problems: [
            {
                rank: 1,
                title: '段差・ラグでスタック',
                percentage: 26,
                description: '薄型小径ホイールのため、小さな段差やラグ端で立ち往生しやすい、という帯が目立ちます。',
                solutions: [
                    '段差前に極薄スロープ',
                    'ラグの固定・薄手への変更',
                    '進入を家具やテープで物理ブロック',
                    'バリアに近い平坦間取りで運用'
                ]
            },
            {
                rank: 2,
                title: '毛足の長いラグ・絨毯で力不足',
                percentage: 17,
                description: 'ブラシレス帯のため、絨毯の掻き出し力は限定的。ラグ上で空回りしやすい、という帯。',
                solutions: [
                    'フロア清掃をメイン日に',
                    'ラグは掃除時だけ端を捲る',
                    '毛足短めラグに替える'
                ]
            },
            {
                rank: 3,
                title: 'ランダム走行の迷子・帰庫失敗',
                percentage: 10,
                description: '地図非搭載のため、充電台を見失う・狭い戸建で戻り遅延、という帯。',
                solutions: [
                    'ドック前は左右50cm・前方1.5m空ける',
                    '赤外線窓の清掃',
                    '1部屋ずつドアで区切って運用'
                ]
            },
            {
                rank: 4,
                title: '水拭きはおまけ扱い',
                percentage: 8,
                description: '水拭きは補助扱いのため、期待度が上がると不満に繋がる、という帯。',
                solutions: [
                    '吸引専用と割り切る',
                    '別途フロアワイパー併用'
                ]
            },
            {
                rank: 5,
                title: '充電台への帰還失敗',
                percentage: 6,
                description: '障害物・導線で到達前に止まる報告。迷子5件＋戻れない3件の文脈。',
                solutions: [
                    'ドック周辺の直線導線を確保',
                    '明るい位置に据える',
                    '低い障害物を片付け'
                ]
            }
        ],
        recommendations: {
            petOwner: 93,
            apartment: 88,
            working: 65,
            house: 58,
            overall: 76
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+mini+ECOVACS',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+mini/'
    },
    {
        id: 'ecovacs-deebot-t90-omni',
        name: 'DEEBOT T90 OMNI',
        manufacturer: 'ECOVACS',
        price: 149800,
        rating: 4.8,
        reviewCount: 144,
        totalReviewCount: 144,
        image: 'https://m.media-amazon.com/images/I/51uIuPZ6X+L._AC_SL1500_.jpg',
        badges: ['床掃除98点', '信頼度88点', '年152h目安'],
        specs: { suction: 98, mopping: 85, noise: 86, obstacle: 75, app: 94, maintenance: 96 },
        problems: [
            { rank: 1, title: 'ステーション設置', percentage: 10, description: '大型ドックのクリアランス。', solutions: ['採寸', 'AR確認', '帰庫テスト'] },
            { rank: 2, title: '集塵音', percentage: 8, description: '短時間の吸引音。', solutions: ['おやすみモード', '帯の調整'] }
        ],
        recommendations: { petOwner: 95, apartment: 88, working: 94, overall: 93 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+T90+OMNI',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+T90+OMNI/'
    },
    {
        id: 'eufy-robot-vacuum-omni-e25',
        name: 'Eufy Robot Vacuum Omni E25',
        manufacturer: 'Anker',
        price: 74800,
        rating: 4.7,
        reviewCount: 655,
        totalReviewCount: 655,
        image: 'https://m.media-amazon.com/images/I/61K-P2XU+iL._AC_SL1500_.jpg',
        badges: ['床掃除97点', '信頼度100点', '年122h目安'],
        specs: { suction: 97, mopping: 82, noise: 84, obstacle: 78, app: 92, maintenance: 98 },
        problems: [
            { rank: 1, title: 'ステーション設置スペース', percentage: 8, description: '大型ドックのクリアランス。', solutions: ['公式クリアランス', '採寸してから配置', '帰庫テスト'] },
            { rank: 2, title: '集塵音', percentage: 6, description: '短時間の吸引音。', solutions: ['おやすみモード', '昼間帯に集塵'] }
        ],
        recommendations: { petOwner: 96, apartment: 87, working: 94, overall: 93 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+Robot+Vacuum+Omni+E25',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+Robot+Vacuum+Omni+E25/'
    },
    {
        id: 'eufy-x10-pro-omni',
        name: 'Eufy X10 Pro Omni',
        manufacturer: 'Anker',
        price: 99990,
        rating: 4.6,
        reviewCount: 458,
        totalReviewCount: 458,
        image: 'https://m.media-amazon.com/images/I/61Nl6LpXWXL._AC_SL1500_.jpg',
        badges: ['8000Pa吸引', 'コスパ最強', '年134h目安'],
        specs: {
            suction: 96,
            mopping: 96,
            noise: 82,
            obstacle: 88,
            app: 92,
            maintenance: 98
        },
        problems: [
            {
                rank: 1,
                title: 'ドックの設置・騒音',
                percentage: 10,
                description: '大型ドックの寸法と、集塵時の音が設置・運用の課題になりやすいです。',
                solutions: ['左右0.5m・前方1.5mの目安', 'おやすみモード', '日中の集塵スケジュール']
            },
            {
                rank: 2,
                title: '水タンクの重量・給排水',
                percentage: 8,
                description: '4Lタンク満水時の持ち運び負担、という層。',
                solutions: ['満水にしない', '水場近くに配置', '給水頻度の調整']
            },
            {
                rank: 3,
                title: 'Wi-Fi再設定',
                percentage: 3,
                description: '初期接続・再ペアリングに手間を感じる、という層。',
                solutions: ['2.4GHz帯で設定', 'ルーター近接', '公式FAQ']
            }
        ],
        recommendations: {
            petOwner: 96,
            apartment: 87,
            working: 94,
            house: 93,
            overall: 93
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+X10+Pro+Omni',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+X10+Pro+Omni/'
    },
    {
        id: 'eufy-clean-x8-pro-self-empty',
        name: 'Eufy Clean X8 Pro with Self-Empty Station',
        manufacturer: 'Anker',
        price: 69990,
        rating: 4.49,
        reviewCount: 311,
        totalReviewCount: 311,
        image: 'https://m.media-amazon.com/images/I/61fW8-S5XFL._AC_SL1500_.jpg',
        badges: ['ペット毛98点', '信頼度92', '年121h目安'],
        specs: { suction: 96, mopping: 70, noise: 83, obstacle: 79, app: 89, maintenance: 95 },
        problems: [
            {
                rank: 1,
                title: '自動ゴミ収集時の吸引音',
                percentage: 6,
                description: '約15秒の集塵音が大きく、集合住宅では時間帯の配慮が必要な場合があります。',
                solutions: ['おやすみモード', '昼間帯のスケジュール', '生活動線から離して設置']
            },
            {
                rank: 2,
                title: '初期設定のWi-Fi（2.4GHz）',
                percentage: 3,
                description: '5GHz接続のままだとペアリングに失敗しやすい、という文脈があります。',
                solutions: ['設定時のみ2.4GHzに固定', '専用SSID', 'ルーター近くで設定']
            },
            {
                rank: 3,
                title: 'ドックの設置スペース',
                percentage: 5,
                description: 'ステーション分の置き場所の確保が課題になる場合があります。',
                solutions: ['事前採寸', '壁際・死角の活用', '配線の整理']
            }
        ],
        recommendations: { petOwner: 97, apartment: 86, working: 93, house: 93, overall: 92 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+Clean+X8+Pro',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+Clean+X8+Pro/'
    },
    {
        id: 'eufy-robot-vacuum-omni-c20',
        name: 'Eufy Robot Vacuum Omni C20',
        manufacturer: 'Anker',
        price: 89900,
        rating: 4.78,
        reviewCount: 215,
        totalReviewCount: 215,
        image: 'https://m.media-amazon.com/images/I/61r5Z-H8XmL._AC_SL1500_.jpg',
        badges: ['7000Pa吸引', '全自動コスパ', '年121h目安'],
        specs: { suction: 98, mopping: 95, noise: 80, obstacle: 75, app: 90, maintenance: 96 },
        problems: [
            {
                rank: 1,
                title: 'ゴミ収集時の騒音',
                percentage: 12,
                description: 'ドック集塵時の短時間だが大きな音が、静かな時間帯に響きやすい、という層。',
                solutions: ['おやすみモード', '日中のスケジュール掃除', '外出中の完了設定']
            },
            {
                rank: 2,
                title: '浄水・汚水タンクの給排水',
                percentage: 8,
                description: 'コンパクトドックゆえタンク容量に限りがあり、水拭き頻度が高いと給排水が手間、という層。',
                solutions: ['水拭き強度を標準・低に', '掃除頻度の調整', '給水の習慣化']
            },
            {
                rank: 3,
                title: '段差・マット周り',
                percentage: 6,
                description: '特定の段差や薄いマットで停止・巻き込みが出る、という層。',
                solutions: ['進入禁止エリア', 'マット端の整理', '公式推奨の段差目安の確認']
            }
        ],
        recommendations: { petOwner: 95, apartment: 87, working: 94, house: 92, overall: 92 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+Robot+Vacuum+Omni+C20',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+Robot+Vacuum+Omni+C20/'
    },
    {
        id: 'eufy-robot-vacuum-omni-s1-pro',
        name: 'Eufy Robot Vacuum Omni S1 Pro',
        manufacturer: 'Anker',
        price: 199900,
        rating: 4.6,
        reviewCount: 145,
        totalReviewCount: 145,
        image: 'https://m.media-amazon.com/images/I/61mZ6W6GvXL._AC_SL1500_.jpg',
        badges: ['床掃除99点', '常時洗浄モップ', '年152h目安'],
        specs: { suction: 99, mopping: 99, noise: 80, obstacle: 88, app: 90, maintenance: 94 },
        problems: [
            {
                rank: 1,
                title: 'ステーションの大型化',
                percentage: 19,
                description: '多機能ドックの寸法で設置面に難儀する、という層。',
                solutions: ['公式図面で採寸', '左右50cm・前方1.5m', '明るいスペースへの配置']
            },
            {
                rank: 2,
                title: '汚水タンクのニオイ',
                percentage: 8,
                description: '汚水の長時間放置で不快臭、という層。',
                solutions: ['清掃後の即排水', '専用洗浄液', '高気温日は特に注意']
            },
            {
                rank: 3,
                title: '集塵・洗浄の騒音',
                percentage: 7,
                description: 'ドック作業時の音が気になる、という層。',
                solutions: ['おやすみモード', '収集時間の枠外し', '生活動線から離す']
            }
        ],
        recommendations: { petOwner: 96, apartment: 82, working: 95, house: 93, overall: 94 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+Robot+Vacuum+Omni+S1+Pro',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+Robot+Vacuum+Omni+S1+Pro/'
    },
    {
        id: 'eufy-robovac-g30-hybrid',
        name: 'Eufy RoboVac G30 Hybrid',
        manufacturer: 'Anker',
        price: 29990,
        rating: 4.5,
        reviewCount: 1015,
        totalReviewCount: 1015,
        image: 'https://m.media-amazon.com/images/I/718VvV9X9XL._AC_SL1500_.jpg',
        badges: ['7.2cm薄型', '信頼度100', '年121h目安'],
        specs: { suction: 90, mopping: 86, noise: 85, obstacle: 78, app: 84, maintenance: 86 },
        problems: [
            {
                rank: 1,
                title: '段差・マットでの立ち往生',
                percentage: 4,
                description: '薄いマット・黒床・特定段差でセンサー誤認や停止が出やすい、という層。',
                solutions: ['境界線テープ', 'センサー清掃', 'マット周りの整理']
            },
            {
                rank: 2,
                title: 'マッピング重複走行',
                percentage: 3,
                description: 'ジャイロ航法のため、広い空間で同じ箇所を往復しやすい、という層。',
                solutions: ['ステーション周囲の余裕', '家具配置の直線化', '充電基準の定位置']
            },
            {
                rank: 3,
                title: '水タンク・ダストの容量',
                percentage: 3,
                description: '水・ゴミ捨ての頻度が気になる、という層。',
                solutions: ['水拭き「低」設定', '部屋分割運用', '吸引メインの日を設ける']
            }
        ],
        recommendations: { petOwner: 88, apartment: 85, working: 90, house: 84, overall: 87 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+RoboVac+G30+Hybrid',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+RoboVac+G30+Hybrid/'
    },
    {
        id: 'eufy-robovac-g10-hybrid',
        name: 'Eufy RoboVac G10 Hybrid',
        manufacturer: 'Anker',
        price: 29990,
        rating: 4.2,
        reviewCount: 102,
        totalReviewCount: 102,
        image: 'https://m.media-amazon.com/images/I/61-B9+P0eLL._AC_SL1500_.jpg',
        badges: ['ブラシレス', 'ハイブリッド', '採用102件'],
        specs: {
            suction: 92,
            mopping: 55,
            noise: 90,
            obstacle: 68,
            app: 70,
            maintenance: 86
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+RoboVac+G10+Hybrid',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+RoboVac+G10+Hybrid/'
    },
    {
        id: 'eufy-robovac-x8-hybrid',
        name: 'Eufy RoboVac X8 Hybrid',
        manufacturer: 'Anker',
        price: 59800,
        rating: 4.5,
        reviewCount: 12,
        totalReviewCount: 12,
        image: 'https://m.media-amazon.com/images/I/61-B9+P0eLL._AC_SL1500_.jpg',
        badges: ['ペット毛90点', '信頼度64点', '年156h目安'],
        specs: { suction: 92, mopping: 88, noise: 82, obstacle: 80, app: 90, maintenance: 85 },
        problems: [
            { rank: 1, title: '水タンクの容量', percentage: 25, description: '広範囲水拭きで給水が途切れやすい。', solutions: ['水量「低」に設定', 'タンク手入れを公式手順で'] },
            { rank: 2, title: '長毛ラグで停止', percentage: 15, description: '乗り上げエラーの文脈。', solutions: ['進入禁止エリア', '掃除時にラグを巻く'] },
            { rank: 3, title: '手動ゴミ捨て', percentage: 10, description: '収集ドック非搭載。', solutions: ['2〜3日で捨てる習慣', 'ダストボックス清潔に'] }
        ],
        recommendations: { petOwner: 90, apartment: 85, working: 88, overall: 88 },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+RoboVac+X8+Hybrid',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+RoboVac+X8+Hybrid/'
    },
    {
        id: 'roomba-combo-10-max',
        name: 'Roomba Combo 10 Max ロボット + AutoWash 充電ステーション',
        manufacturer: 'iRobot',
        price: 197800,
        rating: 4.6,
        reviewCount: 42,
        totalReviewCount: 42,
        image: 'https://m.media-amazon.com/images/I/61KkU0t10FL._AC_SL1500_.jpg',
        badges: ['信頼89.5', 'AutoWash', '採用40件'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0DD6LQSGD',
                totalReviews: 22,
                sampleSize: 22,
                adoptedSize: 21,
                excludedSize: 1,
                sakuraScore: 3,
                trustScore: 88.0,
                collectionDate: '2026-04-18'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 14,
                sampleSize: 14,
                adoptedSize: 14,
                excludedSize: 0,
                sakuraScore: 2,
                trustScore: 90.0,
                collectionDate: '2026-04-18'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 5,
                sampleSize: 5,
                adoptedSize: 4,
                excludedSize: 1,
                sakuraScore: 1,
                trustScore: 89.0,
                collectionDate: '2026-04-18'
            },
            yodobashi: {
                platform: 'ヨドバシ.com',
                totalReviews: 1,
                sampleSize: 1,
                adoptedSize: 1,
                excludedSize: 0,
                sakuraScore: 0,
                trustScore: 88.0,
                collectionDate: '2026-04-18'
            }
        },

        overallTrustScore: 89.45,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 42,
            adoptedSize: 40,
            excludedSize: 2,
            collectionDate: '2026-04-18',
            lastUpdated: '2026-04-18'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '合格',
            checkDate: '2026-04-18',
            trustScore: 89.45,
            badge: '🟢 信頼89.5・有効採用40件'
        },

        specs: {
            suction: 96,
            mopping: 92,
            noise: 72,
            obstacle: 88,
            app: 90,
            maintenance: 98
        },
        problems: [
            {
                rank: 1,
                title: 'モップ乾燥時の動作音',
                percentage: 28,
                description: '乾燥ファン音が長時間続き、生活動線や寝室近くで気になる、という層',
                solutions: [
                    'アプリで乾燥・稼働を日中・不在時に寄せる',
                    'リビングから寝室を離して基地を配置',
                    '就寝帯外にスケジュール固定',
                    '在宅中は乾燥を一時停止し帰宅後に再開'
                ]
            },
            {
                rank: 2,
                title: 'AutoWash基地の大きさ',
                percentage: 21,
                description: '給排水・多機能分ステーションの占有面積が大きい、という層',
                solutions: [
                    '採寸のうえ給水・汚水捨ての導線を最優先',
                    '脱衣所・廊下尽き等の奥行き余裕のある箇所を検討',
                    'コンセント位置と扉の干渉を事前確認',
                    '動かしにくい前提で最終置き場を決定'
                ]
            },
            {
                rank: 3,
                title: '初期不良・不具合',
                percentage: 7,
                description: '水漏れ・通信等の早期トラブル報告は少数ながら存在',
                solutions: [
                    '正規・国内サポート窓口に即連絡',
                    '7日以内の動作確認を推奨',
                    '交換方針は公式手順に従う',
                    '初期は給排水ホースの抜け漏れ再確認'
                ]
            },
            {
                rank: 4,
                title: '消耗品のランニング',
                percentage: 7,
                description: '紙パック・洗浄液・パッド等で年間負担が積み上がる、という層',
                solutions: [
                    'セール時のまとめ買い',
                    '定期便・定額還元の高い日を狙う',
                    '交換周期をアプリ推奨に合わせ過剰交換しない',
                    '年間目安2.2万円前後で家計に織り込む'
                ]
            },
            {
                rank: 5,
                title: '角・コーナーの取り残し',
                percentage: 5,
                description: '円形機の到達限界で角付近に僅差が残る、という層',
                solutions: [
                    'エッジ清掃の頻度をアプリで上げる',
                    '週1は手持ちで角だけフォロー',
                    '家具配置で角への接近導線を作る',
                    '禁止エの過多設定を見直し'
                ]
            }
        ],
        recommendations: {
            petOwner: 92,
            apartment: 78,
            working: 96,
            house: 90,
            overall: 90
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+Combo+10+Max',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+Combo+10+Max/'
    },
    {
        id: 'roomba-mini-slim-slimcharge',
        name: 'Roomba Mini Slim + SlimCharge',
        manufacturer: 'iRobot',
        price: 39800,
        rating: 4.59,
        reviewCount: 47,
        totalReviewCount: 47,
        image: 'https://m.media-amazon.com/images/I/61-B9+P0eLL._AC_SL1500_.jpg',
        badges: ['薄型LiDAR', 'SlimCharge', '採用47件'],
        specs: {
            suction: 92,
            mopping: 78,
            noise: 82,
            obstacle: 75,
            app: 90,
            maintenance: 94
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+Mini+Slim',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+Mini+Slim/'
    },
    {
        id: 'eufy-robovac-g30',
        name: 'Anker Eufy RoboVac G30',
        manufacturer: 'Anker',
        price: 24800,
        rating: 4.42,
        reviewCount: 257,
        totalReviewCount: 257,
        image: 'https://m.media-amazon.com/images/I/71u9S+7T6SL._AC_SL1500_.jpg',
        badges: ['信頼92.5', '257件', '静音98'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0BXDC3417',
                totalReviews: 130,
                sampleSize: 130,
                adoptedSize: 130,
                excludedSize: 0,
                sakuraScore: 3,
                trustScore: 92.0,
                collectionDate: '2026-04-26'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 90,
                sampleSize: 90,
                adoptedSize: 90,
                excludedSize: 0,
                sakuraScore: 3,
                trustScore: 92.8,
                collectionDate: '2026-04-26'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 37,
                sampleSize: 37,
                adoptedSize: 37,
                excludedSize: 0,
                sakuraScore: 2,
                trustScore: 92.2,
                collectionDate: '2026-04-26'
            }
        },

        overallTrustScore: 92.5,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 257,
            adoptedSize: 257,
            excludedSize: 0,
            collectionDate: '2026-04-26',
            lastUpdated: '2026-04-26'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-04-26',
            trustScore: 92.5,
            badge: '🟢 3サイト統合・採用257件'
        },

        specs: {
            suction: 90,
            mopping: 15,
            noise: 98,
            obstacle: 70,
            app: 88,
            maintenance: 85
        },
        problems: [
            {
                rank: 1,
                title: 'アプリで進入禁止が作れない（磁気テープ必須）',
                percentage: 14,
                description: '画面上の禁止エが使えず、付属の境界線テープで区切る運用に不満や手間を感じる、という帯です。',
                solutions: [
                    '付属テープで危険ゾーンを物理ブロック',
                    '家具配置で通れない導線を作る',
                    '追加磁気テープを公式・互換で補足',
                    '薄く貼る・色近いテープで目立ちを抑える'
                ]
            },
            {
                rank: 2,
                title: '段差・黒床・ラグでスタック',
                percentage: 8,
                description: '1.5cm付近の段差やジョイント、黒系床の誤検知、軽量ラグで停止する報告が複数あります。',
                solutions: [
                    '境界線テープで立ち入り制限',
                    '段差前に極薄スロープ',
                    'センサー窓を週1乾拭き',
                    'ラグは四隅固定または撤去日を分ける'
                ]
            },
            {
                rank: 3,
                title: '磁気テープ運用の手間',
                percentage: 5,
                description: '貼り直し・配置に時間がかかる、という声。',
                solutions: [
                    '固定家具でライン代用',
                    'テープは床に沿わせる',
                    '清掃ルートを部屋分割で短縮'
                ]
            },
            {
                rank: 4,
                title: '水拭き非搭載',
                percentage: 3,
                description: '吸引専用の2万円帯。湿式を期待した層に物足なさ。',
                solutions: [
                    'G30 Hybrid等を検討',
                    '別途モップで週1補完'
                ]
            },
            {
                rank: 5,
                title: '毛足の長いラグが苦手',
                percentage: 7,
                description: '深い絨毯では吸引力が物足りない、という帯。薄手マットなら完走しやすい。',
                solutions: [
                    '絨毯ゾーンをテープで除外',
                    '清掃日だけラグ端を捲る'
                ]
            }
        ],
        recommendations: {
            petOwner: 82,
            apartment: 94,
            working: 87,
            house: 82,
            overall: 86
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+RoboVac+G30',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+RoboVac+G30/'
    },
    {
        id: 'roomba-max-705-combo-autowash',
        name: 'Roomba Max 705 Combo + AutoWash',
        manufacturer: 'iRobot',
        price: 184800,
        rating: 4.5,
        reviewCount: 67,
        totalReviewCount: 67,
        image: 'https://m.media-amazon.com/images/I/61Sj2H+XFLL._AC_SL1500_.jpg',
        badges: ['信頼76.5', 'AutoWash', '採用65件'],

        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0FLYLR5XV',
                totalReviews: 32,
                sampleSize: 32,
                adoptedSize: 31,
                excludedSize: 1,
                sakuraScore: 2,
                trustScore: 75.0,
                collectionDate: '2026-04-26'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 20,
                sampleSize: 20,
                adoptedSize: 19,
                excludedSize: 1,
                sakuraScore: 2,
                trustScore: 78.0,
                collectionDate: '2026-04-26'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 15,
                sampleSize: 15,
                adoptedSize: 15,
                excludedSize: 0,
                sakuraScore: 2,
                trustScore: 77.0,
                collectionDate: '2026-04-26'
            }
        },

        overallTrustScore: 76.5,

        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 67,
            adoptedSize: 65,
            excludedSize: 2,
            collectionDate: '2026-04-26',
            lastUpdated: '2026-04-26'
        },

        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '参考（新製品・実数小）',
            checkDate: '2026-04-26',
            trustScore: 76.5,
            badge: '🟡 実数67件・採用65件'
        },

        specs: {
            suction: 98,
            mopping: 96,
            noise: 78,
            obstacle: 85,
            app: 90,
            maintenance: 96
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションの動作音と大型ドック',
                percentage: 20,
                description: '吸引・乾燥帯の騒音と、設置に必要な奥行・高さ余白。寝室近くだと在宅帯に刺さる、という帯です。',
                solutions: [
                    'スケジュールを在宅外・昼間帯に寄せる',
                    'ドックを寝室・書斎から離す',
                    'iRobotのおやすみ／静音優先の運用',
                    '乾燥は外出完了後の帯に合わせる'
                ]
            },
            {
                rank: 2,
                title: 'ドックの設置スペース確保',
                percentage: 21,
                description: '大型ドックのため置き場所の選択肢が限られる。前後左右の帰庫導線と上方向のメンテ余白が要る、という帯です。',
                solutions: [
                    '寸法表・ARの事前確認',
                    '水回り近くの直線導線に寄せる',
                    '可動式なら一時的に家電スライド台を検討'
                ]
            },
            {
                rank: 3,
                title: '給排水タンクの重量・取り扱い',
                percentage: 12,
                description: '満水・汚水の移動負担。高いシンクとの段差でこぼしやすい、という層。',
                solutions: [
                    '小分けで給水',
                    '排水の頻度を上げて重量を減らす',
                    'ドック下に防水トレー'
                ]
            },
            {
                rank: 4,
                title: 'モップ乾燥の長時間動作',
                percentage: 9,
                description: '洗浄後の乾燥に時間がかかり音が続く。静粛住宅では計画立て必須、という帯。',
                solutions: [
                    '外出帯に清掃完了を合わせる',
                    '在宅会議中は一時停止',
                    '帯外スケジュール'
                ]
            },
            {
                rank: 5,
                title: '価格帯と初期Wi-Fi手順',
                percentage: 8,
                description: '旗艦価格への納得感はあるが負担は大きい。接続手順の戸惑いが数件、という帯。',
                solutions: [
                    '大型セール・ポイント併用',
                    '2.4GHz帯手順の再確認',
                    'ルーター近くで初回接続'
                ]
            }
        ],
        recommendations: {
            petOwner: 96,
            apartment: 80,
            working: 95,
            house: 93,
            overall: 91
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+Max+705+Combo+AutoWash',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+Max+705+Combo'
    },
    {
        id: 'roborock-q10v-plus',
        name: 'Roborock Q10V+',
        manufacturer: 'Roborock',
        price: 51999,
        rating: 4.87,
        reviewCount: 139,
        totalReviewCount: 139,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 99,
            mopping: 95,
            noise: 85,
            obstacle: 88,
            app: 95,
            maintenance: 82
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roborock+Q10V%2B',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roborock+Q10V+/'
    },
    {
        id: 'deebot-x11-omnicyclone',
        name: 'DEEBOT X11 OmniCyclone',
        manufacturer: 'ECOVACS',
        price: 229900,
        rating: 4.5,
        reviewCount: 154,
        totalReviewCount: 154,
        image: '',
        badges: ['詳細分析', '口コミ統計', 'データ駆動'],
        specs: {
            suction: 98,
            mopping: 94,
            noise: 88,
            obstacle: 92,
            app: 90,
            maintenance: 97
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+X11+OmniCyclone',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+X11+OmniCyclone/'
    },
    {
        id: 'deebot-t50s-omni',
        name: 'DEEBOT T50S OMNI',
        manufacturer: 'ECOVACS',
        price: 89800,
        rating: 4.6,
        reviewCount: 364,
        totalReviewCount: 364,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 88,
            noise: 86,
            obstacle: 82,
            app: 78,
            maintenance: 97
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+T50S+OMNI',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+T50S+OMNI/'
    },
    {
        id: 'deebot-n30',
        name: 'DEEBOT N30',
        manufacturer: 'ECOVACS',
        price: 39800,
        rating: 4.5,
        reviewCount: 117,
        totalReviewCount: 117,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 92,
            noise: 85,
            obstacle: 88,
            app: 90,
            maintenance: 94
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+N30',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+N30/'
    },
    {
        id: 'dreame-d20-pro',
        name: 'Dreame D20 Pro',
        manufacturer: 'Dreame',
        price: 47800,
        rating: 4.6,
        reviewCount: 43,
        totalReviewCount: 43,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 95,
            mopping: 73,
            noise: 97,
            obstacle: 87,
            app: 83,
            maintenance: 82
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+D20+Pro',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+D20+Pro/'
    },
    {
        id: 'dreame-d9-max-gen-2',
        name: 'Dreame D9 Max Gen 2',
        manufacturer: 'Dreame',
        price: 17800,
        rating: 4.5,
        reviewCount: 60,
        totalReviewCount: 60,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 95,
            mopping: 88,
            noise: 92,
            obstacle: 85,
            app: 80,
            maintenance: 82
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+D9+Max+Gen+2',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+D9+Max+Gen+2/'
    },
    {
        id: 'dreame-f10',
        name: 'Dreame F10',
        manufacturer: 'Dreame',
        price: 23800,
        rating: 4.6,
        reviewCount: 94,
        totalReviewCount: 94,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 92,
            noise: 82,
            obstacle: 88,
            app: 72,
            maintenance: 90
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+F10',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+F10/'
    },
    {
        id: 'dreame-x30-ultra',
        name: 'Dreame X30 Ultra',
        manufacturer: 'Dreame',
        price: 69800,
        rating: 4.6,
        reviewCount: 27,
        totalReviewCount: 27,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 85,
            noise: 88,
            obstacle: 82,
            app: 80,
            maintenance: 86
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+X30+Ultra',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+X30+Ultra/'
    },
    {
        id: 'dreame-l10s-ultra-gen-3',
        name: 'Dreame L10s Ultra Gen 3',
        manufacturer: 'Dreame',
        price: 69800,
        rating: 4.7,
        reviewCount: 60,
        totalReviewCount: 60,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 92,
            noise: 88,
            obstacle: 82,
            app: 75,
            maintenance: 97
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+L10s+Ultra+Gen+3',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+L10s+Ultra+Gen+3/'
    },
    {
        id: 'dreame-d10-plus',
        name: 'Dreame D10 Plus',
        manufacturer: 'Dreame',
        price: 22800,
        rating: 4.5,
        reviewCount: 188,
        totalReviewCount: 188,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 94,
            mopping: 82,
            noise: 84,
            obstacle: 77,
            app: 64,
            maintenance: 95
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+D10+Plus',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+D10+Plus/'
    },
    {
        id: 'dreame-l40-ultra-ae',
        name: 'Dreame L40 Ultra AE',
        manufacturer: 'Dreame',
        price: 99800,
        rating: 4.6,
        reviewCount: 95,
        totalReviewCount: 95,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 89,
            noise: 84,
            obstacle: 83,
            app: 70,
            maintenance: 97
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+L40+Ultra+AE',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+L40+Ultra+AE/'
    },
    {
        id: 'dreame-d20-pro-plus',
        name: 'Dreame D20 Pro Plus',
        manufacturer: 'Dreame',
        price: 68800,
        rating: 4.5,
        reviewCount: 44,
        totalReviewCount: 44,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 93,
            mopping: 84,
            noise: 90,
            obstacle: 76,
            app: 86,
            maintenance: 82
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+D20+Pro+Plus',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+D20+Pro+Plus/'
    },
    {
        id: 'dreame-l20-ultra-complete',
        name: 'Dreame L20 Ultra Complete',
        manufacturer: 'Dreame',
        price: 52000,
        rating: 4.8,
        reviewCount: 346,
        totalReviewCount: 346,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 97,
            noise: 82,
            obstacle: 88,
            app: 85,
            maintenance: 96
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+L20+Ultra+Complete',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+L20+Ultra+Complete/'
    },
    {
        id: 'deebot-n30-plus',
        name: 'DEEBOT N30 PLUS',
        manufacturer: 'ECOVACS',
        price: 69800,
        rating: 4.6,
        reviewCount: 357,
        totalReviewCount: 357,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 84,
            noise: 75,
            obstacle: 82,
            app: 86,
            maintenance: 96
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=ECOVACS+DEEBOT+N30+Plus',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+N30+Plus/'
    },
    {
        id: 'roborock-q10v',
        name: 'Roborock Q10V',
        manufacturer: 'Roborock',
        price: 35999,
        rating: 4.6,
        reviewCount: 108,
        totalReviewCount: 108,
        image: '',
        badges: ['新規追加', '詳細分析対応', 'JSON自動追加'],
        specs: {
            suction: 98,
            mopping: 86,
            noise: 80,
            obstacle: 84,
            app: 96,
            maintenance: 75
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roborock+Q10V',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roborock+Q10V/'
    }
];

// フィルター用のマスターデータ
const manufacturers = ['すべて', 'Anker', 'Dreame', 'ECOVACS', 'Roborock', 'SwitchBot', 'iRobot'];
const priceRanges = [
    { label: 'すべて', min: 0, max: Infinity },
    { label: '5万円未満', min: 0, max: 50000 },
    { label: '5万円〜10万円', min: 50000, max: 100000 },
    { label: '10万円以上', min: 100000, max: Infinity }
];
const ratingFilters = [
    { label: 'すべて', min: 0 },
    { label: '★4.0以上', min: 4.0 },
    { label: '★3.5以上', min: 3.5 }
];
