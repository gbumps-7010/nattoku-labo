// 製品データベース
const productsData = [
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
        rating: 4.5,
        reviewCount: 586,
        totalReviewCount: 586,
        image: 'https://m.media-amazon.com/images/I/61M0vPzS-NL._AC_SL1500_.jpg',
        badges: ['コスパ1位', '静音性1位', '4大ECサイト統合'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F7GGN94D',
                totalReviews: 124,
                sampleSize: 124,
                adoptedSize: 114,
                excludedSize: 10,
                sakuraScore: 8,
                trustScore: 77.28,
                collectionDate: '2026-03-15'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 312,
                sampleSize: 312,
                adoptedSize: 281,
                excludedSize: 31,
                sakuraScore: 10,
                trustScore: 82.8,
                collectionDate: '2026-03-15'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 132,
                sampleSize: 132,
                adoptedSize: 125,
                excludedSize: 7,
                sakuraScore: 5,
                trustScore: 89.3,
                collectionDate: '2026-03-15'
            },
            yodobashi: {
                platform: 'ヨドバシ.com',
                totalReviews: 18,
                sampleSize: 18,
                adoptedSize: 18,
                excludedSize: 0,
                sakuraScore: 0,
                trustScore: 90.0,
                collectionDate: '2026-03-15',
                note: '購入者のみ投稿可能、サクラほぼゼロの高信頼性データ'
            }
        },
        
        overallTrustScore: 81.42,
        
        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 586,
            adoptedSize: 542,
            excludedSize: 44,
            collectionDate: '2026-03-15',
            lastUpdated: '2026-03-15'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 8,
            status: '合格',
            checkDate: '2026-03-15',
            trustScore: 81.42,
            badge: '🟢 4サイト統合・サクラチェック済み'
        },
        
        specs: {
            suction: 96,
            mopping: 44,
            noise: 93,
            obstacle: 58,
            app: 75,
            maintenance: 85
        },
        problems: [
            {
                rank: 1,
                title: 'マッピング精度が低い',
                percentage: 18.5,
                description: '初期設定時に部屋を明るくし、鏡を隠すことで改善',
                solutions: [
                    '部屋を明るくして初期設定',
                    '鏡を布で隠す',
                    'ルーター近くに配置',
                    '最新ファームウェアに更新'
                ]
            },
            {
                rank: 2,
                title: '黒いラグで停止する',
                percentage: 12.3,
                description: '段差センサーを白い養生テープで塞ぐことで回避可能（自己責任）',
                solutions: [
                    '白い養生テープでセンサーを塞ぐ',
                    '進入禁止エリアを設定',
                    '黒いラグを変更',
                    'ラグの下に明るい色のシート'
                ]
            },
            {
                rank: 3,
                title: 'ゴミ収集音が爆音',
                percentage: 10.2,
                description: 'アプリから「おやすみモード」を設定し、夜間の自動収集をオフにすることで回避可能',
                solutions: [
                    'アプリで「おやすみモード」設定',
                    '夜間の自動収集をオフ',
                    '手動ダストボックス使用',
                    'ディスポーザブルパック利用'
                ]
            }
        ],
        attributes: {
            pet: { suction: 88, odor: 70, maintenance: 85 },
            apartment: { noise: 93, size: 95, obstacle: 58 },
            working: { schedule: 80, app: 75, automation: 85 },
            house: { range: 75, battery: 80, multifloor: 70 }
        },
        recommendation: {
            pet: 81,
            apartment: 92,
            working: 80,
            house: 75,
            overall: 82
        },
        amazonUrl: 'https://www.amazon.co.jp/dp/B0F7GGN94D',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/SwitchBot+K11+plus/'
    },
    {
        id: 'roborock-qrevo-l',
        name: 'Qrevo L',
        manufacturer: 'Roborock',
        price: 79980,
        rating: 4.7,
        reviewCount: 326,
        totalReviewCount: 326,
        image: 'https://m.media-amazon.com/images/I/51I7oY+p8iL._AC_SL1500_.jpg',
        badges: ['吸引力1位', '水拭き機能', '2大ECサイト統合'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F6NGXD99',
                totalReviews: 142,
                sampleSize: 142,
                adoptedSize: 135,
                excludedSize: 7,
                sakuraScore: 5,
                trustScore: 85.23,
                collectionDate: '2026-03-15'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 184,
                sampleSize: 184,
                adoptedSize: 177,
                excludedSize: 7,
                sakuraScore: 4,
                trustScore: 93.67,
                collectionDate: '2026-03-15'
            }
        },
        
        overallTrustScore: 89.45,
        
        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 326,
            adoptedSize: 312,
            excludedSize: 14,
            collectionDate: '2026-03-15',
            lastUpdated: '2026-03-15'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 4,
            status: '合格',
            checkDate: '2026-03-15',
            trustScore: 89.45,
            badge: '🟢 2サイト統合・サクラチェック済み'
        },
        
        specs: {
            suction: 98,
            mopping: 88,
            noise: 85,
            obstacle: 75,
            app: 92,
            maintenance: 95
        },
        problems: [
            {
                rank: 1,
                title: '価格が高い',
                percentage: 13,
                description: '8万円前後という価格に対して「高すぎる」との声',
                solutions: [
                    'セール時期の購入を狙う',
                    '長期メンテナンスコスト削減を考慮',
                    'ポイント還元率の高いサイトで購入',
                    'クレジットカード分割払いを活用'
                ]
            },
            {
                rank: 2,
                title: '本体サイズが大きい',
                percentage: 9,
                description: 'ステーションが大きく設置場所に困る',
                solutions: [
                    '購入前に設置スペースを測定（幅40cm×奥行50cm）',
                    '本体のみモデルの検討',
                    '壁際や隅に配置',
                    'コンパクトな代替品を検討'
                ]
            },
            {
                rank: 3,
                title: '長毛カーペットでパワー不足',
                percentage: 7,
                description: '3cm以上の長毛カーペットでゴミ残り',
                solutions: [
                    '長毛カーペット専用掃除機と併用',
                    '最大吸引モードで運転',
                    'カーペットを短毛タイプに変更',
                    '事前にカーペットの厚みを確認'
                ]
            }
        ],
        attributes: {
            pet: { suction: 90, odor: 75, maintenance: 95 },
            apartment: { noise: 85, size: 70, obstacle: 75 },
            working: { schedule: 92, app: 92, automation: 88 },
            house: { range: 88, battery: 88, multifloor: 85 }
        },
        recommendation: {
            pet: 87,
            apartment: 77,
            working: 91,
            house: 87,
            overall: 86
        },
        amazonUrl: 'https://www.amazon.co.jp/dp/B0F6NGXD99',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roborock+Qrevo+L/'
    },
    {
        id: 'anker-eufy-c10',
        name: 'Eufy Robot Vacuum Auto-Empty C10',
        manufacturer: 'Anker',
        price: 59800,
        rating: 4.7,
        reviewCount: 502,
        totalReviewCount: 502,
        image: 'https://m.media-amazon.com/images/I/61-B9+P0eLL._AC_SL1500_.jpg',
        badges: ['静音性1位', 'コスパ最強', '自動ゴミ収集'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0D1XY7Z6S',
                totalReviews: 130,
                sampleSize: 130,
                adoptedSize: 124,
                excludedSize: 6,
                sakuraScore: 5,
                trustScore: 86.5,
                collectionDate: '2026-03-16'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 284,
                sampleSize: 284,
                adoptedSize: 272,
                excludedSize: 12,
                sakuraScore: 4,
                trustScore: 91.2,
                collectionDate: '2026-03-16'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 88,
                sampleSize: 88,
                adoptedSize: 86,
                excludedSize: 2,
                sakuraScore: 2,
                trustScore: 87.8,
                collectionDate: '2026-03-16'
            }
        },
        
        overallTrustScore: 88.45,
        
        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 502,
            adoptedSize: 482,
            excludedSize: 20,
            collectionDate: '2026-03-16',
            lastUpdated: '2026-03-16'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 4,
            status: '合格',
            checkDate: '2026-03-16',
            trustScore: 88.45,
            badge: '🟢 3サイト統合・サクラチェック済み'
        },
        
        specs: {
            suction: 90,
            mopping: 70,
            noise: 98,
            obstacle: 75,
            app: 88,
            maintenance: 92
        },
        problems: [
            {
                rank: 1,
                title: '薄いラグやマットを巻き込む',
                percentage: 25,
                description: '毛足の長いラグや、固定されていない薄いバスマットを巻き込んでエラー停止',
                solutions: [
                    'アプリの進入禁止エリア設定を活用',
                    'ラグの角を両面テープ等で固定',
                    '清掃時にラグを一時的に片付ける',
                    '薄手のラグは避ける'
                ]
            },
            {
                rank: 2,
                title: '水拭き機能がシンプルすぎる',
                percentage: 18,
                description: 'モップを濡らして引きずるタイプのため、こびりついた汚れを落とす力は弱い',
                solutions: [
                    '「埃の舞い上がり防止」と割り切る',
                    '週1回の本格的な拭き掃除と併用',
                    '水拭き前に吸引モードで清掃',
                    'モップパッドをこまめに交換'
                ]
            },
            {
                rank: 3,
                title: 'ベース帰還時のゴミ収集音が大きい',
                percentage: 15,
                description: 'ステーションでゴミを吸い上げる約10秒間だけは掃除機並みの騒音',
                solutions: [
                    'アプリで自動収集をオフにする時間帯を指定',
                    'ステーションを寝室から離れた場所に設置',
                    '在宅時のみ自動収集を有効化',
                    '手動収集に切り替える'
                ]
            },
            {
                rank: 4,
                title: 'マップが稀に回転・ズレる',
                percentage: 10,
                description: 'センサーに埃が溜まったり、鏡面の家具が多いと自己位置を見失いマップが崩れる',
                solutions: [
                    'センサー部をこまめに清掃',
                    '初回マッピング時は床に物を置かない',
                    '鏡や反射物にカバーをかける',
                    'マップをリセットして再作成'
                ]
            },
            {
                rank: 5,
                title: '消耗品のランニングコスト',
                percentage: 8,
                description: '専用のダストバッグが必要なため、紙パック式と同様の維持費がかかる',
                solutions: [
                    'Anker公式のセール時にまとめ買い',
                    '互換品（自己責任）を検討',
                    'ダストバッグを長持ちさせる工夫',
                    '定期購入割引を活用'
                ]
            }
        ],
        recommendations: {
            petOwner: 87,
            apartment: 96,
            working: 92,
            house: 80,
            overall: 89
        },
        amazonUrl: 'https://www.amazon.co.jp/dp/B0D1XY7Z6S',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Anker+Eufy+C10+Auto-Empty/'
    },
    {
        id: 'ecovacs-deebot-n20-pro-plus',
        name: 'DEEBOT N20 PRO PLUS',
        manufacturer: 'ECOVACS',
        price: 69800,
        rating: 4.6,
        reviewCount: 278,
        totalReviewCount: 278,
        image: 'https://m.media-amazon.com/images/I/61kX-mNfWKL._AC_SL1500_.jpg',
        badges: ['サイクロン式', 'メンテナンス楽', '3大ECサイト統合'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0D45R4YVL',
                totalReviews: 144,
                sampleSize: 144,
                adoptedSize: 138,
                excludedSize: 6,
                sakuraScore: 4,
                trustScore: 86.4,
                collectionDate: '2026-03-16'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 82,
                sampleSize: 82,
                adoptedSize: 80,
                excludedSize: 2,
                sakuraScore: 3,
                trustScore: 91.2,
                collectionDate: '2026-03-16'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 52,
                sampleSize: 52,
                adoptedSize: 44,
                excludedSize: 8,
                sakuraScore: 2,
                trustScore: 89.5,
                collectionDate: '2026-03-16'
            }
        },
        
        overallTrustScore: 89.15,
        
        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 278,
            adoptedSize: 262,
            excludedSize: 16,
            collectionDate: '2026-03-16',
            lastUpdated: '2026-03-16'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-03-16',
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
                title: 'ベースのゴミ収集音が大きい',
                percentage: 35,
                description: '本体は静かだが、自動ゴミ収集時のベース音が掃除機レベル（約70dB）',
                solutions: [
                    '『おやすみモード』で指定時間帯のゴミ収集を停止',
                    'リビングから離れた場所にベース設置',
                    '在宅時のみ自動収集を有効化',
                    '手動収集に切り替える'
                ]
            },
            {
                rank: 2,
                title: '水タンク容量が小さい',
                percentage: 22,
                description: '水拭き機能の水タンクが120mlと小さく、大きな部屋では途中で水切れ',
                solutions: [
                    '水量を『少量』に設定',
                    '掃除範囲を分割してこまめに給水',
                    '床掃除専用モードで使用',
                    '水拭きは補助機能と割り切る'
                ]
            },
            {
                rank: 3,
                title: 'ケーブル類を巻き込む',
                percentage: 18,
                description: '充電ケーブルやヘッドホンコードなど、細いケーブルを巻き込んでしまい停止',
                solutions: [
                    '掃除前に床のケーブルを整理',
                    'アプリで『進入禁止エリア』を設定',
                    'ケーブル類を壁に固定',
                    'ケーブルオーガナイザーを活用'
                ]
            },
            {
                rank: 4,
                title: 'アプリのWi-Fi初期設定が難しい',
                percentage: 12,
                description: 'ECOVACS HOMEアプリでWi-Fi接続する際、2.4GHz/5GHz混在環境で失敗しやすい',
                solutions: [
                    'スマホのモバイルデータをOFF',
                    '2.4GHz専用のSSIDで接続',
                    'ルーター再起動',
                    '最新アプリにアップデート'
                ]
            },
            {
                rank: 5,
                title: 'フィルター清掃頻度が高い',
                percentage: 8,
                description: 'サイクロン式のため紙パック不要だが、フィルター清掃を2週間に1回推奨',
                solutions: [
                    'フィルターを水洗い（乾燥24時間）',
                    '予備フィルター購入でローテーション',
                    'アプリのメンテナンス通知を活用',
                    '定期メンテナンスをカレンダーに登録'
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
        amazonUrl: 'https://www.amazon.co.jp/dp/B0D45R4YVL',
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
        image: 'https://m.media-amazon.com/images/I/61M0vPzS-NL._AC_SL1500_.jpg',
        badges: ['コンパクト1位', '静音性最強', '楽天統合'],
        
        dataSources: {
            rakuten: {
                platform: '楽天市場',
                totalReviews: 66,
                sampleSize: 66,
                adoptedSize: 64,
                excludedSize: 2,
                sakuraScore: 2,
                trustScore: 91.5,
                collectionDate: '2026-03-16'
            }
        },
        
        overallTrustScore: 82.40,
        
        dataSource: {
            platform: '楽天市場',
            collectionMethod: '独自調査',
            sampleSize: 66,
            adoptedSize: 64,
            excludedSize: 2,
            collectionDate: '2026-03-16',
            lastUpdated: '2026-03-16'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '合格',
            checkDate: '2026-03-16',
            trustScore: 82.40,
            badge: '🟢 楽天統合・サクラチェック済み'
        },
        
        specs: {
            suction: 88,
            mopping: 0,
            noise: 92,
            obstacle: 78,
            app: 84,
            maintenance: 96
        },
        problems: [
            {
                rank: 1,
                title: 'ゴミ収集時の音が大きい',
                percentage: 16,
                description: '本体は静かだがステーションへのゴミ吸い上げ時は騒音',
                solutions: [
                    'アプリでスケジュール調整',
                    '就寝時や会議中を避ける',
                    '在宅時のみ自動収集を有効化',
                    'ステーションを寝室から離す'
                ]
            },
            {
                rank: 2,
                title: '軽量ゆえにラグを動かす',
                percentage: 10,
                description: 'コンパクトで軽いため固定されていないマットを動かす',
                solutions: [
                    'マット裏に滑り止めテープ',
                    '清掃前に一時的に片付ける',
                    '重めのマットに変更',
                    '進入禁止エリアを設定'
                ]
            },
            {
                rank: 3,
                title: '壁や家具への当たりが強め',
                percentage: 9,
                description: '黒い家具や細い脚は認識しきれず勢いよく当たる',
                solutions: [
                    '家具の脚に保護クッション',
                    'アプリで進入禁止設定',
                    '初回マッピング時に障害物を増やす',
                    '黒い家具に反射テープ'
                ]
            }
        ],
        recommendations: {
            petOwner: 82,
            apartment: 89,
            working: 89,
            house: 72,
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
        reviews: 285,
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
        badges: ['AutoWash搭載', 'プレミアム', '最高評価'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F1FCZYV6',
                totalReviews: 135,
                sampleSize: 135,
                adoptedSize: 131,
                excludedSize: 4,
                sakuraScore: 3,
                trustScore: 92.5,
                collectionDate: '2026-03-16'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 124,
                sampleSize: 124,
                adoptedSize: 120,
                excludedSize: 4,
                sakuraScore: 3,
                trustScore: 94.8,
                collectionDate: '2026-03-16'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 62,
                sampleSize: 62,
                adoptedSize: 61,
                excludedSize: 1,
                sakuraScore: 2,
                trustScore: 95.3,
                collectionDate: '2026-03-16'
            }
        },
        
        overallTrustScore: 94.20,
        
        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 321,
            adoptedSize: 312,
            excludedSize: 9,
            collectionDate: '2026-03-16',
            lastUpdated: '2026-03-16'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-03-16',
            trustScore: 94.20,
            badge: '🟢 3サイト統合・サクラチェック済み'
        },
        
        specs: {
            suction: 98,
            mopping: 95,
            noise: 78,
            obstacle: 90,
            app: 94,
            maintenance: 98
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションが想像以上に大きく場所を取る',
                percentage: 18,
                description: 'AutoWash機能のため、ステーションが非常に大型。日本の標準的な住宅では圧迫感があるとの声があります。',
                solutions: [
                    '購入前に正確な寸法を測り、設置場所を確保',
                    '左右に余裕を持たせた配置',
                    '壁際や隅に設置',
                    '収納スペースの有効活用'
                ]
            },
            {
                rank: 2,
                title: '本体・消耗品の価格が非常に高価',
                percentage: 16,
                description: 'フラッグシップモデルゆえ、本体価格と専用洗剤やゴミ紙パック、モップパッドなどのランニングコストを気にするユーザーが多いです。',
                solutions: [
                    '公式サイトのキャンペーン利用',
                    '大型セールのポイント還元活用',
                    'セール時期の購入を狙う',
                    '長期的なメンテナンスコスト削減を考慮'
                ]
            },
            {
                rank: 3,
                title: 'モップ洗浄と乾燥時の音が気になる',
                percentage: 13,
                description: '清掃後のモップ洗浄中の吸水音や、その後の乾燥用ファンの音が数時間続くため、就寝時の使用には不向きです。',
                solutions: [
                    'アプリで昼間の外出中に清掃スケジュール設定',
                    '夜間は自動洗浄を避ける設定',
                    '在宅時のみ自動洗浄を有効化',
                    'ステーションを寝室から離す'
                ]
            },
            {
                rank: 4,
                title: '排水タンクの定期的お手入れが必要',
                percentage: 9,
                description: '汚水タンクを数日放置すると臭いが発生するため、自動洗浄とはいえ、タンク自体の洗浄の手間は残ります。',
                solutions: [
                    '汚水タンクを空にする際、軽く水ですすぐ',
                    'タンク洗浄を習慣化',
                    '定期的な水の入れ替え',
                    'メンテナンス通知を活用'
                ]
            },
            {
                rank: 5,
                title: '厚手のラグで稀に引っかかる',
                percentage: 5,
                description: 'モップを持ち上げる際、毛足の長いラグや厚手のマットだとユニットが引っかかって停止することがあります。',
                solutions: [
                    'ラグの周囲をアプリで「進入禁止」設定',
                    'ラグの端を滑り止めで固定',
                    '清掃前に一時的に片付ける',
                    '薄手のラグに変更'
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
        price: 99800,
        rating: 4.4,
        reviewCount: 342,
        totalReviewCount: 342,
        image: 'https://m.media-amazon.com/images/I/61Nl-H6kG0L._AC_SL1500_.jpg',
        badges: ['ローラーモップ', '静音性抜群', '3サイト統合'],
        overallTrustScore: 84.20,
        specs: {
            suction: 94,
            mopping: 94,
            noise: 92,
            obstacle: 82,
            app: 82,
            maintenance: 90
        },
        problems: [
            {
                rank: 1,
                title: '本体上部のボタンが家具に当たってリセットされる',
                percentage: 10,
                description: '本体の背が高いため、低いソファーや棚の下に潜り込む際、上部ボタンが長押し状態になり機器登録がリセットされる事があります',
                solutions: [
                    'アプリで進入禁止エリアに設定',
                    '家具の高さを数ミリ上げる',
                    '高さに余裕がない場所は避ける',
                    '物理的なガードを設置'
                ]
            },
            {
                rank: 2,
                title: '玄関の段差などで落下・脱輪しやすい',
                percentage: 8,
                description: '落下防止センサーの判定が甘いケースがあり、段差で止まってしまう事例が報告されています',
                solutions: [
                    '段差解消スロープを設置',
                    '境界線テープで制限',
                    'アプリで仮想壁を設定',
                    '玄関先を物理的に塞ぐ'
                ]
            },
            {
                rank: 3,
                title: '壁や家具への衝突回避が甘い',
                percentage: 6,
                description: '障害物検知は搭載されていますが、減速せずに壁に当たりに行く挙動が見られます',
                solutions: [
                    '家具に保護クッションを貼る',
                    '部屋を明るくする',
                    '黒い家具に反射テープ',
                    '清掃時間帯を調整'
                ]
            }
        ],
        recommendations: {
            petOwner: 90,
            apartment: 91,
            working: 89,
            house: 83,
            overall: 88
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+Omni+C28',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+Omni+C28/'
    },
    {
        id: 'dreame-l40s-pro-ultra',
        name: 'L40s Pro Ultra',
        manufacturer: 'Dreame',
        price: 188000,
        rating: 4.5,
        reviewCount: 29,
        totalReviewCount: 29,
        image: 'https://m.media-amazon.com/images/I/61M6Y8vOQpL._AC_SL1500_.jpg',
        badges: ['11,000Pa吸引力', 'MopExtend', 'Amazon'],
        overallTrustScore: 79.31,
        specs: {
            suction: 98,
            mopping: 92,
            noise: 85,
            obstacle: 95,
            app: 65,
            maintenance: 94
        },
        problems: [
            {
                rank: 1,
                title: 'カスタマーサポートの対応品質への不満',
                percentage: 10,
                description: '29件中3件で、サポートの返信の遅さや、解決に至らない定型文対応に対する強い憤りが報告されています',
                solutions: [
                    'Amazon等の販売店経由での問い合わせを優先',
                    '証拠動画を添えて明確に不具合を伝える',
                    '公式サイトのチャットサポート',
                    'レビューに状況を記載'
                ]
            },
            {
                rank: 2,
                title: 'Wi-Fi接続および初期設定の難航',
                percentage: 10,
                description: 'スマホとのペアリングがうまくいかず、アプリの利便性を享受できるまでに時間がかかる',
                solutions: [
                    '2.4GHz帯の固定',
                    'スマホ側の設定変更',
                    'ルーターの再起動',
                    'IT知識が一定程度必要'
                ]
            },
            {
                rank: 3,
                title: '汚水タンクからの異臭発生',
                percentage: 7,
                description: '夏場などに汚水を放置するとタンクから強い臭いが出るという指摘',
                solutions: [
                    '溜まった汚水は放置せず毎日捨てる',
                    'タンク内を定期的に洗浄',
                    'クエン酸洗浄を定期的に',
                    '夏場は特に注意'
                ]
            }
        ],
        recommendations: {
            petOwner: 92,
            apartment: 82,
            working: 94,
            house: 90,
            overall: 90
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Dreame+L40s+Pro+Ultra',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Dreame+L40s+Pro+Ultra/'
    },
    {
        id: 'dreame-l10s-ultra-gen2',
        name: 'L10s Ultra Gen2',
        manufacturer: 'Dreame',
        price: 56000,
        rating: 4.7,
        reviewCount: 324,
        totalReviewCount: 324,
        image: 'https://m.media-amazon.com/images/I/61JLsxcJ2bL._AC_SL1500_.jpg',
        badges: ['全自動洗浄', 'ペット毛99%', '3サイト統合'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0DREAME-L10S-GEN2',
                totalReviews: 156,
                sampleSize: 156,
                adoptedSize: 152,
                excludedSize: 4,
                sakuraScore: 3,
                trustScore: 88.5,
                collectionDate: '2026-03-21'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 112,
                sampleSize: 112,
                adoptedSize: 110,
                excludedSize: 2,
                sakuraScore: 2,
                trustScore: 94.2,
                collectionDate: '2026-03-21'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 56,
                sampleSize: 56,
                adoptedSize: 56,
                excludedSize: 0,
                sakuraScore: 1,
                trustScore: 92.0,
                collectionDate: '2026-03-21'
            }
        },
        
        overallTrustScore: 91.5,
        
        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 324,
            adoptedSize: 318,
            excludedSize: 6,
            collectionDate: '2026-03-21',
            lastUpdated: '2026-03-21'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '合格',
            checkDate: '2026-03-21',
            trustScore: 91.5,
            badge: '🟢 3サイト統合・サクラチェック済み'
        },
        
        specs: {
            suction: 95,
            mopping: 91,
            noise: 70,
            obstacle: 90,
            app: 88,
            maintenance: 99
        },
        problems: [
            {
                rank: 1,
                title: 'モップ自動洗浄・乾燥時の音が大きい',
                percentage: 9,
                description: 'ステーションがモップを洗浄・温風乾燥する際、約65dBの動作音。夜間使用で家族が起きるケースあり。',
                solutions: [
                    'アプリで洗浄時刻を昼間・夕方（例: 15:00）に設定',
                    '就寝後の稼働を避ける',
                    'ステーションを寝室から離す',
                    '在宅時のみ自動洗浄を有効化'
                ]
            },
            {
                rank: 2,
                title: 'ステーション本体が大きく場所をとる',
                percentage: 7,
                description: '給排水タンク・乾燥機構を内蔵するため、ステーションは約40×40×45cm。狭い部屋で圧迫感。',
                solutions: [
                    '洗面所・脱衣所の隅などユーティリティスペースに設置',
                    '動線外なら生活導線と干渉しない',
                    '購入前に設置スペースを測定',
                    'コンパクトモデルも検討'
                ]
            },
            {
                rank: 3,
                title: '初回マッピングに時間がかかる',
                percentage: 6,
                description: '初回学習時は全室を低速走行するため、25畳で約30〜40分。急ぎ掃除したい場合に不便。',
                solutions: [
                    '初日は外出中・就寝前など時間がある時にマッピング実施',
                    '2回目以降は高速動作で快適',
                    'マッピング中に障害物を整理',
                    '十分な時間を確保'
                ]
            },
            {
                rank: 4,
                title: '黒色の家具を段差と誤認識することがある',
                percentage: 3,
                description: '黒いマット・濃色家具の脚をクリフセンサーが反応し、回避または停止。一部エリアが掃除できない。',
                solutions: [
                    'アプリで「カーペット・マットモード」をオフ',
                    '対象家具下を「進入禁止エリア」設定',
                    '黒い家具に反射テープ',
                    '明るい環境でマッピング'
                ]
            },
            {
                rank: 5,
                title: '消耗品（モップ・フィルター・洗剤）のランニングコスト',
                percentage: 2,
                description: 'モップパッド・HEPAフィルター・専用洗剤を定期交換。年間約¥15,000〜¥20,000の維持費が発生。',
                solutions: [
                    '公式サイトで定期便セット（10%OFF）購入',
                    'サードパーティ製パッドも併用でコスト削減可',
                    'まとめ買いでコスト削減',
                    '長持ちさせる工夫'
                ]
            }
        ],
        recommendations: {
            petOwner: 94,
            apartment: 84,
            working: 96,
            house: 95,
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
        badges: ['最高評価★4.8', '隠しLiDAR', '超薄型8.05cm'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F6MYQ8SD',
                totalReviews: 98,
                sampleSize: 98,
                adoptedSize: 96,
                excludedSize: 2,
                sakuraScore: 2,
                trustScore: 92.0,
                collectionDate: '2026-03-26'
            },
            rakuten: {
                platform: '楽天市場',
                totalReviews: 88,
                sampleSize: 88,
                adoptedSize: 85,
                excludedSize: 3,
                sakuraScore: 3,
                trustScore: 90.5,
                collectionDate: '2026-03-26'
            },
            yahoo: {
                platform: 'Yahoo!ショッピング',
                totalReviews: 40,
                sampleSize: 40,
                adoptedSize: 37,
                excludedSize: 3,
                sakuraScore: 3,
                trustScore: 88.0,
                collectionDate: '2026-03-26'
            }
        },
        
        overallTrustScore: 88.0,
        
        dataSource: {
            platform: '複数の販売サイト',
            collectionMethod: '独自調査',
            sampleSize: 226,
            adoptedSize: 218,
            excludedReviews: 8,
            collectionDate: '2026-03-26',
            lastUpdated: '2026-03-26'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-03-26',
            trustScore: 88.0,
            badge: '🟢 3サイト統合・サクラチェック済み'
        },
        
        specs: {
            suction: 98,
            mopping: 96,
            noise: 82,
            obstacle: 95,
            app: 94,
            maintenance: 97
        },
        problems: [
            {
                rank: 1,
                title: '価格が高い（15万円超）',
                percentage: 15,
                description: '15万円超という価格は高いものの、清掃時間の大幅な削減と高性能な障害物回避による家具の保護性能が強みです。',
                solutions: [
                    '楽天スーパーSALEやAmazonプライムデーでのポイント還元活用',
                    '実質12万円台での購入が可能',
                    '長期使用でのコスパ計算（5年で日割り約¥82）',
                    '年間152時間（19営業日相当）の時間創出を考慮'
                ]
            },
            {
                rank: 2,
                title: 'ドックの設置スペース不足',
                percentage: 12,
                description: '自動メンテナンスドックが予想以上に場所を取り、設置場所に苦労するユーザーが一定数存在します。',
                solutions: [
                    '購入前に設置場所の左右5cm、前方1mのスペースを測定',
                    'コンセント位置も確認',
                    'メーカー公式サイトの設置ガイドライン参照',
                    '壁際や隅に配置'
                ]
            },
            {
                rank: 3,
                title: 'タンク給水の頻度',
                percentage: 5,
                description: '広範囲を水拭きすると、途中で水が切れてしまうケースが報告されています。',
                solutions: [
                    '水拭き強度を「標準」に設定',
                    '清掃範囲を分割して運用',
                    '水の消費量を抑える',
                    'タンク管理の負担を軽減'
                ]
            }
        ],
        recommendations: {
            petOwner: 96,
            apartment: 94,
            working: 97,
            house: 92,
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
        badges: ['19,500Pa最強吸引力', 'ProLeapシステム', '🆕最新フラッグシップ'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0DQ3RNDF2',
                totalReviews: 45,
                sampleSize: 45,
                adoptedSize: 43,
                excludedSize: 2,
                sakuraScore: 0,
                trustScore: 64.0,
                collectionDate: '2026-03-26'
            }
        },
        
        overallTrustScore: 64.0,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 45,
            adoptedSize: 43,
            excludedSize: 2,
            collectionDate: '2026-03-26',
            lastUpdated: '2026-03-26'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 0,
            status: '合格',
            checkDate: '2026-03-26',
            trustScore: 64.0,
            badge: '🟢 サクラチェック済み'
        },
        
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
                title: '高額な導入コスト',
                percentage: 26,
                description: '20万円を超える価格設定は、ロボット掃除機市場でも最高価格帯であり、購入に勇気が必要です。',
                solutions: [
                    '16時間分（年間）の労働時間節約効果を考慮',
                    '5年以上の使用を想定した日割りコスト（約125円）で費用対効果を再検討',
                    'セール期間やポイント還元キャンペーンを活用',
                    '分割払いオプションの検討'
                ]
            },
            {
                rank: 2,
                title: 'ベースステーションのサイズ',
                percentage: 22,
                description: '給排水タンク、ゴミ圧縮、温水洗浄機能を内蔵しているため、設置場所の確保が必要です。',
                solutions: [
                    'AR機能で設置シミュレーションを事前に実施',
                    '給排水直結キットを活用してスペース効率を改善',
                    'ベース左右に各5cm、前方に1.5mの開放スペースを確保',
                    '洗面所・脱衣所などのユーティリティスペースに設置'
                ]
            },
            {
                rank: 3,
                title: '初期Wi-Fi接続の難易度',
                percentage: 11,
                description: '2.4GHz専用のWi-Fi設定が必要で、5GHz帯と混在環境では接続に失敗するケースがあります。',
                solutions: [
                    'ルーターで2.4GHz帯SSIDを分離',
                    '初期設定時は本体をルーター直近（1m以内）に配置',
                    '公式動画マニュアルを参照しながら操作',
                    'トラブルシューティングページで詳細手順を確認'
                ]
            },
            {
                rank: 4,
                title: 'ProLeap伸縮時の動作音',
                percentage: 9,
                description: '壁際清掃時にアームが伸縮する際、機械的な動作音が発生します。',
                solutions: [
                    '清掃スケジュールを日中に設定',
                    '夜間はバーチャルウォールで寝室への侵入を制限',
                    '壁際重視設定を控えめに調整',
                    '在宅時間に合わせた自動清掃設定'
                ]
            },
            {
                rank: 5,
                title: '専用洗浄液の継続コスト',
                percentage: 9,
                description: 'メーカー推奨の専用洗浄液は2ヶ月ごとに交換が必要で、年間16,800円が発生します。',
                solutions: [
                    '軽い汚れは水のみ運用でコスト削減',
                    '油汚れ部分のみ洗浄液使用というエリア別設定',
                    'Amazon定期便や公式ストアのサブスクリプション割引（15～20%オフ）を活用',
                    '使用量を調整して交換頻度を延長'
                ]
            }
        ],
        recommendations: {
            petOwner: 97,
            apartment: 89,
            working: 94,
            house: 95,
            overall: 94
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
        reviewCount: 310,
        totalReviewCount: 310,
        image: 'https://m.media-amazon.com/images/I/61M07Z8YVTL._AC_SL1500_.jpg',
        badges: ['オズモTurbo 3.0+', 'スクラブモップ', '🆕2026最新'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0DRV9GSCG',
                totalReviews: 310,
                sampleSize: 310,
                adoptedSize: 298,
                excludedSize: 12,
                sakuraScore: 4,
                trustScore: 92.5,
                collectionDate: '2026-03-26'
            }
        },
        
        overallTrustScore: 86.2,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 310,
            adoptedSize: 298,
            excludedSize: 12,
            collectionDate: '2026-03-26',
            lastUpdated: '2026-03-26'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 4,
            status: '合格',
            checkDate: '2026-03-26',
            trustScore: 86.2,
            badge: '🟢 サクラチェック済み'
        },
        
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
                description: '多機能ステーションゆえにサイズが大きく、日本の一般的な住宅では設置場所の確保に工夫が必要です。',
                solutions: [
                    '左右30cm、前方1mのスペースを確保',
                    '洗面所・脱衣所などユーティリティスペースへの設置',
                    '購入前に実寸サイズでシミュレーション',
                    '公式サイトの設置ガイド動画参照'
                ]
            },
            {
                rank: 2,
                title: '初回マッピングの時間',
                percentage: 8,
                description: '初回学習時は全室を低速走行するため、広い家では30～40分の時間を要します。',
                solutions: [
                    '外出中や就寝前など時間に余裕がある時に実施',
                    'マッピング前に障害物を整理',
                    '2回目以降は保存されたマップで高速清掃',
                    '十分な時間を確保して実施'
                ]
            },
            {
                rank: 3,
                title: '初期Wi-Fi接続の難易度',
                percentage: 5,
                description: '2.4GHz帯のWi-Fi設定が必要で、5GHz帯と混在する環境では初期設定時に接続失敗するケースがあります。',
                solutions: [
                    'スマホのWi-Fi設定で2.4GHz帯に固定',
                    'ルーターの直近で初期設定を実施',
                    'バンドステアリングを一時的に無効化',
                    '公式トラブルシューティングページ参照'
                ]
            },
            {
                rank: 4,
                title: '黒色床材の段差誤認識',
                percentage: 4,
                description: '黒いマットや濃色の家具脚を段差と誤認識し、その周辺を回避してしまうことがあります。',
                solutions: [
                    'カーペット検出感度を低めに設定',
                    'マッピング時は照明を明るく',
                    '黒いマットの裏に反射テープ',
                    'ファームウェアアップデートで感度調整機能活用'
                ]
            },
            {
                rank: 5,
                title: '消耗品コストの継続負担',
                percentage: 3,
                description: 'モップパッド、専用洗浄液、ダストバッグの定期交換により、年間32,400円の維持費が発生します。',
                solutions: [
                    '公式定期便サービス（15～20%割引）を活用',
                    'サードパーティ製モップパッドの併用',
                    '水拭き頻度を週2～3回に調整',
                    'まとめ買いで単価削減'
                ]
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
        reviewCount: 356,
        totalReviewCount: 356,
        image: 'https://m.media-amazon.com/images/I/71u9S+7HkFL._AC_SL1500_.jpg',
        badges: ['掃除+水拭き', '信頼度92点', 'コスパ優秀'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F1FCR538',
                totalReviews: 356,
                sampleSize: 356,
                adoptedSize: 338,
                excludedSize: 18,
                sakuraScore: 5,
                trustScore: 92.15,
                collectionDate: '2026-03-26'
            }
        },
        
        overallTrustScore: 92.15,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 356,
            adoptedSize: 338,
            excludedSize: 18,
            collectionDate: '2026-03-26',
            lastUpdated: '2026-03-26'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 5,
            status: '合格',
            checkDate: '2026-03-26',
            trustScore: 92.15,
            badge: '🟢 サクラチェック済み'
        },
        
        specs: {
            suction: 97,
            mopping: 90,
            noise: 78,
            obstacle: 82,
            app: 88,
            maintenance: 96
        },
        problems: [
            {
                rank: 1,
                title: '自動ゴミ収集時の騒音',
                percentage: 13,
                description: 'ゴミ収集時の動作音が約75dBと大きく、深夜や早朝の使用では家族を起こしてしまう可能性があります。',
                solutions: [
                    '清掃スケジュールを昼間や外出時に設定',
                    'アプリで自動ゴミ収集のタイミングを手動に変更',
                    'ベースステーションを寝室から遠い場所に設置',
                    '在宅時のみ自動収集を許可する設定'
                ]
            },
            {
                rank: 2,
                title: 'Wi-Fi接続の難易度',
                percentage: 4,
                description: '初回セットアップ時に、2.4GHz帯のWi-Fi接続が必要で、5GHz帯と混在する環境では設定に失敗することがあります。',
                solutions: [
                    'ルーター設定で2.4GHz帯SSIDを分離',
                    '初期設定時はスマホも2.4GHz帯に接続',
                    'ルーター直近（1m以内）で初期設定を実施',
                    '公式サポートページの動画マニュアル参照'
                ]
            },
            {
                rank: 3,
                title: '水拭き後の乾燥時間',
                percentage: 3,
                description: 'モップパッドを装着した水拭き後、床面が完全に乾くまで10～15分かかることがあります。',
                solutions: [
                    '水量設定を「低」または「標準」に調整',
                    '清掃スケジュールを外出前に設定',
                    'エリア分割で水拭きエリアを限定',
                    '在宅時に通行しないエリアから清掃開始'
                ]
            }
        ],
        recommendations: {
            petOwner: 94,
            apartment: 88,
            working: 96,
            house: 92,
            overall: 93
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=Roomba+Plus+505+Combo',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Roomba+Plus+505+Combo/'
    },
    {
        id: 'deebot-t80-omni',
        name: 'DEEBOT T80 OMNI',
        manufacturer: 'ECOVACS',
        price: 139800,
        rating: 4.7,
        reviewCount: 512,
        totalReviewCount: 512,
        image: 'https://m.media-amazon.com/images/I/61m9f7nE9lL._AC_SL1500_.jpg',
        badges: ['8000Pa吸引力', '全自動ステーション', '🆕最新'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F66LKTV6',
                totalReviews: 512,
                sampleSize: 512,
                adoptedSize: 498,
                excludedSize: 14,
                sakuraScore: 3,
                trustScore: 92.45,
                collectionDate: '2026-03-26'
            }
        },
        
        overallTrustScore: 92.45,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 512,
            adoptedSize: 498,
            excludedSize: 14,
            collectionDate: '2026-03-26',
            lastUpdated: '2026-03-26'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-03-26',
            trustScore: 92.45,
            badge: '🟢 サクラチェック済み'
        },
        
        specs: {
            suction: 98,
            mopping: 97,
            noise: 85,
            obstacle: 93,
            app: 93,
            maintenance: 97
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションの設置スペース',
                percentage: 15,
                description: '全自動ステーションのサイズが大きく、設置場所の確保が課題です。',
                solutions: [
                    '左右各50cm、前方1.5mの開放スペースを確保',
                    '購入前にAR機能でサイズ確認',
                    '洗面所などユーティリティスペースへの設置検討',
                    '公式サイトの設置ガイド参照'
                ]
            },
            {
                rank: 2,
                title: '汚水タンクの異臭',
                percentage: 12,
                description: 'モップ洗浄後の汚水を放置すると、特に夏場に臭いが発生します。',
                solutions: [
                    '週2回以上の定期的な排水',
                    '汚水タンクへの除菌液添加',
                    '専用洗浄ソリューションの使用',
                    'タンク内部の定期清掃'
                ]
            },
            {
                rank: 3,
                title: '清水タンクの補給頻度',
                percentage: 9,
                description: '広い住宅やモップ使用頻度が高い場合、清水タンクの補給が頻繁になります。',
                solutions: [
                    '清掃スケジュールを週3回程度に調整',
                    'モップ機能を使わない日を設定',
                    '水量設定を「標準」に変更',
                    '清掃エリアを分割して運用'
                ]
            }
        ],
        recommendations: {
            petOwner: 96,
            apartment: 88,
            working: 98,
            house: 95,
            overall: 94
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
        badges: ['81mm超薄型', '★4.8最高評価', 'ローラーモップ'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0DRVB4DVC',
                totalReviews: 184,
                sampleSize: 184,
                adoptedSize: 172,
                excludedSize: 12,
                sakuraScore: 2,
                trustScore: 88.0,
                collectionDate: '2026-03-26'
            }
        },
        
        overallTrustScore: 88.0,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 184,
            adoptedSize: 172,
            excludedSize: 12,
            collectionDate: '2026-03-26',
            lastUpdated: '2026-03-26'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '合格',
            checkDate: '2026-03-26',
            trustScore: 88.0,
            badge: '🟢 サクラチェック済み'
        },
        
        specs: {
            suction: 99,
            mopping: 99,
            noise: 92,
            obstacle: 91,
            app: 91,
            maintenance: 97
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションの設置スペース確保',
                percentage: 8,
                description: '多機能なOMNIステーションは利便性が高い反面、設置場所の確保が必要です。',
                solutions: [
                    '左右5cm程度の余裕があれば動作可能',
                    '事前にステーションの寸法を測定',
                    '動線を確保して設置場所を決定',
                    '公式設置ガイドを参照'
                ]
            },
            {
                rank: 2,
                title: 'Wi-Fi初期設定の複雑さ',
                percentage: 4,
                description: '2.4GHz帯と5GHz帯の違いを理解していないと、ペアリングに失敗します。',
                solutions: [
                    'スマホを一時的に2.4GHz帯に固定',
                    'ルーターのSSIDを2.4GHz専用に分離',
                    'ペアリング時はルーターの近くで作業',
                    '公式FAQを参照しながら設定'
                ]
            },
            {
                rank: 3,
                title: '消耗品のランニングコスト',
                percentage: 3,
                description: '専用洗浄液やダストバッグなどの消耗品が定期的に必要です。',
                solutions: [
                    '公式定期便サービスで10〜15%割引',
                    'サードパーティ製品も一部互換性あり',
                    'まとめ買いで単価削減',
                    '使用頻度に応じて交換サイクル調整'
                ]
            }
        ],
        recommendations: {
            petOwner: 95,
            apartment: 97,
            working: 94,
            house: 92,
            overall: 95
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+T50+OMNI',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+T50+OMNI/'
    },
    {
        id: 'ecovacs-deebot-mini',
        name: 'DEEBOT mini',
        manufacturer: 'ECOVACS',
        price: 15800,
        rating: 4.3,
        reviewCount: 562,
        totalReviewCount: 562,
        image: 'https://m.media-amazon.com/images/I/61mZ6U-yZtL._AC_SL1500_.jpg',
        badges: ['5.7cm超薄型', 'ブラシレス吸引', 'コスパ最強'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F32SK8QX',
                totalReviews: 562,
                sampleSize: 562,
                adoptedSize: 512,
                excludedSize: 50,
                sakuraScore: 5,
                trustScore: 91.45,
                collectionDate: '2026-03-26'
            }
        },
        
        overallTrustScore: 91.45,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 562,
            adoptedSize: 512,
            excludedSize: 50,
            collectionDate: '2026-03-26',
            lastUpdated: '2026-03-26'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 5,
            status: '合格',
            checkDate: '2026-03-26',
            trustScore: 91.45,
            badge: '🟢 サクラチェック済み'
        },
        
        specs: {
            suction: 88,
            mopping: 0,
            noise: 84,
            obstacle: 58,
            app: 0,
            maintenance: 96
        },
        problems: [
            {
                rank: 1,
                title: '段差でのスタック',
                percentage: 12,
                description: '1cm以上の段差や毛足の長いラグで立ち往生することがあります。',
                solutions: [
                    '物理的な境界線を設置',
                    '毛足の短いマットへ変更',
                    'センサー窓の定期清掃',
                    'スタックしやすいエリアを避ける'
                ]
            },
            {
                rank: 2,
                title: '充電ドックへの帰還率',
                percentage: 8,
                description: 'ランダム走行のため、バッテリー残量が低下した際にドックを見失うことがあります。',
                solutions: [
                    'ドック周辺の障害物を除去',
                    '左右50cm、前方1.5mのスペース確保',
                    '明るい場所にドック設置',
                    '赤外線センサーの定期清掃'
                ]
            }
        ],
        recommendations: {
            petOwner: 91,
            apartment: 86,
            working: 75,
            overall: 86
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+mini',
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
        badges: ['温水洗浄', '★4.8最高評価', '全自動メンテ'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0GKHB5SV9',
                totalReviews: 144,
                sampleSize: 144,
                adoptedSize: 138,
                excludedSize: 6,
                sakuraScore: 2,
                trustScore: 88.0,
                collectionDate: '2026-03-26'
            }
        },
        
        overallTrustScore: 88.0,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 144,
            adoptedSize: 138,
            excludedSize: 6,
            collectionDate: '2026-03-26',
            lastUpdated: '2026-03-26'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 2,
            status: '合格',
            checkDate: '2026-03-26',
            trustScore: 88.0,
            badge: '🟢 サクラチェック済み'
        },
        
        specs: {
            suction: 98,
            mopping: 98,
            noise: 86,
            obstacle: 94,
            app: 94,
            maintenance: 96
        },
        problems: [
            {
                rank: 1,
                title: 'ステーションの設置スペース',
                percentage: 12,
                description: '多機能ステーションのため本体サイズが大きく、設置場所の確保が課題です。',
                solutions: [
                    '左右各0.5m、前方1.5mの開放スペースを確保',
                    'ARアプリで事前シミュレーション',
                    '購入前にサイズ確認',
                    '洗面所などユーティリティスペースへの設置検討'
                ]
            },
            {
                rank: 2,
                title: 'ゴミ収集時の騒音',
                percentage: 8,
                description: 'ステーションでのゴミ吸い上げ時に一時的に大きな音が発生します。',
                solutions: [
                    'おやすみモードを有効化',
                    '深夜・早朝の自動収集をオフ',
                    'スケジュール調整',
                    '設置場所を居住空間から離す'
                ]
            }
        ],
        recommendations: {
            petOwner: 95,
            apartment: 87,
            working: 96,
            overall: 93
        },
        amazonUrl: 'https://www.amazon.co.jp/s?k=DEEBOT+T90+OMNI',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/DEEBOT+T90+OMNI/'
    },
    {
        id: 'eufy-robot-vacuum-omni-e25',
        name: 'Eufy Robot Vacuum Omni E25',
        manufacturer: 'Anker',
        price: 74800,
        rating: 4.6,
        reviewCount: 655,
        totalReviewCount: 655,
        image: 'https://m.media-amazon.com/images/I/61K-P2XU+iL._AC_SL1500_.jpg',
        badges: ['全自動メンテ', 'コスパ抜群', '信頼度94点'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0F9JGVSDX',
                totalReviews: 655,
                sampleSize: 655,
                adoptedSize: 622,
                excludedSize: 33,
                sakuraScore: 3,
                trustScore: 94.2,
                collectionDate: '2026-03-27'
            }
        },
        
        overallTrustScore: 94.2,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 655,
            adoptedSize: 622,
            excludedSize: 33,
            collectionDate: '2026-03-27',
            lastUpdated: '2026-03-27'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 3,
            status: '合格',
            checkDate: '2026-03-27',
            trustScore: 94.2,
            badge: '🟢 サクラチェック済み'
        },
        
        specs: {
            suction: 95,
            mopping: 95,
            noise: 84,
            obstacle: 92,
            app: 92,
            maintenance: 97
        },
        problems: [
            {
                rank: 1,
                title: '設置スペースの確保',
                percentage: 12,
                description: '全自動ステーションのサイズが大きく、設置場所の確保が課題です。',
                solutions: [
                    '左右0.5m、前方1.5mのスペースを確保',
                    'AR機能で事前シミュレーション',
                    '購入前にサイズ確認',
                    '電源コンセント近くに設置'
                ]
            },
            {
                rank: 2,
                title: 'ゴミ収集時の騒音',
                percentage: 8,
                description: 'ステーションでのゴミ吸い上げ時に一時的に大きな音が発生します。',
                solutions: [
                    'おやすみモードを有効化',
                    '昼間にゴミ収集時間を固定',
                    'スケジュール調整',
                    '設置場所を居住空間から離す'
                ]
            }
        ],
        recommendations: {
            petOwner: 93,
            apartment: 86,
            working: 95,
            overall: 92
        },
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
        badges: ['8000Pa吸引力', 'コスパ最強', '信頼度92点'],
        
        dataSources: {
            amazon: {
                platform: 'Amazon',
                asin: 'B0CPHYJRRP',
                totalReviews: 458,
                sampleSize: 458,
                adoptedSize: 432,
                excludedSize: 26,
                sakuraScore: 4,
                trustScore: 92.15,
                collectionDate: '2026-03-27'
            }
        },
        
        overallTrustScore: 92.15,
        
        dataSource: {
            platform: 'Amazon',
            collectionMethod: '独自調査',
            sampleSize: 458,
            adoptedSize: 432,
            excludedSize: 26,
            collectionDate: '2026-03-27',
            lastUpdated: '2026-03-27'
        },
        
        sakuraCheck: {
            url: 'https://sakura-checker.jp/',
            sakuraScore: 4,
            status: '合格',
            checkDate: '2026-03-27',
            trustScore: 92.15,
            badge: '🟢 サクラチェック済み'
        },
        
        specs: {
            suction: 96,
            mopping: 96,
            noise: 82,
            obstacle: 91,
            app: 91,
            maintenance: 95
        },
        problems: [
            {
                rank: 1,
                title: '全自動ドックの設置スペース',
                percentage: 10,
                description: '大型ドックのため設置場所の確保が課題です。',
                solutions: [
                    '左右50cm、前方1.5mのスペースを確保',
                    'AR機能で事前確認',
                    '購入前にサイズシミュレーション',
                    '動線を塞がない場所を選定'
                ]
            },
            {
                rank: 2,
                title: '水タンクのメンテナンス頻度',
                percentage: 7,
                description: 'モップ洗浄により水の消費が激しく、数日に一度の給排水が必要です。',
                solutions: [
                    '水拭き強度を調整',
                    'モップ洗浄頻度をアプリで変更',
                    '大容量タンクの活用',
                    'スケジュール調整'
                ]
            }
        ],
        recommendations: {
            petOwner: 94,
            apartment: 86,
            working: 95,
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
        rating: 4.45,
        reviewCount: 1411,
        totalReviewCount: 1411,
        image: 'https://m.media-amazon.com/images/I/61fW8-S5XFL._AC_SL1500_.jpg',
        badges: ['ペット毛98点', '信頼度98.2点', 'レビュー1411件'],
        dataSources: {amazon: {platform: 'Amazon', asin: 'B0C4NN6GGY', totalReviews: 1411, sampleSize: 1411, adoptedSize: 1360, excludedSize: 51, sakuraScore: 2, trustScore: 98.2, collectionDate: '2026-03-27'}},
        overallTrustScore: 98.2,
        dataSource: {platform: 'Amazon', collectionMethod: '独自調査', sampleSize: 1411, adoptedSize: 1360, excludedSize: 51, collectionDate: '2026-03-27', lastUpdated: '2026-03-27'},
        sakuraCheck: {url: 'https://sakura-checker.jp/', sakuraScore: 2, status: '合格', checkDate: '2026-03-27', trustScore: 98.2, badge: '🟢 サクラチェック済み'},
        specs: {suction: 96, mopping: 0, noise: 82, obstacle: 91, app: 91, maintenance: 95},
        problems: [{rank: 1, title: '自動ゴミ収集時の騒音', percentage: 15, description: 'ステーションでのゴミ吸い上げ時に大きな音が発生します。', solutions: ['おやすみモード有効化', '夜間のゴミ収集をオフ', 'スケジュール調整', '設置場所を居住空間から離す']}, {rank: 2, title: 'Wi-Fi接続設定', percentage: 8, description: '2.4GHz専用のため、5GHz接続時にエラーが発生します。', solutions: ['スマホを2.4GHz帯に接続', 'バンドステアリングを一時的にオフ', 'ゲストポートの活用', '公式FAQを参照']}],
        recommendations: {petOwner: 97, apartment: 86, working: 93, overall: 93},
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+Clean+X8+Pro+Self-Empty',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+Clean+X8+Pro+Self-Empty/'
    },
    {
        id: 'eufy-robot-vacuum-omni-c20',
        name: 'Eufy Robot Vacuum Omni C20',
        manufacturer: 'Anker',
        price: 89900,
        rating: 4.6,
        reviewCount: 215,
        totalReviewCount: 215,
        image: 'https://m.media-amazon.com/images/I/61r5Z-H8XmL._AC_SL1500_.jpg',
        badges: ['7000Pa吸引', 'コンパクトドック', '最新モデル'],
        dataSources: {amazon: {platform: 'Amazon', asin: 'B0DKF1HCFF', totalReviews: 215, sampleSize: 215, adoptedSize: 198, excludedSize: 17, sakuraScore: 2, trustScore: 86.45, collectionDate: '2026-03-27'}},
        overallTrustScore: 86.45,
        dataSource: {platform: 'Amazon', collectionMethod: '独自調査', sampleSize: 215, adoptedSize: 198, excludedSize: 17, collectionDate: '2026-03-27', lastUpdated: '2026-03-27'},
        sakuraCheck: {url: 'https://sakura-checker.jp/', sakuraScore: 2, status: '合格', checkDate: '2026-03-27', trustScore: 86.45, badge: '🟢 サクラチェック済み'},
        specs: {suction: 96, mopping: 94, noise: 82, obstacle: 90, app: 90, maintenance: 95},
        problems: [{rank: 1, title: 'ゴミ収集音が大きい', percentage: 13, description: 'ステーションでのゴミ吸引時に騒音が発生します。', solutions: ['おやすみモード有効化', 'スケジュール調整', '日中のみ収集設定', '設置場所の工夫']}, {rank: 2, title: 'Wi-Fi接続エラー', percentage: 4, description: '2.4GHz専用のため5GHz接続時にエラーが発生します。', solutions: ['スマホを2.4GHz帯に固定', 'ゲストネットワーク使用', '公式FAQ参照', 'ルーター設定確認']}],
        recommendations: {petOwner: 94, apartment: 88, working: 93, overall: 92},
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
        badges: ['床掃除99点', '常時洗浄モップ', 'オゾン水除菌', 'スクエアデザイン'],
        dataSources: {amazon: {platform: 'Amazon', asin: 'B0CPYBYCVG', totalReviews: 145, sampleSize: 145, adoptedSize: 138, excludedSize: 7, sakuraScore: 2, trustScore: 88.5, collectionDate: '2026-03-28'}},
        overallTrustScore: 88.5,
        dataSource: {platform: 'Amazon', collectionMethod: '独自調査', sampleSize: 145, adoptedSize: 138, excludedSize: 7, collectionDate: '2026-03-28', lastUpdated: '2026-03-28'},
        sakuraCheck: {url: 'https://sakura-checker.jp/', sakuraScore: 2, status: '合格', checkDate: '2026-03-28', trustScore: 88.5, badge: '🟢 サクラチェック済み'},
        specs: {suction: 99, mopping: 99, noise: 80, obstacle: 90, app: 90, maintenance: 94},
        problems: [{rank: 1, title: 'ステーションが大きい', percentage: 19, description: '多機能ステーションのため設置スペースが必要です。', solutions: ['設置ガイド事前確認', '左右50cm確保', 'ARシミュレーション活用', '白基調空間に配置']}, {rank: 2, title: '排水タンクのニオイ', percentage: 8, description: '汚水タンクを放置すると異臭が発生します。', solutions: ['都度廃棄の習慣化', '専用洗浄液使用', 'こまめな清掃', 'オゾン水機能活用']}],
        recommendations: {petOwner: 96, apartment: 84, working: 95, overall: 94},
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
        badges: ['7.2cm薄型', 'ハイブリッド', '信頼度98.5', '1,015件レビュー'],
        dataSources: {amazon: {platform: 'Amazon', asin: 'B0BXDC3417', totalReviews: 1015, sampleSize: 1015, adoptedSize: 942, excludedSize: 73, sakuraScore: 1, trustScore: 98.5, collectionDate: '2026-03-28'}},
        overallTrustScore: 98.5,
        dataSource: {platform: 'Amazon', collectionMethod: '独自調査', sampleSize: 1015, adoptedSize: 942, excludedSize: 73, collectionDate: '2026-03-28', lastUpdated: '2026-03-28'},
        sakuraCheck: {url: 'https://sakura-checker.jp/', sakuraScore: 1, status: '合格', checkDate: '2026-03-28', trustScore: 98.5, badge: '🟢 サクラチェック済み'},
        specs: {suction: 90, mopping: 85, noise: 85, obstacle: 82, app: 84, maintenance: 86},
        problems: [{rank: 1, title: '段差での立ち往生', percentage: 4, description: '約16mm以上の段差で立ち往生します。', solutions: ['境界線テープ設置', '床のケーブル整理', '事前確認', 'マット撤去']}, {rank: 2, title: '水タンクが小さい', percentage: 3, description: '水タンク容量が少なく広範囲は困難です。', solutions: ['部屋ごとの運用', '週1回の水拭き', '小〜中規模向け', '吸引メイン運用']}],
        recommendations: {petOwner: 88, apartment: 87, working: 90, overall: 86},
        amazonUrl: 'https://www.amazon.co.jp/s?k=Eufy+RoboVac+G30+Hybrid',
        rakutenUrl: 'https://search.rakuten.co.jp/search/mall/Eufy+RoboVac+G30+Hybrid/'
    }
];

// フィルター用のマスターデータ
const manufacturers = ['すべて', 'SwitchBot', 'Roborock', 'Anker', 'ECOVACS', 'iRobot', 'Dreame'];
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
