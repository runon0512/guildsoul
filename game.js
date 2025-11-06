// --- ゲームの状態 ---
let gold = 500; // 資金を500万Gに変更
let gameDifficulty = 'hard'; // ★ 難易度を追加 ('easy' or 'hard')
let adventurers = []; // ギルドに所属する冒険者
let scoutCandidates = []; // スカウト候補リスト
let scoutSkill = 100; // ギルドのスカウト能力 (初期値100)
let questsInProgress = []; // 進行中のクエスト
let nextAdventurerId = 1;
let currentMonth = 1;
let currentYear = 1; // ★ 年を追加
let allTimeAdventurers = {}; // ★ ゲームオーバー時のリザルト用に全期間の冒険者データを記録
let tutorialStep = 0; // 0:off, 1:scout, 2:join, 3:assign, 4:next month
let isInTutorial = false;

let hasScoutedThisMonth = false; // ★ ハードモードでのスカウト回数制限用
let selectedDifficulty = 'hard'; // ホーム画面での選択を一時的に保持

// --- 難易度設定 ---
const DIFFICULTY_SETTINGS = {
    easy: {
        name: "イージー",
        scoutCosts: { immediate: 10, growth: 10, focused: 30 },
        questRewardMultiplier: 1.5
    },
    hard: {
        name: "ハード",
        scoutCosts: { immediate: 100, growth: 100, focused: 300 },
        questRewardMultiplier: 1.0
    }
};

// --- 属性定義 (旧タレント) ---
const ATTRIBUTES = {
    // Common
    fire_c: { name: '炎', rarity: 'Common', color: '#e67e22', description: '炎の力。レベルアップ時、魔法スキルが上昇しやすくなる。', bonus: { magic: 3 } },
    water_c: { name: '水', rarity: 'Common', color: '#3498db', description: '水の力。レベルアップ時、魔法スキルが上昇しやすくなる。', bonus: { magic: 3 } },
    ice_c: { name: '氷', rarity: 'Common', color: '#1abc9c', description: '氷の力。レベルアップ時、魔法スキルが上昇しやすくなる。', bonus: { magic: 3 } },
    lightning_c: { name: '雷', rarity: 'Common', color: '#f1c40f', description: '雷の力。レベルアップ時、魔法スキルが上昇しやすくなる。', bonus: { magic: 3 } },
    wind_c: { name: '風', rarity: 'Common', color: '#2ecc71', description: '風の力。レベルアップ時、探索スキルが上昇しやすくなる。', bonus: { exploration: 3 } },
    earth_c: { name: '土', rarity: 'Common', color: '#a0522d', description: '土の力。レベルアップ時、戦闘スキルが上昇しやすくなる。', bonus: { combat: 3 } },
    light_c: { name: '光', rarity: 'Common', color: '#fdfdfd', description: '光の力。レベルアップ時、全スキルがわずかに上昇しやすくなる。', bonus: { combat: 1, magic: 1, exploration: 1 } },
    dark_c: { name: '闇', rarity: 'Common', color: '#596275', description: '闇の力。レベルアップ時、全スキルがわずかに上昇しやすくなる。', bonus: { combat: 1, magic: 1, exploration: 1 } },
    rock_c: { name: '岩', rarity: 'Common', color: '#8395a7', description: '岩の力。レベルアップ時、戦闘スキルが上昇しやすくなる。', bonus: { combat: 3 } },
    poison_c: { name: '毒', rarity: 'Common', color: '#9b59b6', description: '毒の力。レベルアップ時、魔法スキルが上昇しやすくなる。', bonus: { magic: 3 } },

    // Uncommon
    fire_uc: { name: '烈火', rarity: 'Uncommon', color: '#d35400', description: '激しい炎の力。レベルアップ時、魔法スキルと戦闘スキルが少し上昇しやすくなる。', bonus: { magic: 2, combat: 2 } },
    water_uc: { name: '流水', rarity: 'Uncommon', color: '#2980b9', description: '流れる水の力。レベルアップ時、魔法スキルと探索スキルが少し上昇しやすくなる。', bonus: { magic: 2, exploration: 2 } },
    ice_uc: { name: '氷結', rarity: 'Uncommon', color: '#16a085', description: '万物を凍らせる氷の力。レベルアップ時、魔法スキルが大きく上昇しやすくなる。', bonus: { magic: 4 } },
    lightning_uc: { name: '電光', rarity: 'Uncommon', color: '#f39c12', description: '素早い雷の力。レベルアップ時、探索スキルと戦闘スキルが少し上昇しやすくなる。', bonus: { exploration: 2, combat: 2 } },
    wind_uc: { name: '疾風', rarity: 'Uncommon', color: '#27ae60', description: '吹き荒れる風の力。レベルアップ時、探索スキルが大きく上昇しやすくなる。', bonus: { exploration: 4 } },
    earth_uc: { name: '大地', rarity: 'Uncommon', color: '#8c5a30', description: '揺るぎない大地の力。レベルアップ時、戦闘スキルが大きく上昇しやすくなる。', bonus: { combat: 4 } },
    light_uc: { name: '聖光', rarity: 'Uncommon', color: '#f7f1e3', description: '聖なる光の力。レベルアップ時、戦闘スキルが少し、魔法スキルと探索スキルがわずかに上昇しやすくなる。', bonus: { combat: 2, magic: 1, exploration: 1 } },
    dark_uc: { name: '常闇', rarity: 'Uncommon', color: '#3d3d3d', description: '深淵の闇の力。レベルアップ時、魔法スキルが少し、戦闘スキルと探索スキルがわずかに上昇しやすくなる。', bonus: { combat: 1, magic: 2, exploration: 1 } },
    steel_uc: { name: '鋼', rarity: 'Uncommon', color: '#bdc3c7', description: '鋼の如き力。レベルアップ時、戦闘スキルが大きく上昇しやすくなる。', bonus: { combat: 4 } },
    crystal_uc: { name: '水晶', rarity: 'Uncommon', color: '#ff00ff', description: '水晶の魔力。レベルアップ時、魔法スキルが大きく上昇しやすくなる。', bonus: { magic: 4 } },
    beast_uc: { name: '獣', rarity: 'Uncommon', color: '#e58e26', description: '獣の如き力。レベルアップ時、戦闘スキルと探索スキルが少し上昇しやすくなる。', bonus: { combat: 2, exploration: 2 } },
    spirit_uc: { name: '霊', rarity: 'Uncommon', color: '#a29bfe', description: '霊的な力。レベルアップ時、魔法スキルと探索スキルが少し上昇しやすくなる。', bonus: { magic: 2, exploration: 2 } },

    // Rare
    blaze_r: { name: '爆炎', rarity: 'Rare', color: '#c0392b', description: 'すべてを焼き尽くす爆炎の力。レベルアップ時、魔法スキルが非常に大きく上昇しやすくなる。', bonus: { magic: 5 } },
    abyss_r: { name: '深淵', rarity: 'Rare', color: '#8e44ad', description: '深淵の力。レベルアップ時、魔法スキルが上昇しやすく、探索スキルが少し上昇しやすくなる。', bonus: { magic: 3, exploration: 2 } },
    thunder_r: { name: '轟雷', rarity: 'Rare', color: '#f39c12', description: '天を揺るがす雷の力。レベルアップ時、戦闘スキルが上昇しやすく、魔法スキルが少し上昇しやすくなる。', bonus: { combat: 3, magic: 2 } },
    vortex_r: { name: '渦潮', rarity: 'Rare', color: '#2980b9', description: '渦巻く潮の力。レベルアップ時、戦闘スキルが上昇しやすく、探索スキルが少し上昇しやすくなる。', bonus: { combat: 3, exploration: 2 } },
    gale_r: { name: '嵐', rarity: 'Rare', color: '#16a085', description: '荒れ狂う嵐の力。レベルアップ時、探索スキルが非常に大きく上昇しやすくなる。', bonus: { exploration: 5 } },
    gaea_r: { name: 'ガイア', rarity: 'Rare', color: '#8c5a30', description: '母なる大地の力。レベルアップ時、戦闘スキルが非常に大きく上昇しやすくなる。', bonus: { combat: 5 } },
    holy_r: { name: '神聖', rarity: 'Rare', color: '#f1c40f', description: '極めて神聖な力。レベルアップ時、戦闘スキルと魔法スキルが少し、探索スキルがわずかに上昇しやすくなる。', bonus: { combat: 2, magic: 2, exploration: 1 } },
    chaos_r: { name: '混沌', rarity: 'Rare', color: '#7f8c8d', description: '予測不能な混沌の力。レベルアップ時、魔法スキルと探索スキルが少し、戦闘スキルがわずかに上昇しやすくなる。', bonus: { combat: 1, magic: 2, exploration: 2 } },
    dragon_r: { name: '竜', rarity: 'Rare', color: '#e74c3c', description: '竜の血脈。レベルアップ時、戦闘スキルが上昇しやすく、魔法スキルが少し上昇しやすくなる。', bonus: { combat: 3, magic: 2 } },
    phantom_r: { name: '幻', rarity: 'Rare', color: '#9b59b6', description: '幻影の力。レベルアップ時、魔法スキルが上昇しやすく、探索スキルが少し上昇しやすくなる。', bonus: { magic: 3, exploration: 2 } },
    machine_r: { name: '機', rarity: 'Rare', color: '#95a5a6', description: '機械の力。レベルアップ時、戦闘スキルが上昇しやすく、探索スキルが少し上昇しやすくなる。', bonus: { combat: 3, exploration: 2 } },
    time_r: { name: '時', rarity: 'Rare', color: '#00a8ff', description: '時を操る力。レベルアップ時、戦闘スキルと探索スキルが少し、魔法スキルがわずかに上昇しやすくなる。', bonus: { combat: 2, magic: 1, exploration: 2 } },

    // Epic
    solar_e: { name: '太陽', rarity: 'Epic', color: '#f39c12', description: '太陽の化身。レベルアップ時、戦闘スキルが上昇しやすく、魔法スキルと探索スキルが少し上昇しやすくなる。', bonus: { combat: 3, magic: 2, exploration: 2 } },
    lunar_e: { name: '月', rarity: 'Epic', color: '#ecf0f1', description: '月の化身。レベルアップ時、魔法スキルが上昇しやすく、戦闘スキルと探索スキルが少し上昇しやすくなる。', bonus: { combat: 2, magic: 3, exploration: 2 } },
    cosmo_e: { name: '星', rarity: 'Epic', color: '#4a69bd', description: '星々の導き。レベルアップ時、探索スキルが上昇しやすく、戦闘スキルと魔法スキルが少し上昇しやすくなる。', bonus: { combat: 2, magic: 2, exploration: 3 } },
    void_e: { name: '虚無', rarity: 'Epic', color: '#2c3e50', description: 'すべてを無に帰す力。レベルアップ時、ランダムな1つのスキルが爆発的に上昇しやすくなる。', bonus: { random: 7 } },
    genesis_e: { name: '創生', rarity: 'Epic', color: '#ffffff', description: '世界を創る力。レベルアップ時、戦闘スキルが上昇しやすく、魔法スキルと探索スキルが少し上昇しやすくなる。', bonus: { combat: 3, magic: 2, exploration: 2 } },
    omega_e: { name: '終焉', rarity: 'Epic', color: '#c0392b', description: '世界を終わらせる力。レベルアップ時、魔法スキルが上昇しやすく、戦闘スキルと探索スキルが少し上昇しやすくなる。', bonus: { combat: 2, magic: 3, exploration: 2 } },
    miracle_e: { name: '奇跡', rarity: 'Epic', color: '#fd79a8', description: '奇跡を呼ぶ力。レベルアップ時、最も低いスキルが爆発的に上昇しやすくなる。', bonus: { lowest: 7 } },
};

/**
 * 冒険者が持つ特性の効果を取得します。
 * @param {Object} adv - 冒険者オブジェクト
 * @param {string} effectName - 取得したい効果の名前 (e.g., 'expModifier')
 * @param {*} defaultValue - 効果が存在しない場合のデフォルト値
 * @returns {*} 効果の値
 */
function getTraitEffect(adv, effectName, defaultValue) {
    return defaultValue; // 旧特性システムは廃止
}

/**
 * 指定された16進数の色コードに対して、コントラストが最も高くなる色（黒または白）を返します。
 * @param {string} hexColor - '#'で始まる16進数の色コード (例: '#e67e22')
 * @returns {string} '#000000' (黒) または '#ffffff' (白)
 */
function getContrastColor(hexColor) {
    if (!hexColor) return '#000000'; // フォールバック

    // '#'を取り除き、6桁の16進数に正規化
    const hex = hexColor.slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // YIQ式を用いて輝度を計算
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;

    // 輝度に基づいて黒か白かを決定（閾値は128）
    return (yiq >= 128) ? '#000000' : '#ffffff';
}



// --- ランク定義 ---
const RANKS = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'S', 'X', 'XG', 'XF', 'XE', 'XD', 'XC', 'XB', 'XA', 'XS', 'XX', 'V'];
// ★ 年俸計算用のランクボーナス (万G)
const SALARY_RANK_BONUS = {
    'G': 100,
    'F': 250,
    'E': 500,
    'D': 1000,
    'C': 2000,
    'B': 5000,
    'A': 7500,
    'S': 10000,
    'X': 10000,
    'XG': 10000,
    'XF': 10000,
    'XE': 10000,
    'XD': 10000,
    'XC': 10000,
    'XB': 10000,
    'XA': 10000,
    'XS': 10000,
    'XX': 10000,
    'V': 10000
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
    'S': 300,
    'X': 330,
    'XG': 360,
    'XF': 390,
    'XE': 420,
    'XD': 450,
    'XC': 480,
    'XB': 510,
    'XA': 540,
    'XS': 570,
    'XX': 600,
    'V': Infinity
};
// 昇級試験の成功率の基本値 (不足している場合に適用される最低ライン)
const PROMOTION_BASE_SUCCESS_RATE = 50; 


// スカウト方針の定義 (費用を万G単位に調整)
const SCOUT_POLICIES = {
    immediate: { 
        name: "即戦力重視",
        minAge: 20, 
        maxAge: 30, 
        baseBonus: 8, 
        limit: 10, 
        maxJoin: Infinity 
    },
    growth: { 
        name: "成長重視",
        minAge: 18, 
        maxAge: 18, 
        baseBonus: -5, 
        limit: 10, 
        maxJoin: Infinity 
    },
    focused: { 
        name: "集中スカウト",
        minAge: 28, 
        maxAge: 36, 
        baseBonus: 50, 
        limit: 1, // 候補者数1名に固定
        maxJoin: 1 // 加入できるのも1名に固定
    }
};

let quests = [
    // Gランク (誰でも)
    { id: 1, name: "ゴブリン討伐", reward: 15, difficulty: 50, available: true, aptitudes: { combat: 25, magic: '無関係', exploration: 15 } },
    { id: 2, name: "薬草の採取", reward: 15, difficulty: 30, available: true, aptitudes: { combat: '無関係', magic: '無関係', exploration: 20 } },
    { id: 3, name: "街道の整備", reward: 10, difficulty: 40, available: true, aptitudes: { combat: 15, magic: '無関係', exploration: 15 } },

    // Fランク以上
    { id: 11, name: "街道のゴブリン退治", reward: 20, difficulty: 60, available: true, requiredRank: 'F', aptitudes: { combat: 30, magic: '無関係', exploration: 10 } },
    { id: 12, name: "迷いの森の薬草集め", reward: 17, difficulty: 55, available: true, requiredRank: 'F', aptitudes: { combat: '無関係', magic: 15, exploration: 25 } },
    { id: 13, name: "農村の害獣駆除", reward: 18, difficulty: 65, available: true, requiredRank: 'F', aptitudes: { combat: 25, magic: '無関係', exploration: 20 } },

    // Eランク以上
    { id: 21, name: "廃坑のオーク掃討", reward: 35, difficulty: 80, available: true, requiredRank: 'E', aptitudes: { combat: 35, magic: '無関係', exploration: 20 } },
    { id: 22, name: "水晶洞窟の調査", reward: 30, difficulty: 75, available: true, requiredRank: 'E', aptitudes: { combat: 15, magic: 25, exploration: 30 } },
    { id: 23, name: "商隊の護衛", reward: 33, difficulty: 90, available: true, requiredRank: 'E', aptitudes: { combat: 40, magic: '無関係', exploration: 25 } },

    // Dランク以上
    { id: 31, name: "リザードマンの集落討伐", reward: 70, difficulty: 110, available: true, requiredRank: 'D', aptitudes: { combat: 45, magic: 15, exploration: 25 } },
    { id: 32, name: "古代遺跡の地図作成", reward: 66, difficulty: 100, available: true, requiredRank: 'D', aptitudes: { combat: '無関係', magic: 20, exploration: 45 } },
    { id: 33, name: "呪われた沼の浄化", reward: 60, difficulty: 120, available: true, requiredRank: 'D', aptitudes: { combat: 20, magic: 45, exploration: 30 } },

    // Cランク以上
    { id: 41, name: "ワイバーンの巣の偵察", reward: 133, difficulty: 140, available: true, requiredRank: 'C', aptitudes: { combat: 30, magic: '無関係', exploration: 55 } },
    { id: 42, name: "魔導書の捜索", reward: 130, difficulty: 130, available: true, requiredRank: 'C', aptitudes: { combat: '無関係', magic: 50, exploration: 40 } },
    { id: 43, name: "盗賊団の砦の攻略", reward: 135, difficulty: 150, available: true, requiredRank: 'C', aptitudes: { combat: 60, magic: '無関係', exploration: 35 } },

    // Bランク以上
    { id: 51, name: "グリフォンの討伐", reward: 335, difficulty: 180, available: true, requiredRank: 'B', aptitudes: { combat: 65, magic: '無関係', exploration: 45 } },
    { id: 52, name: "死霊術師の塔の破壊", reward: 340, difficulty: 200, available: true, requiredRank: 'B', aptitudes: { combat: 50, magic: 70, exploration: 30 } },
    { id: 53, name: "王都への機密文書輸送", reward: 330, difficulty: 160, available: true, requiredRank: 'B', aptitudes: { combat: 35, magic: '無関係', exploration: 65 } },

    // Aランク以上
    { id: 61, name: "ミノタウロスの迷宮攻略", reward: 490, difficulty: 220, available: true, requiredRank: 'A', aptitudes: { combat: 75, magic: 25, exploration: 60 } },
    { id: 62, name: "古代ゴーレムの無力化", reward: 500, difficulty: 240, available: true, requiredRank: 'A', aptitudes: { combat: 50, magic: 80, exploration: 40 } },
    { id: 63, name: "辺境伯からの密命", reward: 480, difficulty: 200, available: true, requiredRank: 'A', aptitudes: { combat: 40, magic: '無関係', exploration: 75 } },

    // Sランク以上
    { id: 71, name: "エンシェントドラゴンの討伐", reward: 1000, difficulty: 300, available: true, requiredRank: 'S', aptitudes: { combat: 100, magic: 75, exploration: 50 } },
    { id: 72, name: "魔王軍幹部の暗殺", reward: 900, difficulty: 280, available: true, requiredRank: 'S', aptitudes: { combat: 90, magic: '無関係', exploration: 80 } },
    { id: 73, name: "失われた王国の秘宝探索", reward: 800, difficulty: 260, available: true, requiredRank: 'S', aptitudes: { combat: 50, magic: 80, exploration: 90 } },

    // Xランク以上
    { id: 81, name: "深淵の邪神の復活阻止", reward: 2500, difficulty: 400, available: true, requiredRank: 'X', aptitudes: { combat: 120, magic: 150, exploration: 100 } },
    { id: 82, name: "次元の裂け目の調査", reward: 2200, difficulty: 350, available: true, requiredRank: 'X', aptitudes: { combat: '無関係', magic: 180, exploration: 120 } },

    // XXランク以上
    { id: 91, name: "創世の神々への挑戦", reward: 5000, difficulty: 600, available: true, requiredRank: 'XX', aptitudes: { combat: 200, magic: 200, exploration: 200 } },
];

// ★ ストーリー任務の定義
const STORY_QUESTS = [
    { year: 1,  id: 2001, name: "【ストーリー任務】古代の門の守護者", difficulty: 150,  aptitudes: { combat: 100, magic: 100, exploration: 100 } },
    { year: 2,  id: 2002, name: "【ストーリー任務】影の軍団の偵察",   difficulty: 250,  aptitudes: { combat: 150, magic: 150, exploration: 150 } },
    { year: 3,  id: 2003, name: "【ストーリー任務】魔将軍の砦",       difficulty: 400,  aptitudes: { combat: 200, magic: 200, exploration: 200 } },
    { year: 4,  id: 2004, name: "【ストーリー任務】天空竜の試練",     difficulty: 600,  aptitudes: { combat: 250, magic: 250, exploration: 250 } },
    { year: 5,  id: 2005, name: "【ストーリー任務】深淵への道",       difficulty: 850,  aptitudes: { combat: 290, magic: 290, exploration: 290 } },
    { year: 6,  id: 2006, name: "【ストーリー任務】失われた王の魂",   difficulty: 1150, aptitudes: { combat: 330, magic: 330, exploration: 330 } },
    { year: 7,  id: 2007, name: "【ストーリー任務】星の詠み手",       difficulty: 1500, aptitudes: { combat: 370, magic: 370, exploration: 370 } },
    { year: 8,  id: 2008, name: "【ストーリー任務】次元の捕食者",     difficulty: 2000, aptitudes: { combat: 400, magic: 400, exploration: 400 } },
    { year: 9,  id: 2009, name: "【ストーリー任務】神々の黄昏",       difficulty: 2800, aptitudes: { combat: 450, magic: 450, exploration: 450 } },
    { year: 10, id: 2010, name: "【ストーリー任務】世界の夜明け",     difficulty: 4000, aptitudes: { combat: 480, magic: 480, exploration: 480 } }
];


// --- DOM要素 ---
const goldEl = document.getElementById('gold');
const adventurerCountEl = document.getElementById('adventurer-count');
const questsEl = document.getElementById('quests');
const adventurerListEl = document.getElementById('adventurer-list');
const scoutAreaEl = document.getElementById('scout-area'); 
const scoutSkillEl = document.getElementById('scout-skill'); 
const questDetailAreaEl = document.getElementById('quest-detail-area'); 

// ★ 先月の記録用DOM要素
const lastMonthLogEl = document.getElementById('last-month-log');
const logContentEl = document.getElementById('log-content');

// --- チュートリアル用DOM要素 ---
const tutorialOverlay = document.getElementById('tutorial-overlay');
const tutorialText = document.getElementById('tutorial-text');

// --- セーブ/ロード用DOM要素 ---
const saveLoadModal = document.getElementById('save-load-modal');
const saveLoadSlots = document.getElementById('save-load-slots');

// --- ユーティリティ関数 ---

/**
 * ランクに応じた色を返します。
 * @param {string} rank - 冒険者のランク
 * @returns {string} CSSカラーコード
 */
function getStyledRankHtml(rank) {
    let color = 'inherit';
    let textShadow = 'none';

    if (rank.startsWith('X') || rank === 'V') {
        color = '#ff00ff'; // Magenta for X ranks
        textShadow = '0 0 5px #ff00ff, 0 0 8px #ff00ff';
    } else {
        switch(rank) {
            case 'S': color = '#FFD700'; textShadow = '0 0 5px #FFD700'; break; // Gold with glow
            case 'A': color = '#FF4500'; break; // Orangered
            case 'B': color = '#9400D3'; break; // DarkViolet
            case 'C': color = '#00BFFF'; break; // DeepSkyBlue
            case 'D': color = '#32CD32'; break; // LimeGreen
            case 'E': color = '#A9A9A9'; break; // DarkGray
            case 'F': color = '#A0522D'; break; // Sienna
            case 'G': color = '#696969'; break; // DimGray
        }
    }
    return `<span class="adventurer-rank" style="color: ${color}; font-weight: bold; text-shadow: ${textShadow};">${rank}</span>`;
}

/**
 * 難易度に応じてクエスト報酬を計算します。
 * @param {Object} quest - クエストオブジェクト
 * @returns {number} 調整後の報酬額
 */
function getQuestReward(quest) {
    const multiplier = DIFFICULTY_SETTINGS[gameDifficulty].questRewardMultiplier;
    return Math.floor(quest.reward * multiplier);
}

/**
 * スキル値に応じたスタイル付きのHTMLを返します。
 * @param {number} skillValue - スキル値
 * @returns {string} HTML文字列
 */
function getStyledSkillHtml(skillValue) {
    if (skillValue > 150) {
        return `<span style="color: #00BFFF; font-weight: bold; text-shadow: 0 0 5px #00BFFF;">${skillValue}</span>`;
    } else if (skillValue > 80) {
        return `<span style="color: orange;">${skillValue}</span>`;
    } else {
        return skillValue;
    }
}

/**
 * 冒険者の最高記録（OVR、ランク、スキル）を更新します。
 * @param {Object} adv - 対象の冒険者オブジェクト
 */
function updateAllTimeRecord(adv) {
    const record = allTimeAdventurers[adv.id];

    if (!record) {
        // 新規登録
        allTimeAdventurers[adv.id] = {
            id: adv.id,
            name: adv.name,
            gender: adv.gender,
            peakOvr: adv.ovr, peakRank: adv.rank,
            attribute: adv.attribute,
            peakAge: adv.age,
            recruitedBy: adv.recruitedBy,
            peakSkills: { ...adv.skills },
            characterColor: adv.characterColor, // ★ カラー情報を追加
        };
    } else {
        // 既存冒険者の最高記録更新チェック
        // OVRが同じかそれ以上の場合に更新（ランクアップを反映するため）
        if (adv.ovr >= record.peakOvr) {
            record.peakOvr = adv.ovr;
            record.peakRank = adv.rank;
            record.peakAge = adv.age;
            record.peakSkills = { ...adv.skills };
            record.attribute = adv.attribute;
            // 名前が変更されている可能性も考慮
            record.name = adv.name;
            record.characterColor = adv.characterColor; // ★ カラー情報を更新
        }
    }
}

/**
 * 基準値と±20の範囲でランダムな能力値を生成し、0～100に収めます。
 * @param {number} base - 基準能力値
 * @returns {number} 調整された能力値 (0-100)
 */
function getRandomSkill(base) {
    let skill = base + Math.floor(Math.random() * 41) - 20;
    return Math.max(0, Math.min(200, skill));
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
function generateAdventurer(baseBonus, policyKey) { 
    // --- 新しい属性とスキルの生成ロジック ---
    // 1. 属性をレア度に基づいて決定
    const rand = Math.random();
    let rarity;
    if (rand < 0.02) rarity = 'Epic';       // 2%
    else if (rand < 0.12) rarity = 'Rare';  // 10%
    else if (rand < 0.42) rarity = 'Uncommon'; // 30%
    else rarity = 'Common';                 // 58%

    const possibleAttributes = Object.keys(ATTRIBUTES).filter(key => ATTRIBUTES[key].rarity === rarity);
    const selectedAttributeKey = possibleAttributes[Math.floor(Math.random() * possibleAttributes.length)];

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
        recruitedBy: policyKey,
        age: age,
        attribute: selectedAttributeKey,
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
        expToLevelUp: 100, // ★ 経験値を100に固定
        characterColor: '#cccccc' // ★ キャラクターカラーの初期値
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
        case 'X': return 3.1;
        case 'XG': return 3.2;
        case 'XF': return 3.3;
        case 'XE': return 3.4;
        case 'XD': return 3.5;
        case 'XC': return 3.6;
        case 'XB': return 3.7;
        case 'XA': return 3.8;
        case 'XS': return 3.9;
        case 'XX': return 4.0;
        case 'V': return 4.5; // 最終ランクは最高の成長率
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
    adv.exp -= 100;
    adv.expToLevelUp = 100; // 常に100で固定

    const skillKeys = ['combat', 'magic', 'exploration'];
    let levelUpMessage = adv.name + " がレベルアップ！ スキル上昇: ";
    let totalIncrease = 0;

    // 1. 基本上昇値 (10-30)
    const baseIncreases = {
        combat: (Math.floor(Math.random() * 3) + 1) * 10,
        magic: (Math.floor(Math.random() * 3) + 1) * 10,
        exploration: (Math.floor(Math.random() * 3) + 1) * 10,
    };

    // 2. 属性によるボーナス
    const attribute = ATTRIBUTES[adv.attribute];
    if (attribute && attribute.bonus) {
        if (attribute.bonus.random) {
            const randomSkill = skillKeys[Math.floor(Math.random() * skillKeys.length)];
            baseIncreases[randomSkill] += attribute.bonus.random * 10;
        } else if (attribute.bonus.lowest) {
            let lowestSkill = 'combat';
            if (adv.skills.magic < adv.skills[lowestSkill]) lowestSkill = 'magic';
            if (adv.skills.exploration < adv.skills[lowestSkill]) lowestSkill = 'exploration';
            baseIncreases[lowestSkill] += attribute.bonus.lowest * 10;
        } else {
            for (const skill of skillKeys) {
                baseIncreases[skill] += (attribute.bonus[skill] || 0) * 10;
            }
        }
    }

    for (const skill of skillKeys) {
        // 最終的な上昇値を計算し、10で割って元のスケールに戻す
        const skillIncrease = Math.round(baseIncreases[skill] / 10);

        // 最大値133を超えないように、実際の上昇値を計算
        const actualIncrease = Math.min(skillIncrease, 200 - adv.skills[skill]);
        
        adv.skills[skill] += actualIncrease;
        adv.ovr += actualIncrease; // OVRも上昇分だけ増やす
        totalIncrease += actualIncrease;

        const skillNameJp = skill === 'combat' ? '戦闘' : skill === 'magic' ? '魔法' : '探索';

        // ★ 最高記録を更新
        updateAllTimeRecord(adv);
        
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
    goldEl.textContent = gold.toLocaleString(); // 3桁区切り
    adventurerCountEl.textContent = adventurers.length;
    scoutSkillEl.textContent = scoutSkill;
    updateScoutButtonCosts(); // ★ スカウトボタンのコスト表示を更新
    renderAdventurerList();
    renderQuests();
}

/**
 * 現在の難易度に応じて、スカウトボタンに表示されるコストを更新します。
 */
function updateScoutButtonCosts() {
    const scoutSection = document.getElementById('scout-controls');
    if (!scoutSection) return;

    const costs = DIFFICULTY_SETTINGS[gameDifficulty].scoutCosts;

    const immediateButton = scoutSection.querySelector('button[onclick="scoutAdventurers(\'immediate\')"]');
    if (immediateButton) immediateButton.textContent = `即戦力重視 (${costs.immediate}万G)`;

    const growthButton = scoutSection.querySelector('button[onclick="scoutAdventurers(\'growth\')"]');
    if (growthButton) growthButton.textContent = `成長重視 (${costs.growth}万G)`;

    const focusedButton = scoutSection.querySelector('button[onclick="scoutAdventurers(\'focused\')"]');
    if (focusedButton) focusedButton.textContent = `集中スカウト (${costs.focused}万G)`;
}

// ★ おすすめ割り当てボタンの表示/非表示を制御
function updateAutoAssignButtonVisibility() {
    const autoAssignWrapper = document.getElementById('auto-assign-wrapper');
    if (autoAssignWrapper) {
        autoAssignWrapper.style.display = (currentMonth === 12) ? 'none' : 'block';
    }
}

/**
 * 派遣予定の任務に基づいた収支予測を計算し、表示します。
 * @param {HTMLElement} containerEl - 描画先のコンテナ要素
 */
function renderProjectionSummary(containerEl) {
    if (questsInProgress.length === 0) {
        containerEl.style.display = 'none';
        return;
    }

    let projectedIncome = 0;
    let projectedSalaryExpense = 0;

    // 1. 派遣予定のクエストからの収入を計算
    questsInProgress.forEach(qData => {
        if (!qData.quest.isPromotion && !qData.quest.isStory) {
            projectedIncome += getQuestReward(qData.quest);
        }
    });

    // 2. 月給の支出を計算 (ストーリー任務の月は支払われない)
    const isStoryQuestMonth = questsInProgress.some(qData => qData.quest.isStory);
    if (!isStoryQuestMonth) {
        adventurers.forEach(adv => {
            projectedSalaryExpense += Math.ceil(adv.annualSalary / 11);
        });
    }

    const netChange = projectedIncome - projectedSalaryExpense;
    const netChangeClass = netChange >= 0 ? 'positive-balance' : 'negative-balance';

    containerEl.innerHTML = `
        <h4>収支予測 (全成功時)</h4>
        <p>収入: ${projectedIncome.toLocaleString()} 万G</p>
        <p>支出: -${projectedSalaryExpense.toLocaleString()} 万G</p>
        <hr>
        <p>合計: <span class="${netChangeClass}">${netChange >= 0 ? '+' : ''}${netChange.toLocaleString()} 万G</span></p>
    `;
    containerEl.style.display = 'block';
}


// --- 冒険者リストの表示 (キャンセルボタンを追加) ---
function renderAdventurerList() {
    adventurerListEl.innerHTML = ''; 

    if (adventurers.length === 0) {
        adventurerListEl.innerHTML = '<div class="adventurer-list-wrapper"><p>現在、ギルドには誰もいません。</p></div>';
        return;
    }

    // OVRの高い順にソート
    const sortedAdventurers = [...adventurers].sort((a, b) => b.ovr - a.ovr);

    // --- メインコンテナとレイアウトの作成 ---
    const wrapper = document.createElement('div');
    wrapper.className = 'adventurer-list-wrapper';

    const tableContainer = document.createElement('div');
    tableContainer.className = 'adventurer-table-container';

    const projectionContainer = document.createElement('div');
    projectionContainer.id = 'adventurer-list-projection';
    projectionContainer.className = 'projection-summary-panel';

    // --- 冒険者テーブルの作成 ---
    const table = document.createElement('table');
    table.className = 'adventurer-main-table';
    table.innerHTML = `
        <tr>
            <th>名前</th>
            <th>性別/年齢</th>
            <th>属性</th>
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

    sortedAdventurers.forEach(adv => {
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
            actionButtons = `
                <button onclick="renameAdventurer(${adv.id})">名前変更</button>
                <button onclick="showColorPalette(${adv.id})">カラー変更</button>
                <button class="retire-button" onclick="retireAdventurer(${adv.id})">引退</button>
            `;
        }

        // ★ 表示用の年俸を「月給 x 11」で再計算
        const monthlySalary = Math.ceil(adv.annualSalary / 11);
        const displayedAnnualSalary = monthlySalary * 11;

        // 属性とスキルの表示
        const attribute = ATTRIBUTES[adv.attribute];
        const textColor = getContrastColor(attribute?.color);
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor};" title="${attribute.description}">${attribute.name}</span>` : 'なし';

        row.innerHTML = `
            <td><span class="adventurer-name" style="border-bottom: 3px solid ${adv.characterColor || '#ccc'}; padding-bottom: 2px;">${adv.name}</span></td>
            <td>${adv.gender}/${adv.age}歳</td>
            <td>${attributeHtml}</td>
            <td>${getStyledRankHtml(adv.rank)}</td>
            <td>${adv.ovr}</td>
            <td>${getStyledSkillHtml(adv.skills.combat)}</td>
            <td>${getStyledSkillHtml(adv.skills.magic)}</td>
            <td>${getStyledSkillHtml(adv.skills.exploration)}</td>
            <td>${displayedAnnualSalary}</td>
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
    tableContainer.appendChild(table);

    // --- 各パーツを組み立て ---
    wrapper.appendChild(tableContainer);
    wrapper.appendChild(projectionContainer);
    adventurerListEl.appendChild(wrapper);

    // --- 収支予測をレンダリング ---
    renderProjectionSummary(projectionContainer);
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

    // ★ 最高記録の名前を更新
    updateAllTimeRecord(adv);
    
    // 表示を更新して変更を反映
    updateDisplay();
}

/**
 * 指定した冒険者のためのカラーパレットを表示します。
 * @param {number} advId - 冒険者のID
 */
function showColorPalette(advId) {
    const adv = adventurers.find(a => a.id === advId);
    if (!adv) return;

    // 既存のパレットがあれば削除
    const existingPalette = document.getElementById('color-palette-modal');
    if (existingPalette) {
        existingPalette.remove();
    }

    const paletteModal = document.createElement('div');
    paletteModal.id = 'color-palette-modal';
    paletteModal.className = 'modal-overlay';

    const paletteContent = document.createElement('div');
    paletteContent.className = 'modal-content';

    paletteContent.innerHTML = `<h3>${adv.name} のカラーを選択</h3>`;

    const colorPickerContainer = document.createElement('div');
    colorPickerContainer.className = 'color-picker-container';

    // カラーピッカーのinput要素を作成
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = 'adv-color-picker';
    colorInput.value = adv.characterColor || '#cccccc'; // 現在の色を初期値として設定

    // ラベルを作成
    const colorLabel = document.createElement('label');
    colorLabel.htmlFor = 'adv-color-picker';
    colorLabel.textContent = '色を自由に選択してください:';

    // 決定ボタンを作成
    const confirmButton = document.createElement('button');
    confirmButton.textContent = '決定';
    confirmButton.className = 'color-picker-confirm-button';
    confirmButton.onclick = () => {
        adv.characterColor = colorInput.value;
        updateAllTimeRecord(adv); // 念のため最高記録も更新
        updateDisplay();
        paletteModal.remove();
    };

    colorPickerContainer.appendChild(colorLabel);
    colorPickerContainer.appendChild(colorInput);

    paletteContent.appendChild(colorPickerContainer);
    paletteContent.appendChild(confirmButton);

    paletteModal.appendChild(paletteContent);
    document.body.appendChild(paletteModal);

    // モーダルの外側をクリックしたら閉じる
    paletteModal.onclick = (e) => {
        if (e.target === paletteModal) {
            paletteModal.remove();
        }
    };
}
/**
 * 冒険者を引退させます。退職金として、その年の残りの月数分の給与を支払います。
 * @param {number} advId - 冒険者のID
 */
function retireAdventurer(advId) {
    const adv = adventurers.find(a => a.id === advId);
    if (!adv) {
        alert('対象の冒険者が見つかりません。');
        return;
    }

    // クエスト予定中の冒険者は引退させられない
    if (adv.status !== '待機中') {
        alert('クエスト予定中の冒険者は引退させられません。');
        return;
    }

    // 退職金の計算
    // その年の残り月数（今月分も含む） x 月給
    const remainingMonths = 12 - currentMonth + 1;
    // ★ 引退時点の最新のOVR/ランクで年俸を再計算して月給を算出
    // 現在の契約年俸から月給を算出
    const monthlySalary = Math.ceil(adv.annualSalary / 11);
    const severancePay = monthlySalary * remainingMonths;

    const confirmationMessage = `冒険者「${adv.name}」を引退させますか？\n\n` +
        `退職金として、今年の残り契約期間分 ${severancePay} 万G が必要です。\n` +
        `（残り${remainingMonths}ヶ月 × 月給${monthlySalary}万G）`;

    if (confirm(confirmationMessage)) {
        if (gold < severancePay) {
            alert(`資金が足りません！ 退職金の支払いに ${severancePay} 万G 必要です。`);
            return;
        }

        // 支払いと引退処理
        gold -= severancePay;
        adventurers = adventurers.filter(a => a.id !== advId);

        alert(`冒険者「${adv.name}」がギルドを去りました。\n退職金として ${severancePay} 万G を支払いました。`);
        
        // 表示を更新
        updateDisplay();
    }
}


// --- スカウト機能 (変更なし) ---
function scoutAdventurers(policyKey) { 
    const policy = SCOUT_POLICIES[policyKey];
    const cost = DIFFICULTY_SETTINGS[gameDifficulty].scoutCosts[policyKey];

    // ★ ハードモードでのスカウト回数制限
    if (gameDifficulty === 'hard' && hasScoutedThisMonth) {
        alert('ハードモードでは、スカウトは1ヶ月に1回しか実行できません。');
        return;
    }

    if (!policy) {
        alert("無効なスカウト方針が選択されました。");
        return;
    }


    if (adventurers.length >= 10) {
        alert('ギルドの人数が上限の10人に達しているため、新しい冒険者をスカウトできません。');
        return;
    }

    if (gold < cost) {
        alert(`資金が足りません。スカウト費用 ${cost} 万Gが必要です。`);
        return;
    }

    // ★ スカウト実行フラグを立てる
    hasScoutedThisMonth = true;

    gold -= cost;
    scoutCandidates = [];
    
    const baseValueCeiling = calculateBaseValue(30, policy.baseBonus); 
    const MAX_OVR_CEILING = Math.round(3 * (baseValueCeiling + 20));

    const MAX_ATTEMPTS = 500;
    let attempts = 0;
    
    while (scoutCandidates.length < policy.limit && attempts < MAX_ATTEMPTS) { 
        const newAdventurer = generateAdventurer(policy.baseBonus, policyKey); 
        
        if (newAdventurer.age >= policy.minAge && newAdventurer.age <= policy.maxAge) {
             scoutCandidates.push(newAdventurer);
        }
        attempts++;
    }

    alert(`${policy.name}（${cost} 万G）を適用しました。`
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
            <th>属性</th>
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

        // 属性とスキルの表示
        const attribute = ATTRIBUTES[candidate.attribute];
        const textColor = getContrastColor(attribute?.color);
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor};" title="${attribute.description}">${attribute.name}</span>` : 'なし';

        row.innerHTML = `
            <td><input type="checkbox" name="candidate" value="${candidate.id}" data-cost="${candidate.joinCost}"></td>
            <td>${candidate.name}</td>
            <td>${candidate.gender}/${candidate.age}歳</td>
            <td>${attributeHtml}</td>
            <td><span style="font-weight: bold; color: ${isOverScoutSkill ? 'red' : 'inherit'};">${candidate.ovr}</span></td>
            <td>${getStyledSkillHtml(candidate.skills.combat)}</td>
            <td>${getStyledSkillHtml(candidate.skills.magic)}</td>
            <td>${getStyledSkillHtml(candidate.skills.exploration)}</td>
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
        <button class="cancel-scout-button" onclick="cancelScout()">スカウトを中断・キャンセルする</button>
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
    
    if (adventurers.length + selectedIds.length > 10) {
        alert(`ギルドの最大人数は10人です。現在の所属人数: ${adventurers.length}人。\n${selectedIds.length}人加入させると上限を超えてしまいます。`);
        return;
    }

    if (gold < totalCost) {
        alert(`資金が足りません。合計加入費用 ${totalCost} 万Gが必要です。（現在資金: ${gold} 万G）`);
        return;
    }

    gold -= totalCost;
    
    const selectedAdventurers = scoutCandidates.filter(c => selectedIds.includes(c.id));
    adventurers.push(...selectedAdventurers);

    // ★ 新メンバーを最高記録に登録
    selectedAdventurers.forEach(adv => {
        updateAllTimeRecord(adv);
    });
    
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

    // ★ おすすめ割り当てボタンの表示を更新
    updateAutoAssignButtonVisibility();

    // ★ 12月はストーリー任務のみ表示
    if (currentMonth === 12) {
        // その年のストーリー任務を取得
        const storyQuest = getStoryQuestForYear(currentYear);
        // ストーリー任務が既に派遣予定に入っているか確認
        const isStoryQuestInProgress = questsInProgress.some(qData => qData.quest.id === storyQuest?.id);

        if (storyQuest && !isStoryQuestInProgress) { // ★ 派遣予定に入っていない場合のみ表示
            const questDiv = document.createElement('div');
            questDiv.className = 'quest-item story-quest'; // 特別なクラスを付与
            questDiv.innerHTML = `
                <h3>${storyQuest.name}</h3>
                <p style="color: #ff4757; font-weight: bold;">【警告】この任務に失敗するとゲームオーバーです。</p> 
                <p><strong>報酬:</strong> ???</p>
                <p><strong>適正能力 (難易度合計: ${storyQuest.difficulty})</strong></p>
                <ul>
                    <li>戦闘: ${storyQuest.aptitudes.combat}</li>
                    <li>魔法: ${storyQuest.aptitudes.magic}</li>
                    <li>探索: ${storyQuest.aptitudes.exploration}</li>
                </ul>
                <button onclick="showQuestSelection(${storyQuest.id})">
                    派遣メンバーを選択
                </button>
            `;
            questsEl.appendChild(questDiv);
        } else {
            // ストーリー任務がない、または既に派遣予定の場合のメッセージ
            const message = isStoryQuestInProgress 
                ? '<p>ストーリー任務は派遣予定です。結果は「Next Month」で確認できます。</p>'
                : '<p>今年のストーリー任務はありません。</p>';
            questsEl.innerHTML = message;
        }
        return; // 通常クエストの描画をスキップ
    }

    let hasAvailableQuest = false;

    // --- 昇級試験クエストの生成とソート ---
    const promotionExams = [];
    adventurers.forEach(adv => {
        if (adv.status === '待機中' && adv.rank !== 'V') {
            const currentRankIndex = RANKS.indexOf(adv.rank);
            const nextRank = RANKS[currentRankIndex + 1];
            const requiredDifficulty = PROMOTION_DIFFICULTIES[adv.rank];
            
            const promotionQuest = {
                id: 1000 + adv.id,
                name: `${adv.name} の昇級試験 (${adv.rank} → ${nextRank})`,
                reward: 0,
                difficulty: requiredDifficulty,
                aptitudes: { combat: '無関係', magic: '無関係', exploration: '無関係' }, 
                isPromotion: true,
                adv: adv, // 冒険者オブジェクトを保持
                nextRank: nextRank // ★ 昇級後のランクを保持
            };
            // 合格率を計算して追加
            promotionQuest.estimatedRate = calculateSuccessRate(promotionQuest, [adv]);
            promotionExams.push(promotionQuest);
        }
    });

    // 合格確率の高い順にソート。確率が同じ場合は難易度が高い順にソート。
    promotionExams.sort((a, b) => {
        // 最初に合格率で比較（降順）
        if (b.estimatedRate !== a.estimatedRate) {
            return b.estimatedRate - a.estimatedRate;
        }
        // 合格率が同じなら、難易度で比較（降順）
        return b.difficulty - a.difficulty;
    });

    // --- ソートされた昇級試験の表示 ---
    promotionExams.forEach(pQuest => {
        const adv = pQuest.adv;
        if (adv) {
            const questDiv = document.createElement('div');
            questDiv.className = 'quest-item promotion-exam';
            const statusColor = pQuest.estimatedRate >= 0.7 ? 'green' : (pQuest.estimatedRate >= 0.5 ? 'orange' : 'red');

            questDiv.innerHTML = `
                <h4>🎓 昇級試験: ${pQuest.name}</h4>
                <p><strong>目標OVR:</strong> ${pQuest.difficulty} / **${adv.name} のOVR: ${adv.ovr}**</p>
                <p><strong>成功率目安:</strong> <span style="font-weight:bold; color:${statusColor};">${Math.round(pQuest.estimatedRate * 100)}%</span></p>
                <p style="font-size:0.9em;">※この任務は**${adv.name}単独**で挑みます。成功すると${pQuest.nextRank}ランクに昇級します。</p>
                <button onclick="showQuestSelection(${pQuest.id}, ${adv.id})">
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
            <p>報酬: ${getQuestReward(quest)} 万G</p>
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
    let quest, nextRank;
    // 昇級試験の判定はID >= 1000 または targetAdvId があるかで判断する
    const isPromotion = questId >= 1000 && targetAdvId !== null;
    // ★ ストーリー任務の判定 (IDが2000番台)
    const isStoryQuest = questId >= 2001 && questId <= 2010;

    if (isPromotion) {
        const adv = adventurers.find(a => a.id === targetAdvId);
        if (!adv || adv.rank === 'V') return; // ★ Sランクでも試験を受けられるように修正 (Vランクは最終)
        
        const currentRankIndex = RANKS.indexOf(adv.rank);
        nextRank = RANKS[currentRankIndex + 1];
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
        // ★ ストーリー任務の場合
        if (isStoryQuest) {
            quest = getStoryQuestForYear(currentYear); // 年から取得
            quest.reward = 0; // 報酬はなし
            quest.isStory = true; // ★ ストーリー任務フラグ
        } else {
            // 通常クエストの場合
            quest = quests.find(q => q.id === questId);
        }
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

    const maxAdventurers = quest.isPromotion ? 1 : 4; // ★ ストーリーも4人まで
    const selectionInfo = quest.isPromotion 
        ? `<p style="color:red; font-weight:bold;">この試験は${adventurers.find(a => a.id === targetAdvId).name}単独での受験となります。他メンバーは選択できません。</p>`
        : quest.isStory
        ? `<p style="color:red; font-weight:bold;">ギルドの存亡をかけた戦いです。待機中のメンバーから精鋭を選び、任務に挑みます (最大${maxAdventurers}名)。</p>`
        : `<p><strong>派遣する冒険者を選択してください (最大${maxAdventurers}名):</strong></p>`;

    const rewardText = quest.isStory ? '任務成功で次年へ' : `${getQuestReward(quest)} 万G`;
    const difficultyText = quest.isPromotion ? `目標OVR: ${quest.difficulty}` : `適正能力 (目標合計: ${quest.difficulty})`;


    questDetailAreaEl.innerHTML += `
        <p><strong>報酬:</strong> ${rewardText}</p>
        <p><strong>${difficultyText}</strong></p>
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
            <button id="send-quest-button" ${quest.isPromotion ? 'class="promotion-dispatch-button"' : (quest.isStory ? 'class="story-dispatch-button"' : '')} onclick="sendAdventurersToQuest(${quest.id}, ${quest.isPromotion}, ${quest.isPromotion ? targetAdvId : null})" disabled>派遣予定に入れる</button>
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


        row.innerHTML = `
            <td><input type="checkbox" name="quest-adv-select" value="${adv.id}" ${checked}></td>
            <td><span class="adventurer-name" style="border-bottom: 3px solid ${adv.characterColor || '#ccc'}; padding-bottom: 2px;">${adv.name}</span></td>
            <td>${getStyledRankHtml(adv.rank)}</td>
            <td>${adv.ovr}</td>
            <td>${getStyledSkillHtml(adv.skills.combat)}</td>
            <td>${getStyledSkillHtml(adv.skills.magic)}</td>
            <td>${getStyledSkillHtml(adv.skills.exploration)}</td>
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
 * 待機中の冒険者に自動で任務を割り当てます。
 */
function autoAssignQuests() {
    const availableAdventurers = adventurers.filter(adv => adv.status === '待機中');

    if (availableAdventurers.length === 0) {
        alert('任務を割り当てられる待機中の冒険者がいません。');
        return;
    }

    let assignedCount = 0;
    const unassignedAdventurers = [...availableAdventurers];

    // --- フェーズ1: 成功率90%超の単独任務を探す ---
    for (const adv of availableAdventurers) {
        let bestSoloQuest = null;
        let maxDifficulty = -1;

        // 利用可能な通常クエストをフィルタリング
        const availableQuests = quests.filter(q => {
            if (!q.available) return false;
            if (q.requiredRank) {
                const requiredRankIndex = RANKS.indexOf(q.requiredRank);
                const advRankIndex = RANKS.indexOf(adv.rank);
                return advRankIndex >= requiredRankIndex;
            }
            return true;
        });

        for (const quest of availableQuests) {
            const successRate = calculateSuccessRate(quest, [adv]);
            if (successRate > 0.9) {
                if (quest.difficulty > maxDifficulty) {
                    maxDifficulty = quest.difficulty;
                    bestSoloQuest = quest;
                }
            }
        }

        if (bestSoloQuest) {
            // 最適な単独任務に派遣
            sendAdventurersToQuestInternal(bestSoloQuest, [adv]);
            // 未割り当てリストから削除
            const index = unassignedAdventurers.findIndex(u => u.id === adv.id);
            if (index > -1) {
                unassignedAdventurers.splice(index, 1);
            }
            assignedCount++;
        }
    }

    // --- フェーズ2: 残った冒険者を共同任務に参加させる ---
    if (unassignedAdventurers.length > 0 && questsInProgress.length > 0) {
        for (const adv of unassignedAdventurers) {
            // 参加可能な共同任務を探す (4人未満)
            const joinableQuests = questsInProgress.filter(qData => !qData.quest.isPromotion && qData.adventurers.length < 4);

            if (joinableQuests.length > 0) {
                // 成功率が最も低く、同じ場合は難易度が最も高い任務を選ぶ
                joinableQuests.sort((a, b) => {
                    if (a.rate !== b.rate) {
                        return a.rate - b.rate; // 成功率の昇順
                    }
                    return b.quest.difficulty - a.quest.difficulty; // 難易度の降順
                });

                const targetQuestData = joinableQuests[0];
                
                // 冒険者を追加してステータスと成功率を更新
                targetQuestData.adventurers.push(adv);
                adv.status = `クエスト予定: ${targetQuestData.quest.name}`;
                targetQuestData.rate = calculateSuccessRate(targetQuestData.quest, targetQuestData.adventurers);
                
                assignedCount++;
            }
        }
    }

    if (assignedCount > 0) {
        alert(`${assignedCount}人の冒険者に任務を割り当てました。`);
        updateDisplay();
    } else {
        alert('条件に合う任務が見つからず、誰も割り当てられませんでした。');
    }
}

/**
 * [内部処理用] 冒険者をクエストに派遣予定に入れる
 * @param {Object} quest - クエストオブジェクト
 * @param {Array} sentAdventurers - 派遣する冒険者の配列
 */
function sendAdventurersToQuestInternal(quest, sentAdventurers) {
    quest.available = false;
    const successRate = calculateSuccessRate(quest, sentAdventurers);
    sentAdventurers.forEach(adv => adv.status = `クエスト予定: ${quest.name}`);
    questsInProgress.push({
        quest: quest,
        adventurers: sentAdventurers,
        rate: successRate
    });
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
    // 昇級試験・ストーリー任務はEXP半減
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
            const ageMultiplier = getAgeMultiplier(adv.age); // 年齢倍率
            const rankMultiplier = getRankMultiplier(adv.rank); // ★ ランク倍率を追加
            const traitExpModifier = 1.0; // 旧特性システム廃止のため1.0に固定

            const totalMultiplier = ageMultiplier * rankMultiplier * traitExpModifier; // ★ 合計倍率
            const individualExp = Math.round(gainedBaseExp * totalMultiplier * expModifier);
            
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
        // 通常・ストーリークエストは最大4人
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
    const checkedCheckboxes = document.querySelectorAll('#quest-candidate-table input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.value));
    const sentAdventurers = adventurers.filter(adv => selectedIds.includes(adv.id));

    let quest; // ★関数のスコープで変数を宣言
    // ★ ストーリー任務の判定
    const isStoryQuest = questId >= 2001 && questId <= 2010;

    if (isPromotion) {
        const adv = sentAdventurers[0];
        if (!adv) return;
        const currentRankIndex = RANKS.indexOf(adv.rank);
        const nextRank = RANKS[currentRankIndex + 1];
        quest = { // ★constを削除し、変数に代入する
            id: questId,
            name: `${adv.name} の昇級試験 (${adv.rank} → ${nextRank})`,
            difficulty: PROMOTION_DIFFICULTIES[adv.rank],
            isPromotion: true,
        };
        sendAdventurersToQuestInternal(quest, sentAdventurers);
    } else if (isStoryQuest) {
        quest = getStoryQuestForYear(currentYear);
        quest.isStory = true;
        sendAdventurersToQuestInternal(quest, sentAdventurers);

    } else {
        quest = quests.find(q => q.id === questId); // ★constを削除し、変数に代入する
        if (!quest) return;
        sendAdventurersToQuestInternal(quest, sentAdventurers);
    }

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
    // ★ 12月の場合、ストーリー任務がセットされているかチェック
    if (currentMonth === 12) {
        const hasStoryQuestInProgress = questsInProgress.some(qData => qData.quest.isStory);
        if (!hasStoryQuestInProgress) {
            alert('【ストーリー任務】が派遣予定に入っていません。\nギルドの存亡をかけた任務です。必ずメンバーを派遣してください。');
            return; // 処理を中断
        }
    }


    const previousMonth = currentMonth;
    const previousYear = currentYear;
    let yearEndMessage = '';
    
    let summaryMessage = `【${previousYear}年 ${previousMonth}月の収支報告】\n\n`;
    let totalIncome = 0;
    let totalExpense = 0;

    // ★ この月にストーリー任務が実行されたかどうかのフラグ
    const wasStoryQuestMonth = questsInProgress.some(qData => qData.quest.isStory);
    
    // 1. 進行中のクエストの結果を処理
    if (questsInProgress.length > 0) {
        const questResults = processQuestsResults();
        summaryMessage += questResults.message;
        totalIncome += questResults.income;
        totalExpense += questResults.expense;
    } else {
        summaryMessage += "前月に派遣予定のクエストはありませんでした。\n";
    }

    // 2. 冒険者への給与支払い処理 (ストーリー任務の月は支払わない)
    let monthlySalaryExpense = 0;
    if (!wasStoryQuestMonth) {
        monthlySalaryExpense = payMonthlySalary();
        totalExpense += monthlySalaryExpense;
    }

    // 3. 年末処理 (給与支払いの後に行う)
    if (previousMonth === 12) {
        yearEndMessage = processYearEnd();
        currentYear++;
        currentMonth = 1;
    } else {
        currentMonth++;
    }
    
    // 4. 加齢による能力低下処理
    const agingMessage = processAgingEffects();
    if (agingMessage) {
        summaryMessage += agingMessage;
    }

    // 年末処理メッセージを追加 (クエストがなかった場合)
    if (yearEndMessage && questsInProgress.length === 0) {
        summaryMessage += yearEndMessage; // クエスト結果がなくても年末処理メッセージは表示
    } else if (yearEndMessage) {
        summaryMessage += yearEndMessage; // クエスト結果があっても年末処理メッセージは表示
    }
    
    summaryMessage += `\n-----------------------\n`;
    summaryMessage += `💰 月給支払額: -${monthlySalaryExpense} 万G\n`;
    summaryMessage += `総収支: +${totalIncome} 万G (収入) -${totalExpense} 万G (支出) = ${totalIncome - totalExpense} 万G\n`;
    summaryMessage += `次月資金: ${gold} 万G`;

    // 6. クエストのリセット（全て復活）
    quests.forEach(q => q.available = true);
    
    // ★ スカウト回数をリセット
    hasScoutedThisMonth = false;

    // 資金不足チェック
    if (gold < 0) {
        showGameOverScreen();
        return; // ゲームオーバーなので以降の処理は行わない
    } else {
        // ★ 先月の記録をページに表示
        if (logContentEl && lastMonthLogEl) {
            // メッセージ内の強調マーク(**)を削除して表示
            logContentEl.textContent = summaryMessage.replace(/\*\*/g, '');
            lastMonthLogEl.style.display = 'block';
        }
        alert("新しい月になりました！");
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
        // 昇級試験・ストーリー任務はEXP半減
        const expModifier = quest.isPromotion ? 0.5 : 1.0; 
        let totalGainedExp = 0;

        sentAdventurers.forEach(adv => {
            const ageMultiplier = getAgeMultiplier(adv.age); // 年齢倍率
            const rankMultiplier = getRankMultiplier(adv.rank); // ★ ランク倍率を追加
            const traitExpModifier = 1.0; // 旧特性システム廃止のため1.0に固定

            const totalMultiplier = ageMultiplier * rankMultiplier * traitExpModifier; // ★ 合計倍率
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
            // ★ ストーリー任務成功
            if (quest.isStory) {
                // 10年目クリアでゲームクリア
                if (currentYear === 10) {
                    showGameClearScreen();
                    return; // ゲームクリアなのでここで処理を終了
                }
                resultMessage = `✅ 成功: ギルドは存続し、新年を迎えることができます！ (獲得EXP(平均): ${averageGainedExp}P)`;
                // 報酬はないが、メッセージとして表示
                promotionMessages.push(`🎉 【${quest.name}】に成功しました！`);

            } else if (quest.isPromotion) {
                // 昇級試験成功
                const adv = sentAdventurers[0];
                const currentRankIndex = RANKS.indexOf(adv.rank);
                const nextRank = RANKS[currentRankIndex + 1];
                
                // 昇級処理
                adv.rank = nextRank; 
                promotionMessages.push(`🎉 ${adv.name} は昇級試験に合格し、【${nextRank}】に昇級しました！ (EXP+${averageGainedExp}P)`);
                // ★ 最高記録を更新
                updateAllTimeRecord(adv);

                resultMessage = `✅ 成功: 昇級！`;

            } else {
                // 通常クエスト成功
                const actualReward = getQuestReward(quest);
                gold += actualReward;
                totalIncome += actualReward;
                resultMessage = `✅ 成功: +${actualReward} 万G (獲得EXP(平均): ${averageGainedExp}P)`;
            }

        } else {
            // ★ ストーリー任務失敗 → ゲームオーバー
            if (quest.isStory) {
                showGameOverScreen(`【${quest.name}】に失敗... ギルドの挑戦はここで終わりを告げた。`);
                return; // ゲームオーバーなのでここで処理を終了
            }


            if (quest.isPromotion) {
                // 昇級試験失敗
                const adv = sentAdventurers[0];
                promotionMessages.push(`😥 ${adv.name} は昇級試験に失敗しました。次月以降に再挑戦できます。 (EXP+${averageGainedExp}P)`);
                resultMessage = `❌ 失敗: 昇級できず`;

            } else {
                // 通常クエスト失敗
                const penalty = Math.floor(getQuestReward(quest) / 2);
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
        const monthlySalary = Math.ceil(adv.annualSalary / 11); 
        totalMonthlySalary += monthlySalary;
    });
    
    gold -= totalMonthlySalary; 
    
    return totalMonthlySalary;
}

/**
 * 年齢による能力の低下を処理します。35歳を超えた冒険者は毎月能力が低下します。
 * @returns {string} 能力低下のサマリーメッセージ
 */
function processAgingEffects() {
    let agingMessages = [];
    adventurers.forEach(adv => {
        if (adv.age > 35) {
            let decreasedSkills = [];
            let totalDecrease = 0;

            // 各スキルを1ずつ減少させる（最低値は0）
            if (adv.skills.combat > 0) {
                adv.skills.combat--;
                totalDecrease++;
                decreasedSkills.push('戦闘');
            }
            if (adv.skills.magic > 0) {
                adv.skills.magic--;
                totalDecrease++;
                decreasedSkills.push('魔法');
            }
            if (adv.skills.exploration > 0) {
                adv.skills.exploration--;
                totalDecrease++;
                decreasedSkills.push('探索');
            }

            if (totalDecrease > 0) {
                // OVRを更新
                adv.ovr -= totalDecrease;
                agingMessages.push(`・${adv.name}(${adv.age}歳)は加齢により能力が低下しました (${decreasedSkills.join('/')} -1)。`);
            }
        }
    });

    if (agingMessages.length > 0) {
        return `\n**【加齢による能力変化】**\n` + agingMessages.join('\n') + '\n';
    }
    return '';
}

/**
 * ゲームオーバー画面を表示します。
 */
function showGameOverScreen(customMessage = null) {
    const mainContent = document.getElementById('main-content');
    const gameOverReason = customMessage 
        ? customMessage 
        : 'ギルドの資金が底を尽き、運営を続けることができなくなりました...';

    mainContent.innerHTML = `
        <h1>Game Over</h1>
        <p>${gameOverReason}</p>
        <h2>ギルドの殿堂</h2>
        <p>今回のプレイで活躍した冒険者たちです。「殿堂入り」ボタンを押すと、その冒険者の記録が永続的に保存されます。</p>
        <div id="hall-of-fame"></div>
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="location.reload()">もう一度プレイする</button>
        </div>
    `;

    renderHallOfFameTable('hall-of-fame');
}

function showGameClearScreen() {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <h1>Congratulations!</h1>
        <p>10年にわたるギルドの物語は、輝かしい勝利と共に幕を閉じました。<br>あなたの導きによって、ギルドの名は伝説として永遠に語り継がれるでしょう！</p>
        <h2>ギルドの殿堂</h2>
        <p>今回のプレイで活躍した冒険者たちです。「殿堂入り」ボタンを押すと、その冒険者の記録が永続的に保存されます。</p>
        <div id="hall-of-fame"></div>
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="location.reload()">もう一度プレイする</button>
        </div>
    `;

    renderHallOfFameTable('hall-of-fame');
}

/**
 * ゲームオーバー/クリア画面に殿堂テーブルを描画します。
 * @param {string} containerId - 描画先のコンテナID
 */
function renderHallOfFameTable(containerId) {
    const hallOfFameEl = document.getElementById(containerId);
    if (Object.keys(allTimeAdventurers).length === 0) {
        hallOfFameEl.innerHTML = '<p>ギルドには誰も所属していませんでした...</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>名前</th>
            <th>性別</th>
            <th>属性</th>
            <th>最高ランク</th>
            <th>最高OVR</th>
            <th>戦闘</th>
            <th>魔法</th>
            <th>探索</th>
            <th>達成年齢</th>
            <th>獲得方法</th>
            <th>操作</th>
        </tr>
    `;

    // OVRが高い順にソートして表示
    const sortedRecords = Object.values(allTimeAdventurers).sort((a, b) => b.peakOvr - a.peakOvr);

    sortedRecords.forEach(record => {
        const row = table.insertRow();
        
        // ★ 属性表示用のHTMLを生成
        const attribute = ATTRIBUTES[record.attribute];
        const textColor = getContrastColor(attribute?.color);
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor};" title="${attribute.description}">${attribute.name}</span>` : 'なし';

        row.innerHTML = `
            <td><span class="adventurer-name" style="border-bottom: 3px solid ${record.characterColor || '#ccc'}; padding-bottom: 2px;">${record.name}</span></td>
            <td>${record.gender}</td><td>${attributeHtml}</td><td>${getStyledRankHtml(record.peakRank)}</td>
            <td>${record.peakOvr}</td>
            <td>${record.peakSkills.combat}</td>
            <td>${record.peakSkills.magic}</td>
            <td>${record.peakSkills.exploration}</td>
            <td>${record.peakAge}歳</td>
            <td>${SCOUT_POLICIES[record.recruitedBy]?.name || '不明'}</td>
            <td><button id="induct-btn-${record.id}" onclick="inductToHallOfFame(${record.id})">殿堂入り</button></td>
        `;
    });

    hallOfFameEl.appendChild(table);
}

/**
 * 指定された冒険者をギルドの殿堂に登録します。
 * @param {number} advId - 殿堂入りさせる冒険者のID
 */
function inductToHallOfFame(advId) {
    const recordToInduct = allTimeAdventurers[advId];
    if (!recordToInduct) return;

    // 既存の殿堂データを取得
    const pastRecords = JSON.parse(localStorage.getItem('guildSoulHallOfFame') || '{}');
    
    // 新しい記録を追加または更新
    pastRecords[advId] = recordToInduct;

    // localStorageに保存
    localStorage.setItem('guildSoulHallOfFame', JSON.stringify(pastRecords));

    // ボタンを無効化してフィードバック
    const button = document.getElementById(`induct-btn-${advId}`);
    button.textContent = '殿堂入り済';
    button.disabled = true;
    alert(`「${recordToInduct.name}」をギルドの殿堂に登録しました。`);
}

// --- チュートリアル機能 ---

function startTutorial() {
    isInTutorial = true;
    tutorialStep = 1;
    showTutorialStep(tutorialStep);
}

function advanceTutorial() {
    tutorialStep++;
    showTutorialStep(tutorialStep);
}

function endTutorial() {
    isInTutorial = false;
    tutorialStep = 0;
    if (tutorialOverlay) {
        tutorialOverlay.style.display = 'none';
    }
    // 全てのハイライトを解除
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
    // チュートリアルで無効化したボタンを有効に戻す
    const disabledButtons = document.querySelectorAll('.tutorial-disabled');
    disabledButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('tutorial-disabled');
    });
    localStorage.setItem('guildSoulTutorialCompleted', 'true');
}

function showTutorialStep(step) {
    if (!tutorialOverlay) return;

    // 既存のハイライトを全て解除
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
        // 以前のステップで追加したリスナーを全て削除
        const newEl = el.cloneNode(true);
        if (el.parentNode) {
            el.parentNode.replaceChild(newEl, el);
        }
    });

    tutorialOverlay.style.display = 'flex';
    const messageBox = document.getElementById('tutorial-message-box');

    switch (step) {
        case 1: // スカウト誘導
            {
                const target = document.getElementById('scout-section');
                const immediateButton = target.querySelector('button[onclick="scoutAdventurers(\'immediate\')"]');
                const growthButton = target.querySelector('button[onclick="scoutAdventurers(\'growth\')"]');
                const focusedButton = target.querySelector('button[onclick="scoutAdventurers(\'focused\')"]');

                target.classList.add('tutorial-highlight');

                // 集中スカウトを無効化
                focusedButton.disabled = true;
                focusedButton.classList.add('tutorial-disabled');

                immediateButton.addEventListener('click', advanceTutorial, { once: true });
                growthButton.addEventListener('click', advanceTutorial, { once: true });
                tutorialText.textContent = 'ようこそギルドマスター！まずは冒険者を探しましょう。「即戦力重視」か「成長重視」を選んでください。';
                break;
            }
        case 2: // 加入誘導
            {
                const target = document.getElementById('scout-area');
                const candidateTable = document.getElementById('candidate-table');
                const joinButton = document.getElementById('join-button');
                if (target && candidateTable && joinButton) {
                    target.classList.add('tutorial-highlight');

                    const onJoinClickAndAdvance = () => {
                        joinButton.removeEventListener('click', onJoinClickAndAdvance);
                        advanceTutorial();
                    };

                    joinButton.addEventListener('click', onJoinClickAndAdvance);

                    tutorialText.textContent = '素晴らしい候補者が見つかりましたね！ギルドに迎えたい冒険者を選んで、「加入させる」ボタンを押しましょう。';
                }
                break;
            }
        case 3: // 任務割り当て誘導
            {
                const target = document.getElementById('auto-assign-wrapper');
                target.classList.add('tutorial-highlight');
                const assignButton = target.querySelector('button');
                if (assignButton) {
                    assignButton.addEventListener('click', advanceTutorial, { once: true });
                }
                tutorialText.textContent = '頼もしい仲間が増えました！「おすすめ任務を割り当て」ボタンで、彼らに効率よく仕事を割り振りましょう。';
                break;
            }
        case 4: // Next Month誘導
            {
                const target = document.getElementById('time-controls');
                target.classList.add('tutorial-highlight');
                const nextButton = target.querySelector('button[onclick="nextMonth()"]');
                if (nextButton) {
                    nextButton.addEventListener('click', endTutorial, { once: true });
                }
                tutorialText.textContent = '準備は万端です！「Next Month」ボタンを押して時間を進め、クエストの結果を確認しましょう。';
                break;
            }
        default:
            endTutorial();
            break;
    }
}


// --- ホーム画面機能 ---

/**
 * ゲームを開始します。
 * @param {boolean} withTutorial - チュートリアルを実行するかどうか
 * @param {string} difficulty - 'easy' または 'hard'
 * ※ この関数はホーム画面の最終選択から呼び出される
 */
function startGame(withTutorial, difficulty) {
    const homeScreen = document.getElementById('home-screen');
    const gameContainer = document.getElementById('game-container');
    gameDifficulty = selectedDifficulty; // ★ ホーム画面で選択された難易度を反映
    if (homeScreen) homeScreen.style.display = 'none'; // ホーム画面全体を非表示に
    if (gameContainer) gameContainer.style.display = 'block';

    // ゲーム状態をリセット
    gold = 500;
    adventurers = [];
    scoutCandidates = [];
    scoutSkill = 100;
    questsInProgress = [];
    nextAdventurerId = 1;
    currentMonth = 1;
    currentYear = 1;
    allTimeAdventurers = {};

    // ゲームの初期表示を更新
    updateAutoAssignButtonVisibility();
    updateDisplay();

    // ログ表示を隠す
    if (lastMonthLogEl) {
        lastMonthLogEl.style.display = 'none';
    }

    if (withTutorial) {
        startTutorial();
    }
    alert(`難易度「${DIFFICULTY_SETTINGS[gameDifficulty].name}」でゲームを開始します。`);
}

/**
 * 過去の記録（ギルドの殿堂）を表示します。
 */
function showPastRecords() {
    const pastRecords = JSON.parse(localStorage.getItem('guildSoulHallOfFame') || '{}');

    const homeScreen = document.getElementById('home-screen');
    homeScreen.innerHTML = `
        <h2>過去の記録 - ギルドの殿堂</h2>
        <div id="hall-of-fame-container"></div>
        <div style="text-align: center; margin-top: 30px;">
            <button onclick="location.reload()">ホームに戻る</button>
        </div>
    `;
    renderHallOfFame(pastRecords, 'hall-of-fame-container');
}

/**
 * 指定された冒険者をギルドの殿堂から削除します。
 * @param {number} advId - 削除する冒険者のID
 */
function removeFromHallOfFame(advId) {
    const pastRecords = JSON.parse(localStorage.getItem('guildSoulHallOfFame') || '{}');
    const recordToRemove = pastRecords[advId];

    if (!recordToRemove) {
        alert('削除対象の記録が見つかりません。');
        return;
    }

    if (confirm(`「${recordToRemove.name}」の記録を殿堂から完全に削除しますか？\nこの操作は元に戻せません。`)) {
        delete pastRecords[advId];
        localStorage.setItem('guildSoulHallOfFame', JSON.stringify(pastRecords));
        alert(`「${recordToRemove.name}」の記録を削除しました。`);

        // 表示を再描画
        showPastRecords();
    }
}

/**
 * ギルドの殿堂を描画します。
 * @param {Object} records - 表示する冒険者の記録
 * @param {string} containerId - 描画先のコンテナID
 */
function renderHallOfFame(records, containerId) {
    const container = document.getElementById(containerId);
    if (Object.keys(records).length === 0) {
        container.innerHTML = '<p>まだギルドの歴史に刻まれた冒険者はいません。</p>';
        return;
    }
    
    const table = document.createElement('table');
    table.innerHTML = `
        <tr><th>名前</th><th>性別</th><th>属性</th><th>最高ランク</th><th>最高OVR</th>
            <th>戦闘</th><th>魔法</th><th>探索</th><th>達成年齢</th><th>獲得方法</th><th>操作</th>
        </tr>
    `;

    const sortedRecords = Object.values(records).sort((a, b) => b.peakOvr - a.peakOvr);

    sortedRecords.forEach(record => {
        const row = table.insertRow();
        
        // ★ 属性表示用のHTMLを生成
        const attribute = ATTRIBUTES[record.attribute];
        const textColor = getContrastColor(attribute?.color);
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor};" title="${attribute.description}">${attribute.name}</span>` : 'なし';

        row.innerHTML = `
            <td><span class="adventurer-name" style="border-bottom: 3px solid ${record.characterColor || '#ccc'}; padding-bottom: 2px;">${record.name}</span></td><td>${record.gender}</td><td>${attributeHtml}</td><td>${getStyledRankHtml(record.peakRank)}</td>
            <td>${record.peakOvr}</td><td>${record.peakSkills.combat}</td>
            <td>${record.peakSkills.magic}</td><td>${record.peakSkills.exploration}</td>
            <td>${record.peakAge}歳</td><td>${SCOUT_POLICIES[record.recruitedBy]?.name || '不明'}</td>
            <td><button onclick="removeFromHallOfFame(${record.id})">削除</button></td>
        `;
    });

    container.appendChild(table);
}

// --- セーブ/ロード機能 ---

/**
 * 現在のゲーム状態をオブジェクトとして取得します。
 * @param {string} dataName - セーブデータの名前
 * @param {string} memo - セーブデータに関するメモ
 * @returns {Object} ゲーム状態オブジェクト
 */
function getGameState(dataName, memo) {
    return {
        dataName: dataName || `無題のデータ`,
        difficulty: gameDifficulty, // ★ 難易度を保存
        memo: memo || '',
        gold,
        adventurers,
        scoutCandidates,
        scoutSkill,
        questsInProgress,
        nextAdventurerId,
        currentMonth,
        currentYear,
        allTimeAdventurers,
        quests: quests.map(q => ({ id: q.id, available: q.available })), // クエストの利用可能状態のみ保存
        saveDate: new Date().toLocaleString('ja-JP')
    };
}

/**
 * 指定されたゲーム状態オブジェクトからゲームを復元します。
 * @param {Object} gameState - ゲーム状態オブジェクト
 */
function loadGameState(gameState) {
    gameDifficulty = gameState.difficulty || 'hard'; // ★ 難易度をロード
    gold = gameState.gold;
    adventurers = gameState.adventurers;
    scoutCandidates = gameState.scoutCandidates;
    scoutSkill = gameState.scoutSkill;
    // ★ ロード時に questsInProgress の参照を再構築する
    questsInProgress = gameState.questsInProgress.map(qData => {
        // 冒険者オブジェクトの参照を現在のadventurersリストから再取得
        const rehydratedAdventurers = qData.adventurers.map(savedAdv => 
            adventurers.find(adv => adv.id === savedAdv.id)
        ).filter(Boolean); // 見つからなかった冒険者を除外

        // クエストオブジェクトの参照を現在のクエストリストから再取得
        let rehydratedQuest = quests.find(q => q.id === qData.quest.id);
        if (!rehydratedQuest) {
            // 昇級試験やストーリー任務の場合、元のリストには存在しないため、保存されたオブジェクトをそのまま使う
            rehydratedQuest = qData.quest;
        }

        return { ...qData, quest: rehydratedQuest, adventurers: rehydratedAdventurers };
    });

    nextAdventurerId = gameState.nextAdventurerId;
    currentMonth = gameState.currentMonth;
    currentYear = gameState.currentYear;
    allTimeAdventurers = gameState.allTimeAdventurers;

    // クエストの利用可能状態を復元
    gameState.quests.forEach(savedQuest => {
        const quest = quests.find(q => q.id === savedQuest.id);
        if (quest) {
            quest.available = savedQuest.available;
        }
    });

    // --- UIの完全リセットと再描画 ---
    // 1. ホーム画面を隠し、ゲームコンテナを表示
    const homeScreen = document.getElementById('home-screen');
    const gameContainer = document.getElementById('game-container');
    if (homeScreen) homeScreen.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'block';

    // 2. チュートリアルやセーブ/ロードモーダルなど、他の表示を全て閉じる
    if (tutorialOverlay) tutorialOverlay.style.display = 'none';
    if (saveLoadModal) saveLoadModal.style.display = 'none';
    if (lastMonthLogEl) lastMonthLogEl.style.display = 'none';

    // 3. スカウト画面やクエスト詳細画面を閉じてから、メインの表示を更新する
    cancelScout(); // スカウト画面をリセット
    cancelQuestSelection(); // クエスト詳細画面をリセット (内部でupdateDisplayが呼ばれる)

    alert('ゲームデータをロードしました。');

}

/**
 * セーブ/ロード用のモーダルウィンドウを表示します。
 * @param {'save' | 'load'} mode - 'save' または 'load'
 */
function showSaveLoadModal(mode) {
    saveLoadSlots.innerHTML = '';
    const title = mode === 'save' ? 'セーブするスロットを選択' : 'ロードするスロットを選択';
    document.getElementById('save-load-title').textContent = title;

    for (let i = 1; i <= 3; i++) {
        const slotKey = `guildSoulSaveSlot${i}`;
        const savedData = JSON.parse(localStorage.getItem(slotKey) || 'null');

        const slotDiv = document.createElement('div');
        slotDiv.className = 'save-slot';

        let slotInfo = `<h4>スロット ${i}</h4>`;
        if (savedData) {
            slotInfo += `
                <p class="save-data-name">${savedData.dataName || '無題のデータ'}</p>
                <p class="save-data-memo">難易度: ${DIFFICULTY_SETTINGS[savedData.difficulty]?.name || '不明'} | ${savedData.memo || 'メモはありません'}</p>
                <p class="save-data-details">${savedData.currentYear}年 ${savedData.currentMonth}月 / 所持金: ${savedData.gold}万G</p>
                <p class="save-data-date">保存日時: ${savedData.saveDate}</p>
            `;
        } else {
            slotInfo += '<p>空きスロット</p>';
        }

        const actionButton = document.createElement('button');
        if (mode === 'save') {
            actionButton.textContent = savedData ? '上書き保存' : 'セーブ';
            actionButton.onclick = () => saveGame(i);
        } else {
            actionButton.textContent = 'ロード';
            actionButton.disabled = !savedData;
            actionButton.onclick = () => loadGame(i);
        }

        slotDiv.innerHTML = slotInfo;
        slotDiv.appendChild(actionButton);
        saveLoadSlots.appendChild(slotDiv);
    }

    saveLoadModal.style.display = 'flex';
}

function closeSaveLoadModal() {
    saveLoadModal.style.display = 'none';
}

function saveGame(slot) {
    const defaultName = `${currentYear}年${currentMonth}月 ギルドデータ`;
    const dataName = prompt(`セーブデータの名前を入力してください（スロット${slot}）`, defaultName);
    // ユーザーがキャンセルした場合は処理を中断
    if (dataName === null) {
        return;
    }

    const memo = prompt("このセーブデータに関するメモを残しますか？（任意）", "");
    // ユーザーがキャンセルした場合は処理を中断
    if (memo === null) {
        return;
    }

    const gameState = getGameState(dataName, memo);
    localStorage.setItem(`guildSoulSaveSlot${slot}`, JSON.stringify(gameState));
    alert(`「${dataName}」をスロット${slot}にセーブしました。`);
    showSaveLoadModal('save'); // モーダルを再描画して更新を反映
}

function loadGame(slot) {
    const savedData = localStorage.getItem(`guildSoulSaveSlot${slot}`);
    if (savedData) {
        if (!confirm(`スロット${slot}のデータをロードしますか？\n現在のゲーム内容は失われます。`)) return;
        loadGameState(JSON.parse(savedData));
        closeSaveLoadModal();
    } else {
        alert('このスロットにはセーブデータがありません。');
    }
}

// --- 新しいタイトル画面機能 ---

/**
 * お洒落なタイトル画面を生成し、表示します。
 */
function renderStylishHomeScreen() {
    const homeScreen = document.getElementById('home-screen');
    if (!homeScreen) return;

    // Google Fontsを動的に読み込み
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Noto+Serif+JP:wght@400;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);

    // スタイルを動的に追加
    const style = document.createElement('style');
    style.textContent = `
        #home-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #2c3e50, #4a69bd);
            color: #ecf0f1;
            text-align: center;
            font-family: 'Noto Serif JP', serif;
            overflow: hidden;
        }
        .home-title {
            font-family: 'Cinzel', serif;
            font-size: 5rem;
            font-weight: 700;
            text-shadow: 3px 3px 8px rgba(0,0,0,0.5);
            margin-bottom: 10px;
            animation: fadeInDown 1s ease-out;
        }
        .home-subtitle {
            font-size: 1.5rem;
            margin-bottom: 40px;
            color: #bdc3c7;
            animation: fadeInUp 1s ease-out 0.5s;
            animation-fill-mode: backwards;
        }
        .home-menu {
            display: flex;
            flex-direction: column;
            gap: 15px;
            animation: fadeInUp 1s ease-out 1s;
            animation-fill-mode: backwards;
        }
        .home-menu button {
            background-color: transparent;
            border: 2px solid #ecf0f1;
            color: #ecf0f1;
            padding: 12px 30px;
            font-size: 1.1rem;
            font-family: 'Noto Serif JP', serif;
            cursor: pointer;
            transition: all 0.3s ease;
            min-width: 250px;
        }
        .home-menu button:hover {
            background-color: #ecf0f1;
            color: #2c3e50;
            transform: translateY(-3px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .talent-trait {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px; /* 背景色とテキスト色は動的に設定 */
            font-size: 0.8em;
            margin: 1px;
            border: 1px solid #888;
        }
        .rarity-common {
            /* No special effect */
        }
        .rarity-uncommon {
            text-shadow: 0 0 4px currentColor; /* 多少輝く */
        }
        .rarity-rare {
            font-weight: bold;
            background-image: linear-gradient(to bottom, rgba(255,255,255,0.2), rgba(0,0,0,0.2));
            text-shadow: 0 0 8px currentColor; /* より輝く */
        }
        .rarity-epic {
            font-weight: bold;
            background: linear-gradient(135deg, #c0392b, #8e44ad, #2c3e50); /* エフェクト */
            text-shadow: 0 0 3px #fff, 0 0 8px currentColor, 0 0 12px currentColor; /* 強い輝き */
            border-color: #f1c40f;
        }
        .adventurer-list-wrapper {
            display: flex;
            gap: 20px;
            align-items: flex-start;
        }
        .adventurer-table-container {
            flex-grow: 1;
        }
        .projection-summary-panel {
            width: 280px;
            flex-shrink: 0;
            background-color: #34495e;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #7f8c8d;
        }
        .projection-summary-panel h4 {
            margin-top: 0;
            border-bottom: 1px solid #7f8c8d;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .positive-balance { color: #2ecc71; }
        .negative-balance { color: #e74c3c; }

        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    // HTMLを生成
    homeScreen.innerHTML = `
        <h1 class="home-title">Guild Soul</h1>
        <p class="home-subtitle">- ギルド運営シミュレーション -</p>
        <div id="main-menu" class="home-menu">
            <button onclick="showDifficultySelection()">はじめから</button>
            <button onclick="showSaveLoadModal('load')">ロード</button>
            <button onclick="showPastRecords()">過去の記録</button>
        </div>
        <div id="difficulty-selection" class="home-menu" style="display: none;">
            <h3>難易度を選択してください</h3>
            <button onclick="showTutorialSelection('easy')">
                イージー
                <span style="display: block; font-size: 0.8em; color: #bdc3c7;">(スカウト費用割引 / クエスト報酬1.5倍)</span>
            </button>
            <button onclick="showTutorialSelection('hard')">
                ハード
                <span style="display: block; font-size: 0.8em; color: #bdc3c7;">(現在のバージョンと同じ難易度です)</span>
            </button>
            <button onclick="showMainMenu()" style="margin-top: 20px;">戻る</button>
        </div>
        <div id="tutorial-selection" class="home-menu" style="display: none;">
            <h3>チュートリアルをプレイしますか？</h3>
            <button onclick="startGame(true, selectedDifficulty)">チュートリアル有り</button>
            <button onclick="startGame(false, selectedDifficulty)">チュートリアル無し</button>
            <button onclick="backToDifficultySelection()" style="margin-top: 20px;">難易度選択に戻る</button>
        </div>
    `;

    // ゲーム画面が表示されていた場合は非表示にする
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.style.display = 'none';
    }
    homeScreen.style.display = 'flex';
}

/**
 * 指定された年のストーリー任務オブジェクトを取得します。
 * イージーモードの場合、難易度を調整します。
 * @param {number} year - 対象の年
 * @returns {Object | undefined} 調整後のストーリー任務オブジェクト
 */
function getStoryQuestForYear(year) {
    const originalQuest = STORY_QUESTS.find(sq => sq.year === year);
    if (!originalQuest) {
        return undefined;
    }

    // 難易度に応じてコピーを作成して返す
    const questCopy = JSON.parse(JSON.stringify(originalQuest));

    if (gameDifficulty === 'easy') {
        const multiplier = 0.75;
        questCopy.difficulty = Math.floor(questCopy.difficulty * multiplier);
        questCopy.aptitudes.combat = Math.floor(questCopy.aptitudes.combat * multiplier);
        questCopy.aptitudes.magic = Math.floor(questCopy.aptitudes.magic * multiplier);
        questCopy.aptitudes.exploration = Math.floor(questCopy.aptitudes.exploration * multiplier);
    }

    return questCopy;
}

/**
 * タイトル画面でチュートリアル選択を表示します。
 * @param {string} difficulty - 'easy' または 'hard'
 */
function showTutorialSelection(difficulty) {
    selectedDifficulty = difficulty; // 選択された難易度を保持
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('tutorial-selection').style.display = 'flex';
}

/**
 * チュートリアル選択画面から難易度選択画面に戻ります。
 */
function backToDifficultySelection() {
    document.getElementById('tutorial-selection').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'flex';
}


/**
 * タイトル画面で難易度選択を表示します。
 */
function showDifficultySelection() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'flex';
}

/**
 * タイトル画面でメインメニューに戻ります。
 */
function showMainMenu() {
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}
// --- 初期化 ---
document.addEventListener('DOMContentLoaded', () => {
    // ゲーム開始はボタンクリックで行うため、ここでは何もしない
    renderStylishHomeScreen();
});
