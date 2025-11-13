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
let isOffseason = false; // オフシーズン中かどうかのフラグ
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

// --- アバター関連の定義 ---
// アバターパーツの定義
// total: 全ファイル数
// female_end: 女性用パーツの最後の番号 (1からこの番号までが女性用)
const AVATAR_PART_DEFINITIONS = {
    face: { total: 2, female_end: 1 }, // 1が女性、(1+1)以降が男性
    hair: { total: 11, female_end: 9 }, // 1-4が女性、5-8が男性
    back: { total: 6, female_end: 5 }, // 1-3が女性、4-5が男性
    eyes: { total: 4, female_end: 3 }, // 1-2が女性、3が男性
    ears: { total: 3, female_end: 3 }, // 1-2が女性、3が男性
};

/**
 * 性別に基づいてアバターパーツのファイル名を選択する
 * @param {string} partType - 'face', 'hair'などのパーツ種別
 * @param {string} gender - '女性' または '男性'
 * @returns {string} ファイル名 (例: 'hair-5')
 */
function selectAvatarPart(partType, gender) {
    const def = AVATAR_PART_DEFINITIONS[partType];
    if (!def) return `${partType}-1`; // 定義がなければデフォルト

    let start, count;
    if (gender === '女性') {
        start = 1;
        count = def.female_end;
    } else { // 男性
        start = def.female_end + 1;
        count = def.total - def.female_end;
    }

    // もし男性用パーツが存在しない場合、女性用を流用する
    if (count <= 0) {
        start = 1;
        count = def.female_end;
    }

    const partNumber = Math.floor(Math.random() * count) + start;
    return `${partType}-${partNumber}`;
}
// 属性名とCSSフィルターのhue-rotateで使う基本色相（角度）をマッピング
const ELEMENT_HUES = {
    '炎': 0, '烈火': 0, '爆炎': 0, '太陽': 0, '終焉': 0,
    '水': 220, '流水': 220, '渦潮': 220,
    '氷': 180, '氷結': 180,
    '雷': 50, '電光': 50, '轟雷': 50,
    '風': 120, '疾風': 120, '嵐': 120,
    '土': 40, '大地': 40, 'ガイア': 40,
    '光': 60, '聖光': 60, '神聖': 60, '月': 240, '創生': 60, '奇跡': 330,
    '闇': 280, '常闇': 280, '深淵': 280, '混沌': 260, '虚無': 270,
    '岩': 30, '鋼': 210, '機': 200,
    '毒': 300, '水晶': 300, '獣': 35, '霊': 260, '竜': 15, '幻': 280, '時': 200, '星': 230
};

// ★ 属性名と髪色の明るさ(brightness)をマッピング
const ELEMENT_BRIGHTNESS = {
    '炎': 1.2, '烈火': 1.3, '爆炎': 1.4, '太陽': 1.6, '終焉': 1.3,
    '水': 1.0, '流水': 1.0, '渦潮': 1.0,
    '氷': 1.1, '氷結': 1.1,
    '雷': 1.4, '電光': 1.5, '轟雷': 1.6,
    '風': 1.0, '疾風': 1.0, '嵐': 1.0,
    '土': 0.9, '大地': 0.9, 'ガイア': 0.9,
    '光': 1.5, '聖光': 1.7, '神聖': 1.8, '月': 1.2, '創生': 1.6, '奇跡': 2.0,
    '闇': 0.8, '常闇': 0.7, '深淵': 0.6, '混沌': 0.8, '虚無': 0.7,
    '岩': 0.9, '鋼': 1.1, '機': 1.1,
    '毒': 1.0, '水晶': 1.2, '獣': 1.1, '霊': 1.1, '竜': 1.2, '幻': 1.1, '時': 1.1, '星': 1.3
};

// --- レート対戦用 固有スキル定義 ---
const ATTRIBUTE_UNIQUE_SKILLS = {
    // --- 炎属性 ---
    '炎': { name: '炎の心', description: 'OVRで負けている時、自身のOVRを+50する。', condition: (diff) => diff < 0, effect: 50 },
    '烈火': { name: '烈火の怒り', description: 'OVRで40以上負けている時、自身のOVRを+80する。', condition: (diff) => diff <= -40, effect: 80 },
    '爆炎': { name: '爆炎の魂', description: 'OVRで60以上負けている時、自身のOVRを+120する。', condition: (diff) => diff <= -60, effect: 120 },
    // --- 水属性 ---
    '水': { name: '水の鏡', description: 'OVRで勝っている時、自身のOVRを+15する。', condition: (diff) => diff > 0, effect: 15 },
    '流水': { name: '流水の構え', description: 'OVRで40以上勝っている時、自身のOVRを+20する。', condition: (diff) => diff >= 40, effect: 10 },
    '渦潮': { name: '渦潮の支配', description: 'OVRで60以上勝っている時、自身のOVRを+30する。', condition: (diff) => diff >= 60, effect: 30 },
    // --- 氷属性 ---
    '氷': { name: '氷の壁', description: 'OVRが相手と同じか近い時(差が±30以内)、自身のOVRを+30する。', condition: (diff) => Math.abs(diff) <= 30, effect: 30 },
    '氷結': { name: '氷結の鎧', description: 'OVRが相手と同じか近い時(差が±20以内)、自身のOVRを+40する。', condition: (diff) => Math.abs(diff) <= 20, effect: 40 },
    // --- 雷属性 ---
    '雷': { name: '雷鳴', description: 'OVRで負けている時、自身のOVRを+50する。', condition: (diff) => diff < 0, effect: 50 },
    '電光': { name: '電光石火', description: 'OVRで40以上負けている時、自身のOVRを+80する。', condition: (diff) => diff <= -40, effect: 80 },
    '轟雷': { name: '轟雷の咆哮', description: 'OVRで60以上負けている時、自身のOVRを+120する。', condition: (diff) => diff <= -60, effect: 120 },
    // --- 風属性 ---
    '風': { name: '風の舞', description: 'OVRで勝っている時、自身のOVRを+15する。', condition: (diff) => diff > 0, effect: 15 },
    '疾風': { name: '疾風迅雷', description: 'OVRで40以上勝っている時、自身のOVRを+20する。', condition: (diff) => diff >= 40, effect: 20 },
    '嵐': { name: '嵐の目', description: 'OVRで60以上勝っている時、自身のOVRを+30する。', condition: (diff) => diff >= 60, effect: 30 },
    // --- 土属性 ---
    '土': { name: '不動', description: 'OVRが相手と同じか近い時(差が±30以内)、自身のOVRを+30する。', condition: (diff) => Math.abs(diff) <= 30, effect: 30 },
    '大地': { name: '大地の守り', description: 'OVRが相手と同じか近い時(差が±20以内)、自身のOVRを+40する。', condition: (diff) => Math.abs(diff) <= 20, effect: 40 },
    'ガイア': { name: 'ガイアの祝福', description: 'OVRが相手と同じか近い時(差が±10以内)、自身のOVRを+50する。', condition: (diff) => Math.abs(diff) <= 10, effect: 50 },
    // --- 光・闇属性 ---
    '光': { name: '光の導き', description: 'OVRで勝っている時、自身のOVRを+15する。', condition: (diff) => diff > 0, effect: 15 },
    '聖光': { name: '聖光の奇跡', description: 'OVRで40以上勝っている時、自身のOVRを+20する。', condition: (diff) => diff >= 40, effect: 20 },
    '神聖': { name: '神聖なる力', description: 'OVRで60以上勝っている時、自身のOVRを+30する。', condition: (diff) => diff >= 60, effect: 30 },
    '闇': { name: '闇の契約', description: 'OVRで負けている時、自身のOVRを+50する。', condition: (diff) => diff < 0, effect: 50 },
    '常闇': { name: '常闇の帳', description: 'OVRで40以上負けている時、自身のOVRを+80する。', condition: (diff) => diff <= -40, effect: 80 },
    '深淵': { name: '深淵の呼び声', description: 'OVRで60以上負けている時、自身のOVRを+120する。', condition: (diff) => diff <= -60, effect: 120 },
    // --- 特殊属性 (Common/Uncommon) ---
    '岩': { name: '岩の意志', description: 'OVRが相手と同じか近い時(差が±30以内)、自身のOVRを+30する。', condition: (diff) => Math.abs(diff) <= 30, effect: 30 },
    '鋼': { name: '鋼の精神', description: 'OVRが相手と同じか近い時(差が±20以内)、自身のOVRを+40する。', condition: (diff) => Math.abs(diff) <= 20, effect: 40 },
    '毒': { name: '猛毒', description: 'OVRで負けている時、自身のOVRを+50する。', condition: (diff) => diff < 0, effect: 50 },
    '水晶': { name: '水晶の輝き', description: 'OVRで勝っている時、自身のOVRを+15する。', condition: (diff) => diff > 0, effect: 15 },
    '獣': { name: '獣の咆哮', description: 'OVRで負けている時、自身のOVRを+55する。', condition: (diff) => diff < 0, effect: 55 },
    '霊': { name: '霊の囁き', description: 'OVRで勝っている時、自身のOVRを+15する。', condition: (diff) => diff > 0, effect: 15 },
    // --- 特殊属性 (Rare) ---
    '竜': { name: '竜の血脈', description: 'OVRで50以上負けている時、自身のOVRを+100する。', condition: (diff) => diff <= -50, effect: 100 },
    '混沌': { name: '混沌の渦', description: 'OVRの差に関わらず、自身のOVRを+10する。', condition: (diff) => true, effect: 10 },
    '幻': { name: '幻惑', description: 'OVRで勝っている時、自身のOVRを+15する。', condition: (diff) => diff > 0, effect: 15 },
    '機': { name: 'オーバークロック', description: 'OVRが相手と同じか近い時(差が±25以内)、自身のOVRを+35する。', condition: (diff) => Math.abs(diff) <= 25, effect: 35 },
    '時': { name: 'タイムリープ', description: 'OVRで70以上負けている時、自身のOVRを+140する。', condition: (diff) => diff <= -70, effect: 140 },
     // --- 特殊属性 (Epic) ---
    '太陽': { name: 'プロミネンス', description: 'OVRで80以上負けているとき、自身のOVRを+160する。', condition: (diff) => diff <= -80, effect: 160 },
    '月': { name: '月光の加護', description: 'OVRで勝っているが、差が30未満しかないとき、自身のOVRを+40する。', condition: (diff) => diff > 0 && diff < 30, effect: 40 },
    '星': { name: '星の導き', description: 'OVRが相手と同じか近い時(差が±50以内)、自身のOVRを+20する。', condition: (diff) => Math.abs(diff) <= 50, effect: 20 },
    '虚無': { name: '虚無の波動', description: 'OVRで負けているが、差が30未満しかないとき、自身のOVRを+60する。', condition: (diff) => diff < 0 && diff > -30, effect: 60 },
    '創生': { name: '創生の息吹', description: 'OVRで100以上勝っているとき、自身のOVRを+50する。', condition: (diff) => diff >= 100, effect: 50 },
    '終焉': { name: '終焉の宣告', description: 'OVRの相手との差が50以上の時、自身のOVRを+80する。', condition: (diff) => Math.abs(diff) >= 50, effect: 80 },
    '奇跡': { name: '奇跡の大逆転', description: 'OVRで100以上負けているとき、自身のOVRを+200する。', condition: (diff) => diff <= -100, effect: 200 },
};

// --- アバターパーツの位置と大きさの設定 ---
const AVATAR_PART_CONFIG = {
    // 各パーツのデフォルトスタイル
    defaults: {
        back: { top: '-60%', left: '-48%', width: '200%', zIndex: 5 }, // 後ろ髪のスタイルを追加
        face: { top: '5%', left: '7.5%', width: '90%', zIndex: 20 },
        ears: { top: '27%', left: '-1.15%', width: '108%', zIndex: 10 },
        eyes: { top: '31.5%', left: '14.28%', width: '72%', zIndex: 30 },
        hair: { top: '-20.7%', left: '5%', width: '96.5%', zIndex: 40 }, // 前髪
    },
    // 特定のファイルに対する上書きスタイル
    overrides: {
        // 例: 'hair-2' の位置を少し上にずらす場合
        // 'hair-2': { top: '-15%' }, 
    }
};

function getPartStyle(partType, partFileName) {
    const defaultStyle = AVATAR_PART_CONFIG.defaults[partType] || {};
    const overrideStyle = AVATAR_PART_CONFIG.overrides[partFileName] || {};
    return { ...defaultStyle, ...overrideStyle };
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

// OVRからランクを決定するための閾値
const RANK_OVR_THRESHOLDS = {
    'G': 0,
    'F': 50,
    'E': 75,
    'D': 100,
    'C': 125,
    'B': 150,
    'A': 200,
    'S': 250,
    'X': 300,
    'XG': 330,
    'XF': 360,
    'XE': 390,
    'XD': 420,
    'XC': 450,
    'XB': 480,
    'XA': 510,
    'XS': 540,
    'XX': 570,
    'V': 600
};

/**
 * OVRから冒険者のランクを決定します。
 * @param {number} ovr - 総合能力値 (OVR)
 * @returns {string} 冒険者のランク
 */
function getRankFromOVR(ovr) {
    return RANKS.slice().reverse().find(rank => ovr >= (RANK_OVR_THRESHOLDS[rank] ?? Infinity)) || 'G';
}


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

/**
 * 指定された年のストーリー任務オブジェクトを取得します。
 * @param {number} year - 年
 * @returns {Object|undefined} ストーリー任務オブジェクト、または見つからない場合はundefined
 */
function getStoryQuestForYear(year) {
    return STORY_QUESTS.find(q => q.year === year);
}


// --- DOM要素 ---
let goldEl = document.getElementById('gold');
let adventurerCountEl = document.getElementById('adventurer-count');
let questsEl = document.getElementById('quests');
let adventurerListEl = document.getElementById('adventurer-list');
let scoutAreaEl = document.getElementById('scout-area');
let scoutSkillEl = document.getElementById('scout-skill');
let questDetailAreaEl = document.getElementById('quest-detail-area');

// ★ 先月の記録用DOM要素
let lastMonthLogEl = document.getElementById('last-month-log');
let logContentEl = document.getElementById('log-content');

// --- チュートリアル用DOM要素 ---
let tutorialOverlay = document.getElementById('tutorial-overlay');
let tutorialText = document.getElementById('tutorial-text');

// --- セーブ/ロード用DOM要素 ---
let saveLoadModal = document.getElementById('save-load-modal');
let saveLoadSlots = document.getElementById('save-load-slots');

// --- ユーティリティ関数 ---

/**
 * ランクに応じた色を返します。
 * @param {string} rank - 冒険者のランク
 * @returns {string} CSSカラーコード
 */
function getStyledRankHtml(rank) {
    let color = 'inherit';
    let textShadow = 'none';

    const xRanks = ['X', 'XG', 'XF', 'XE', 'XD', 'XC', 'XB', 'XA', 'XS', 'XX', 'V'];
    const xRankIndex = xRanks.indexOf(rank);

    if (xRankIndex !== -1) {
        // ピンク (#ff00ff) から 水色 (#00ffff) へのグラデーションを計算
        const totalSteps = xRanks.length - 1;
        const step = xRankIndex / totalSteps;

        // RGB値を線形補間
        const r = Math.round(255 * (1 - step));
        const g = Math.round(255 * step);
        const b = 255;

        // 16進数カラーコードに変換
        const toHex = (c) => ('0' + c.toString(16)).slice(-2);
        color = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

        // テキストシャドウも色に合わせて変更
        textShadow = `0 0 5px ${color}, 0 0 8px ${color}`;

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
            avatar: { ...adv.avatar }, // ★ アバター情報を追加
            isInherited: adv.isInherited || false // ★ 引継ぎフラグを保存
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
            record.avatar = { ...adv.avatar }; // ★ アバター情報を更新
            record.isInherited = adv.isInherited || record.isInherited || false; // ★ 引継ぎフラグを更新
        }
    }
}

/**
 * 基準値と±20の範囲でランダムな能力値を生成し、0～100に収めます。
 * @param {number} base - 基準能力値
 * @returns {number} 調整された能力値 (0-100)
 */
function getRandomSkill(base) {
    const skill = base + Math.floor(Math.random() * 41) - 20;
    return Math.max(0, skill);
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

// 名前リスト (グローバルスコープに移動)
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

// ランダムな冒険者のデータを生成 (名前リストは省略せず全文記載)
function generateAdventurer(policyKey) {
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

    // ★★★ スカウト方針に基づいて年齢を決定 ★★★
    const policy = SCOUT_POLICIES[policyKey];
    const minAge = policy.minAge;
    const maxAge = policy.maxAge;

    // 選択された属性に基づいて、アバターの色相と明るさを一度だけ決定
    const attribute = ATTRIBUTES[selectedAttributeKey];
    const originalAttributeName = attribute?.name.replace('+', '');
    const baseHue = ELEMENT_HUES[originalAttributeName] ?? null;
    const brightness = ELEMENT_BRIGHTNESS[originalAttributeName] ?? 1.0;

    const advHairHue = baseHue !== null ? baseHue + (Math.random() * 20 - 10) : 0;
    const advEyesHue = baseHue !== null ? baseHue + (Math.random() * 20 - 10) : 0;

    const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;

    const genders = ['男性', '女性'];
    const selectedGender = genders[Math.floor(Math.random() * genders.length)];
    let selectedName = selectedGender === '女性' 
        ? namesFemale[Math.floor(Math.random() * namesFemale.length)]
        : namesMale[Math.floor(Math.random() * namesMale.length)];

    const baseValue = calculateBaseValue(age, policy.baseBonus);
    
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

    // アバターパーツをランダムに選択
    const avatar = {
        face: selectAvatarPart('face', selectedGender),
        hair: selectAvatarPart('hair', selectedGender),
        back: selectAvatarPart('back', selectedGender),
        eyes: selectAvatarPart('eyes', selectedGender), // アバターパーツの画像ファイル名
        ears: selectAvatarPart('ears', selectedGender),
        hairHue: advHairHue, // 生成された髪の色相を保存
        eyesHue: advEyesHue, // 生成された目の色相を保存
        brightness: brightness // 生成された明るさを保存
    };


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
        expToLevelUp: 100,
        avatar: avatar, // アバター情報と生成された色相・明るさ情報を追加
        characterColor: '#cccccc' // ★ キャラクターカラーの初期値
    };
}

/** 
 * 冒険者の年齢に基づき、獲得経験値の倍率を返します。
 * @param {number} age - 冒険者の年齢
 * @returns {number} 経験値倍率
 */
function getAgeMultiplier(age) {
    // ★ 年齢がnull（引継ぎ冒険者）の場合は倍率1.0を返す
    if (age === null) return 1.0;

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
        const actualIncrease = skillIncrease;

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

    // --- 収支予測の表示 ---
    // コンテナがなければ作成してscout-sectionに追加する
    let projectionContainer = document.getElementById('projection-summary-container');
    if (!projectionContainer) {
        projectionContainer = document.createElement('div');
        projectionContainer.id = 'projection-summary-container';
        projectionContainer.className = 'projection-summary-panel'; // スタイルを適用
        const scoutSection = document.getElementById('scout-section');
        if (scoutSection) {
            scoutSection.appendChild(projectionContainer);
        }
    }
    renderProjectionSummary(projectionContainer);
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
    if (!containerEl) return; // ★ コンテナがない場合は何もしない
    if (questsInProgress.length === 0) {
        containerEl.style.display = 'none';
        return;
    }

    let projectedIncome = 0;
    let projectedSalaryExpense = 0;

    // 1. 派遣予定のクエストからの収入を計算
    questsInProgress.forEach(qData => {
        if (!qData.quest.isPromotion && !qData.quest.isStory && !qData.quest.isTraining) {
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
    const showAvatars = document.getElementById('show-avatars').checked;
    adventurerListEl.innerHTML = '';
    adventurerListEl.className = 'adventurer-grid-container'; // 新しいグリッドコンテナクラスを適用

    if (adventurers.length === 0) {
        adventurerListEl.innerHTML = '<p>現在、ギルドには誰もいません。</p>';
        return;
    }

    // OVRの高い順にソート
    const sortedAdventurers = [...adventurers].sort((a, b) => b.ovr - a.ovr);

    sortedAdventurers.forEach(adv => {
        const card = document.createElement('div');
        card.className = 'adventurer-info-card';

        // 状態に応じてクラスを追加
        const isScheduled = adv.status.startsWith('クエスト予定');
        if (isScheduled) {
            card.classList.add('in-quest');
        }

        // 属性とレアリティに応じた背景クラスを追加
        const attribute = ATTRIBUTES[adv.attribute];
        if (adv.isInherited) {
            card.classList.add('rarity-bg-inherited');
        } else if (attribute) {
            card.classList.add(`rarity-bg-${attribute.rarity.toLowerCase()}`);
        } else {
            card.classList.add('rarity-bg-common');
        }

        // --- カードの中身を生成 ---

        // 1. ヘッダー部分 (名前、ランク、OVR)
        let nameStyle = `border-bottom: 3px solid ${adv.characterColor || '#ccc'}; padding-bottom: 2px;`;
        if (adv.isInherited) {
            nameStyle += `color: #FFD700; text-shadow: 0 0 5px #FFD700, 0 0 8px #FFD700;`;
        }
        const headerHtml = `
            <div class="adv-card-header">
                <span class="adventurer-name" style="${nameStyle}">${adv.name}</span>
                <span>${getStyledRankHtml(adv.rank)} (OVR: ${adv.ovr})</span>
            </div>
        `;

        // 2. アバター
        let avatarHtml = '';
        if (showAvatars && adv.avatar) {
            const hairHue = adv.avatar.hairHue ?? 0;
            const eyesHue = adv.avatar.eyesHue ?? 0;
            const brightness = adv.avatar.brightness ?? 1.0;
            const faceStyle = getPartStyle('face', adv.avatar.face);
            const backStyle = getPartStyle('back', adv.avatar.back);
            const earsStyle = getPartStyle('ears', adv.avatar.ears);
            const eyesStyle = getPartStyle('eyes', adv.avatar.eyes);
            const hairStyle = getPartStyle('hair', adv.avatar.hair);
            const hairFilter = `hue-rotate(${hairHue}deg) saturate(1.5) brightness(${brightness})`;
            hairStyle.filter = hairFilter;
            backStyle.filter = hairFilter;
            eyesStyle.filter = `hue-rotate(${eyesHue}deg) saturate(2) brightness(${brightness * 0.9})`;
            const styleToString = (styleObj) => Object.entries(styleObj).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`).join(';');
            avatarHtml = `
                <div class="adv-card-avatar">
                    <div class="avatar-container">
                        <img src="avatar_parts/back/${adv.avatar.back}.svg" class="avatar-part" style="${styleToString(backStyle)}">
                        <img src="avatar_parts/face/${adv.avatar.face}.svg" class="avatar-part" style="${styleToString(faceStyle)}">
                        <img src="avatar_parts/ears/${adv.avatar.ears}.svg" class="avatar-part" style="${styleToString(earsStyle)}">
                        <img src="avatar_parts/hair/${adv.avatar.hair}.svg" class="avatar-part" style="${styleToString(hairStyle)}">
                        <img src="avatar_parts/eyes/${adv.avatar.eyes}.svg" class="avatar-part" style="${styleToString(eyesStyle)}">
                    </div>
                </div>
            `;
        } else {
             avatarHtml = `<div class="adv-card-avatar"></div>`; // アバター非表示でもレイアウトが崩れないように空のdivを配置
        }

        // 3. ステータス詳細
        const textColor = getContrastColor(attribute?.color);
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor}; cursor: pointer;" onclick="showAttributeDetails('${adv.attribute}')">${attribute.name}</span>` : 'なし';
        const monthlySalary = Math.ceil(adv.annualSalary / 11);
        const displayedAnnualSalary = monthlySalary * 11;
        const statsHtml = `
            <div class="adv-card-stats">
                <p>属性: ${attributeHtml} | ${adv.gender}/${adv.age !== null ? adv.age + '歳' : '伝説'}</p>
                <p>戦闘: ${getStyledSkillHtml(adv.skills.combat)} | 魔法: ${getStyledSkillHtml(adv.skills.magic)} | 探索: ${getStyledSkillHtml(adv.skills.exploration)}</p>
                <p>年俸: ${displayedAnnualSalary}万G | 状態: ${adv.status}</p>
            </div>
        `;

        // 4. 経験値バー
        const expPercentage = Math.min(100, (adv.exp / adv.expToLevelUp) * 100);
        const expHtml = `
            <div class="adv-card-exp">
                <span>EXP: ${adv.isInherited ? '---' : `${adv.exp} / ${adv.expToLevelUp}`}</span>
                <div class="exp-bar-container" style="width: 100%; margin: 5px 0 0 0;">
                    <div class="exp-bar" style="width: ${expPercentage}%;"></div>
                </div>
            </div>
        `;

        // 5. フッター (操作ボタン)
        let buttonsHtml = '';
        if (isScheduled) {
            const questNameMatch = adv.status.match(/クエスト予定: (.+)/);
            const fullQuestName = questNameMatch ? questNameMatch[1] : '';
            buttonsHtml = `<button onclick="cancelScheduledQuest(${adv.id}, '${fullQuestName}')">予定をキャンセル</button>`;
        } else if (adv.status === '待機中' && !isOffseason && currentMonth !== 12) {
            if (adv.rank !== 'V') {
                buttonsHtml += `<button class="action-btn-promotion" onclick="startPromotionExam(${adv.id})">昇級試験</button>`;
            }
            if (!adv.isInherited && attribute && attribute.rarity !== 'Epic') {
                buttonsHtml += `<button class="action-btn-training" onclick="startSpecialTraining(${adv.id})">特別訓練</button>`;
            }
            buttonsHtml += `<button class="action-btn-recommend" onclick="assignRecommendedQuest(${adv.id})">おすすめ任務</button>`;
            if (!adv.isInherited) { // 引継ぎ冒険者は名前変更不可
                buttonsHtml += `<button onclick="renameAdventurer(${adv.id})">名前変更</button>`;
            }
            buttonsHtml += `<button onclick="showColorPalette(${adv.id})">カラー変更</button>`;
        } else if (!isOffseason) {
            buttonsHtml = `<button onclick="showColorPalette(${adv.id})">カラー変更</button>`;
        }
        const footerHtml = `<div class="adv-card-footer">${buttonsHtml}</div>`;

        // 全てを結合
        card.innerHTML = headerHtml + avatarHtml + statsHtml + expHtml + footerHtml;
        adventurerListEl.appendChild(card);
    });
}

/**
 * 指定された冒険者の「クエスト予定」をキャンセルします。
 * @param {number} advId - 冒険者のID
 * @param {string} questName - クエスト名
 */
function cancelScheduledQuest(advId, questName) {
    // ★ 成功率表示 `(xx%)` が含まれている可能性があるため、それを取り除く
    const cleanQuestName = questName.replace(/\s*\(\d+%\)$/, '');
    const adv = adventurers.find(a => a.id == advId);
    if (!adv || !adv.status.startsWith('クエスト予定')) return;

    // 1. 冒険者のステータスを待機中に戻す
    adv.status = '待機中';

    // 2. 進行中リストからこの冒険者を削除
    const qDataIndex = questsInProgress.findIndex(q => q.quest.name === cleanQuestName);
    
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
    
    alert(`${adv.name} の【${cleanQuestName}】の派遣予定をキャンセルしました。`);
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

    // ★ 引継ぎ冒険者は名前変更不可
    if (adv.isInherited) {
        alert('引き継いだ冒険者の名前は変更できません。');
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
    colorLabel.textContent = '色を選択するとリアルタイムで反映されます:';
 
    // 色が変更されるたびにリアルタイムで更新
    colorInput.addEventListener('input', () => {
        adv.characterColor = colorInput.value;
        updateAllTimeRecord(adv); // 念のため最高記録も更新
        updateDisplay();
    });
 
    // 閉じるボタンを作成
    const closeButton = document.createElement('button');
    closeButton.textContent = '閉じる';
    closeButton.className = 'color-picker-confirm-button'; // 既存のスタイルを流用
    closeButton.onclick = () => {
        paletteModal.remove();
    };
 
    colorPickerContainer.appendChild(colorLabel);
    colorPickerContainer.appendChild(colorInput);
 
    paletteContent.appendChild(colorPickerContainer);
    paletteContent.appendChild(closeButton);
 
    paletteModal.appendChild(paletteContent);
    document.body.appendChild(paletteModal);
 
    // モーダルの外側をクリックしたら閉じる
    paletteModal.onclick = (e) => {
        if (e.target === paletteModal) {
            paletteModal.remove();
        }
    };
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
        const newAdventurer = generateAdventurer(policyKey);
        scoutCandidates.push(newAdventurer);
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
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor}; cursor: pointer;" onclick="showAttributeDetails('${candidate.attribute}')">${attribute.name}</span>` : 'なし';

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

        // ★ 引継ぎ冒M険者の場合、特別な色を設定
        if (adv.isInherited) {
            adv.characterColor = '#FFD700'; // 金色
            adv.name = `👑 ${adv.name}`; // 王冠の絵文字を追加
        }

    });
    
    alert(`${selectedAdventurers.length}名の冒険者をギルドに迎え入れ、合計 ${totalCost} 万Gを支払いました！`);

    autosaveGame(); // ★ オートセーブ
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
    
    // ★ 昇級試験または特別訓練かどうかの判定
    const isSpecialSoloQuest = quest.isPromotion || quest.isTraining;

    if (isSpecialSoloQuest) {
        // 昇級試験・特別訓練の場合
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

function renderQuests() {
    questsEl.innerHTML = ''; 
    questDetailAreaEl.style.display = 'none'; 
    adventurerListEl.style.display = 'block'; 

    updateAutoAssignButtonVisibility();

    if (currentMonth === 12) {
        const storyQuest = getStoryQuestForYear(currentYear);
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
            const message = isStoryQuestInProgress 
                ? '<p>ストーリー任務は派遣予定です。結果は「Next Month」で確認できます。</p>'
                : '<p>今年のストーリー任務はありません。</p>';
            questsEl.innerHTML = message;
        }
        return;
    }

    // --- メインのレイアウトコンテナを作成 ---
    const questLayoutContainer = document.createElement('div');
    questLayoutContainer.className = 'quest-layout-container';
    questsEl.appendChild(questLayoutContainer);

    // --- 通常クエストの表示 ---
    const regularQuestColumn = document.createElement('div');
    regularQuestColumn.className = 'quest-column regular-quest-column full-width-column';
    regularQuestColumn.innerHTML = '<h2>📜 任務</h2>';
    questLayoutContainer.appendChild(regularQuestColumn);

    let hasAvailableQuest = false;
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

    displayableQuests.sort((a, b) => b.difficulty - a.difficulty);

    if (displayableQuests.length > 0) {
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
            regularQuestColumn.appendChild(questDiv);
        });
    } else {
        regularQuestColumn.innerHTML += '<p>現在、他に利用可能なクエストはありません。</p>';
    }

    // --- 説明用のセクションを追加 ---
    const bottomRowContainer = document.createElement('div');
    bottomRowContainer.className = 'quest-top-row'; // 既存のスタイルを流用
    bottomRowContainer.style.marginTop = '20px'; // 上にマージンを追加

    // --- 昇級試験セクション ---
    const promotionColumn = document.createElement('div');
    promotionColumn.className = 'quest-column promotion-column';
    promotionColumn.innerHTML = `
        <h2>🎓 昇級試験について</h2>
        <p style="font-size: 0.9em;">冒険者のOVRが一定値に達すると、より高いランクへの昇級試験に挑戦できます。<br>
        試験は単独で挑み、成功するとランクが上がり、より高難易度の任務に挑戦できるようになります。<br>
        ※昇級するにつれ、必要な給料も高くなります。</p>
    `;

    // 挑戦可能な昇級試験をリストアップ
    const promotionExams = [];
    adventurers.forEach(adv => {
        if (adv.status === '待機中' && adv.rank !== 'V') {
            const currentRankIndex = RANKS.indexOf(adv.rank);
            const nextRank = RANKS[currentRankIndex + 1];
            const requiredDifficulty = PROMOTION_DIFFICULTIES[adv.rank];
            const promotionQuest = {
                id: 1000 + adv.id, name: `${adv.name} の昇級試験 (${adv.rank} → ${nextRank})`,
                difficulty: requiredDifficulty, isPromotion: true, adv: adv, nextRank: nextRank
            };
            promotionQuest.estimatedRate = calculateSuccessRate(promotionQuest, [adv]);
            promotionExams.push(promotionQuest);
        }
    });
    promotionExams.sort((a, b) => b.estimatedRate - a.estimatedRate || b.difficulty - a.difficulty);

    if (promotionExams.length > 0) {
        promotionExams.forEach(pQuest => {
            const questDiv = document.createElement('div');
            questDiv.className = 'quest-item promotion-exam';
            const statusColor = pQuest.estimatedRate >= 0.7 ? 'green' : (pQuest.estimatedRate >= 0.5 ? 'orange' : 'red');
            questDiv.innerHTML = `
                <h3>🎓 ${pQuest.name}</h3>
                <p><strong>目標OVR:</strong> ${pQuest.difficulty} / <strong>${pQuest.adv.name} のOVR: ${pQuest.adv.ovr}</strong></p>
                <p><strong>成功率目安:</strong> <span style="font-weight:bold; color:${statusColor};">${Math.round(pQuest.estimatedRate * 100)}%</span></p>
                <button onclick="showQuestSelection(${pQuest.id}, ${pQuest.adv.id})">試験を受ける</button>
            `;
            promotionColumn.appendChild(questDiv);
        });
    } else {
        promotionColumn.innerHTML += '<p>現在、受験可能な冒険者はいません。</p>';
    }

    // --- 特別訓練セクション ---
    const trainingColumn = document.createElement('div');
    trainingColumn.className = 'quest-column training-column';
    trainingColumn.innerHTML = `
        <h2>✨ 特別訓練について</h2>
        <p style="font-size: 0.9em;">冒険者のOVRが一定値に達すると、自身の属性を強化する特別訓練に挑戦できます。<br>
        訓練は単独で挑み、成功すると属性のレアリティが上昇し、レベルアップ時のボーナスが強化されます。<br>
        ※費用は掛かりません</p>
    `;

    // 挑戦可能な特別訓練をリストアップ
    const trainingQuests = [];
    adventurers.forEach(adv => {
        const attribute = ATTRIBUTES[adv.attribute];
        if (adv.status === '待機中' && !adv.isInherited && attribute && attribute.rarity !== 'Epic') {
            const nextRarityMap = { 'Common': 'Uncommon', 'Uncommon': 'Rare', 'Rare': 'Epic' };
            const nextRarity = nextRarityMap[attribute.rarity];
            if (nextRarity) {
                let trainingDifficulty;
                switch (attribute.rarity) {
                    case 'Common':   trainingDifficulty = 120; break;
                    case 'Uncommon': trainingDifficulty = 150; break;
                    case 'Rare':     trainingDifficulty = 200; break;
                    default:         trainingDifficulty = 120;
                }
                const nextName = attribute.name + '+';
                const trainingQuest = {
                    id: 3000 + adv.id, name: `属性強化訓練 (${attribute.name} → ${nextName})`,
                    difficulty: trainingDifficulty, isTraining: true, adv: adv,
                };
                trainingQuest.estimatedRate = calculateSuccessRate(trainingQuest, [adv]);
                trainingQuests.push(trainingQuest);
            }
        }
    });
    trainingQuests.sort((a, b) => b.estimatedRate - a.estimatedRate);

    if (trainingQuests.length > 0) {
        trainingQuests.forEach(tQuest => {
            const questDiv = document.createElement('div');
            questDiv.className = 'quest-item training-quest';
            const statusColor = tQuest.estimatedRate >= 0.7 ? 'green' : (tQuest.estimatedRate >= 0.5 ? 'orange' : 'red');
            questDiv.innerHTML = `
                <h3>✨ ${tQuest.name}</h3>
                <p><strong>目標OVR:</strong> ${tQuest.difficulty} / <strong>${tQuest.adv.name} のOVR: ${tQuest.adv.ovr}</strong></p>
                <p><strong>成功率目安:</strong> <span style="font-weight:bold; color:${statusColor};">${Math.round(tQuest.estimatedRate * 100)}%</span></p>
                <button onclick="showQuestSelection(${tQuest.id}, ${tQuest.adv.id})">訓練を受ける</button>
            `;
            trainingColumn.appendChild(questDiv);
        });
    } else {
        trainingColumn.innerHTML += '<p>現在、訓練可能な冒険者はいません。</p>';
    }

    bottomRowContainer.appendChild(promotionColumn);
    bottomRowContainer.appendChild(trainingColumn);
    questLayoutContainer.appendChild(bottomRowContainer);
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
    // ★ 特別訓練の判定 (IDが3000番台)
    const isTraining = questId >= 3000 && targetAdvId !== null;
 
    // ★★★ 判別順序を変更: isTrainingを先に評価する ★★★
    if (isTraining) {
        const adv = adventurers.find(a => a.id === targetAdvId);
        if (!adv) return;
        const attribute = ATTRIBUTES[adv.attribute]; 
        // ★★★ 属性レアリティに基づいて難易度を設定 ★★★
        let trainingDifficulty;
        switch (attribute.rarity) {
            case 'Common':   trainingDifficulty = 120; break;
            case 'Uncommon': trainingDifficulty = 150; break;
            case 'Rare':     trainingDifficulty = 200; break;
            default:         trainingDifficulty = 120; // フォールバック
        }
        // ★★★ 修正ここまで ★★★

        quest = {
            id: questId,
            name: `属性強化訓練 (${attribute.name} → ${attribute.name}+)`,
            difficulty: trainingDifficulty,
            aptitudes: { combat: '無関係', magic: '無関係', exploration: '無関係' },
            isTraining: true,
            advId: adv.id,
        };
    } else if (isPromotion) {
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

    const maxAdventurers = (quest.isPromotion || quest.isTraining) ? 1 : 4;
    const selectionInfo = quest.isPromotion 
        ? `<p style="color:red; font-weight:bold;">この試験は${adventurers.find(a => a.id === targetAdvId).name}単独での受験となります。他メンバーは選択できません。</p>`
        : quest.isTraining
        ? `<p style="color:#85C1E9; font-weight:bold;">この訓練は${adventurers.find(a => a.id === targetAdvId).name}単独で実行します。他メンバーは選択できません。</p>`
        : quest.isStory
        ? `<p style="color:red; font-weight:bold;">ギルドの存亡をかけた戦いです。待機中のメンバーから精鋭を選び、任務に挑みます (最大${maxAdventurers}名)。</p>`
        : `<p><strong>派遣する冒険者を選択してください (最大${maxAdventurers}名):</strong></p>`;

    const rewardText = quest.isStory ? '任務成功で次年へ'
        : (quest.isPromotion || quest.isTraining) ? 'なし' // ★ 昇級・訓練は報酬なし
        : `${getQuestReward(quest)} 万G`;
    const difficultyText = (quest.isPromotion || quest.isTraining) ? `目標OVR: ${quest.difficulty}` : `適正能力 (目標合計: ${quest.difficulty})`;


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
            <button id="send-quest-button" ${quest.isPromotion ? 'class="promotion-dispatch-button"' : (quest.isStory ? 'class="story-dispatch-button"' : '')} onclick="sendAdventurersToQuest(${quest.id}, ${quest.isPromotion || quest.isTraining}, ${targetAdvId})" disabled>派遣予定に入れる</button>
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
    if (quest.isPromotion || quest.isTraining) {
        availableAdventurers = availableAdventurers.filter(adv => adv.id === targetAdvId);
    }

    availableAdventurers.forEach(adv => {
        const row = table.insertRow();
        const expPercentage = Math.min(100, (adv.exp / adv.expToLevelUp) * 100);
        
        // 昇級試験の場合はチェックボックスを強制的にチェック済み・無効化
        const checked = (quest.isPromotion || quest.isTraining) ? 'checked disabled' : '';

        // ★ 引継ぎ冒険者の名前スタイルを定義
        let nameStyle = `border-bottom: 3px solid ${adv.characterColor || '#ccc'}; padding-bottom: 2px;`;
        if (adv.isInherited) {
            nameStyle += `color: #FFD700; text-shadow: 0 0 5px #FFD700, 0 0 8px #FFD700;`;
        }

        row.innerHTML = `
            <td><input type="checkbox" name="quest-adv-select" value="${adv.id}" ${checked}></td>
            <td><span class="adventurer-name" style="${nameStyle}">${adv.name}</span></td>
            <td class="adventurer-rank-cell">${getStyledRankHtml(adv.rank)}</td>
            <td>${adv.ovr}</td>
            <td>${getStyledSkillHtml(adv.skills.combat)}</td>
            <td>${getStyledSkillHtml(adv.skills.magic)}</td>
            <td>${getStyledSkillHtml(adv.skills.exploration)}</td>
            <td>
                ${adv.exp} / ${adv.expToLevelUp}
                <div class="exp-bar-container">
                    <div class="exp-bar" style="width: ${adv.isInherited ? '0' : expPercentage}%;"></div>
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
    // 通常クエストの場合のみavailableをfalseにする
    if (!quest.isPromotion && !quest.isTraining && !quest.isStory) {
        const originalQuest = quests.find(q => q.id === quest.id);
        if (originalQuest) originalQuest.available = false;
    }
    const successRate = calculateSuccessRate(quest, sentAdventurers);
    const ratePercentage = Math.round(successRate * 100);
    sentAdventurers.forEach(adv => adv.status = `クエスト予定: ${quest.name} (${ratePercentage}%)`);
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
            const ageMultiplier = getAgeMultiplier(adv.age); // 年齢倍率 (引継ぎ者は1.0)
            const rankMultiplier = getRankMultiplier(adv.rank); // ★ ランク倍率を追加
            const traitExpModifier = 1.0; // 旧特性システム廃止のため1.0に固定

            const totalMultiplier = ageMultiplier * rankMultiplier * traitExpModifier; // ★ 合計倍率
            const individualExp = Math.round(gainedBaseExp * totalMultiplier * expModifier);
            
            // 倍率は小数点第二位まで表示
            expPreviewEl.textContent = adv.isInherited ? '---' : `${individualExp} P (x${totalMultiplier.toFixed(2)})`; // ★ 引継ぎ者はEXP表示なし
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
    if (quest.isPromotion || quest.isTraining) {
        sendButton.disabled = selectedAdventurers.length !== 1;
    } else {
        // 通常・ストーリークエストは最大4人
        sendButton.disabled = selectedAdventurers.length === 0 || selectedAdventurers.length > 4;
    }
}

/**
 * 指定された冒険者をワンクリックで昇級試験に派遣します。
 * @param {number} advId - 冒険者のID
 */
function startPromotionExam(advId) {
    const adv = adventurers.find(a => a.id === advId);
    if (!adv || adv.status !== '待機中' || adv.rank === 'V') {
        alert('この冒険者は現在、昇級試験を受けられません。');
        return;
    }

    const currentRankIndex = RANKS.indexOf(adv.rank);
    const nextRank = RANKS[currentRankIndex + 1];
    const requiredDifficulty = PROMOTION_DIFFICULTIES[adv.rank];

    const promotionQuest = {
        id: 1000 + adv.id,
        name: `${adv.name} の昇級試験 (${adv.rank} → ${nextRank})`,
        difficulty: requiredDifficulty,
        isPromotion: true,
    };

    sendAdventurersToQuestInternal(promotionQuest, [adv]);
    alert(`【${promotionQuest.name}】に派遣予定を入れました。`);
    updateDisplay();
}

/**
 * 指定された冒険者をワンクリックで特別訓練に派遣します。
 * @param {number} advId - 冒険者のID
 */
function startSpecialTraining(advId) {
    const adv = adventurers.find(a => a.id === advId);
    const attribute = adv ? ATTRIBUTES[adv.attribute] : null;

    if (!adv || adv.status !== '待機中' || adv.isInherited || !attribute || attribute.rarity === 'Epic') {
        alert('この冒険者は現在、特別訓練を受けられません。');
        return;
    }

    let trainingDifficulty;
    switch (attribute.rarity) {
        case 'Common':   trainingDifficulty = 120; break;
        case 'Uncommon': trainingDifficulty = 150; break;
        case 'Rare':     trainingDifficulty = 200; break;
        default:         trainingDifficulty = 120;
    }

    const trainingQuest = {
        id: 3000 + adv.id,
        name: `属性強化訓練 (${attribute.name} → ${attribute.name}+)`,
        difficulty: trainingDifficulty,
        isTraining: true,
    };

    sendAdventurersToQuestInternal(trainingQuest, [adv]);
    alert(`【${trainingQuest.name}】に派遣予定を入れました。`);
    updateDisplay();
}

/**
 * 指定された冒険者に最適なおすすめ任務を割り当てます。
 * @param {number} advId - 冒険者のID
 */
function assignRecommendedQuest(advId) {
    const adv = adventurers.find(a => a.id === advId);
    if (!adv || adv.status !== '待機中') {
        alert('この冒険者は現在、任務を受けられません。');
        return;
    }

    let bestQuest = null;
    let maxDifficulty = -1;

    const availableQuests = quests.filter(q => q.available && (!q.requiredRank || RANKS.indexOf(adv.rank) >= RANKS.indexOf(q.requiredRank)));

    for (const quest of availableQuests) {
        const successRate = calculateSuccessRate(quest, [adv]);
        if (successRate >= 0.8 && quest.difficulty > maxDifficulty) {
            maxDifficulty = quest.difficulty;
            bestQuest = quest;
        }
    }

    if (bestQuest) {
        sendAdventurersToQuestInternal(bestQuest, [adv]);
        alert(`${adv.name}を【${bestQuest.name}】に派遣予定を入れました。`);
        updateDisplay();
    } else {
        alert(`${adv.name}に適した単独任務が見つかりませんでした。`);
    }
}

/**
 * 選択された冒険者をクエストに派遣予定に入れます。
 * @param {number} questId - クエストID
 * @param {boolean} isPromotion - 昇級試験かどうか
 * @param {number} [targetAdvId=null] - 昇級試験または特別訓練の場合、対象の冒険者のID
 */
function sendAdventurersToQuest(questId, _isSpecial, targetAdvId = null) {
    const checkedCheckboxes = document.querySelectorAll('#quest-candidate-table input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkedCheckboxes).map(cb => parseInt(cb.value));
    const sentAdventurers = adventurers.filter(adv => selectedIds.includes(adv.id));

    let quest;
    const isStoryQuest = questId >= 2001 && questId <= 2010;
    const isTraining = questId >= 3000 && targetAdvId !== null;
    const isPromotion = questId >= 1000 && !isTraining && targetAdvId !== null;
 
    if (isTraining) {
        quest = questsInProgress.find(q => q.quest.id === questId)?.quest;
        if (!quest) return; // 既に内部処理されているはずなので基本的には見つかる
    } else if (isPromotion) {
        quest = questsInProgress.find(q => q.quest.id === questId)?.quest;
        if (!quest) return;
    } else if (isStoryQuest) {
        quest = getStoryQuestForYear(currentYear);
        quest.isStory = true;
    } else {
        quest = quests.find(q => q.id === questId);
        if (!quest) return;
    }

    // ★ どのタイプのクエストでも、ここで内部派遣関数を呼び出す
    sendAdventurersToQuestInternal(quest, sentAdventurers);
    
    // 3. UIを更新
    cancelQuestSelection();
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
    // オフシーズン中は月を進められない
    if (isOffseason) {
        alert('現在はオフシーズンです。契約更改を完了し、「新年を迎える」ボタンを押してください。');
        return;
    }

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
    let summaryMessage = `【${previousYear}年 ${previousMonth}月の収支報告】\n\n`;
    let totalIncome = 0;
    let totalExpense = 0;

    // 1. 進行中のクエストの結果を処理
    if (questsInProgress.length > 0) {
        // 12月の場合、結果処理はオフシーズンに持ち越す
        if (previousMonth === 12) {
            const storyQuestResult = processQuestsResults();
            if (storyQuestResult.isGameOver) {
                // ゲームオーバーならここで終了
                return;
            }
            // ストーリー任務成功時、オフシーズンに移行
            isOffseason = true;
            // ★ オフシーズン移行前に確認ダイアログを表示
            if (!confirm('ストーリー任務を派遣します。本当に良いですか？')) {
                isOffseason = false; // オフシーズンへの移行をキャンセル
                return;
            }

            renderOffseasonScreen(storyQuestResult.message);
            updateDisplay(); // オフシーズン画面の表示を更新
            return;
        }

        const questResults = processQuestsResults(false);


        summaryMessage += questResults.message;
        totalIncome += questResults.income;
        totalExpense += questResults.expense;
    } else {
        summaryMessage += "前月に派遣予定のクエストはありませんでした。\n";
    }
    // 2. 冒険者への給与支払い処理
    const monthlySalaryExpense = payMonthlySalary();
    totalExpense += monthlySalaryExpense;
    // 3. 月の更新と能力低下処理
    currentMonth++;
    const agingMessage = processAgingEffects();
    if (agingMessage) {
        summaryMessage += agingMessage;
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
        autosaveGame(); // ★ オートセーブ
        alert("新しい月になりました！");
    }
    
    updateDisplay();
}

/**
 * メインゲームUIの主要なセクションの表示/非表示を切り替えます。
 * @param {boolean} show - trueなら表示、falseなら非表示
 */
function toggleMainGameUISections(show) {
    const displayStyle = show ? 'block' : 'none';
    if (lastMonthLogEl) lastMonthLogEl.style.display = displayStyle;
    if (adventurerListEl) adventurerListEl.style.display = displayStyle;
    if (scoutAreaEl) scoutAreaEl.style.display = 'none'; // scoutAreaは通常非表示
    if (questDetailAreaEl) questDetailAreaEl.style.display = 'none'; // questDetailAreaは通常非表示
    if (questsEl) questsEl.style.display = displayStyle;
    const controlsEl = document.getElementById('controls');
    // ★ オフシーズン中はスカウト等の操作ができないようにコントロール自体を非表示にする
    const displayControls = show && !isOffseason;
    if (controlsEl) controlsEl.style.display = displayControls ? 'flex' : 'none';
}

/**
 * オフシーズン画面を描画します。
 * @param {string} questResultMessage - クエスト結果のメッセージ
 */
function renderOffseasonScreen(questResultMessage) {
    const mainContent = document.getElementById('main-content');
    toggleMainGameUISections(false); // メインゲームUIを非表示にする
    const offseasonContainer = document.createElement('div');
    offseasonContainer.id = 'offseason-container';
    offseasonContainer.innerHTML = `
        <div id="offseason-container">
            <h1>オフシーズン</h1>
            <p>${currentYear}年のシーズンが終了しました。来年に向けてギルドの体制を整えましょう。</p>
            
            <div class="log-panel">
                <h3>${currentYear}年12月 クエスト結果</h3>
                <pre>${questResultMessage.replace(/\*\*/g, '')}</pre>
            </div>

            <h2>契約更改</h2>
            <p>各冒険者の来季の年俸を確認し、契約を「更新」するか「解除」するか選択してください。</p>
            <div id="contract-renewal-list"></div>
            <div style="text-align: center; margin-top: 20px;">
                <button id="finish-offseason-button" onclick="finishOffseason()">新年を迎える</button>
            </div>
        </div>
    `;
    mainContent.appendChild(offseasonContainer);
    const contractListEl = document.getElementById('contract-renewal-list');
    adventurers.forEach(adv => {
        // 年齢を+1し、来季の年俸を計算
        const nextAge = adv.age + 1;
        const nextSalary = calculateAnnualSalary(adv.ovr, adv.rank);

        const advDiv = document.createElement('div');
        advDiv.className = 'contract-item';
        advDiv.id = `contract-item-${adv.id}`;
        advDiv.innerHTML = `
            <div class="contract-adv-info">
                <strong>${adv.name}</strong> (現 ${adv.age}歳 → 来季 ${nextAge}歳) - ランク: ${getStyledRankHtml(adv.rank)} / OVR: ${adv.ovr}<br>
                年俸: ${adv.annualSalary}万G → <strong style="color: #f1c40f;">来季年俸: ${nextSalary}万G</strong>
            </div>
            <div class="contract-actions">
                <button class="contract-renew-button" onclick="handleContractDecision(${adv.id}, true, ${nextAge}, ${nextSalary})">契約更新</button>
                <button class="contract-release-button" onclick="handleContractDecision(${adv.id}, false)">契約解除</button>
            </div>
        `;
        contractListEl.appendChild(advDiv);
    });

    // 全員の契約更改が終わるまで「新年を迎える」ボタンは無効
    document.getElementById('finish-offseason-button').disabled = true;
}

/**
 * 契約更改の決定を処理します。
 * @param {number} advId - 対象の冒険者ID
 * @param {boolean} willRenew - 更新するかどうか
 * @param {number} [nextAge] - 更新する場合の来季の年齢
 * @param {number} [nextSalary] - 更新する場合の来季の年俸
 */
function handleContractDecision(advId, willRenew, nextAge, nextSalary) {
    const adv = adventurers.find(a => a.id === advId);
    if (!adv) return;
 
    const itemEl = document.getElementById(`contract-item-${advId}`);
    const renewButton = itemEl.querySelector('.contract-renew-button');
    const releaseButton = itemEl.querySelector('.contract-release-button');
 
    if (willRenew) {
        adv.isRenewed = true; // 契約更新済みフラグ
        // 契約更新時に適用される年齢と年俸を一時的に保持
        adv.nextAge = nextAge;
        adv.nextSalary = nextSalary;
        renewButton.classList.add('selected');
        releaseButton.classList.remove('selected');
    } else {
        adv.isRenewed = false; // 契約解除フラグ
        // 更新しないので一時データは不要
        delete adv.nextAge;
        delete adv.nextSalary;
        releaseButton.classList.add('selected');
        renewButton.classList.remove('selected');
    }
 
    // 全員の意思決定が終わったかチェック
    const allDecided = adventurers.every(a => a.hasOwnProperty('isRenewed'));
    if (allDecided) {
        document.getElementById('finish-offseason-button').disabled = false;
    }
}

/**
 * オフシーズンを終了し、新年を開始します。
 */
function finishOffseason() {
    // 契約更新する冒険者のステータスを更新
    adventurers.forEach(adv => {
        if (adv.isRenewed) {
            adv.age = adv.nextAge;
            adv.annualSalary = adv.nextSalary;
        }
    });
 
    // 契約解除（isRenewedがfalse）の冒険者をギルドから削除
    adventurers = adventurers.filter(adv => adv.isRenewed);
    // 一時的なプロパティを削除
    adventurers.forEach(adv => { delete adv.isRenewed; delete adv.nextAge; delete adv.nextSalary; });

    isOffseason = false;
    currentYear++;
    currentMonth = 1;

    // オフシーズンコンテナを削除
    const offseasonContainer = document.getElementById('offseason-container');
    if (offseasonContainer) {
        offseasonContainer.remove();
    }

    // メインゲームUIを再表示
    toggleMainGameUISections(true);

    // ★ オフシーズン（12月）のクエスト結果を「先月の記録」として表示する
    const lastLog = document.querySelector('#offseason-container .log-panel pre');
    if (lastLog && logContentEl && lastMonthLogEl) {
        logContentEl.textContent = lastLog.textContent;
        lastMonthLogEl.style.display = 'block';
    }


    // DOM要素の参照は変わっていないので再取得は不要
    // reinitializeDOMElements();

    alert(`${currentYear}年になりました！`);
    updateDisplay();
}

/**
 * 進行中のクエストの結果をまとめて処理します。
 */
function processQuestsResults(isGameOverCheckOnly = false) {
    let message = `**【クエスト結果】**\n`;
    let totalIncome = 0;
    let totalExpense = 0;
    let levelUpMessages = [];
    let trainingMessages = []; // ★ 訓練メッセージ用
    let promotionMessages = []; // 昇級メッセージ用

    for (const qData of questsInProgress) { // forEach を for...of に変更して break を可能にする
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
            // ★ 引継ぎ冒険者は経験値もレベルアップもしない
            if (adv.isInherited) {
                return; // この冒険者の経験値処理をスキップ
            }

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
                    showGameClearScreen(); // ゲームクリア画面へ
                    return { isGameOver: true, message: message }; // ゲームクリアなのでここで処理を終了
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

            } else if (quest.isTraining) {
                // 特別訓練成功
                const adv = sentAdventurers[0];
                const oldAttribute = ATTRIBUTES[adv.attribute];
                const nextRarityMap = { 'Common': 'Uncommon', 'Uncommon': 'Rare', 'Rare': 'Epic' };
                const nextRarity = nextRarityMap[oldAttribute.rarity];

                // ★★★ 属性アップグレードロジックを動的生成に戻す ★★★
                // 新しい属性を動的に生成
                const newAttributeKey = `${adv.attribute}_plus_${Date.now()}`; // 一意のキーを生成
                const newAttribute = {
                    ...oldAttribute, // 基本情報（ボーナス含む）をコピー
                    name: oldAttribute.name + '+',
                    rarity: nextRarity,
                };
                ATTRIBUTES[newAttributeKey] = newAttribute; // グローバルオブジェクトに新しい属性を追加

                // ★★★ 新しい属性のレベルアップボーナスを強化する ★★★
                const bonusStats = ['combat', 'magic', 'exploration'];
                const randomBonusStat = bonusStats[Math.floor(Math.random() * bonusStats.length)];
                // 新しいボーナスオブジェクトを作成し、元のボーナスをコピー
                newAttribute.bonus = { ...oldAttribute.bonus };
                // ランダムなスキルに+1する（既存なら加算、なければ新規追加）
                newAttribute.bonus[randomBonusStat] = (newAttribute.bonus[randomBonusStat] || 0) + 1;
                // ★★★ 修正ここまで ★★★

                adv.attribute = newAttributeKey; // 冒険者の属性を更新

                // レアリティアップ時のボーナス
                const stats = ['combat', 'magic', 'exploration'];
                const randomStat = stats[Math.floor(Math.random() * stats.length)];
                const bonusValue = (newAttribute.rarity === 'Epic') ? 2 : 1;
                adv.skills[randomStat] += bonusValue;
                adv.ovr += bonusValue; // OVRも更新

                // ★ 最高記録を更新
                updateAllTimeRecord(adv);

                trainingMessages.push(`✨ ${adv.name} は訓練に成功！ 属性が「${oldAttribute.name}」から「${newAttribute.name}」に進化し、${randomStat}スキルが+${bonusValue}上昇しました！ (EXP+${averageGainedExp}P)`);

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
                const gameOverMessage = `【${quest.name}】に失敗... ギルドの挑戦はここで終わりを告げた。`;
                showGameOverScreen(gameOverMessage);
                return { isGameOver: true, message: gameOverMessage }; // ゲームオーバーなのでここで処理を終了
            }


            if (quest.isPromotion) {
                // 昇級試験失敗
                const adv = sentAdventurers[0];
                promotionMessages.push(`😥 ${adv.name} は昇級試験に失敗しました。次月以降に再挑戦できます。 (EXP+${averageGainedExp}P)`);
                resultMessage = `❌ 失敗: 昇級できず`;

            } else if (quest.isTraining) {
                // 特別訓練失敗
                const adv = sentAdventurers[0];
                trainingMessages.push(`😥 ${adv.name} は属性強化訓練に失敗しました。 (EXP+${averageGainedExp}P)`);
                resultMessage = `❌ 失敗: 属性は変わらず`;
            } else {
                // 通常クエスト失敗
                const penalty = Math.floor(getQuestReward(quest) / 2) || 0; // ★ 報酬がない場合にNaNになるのを防ぐ
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
    } // for...of ループの終わり

    // 進行中リストをクリア
    questsInProgress = [];
    
    // 訓練メッセージを先に表示
    if (trainingMessages.length > 0) {
        message += `\n**【特別訓練報告】**\n` + trainingMessages.join('\n') + '\n';
    }

    // 昇級メッセージを先に表示
    if (promotionMessages.length > 0) {
        message += `\n**【昇級報告】**\n` + promotionMessages.join('\n') + '\n';
    }
    
    // レベルアップメッセージを結果メッセージに追加
    if (levelUpMessages.length > 0) {
        message += `\n**【レベルアップ報告】**\n` + levelUpMessages.join('\n') + '\n';
    }

    return { message, income: totalIncome, expense: totalExpense, isGameOver: false };
}

/**
 * ギルドの全冒険者に月給を支払います。
 * @returns {number} 支払った月給の合計額 (万G)
 */
function payMonthlySalary() {
    // 12月はストーリー任務のため給与支払いはなし
    if (currentMonth === 12) return 0;

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
    adventurers.filter(adv => adv.age !== null).forEach(adv => { // ★ 年齢がnullでない冒険者のみ処理
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
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor}; cursor: pointer;" onclick="showAttributeDetails('${record.attribute}')">${attribute.name}</span>` : 'なし';

        // ★ アバター表示用のHTMLを生成
        let nameCellHtml;
        if (record.avatar) {
            // 冒険者オブジェクトに保存された色相と明るさを使用
            const hairHue = record.avatar.hairHue ?? 0;
            const eyesHue = record.avatar.eyesHue ?? 0;
            const brightness = record.avatar.brightness ?? 1.0;
            const faceStyle = getPartStyle('face', record.avatar.face);
            const backStyle = getPartStyle('back', record.avatar.back);
            const earsStyle = getPartStyle('ears', record.avatar.ears);
            const eyesStyle = getPartStyle('eyes', record.avatar.eyes);
            const hairStyle = getPartStyle('hair', record.avatar.hair);
            const hairFilter = `hue-rotate(${hairHue}deg) saturate(1.5) brightness(${brightness})`;
            hairStyle.filter = hairFilter;
            backStyle.filter = hairFilter;
            eyesStyle.filter = `hue-rotate(${eyesHue}deg) saturate(2) brightness(${brightness * 0.9})`;
            const styleToString = (styleObj) => Object.entries(styleObj).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`).join(';');
            const avatarHtml = `
                <div class="avatar-container">
                    <img src="avatar_parts/back/${record.avatar.back}.svg" class="avatar-part" style="${styleToString(backStyle)}">
                    <img src="avatar_parts/face/${record.avatar.face}.svg" class="avatar-part" style="${styleToString(faceStyle)}">
                    <img src="avatar_parts/ears/${record.avatar.ears}.svg" class="avatar-part" style="${styleToString(earsStyle)}">
                    <img src="avatar_parts/hair/${record.avatar.hair}.svg" class="avatar-part" style="${styleToString(hairStyle)}">
                    <img src="avatar_parts/eyes/${record.avatar.eyes}.svg" class="avatar-part" style="${styleToString(eyesStyle)}">
                </div>`;
            nameCellHtml = `<div class="adventurer-summary">${avatarHtml} <span class="adventurer-name" style="border-bottom: 3px solid ${record.characterColor || '#ccc'}; padding-bottom: 2px;">${record.name}</span></div>`;
        } else {
            nameCellHtml = `<span class="adventurer-name" style="border-bottom: 3px solid ${record.characterColor || '#ccc'}; padding-bottom: 2px;">${record.name}</span>`;
        }

        // ★ 引き継いだ冒険者は殿堂入りできないようにする
        let inductButtonHtml = '';
        if (!record.isInherited) {
            inductButtonHtml = `<button id="induct-btn-${record.id}" onclick="inductToHallOfFame(${record.id})">殿堂入り</button>`;
        } else {
            inductButtonHtml = '<span>(引継ぎ)</span>';
        }

        row.innerHTML = `
            <td>${nameCellHtml}</td>
            <td>${record.gender}</td><td>${attributeHtml}</td><td>${getStyledRankHtml(record.peakRank)}</td>
            <td>${record.peakOvr}</td>
            <td>${record.peakSkills.combat}</td>
            <td>${record.peakSkills.magic}</td>
            <td>${record.peakSkills.exploration}</td>
            <td>${record.peakAge}歳</td>
            <td>${SCOUT_POLICIES[record.recruitedBy]?.name || '不明'}</td>
            <td>${inductButtonHtml}</td>
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

    // ★ 動的に生成された属性の場合、その属性情報も一緒に保存する
    if (recordToInduct.attribute.includes('_plus_')) {
        recordToInduct.dynamicAttribute = ATTRIBUTES[recordToInduct.attribute];
    }
    
    // 新しい記録を追加または更新
    pastRecords[advId] = recordToInduct;
    // localStorageに保存
    localStorage.setItem('guildSoulHallOfFame', JSON.stringify(pastRecords));

    // ボタンを無効化してフィードバック
    const button = document.getElementById(`induct-btn-${advId}`);
    if (button) {
        button.textContent = '殿堂入り済';
        button.disabled = true;
    }
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
 * @param {Object|null} inheritedAdventurer - 引き継ぐ冒険者データ
 */
function startGame(withTutorial, difficulty, inheritedAdventurer = null) {
    const homeScreen = document.getElementById('home-screen');
    const gameContainer = document.getElementById('game-container');
    gameDifficulty = difficulty; // ★ 引数から難易度を反映
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

    // ★ 引継ぎ冒険者がいる場合の処理
    if (inheritedAdventurer) {
        // 新しいIDを割り振り、ランクをGにリセット
        const newAdv = { ...inheritedAdventurer }; // スプレッド構文で基本情報をコピー
        newAdv.skills = { ...inheritedAdventurer.peakSkills }; // peakSkillsをskillsにコピー
        // ★ OVRをスキル値から再計算
        newAdv.ovr = newAdv.skills.combat + newAdv.skills.magic + newAdv.skills.exploration;
        newAdv.age = null; // ★ 年齢をnullに設定
        newAdv.id = nextAdventurerId++;
        newAdv.rank = 'G';
        newAdv.status = '待機中';
        newAdv.exp = 0;
        newAdv.expToLevelUp = 100;
        newAdv.isInherited = true; // 引継ぎフラグ
        newAdv.characterColor = '#FFD700'; // 名前を金色に
        newAdv.name = `👑 ${newAdv.name}`;
        // ★ OVRとGランクを基に年俸を再計算
        newAdv.annualSalary = calculateAnnualSalary(newAdv.ovr, newAdv.rank);

        adventurers.push(newAdv);
        updateAllTimeRecord(newAdv); // 新しいゲームの殿堂にも記録
    }

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
    // ★ 殿堂入りデータから動的属性を復元する
    const pastRecordsForAttributes = JSON.parse(localStorage.getItem('guildSoulHallOfFame') || '{}');
    Object.values(pastRecordsForAttributes).forEach(record => {
        if (record.dynamicAttribute && !ATTRIBUTES[record.attribute]) {
            ATTRIBUTES[record.attribute] = record.dynamicAttribute;
        }
    });

    const pastRecords = JSON.parse(localStorage.getItem('guildSoulHallOfFame') || '{}');

    const homeScreen = document.getElementById('home-screen');
    // ★ 殿堂リストが上から表示されるようにスタイルを調整
    homeScreen.style.justifyContent = 'flex-start';
    homeScreen.style.paddingTop = '40px'; // 上部に余白を追加

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

        // ★ 引継ぎ選択画面が表示されている場合は、そちらも更新する
        const inheritanceModal = document.getElementById('inheritance-selection');
        if (inheritanceModal && inheritanceModal.style.display === 'flex') {
            showInheritanceSelection(selectedDifficulty, isInTutorial);
        }

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
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor}; cursor: pointer;" onclick="showAttributeDetails('${record.attribute}')">${attribute.name}</span>` : 'なし';

        // ★ アバター表示用のHTMLを生成
        let nameCellHtml;
        if (record.avatar) {
            // 冒険者オブジェクトに保存された色相と明るさを使用
            const hairHue = record.avatar.hairHue ?? 0;
            const eyesHue = record.avatar.eyesHue ?? 0;
            const brightness = record.avatar.brightness ?? 1.0;
            const faceStyle = getPartStyle('face', record.avatar.face);
            const backStyle = getPartStyle('back', record.avatar.back);
            const earsStyle = getPartStyle('ears', record.avatar.ears);
            const eyesStyle = getPartStyle('eyes', record.avatar.eyes);
            const hairStyle = getPartStyle('hair', record.avatar.hair);
            const hairFilter = `hue-rotate(${hairHue}deg) saturate(1.5) brightness(${brightness})`;
            hairStyle.filter = hairFilter;
            backStyle.filter = hairFilter;
            eyesStyle.filter = `hue-rotate(${eyesHue}deg) saturate(2) brightness(${brightness * 0.9})`;
            const styleToString = (styleObj) => Object.entries(styleObj).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`).join(';');
            const avatarHtml = `
                <div class="avatar-container">
                    <img src="avatar_parts/back/${record.avatar.back}.svg" class="avatar-part" style="${styleToString(backStyle)}">
                    <img src="avatar_parts/face/${record.avatar.face}.svg" class="avatar-part" style="${styleToString(faceStyle)}">
                    <img src="avatar_parts/ears/${record.avatar.ears}.svg" class="avatar-part" style="${styleToString(earsStyle)}">
                    <img src="avatar_parts/hair/${record.avatar.hair}.svg" class="avatar-part" style="${styleToString(hairStyle)}">
                    <img src="avatar_parts/eyes/${record.avatar.eyes}.svg" class="avatar-part" style="${styleToString(eyesStyle)}">
                </div>`;
            nameCellHtml = `<div class="adventurer-summary">${avatarHtml} <span class="adventurer-name" style="border-bottom: 3px solid ${record.characterColor || '#ccc'}; padding-bottom: 2px;">${record.name}</span></div>`;
        } else {
            nameCellHtml = `<span class="adventurer-name" style="border-bottom: 3px solid ${record.characterColor || '#ccc'}; padding-bottom: 2px;">${record.name}</span>`;
        }

        row.innerHTML = `
            <td>${nameCellHtml}</td><td>${record.gender}</td><td>${attributeHtml}</td><td>${getStyledRankHtml(record.peakRank)}</td>
            <td>${record.peakOvr}</td><td>${record.peakSkills.combat}</td>
            <td>${record.peakSkills.magic}</td><td>${record.peakSkills.exploration}</td>
            <td>${record.peakAge}歳</td><td>${SCOUT_POLICIES[record.recruitedBy]?.name || '不明'}</td>
            <td><button onclick="removeFromHallOfFame(${record.id})">削除</button></td>
        `;
        // ★ 引継ぎ済みの冒険者は名前を金色にする
        if (record.inherited) {
            row.querySelector('.adventurer-name').style.color = '#FFD700';
        }
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
    // ★ 動的に生成された属性も保存対象に含める
    return {
        dataName: dataName || `${currentYear}年${currentMonth}月 ギルドデータ`,
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
        attributes: ATTRIBUTES, // ★ ATTRIBUTESオブジェクトを保存
        quests: quests.map(q => ({ id: q.id, available: q.available })), // クエストの利用可能状態のみ保存
        saveDate: new Date().toLocaleString('ja-JP')
    };
}

/**
 * 指定されたゲーム状態オブジェクトからゲームを復元します。
 * @param {Object} gameState - ゲーム状態オブジェクト
 */
function loadGameState(gameState) {
    // ★ 保存されたATTRIBUTESオブジェクトを復元する
    // これを他のデータより先に復元することで、以降の処理で属性情報を正しく参照できる
    Object.assign(ATTRIBUTES, gameState.attributes || {});

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
    
    // --- オートセーブスロットの表示 ---
    const autosaveKey = 'guildSoulAutosave';
    const autosavedData = JSON.parse(localStorage.getItem(autosaveKey) || 'null');

    const autosaveDiv = document.createElement('div');
    autosaveDiv.className = 'save-slot autosave-slot';
    let autosaveInfo = `<h4>オートセーブ</h4>`;
    if (autosavedData) {
        autosaveInfo += `
            <p class="save-data-name">${autosavedData.dataName || '無題のデータ'}</p>
            <p class="save-data-memo">難易度: ${DIFFICULTY_SETTINGS[autosavedData.difficulty]?.name || '不明'} | ${autosavedData.memo || 'メモはありません'}</p>
            <p class="save-data-details">${autosavedData.currentYear}年 ${autosavedData.currentMonth}月 / 所持金: ${autosavedData.gold}万G</p>
            <p class="save-data-date">保存日時: ${autosavedData.saveDate}</p>
        `;
    } else {
        autosaveInfo += '<p>オートセーブデータはありません</p>';
    }

    const autosaveActionButton = document.createElement('button');
    autosaveActionButton.textContent = 'ロード';
    autosaveActionButton.disabled = !autosavedData;
    autosaveActionButton.onclick = () => loadGame(autosaveKey);
    if (autosavedData) autosaveActionButton.classList.add('save-load-button-active');
    
    autosaveDiv.innerHTML = autosaveInfo;
    if (mode === 'load') { // ロードモードの時だけボタンを追加
        autosaveDiv.appendChild(autosaveActionButton);
    }
    saveLoadSlots.appendChild(autosaveDiv);

    // --- 手動セーブスロットの表示 ---
    for (let i = 1; i <= 3; i++) { // 3つの手動スロット
        const slotKey = `guildSoulSaveSlot${i}`;
        const savedData = JSON.parse(localStorage.getItem(slotKey) || 'null');

        const slotDiv = document.createElement('div');
        slotDiv.className = 'save-slot';

        let slotInfo = `<h4>手動セーブ ${i}</h4>`;
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
            actionButton.onclick = () => saveGame(slotKey);
            actionButton.classList.add('save-load-button-active'); // セーブボタンは常にアクティブ
        } else {
            actionButton.textContent = 'ロード';
            actionButton.disabled = !savedData;
            actionButton.onclick = () => loadGame(slotKey);
            if (savedData) actionButton.classList.add('save-load-button-active'); // データがあればアクティブ
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

/**
 * 現在のゲーム状態を自動セーブします。
 */
function autosaveGame() {
    saveGame('guildSoulAutosave'); // オートセーブ用のキーを使用
}

function saveGame(slotKey) {
    let dataName, memo;
    if (slotKey === 'guildSoulAutosave') {
        dataName = `${currentYear}年${currentMonth}月 オートセーブ`;
        memo = '自動保存されたデータ';
    } else {
        const slotNumber = slotKey.replace('guildSoulSaveSlot', '');
        const defaultName = `${currentYear}年${currentMonth}月 ギルドデータ`;
        dataName = prompt(`セーブデータの名前を入力してください（スロット${slotNumber}）`, defaultName);
        if (dataName === null) {
            return; // ユーザーがキャンセルした場合
        }
        memo = prompt("このセーブデータに関するメモを残しますか？（任意）", "");
        if (memo === null) {
            return; // ユーザーがキャンセルした場合
        }
    }

    const gameState = getGameState(dataName, memo);
    localStorage.setItem(slotKey, JSON.stringify(gameState));
    
    if (slotKey !== 'guildSoulAutosave') {
        alert(`「${dataName}」をスロット${slotKey.replace('guildSoulSaveSlot', '')}にセーブしました。`);
        showSaveLoadModal('save'); // モーダルを再描画して更新を反映
    }
}

function loadGame(slotKey) {
    const savedData = localStorage.getItem(slotKey);
    if (savedData) {
        const slotNumber = slotKey.replace('guildSoulSaveSlot', '');
        const confirmMessage = slotKey === 'guildSoulAutosave'
            ? `オートセーブデータをロードしますか？\n現在のゲーム内容は失われます。`
            : `スロット${slotNumber}のデータをロードしますか？\n現在のゲーム内容は失われます。`;

        if (!confirm(confirmMessage)) return;
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

    // ★ レート対戦のチーム選択をリセット
    selectedRatingTeam = [];

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
            overflow-y: auto; /* ★ スクロールを許可 */
            background: linear-gradient(135deg, #2c3e50, #4a69bd);
            color: #ecf0f1;
            text-align: center;
            font-family: 'Noto Serif JP', serif;
    padding: 15px;
    box-sizing: border-box;
        }
        .home-title {
            font-family: 'Cinzel', serif;
    font-size: clamp(3rem, 10vw, 5rem); /* 画面幅に応じてサイズを調整 */
            font-weight: 700;
            margin-bottom: 10px;
            animation: fadeInDown 1s ease-out;
        }
        .home-subtitle {
    font-size: clamp(1rem, 4vw, 1.5rem); /* 画面幅に応じてサイズを調整 */
            margin-bottom: 40px;
            color: #bdc3c7;
            animation: fadeInUp 1s ease-out 0.5s;
            animation-fill-mode: backwards;
        }
        .home-menu {
            display: flex;
            flex-direction: column;
            width: 100%;
            align-items: center;
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
    width: 100%;
    max-width: 300px; /* 最大幅を設定 */
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
    overflow-x: auto; /* テーブルがはみ出す場合に横スクロールを許可 */
        }
        .projection-summary-panel {
    width: 100%;
    max-width: 280px;
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
        /* 属性詳細モーダルのスタイル */
        .attribute-detail-content {
            background-color: #2c3e50;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #7f8c8d;
    color: #ecf0f1;
            width: 90%;
            max-width: 500px;
        }
        .attribute-detail-content h3 {
            margin-top: 0;
            border-bottom: 1px solid #7f8c8d;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .positive-balance { color: #2ecc71; }
        .negative-balance { color: #e74c3c; }
        
        /* オフシーズンの契約更改ボタンのスタイル */
        .contract-actions button.selected {
            transform: scale(1.05);
            box-shadow: 0 0 10px #f1c40f;
            border-color: #f1c40f;
        }
        .contract-renew-button.selected { background-color: #27ae60; border-color: #2ecc71; }
        .contract-release-button.selected { background-color: #c0392b; border-color: #e74c3c; }

        /* 新しい冒険者カードグリッドのスタイル */
        .adventurer-grid-container {
            display: grid;
            grid-template-columns: 1fr; /* スマホでは1列 */
            gap: 15px;
        }

        .adventurer-info-card {
            background-color: #34495e;
            border: 1px solid #7f8c8d;
            border-radius: 8px;
            padding: 15px;
            display: grid;
            grid-template-areas:
                "header header"
                "avatar stats"
                "exp exp"
                "footer footer";
            grid-template-columns: auto 1fr;
            gap: 10px 15px;
        }

        .adv-card-header { grid-area: header; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #7f8c8d; padding-bottom: 10px; }
        .adv-card-avatar { grid-area: avatar; }
        .adv-card-stats { grid-area: stats; display: flex; flex-direction: column; justify-content: center; gap: 5px; }
        .adv-card-exp { grid-area: exp; }
        .adv-card-footer { grid-area: footer; display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; border-top: 1px solid #7f8c8d; padding-top: 10px; margin-top: 5px;}

        .adv-card-stats p { margin: 0; font-size: 0.9em; }
        .adv-card-footer button { font-size: 0.8em; padding: 4px 8px; margin: 0;}

        /* 中サイズ画面 (例: タブレット) */
        @media (min-width: 769px) {
            .adventurer-grid-container {
                grid-template-columns: repeat(2, 1fr); /* 2列 */
            }
        }

        /* 大サイズ画面 (例: PC) */
        @media (min-width: 1200px) {
            .adventurer-grid-container {
                grid-template-columns: repeat(3, 1fr); /* 3列 */
            }
        }

        /* セーブ/ロードボタンのスタイル */
        .save-load-button-active {
            background-color: #2ecc71; /* 緑色 */
            border-color: #27ae60;
            color: #fff;
        }
        .save-load-button-active:hover {
            background-color: #27ae60;
            border-color: #27ae60;
        }

        /* アクションボタンのスタイル */
        .action-btn-promotion { background-color: #8e44ad; border-color: #9b59b6; color: white; }
        .action-btn-promotion:hover { background-color: #9b59b6; }
        .action-btn-training { background-color: #f39c12; border-color: #f1c40f; color: white; }
        .action-btn-training:hover { background-color: #f1c40f; }
        .action-btn-recommend { background-color: #2980b9; border-color: #3498db; color: white; }
        .action-btn-recommend:hover { background-color: #3498db; }



        /* クエスト表示のレイアウト */
        .quest-layout-container {
            display: flex;
            flex-direction: column; /* 縦並びに変更 */
            gap: 20px;
            width: 100%;
        }
        .quest-top-row {
            display: flex;
            gap: 20px; /* カラム間のスペース */
            width: 100%;
        }

        .quest-column {
            flex: 1; /* 各カラムが均等な幅を占める */
            background-color: #34495e; /* カラムの背景色 */
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #7f8c8d;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        /* 特別訓練カラムのスタイル */
        .training-column {
            border-color: #f1c40f; /* 金色の枠線 */
        }


        .quest-column h2 { /* カラムタイトル */
            margin-top: 0;
            border-bottom: 1px solid #7f8c8d;
            padding-bottom: 10px;
            margin-bottom: 15px;
            color: #ecf0f1;
            text-align: center;
        }

        .quest-item h3 { /* クエストタイトル */
            color: #34495e; /* 明るい青色に変更して視認性を向上 */
            margin-top: 0;
        }
        
        /* 冒険者リストの背景色 */
        .rarity-bg-common {
            background-color: #f8f9fa; /* 少しだけ色がついた白 */
        }
        .rarity-bg-uncommon {
            background: linear-gradient(to bottom, #e9ecef, #ced4da); /* 銀色の光沢 */
        }
        .rarity-bg-rare {
            background: linear-gradient(to bottom, #fff3cd, #f8d775); /* 金色の光沢 */
        }
        .rarity-bg-epic {
            background: linear-gradient(135deg, #6a0dad, #c0392b, #2c3e50, #16a085);
            background-size: 400% 400%;
            animation: epic-bg-anim 15s ease infinite;
            color: #fff; /* テキスト色を白に */
        }
        /* エピック背景を持つ行のテキストシャドウ */
        .rarity-bg-epic td {
            text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
        }

        @keyframes epic-bg-anim {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
        }

        /* 引継ぎ冒険者リストの背景エフェクト */
        .rarity-bg-inherited {
            background: linear-gradient(125deg, #ffffff, #33dcf9ff, #ffd700, #33dcf9ff, #ffffff);
            background-size: 400% 400%;
            animation: inherited-bg-anim 10s ease infinite;
        }
        /* 引継ぎ冒険者のテキストは読みやすいように少し影をつける */
        .rarity-bg-inherited td {
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
        }

        @keyframes inherited-bg-anim {
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
        }





        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    // HTMLを生成
    // ★ レート対戦画面用のスタイルを追加
    style.textContent += `
        .rating-battle-screen {
            display: flex;
            width: 95%;
            height: 90vh;
            max-width: 1400px; /* 最大幅を設定 */
            gap: 20px;
        }
        .rating-left-panel {
            flex: 3;
            overflow-y: auto;
            padding: 15px;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
        }
        .rating-right-panel {
            flex: 2;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
        }
        .adventurer-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
            gap: 15px;
        }
        .adventurer-card {
            position: relative;
            border: 1px solid #7f8c8d;
            border-radius: 8px;
            padding: 5px;
            color: #fff;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
            overflow: hidden;
        }
        .adventurer-card .avatar-container {
            width: 90%;
            height: 75px; /* カード内のアバターサイズを調整 */
            margin-bottom: 5px;
            margin-left: auto;
            margin-right: auto;
        }
        .adventurer-card.selected::after {
            content: '✔';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            color: #2ecc71;
            text-shadow: 0 0 10px rgba(0,0,0,0.8);
            opacity: 0.8;
            pointer-events: none; /* チェックマークがクリックを妨げないように */
        }
        /* レート対戦演出用のスタイル */
        #battle-arena {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }
        .team-display {
            display: flex;
            gap: 30px;
        }
        .team-display .adventurer-card {
            width: 160px; /* 幅を少し広げる */
            /* height: 220px; */ /* 高さを削除 */
            aspect-ratio: 160 / 220; /* 縦横比を固定 */
            display: flex; 
            flex-direction: column;
            justify-content: center;
            transition: all 0.3s ease;
            border: 3px solid #7f8c8d;
        }
        .team-display .adventurer-card.fighting {
            transform: scale(1.1);
            border-color: #f1c40f;
            box-shadow: 0 0 15px #f1c40f;
        }
        .team-display .adventurer-card.defeated {
            filter: grayscale(100%);
            opacity: 0.6;
        }
        #vs-separator {
            font-size: clamp(1.5rem, 5vw, 2.5rem);
            font-family: 'Cinzel', serif;
            color: #e74c3c;
            text-shadow: 0 0 8px #c0392b;
        }
        .result-modal {
            background: rgba(44, 62, 80, 0.9);
            padding: 40px;
            border-radius: 15px;
        }
        /* ★ 対戦開始ボタン用のスタイル */
        .preparation-screen .start-battle-button {
            background-color: #27ae60; /* 緑色で開始を促す */
        }
        .preparation-screen {
            background: rgba(44, 62, 80, 0.9);
            padding: 40px;
            border-radius: 15px;
            text-align: center;
            max-height: 90vh; /* 画面の高さを超えないように */
            overflow-y: auto; /* 高さを超えた場合はスクロール */
        }
        .preparation-screen h2 {
            margin-top: 0;
            font-family: 'Cinzel', serif;
        }
        #battle-arena-preview {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 15px;
            margin-top: 20px;
        }
        .team-display .adventurer-card .avatar-container {
            height: 100px; /* 対戦カード内のアバター高さを調整 */
        }
        /* カードの名前が1行に収まるように調整 */
        .card-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }


        .adventurer-card .avatar-container {
            width: 75%;
            height: 75px; /* カード内のアバターサイズを調整 */
            margin-bottom: 5px;
        }
        .card-ovr { position: absolute; top: 2px; right: 5px; font-size: 1.5rem; font-weight: bold; z-index: 45; }
        .card-attribute {
            position: absolute; 
            top: 5px; 
            left: 5px; 
            transform: scale(1.1);
            transform-origin: top left;
            z-index: 50; /* アバター(z-index: 40)より手前に表示 */
        }
        .card-stats { text-align: center; font-size: 0.7em; word-break: keep-all; white-space: nowrap; }
        .card-rank { text-align: center; font-size: 0.9em; margin-top: 2px; }
        .rating-history {
            width: 100%;
            background: #2c3e50;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            text-align: center;
        }
        .rating-history h3 { margin-top: 0; }
        #match-start-button {
            padding: 15px 40px;
            font-size: 1.5rem;
        }
        #selected-rating-adventurers-container {
            width: 90%;
            margin-top: 20px;
            text-align: center;
        }
        #selected-rating-adventurers { min-height: 140px; /* 選択済みカードエリアの最低限の高さを確保 */ }
    `;

    // ★ レート対戦のボーナスアニメーション用スタイルを追加
    style.textContent += `
        .stat-bonus-animation {
            position: absolute;
            top: 45%; /* 少し上に表示 */
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: clamp(1.1rem, 4vw, 1.6rem); /* 画面幅に応じてサイズを調整 */
            font-weight: bold;
            text-shadow: 0 0 5px black, 0 0 8px black;
            opacity: 0;
            animation: bonus-anim 1.4s ease-out forwards;
            animation: bonus-anim 1.4s ease-out forwards; /* アニメーション自体は素早く */
            pointer-events: none;
            z-index: 100; /* 最前面に表示 */
        }
        /* ルーレット演出用のハイライト */
        .roulette-highlight-player, .roulette-highlight-opponent {
            box-shadow: 0 0 20px 10px #f1c40f;
            transform: scale(1.05);
            border-color: #f1c40f !important;
            transition: transform 0.1s ease-out, box-shadow 0.1s ease-out;
        }
        @keyframes bonus-anim {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
            50% { transform: translate(-50%, -80%) scale(1.2); opacity: 1; }
            100% { transform: translate(-50%, -120%) scale(1); opacity: 0; }
            100% { transform: translate(-50%, -120%) scale(1); opacity: 1; } /* 100%でopacity:1を維持 */
        }
    `;

    // ★★★ レスポンシブ対応のためのメディアクエリを追加 ★★★
    style.textContent += `
        @media (max-width: 768px) {
            .home-title {
                text-shadow: 2px 2px 6px rgba(0,0,0,0.5);
            }
            .adventurer-list-wrapper, .quest-top-row, .rating-battle-screen {
                flex-direction: column;
            }
            .projection-summary-panel {
                width: 100%;
                max-width: 100%;
                margin-top: 20px;
            }
            .quest-column {
                width: 100%;
            }
            .rating-battle-screen {
                height: auto;
                width: 100%;
            }
            .rating-left-panel, .rating-right-panel {
                width: 100%;
                flex: none;
            }
            .team-display {
                gap: 5px;
                flex-wrap: wrap; /* 画面が狭い場合は折り返す */
                justify-content: center;
            }
            .team-display .adventurer-card {
                width: 100px;
                /* height: 160px; */ /* 高さを削除し、aspect-ratioを適用 */
            }
            .team-display .adventurer-card .avatar-container {
                height: 60px;
            }
            .card-attribute {
                transform: scale(0.9); /* 属性アイコンを少し小さく */
            }
        }
    `;

    homeScreen.innerHTML = `
        <h1 class="home-title">Guild Soul</h1>
        <p class="home-subtitle">- ギルド運営シミュレーション -</p>
        <div id="main-menu" class="home-menu">
            <button onclick="showDifficultySelection()">はじめから</button>
            <button onclick="showSaveLoadModal('load')">ロード</button>
            <button onclick="showPastRecords()">過去の記録</button>
            <button onclick="showRatingBattleScreen()">レート対戦</button>
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
            <button onclick="showInheritanceSelection(selectedDifficulty, true)">チュートリアル有り</button>
            <button onclick="showInheritanceSelection(selectedDifficulty, false)">チュートリアル無し</button>
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
 * ホーム画面で「はじめから」が押されたときに、難易度選択画面を表示します。
 */
function showDifficultySelection() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('difficulty-selection').style.display = 'flex';
}

/**
 * 難易度選択画面などからメインメニューに戻ります。
 */
function showMainMenu() {
    document.getElementById('difficulty-selection').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

/**
 * 難易度が選択された後、チュートリアルの有無を選択する画面を表示します。
 * @param {string} difficulty - 'easy' または 'hard'
 */
function showTutorialSelection(difficulty) {
    selectedDifficulty = difficulty;
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
 * チュートリアルの有無が決定した後、ゲームを開始します。
 * （現状は引継ぎ機能がないため、直接ゲーム開始関数を呼び出します）
 * @param {string} difficulty - 'easy' または 'hard'
 * @param {boolean} withTutorial - チュートリアルを実行するかどうか
 */
function showInheritanceSelection(difficulty, withTutorial) {
    // 将来的に引継ぎ冒険者選択画面をここに実装する
    // 現状は引継ぎなしでゲームを開始
    startGame(withTutorial, difficulty, null);
}

/**
 * [未実装] 引継ぎ冒険者選択画面を表示します。
 * @param {string} difficulty 
 * @param {boolean} withTutorial 
 */
function showInheritanceSelection(difficulty, withTutorial) {
    // この関数は将来の引継ぎ機能のために予約されています。
    // 現時点では、引継ぎなしで直接ゲームを開始します。
    startGame(withTutorial, difficulty, null);
}

// --- レート対戦用の状態 ---
let selectedRatingTeam = []; // 選択された冒険者のIDを保持する配列
let playerRating = 1500;
let ratingBattleHistory = [];
const RATING_K_FACTOR = 32; // レートの変動幅を決定する定数
const RATING_DATA_KEY = 'guildSoulRatingData'; // localStorage用のキー

/**
 * localStorageからレート情報を読み込みます。
 */
function loadRatingData() {
    const savedData = JSON.parse(localStorage.getItem(RATING_DATA_KEY));
    if (savedData) {
        playerRating = savedData.rating || 1500;
        ratingBattleHistory = savedData.history || [];
    }
}

/**
 * レート対戦中にステータスボーナスの演出を表示します。
 * @param {HTMLElement} cardElement - 対象となる冒d険者のカード要素
 * @param {string} statName - '戦闘', '魔法', '探索' のいずれか
 * @param {number} bonusAmount - 加算するボーナス量
 */
function showStatBonusAnimation(cardElement, statName, bonusAmount) {
    // 1. 中央に表示するアニメーション (+10 戦闘 など)
    const bonusText = document.createElement('div');
    bonusText.textContent = `+${bonusAmount} ${statName}`;
    bonusText.className = 'stat-bonus-animation';
    const colors = { '戦闘': '#e74c3c', '魔法': '#3498db', '探索': '#2ecc71' };
    bonusText.style.color = colors[statName] || '#ffffff';
    cardElement.appendChild(bonusText);

    setTimeout(() => {
        bonusText.remove();
    }, 1400); // 1.4秒 (CSSアニメーションのduration)

    // 2. 右上のOVR表示を更新
    const ovrContainer = cardElement.querySelector('.card-ovr');
    if (ovrContainer) {
        const bonusDisplay = ovrContainer.querySelector('.bonus-ovr-display');
        const currentOvrValueEl = ovrContainer.querySelector('.current-ovr-value');

        const currentBonus = parseInt(bonusDisplay.textContent.replace('+', '')) || 0;
        const newBonus = currentBonus + bonusAmount;

        const originalOvr = parseInt(ovrContainer.dataset.originalOvr);
        const newOvr = originalOvr + newBonus;

        bonusDisplay.textContent = `+${newBonus}`;
        currentOvrValueEl.textContent = newOvr;
        ovrContainer.classList.add('bonus-active');
    }
}

/**
 * レート対戦画面を表示します。
 */
function showRatingBattleScreen() {
    const homeScreen = document.getElementById('home-screen');
      // ★ レート対戦画面が上から表示されるようにスタイルを調整
    homeScreen.style.justifyContent = 'flex-start';
    homeScreen.style.paddingTop = '20px'; // 上部に少し余白を追加
    homeScreen.style.paddingBottom = '20px'; // 下部にも余白を追加

    homeScreen.innerHTML = ''; // 一旦クリア
    homeScreen.innerHTML = `
        <div id="rating-battle-overlay" class="modal-overlay" style="display: none; flex-direction: column; color: white; font-size: 1.5rem;">
            <!-- 対戦演出用のオーバーレイ -->
        </div>
        <h1 class="home-title" style="font-size: 3rem; margin-bottom: 20px;">Rating Battle</h1>
        <div class="rating-battle-screen">
            <div class="rating-left-panel">
                <h2>殿堂入り冒険者選択</h2>
                <div id="adventurer-card-list" class="adventurer-card-grid">
                    <!-- 冒険者カードがここに挿入されます -->
                </div>
            </div>
            <div class="rating-right-panel">
                <div class="rating-history">
                    <h3>対戦成績</h3>
                    <p>レート: <strong id="player-rating">${playerRating}</strong></p>
                    <p id="rating-history-summary">過去0戦: 0勝 0敗</p>
                </div>
                <button id="match-start-button" class="home-menu button" onclick="findOpponentAndShowPreparation()" disabled>マッチ開始 (3人選択)</button>
                <div id="selected-rating-adventurers-container">
                    <h4>選択中のチーム</h4>
                    <div id="selected-rating-adventurers" class="adventurer-card-grid">
                        <!-- 選択された冒険者カードがここに移動します -->
                    </div>
                </div>
            </div>
        </div>
        <button class="home-menu button" onclick="renderStylishHomeScreen()" style="margin-top: 15px; min-width: 250px;">ホームに戻る</button>
    `;

    loadRatingData(); // 画面表示時にレートを読み込む
    renderRatingBattleAdventurerCards();
    updateRatingBattleUI();
}

/**
 * レート対戦画面に殿堂入り冒険者のカードを描画します。
 */
function renderRatingBattleAdventurerCards() {
    // ★ レート対戦画面を開く際に、殿堂入りデータから動的属性を復元する
    const pastRecordsForAttributes = JSON.parse(localStorage.getItem('guildSoulHallOfFame') || '{}');
    Object.values(pastRecordsForAttributes).forEach(record => {
        if (record.dynamicAttribute && !ATTRIBUTES[record.attribute]) {
            ATTRIBUTES[record.attribute] = record.dynamicAttribute;
        }
    });

    const container = document.getElementById('adventurer-card-list');
    container.innerHTML = ''; // コンテナをクリア
    const pastRecords = JSON.parse(localStorage.getItem('guildSoulHallOfFame') || '{}');
    const inheritableAdventurers = Object.values(pastRecords);

    if (inheritableAdventurers.length === 0) {
        container.innerHTML = '<p>レート対戦に参加できる殿堂入り冒険者がいません。</p>';
        return;
    }

    inheritableAdventurers.sort((a, b) => b.peakOvr - a.peakOvr).forEach(record => {
        if (selectedRatingTeam.includes(record.id)) return; // 既に選択されている場合は描画しない
        const card = document.createElement('div');
        
        // ★ ランクに応じて背景色を決定するロジック
        const rankIndex = RANKS.indexOf(record.peakRank);
        let rarityClass;
        if (rankIndex >= RANKS.indexOf('XG')) {
            rarityClass = 'rarity-bg-epic';
        } else if (rankIndex >= RANKS.indexOf('A')) {
            rarityClass = 'rarity-bg-rare';
        } else if (rankIndex >= RANKS.indexOf('D')) {
            rarityClass = 'rarity-bg-uncommon';
        } else {
            rarityClass = 'rarity-bg-common';
        }

        if (record.isInherited) {
            rarityClass = 'rarity-bg-inherited';
        }
        card.className = `adventurer-card ${rarityClass}`;
        card.id = `rating-card-${record.id}`;
        card.onclick = () => toggleRatingAdventurerSelection(record.id);

        const attribute = ATTRIBUTES[record.attribute];
        const textColor = getContrastColor(attribute?.color);
        const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor};">${attribute.name}</span>` : 'なし';

        // アバターHTMLの生成
        // ★ 名前表示用のスタイルを定義
        let nameStyle = `border-bottom: 3px solid ${record.characterColor || '#ccc'}; padding-bottom: 2px;`;
        if (record.isInherited) {
            nameStyle += `color: #FFD700; text-shadow: 0 0 5px #FFD700, 0 0 8px #FFD700;`;
        }
        let avatarHtml = '<div class="avatar-container"></div>'; // フォールバック
        if (record.avatar) {
            const hairHue = record.avatar.hairHue ?? 0;
            const eyesHue = record.avatar.eyesHue ?? 0;
            const brightness = record.avatar.brightness ?? 1.0;
            const faceStyle = getPartStyle('face', record.avatar.face);
            const backStyle = getPartStyle('back', record.avatar.back);
            const earsStyle = getPartStyle('ears', record.avatar.ears);
            const eyesStyle = getPartStyle('eyes', record.avatar.eyes);
            const hairStyle = getPartStyle('hair', record.avatar.hair);
            const hairFilter = `hue-rotate(${hairHue}deg) saturate(1.5) brightness(${brightness})`;
            hairStyle.filter = hairFilter;
            backStyle.filter = hairFilter;
            eyesStyle.filter = `hue-rotate(${eyesHue}deg) saturate(2) brightness(${brightness * 0.9})`;
            const styleToString = (styleObj) => Object.entries(styleObj).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`).join(';');
            avatarHtml = `
                <div class="avatar-container">
                    <img src="avatar_parts/back/${record.avatar.back}.svg" class="avatar-part" style="${styleToString(backStyle)}">
                    <img src="avatar_parts/face/${record.avatar.face}.svg" class="avatar-part" style="${styleToString(faceStyle)}">
                    <img src="avatar_parts/ears/${record.avatar.ears}.svg" class="avatar-part" style="${styleToString(earsStyle)}">
                    <img src="avatar_parts/hair/${record.avatar.hair}.svg" class="avatar-part" style="${styleToString(hairStyle)}">
                    <img src="avatar_parts/eyes/${record.avatar.eyes}.svg" class="avatar-part" style="${styleToString(eyesStyle)}">
                </div>`;
        }

        card.innerHTML = `
            <div class="card-ovr">${record.peakOvr}</div>
            <div class="card-attribute">${attributeHtml}</div>
            ${avatarHtml}
            <div class="card-name" style="text-align: center;"><span class="adventurer-name" style="${nameStyle}">${record.name}</span></div>
            <div class="card-stats">戦:${record.peakSkills.combat} / 魔:${record.peakSkills.magic} / 探:${record.peakSkills.exploration}</div>
            <div class="card-rank">${getStyledRankHtml(record.peakRank)}</div>
        `;
        container.appendChild(card);
    });
}

/**
 * レート対戦の冒険者選択を切り替えます。
 * @param {number} advId - 冒険者のID
 */
function toggleRatingAdventurerSelection(advId) {
    const card = document.getElementById(`rating-card-${advId}`);
    if (!card) return;

    const isSelected = selectedRatingTeam.includes(advId);

    if (isSelected) {
        // 選択解除
        selectedRatingTeam = selectedRatingTeam.filter(id => id !== advId);
        card.classList.remove('selected');
        document.getElementById('adventurer-card-list').prepend(card); // 元のリストの先頭に戻す
    } else {
        // 選択
        if (selectedRatingTeam.length >= 3) {
            alert('チームは3人まで選択できます。');
            return;
        }
        selectedRatingTeam.push(advId);
        card.classList.add('selected');
        document.getElementById('selected-rating-adventurers').appendChild(card); // 選択済みエリアに移動
    }

    updateRatingBattleUI();
}

/**
 * レート対戦画面のUI（ボタンの状態など）を更新します。
 */
function updateRatingBattleUI() {
    const matchStartButton = document.getElementById('match-start-button');
    if (!matchStartButton) return;

    const selectedCount = selectedRatingTeam.length;

    if (selectedCount === 3) {
        matchStartButton.disabled = false;
        matchStartButton.textContent = 'マッチ開始';
    } else {
        matchStartButton.disabled = true;
        matchStartButton.textContent = `マッチ開始 (${selectedCount}/${3}人)`;
    }

    // レートと戦績表示を更新
    const ratingEl = document.getElementById('player-rating');
    if(ratingEl) ratingEl.textContent = playerRating;

    const historySummaryEl = document.getElementById('rating-history-summary');
    if(historySummaryEl) {
        const wins = ratingBattleHistory.filter(h => h.result === 'win').length;
        const losses = ratingBattleHistory.length - wins;
        historySummaryEl.textContent = `過去${ratingBattleHistory.length}戦: ${wins}勝 ${losses}敗`;
    }


    // 選択済みカードの並び順を更新
    const selectedContainer = document.getElementById('selected-rating-adventurers');
    const cards = Array.from(selectedContainer.children);
    cards.sort((a, b) => {
        const idA = parseInt(a.id.replace('rating-card-', ''));
        const idB = parseInt(b.id.replace('rating-card-', ''));
        return selectedRatingTeam.indexOf(idA) - selectedRatingTeam.indexOf(idB);
    });
    cards.forEach(card => selectedContainer.appendChild(card));

    // 元のリストの並び順も更新（ソートし直して再描画）
    renderRatingBattleAdventurerCards();
}

/**
 * レート対戦のマッチングを開始し、対戦準備画面を表示します。
 */
async function findOpponentAndShowPreparation() {
    if (selectedRatingTeam.length !== 3) {
        alert('チームメンバーを3人選択してください。');
        return;
    }

    const overlay = document.getElementById('rating-battle-overlay');
    overlay.style.display = 'flex';
    overlay.innerHTML = `<p id="matching-text">対戦相手を探しています</p>`;

    // マッチング中のテキストアニメーション
    const matchingText = document.getElementById('matching-text');
    let dotCount = 1;
    const matchingInterval = setInterval(() => {
        matchingText.textContent = `対戦相手を探しています${'.'.repeat(dotCount)}`;
        dotCount = (dotCount % 3) + 1;
    }, 500);

    // 3〜5秒待機
    const matchingTime = Math.random() * 200 + 100; // 1〜3秒待機に変更
    await new Promise(resolve => setTimeout(resolve, matchingTime));

    clearInterval(matchingInterval);

    // チーム情報を準備
    const pastRecords = JSON.parse(localStorage.getItem('guildSoulHallOfFame') || '{}');
    const playerTeam = selectedRatingTeam.map(id => pastRecords[id]).filter(adv => adv !== undefined);

    // 1. 対戦相手のレートを決定 (自分のレート ±50)
    const opponentRating = Math.round(playerRating + (Math.random() * 101) - 50);
    // 2. 相手のレートに基づいてチームを生成
    const opponentTeam = generateOpponentTeam(opponentRating);

    // 3. 対戦準備画面を表示
    overlay.innerHTML = `
        <div class="preparation-screen">
            <h2>対戦準備</h2>
            <p>対戦相手が見つかりました。編成を確認して対戦を開始してください。</p>
            <div id="battle-arena-preview">
                <div>
                    <p style="text-align: center; margin-bottom: 5px;">相手チーム (レート: ${opponentRating})</p>
                    <div id="opponent-team-display" class="team-display"></div>
                </div>
                <div id="vs-separator">VS</div>
                <div>
                    <p style="text-align: center; margin-bottom: 5px;">自チーム (レート: ${playerRating})</p>
                    <div id="player-team-display" class="team-display"></div>
                </div>
            </div>
            <button class="home-menu button start-battle-button" style="margin-top: 20px;" onclick='startRatingMatch(${JSON.stringify(playerTeam)}, ${JSON.stringify(opponentTeam)}, ${opponentRating})'>対戦開始</button>
        </div>
    `;

    const playerTeamDisplay = document.getElementById('player-team-display');
    const opponentTeamDisplay = document.getElementById('opponent-team-display');

    playerTeam.forEach(adv => playerTeamDisplay.appendChild(createBattleCard(adv, true)));
    opponentTeam.forEach(adv => opponentTeamDisplay.appendChild(createBattleCard(adv, false)));
}

/**
 * レート対戦用の対戦相手チームを生成します。
 * @param {number} targetRating - 目標とするチームの平均レート（OVR）
 * @returns {Array<Object>} 3人の対戦相手冒険者の配列
 */
function generateOpponentTeam(targetRating) {
    const opponentTeam = [];
    for (let i = 0; i < 3; i++) {
        // 1. OVRを決定 (目標レートを中心に±100の範囲)
        const initialOvr = Math.max(100, Math.round(targetRating / 3 - 200 + (Math.random() * 61) - 30));

        // 2. 属性をランダムに決定 (generateAdventurerから流用)
        const rand = Math.random();
        let rarity;
        if (rand < 0.02) rarity = 'Epic';
        else if (rand < 0.12) rarity = 'Rare';
        else if (rand < 0.42) rarity = 'Uncommon';
        else rarity = 'Common';

        const possibleAttributes = Object.keys(ATTRIBUTES).filter(key => ATTRIBUTES[key].rarity === rarity);
        const selectedAttributeKey = possibleAttributes[Math.floor(Math.random() * possibleAttributes.length)];
        const attribute = ATTRIBUTES[selectedAttributeKey];

        // 3. 性別、名前、アバターを生成
        const gender = Math.random() < 0.5 ? '男性' : '女性';
        const name = gender === '男性'
            ? namesMale[Math.floor(Math.random() * namesMale.length)]
            : namesFemale[Math.floor(Math.random() * namesFemale.length)];

        const originalAttributeName = attribute?.name.replace('+', '');
        const baseHue = ELEMENT_HUES[originalAttributeName] ?? null;
        const brightness = ELEMENT_BRIGHTNESS[originalAttributeName] ?? 1.0;
        const hairHue = baseHue !== null ? baseHue + (Math.random() * 20 - 10) : 0;
        const eyesHue = baseHue !== null ? baseHue + (Math.random() * 20 - 10) : 0;

        const avatar = {
            face: selectAvatarPart('face', gender),
            hair: selectAvatarPart('hair', gender),
            back: selectAvatarPart('back', gender),
            eyes: selectAvatarPart('eyes', gender),
            ears: selectAvatarPart('ears', gender),
            hairHue: hairHue,
            eyesHue: eyesHue,
            brightness: brightness
        };

        // 4. 各ステータスを OVR/3 ±10 で生成し、合計値を新しいOVRとする
        const baseStat = initialOvr / 3;
        const combat = Math.max(0, Math.round(baseStat + (Math.random() * 21) - 10));
        const magic = Math.max(0, Math.round(baseStat + (Math.random() * 21) - 10));
        const exploration = Math.max(0, Math.round(baseStat + (Math.random() * 21) - 10));

        const finalOvr = combat + magic + exploration;

        opponentTeam.push({
            rank: getRankFromOVR(finalOvr), // ★ OVRに基づいてランクを割り当てる
            ovr_id: i, // チーム内での一意なID
            name: name,
            ovr: finalOvr,
            attribute: selectedAttributeKey,
            skills: { combat, magic, exploration },
            avatar: avatar,
        });
    }
    return opponentTeam;
}

/**
 * 対戦相手をランダムに選択するルーレット演出を表示します。
 * @param {Array<Object>} team - 冒険者オブジェクトの配列
 * @param {string} teamType - 'player' または 'opponent'
 * @param {Array<number>} availableIndices - 選択可能なインデックスの配列
 * @returns {Promise<number>} 選択された冒険者のインデックス
 */
function runMatchupRoulette(team, teamType, availableIndices) {
    return new Promise(resolve => {
        let highlightIndex = 0;
        const rouletteInterval = setInterval(() => {
            // 前のハイライトを消す
            const previouslyHighlightedCard = document.querySelector(`.roulette-highlight-${teamType}`);
            if (previouslyHighlightedCard) {
                previouslyHighlightedCard.classList.remove(`roulette-highlight-${teamType}`);
            }

            // 次のカードをハイライト
            const currentIndex = availableIndices[highlightIndex % availableIndices.length];
            const cardId = teamType === 'player' ? `battle-card-player-${team[currentIndex].id}` : `battle-card-opponent-${currentIndex}`;
            const card = document.getElementById(cardId);
            if (card) {
                card.classList.add(`roulette-highlight-${teamType}`);
            }
            highlightIndex++;
        }, 100); // 100ミリ秒ごとにハイライトを移動

        // 1.5秒後にルーレットを停止
        setTimeout(() => {
            clearInterval(rouletteInterval);
            const finalIndex = Math.floor(Math.random() * availableIndices.length);
            const selectedAdventurerIndex = availableIndices[finalIndex];
            resolve(selectedAdventurerIndex);
        }, 1500);
    });
}

/**
 * レート対戦中に固有スキルの演出を表示します。
 * @param {HTMLElement} cardElement - 対象となる冒険者のカード要素
 * @param {string} skillName - スキル名
 * @param {number} bonusAmount - 加算するボーナス量
 */
function showUniqueSkillAnimation(cardElement, skillName, bonusAmount) {
    return new Promise(resolve => {
        // スキル名を表示
        const skillNameText = document.createElement('div');
        skillNameText.textContent = `【${skillName}】`;
        skillNameText.className = 'stat-bonus-animation';
        skillNameText.style.color = '#f1c40f'; // 金色
        skillNameText.style.fontSize = 'clamp(1.3rem, 5vw, 2rem)'; // スキル名は少し大きめに
        cardElement.appendChild(skillNameText);
        
        // 1秒後にテキストを削除し、Promiseを解決
        setTimeout(() => {
            skillNameText.remove();
            resolve();
        }, 1000);
    });
}
/**
 * レート対戦の3本勝負を実行します。
 */
async function startRatingMatch(playerTeam, opponentTeam, opponentRating) {
    const overlay = document.getElementById('rating-battle-overlay');

    // 対戦画面を生成
    overlay.innerHTML = `
        <div id="battle-arena">
            <div id="opponent-team-display" class="team-display"></div>
            <div id="vs-separator">VS</div>
            <div id="player-team-display" class="team-display"></div>
        </div>
    `;

    const playerTeamDisplay = document.getElementById('player-team-display');
    const opponentTeamDisplay = document.getElementById('opponent-team-display');

    playerTeam.forEach(adv => playerTeamDisplay.appendChild(createBattleCard(adv, true)));
    opponentTeam.forEach(adv => opponentTeamDisplay.appendChild(createBattleCard(adv, false)));

    await new Promise(resolve => setTimeout(resolve, 1000)); // 画面表示のウェイト

    // 3本勝負の開始
    let playerWins = 0;
    let opponentWins = 0;

    // 対戦可能な選手リストを準備
    let availablePlayerIndices = [0, 1, 2];
    let availableOpponentIndices = [0, 1, 2];

    // 対戦開始前に全カードのOVR表示をリセット
    const allBattleCards = document.querySelectorAll('#battle-arena .adventurer-card');
    allBattleCards.forEach(card => {
        const ovrContainer = card.querySelector('.card-ovr');
        if (ovrContainer) {
            ovrContainer.classList.remove('bonus-active');
            const bonusDisplay = ovrContainer.querySelector('.bonus-ovr-display');
            const currentOvrValueEl = ovrContainer.querySelector('.current-ovr-value');
            if (bonusDisplay && currentOvrValueEl) {
                const originalOvr = ovrContainer.dataset.originalOvr;
                bonusDisplay.textContent = '';
                currentOvrValueEl.textContent = originalOvr;
            }
        }
    });

    for (let i = 0; i < 3; i++) {
        // ルーレットで対戦相手を決定
        const [playerIndex, opponentIndex] = await Promise.all([
            runMatchupRoulette(playerTeam, 'player', availablePlayerIndices),
            runMatchupRoulette(opponentTeam, 'opponent', availableOpponentIndices)
        ]);

        // 対戦相手が確定したら、ハイライトを消す
        document.querySelectorAll('.roulette-highlight-player, .roulette-highlight-opponent').forEach(el => el.classList.remove('roulette-highlight-player', 'roulette-highlight-opponent'));

        const playerCard = document.getElementById(`battle-card-player-${playerTeam[playerIndex].id}`);
        const opponentCard = document.getElementById(`battle-card-opponent-${opponentIndex}`);

        // 1. 対戦カードをハイライト
        playerCard.classList.add('fighting');
        opponentCard.classList.add('fighting');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. ステータス比較とボーナス加算
        let playerBonusOvr = playerTeam[playerIndex].peakOvr;
        let opponentBonusOvr = opponentTeam[opponentIndex].ovr;
        const playerSkills = playerTeam[playerIndex].peakSkills;
        const opponentSkills = opponentTeam[opponentIndex].skills;

        const stats = ['combat', 'magic', 'exploration'];
        const statNames = { combat: '戦闘', magic: '魔法', exploration: '探索' };

        for (const stat of stats) {
            if (playerSkills[stat] > opponentSkills[stat]) {
                playerBonusOvr += 10;
                showStatBonusAnimation(playerCard, statNames[stat], 10);
            } else if (opponentSkills[stat] > playerSkills[stat]) {
                opponentBonusOvr += 10;
                showStatBonusAnimation(opponentCard, statNames[stat], 10);
            }
            await new Promise(resolve => setTimeout(resolve, 500)); // 各ステータス比較の間にウェイト
        }

        await new Promise(resolve => setTimeout(resolve, 1500)); // ボーナス演出全体のウェイト

        // ★★★ 固有スキル発動チェック ★★★
        const initialOvrDiff = playerBonusOvr - opponentBonusOvr;

        // プレイヤーのスキル
        const playerAttribute = ATTRIBUTES[playerTeam[playerIndex].attribute];
        // '+'付き属性の場合、元の属性名を取得
        const playerBaseAttributeName = playerAttribute.name.replace('+', '');
        const playerSkill = ATTRIBUTE_UNIQUE_SKILLS[playerBaseAttributeName];

        if (playerSkill && playerSkill.condition(initialOvrDiff)) {
            await showUniqueSkillAnimation(playerCard, playerSkill.name);
            playerBonusOvr += playerSkill.effect;
            showStatBonusAnimation(playerCard, 'OVR', playerSkill.effect);
        }

        // 相手のスキル
        const opponentAttribute = ATTRIBUTES[opponentTeam[opponentIndex].attribute];
        const opponentBaseAttributeName = opponentAttribute.name.replace('+', '');
        const opponentSkill = ATTRIBUTE_UNIQUE_SKILLS[opponentBaseAttributeName];

        // 相手視点でのOVR差は符号が逆になる
        if (opponentSkill && opponentSkill.condition(-initialOvrDiff)) {
            await showUniqueSkillAnimation(opponentCard, opponentSkill.name);
            opponentBonusOvr += opponentSkill.effect;
            showStatBonusAnimation(opponentCard, 'OVR', opponentSkill.effect);
        }

        // 固有スキルが両方発動する場合を考慮して、少し待機時間を設ける
        await new Promise(resolve => setTimeout(resolve, 1000));
        // 3. 最終的なOVRで勝敗を判定
        // OVRが高い方が必ず勝利。同値の場合はランダム。
        const playerWon = playerBonusOvr > opponentBonusOvr 
            ? true 
            : (playerBonusOvr === opponentBonusOvr ? Math.random() < 0.5 : false);

        if (playerWon) {
            playerWins++;
            opponentCard.classList.add('defeated');
            playerCard.style.borderColor = '#2ecc71'; // 勝利したカードの枠を緑に
        } else {
            opponentWins++;
            playerCard.classList.add('defeated');
            opponentCard.style.borderColor = '#2ecc71'; // 勝利したカードの枠を緑に
        }

        // 対戦済みの選手をリストから除外
        availablePlayerIndices = availablePlayerIndices.filter(idx => idx !== playerIndex);
        availableOpponentIndices = availableOpponentIndices.filter(idx => idx !== opponentIndex);


        // 4. ハイライト解除
        playerCard.classList.remove('fighting');
        opponentCard.classList.remove('fighting');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // ラウンド終了後、対戦したカードのOVR表示をリセット
        [playerCard, opponentCard].forEach(card => {
            const ovrContainer = card.querySelector('.card-ovr');
            if (ovrContainer) {
                const bonusDisplay = ovrContainer.querySelector('.bonus-ovr-display');
                const currentOvrValueEl = ovrContainer.querySelector('.current-ovr-value');
                if (bonusDisplay && currentOvrValueEl) {
                    ovrContainer.classList.remove('bonus-active');
                    const originalOvr = ovrContainer.dataset.originalOvr;
                    bonusDisplay.textContent = '';
                    currentOvrValueEl.textContent = originalOvr;
                }
            }
        });
        await new Promise(resolve => setTimeout(resolve, 500)); // リセット後のウェイト
    }

    // 総合結果の判定とレート計算
    const isOverallWin = playerWins > opponentWins;
    const opponentTeamOvr = opponentTeam.reduce((sum, adv) => sum + adv.ovr, 0);
    
    // 3. イロレーティングの計算式で勝率を予測 (OVRではなくレートを使用)
    const winProbability = 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
    const actualScore = isOverallWin ? 1 : 0;
    const ratingChange = Math.round(RATING_K_FACTOR * (actualScore - winProbability));
    const newRating = playerRating + ratingChange;

    // 結果を履歴に保存
    ratingBattleHistory.push({
        result: isOverallWin ? 'win' : 'lose',
        opponentOvr: opponentTeamOvr,
        ratingChange: ratingChange,
        newRating: newRating
    });
    if (ratingBattleHistory.length > 10) {
        ratingBattleHistory.shift();
    }

    // レートを更新して保存
    playerRating = newRating;
    localStorage.setItem(RATING_DATA_KEY, JSON.stringify({ rating: playerRating, history: ratingBattleHistory }));

    // リザルト画面を表示
    await new Promise(resolve => setTimeout(resolve, 1000));
    overlay.innerHTML = `
        <div class="result-modal">
            <h2 class="${isOverallWin ? 'win-text' : 'lose-text'}">${isOverallWin ? '🎉 VICTORY 🎉' : '😥 DEFEAT 😥'}</h2>
            <p>${playerWins} - ${opponentWins}</p>
            <hr>
            <p>レート変動: <span style="font-weight: bold; color: ${ratingChange >= 0 ? '#2ecc71' : '#e74c3c'};">${ratingChange > 0 ? '+' : ''}${ratingChange}</span></p>
            <p>新しいレート: <strong>${newRating}</strong></p>
            <button onclick="closeRatingResult()">閉じる</button>
        </div>
    `;
}

/**
 * レート対戦のリザルトを閉じてUIを更新します。
 */
function closeRatingResult() {
    const overlay = document.getElementById('rating-battle-overlay');
    overlay.style.display = 'none';
    updateRatingBattleUI();
}

/**
 * 対戦演出用の冒険者カードHTML要素を生成します。
 * @param {Object} adv - 冒険者データ
 * @param {boolean} isPlayer - プレイヤーのカードかどうか
 * @returns {HTMLElement} カードのdiv要素
 */
function createBattleCard(adv, isPlayer) {
    const card = document.createElement('div');
    
    let rarityClass;
    if (isPlayer) {
        const rankIndex = RANKS.indexOf(adv.peakRank);
        if (rankIndex >= RANKS.indexOf('XG')) {
            rarityClass = 'rarity-bg-epic';
        } else if (rankIndex >= RANKS.indexOf('A')) {
            rarityClass = 'rarity-bg-rare';
        } else if (rankIndex >= RANKS.indexOf('D')) {
            rarityClass = 'rarity-bg-uncommon';
        } else {
            rarityClass = 'rarity-bg-common';
        }
    } else {
        // ★ 対戦相手のランクに基づいて背景色を決定
        const rankIndex = RANKS.indexOf(adv.rank);
        if (rankIndex >= RANKS.indexOf('XG')) {
            rarityClass = 'rarity-bg-epic';
        } else if (rankIndex >= RANKS.indexOf('A')) {
            rarityClass = 'rarity-bg-rare';
        } else if (rankIndex >= RANKS.indexOf('D')) {
            rarityClass = 'rarity-bg-uncommon';
        } else {
            rarityClass = 'rarity-bg-common';
        }
    }

    if (adv.isInherited) {
        rarityClass = 'rarity-bg-inherited';
    }
    card.className = `adventurer-card ${rarityClass}`;
    card.id = isPlayer ? `battle-card-player-${adv.id}` : `battle-card-opponent-${adv.ovr_id}`;
    
    const ovr = isPlayer ? adv.peakOvr : adv.ovr;
    const name = adv.name;
    const skills = isPlayer ? adv.peakSkills : adv.skills;
    const rank = isPlayer ? adv.peakRank : adv.rank;

    const attribute = ATTRIBUTES[adv.attribute];
    const textColor = getContrastColor(attribute?.color);
    const attributeHtml = attribute ? `<span class="talent-trait rarity-${attribute.rarity.toLowerCase()}" style="background-color: ${attribute.color}; color: ${textColor};">${attribute.name}</span>` : 'なし';

    let nameStyle = `border-bottom: 3px solid ${adv.characterColor || '#ccc'}; padding-bottom: 2px;`;
    if (adv.isInherited) {
        nameStyle += `color: #FFD700; text-shadow: 0 0 5px #FFD700, 0 0 8px #FFD700;`;
    }
    let avatarHtml = '<div class="avatar-container"></div>'; // フォールバック
    if (adv.avatar) {
        const { hairHue = 0, eyesHue = 0, brightness = 1.0 } = adv.avatar;
        const styleToString = (styleObj) => Object.entries(styleObj).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`).join(';');
        
        const backStyle = getPartStyle('back', adv.avatar.back);
        const hairStyle = getPartStyle('hair', adv.avatar.hair);
        hairStyle.filter = backStyle.filter = `hue-rotate(${hairHue}deg) saturate(1.5) brightness(${brightness})`;
        const eyesStyle = getPartStyle('eyes', adv.avatar.eyes);
        eyesStyle.filter = `hue-rotate(${eyesHue}deg) saturate(2) brightness(${brightness * 0.9})`;
        avatarHtml = `
            <div class="avatar-container">
                <img src="avatar_parts/back/${adv.avatar.back}.svg" class="avatar-part" style="${styleToString(backStyle)}">
                <img src="avatar_parts/face/${adv.avatar.face}.svg" class="avatar-part" style="${styleToString(getPartStyle('face', adv.avatar.face))}">
                <img src="avatar_parts/ears/${adv.avatar.ears}.svg" class="avatar-part" style="${styleToString(getPartStyle('ears', adv.avatar.ears))}">
                <img src="avatar_parts/hair/${adv.avatar.hair}.svg" class="avatar-part" style="${styleToString(hairStyle)}">
                <img src="avatar_parts/eyes/${adv.avatar.eyes}.svg" class="avatar-part" style="${styleToString(eyesStyle)}">
            </div>`;
    }

    card.innerHTML = `
        <div class="card-ovr" data-original-ovr="${ovr}">
            <span class="bonus-ovr-display"></span>
            <span class="current-ovr-value">${ovr}</span>
        </div>
        <div class="card-attribute">${attributeHtml}</div>
        ${avatarHtml}
        <div class="card-name" style="text-align: center;"><span class="adventurer-name" style="${nameStyle}">${name}</span></div>
        <div class="card-stats">戦:${skills.combat} / 魔:${skills.magic} / 探:${skills.exploration}</div>
        <div class="card-rank">${getStyledRankHtml(rank)}</div>
    `;
    return card;
}
// --- 初期化 ---

/**
 * 属性の詳細情報を表示するモーダルウィンドウを開きます。
 * @param {string} attributeKey - ATTRIBUTESオブジェクトのキー
 */
function showAttributeDetails(attributeKey) {
    const attribute = ATTRIBUTES[attributeKey];
    if (!attribute) return;

    // 既存のモーダルがあれば削除
    const existingModal = document.getElementById('attribute-detail-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'attribute-detail-modal';
    modal.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'attribute-detail-content'; // 新しいスタイルクラス

    // ボーナス表示を整形する内部関数
    function formatBonus(bonus) {
        if (!bonus) return 'なし';
        let text = '';
        const skillMap = {
            combat: '戦闘',
            magic: '魔法',
            exploration: '探索',
            random: 'ランダムなスキル',
            lowest: '最も低いスキル'
        };
        for (const key in bonus) {
            const skillName = skillMap[key] || key;
            const value = bonus[key];
            text += `<li>${skillName}: <span style="color: #2ecc71; font-weight: bold;">+${value}</span></li>`;
        }
        return `<ul>${text}</ul>`;
    }

    const textColor = getContrastColor(attribute.color);
    const attributeNameHtml = `<span class="talent-trait" style="background-color: ${attribute.color}; color: ${textColor};">${attribute.name}</span>`;

    content.innerHTML = `
        <h3>属性詳細</h3>
        <p><strong>名前:</strong> ${attributeNameHtml}</p>
        <p><strong>レアリティ:</strong> <span class="rarity-${attribute.rarity.toLowerCase()}">${attribute.rarity}</span></p>
        <p><strong>概要:</strong> ${attribute.description}</p>
        <hr>
        <p><strong>レベルアップ時ボーナス:</strong></p>
        ${formatBonus(attribute.bonus)}
    `;

    const closeButton = document.createElement('button');
    closeButton.textContent = '閉じる';
    closeButton.style.marginTop = '20px';
    closeButton.onclick = () => {
        modal.remove();
    };

    content.appendChild(closeButton);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // モーダルの外側をクリックしたら閉じる
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}



/**
 * 動的に生成されたDOM要素への参照を再初期化します。
 */
function reinitializeDOMElements() {
    goldEl = document.getElementById('gold');
    adventurerCountEl = document.getElementById('adventurer-count');
    questsEl = document.getElementById('quests');
    adventurerListEl = document.getElementById('adventurer-list');
    scoutAreaEl = document.getElementById('scout-area');
    scoutSkillEl = document.getElementById('scout-skill');
    questDetailAreaEl = document.getElementById('quest-detail-area');
    lastMonthLogEl = document.getElementById('last-month-log');
    logContentEl = document.getElementById('log-content');
    tutorialOverlay = document.getElementById('tutorial-overlay');
    tutorialText = document.getElementById('tutorial-text');
    saveLoadModal = document.getElementById('save-load-modal');
    saveLoadSlots = document.getElementById('save-load-slots');
}

document.addEventListener('DOMContentLoaded', () => {
    // ゲーム開始はボタンクリックで行うため、ここでは何もしない
    renderStylishHomeScreen();
});
