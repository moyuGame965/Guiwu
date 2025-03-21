// 游戏音效
const sounds = {
    background: new Audio('https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8b0a2c9e5.mp3'),
    click: new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_942751d4d6.mp3'),
    success: new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8a901a2c8.mp3'),
    failure: new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b0a2c9e5.mp3'),
    pickup: new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_942751d4d6.mp3'),
    door: new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8a901a2c8.mp3')
};

// 游戏统计
const gameStats = {
    startTime: null,
    itemsCollected: 0,
    eventsEncountered: 0
};

// 游戏状态管理
const gameState = {
    currentRoom: null,
    inventory: [],
    health: 100,
    timeLeft: 3600, // 60分钟
    gameInterval: null,
    hasKey: false,
    hasTalisman: false,
    hasReadDiary: false,
    unlockedRooms: new Set(['entrance']),
    isSoundEnabled: true,
    activeEvents: []
};

// 房间数据
const rooms = {
    entrance: {
        name: '古宅入口',
        description: '你站在一个昏暗的入口大厅中。朱红色的门框上雕刻着繁复的花纹，墙上挂着几幅蒙尘的画像。空气中弥漫着一股陈旧的气息。',
        options: [
            { id: 'explore_hall', text: '仔细查看大厅', requires: null },
            { id: 'go_to_corridor', text: '前往走廊', requires: null },
            { id: 'examine_painting', text: '检查画像', requires: null },
            { id: 'look_at_floor', text: '观察地板', requires: null },
            { id: 'check_door', text: '检查大门', requires: null }
        ],
        events: [
            { id: 'door_slam', description: '身后的大门突然发出一声巨响，把你吓了一跳！', damage: 8 },
            { id: 'cold_spot', description: '你突然走进一片异常寒冷的区域，浑身起了鸡皮疙瘩...', damage: 5 }
        ]
    },
    corridor: {
        name: '幽暗走廊',
        description: '长长的走廊两侧点着忽明忽暗的红烛。地板随着脚步发出吱呀声响。走廊尽头有三个房间。',
        options: [
            { id: 'go_to_study', text: '进入书房', requires: null },
            { id: 'go_to_bedroom', text: '进入卧室', requires: null },
            { id: 'go_to_kitchen', text: '进入厨房', requires: null },
            { id: 'return_entrance', text: '返回入口', requires: null },
            { id: 'examine_candles', text: '观察烛火', requires: null },
            { id: 'check_walls', text: '检查墙壁', requires: null }
        ],
        events: [
            { id: 'candle_out', description: '一阵阴风吹过，所有的蜡烛同时熄灭了！几秒后又诡异地重新点燃...', damage: 12 },
            { id: 'shadow_figure', description: '走廊尽头似乎有个人影一闪而过...', damage: 10 }
        ]
    },
    study: {
        name: '书房',
        description: '书房里堆满了古籍和卷轴。一张红木书桌上摆着一盏油灯，旁边放着一本日记。空气中飘荡着淡淡的墨香。',
        options: [
            { id: 'read_diary', text: '阅读日记', requires: null },
            { id: 'search_desk', text: '搜索书桌', requires: null },
            { id: 'examine_bookshelf', text: '检查书架', requires: null },
            { id: 'return_corridor', text: '返回走廊', requires: null },
            { id: 'look_at_ceiling', text: '观察天花板', requires: null },
            { id: 'check_window', text: '查看窗户', requires: null }
        ],
        events: [
            { id: 'books_fall', description: '书架上的书籍突然自己掉落下来，砸在地上发出巨响！', damage: 8 },
            { id: 'writing_appears', description: '书桌上的日记本突然自己翻动，出现了新的字迹...', damage: 15 }
        ]
    },
    bedroom: {
        name: '卧室',
        description: '一张雕花大床占据了房间的中央，床头挂着一面铜镜。房间角落里有一个上锁的衣柜。窗外的月光透过破旧的窗帘洒在地上。',
        options: [
            { id: 'check_mirror', text: '查看铜镜', requires: null },
            { id: 'open_wardrobe', text: '尝试打开衣柜', requires: 'key' },
            { id: 'look_under_bed', text: '查看床底', requires: null },
            { id: 'return_corridor', text: '返回走廊', requires: null },
            { id: 'examine_window', text: '检查窗户', requires: null },
            { id: 'check_bedding', text: '检查床铺', requires: null }
        ],
        events: [
            { id: 'mirror_ghost', description: '铜镜中突然出现了一张陌生的脸，正对着你诡异地微笑...', damage: 20 },
            { id: 'bed_shake', description: '大床突然剧烈地晃动起来，仿佛有什么东西要从床下钻出来！', damage: 15 }
        ]
    },
    kitchen: {
        name: '厨房',
        description: '厨房里弥漫着一股诡异的香气。灶台上摆着各种瓷器和炊具，墙上挂着一些干草药。一口大铁锅静静地挂在墙上。',
        options: [
            { id: 'check_stove', text: '检查灶台', requires: null },
            { id: 'examine_herbs', text: '查看草药', requires: null },
            { id: 'open_cabinet', text: '打开橱柜', requires: null },
            { id: 'return_corridor', text: '返回走廊', requires: null },
            { id: 'inspect_pot', text: '检查铁锅', requires: null },
            { id: 'look_at_ceiling', text: '观察天花板', requires: null }
        ],
        events: [
            { id: 'pot_sound', description: '铁锅中突然传出诡异的咕噜声，好像有什么东西在里面翻腾...', damage: 12 },
            { id: 'knife_fall', description: '墙上的菜刀突然掉落，擦着你的衣角插在地板上！', damage: 18 }
        ]
    },
    secret_room: {
        name: '密室',
        description: '一个隐秘的密室出现在你面前。房间中央放着一个诡异的祭坛，上面刻着古老的符文。墙上画满了神秘的符号。',
        options: [
            { id: 'examine_altar', text: '检查祭坛', requires: 'talisman' },
            { id: 'search_room', text: '搜索房间', requires: null },
            { id: 'return_bedroom', text: '返回卧室', requires: null },
            { id: 'study_symbols', text: '研究符号', requires: null },
            { id: 'check_corners', text: '检查角落', requires: null }
        ],
        events: [
            { id: 'symbols_glow', description: '墙上的符号突然开始发出诡异的红光！', damage: 25 },
            { id: 'altar_shake', description: '祭坛剧烈地震动起来，一股阴冷的气息扑面而来！', damage: 20 }
        ]
    }
};

// 物品数据
const items = {
    key: {
        name: '生锈的铜钥匙',
        description: '一把看起来年代久远的铜钥匙，也许能打开某处的锁。',
        usableIn: ['bedroom', 'study'],
        effect: (room) => {
            if (room === 'bedroom') {
                return {
                    message: '你用钥匙打开了衣柜，发现了通向密室的暗门！',
                    unlockOption: 'enter_secret_room'
                };
            } else if (room === 'study') {
                return {
                    message: '你打开了书桌的抽屉，找到了一本古老的符咒书。',
                    addItem: 'spell_book'
                };
            }
        }
    },
    talisman: {
        name: '道士符咒',
        description: '一张画有神秘符文的黄符，似乎蕴含着某种力量。',
        usableIn: ['secret_room', 'bedroom'],
        effect: (room) => {
            if (room === 'secret_room') {
                return {
                    message: '符咒与祭坛上的符文产生共鸣，一道光芒闪过！',
                    winGame: true
                };
            } else if (room === 'bedroom') {
                return {
                    message: '符咒散发出淡淡的光芒，驱散了房间里的阴森气息。',
                    healHealth: 15
                };
            }
        }
    },
    diary: {
        name: '陈旧的日记',
        description: '一本布满灰尘的日记，记载着这座宅院的秘密。',
        usableIn: ['study', 'secret_room', 'bedroom'],
        effect: (room) => {
            if (room === 'secret_room') {
                return {
                    message: '日记中记载的咒语帮助你理解了墙上的符文。',
                    healHealth: 20
                };
            }
            return {
                message: '你翻阅日记，发现了一些关于这座宅院的秘密。',
                addKnowledge: true
            };
        }
    },
    herbs: {
        name: '驱邪草药',
        description: '一些具有特殊功效的草药，可以稍微恢复精神状态。',
        usableIn: ['all'],
        effect: () => ({
            message: '你使用了草药，感觉精神好多了。',
            healHealth: 30,
            consumeItem: true
        })
    },
    spell_book: {
        name: '符咒书',
        description: '记载着各种古老符咒的书籍，或许能帮助你对抗邪祟。',
        usableIn: ['all'],
        effect: () => ({
            message: '你念诵了一段咒语，感觉周围的气息变得祥和了一些。',
            healHealth: 25,
            reduceEventChance: true
        })
    },
    mirror_shard: {
        name: '破碎的镜片',
        description: '从铜镜上掉落的一片镜子，反射着诡异的光芒。',
        usableIn: ['secret_room', 'study'],
        effect: (room) => {
            if (room === 'secret_room') {
                return {
                    message: '镜片反射的光线照在墙上，显现出隐藏的符文！',
                    revealSecrets: true
                };
            }
            return {
                message: '镜片反射出奇怪的光影，让你感到不安。',
                damageHealth: 10
            };
        }
    },
    incense: {
        name: '安神香',
        description: '一支具有安神效果的香，点燃后可以稳定精神状态。',
        usableIn: ['all'],
        effect: () => ({
            message: '你点燃了安神香，一股清香让你感到平静。',
            healHealth: 20,
            preventEvents: true,
            consumeItem: true
        })
    }
};

// 随机事件系统
const randomEvents = [
    // 基础事件
    {
        id: 'ghost_whisper',
        description: '你听到耳边传来若有若无的低语声...',
        damage: 10,
        probability: 0.15,
        conditions: { all: true }
    },
    {
        id: 'cold_wind',
        description: '一阵阴冷的风突然吹过，蜡烛的火光剧烈摇晃...',
        damage: 5,
        probability: 0.2,
        conditions: { all: true }
    },
    // 物品相关事件
    {
        id: 'mirror_reflection',
        description: '铜镜中似乎闪过一个诡异的身影...',
        damage: 15,
        probability: 0.15,
        conditions: { room: 'bedroom' },
        reward: { chance: 0.3, item: 'mirror_shard' }
    },
    {
        id: 'book_glow',
        description: '书架上的一本书突然发出微弱的光芒...',
        damage: 8,
        probability: 0.15,
        conditions: { room: 'study' },
        reward: { chance: 0.4, item: 'spell_book' }
    },
    // 房间特定事件
    {
        id: 'incense_appear',
        description: '一缕奇特的香气引起了你的注意...',
        damage: 0,
        probability: 0.15,
        conditions: { room: 'kitchen' },
        reward: { chance: 0.8, item: 'incense' }
    },
    {
        id: 'symbol_flash',
        description: '墙上的符号突然闪烁起诡异的光芒！',
        damage: 20,
        probability: 0.3,
        conditions: { room: 'secret_room' },
        effect: (gameState) => {
            if (gameState.inventory.includes('talisman')) {
                return {
                    message: '但是符咒的力量保护了你。',
                    damage: 5
                };
            }
        }
    },
    // 连续事件
    {
        id: 'ghost_chase',
        description: '你感觉有什么东西在跟着你...',
        damage: 5,
        probability: 0.1,
        persistent: true,
        duration: 3,
        escalation: (turn) => ({
            damage: 5 * turn,
            description: `你清楚地感觉到那个存在越来越近了...${turn === 3 ? '它就在你身后！' : ''}`
        })
    },
    // 物品触发事件
    {
        id: 'diary_vision',
        description: '翻阅日记时，你突然陷入了一段诡异的回忆...',
        damage: 12,
        probability: 0.4,
        conditions: { item: 'diary' },
        effect: (gameState) => {
            if (gameState.hasReadDiary) {
                return {
                    message: '你看到了关于密室的重要线索！',
                    revealClue: true
                };
            }
        }
    },
    // 组合事件
    {
        id: 'ritual_chance',
        description: '房间里的氛围突然变得异常诡异...',
        damage: 15,
        probability: 0.2,
        conditions: { 
            room: 'secret_room',
            items: ['talisman', 'mirror_shard']
        },
        effect: () => ({
            message: '符咒和镜片发生共鸣，照亮了一个神秘的符文！',
            revealSecret: true
        })
    }
];

// 房间探索进度系统
const roomExploration = {
    entrance: {
        corners: false,
        paintings: false,
        floor: false,
        ceiling: false
    },
    corridor: {
        walls: false,
        candles: false,
        windows: false
    },
    study: {
        bookshelf: false,
        desk: false,
        window: false,
        carpet: false
    },
    bedroom: {
        mirror: false,
        bed: false,
        wardrobe: false,
        window: false
    },
    kitchen: {
        stove: false,
        cabinets: false,
        herbs: false,
        pot: false
    },
    secret_room: {
        altar: false,
        symbols: false,
        corners: false,
        floor: false
    }
};

// 探索进度效果
function updateExploration(room, area) {
    if (!roomExploration[room][area]) {
        roomExploration[room][area] = true;
        const explorationCount = Object.values(roomExploration[room]).filter(v => v).length;
        const totalAreas = Object.keys(roomExploration[room]).length;
        
        // 探索奖励
        if (explorationCount === totalAreas) {
            // 房间完全探索奖励
            showMessage('你已经完全探索了这个房间，发现了一些隐藏的线索！');
            updateHealth(15);
            if (Math.random() < 0.5) {
                const possibleItems = ['herbs', 'incense', 'mirror_shard'];
                const randomItem = possibleItems[Math.floor(Math.random() * possibleItems.length)];
                addToInventory(randomItem);
            }
        } else if (explorationCount === Math.floor(totalAreas / 2)) {
            // 探索过半奖励
            showMessage('你对这个房间已经有了相当的了解。');
            updateHealth(8);
        }
    }
}

// 使用物品
function useItem(itemId, room) {
    const item = items[itemId];
    if (!item) return;

    if (item.usableIn.includes(room) || item.usableIn.includes('all')) {
        const effect = item.effect(room);
        showMessage(effect.message);
        
        if (effect.healHealth) {
            updateHealth(effect.healHealth);
        }
        if (effect.damageHealth) {
            updateHealth(-effect.damageHealth);
        }
        if (effect.unlockOption) {
            const currentRoom = rooms[room];
            if (!currentRoom.options.find(opt => opt.id === effect.unlockOption)) {
                currentRoom.options.push({
                    id: effect.unlockOption,
                    text: '进入密室',
                    requires: null
                });
                updateUI();
            }
        }
        if (effect.addItem && !gameState.inventory.includes(effect.addItem)) {
            addToInventory(effect.addItem);
        }
        if (effect.consumeItem) {
            removeFromInventory(itemId);
        }
        if (effect.winGame) {
            endGame(true);
        }
    } else {
        showMessage('这个物品在这里似乎没有什么用...');
    }
}

// 处理随机事件
function handleRandomEvent(event) {
    // 检查事件条件
    if (event.conditions) {
        if (event.conditions.room && event.conditions.room !== gameState.currentRoom) {
            return false;
        }
        if (event.conditions.item && !gameState.inventory.includes(event.conditions.item)) {
            return false;
        }
        if (event.conditions.items && !event.conditions.items.every(item => gameState.inventory.includes(item))) {
            return false;
        }
    }

    // 触发事件
    showMessage(event.description);
    let damage = event.damage;

    // 处理事件效果
    if (event.effect) {
        const effectResult = event.effect(gameState);
        if (effectResult) {
            showMessage(effectResult.message);
            damage = effectResult.damage || damage;
        }
    }

    // 处理事件奖励
    if (event.reward && Math.random() < event.reward.chance) {
        addToInventory(event.reward.item);
    }

    // 处理持续性事件
    if (event.persistent) {
        gameState.activeEvents = gameState.activeEvents || [];
        gameState.activeEvents.push({
            id: event.id,
            turnsLeft: event.duration,
            baseDamage: event.damage
        });
    }

    updateHealth(-damage);
    return true;
}

// 更新游戏状态
function updateGameState() {
    // 处理持续性事件
    if (gameState.activeEvents) {
        gameState.activeEvents = gameState.activeEvents.filter(event => {
            const baseEvent = randomEvents.find(e => e.id === event.id);
            if (baseEvent && event.turnsLeft > 0) {
                const escalation = baseEvent.escalation(baseEvent.duration - event.turnsLeft + 1);
                showMessage(escalation.description);
                updateHealth(-escalation.damage);
                event.turnsLeft--;
                return event.turnsLeft > 0;
            }
            return false;
        });
    }

    // 检查随机事件触发
    randomEvents.forEach(event => {
        if (Math.random() < event.probability) {
            handleRandomEvent(event);
        }
    });
}

// 移除物品
function removeFromInventory(itemId) {
    const index = gameState.inventory.indexOf(itemId);
    if (index !== -1) {
        gameState.inventory.splice(index, 1);
        updateUI();
    }
}

// 初始化游戏
function initGame() {
    gameState.currentRoom = 'entrance';
    gameState.inventory = [];
    gameState.health = 100;
    gameState.timeLeft = 3600;
    gameState.hasKey = false;
    gameState.hasTalisman = false;
    gameState.hasReadDiary = false;
    gameState.unlockedRooms = new Set(['entrance']);
    
    gameStats.startTime = Date.now();
    gameStats.itemsCollected = 0;
    gameStats.eventsEncountered = 0;
    
    if (gameState.isSoundEnabled) {
        sounds.background.loop = true;
        sounds.background.volume = 0.3;
        sounds.background.play();
    }
    
    updateUI();
    startTimer();
}

// 更新游戏界面
function updateUI() {
    const currentRoom = rooms[gameState.currentRoom];
    document.getElementById('room-name').textContent = currentRoom.name;
    document.getElementById('scene-description').textContent = currentRoom.description;
    
    // 更新选项
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    currentRoom.options.forEach(option => {
        if (!option.requires || gameState.inventory.includes(option.requires)) {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option.text;
            button.onclick = () => {
                playSound('click');
                handleOption(option.id);
            };
            optionsContainer.appendChild(button);
        }
    });
    
    // 更新物品栏
    const inventoryContainer = document.getElementById('inventory');
    inventoryContainer.innerHTML = '';
    gameState.inventory.forEach(itemId => {
        const item = items[itemId];
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.textContent = item.name;
        itemElement.onclick = () => showItemDescription(item);
        inventoryContainer.appendChild(itemElement);
    });
    
    // 更新状态
    document.getElementById('health-value').textContent = gameState.health;
    updateTimer();
}

// 播放音效
function playSound(soundName) {
    if (gameState.isSoundEnabled && sounds[soundName]) {
        const sound = sounds[soundName];
        sound.currentTime = 0;
        sound.play();
    }
}

// 处理选项点击
function handleOption(optionId) {
    switch (optionId) {
        case 'explore_hall':
            if (Math.random() < 0.3) {
                addToInventory('key');
                playSound('pickup');
                showMessage('你在角落发现了一把生锈的铜钥匙！');
            } else {
                showMessage('你仔细搜索了大厅，但没有发现特别的东西。');
            }
            break;
            
        case 'examine_painting':
            if (!gameState.hasTalisman && Math.random() < 0.4) {
                addToInventory('talisman');
                playSound('pickup');
                showMessage('画像后面藏着一张道士符咒！');
            } else {
                showMessage('这些画像显示了这座宅院曾经的主人，他们的眼神让你感到不安...');
                triggerRandomEvent();
            }
            break;
            
        case 'read_diary':
            if (!gameState.hasReadDiary) {
                gameState.hasReadDiary = true;
                addToInventory('diary');
                showMessage('你发现了一些关于这座宅院的秘密！原来密室就在卧室中...');
            }
            break;
            
        // 房间移动
        case 'go_to_corridor':
            changeRoom('corridor');
            break;
        case 'go_to_study':
            changeRoom('study');
            break;
        case 'go_to_bedroom':
            changeRoom('bedroom');
            break;
        case 'go_to_kitchen':
            changeRoom('kitchen');
            break;
        case 'return_entrance':
            changeRoom('entrance');
            break;
        case 'return_corridor':
            changeRoom('corridor');
            break;
            
        // 其他互动
        case 'open_wardrobe':
            if (gameState.inventory.includes('key')) {
                showMessage('你用钥匙打开了衣柜，发现了通向密室的暗门！');
                rooms.bedroom.options.push({
                    id: 'enter_secret_room',
                    text: '进入密室',
                    requires: null
                });
                updateUI();
            }
            break;
            
        case 'enter_secret_room':
            changeRoom('secret_room');
            break;
            
        case 'examine_altar':
            if (gameState.inventory.includes('talisman')) {
                endGame(true);
            } else {
                showMessage('祭坛上的符文让你感到不寒而栗...');
                updateHealth(-20);
            }
            break;
            
        case 'check_stove':
            if (Math.random() < 0.3) {
                addToInventory('herbs');
                showMessage('你找到了一些有用的草药！');
            } else {
                showMessage('灶台上积满了灰尘，看来很久没人使用了。');
            }
            break;
        
        // 新增交互选项
        case 'look_at_floor':
            if (Math.random() < 0.2) {
                showMessage('你发现地板上有一些奇怪的划痕，似乎是某种符号...');
                updateHealth(-5);
            } else {
                showMessage('地板上布满了灰尘，看起来很久没人打扫了。');
            }
            break;
            
        case 'check_door':
            showMessage('大门纹丝不动，看来只能往里走了...');
            break;
            
        case 'examine_candles':
            if (Math.random() < 0.3) {
                showMessage('烛火突然剧烈摇晃，你似乎看到了什么影子...');
                updateHealth(-8);
            } else {
                showMessage('烛火静静地燃烧着，为走廊投下摇曳的影子。');
            }
            break;
            
        case 'check_walls':
            if (Math.random() < 0.25) {
                addToInventory('talisman');
                showMessage('墙纸后面藏着一张符咒！');
            } else {
                showMessage('墙壁上的壁纸已经泛黄剥落，露出了下面的砖墙。');
            }
            break;
            
        case 'look_at_ceiling':
            if (Math.random() < 0.3) {
                showMessage('天花板上画着诡异的图案，让你感到一阵眩晕...');
                updateHealth(-10);
            } else {
                showMessage('天花板上布满了蜘蛛网，显得很是阴森。');
            }
            break;
            
        case 'check_window':
            showMessage('窗户被钉死了，外面的夜色漆黑如墨。');
            break;
            
        case 'examine_window':
            if (Math.random() < 0.4) {
                showMessage('一张惨白的脸突然贴在窗户上，吓得你倒退几步！');
                updateHealth(-15);
            } else {
                showMessage('月光透过破旧的窗帘，在地上投下诡异的影子。');
            }
            break;
            
        case 'check_bedding':
            if (Math.random() < 0.3) {
                addToInventory('herbs');
                showMessage('你在枕头下发现了一些干草药！');
            } else {
                showMessage('床上的被褥散发着一股霉味，看起来很久没人睡过了。');
            }
            break;
            
        case 'inspect_pot':
            if (Math.random() < 0.5) {
                showMessage('铁锅中飘出一股奇怪的香气，让你感到一阵恍惚...');
                updateHealth(-10);
            } else {
                showMessage('这口大铁锅已经生锈了，里面空空如也。');
            }
            break;
            
        case 'study_symbols':
            if (gameState.inventory.includes('diary')) {
                showMessage('对照着日记上的记载，你似乎理解了一些符号的含义。');
                updateHealth(10);
            } else {
                showMessage('这些符号太过晦涩，看得你头晕目眩...');
                updateHealth(-12);
            }
            break;
            
        case 'check_corners':
            if (Math.random() < 0.2) {
                addToInventory('key');
                showMessage('在密室的角落里，你发现了一把生锈的钥匙！');
            } else {
                showMessage('角落里堆满了灰尘和蜘蛛网，什么也没有。');
            }
            break;
    }
    
    // 触发房间特定事件
    if (Math.random() < 0.1) {
        const currentRoom = rooms[gameState.currentRoom];
        if (currentRoom.events && currentRoom.events.length > 0) {
            const event = currentRoom.events[Math.floor(Math.random() * currentRoom.events.length)];
            showMessage(event.description);
            updateHealth(-event.damage);
            playSound('failure');
            document.getElementById('game-screen').classList.add('shake');
            setTimeout(() => {
                document.getElementById('game-screen').classList.remove('shake');
            }, 500);
        }
    }
    
    // 每次行动后有概率触发随机事件
    if (Math.random() < 0.12) {
        triggerRandomEvent();
    }
}

// 切换房间
function changeRoom(roomId) {
    playSound('door');
    gameState.currentRoom = roomId;
    updateUI();
}

// 添加物品到背包
function addToInventory(itemId) {
    if (!gameState.inventory.includes(itemId)) {
        gameState.inventory.push(itemId);
        gameStats.itemsCollected++;
        updateUI();
    }
}

// 显示物品描述
function showItemDescription(item) {
    const description = document.createElement('div');
    description.className = 'item-description';
    description.textContent = item.description;
    document.body.appendChild(description);
    
    // 3秒后自动移除描述
    setTimeout(() => description.remove(), 3000);
}

// 触发随机事件
function triggerRandomEvent() {
    const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    showMessage(event.description);
    handleRandomEvent(event);
    gameStats.eventsEncountered++;
    playSound('failure');
    document.getElementById('game-screen').classList.add('shake');
    setTimeout(() => {
        document.getElementById('game-screen').classList.remove('shake');
    }, 500);
}

// 更新健康状态
function updateHealth(change) {
    gameState.health = Math.max(0, Math.min(100, gameState.health + change));
    if (gameState.health <= 0) {
        endGame(false);
    }
    updateUI();
}

// 显示消息
function showMessage(message) {
    const messageElement = document.getElementById('event-message');
    messageElement.textContent = message;
    messageElement.classList.add('fade-in');
    setTimeout(() => messageElement.classList.remove('fade-in'), 500);
}

// 计时器相关函数
function startTimer() {
    gameState.gameInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        if (gameState.timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function updateTimer() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('time-left').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 结束游戏
function endGame(isWin) {
    clearInterval(gameState.gameInterval);
    if (gameState.isSoundEnabled) {
        sounds.background.pause();
        playSound(isWin ? 'success' : 'failure');
    }
    
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const endingTitle = document.getElementById('ending-title');
    const endingDescription = document.getElementById('ending-description');
    
    // 计算游戏统计
    const survivalTime = Math.floor((Date.now() - gameStats.startTime) / 1000);
    const minutes = Math.floor(survivalTime / 60);
    const seconds = survivalTime % 60;
    
    document.getElementById('survival-time').textContent = 
        `${minutes}分${seconds}秒`;
    document.getElementById('items-collected').textContent = 
        gameStats.itemsCollected;
    document.getElementById('events-encountered').textContent = 
        gameStats.eventsEncountered;
    
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    if (isWin) {
        endingTitle.textContent = '逃出生天';
        endingDescription.textContent = '你成功破解了古宅的秘密，并找到了离开的方法。当第一缕晨光照进宅院时，所有的诡异都烟消云散了。';
    } else {
        endingTitle.textContent = '魂归故里';
        endingDescription.textContent = '你没能在天亮前找到出路，永远地成为了这座宅院的一部分...';
    }
}

// 分享结果
function shareResult(isWin) {
    const text = `我在《古宅惊魂》中${isWin ? '成功逃脱' : '永远留在了古宅'}！\n` +
                `生存时间：${document.getElementById('survival-time').textContent}\n` +
                `收集物品：${gameStats.itemsCollected}个\n` +
                `遭遇事件：${gameStats.eventsEncountered}次\n` +
                '来挑战一下？';
    
    if (navigator.share) {
        navigator.share({
            title: '古宅惊魂',
            text: text,
            url: window.location.href
        });
    } else {
        // 如果不支持原生分享，复制到剪贴板
        navigator.clipboard.writeText(text).then(() => {
            alert('结果已复制到剪贴板！');
        });
    }
}

// 事件监听器
document.addEventListener('DOMContentLoaded', () => {
    // 开始游戏按钮
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        playSound('click');
        initGame();
    });

    // 重新开始按钮
    document.getElementById('restart-btn').addEventListener('click', () => {
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        playSound('click');
        initGame();
    });

    // 分享按钮
    document.getElementById('share-btn').addEventListener('click', () => {
        shareResult(gameState.health > 0 && gameState.timeLeft > 0);
    });

    // 帮助按钮
    document.getElementById('help-btn').addEventListener('click', () => {
        document.getElementById('help-modal').classList.remove('hidden');
        playSound('click');
    });

    // 关闭帮助模态框
    document.getElementById('close-help').addEventListener('click', () => {
        document.getElementById('help-modal').classList.add('hidden');
        playSound('click');
    });

    // 音效开关
    document.getElementById('sound-btn').addEventListener('click', () => {
        const btn = document.getElementById('sound-btn');
        gameState.isSoundEnabled = !gameState.isSoundEnabled;
        
        if (gameState.isSoundEnabled) {
            btn.innerHTML = '<i class="fas fa-volume-up"></i> 音效';
            if (gameState.currentRoom) { // 如果游戏已经开始
                sounds.background.play();
            }
        } else {
            btn.innerHTML = '<i class="fas fa-volume-mute"></i> 音效';
            sounds.background.pause();
        }
    });
}); 