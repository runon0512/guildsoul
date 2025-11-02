// --- ゲームの状態 ---
let gold = 100; // 資金を100万Gに変更
let adventurers = []; // ギルドに所属する冒険者
let scoutCandidates = []; // スカウト候補リスト
let scoutSkill = 100; // ギルドのスカウト能力 (初期値100)
let questsInProgress = []; // 進行中のクエスト
let nextAdventurerId = 1;
let currentMonth = 1;
let currentYear = 1; // ★ 年を追加


// --- ランク定義 ---
const RANKS = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S'];
// ★ 年俸計算用のランクボーナス (万G)
const SALARY_RANK_BONUS = {
    'G': 100,
    'F': 250,
    'E': 500,
    'D': 100,
    'C': 2000,
    'B': 5000,
    'A': 7500,
    'S': 10000
};
// 昇級試験の適正能力の合計 (difficulty)
// これが最低ライン。超過分が成功率にボーナスとして加算されます。
const PROMOTION_DIFFICULTIES = {
    'G': 50, // GtoF
    'F': 75, // FtoE
    'E': 100, // EtoD
    'D': 125, // DtoC
    'C': 150, // CtoB
    'B': 200, // BtoA
    'A': 250, // AtoS
    'S': Infinity 
};
// 昇級試験の成功率の基本値 (不足している場合に適用される最低ライン)
const PROMOTION_BASE_SUCCESS_RATE = 50; 


// スカウト方針の定義 (費用を万G単位に調整)
const SCOUT_POLICIES = {
    immediate: { 
        name: "即戦力重視", 
        cost: 5, // 5万G
        minAge: 25, 
        maxAge: 35, 
        baseBonus: 8, 
        limit: 10, 
        maxJoin: Infinity 
    },
    growth: { 
        name: "成長重視", 
        cost: 5, // 5万G
        minAge: 18, 
        maxAge: 24, 
        baseBonus: -3, 
        limit: 10, 
        maxJoin: Infinity 
    },
    focused: { 
        name: "集中スカウト", 
        cost: 30, // 30万G
        minAge: 30, 
        maxAge: 40, 
        baseBonus: 50, 
        limit: 1, // 候補者数1名に固定
        maxJoin: 1 // 加入できるのも1名に固定
    }
};

let quests = [
    // Gランク (誰でも)
    { id: 1, name: "ゴブリン討伐", reward: 20, difficulty: 50, available: true, aptitudes: { combat: 25, magic: '無関係', exploration: 15 } },
    { id: 2, name: "薬草の採取", reward: 10, difficulty: 30, available: true, aptitudes: { combat: '無関係', magic: '無関係', exploration: 20 } },
    { id: 3, name: "街道の整備", reward: 15, difficulty: 40, available: true, aptitudes: { combat: 15, magic: '無関係', exploration: 15 } },

    // Fランク以上
    { id: 11, name: "街道のゴブリン退治", reward: 30, difficulty: 60, available: true, requiredRank: 'F', aptitudes: { combat: 30, magic: '無関係', exploration: 10 } },
    { id: 12, name: "迷いの森の薬草集め", reward: 25, difficulty: 55, available: true, requiredRank: 'F', aptitudes: { combat: '無関係', magic: 15, exploration: 25 } },
    { id: 13, name: "農村の害獣駆除", reward: 35, difficulty: 65, available: true, requiredRank: 'F', aptitudes: { combat: 25, magic: '無関係', exploration: 20 } },

    // Eランク以上
    { id: 21, name: "廃坑のオーク掃討", reward: 50, difficulty: 80, available: true, requiredRank: 'E', aptitudes: { combat: 35, magic: '無関係', exploration: 20 } },
    { id: 22, name: "水晶洞窟の調査", reward: 45, difficulty: 75, available: true, requiredRank: 'E', aptitudes: { combat: 15, magic: 25, exploration: 30 } },
    { id: 23, name: "商隊の護衛", reward: 60, difficulty: 90, available: true, requiredRank: 'E', aptitudes: { combat: 40, magic: '無関係', exploration: 25 } },

    // Dランク以上
    { id: 31, name: "リザードマンの集落討伐", reward: 80, difficulty: 110, available: true, requiredRank: 'D', aptitudes: { combat: 45, magic: 15, exploration: 25 } },
    { id: 32, name: "古代遺跡の地図作成", reward: 70, difficulty: 100, available: true, requiredRank: 'D', aptitudes: { combat: '無関係', magic: 20, exploration: 45 } },
    { id: 33, name: "呪われた沼の浄化", reward: 90, difficulty: 120, available: true, requiredRank: 'D', aptitudes: { combat: 20, magic: 45, exploration: 30 } },

    // Cランク以上
    { id: 41, name: "ワイバーンの巣の偵察", reward: 120, difficulty: 140, available: true, requiredRank: 'C', aptitudes: { combat: 30, magic: '無関係', exploration: 55 } },
    { id: 42, name: "魔導書の捜索", reward: 110, difficulty: 130, available: true, requiredRank: 'C', aptitudes: { combat: '無関係', magic: 50, exploration: 40 } },
    { id: 43, name: "盗賊団の砦の攻略", reward: 150, difficulty: 150, available: true, requiredRank: 'C', aptitudes: { combat: 60, magic: '無関係', exploration: 35 } },

    // Bランク以上
    { id: 51, name: "グリフォンの討伐", reward: 200, difficulty: 180, available: true, requiredRank: 'B', aptitudes: { combat: 65, magic: '無関係', exploration: 45 } },
    { id: 52, name: "死霊術師の塔の破壊", reward: 220, difficulty: 200, available: true, requiredRank: 'B', aptitudes: { combat: 50, magic: 70, exploration: 30 } },
    { id: 53, name: "王都への機密文書輸送", reward: 180, difficulty: 160, available: true, requiredRank: 'B', aptitudes: { combat: 35, magic: '無関係', exploration: 65 } },

    // Aランク以上
    { id: 61, name: "ミノタウロスの迷宮攻略", reward: 300, difficulty: 220, available: true, requiredRank: 'A', aptitudes: { combat: 75, magic: 25, exploration: 60 } },
    { id: 62, name: "古代ゴーレムの無力化", reward: 320, difficulty: 240, available: true, requiredRank: 'A', aptitudes: { combat: 50, magic: 80, exploration: 40 } },
    { id: 63, name: "辺境伯からの密命", reward: 280, difficulty: 200, available: true, requiredRank: 'A', aptitudes: { combat: 40, magic: '無関係', exploration: 75 } },

    // Sランク以上
    { id: 71, name: "エンシェントドラゴンの討伐", reward: 1000, difficulty: 300, available: true, requiredRank: 'S', aptitudes: { combat: 100, magic: 750, exploration: 50 } },
    { id: 72, name: "魔王軍幹部の暗殺", reward: 800, difficulty: 280, available: true, requiredRank: 'S', aptitudes: { combat: 90, magic: '無関係', exploration: 80 } },
    { id: 73, name: "失われた王国の秘宝探索", reward: 700, difficulty: 260, available: true, requiredRank: 'S', aptitudes: { combat: 50, magic: 80, exploration: 90 } },
];


// --- DOM要素 ---
const goldEl = document.getElementById('gold');
const adventurerCountEl = document.getElementById('adventurer-count');
const questsEl = document.getElementById('quests');
const adventurerListEl = document.getElementById('adventurer-list');
const scoutAreaEl = document.getElementById('scout-area'); 
const scoutSkillEl = document.getElementById('scout-skill'); 
const questDetailAreaEl = document.getElementById('quest-detail-area'); 

// --- ユーティリティ関数 ---

/**
 * ランクに応じた色を返します。
 * @param {string} rank - 冒険者のランク
 * @returns {string} CSSカラーコード
 */
function getRankColor(rank) {
    switch(rank) {
        case 'S': return '#FFD700'; // Gold
        case 'A': return '#FF4500'; // Orangered
        case 'B': return '#9400D3'; // DarkViolet
        case 'C': return '#00BFFF'; // DeepSkyBlue
        case 'D': return '#32CD32'; // LimeGreen
        case 'E': return '#A9A9A9'; // DarkGray
        case 'F': return '#A0522D'; // Sienna
        case 'G': return '#696969'; // DimGray
        default: return 'inherit';
    }
}

/**
 * 基準値と±20の範囲でランダムな能力値を生成し、0～100に収めます。
 * @param {number} base - 基準能力値
 * @returns {number} 調整された能力値 (0-100)
 */
function getRandomSkill(base) {
    let skill = base + Math.floor(Math.random() * 41) - 20;
    return Math.max(0, Math.min(100, skill));
}

/**
 * OVRに基づき、冒険者の加入費用を計算します。（万G単位）
 * @param {number} ovr - 総合能力値 (OVR)
 * @returns {number} 加入費用 (万G)
 */
function calculateJoinCost(ovr) {
    const minOVR = 100;
    let cost = 10; // ベース費用 10万G
    if (ovr > minOVR) {
        cost += (ovr - minOVR) * 1; 
    }
    return Math.max(10, Math.round(cost));
}

/**
 * OVRに基づき、冒険者の年俸を計算します。（万G単位）
 * @param {number} ovr - 総合能力値 (OVR)
 * @param {string} rank - 冒険者のランク
 * @returns {number} 年俸 (万G)
 */
function calculateAnnualSalary(ovr, rank) {
    const minOVR = 100;
    let salary = 50; // ベース年俸 50万G
    if (ovr > minOVR) {
        salary += (ovr - minOVR) * 3;
    }
    // ランクボーナスを加算
    salary += SALARY_RANK_BONUS[rank] || 0;

    return Math.max(50, Math.round(salary / 10) * 10); // 10万G単位で丸める
}

/**
 * 指定された年齢をピークとして、基準能力値を計算します。
 * @param {number} age - 年齢
 * @param {number} baseBonus - スカウト方針による基準値への補正値
 * @returns {number} 基準能力値
 */
function calculateBaseValue(age, baseBonus = 0) {
    const peakAge = 30;
    const maxBase = 70; 
    const minBase = 30; 
    
    const ageDiff = Math.abs(age - peakAge);
    let baseValue = maxBase - Math.round((ageDiff / 10) ** 2 * 2);
    baseValue = Math.max(minBase, baseValue); 

    const scoutLimit = Math.floor(scoutSkill / 3) + baseBonus;
    
    baseValue = Math.min(baseValue, scoutLimit);
    return Math.max(minBase, baseValue);
}

// ランダムな冒険者のデータを生成 (名前リストは省略せず全文記載)
function generateAdventurer(baseBonus) { 
    // ★★★ 冒険者名の生成ロジックを修正/確定 ★★★
    const minAge = 17; 
    const maxAge = 60;
    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    
    const genders = ['男性', '女性'];
    // 名前リスト
    const namesMale = ['アーサー', 'アレン', 'アッシュ', 'アベル', 'アレクサンダー', 'アルバート', 'アダム', 'アルカ', 'アリウス', 'アロイス', 'アンドリュー', 'アンセルム', 'アポロ', 'アロン', 'アキレス', 'アエディン', 'アザゼル', 'アルフォンス', 'アリオン', 'アーロン', 'アトラス', 'アザール', 'バルド', 'バートラム', 'ベオウルフ', 'ブライアン', 'ブラン', 'ブルース', 'ブレイズ', 'バルト', 'ベネディクト', 'ビョルン', 'ブロディ', 'ブリアン', 'バレン', 'バシレイオス', 'クリス', 'カイ', 'コナー', 'クレイグ', 'カシウス', 'シド', 'セドリック', 'カレブ', 'カール', 'キャスパー', 'クロード', 'コルビー', 'クライヴ', 'コーネリアス', 'キャメロン', 'セルゲイ', 'ダミアン', 'ダリウス', 'ディーン', 'ドレイク', 'ダグラス', 'デイヴィッド', 'デクスター', 'ディラン', 'ドミニク', 'ドナルド', 'ダンテ', 'デミトリー', 'デューク', 'ダスト', 'エドガー', 'エリック', 'エルマー', 'イーサン', 'エメット', 'エルモア', 'エリク', 'エルヴェ', 'エルウィン', 'エルリック', 'エルネスト', 'エイリアス', 'エリジャ', 'エリオット', 'エドワード', 'エゼル', 'ファング', 'フィン', 'フランシス', 'フェリックス', 'フォレスト', 'フリッツ', 'フィリップ', 'フリン', 'ファビアン', 'フェニックス', 'フェルディナンド', 'フロリアン', 'フォード', 'フレデリック', 'ガレス', 'ガイ', 'ギルバート', 'グレゴリー', 'グラハム', 'グレン', 'ガブリエル', 'ジェフリー', 'ガロード', 'ギデオン', 'グンター', 'ギャビン', 'ゴードン', 'ハロルド', 'ヘンリー', 'ヒュー', 'ハンス', 'ホーク', 'ハドソン', 'ハーヴェイ', 'ホーレス', 'ハンター', 'ハーミーズ', 'ヘクター', 'ハムレット', 'ヒルデブランド', 'ホーガン', 'イアン', 'イグニス', 'アイザック', 'イヴァン', 'イリヤ', 'イシス', 'イサム', 'イーヴァル', 'イチロウ', 'イオリアス', 'イノック', 'ジャック', 'ジェイムズ', 'ジェイソン', 'ジョシュア', 'ジュリアン', 'ジャスティン', 'ジョージ', 'ジョナサン', 'ジョセフ', 'ジェレミー', 'ジェラルド', 'ジェイコブ', 'ジグムント', 'キース', 'ケント', 'カイル', 'ケビン', 'クリスチャン', 'カーティス', 'カスミ', 'クラウス', 'コール', 'コビ', 'キリアン', 'ケネス', 'カイザー', 'ルーク', 'レオ', 'リアム', 'ローガン', 'ランドル', 'ルイス', 'ローレンス', 'ラルフ', 'ランスロット', 'リチャード', 'ライアン', 'ライナス', 'レジナルド', 'マーク', 'マイル', 'モーガン', 'ミゲル', 'マイケル', 'マクシミリアン', 'モーリス', 'マルコム', 'マティアス', 'メルヴィン', 'ミッチェル', 'メイソン', 'マグナス', 'マックス', 'ネイト', 'ネイサン', 'ニコラス', 'ノックス', 'ニール', 'ナッシュ', 'ノア', 'ナルヴィ', 'ノルベルト', 'ネロ', 'ノヴァ', 'オズ', 'オーウェン', 'オリバー', 'オスカー', 'オベロン', 'オディッセウス', 'オディン', 'オーランド', 'オマール', 'オライオン', 'オスリック', 'パイク', 'ポール', 'パーシー', 'ピーター', 'パトリック', 'フェイト', 'パンドラ', 'パーシヴァル', 'ペンドラゴン', 'ピエール', 'パブロ', 'クイン', 'クエンティン', 'クライヴ', 'ロビン', 'ライリー', 'ルーファス', 'ロイド', 'ライアス', 'ラッセル', 'ロジャー', 'ロナルド', 'レイモンド', 'リック', 'ロッキー', 'ロメロ', 'ロック', 'サイラス', 'スコット', 'サム', 'セバスチャン', 'シモン', 'スタン', 'ステファン', 'スチュアート', 'サイモン', 'ソロモン', 'セージ', 'スパーダ', 'スタンリー', 'セス', 'タイガ', 'トビー', 'トマス', 'トレント', 'トロイ', 'テオ', 'テンプル', 'ティアゴ', 'ティム', 'トニー', 'トリスタン', 'ターナー', 'タイラー', 'ウル', 'アーバン', 'ウルフ', 'ユリウス', 'ヴォルフ', 'ヴィクター', 'ヴァンス', 'ヴィンセント', 'ヴァレリオ', 'ヴァルター', 'ヴァイパー', 'ウィル', 'ウォルト', 'ウェス', 'ウィリアム', 'ウォーレン', 'ウェンデル', 'ワイアット', 'ワーウィック', 'ウェズリー', 'ウィンストン', 'ザンダー', 'ザビエル', 'ヨーク', 'ヨーハン', 'ユージーン', 'ザック', 'ゼノス', 'ゼロ', 'ゼイン', 'ゼファー', 'ゼウス', 'セシル', 'デニス', 'エメリー', 'ガーウィン', 'ヒューゴ', 'イシュトヴァーン', 'ジャスパー', 'レオナード', 'マーカス', 'ナポレオン', 'オットー', 'パーシバル', 'ラファエル', 'ローランド', 'シグマ', 'ティベリウス', 'ヴァレリアン', 'ウォルター', 'クセノス', 'ユージン', 'ゼノ'];
const namesFemale = [
  // **A - エレガント、天空、神秘 (約50種)**
  "アイリス", "アストリア", "アメリア", "アリア", "アリス", "アルテミス", "アルメリア", "アンジェリカ", "イザベラ", "イシュタル",
  "イゾルデ", "イリシア", "イリーナ", "イングリッド", "ヴィオラ", "ヴィーナス", "ヴィクトリア", "ヴェローナ", "ウラニア", "エアリス",
  "エウロパ", "エカルラート", "エクレール", "エステラ", "エデン", "エニド", "エメロード", "エラ", "エリシア", "エレノア",
  "オフィーリア", "オリヴィア", "オーロラ", "オデット", "オクタヴィア", "カーラ", "カサンドラ", "カタリナ", "カティア", "カミラ",
  "カリス", "カレン", "グロリア", "クリスタ", "クリスティナ", "クレア", "クレメンタイン", "コハク", "コリンナ", "サブリナ",

  // **S - 自然、妖精、伝説 (約50種)**
  "サフィア", "サリナ", "シエラ", "シグルーン", "シビュラ", "ジュリア", "ジョセフィーヌ", "シルフィア", "ジンジャー", "スカーレット",
  "ステラ", "セシリア", "セレネ", "ソフィア", "ソレイユ", "ダーナ", "ダイアナ", "ダフネ", "タマリス", "ティターニア",
  "ティファニー", "デネブ", "テレーザ", "トパーズ", "ドロシア", "ナターシャ", "ナルヴィア", "ニーナ", "ネリネ", "ノエミ",
  "ノエル", "ハリエット", "パメラ", "ビアンカ", "フィオナ", "フィリス", "フィービー", "フェリシア", "フローラ", "ベアトリス",
  "ベリル", "ヘレナ", "ペネロペ", "ホノカ", "マカロン", "マリーナ", "マリアンヌ", "マレニア", "ミネルヴァ", "ミラ",

  // **M - 魔女、神話、異文化 (約75種)**
  "マカリア", "マジョラム", "マチルダ", "マティルダ", "マドレーヌ", "マリス", "ミモザ", "ミリア", "ミルテ", "メデューサ",
  "メリッサ", "メロディ", "モルガン", "ライラ", "ライラック", "ラウラ", "ラグリマ", "ラミア", "ラルム", "リオン",
  "リゲル", "ルナリア", "ルビー", "ルミア", "ルクレツィア", "ルナ", "レイア", "レジーナ", "ローゼ", "ロザリンド",
  "ロレッタ", "ロレーヌ", "ロマンス", "ロミナ", "アシェラ", "アシュリー", "アメジスト", "アモーレ", "イオナ", "イグニス",
  "イスカ", "イブ", "ウィスパー", "ヴィータ", "エーテル", "エメラルダ", "エルトゥーレ", "エルサ", "エルピス", "カシア",
  "カナン", "ギネヴィア", "キュア", "クイン", "クチナシ", "グラシア", "ケイトリン", "ケシ", "コーラル", "サナ",
  "サフラン", "サマンサ", "シフォン", "シャロン", "シュガー", "ジャスミン", "ジゼル", "ジニア", "スージー", "スズラン",
  "ズーラ", "セドナ", "セフィラ", "ソニア", "ソラ", "タニア", "タンザナイト", "チェリー", "ティア", "ディオン",
  "デージー", "トワイライト", "ニア", "ノクターン", "ノワール", "ハニー", "ハープ", "ヒース", "ヒマワリ", "ファム",
  "フィッツ", "ブルーム", "フロスティ", "ホタル", "マーガレット", "マーチ", "ミア", "ミカエラ", "ミューズ", "メロエ",

  // **R - Z - 詩的、力強い、シンプルな響き (約75種)**
  "ラピス", "リーフ", "リズ", "リラ", "ルシエラ", "ルミネリア", "マリア", "ミレーヌ", "マロウ", "マンダリン",
  "ミカド", "ミケランジェラ", "ミザール", "ミステリー", "ミネア", "ミーナ", "メアリス", "メガイラ", "メルティ", "モネ",
  "モンブラン", "ヤドリギ", "ラーナ", "ラウレンス", "ラシエラ", "ラディーナ", "ラフ", "リズベット", "リネア", "リビア",
  "リマ", "ルシェル", "ルチア", "ルーナ", "ルカ", "レイナ", "ロカ", "ロゼ", "アガーテ", "アケビ",
  "アサギ", "アズサ", "アトラス", "アネモネ", "アポロン", "イオ", "イブリン", "ヴァニラ", "ウェンディ", "エヴァー",
  "エルナ", "オリーブ", "カシミア", "カスミ", "カミーユ", "ギルダ", "クッキー", "ケリー", "ココ", "サクラ",
  "サマー", "サン", "シオリ", "シャネル", "ユーリ", "ジュリ", "スミレ", "セイラ", "ソルト", "タラ",
  "チエリ", "ツムギ", "テミス", "テラ", "ドルチェ", "ナツメ", "ニコラ", "ニルヴァーナ", "ネイラ", "ネージュ",
  "ノア", "ハーモニー", "パステル", "ヒスイ", "ピノ", "フォグ", "フユ", "ベス",  "ミント"
];
    
    const selectedGender = genders[Math.floor(Math.random() * genders.length)];
    let selectedName = selectedGender === '女性' 
        ? namesFemale[Math.floor(Math.random() * namesFemale.length)]
        : namesMale[Math.floor(Math.random() * namesMale.length)];

    const baseValue = calculateBaseValue(age, baseBonus);
    
    let combatSkill = getRandomSkill(baseValue);
    let magicSkill = getRandomSkill(baseValue);
    let explorationSkill = getRandomSkill(baseValue);

    if (selectedGender === '男性') {
        combatSkill = Math.min(100, combatSkill + 10);
        magicSkill = Math.max(0, magicSkill - 10);
    } else if (selectedGender === '女性') {
        combatSkill = Math.max(0, combatSkill - 10);
        magicSkill = Math.min(100, magicSkill + 10);
    }

    const ovr = combatSkill + magicSkill + explorationSkill;
    const joinCost = calculateJoinCost(ovr);
    // ★ ランクを渡すように修正
    const annualSalary = calculateAnnualSalary(ovr, 'G');
    
    return {
        id: nextAdventurerId++,
        name: selectedName,
        gender: selectedGender,
        age: age,
        status: '待機中',
        rank: 'G', // ランクを初期値Gとして追加
        skills: {
            combat: combatSkill,      
            magic: magicSkill,       
            exploration: explorationSkill 
        },
        ovr: ovr,
        joinCost: joinCost,
        annualSalary: annualSalary,
        exp: 0, 
        expToLevelUp: 100 // ★ 経験値を100に固定
    };
}

/**
 * 冒険者の年齢に基づき、獲得経験値の倍率を返します。
 * @param {number} age - 冒険者の年齢
 * @returns {number} 経験値倍率
 */
function getAgeMultiplier(age) {
    if (age <= 17) return 1.3;
    if (age === 18) return 1.2;
    if (age === 19) return 1.1;
    if (age === 20) return 1.0; 
    
    // 21歳から29歳は線形に減少 (20歳: 1.0, 30歳: 0.1)
    if (age > 20 && age < 30) {
        // 10年間で0.9減少 -> 1年あたり0.09減少
        return 1.0 - (age - 20) * 0.09;
    }
    
    if (age === 30) return 0.1;
    
    // 31歳以上は無し
    if (age > 30) return 0; 
    
    return 1.0; // 通常は到達しない
}


/**
 * 冒険者のランクに基づき、獲得経験値の倍率を返します。（成長促進のため、ランクが低いほど高倍率）
 * @param {string} rank - 冒険者のランク (G～S)
 * @returns {number} 経験値倍率
 */
function getRankMultiplier(rank) {
    switch(rank) {
        case 'G': return 1.0; // 初期ランクは成長しやすい
        case 'F': return 1.2;
        case 'E': return 1.5;
        case 'D': return 1.8;
        case 'C': return 2.0;
        case 'B': return 2.2;
        case 'A': return 2.5;
        case 'S': return 3.0; // Sランクは成長が急速
        default: return 1.0;
    }
}


/**
 * クエスト成功時の獲得EXPの基本値を計算します。（年齢補正前）
 * @param {number} successRate - 成功確率 (0.2 ~ 1.0)
 * @returns {number} 獲得EXPの基本値
 */
function calculateQuestEXP(successRate) {
    const baseExp = 10; 
    const rateMultiplier = 1 / successRate;
    const expBonusRate = rateMultiplier - 1.0; 

    let gainExp = baseExp + (baseExp * expBonusRate);
    
    // 最低EXPを5ポイントに維持
    return Math.max(5, gainExp); 
}


/**
 * 冒険者をレベルアップさせ、スキルをランダムに2～3上昇させます。（全スキル）
 * @param {Object} adv - 冒険者オブジェクト
 */
function levelUp(adv) {
    // ★ 経験値の上限を100に固定し、超過分を次のレベルに持ち越す
    adv.exp = adv.exp - 100;
    adv.expToLevelUp = 100; // ★ 経験値MAXを100で固定
    
    const skills = ['combat', 'magic', 'exploration'];
    let levelUpMessage = adv.name + " がレベルアップ！ スキル上昇: ";
    let totalIncrease = 0;
    
    for (const skill of skills) {
        // 2から3のランダムな値 (Math.floor(Math.random() * (max - min + 1)) + min)
        const skillIncrease = Math.floor(Math.random() * 3) + 3; 
        
        // 最大値100を超えないように、実際の上昇値を計算
        const actualIncrease = Math.min(skillIncrease, 100 - adv.skills[skill]);
        
        adv.skills[skill] += actualIncrease;
        adv.ovr += actualIncrease; // OVRも上昇分だけ増やす
        totalIncrease += actualIncrease;

        const skillNameJp = skill === 'combat' ? '戦闘' : skill === 'magic' ? '魔法' : '探索';
        
        // メッセージに上昇分を追加
        if (actualIncrease > 0) {
            levelUpMessage += `${skillNameJp}+${actualIncrease}, `;
        }
    }

    if (totalIncrease === 0) {
        return adv.name + " はレベルアップしましたが、全てのスキルが既に最大です。";
    }

    // 最後の ', ' を削除
    return levelUpMessage.slice(0, -2) + "！";
}


// --- 状態の更新と表示 ---
function updateDisplay() {
    document.getElementById('month').textContent = `${currentYear}年 ${currentMonth}月`;
    goldEl.textContent = gold;
    adventurerCountEl.textContent = adventurers.length;
    scoutSkillEl.textContent = scoutSkill;
    renderAdventurerList();
    renderQuests();
}

// --- 冒険者リストの表示 (キャンセルボタンを追加) ---
function renderAdventurerList() {
    adventurerListEl.innerHTML = ''; 

    if (adventurers.length === 0) {
        adventurerListEl.innerHTML = '<p>現在、ギルドには誰もいません。</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>名前</th>
            <th>性別/年齢</th>
            <th>ランク</th>
            <th>OVR</th>
            <th>戦闘</th>
            <th>魔法</th>
            <th>探索</th>
            <th>年俸(万G)</th>
            <th>経験値 / NEXT</th>
            <th>状態</th>
            <th>操作</th>
        </tr>
    `;

    adventurers.forEach(adv => {
        const row = table.insertRow();
        
        // ★★★ 状態の変更: クエスト予定 ★★★
        const isScheduled = adv.status.startsWith('クエスト予定');
        if (isScheduled) {
             row.classList.add('in-quest'); 
        }
        
        const expPercentage = Math.min(100, (adv.exp / adv.expToLevelUp) * 100);
        
        // ★ ボタンを複数表示できるように actionButtons に変更
        let actionButtons = '';
        if (isScheduled) {
            const questNameMatch = adv.status.match(/クエスト予定: (.+)/);
            const questName = questNameMatch ? questNameMatch[1] : '';
            actionButtons = `<button onclick="cancelScheduledQuest(${adv.id}, '${questName}')">予定をキャンセル</button>`;
        } else {
            // ★ 待機中の冒険者に「名前変更」ボタンを追加
            actionButtons = `<button onclick="renameAdventurer(${adv.id})">名前変更</button>`;
        }

        // ★ ランクの色を取得
        const rankColor = getRankColor(adv.rank);

        row.innerHTML = `
            <td>${adv.name}</td>
            <td>${adv.gender}/${adv.age}歳</td>
            <td><span class="adventurer-rank" style="color: ${rankColor}; font-weight: bold;">${adv.rank}</span></td>
            <td>${adv.ovr}</td>
            <td>${adv.skills.combat}</td>
            <td>${adv.skills.magic}</td>
            <td>${adv.skills.exploration}</td>
            <td>${adv.annualSalary}</td>
            <td>
                ${adv.exp} / ${adv.expToLevelUp}
                <div class="exp-bar-container">
                    <div class="exp-bar" style="width: ${expPercentage}%;"></div>
                </div>
            </td>
            <td>${adv.status}</td>
            <td>${actionButtons}</td>
        `;
    });
    adventurerListEl.appendChild(table);
}

/**
 * 指定された冒険者の「クエスト予定」をキャンセルします。
 * @param {number} advId - 冒険者のID
 * @param {string} questName - クエスト名
 */
function cancelScheduledQuest(advId, questName) {
    const adv = adventurers.find(a => a.id == advId);
    if (!adv || !adv.status.startsWith('クエスト予定')) return;

    // 1. 冒険者のステータスを待機中に戻す
    adv.status = '待機中';

    // 2. 進行中リストからこの冒険者を削除
    const qDataIndex = questsInProgress.findIndex(q => q.quest.name === questName);
    
    if (qDataIndex !== -1) {
        const qData = questsInProgress[qDataIndex];
        
        // リストから該当の冒険者を削除
        qData.adventurers = qData.adventurers.filter(a => a.id !== adv.id);
        
        if (qData.adventurers.length === 0) {
            // 誰もいなくなった場合、クエスト自体をキャンセルし、復活させる
            // 昇級試験はavailable = falseにしないため、通常クエストのみ復活させる
            if (!qData.quest.isPromotion) {
                const quest = quests.find(q => q.id === qData.quest.id);
                if (quest) {
                    quest.available = true;
                    alert(`【${quest.name}】の派遣が全てキャンセルされたため、クエストが復活しました。`);
                }
            }
            questsInProgress.splice(qDataIndex, 1);
        } else {
            // メンバーが残っている場合、成功率を再計算して更新
            qData.rate = calculateSuccessRate(qData.quest, qData.adventurers);
        }
    }
    
    alert(`${adv.name} の【${questName}】の派遣予定をキャンセルしました。`);
    updateDisplay();
}

/**
 * 冒険者の名前を変更します。
 * @param {number} advId - 冒険者のID
 */
function renameAdventurer(advId) {
    const adv = adventurers.find(a => a.id === advId);
    if (!adv) {
        alert('対象の冒険者が見つかりません。');
        return;
    }

    // 待機中ではない場合は名前変更できないようにする
    if (adv.status !== '待機中') {
        alert('クエスト予定中の冒険者の名前は変更できません。');
        return;
    }

    const newName = prompt(`新しい名前を入力してください (現在の名前: ${adv.name}):`, adv.name);

    // ユーザーがキャンセルした場合
    if (newName === null) {
        return;
    }

    // 入力値のバリデーション
    const trimmedName = newName.trim();
    if (trimmedName === '') {
        alert('名前は空にできません。');
        return;
    }
    if (trimmedName.length > 15) {
        alert('名前は15文字以内で入力してください。');
        return;
    }

    const oldName = adv.name;
    adv.name = trimmedName;

    alert(`冒険者「${oldName}」の名前を「${adv.name}」に変更しました。`);
    
    // 表示を更新して変更を反映
    updateDisplay();
}


// --- スカウト機能 (変更なし) ---
function scoutAdventurers(policyKey) { 
    const policy = SCOUT_POLICIES[policyKey];

    if (!policy) {
        alert("無効なスカウト方針が選択されました。");
        return;
    }

    if (gold < policy.cost) { 
        alert(`資金が足りません。スカウト費用 ${policy.cost} 万Gが必要です。`);
        return;
    }

    gold -= policy.cost;
    scoutCandidates = [];
    
    const baseValueCeiling = calculateBaseValue(30, policy.baseBonus); 
    const MAX_OVR_CEILING = Math.round(3 * (baseValueCeiling + 20));

    const MAX_ATTEMPTS = 500;
    let attempts = 0;
    
    while (scoutCandidates.length < policy.limit && attempts < MAX_ATTEMPTS) { 
        const newAdventurer = generateAdventurer(policy.baseBonus); 
        
        if (newAdventurer.age >= policy.minAge && newAdventurer.age <= policy.maxAge) {
             scoutCandidates.push(newAdventurer);
        }
        attempts++;
    }

    alert(`${policy.name}（${policy.cost} 万G）を適用しました。`
        + `\n現在スカウト能力: ${scoutSkill}`
        + `\n対象年齢: ${policy.minAge}-${policy.maxAge}歳`
        + `\nOVR上限目安: ${MAX_OVR_CEILING} 程度です。`
        + `\n${scoutCandidates.length}名の候補が表示されました。`);
    
    adventurerListEl.style.display = 'none';
    scoutAreaEl.style.display = 'block';
    questDetailAreaEl.style.display = 'none'; 

    updateDisplay();
    renderScoutCandidates(policyKey);
}

function renderScoutCandidates(policyKey) { 
    const policy = SCOUT_POLICIES[policyKey];
    scoutAreaEl.innerHTML = '<h2>スカウト候補リスト</h2>';
    
    if (scoutCandidates.length === 0) {
        scoutAreaEl.innerHTML += '<p>条件を満たす冒険者が見つかりませんでした。スカウト方針を変更しましょう。</p><div class="scout-controls"><button onclick="cancelScout()">スカウトを中断・キャンセルする</button></div>';
        return;
    }

    const candidateTable = document.createElement('table');
    candidateTable.id = 'candidate-table';
    candidateTable.innerHTML = `
        <tr>
            <th>選択</th>
            <th>名前</th>
            <th>性別/年齢</th>
            <th>OVR</th>
            <th>戦闘</th>
            <th>魔法</th>
            <th>探索</th>
            <th>加入費用(万G)</th>
            <th>年俸(万G)</th>
        </tr>
    `;

    scoutCandidates.forEach(candidate => {
        const row = candidateTable.insertRow();
        row.dataset.id = candidate.id;
        
        const isOverScoutSkill = candidate.ovr > scoutSkill;
        row.className = isOverScoutSkill ? 'over-skill-highlight' : '';

        row.innerHTML = `
            <td><input type="checkbox" name="candidate" value="${candidate.id}" data-cost="${candidate.joinCost}"></td>
            <td>${candidate.name}</td>
            <td>${candidate.gender}/${candidate.age}歳</td>
            <td><span style="font-weight: bold; color: ${isOverScoutSkill ? 'red' : 'inherit'};">${candidate.ovr}</span></td>
            <td>${candidate.skills.combat}</td>
            <td>${candidate.skills.magic}</td>
            <td>${candidate.skills.exploration}</td>
            <td>${candidate.joinCost} 万G</td>
            <td>${candidate.annualSalary} 万G</td>
        `;
    });
    
    const controlDiv = document.createElement('div');
    controlDiv.className = 'scout-controls';
    
    const maxJoinText = policy.maxJoin === 1 ? '（選択は1名まで）' : '';

    controlDiv.innerHTML = `
        <p><strong>合計加入費用:</strong> <span id="total-join-cost">0</span> 万G ${maxJoinText}</p>
        <button id="join-button" onclick="joinSelectedAdventurers('${policyKey}')">選んだ冒険者をギルドに加入させる</button> 
        <button onclick="cancelScout()">スカウトを中断・キャンセルする</button>
    `;
    
    scoutAreaEl.appendChild(candidateTable);
    scoutAreaEl.appendChild(controlDiv);

    const checkboxes = document.querySelectorAll('#candidate-table input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => updateTotalJoinCost(policy)); 
    });

    updateTotalJoinCost(policy);
}

function updateTotalJoinCost(policy) { 
    const checkboxes = document.querySelectorAll('#candidate-table input[type="checkbox"]');
    const checkedCheckboxes = document.querySelectorAll('#candidate-table input[type="checkbox"]:checked');
    let totalCost = 0;
    
    if (policy && policy.maxJoin === 1) {
        if (checkedCheckboxes.length >= policy.maxJoin) {
            checkboxes.forEach(cb => {
                if (!cb.checked) {
                    cb.disabled = true;
                }
            });
        } else {
            checkboxes.forEach(cb => cb.disabled = false);
        }
    } else {
        checkboxes.forEach(cb => cb.disabled = false);
    }
    
    checkedCheckboxes.forEach(cb => {
        totalCost += parseInt(cb.dataset.cost);
    });
    document.getElementById('total-join-cost').textContent = totalCost;

    const joinButton = document.getElementById('join-button');
    if (policy && policy.maxJoin === 1 && checkedCheckboxes.length > 1) {
        joinButton.disabled = true;
    } else {
        joinButton.disabled = false;
    }
}

function joinSelectedAdventurers(policyKey) { 
    const policy = SCOUT_POLICIES[policyKey];
    const checkboxes = document.querySelectorAll('#candidate-table input[type="checkbox"]:checked');
    let totalCost = 0;
    const selectedIds = [];

    checkboxes.forEach(cb => {
        totalCost += parseInt(cb.dataset.cost);
        selectedIds.push(parseInt(cb.value));
    });

    if (selectedIds.length === 0) {
        alert('誰も選択されませんでした。スカウトを中断します。');
        cancelScout();
        return;
    }
    
    if (policy && policy.maxJoin === 1 && selectedIds.length > 1) {
        alert('「集中スカウト」では、一度に加入できる冒険者は1名のみです。');
        return;
    }
    
    if (gold < totalCost) {
        alert(`資金が足りません。合計加入費用 ${totalCost} 万Gが必要です。（現在資金: ${gold} 万G）`);
        return;
    }

    gold -= totalCost;
    
    const selectedAdventurers = scoutCandidates.filter(c => selectedIds.includes(c.id));
    adventurers.push(...selectedAdventurers);
    
    alert(`${selectedAdventurers.length}名の冒険者をギルドに迎え入れ、合計 ${totalCost} 万Gを支払いました！`);

    scoutCandidates = [];
    cancelScout();
}

function cancelScout() {
    scoutCandidates = [];
    scoutAreaEl.innerHTML = '';
    scoutAreaEl.style.display = 'none';
    adventurerListEl.style.display = 'block';
    updateDisplay();
}


// --- クエスト機能 ---

/**
 * クエストの適正能力と冒険者のスキルを比較し、成功確率を計算します。
 * ★★★ 昇級試験の成功率ロジックを更新 ★★★
 * @param {Object} quest - クエストオブジェクト
 * @param {Array} sentAdventurers - 派遣する冒険者の配列
 * @returns {number} 成功確率 (0.0 - 1.0)
 */
function calculateSuccessRate(quest, sentAdventurers) {
    if (sentAdventurers.length === 0) return 0;
    
    // 昇級試験かどうかの判定 (quest.isPromotionで判定)
    const isPromotion = quest.isPromotion === true;

    if (isPromotion) {
        // 昇級試験の場合
        if (sentAdventurers.length !== 1) {
            // 複数名での受験は想定外、最低成功率を返す
            return PROMOTION_BASE_SUCCESS_RATE / 100;
        }

        const requiredDifficulty = quest.difficulty;
        const advOvr = sentAdventurers[0].ovr;
        let baseRate = PROMOTION_BASE_SUCCESS_RATE;

        if (advOvr < requiredDifficulty) {
            // スキル不足の場合、不足分(requiredDifficulty - advOvr)を%としてPROMOTION_BASE_SUCCESS_RATEから直接減算
            const deficit = requiredDifficulty - advOvr;
            baseRate = PROMOTION_BASE_SUCCESS_RATE - deficit;
        } else {
            // スキル超過の場合、超過分を0.5で割って%として加算 (最高100%)
            const overSkill = advOvr - requiredDifficulty;
            const bonus = overSkill / 0.5; // 0.5で割った値をボーナス%とする
            baseRate = PROMOTION_BASE_SUCCESS_RATE + bonus;
        }

        // 成功率の上限は100%
        baseRate = Math.min(100, baseRate);
        
        // 最低成功確率を5%に設定
        return Math.max(5, baseRate) / 100;

    } else {
        // 通常のクエストの場合 (既存ロジックを流用)
        let successRate = 100;
        const aptitudes = quest.aptitudes;

        const totalAdventurerSkill = {
            combat: sentAdventurers.reduce((sum, adv) => sum + adv.skills.combat, 0),
            magic: sentAdventurers.reduce((sum, adv) => sum + adv.skills.magic, 0),
            exploration: sentAdventurers.reduce((sum, adv) => sum + adv.skills.exploration, 0),
        };
        
        const skills = ['combat', 'magic', 'exploration'];

        for (const skill of skills) {
            const requiredValue = aptitudes[skill];
            
            if (requiredValue !== '無関係') {
                const targetSkill = typeof requiredValue === 'number' ? requiredValue : parseInt(requiredValue); // 念の為intに変換
                const actualSkill = totalAdventurerSkill[skill];

                // 成功率計算ロジックは維持
                if (actualSkill < targetSkill) {
                    // 不足分に応じて確率を減らす (最低20%までは下がる)
                    const reduction = ((targetSkill - actualSkill) / targetSkill) * 80; 
                    successRate -= reduction;
                } else if (actualSkill > targetSkill * 1.5) {
                    // 余裕がある場合、確率をわずかに上げる (最大100%)
                    successRate = Math.min(100, successRate + 5);
                }
            }
        }

        // 最低成功確率20%、最大100%
        successRate = Math.max(20, Math.min(100, successRate));
        
        return successRate / 100; 
    }
}


// クエスト一覧を表示
function renderQuests() {
    questsEl.innerHTML = ''; 
    questDetailAreaEl.style.display = 'none'; 
    adventurerListEl.style.display = 'block'; 

    let hasAvailableQuest = false;

    // --- 昇級試験クエストの生成と表示 ---
    // IDは1000から開始
    adventurers.forEach(adv => {
        // 待機中であり、Sランク未満の冒険者のみ昇級試験をリストに追加
        if (adv.status === '待機中' && adv.rank !== 'S') {
            const currentRankIndex = RANKS.indexOf(adv.rank);
            const nextRank = RANKS[currentRankIndex + 1];
            const requiredDifficulty = PROMOTION_DIFFICULTIES[adv.rank];
            
            // 昇級試験は報酬0、難易度設定、単独任務
            const promotionQuest = {
                id: 1000 + adv.id, // IDをユニークにする
                name: `${adv.name} の昇級試験 (${adv.rank} → ${nextRank})`,
                reward: 0,
                difficulty: requiredDifficulty,
                // 昇級試験はOVRベースなので、属性は無関係とする
                aptitudes: { combat: '無関係', magic: '無関係', exploration: '無関係' }, 
                isPromotion: true,
                advId: adv.id // どの冒険者の試験か特定するためのID
            };

            const questDiv = document.createElement('div');
            questDiv.className = 'quest-item promotion-exam';
            
            // 昇級試験は単独任務が前提
            const estimatedRate = calculateSuccessRate(promotionQuest, [adv]);
            const statusColor = estimatedRate >= 0.7 ? 'green' : (estimatedRate >= 0.5 ? 'orange' : 'red');

            questDiv.innerHTML = `
                <h4>🎓 昇級試験: ${promotionQuest.name}</h4>
                <p><strong>目標OVR:</strong> ${promotionQuest.difficulty} / **${adv.name} のOVR: ${adv.ovr}**</p>
                <p><strong>成功率目安:</strong> <span style="font-weight:bold; color:${statusColor};">${Math.round(estimatedRate * 100)}%</span></p>
                <p style="font-size:0.9em;">※この任務は**${adv.name}単独**で挑みます。成功すると${nextRank}ランクに昇級します。</p>
                <button onclick="showQuestSelection(${promotionQuest.id}, ${adv.id})">
                    試験を受ける
                </button>
            `;
            questsEl.appendChild(questDiv);
            hasAvailableQuest = true;
        }
    });

    // --- 通常クエストの表示 ---
    // 表示可能な通常クエストをフィルタリング
    const displayableQuests = quests.filter(quest => {
        if (quest.requiredRank) {
            const requiredRankIndex = RANKS.indexOf(quest.requiredRank);
            // ギルドの最高ランクが条件を満たしているかチェック
            const maxRankIndexInGuild = Math.max(...adventurers.map(adv => RANKS.indexOf(adv.rank)), -1);
            if (maxRankIndexInGuild < requiredRankIndex) {
                return false; // 条件を満たさないのでこのクエストは表示しない
            }
        }
        return quest.available;
    });

    // ★ 難易度(difficulty)の降順でソート
    displayableQuests.sort((a, b) => b.difficulty - a.difficulty);

    // ソートされたクエストを描画
    displayableQuests.forEach(quest => {
        hasAvailableQuest = true;
        const questDiv = document.createElement('div');
        questDiv.className = 'quest-item';
        
        const rankRequirementHtml = quest.requiredRank 
            ? `<p style="color: #c0392b; font-weight: bold;">推奨ランク: ${quest.requiredRank}以上</p>` 
            : '';

        let aptitudesText = '';
        for (const skill in quest.aptitudes) {
            const value = quest.aptitudes[skill];
            if (value !== '無関係') {
                aptitudesText += `${skill.substring(0, 1).toUpperCase()}: ${value} / `;
            }
        }
        aptitudesText = aptitudesText.substring(0, aptitudesText.length - 3);

        questDiv.innerHTML = `
            <h3>${quest.name}</h3>
            ${rankRequirementHtml}
            <p>報酬: ${quest.reward} 万G</p>
            <p>適正能力: ${aptitudesText} (難易度合計: ${quest.difficulty})</p>
            <button onclick="showQuestSelection(${quest.id})">
                派遣メンバーを選択
            </button>
        `;
        questsEl.appendChild(questDiv);
    });

    if (!hasAvailableQuest) {
        questsEl.innerHTML = '<p>現在、他に利用可能なクエストはありません。次の日の依頼を待ちましょう。</p>';
    }
}


/**
 * クエスト派遣メンバーの選択画面を表示します。
 * @param {number} questId - 選択するクエストのID
 * @param {number} [targetAdvId=null] - 昇級試験の場合、対象の冒険者のID
 */
function showQuestSelection(questId, targetAdvId = null) {
    // 昇級試験クエストオブジェクトを生成
    let quest;
    // 昇級試験の判定はID >= 1000 または targetAdvId があるかで判断する
    const isPromotion = questId >= 1000 && targetAdvId !== null;

    if (isPromotion) {
        const adv = adventurers.find(a => a.id === targetAdvId);
        if (!adv || adv.rank === 'S') return;
        
        const currentRankIndex = RANKS.indexOf(adv.rank);
        const nextRank = RANKS[currentRankIndex + 1];
        const requiredDifficulty = PROMOTION_DIFFICULTIES[adv.rank];
        
        quest = {
            id: questId, 
            name: `${adv.name} の昇級試験 (${adv.rank} → ${nextRank})`,
            reward: 0,
            difficulty: requiredDifficulty,
            // OVRベースなので属性は無関係
            aptitudes: { combat: '無関係', magic: '無関係', exploration: '無関係' },
            isPromotion: true,
            advId: adv.id
        };
        // クエスト一覧から元のクエストを見つける
    } else {
        quest = quests.find(q => q.id === questId);
    }

    if (!quest) return;

    scoutAreaEl.style.display = 'none';
    adventurerListEl.style.display = 'none';
    questsEl.style.display = 'none';

    questDetailAreaEl.style.display = 'block';
    questDetailAreaEl.innerHTML = `<h2>${quest.name} - 派遣メンバー選択</h2>`;

    let aptitudesText = '';
    for (const skill in quest.aptitudes) {
        const value = quest.aptitudes[skill];
        if (value !== '無関係') {
            aptitudesText += `<strong>${skill.substring(0, 1).toUpperCase()}: ${value}</strong> / `;
        }
    }
    aptitudesText = aptitudesText.substring(0, aptitudesText.length - 3);

    const maxAdventurers = quest.isPromotion ? 1 : 4;
    const selectionInfo = quest.isPromotion 
        ? `<p style="color:red; font-weight:bold;">この試験は${adventurers.find(a => a.id === targetAdvId).name}単独での受験となります。他メンバーは選択できません。</p>`
        : `<p><strong>派遣する冒険者を選択してください (最大${maxAdventurers}名):</strong></p>`;


    questDetailAreaEl.innerHTML += `
        <p><strong>報酬:</strong> ${quest.reward} 万G</p>
        <p><strong>適正能力 (目標OVR):</strong> ${quest.difficulty}</p>
        <p style="font-size: 0.9em;">※獲得経験値は成功率に応じて変動し、さらに**年齢とランク**による倍率が適用されます。</p>
        ${selectionInfo}

        <p>
            <strong>現在の成功確率:</strong> <span id="current-success-rate" style="font-weight: bold; color: blue;">0%</span> 
            (選択人数: <span id="selected-adventurers-count">0</span> 人)
        </p>

        <table id="quest-candidate-table">
            <tr>
                <th>選択</th>
                <th>名前</th>
                <th>ランク</th>
                <th>OVR</th>
                <th>戦闘</th>
                <th>魔法</th>
                <th>探索</th>
                <th>EXP / NEXT</th>
                <th>状態</th>
                <th>獲得予定EXP (成功時)</th> </tr>
        </table>
        <div style="text-align: center; margin-top: 20px;">
            <button id="send-quest-button" onclick="sendAdventurersToQuest(${quest.id}, ${quest.isPromotion}, ${quest.isPromotion ? targetAdvId : null})" disabled>派遣予定に入れる</button>
            <button onclick="cancelQuestSelection()">キャンセル</button>
        </div>
    `;

    const table = document.getElementById('quest-candidate-table');
    let availableAdventurers = adventurers.filter(adv => adv.status === '待機中');
    
    // ★ クエストのランク制限をチェック
    if (quest.requiredRank) {
        const requiredRankIndex = RANKS.indexOf(quest.requiredRank);
        availableAdventurers = availableAdventurers.filter(adv => {
            const advRankIndex = RANKS.indexOf(adv.rank);
            return advRankIndex >= requiredRankIndex;
        });
    }

    // 昇級試験の場合は対象者のみをリストアップ
    if (quest.isPromotion) {
        availableAdventurers = availableAdventurers.filter(adv => adv.id === targetAdvId);
    }


    availableAdventurers.forEach(adv => {
        const row = table.insertRow();
        const expPercentage = Math.min(100, (adv.exp / adv.expToLevelUp) * 100);
        
        // 昇級試験の場合はチェックボックスを強制的にチェック済み・無効化
        const checked = quest.isPromotion ? 'checked disabled' : '';

        // ★ ランクの色を取得
        const rankColor = getRankColor(adv.rank);

        row.innerHTML = `
            <td><input type="checkbox" name="quest-adv-select" value="${adv.id}" ${checked}></td>
            <td>${adv.name}</td>
            <td><span class="adventurer-rank" style="color: ${rankColor}; font-weight: bold;">${adv.rank}</span></td>
            <td>${adv.ovr}</td>
            <td>${adv.skills.combat}</td>
            <td>${adv.skills.magic}</td>
            <td>${adv.skills.exploration}</td>
            <td>
                ${adv.exp} / ${adv.expToLevelUp}
                <div class="exp-bar-container">
                    <div class="exp-bar" style="width: ${expPercentage}%;"></div>
                </div>
            </td>
            <td>${adv.status}</td>
            <td><span id="adv-exp-preview-${adv.id}" class="exp-preview-value">-</span></td> `;
    });

    const checkboxes = document.querySelectorAll('#quest-candidate-table input[type="checkbox"]:not([disabled])');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => updateQuestSuccessRate(quest));
    });

    updateQuestSuccessRate(quest);
}


/**
 * 選択された冒険者に基づいて成功確率とUIを更新します。
 * @param {Object} quest - クエストオブジェクト
 */
function updateQuestSuccessRate(quest) {
    const checkedCheckboxes = document.querySelectorAll('#quest-candidate-table input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.value));
    const selectedAdventurers = adventurers.filter(adv => selectedIds.includes(adv.id));

    const rate = calculateSuccessRate(quest, selectedAdventurers);
    const ratePercentage = Math.round(rate * 100);
    
    // EXPプレビューの基本値（年齢補正前）を計算
    const gainedBaseExp = selectedAdventurers.length > 0 ? calculateQuestEXP(rate) : 0; 
    // 昇級試験はEXP半減
    const expModifier = quest.isPromotion ? 0.5 : 1.0; 

    const rateEl = document.getElementById('current-success-rate');
    const countEl = document.getElementById('selected-adventurers-count');
    const sendButton = document.getElementById('send-quest-button');

    rateEl.textContent = `${ratePercentage}%`;
    rateEl.style.color = ratePercentage >= 80 ? 'green' : (ratePercentage >= 50 ? 'orange' : 'red');
    countEl.textContent = selectedAdventurers.length;

    // EXPプレビューの更新
    const availableAdventurers = adventurers.filter(adv => adv.status === '待機中');
    
    availableAdventurers.forEach(adv => {
        const expPreviewEl = document.getElementById(`adv-exp-preview-${adv.id}`);
        
        if (!expPreviewEl) return;
        
        if (selectedIds.includes(adv.id) && selectedAdventurers.length > 0) {
            // 選択されている冒険者の場合
            const ageMultiplier = getAgeMultiplier(adv.age);
            const rankMultiplier = getRankMultiplier(adv.rank); // ★ ランク倍率を追加
            const totalMultiplier = ageMultiplier * rankMultiplier; // ★ 合計倍率
            const individualExp = Math.round(gainedBaseExp * totalMultiplier * expModifier); // ★ 合計倍率を適用
            
            // 倍率は小数点第二位まで表示
            expPreviewEl.textContent = `${individualExp} P (x${totalMultiplier.toFixed(2)})`; // ★ 表示も合計倍率に
            expPreviewEl.style.fontWeight = 'bold';
            // 倍率が1.0以上なら青、0より大きく1.0未満なら緑、0なら灰色
            expPreviewEl.style.color = (totalMultiplier >= 1.0) ? 'blue' : (totalMultiplier > 0) ? 'green' : 'gray'; 

        } else {
            // 選択されていない、または誰も選択されていない場合
            expPreviewEl.textContent = '-';
            expPreviewEl.style.fontWeight = 'normal';
            expPreviewEl.style.color = 'inherit';
        }
    });

    // 派遣ボタンの有効化: 1人以上選択されていればOK (昇級試験の場合は強制的に1人)
    if (quest.isPromotion) {
        sendButton.disabled = selectedAdventurers.length !== 1;
    } else {
        // 通常クエストは最大4人
        sendButton.disabled = selectedAdventurers.length === 0 || selectedAdventurers.length > 4;
    }
}


/**
 * 選択された冒険者をクエストに派遣予定に入れます。
 * @param {number} questId - クエストID
 * @param {boolean} isPromotion - 昇級試験かどうか
 * @param {number} [targetAdvId=null] - 昇級試験の場合、対象の冒険者のID
 */
function sendAdventurersToQuest(questId, isPromotion, targetAdvId = null) {
    let quest;
    let selectedIds;

    const checkedCheckboxes = document.querySelectorAll('#quest-candidate-table input[type="checkbox"]:checked');
    selectedIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.value));

    // 昇級試験の処理
    if (isPromotion) {
        if (selectedIds.length !== 1 || selectedIds[0] !== targetAdvId) {
            alert('昇級試験は単独任務であり、対象者のみが受験できます。');
            cancelQuestSelection();
            return;
        }
        const adv = adventurers.find(a => a.id === selectedIds[0]);
        if (!adv) return;
        
        const currentRankIndex = RANKS.indexOf(adv.rank);
        const nextRank = RANKS[currentRankIndex + 1];
        const requiredDifficulty = PROMOTION_DIFFICULTIES[adv.rank];

        quest = {
            id: questId,
            name: `${adv.name} の昇級試験 (${adv.rank} → ${nextRank})`,
            reward: 0,
            difficulty: requiredDifficulty,
            aptitudes: { combat: '無関係', magic: '無関係', exploration: '無関係' },
            isPromotion: true,
            advId: adv.id,
            advRankBefore: adv.rank, // 昇級処理のために元のランクを保持
        };
        
        // 昇級試験はクエストリストから消えないため、quests.findは行わない
    } else {
        quest = quests.find(q => q.id === questId);
        if (!quest) return;
        // 通常クエストは非表示に
        quest.available = false;
    }


    const sentAdventurers = adventurers.filter(adv => selectedIds.includes(adv.id));

    // 成功確率を計算
    const successRate = calculateSuccessRate(quest, sentAdventurers);
    
    // 1. 冒険者のステータスを「クエスト予定」に設定
    sentAdventurers.forEach(adv => adv.status = `クエスト予定: ${quest.name}`);
    
    // 2. クエストを進行中リストに追加
    questsInProgress.push({
        quest: quest,
        adventurers: sentAdventurers,
        rate: successRate
    });

    // 3. UIを更新
    cancelQuestSelection();
    
    alert(`【${quest.name}】に${sentAdventurers.length}名の冒険者を派遣予定に入れました！\n結果は「Next Month」で確認できます。`);
    updateDisplay();
}

/**
 * クエスト選択をキャンセルし、一覧に戻ります。
 */
function cancelQuestSelection() {
    questDetailAreaEl.innerHTML = '';
    questDetailAreaEl.style.display = 'none';
    questsEl.style.display = 'block'; 
    adventurerListEl.style.display = 'block'; 
    updateDisplay();
}


// --- ゲーム進行機能 ---

/**
 * 年末処理。全冒険者の年齢を+1し、年俸を再契約（更新）します。
 * @returns {string} 年末処理のサマリーメッセージ
 */
function processYearEnd() {
    let message = `\n**【年末処理】**\n`;
    if (adventurers.length === 0) {
        message += "所属している冒険者がいないため、契約更新はありませんでした。\n";
        return message;
    }

    message += "全冒険者の年齢が1歳上がり、契約を更新しました。\n";
    adventurers.forEach(adv => {
        adv.age++;
        const oldSalary = adv.annualSalary;
        // 現在のOVRとランクで年俸を再計算
        adv.annualSalary = calculateAnnualSalary(adv.ovr, adv.rank); // ★ ランクを渡すように修正
        message += `・${adv.name} (${adv.age}歳): 年俸 ${oldSalary}万G → ${adv.annualSalary}万G\n`;
    });
    return message;
}

/**
 * 月を進める機能（Next Monthボタンに対応）
 */
function nextMonth() {
    let yearEndMessage = '';
    // 年末処理
    if (currentMonth === 12) {
        yearEndMessage = processYearEnd();
        currentYear++;
        currentMonth = 1;
    } else {
        currentMonth++;
    }
    
    let summaryMessage = `【${currentYear}年 ${currentMonth-1 === 0 ? 12 : currentMonth-1}月の収支報告】\n\n`;
    let totalIncome = 0;
    let totalExpense = 0;
    
    // 1. 進行中のクエストの結果を処理
    if (questsInProgress.length > 0) {
        const questResults = processQuestsResults();
        // 年末処理メッセージがある場合、クエスト結果の前に挿入
        if (yearEndMessage) {
            summaryMessage += yearEndMessage + questResults.message;
        } else {
            summaryMessage += questResults.message;
        }
        totalIncome += questResults.income;
        totalExpense += questResults.expense;
    } else {
        summaryMessage += "前月に派遣予定のクエストはありませんでした。\n";
    }

    // 2. 冒険者への給与支払い処理
    const monthlySalaryExpense = payMonthlySalary();
    totalExpense += monthlySalaryExpense;
    
    // 年末処理メッセージを追加 (クエストがなかった場合)
    if (yearEndMessage && questsInProgress.length === 0) {
        summaryMessage += yearEndMessage;
    }
    
    summaryMessage += `\n-----------------------\n`;
    summaryMessage += `💰 月給支払額: -${monthlySalaryExpense} 万G\n`;
    summaryMessage += `総収支: +${totalIncome} 万G (収入) -${totalExpense} 万G (支出) = ${totalIncome - totalExpense} 万G\n`;
    summaryMessage += `次月資金: ${gold} 万G`;

    // 3. ギルドの成長処理 (スカウト能力の上昇など)
    if (adventurers.length > 0) {
        scoutSkill = Math.min(300, scoutSkill + Math.floor(adventurers.length / 5) + 1);
    }

    // 4. クエストのリセット（全て復活）
    quests.forEach(q => q.available = true);
    
    // 資金不足チェック
    if (gold < 0) {
        alert("ギルドの資金が底を尽きました... ゲームオーバーです。");
        // ここでゲームオーバー処理などを追加
    } else {
        alert("新しい月になりました！\n\n" + summaryMessage);
    }
    
    updateDisplay();
}

/**
 * 進行中のクエストの結果をまとめて処理します。
 */
function processQuestsResults() {
    let message = `**【クエスト結果】**\n`;
    let totalIncome = 0;
    let totalExpense = 0;
    let levelUpMessages = [];
    let promotionMessages = []; // 昇級メッセージ用

    questsInProgress.forEach(qData => {
        const quest = qData.quest;
        const sentAdventurers = qData.adventurers;
        const successRate = qData.rate;
        
        const success = Math.random() < successRate;
        
        let resultMessage = '';

        // EXP計算の基本値（成功/失敗共通）
        const gainedBaseExp = calculateQuestEXP(successRate); 
        // 昇級試験はEXP半減
        const expModifier = quest.isPromotion ? 0.5 : 1.0; 
        let totalGainedExp = 0;

        sentAdventurers.forEach(adv => {
            const ageMultiplier = getAgeMultiplier(adv.age);
            const rankMultiplier = getRankMultiplier(adv.rank); // ★ ランク倍率を追加
            const totalMultiplier = ageMultiplier * rankMultiplier; // ★ 合計倍率
            const gainedExp = Math.round(gainedBaseExp * totalMultiplier * expModifier); // ★ 合計倍率を適用

            totalGainedExp += gainedExp; 

            if (gainedExp > 0) {
                adv.exp += gainedExp;
                while (adv.exp >= adv.expToLevelUp) {
                    levelUpMessages.push(levelUp(adv)); // ★★★ 修正されたlevelUp関数を呼び出し
                }
            }
        });
        
        const averageGainedExp = Math.round(totalGainedExp / sentAdventurers.length);


        if (success) {
            if (quest.isPromotion) {
                // 昇級試験成功
                const adv = sentAdventurers[0];
                const currentRankIndex = RANKS.indexOf(adv.rank);
                const nextRank = RANKS[currentRankIndex + 1];
                
                // 昇級処理
                adv.rank = nextRank; 
                promotionMessages.push(`🎉 ${adv.name} は昇級試験に合格し、【${nextRank}】に昇級しました！ (EXP+${averageGainedExp}P)`);
                resultMessage = `✅ 成功: 昇級！`;

            } else {
                // 通常クエスト成功
                gold += quest.reward;
                totalIncome += quest.reward;
                resultMessage = `✅ 成功: +${quest.reward} 万G (獲得EXP(平均): ${averageGainedExp}P)`;
            }

        } else {
            if (quest.isPromotion) {
                // 昇級試験失敗
                const adv = sentAdventurers[0];
                promotionMessages.push(`😥 ${adv.name} は昇級試験に失敗しました。次月以降に再挑戦できます。 (EXP+${averageGainedExp}P)`);
                resultMessage = `❌ 失敗: 昇級できず`;

            } else {
                // 通常クエスト失敗
                const penalty = Math.floor(quest.reward / 2);
                gold -= penalty;
                totalExpense += penalty;
                resultMessage = `❌ 失敗: -${penalty} 万G (ペナルティ)`;
                
                // クエストを復活させる
                const originalQuest = quests.find(q => q.id === quest.id);
                if (originalQuest) {
                     originalQuest.available = true;
                }
            }
        }
        
        message += `[${quest.name}] 成功率${Math.round(successRate * 100)}% → ${resultMessage}\n`;
        
        // 冒険者のステータスを待機中に戻す
        sentAdventurers.forEach(adv => adv.status = '待機中');
    });

    // 進行中リストをクリア
    questsInProgress = [];
    
    // 昇級メッセージを先に表示
    if (promotionMessages.length > 0) {
        message += `\n**【昇級報告】**\n` + promotionMessages.join('\n') + '\n';
    }
    
    // レベルアップメッセージを結果メッセージに追加
    if (levelUpMessages.length > 0) {
        message += `\n**【レベルアップ報告】**\n` + levelUpMessages.join('\n') + '\n';
    }

    return { message, income: totalIncome, expense: totalExpense };
}

/**
 * ギルドの全冒険者に月給を支払います。
 * @returns {number} 支払った月給の合計額 (万G)
 */
function payMonthlySalary() {
    let totalMonthlySalary = 0;
    adventurers.forEach(adv => {
        const monthlySalary = Math.ceil(adv.annualSalary / 12); 
        totalMonthlySalary += monthlySalary;
    });
    
    gold -= totalMonthlySalary; 
    
    return totalMonthlySalary;
}

// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
    if (scoutAreaEl) {
        scoutAreaEl.style.display = 'none';
    }
    // ★ 年表示に対応
    document.getElementById('month').textContent = `${currentYear}年 ${currentMonth}月`;
});
