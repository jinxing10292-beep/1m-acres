// ============================================
// 게임 상수 및 설정
// ============================================

const GAME_CONFIG = {
    MAP_SIZE: 500,
    TILE_SIZE: 32,
    BASE_SIZE: 2,
    SEASON_DURATION: 3, // 현실 시간 일 (테스트용 3초)
    SEASONS: ['봄', '여름', '가을', '겨울'],
    SEASON_COLORS: {
        '봄': '#90EE90',
        '여름': '#FFD700',
        '가을': '#FF8C00',
        '겨울': '#87CEEB'
    }
};

// ============================================
// 게임 상태 관리
// ============================================

class GameState {
    constructor() {
        this.resources = {
            wood: 200,
            stone: 200,
            food: 500,
            gold: 100
        };
        this.currentDay = 1;
        this.currentSeason = 0; // 0: 봄, 1: 여름, 2: 가을, 3: 겨울
        this.bases = []; // 플레이어 거점
        this.tiles = new Map(); // 타일 상태 저장
        this.unitManager = new UnitManager();
        this.buildingManager = new BuildingManager();
        this.resourceSystem = new ResourceSystem(this.buildingManager);
        this.combatSystem = new CombatSystem();
        this.movementSystem = new MovementSystem();
        this.siegeSystem = new SiegeSystem();
        this.heroSystem = new HeroSystem();
        this.pveSystem = new PvESystem();
        this.roguelikeManager = new RoguelikeManager();
        this.lastSeasonChangeTime = Date.now();
        this.isPvPEnabled = false; // 봄은 PvP 불가
        this.lastResourceUpdateTime = Date.now();
        this.selectedUnit = null;
        this.selectedBuilding = null;
        this.inBattle = false;
    }

    getSeason() {
        return GAME_CONFIG.SEASONS[this.currentSeason];
    }

    updateSeason() {
        const now = Date.now();
        const elapsedSeconds = (now - this.lastSeasonChangeTime) / 1000;
        const elapsedDays = elapsedSeconds / (GAME_CONFIG.SEASON_DURATION);

        if (elapsedDays >= 1) {
            this.currentDay++;
            this.lastSeasonChangeTime = now;

            if (this.currentDay > 12) {
                this.currentDay = 1;
                this.currentSeason = (this.currentSeason + 1) % 4;
            }

            // 봄(1~3일차)은 PvP 불가
            this.isPvPEnabled = this.currentDay > 3;

            // 계절 변경 시 정책 카드 해제 (미구현)
            if (this.currentDay % 3 === 1) {
                this.showPolicyChoice();
            }
        }
    }

    showPolicyChoice() {
        // 로그라이크 3택 1 팝업 표시
        const choices = this.roguelikeManager.generatePolicyChoices(3);
        
        RoguelikeUIRenderer.showPolicyChoicePopup(choices, (policyId) => {
            this.roguelikeManager.selectPolicy(policyId, this);
            RoguelikeUIRenderer.updatePolicyDisplay(this);
        });
    }

    applyPolicy(effect) {
        switch (effect) {
            case 'foodProduction':
                // 모든 농장의 생산량 20% 증가 (다음 업그레이드 시 적용)
                console.log('식량 생산 +20% 정책 적용');
                break;
            case 'resourceGain':
                // 자원 채집 보너스
                console.log('자원 채집 +15% 정책 적용');
                break;
            case 'unitHealth':
                // 부대 체력 보너스
                console.log('부대 체력 +10% 정책 적용');
                break;
        }
    }

    startBattle(attackerUnits, defenderUnits, location) {
        this.inBattle = true;
        const battle = this.combatSystem.startBattle('player', 'enemy', location);
        
        attackerUnits.forEach(unit => {
            this.combatSystem.addParticipant(battle, unit, 'attacker');
        });

        defenderUnits.forEach(unit => {
            this.combatSystem.addParticipant(battle, unit, 'defender');
        });

        return battle;
    }

    executeBattleTurn() {
        if (!this.inBattle || !this.combatSystem.currentBattle) return;

        const log = this.combatSystem.executeTurn(this.combatSystem.currentBattle);
        
        if (!this.combatSystem.currentBattle.isActive) {
            this.inBattle = false;
            const result = this.combatSystem.getBattleResult(this.combatSystem.currentBattle);
            console.log('전투 종료:', result);
            return result;
        }

        return log;
    }

    startDungeon(difficulty) {
        const dungeon = this.pveSystem.generateDungeon(difficulty);
        console.log(`던전 시작: ${difficulty}`, dungeon);
        return dungeon;
    }

    clearDungeon(dungeon) {
        const rewards = this.pveSystem.clearDungeon(dungeon);
        this.resources.gold += rewards.gold;
        console.log('던전 클리어 보상:', rewards);
        return rewards;
    }

    updateResources() {
        // 건물 생산 업데이트
        this.resourceSystem.updateProduction(this, 'player');

        // 식량 소비 계산
        const foodConsumption = this.unitManager.getTotalFoodConsumption('player');
        this.resources.food -= foodConsumption / 60; // 초당 소비량

        // 자원 한도 체크
        const maxStorage = this.resourceSystem.getStorageInfo('player');
        const resources = ['wood', 'stone', 'food'];
        resources.forEach(resource => {
            if (maxStorage > 0) {
                this.resources[resource] = Math.min(this.resources[resource], maxStorage);
            }
        });

        this.resources.food = Math.max(0, this.resources.food);
    }
}

// ============================================
// 맵 렌더링 엔진
// ============================================

class MapRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.offsetX = 0;
        this.offsetY = 0;
        this.zoom = 1;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 180; // 상단 바 + 하단 패널 제외
    }

    setupEventListeners() {
        // 드래그 팬
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));

        // 터치 지원
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // 클릭 이벤트
        this.canvas.addEventListener('click', (e) => this.onClick(e));

        // 윈도우 리사이즈
        window.addEventListener('resize', () => this.setupCanvas());
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
    }

    onMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
        }
    }

    onMouseUp(e) {
        this.isDragging = false;
    }

    onWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom *= zoomFactor;
        this.zoom = Math.max(0.5, Math.min(3, this.zoom));
    }

    onTouchStart(e) {
        if (e.touches.length === 1) {
            this.isDragging = true;
            this.dragStartX = e.touches[0].clientX;
            this.dragStartY = e.touches[0].clientY;
        }
    }

    onTouchMove(e) {
        if (this.isDragging && e.touches.length === 1) {
            const deltaX = e.touches[0].clientX - this.dragStartX;
            const deltaY = e.touches[0].clientY - this.dragStartY;
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            this.dragStartX = e.touches[0].clientX;
            this.dragStartY = e.touches[0].clientY;
        }
    }

    onTouchEnd(e) {
        this.isDragging = false;
    }

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offsetX) / (GAME_CONFIG.TILE_SIZE * this.zoom);
        const y = (e.clientY - rect.top - this.offsetY) / (GAME_CONFIG.TILE_SIZE * this.zoom);

        const tileX = Math.floor(x);
        const tileY = Math.floor(y);

        if (tileX >= 0 && tileX < GAME_CONFIG.MAP_SIZE && tileY >= 0 && tileY < GAME_CONFIG.MAP_SIZE) {
            console.log(`Clicked tile: (${tileX}, ${tileY})`);
            // 타일 클릭 이벤트 처리 (미구현)
        }
    }

    render(gameState) {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.zoom, this.zoom);

        // 그리드 렌더링
        this.renderGrid();

        // 타일 렌더링
        this.renderTiles(gameState);

        // 건물 렌더링
        this.renderBuildings(gameState);

        // 부대 렌더링
        this.renderUnits(gameState);

        // 거점 렌더링
        this.renderBases(gameState);

        this.ctx.restore();
    }

    renderBuildings(gameState) {
        gameState.buildingManager.getBuildingsByOwner('player').forEach(building => {
            const buildingX = building.x * GAME_CONFIG.TILE_SIZE;
            const buildingY = building.y * GAME_CONFIG.TILE_SIZE;
            const size = GAME_CONFIG.TILE_SIZE * 0.8;

            // 건물 배경
            this.ctx.fillStyle = '#8b7355';
            this.ctx.fillRect(buildingX + 2, buildingY + 2, size, size);

            // 건물 테두리
            this.ctx.strokeStyle = '#d4a574';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(buildingX + 2, buildingY + 2, size, size);

            // 건물 아이콘
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(building.icon, buildingX + GAME_CONFIG.TILE_SIZE / 2, buildingY + GAME_CONFIG.TILE_SIZE / 2);

            // 레벨 표시
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.font = 'bold 8px Arial';
            this.ctx.fillText(`Lv${building.level}`, buildingX + GAME_CONFIG.TILE_SIZE / 2, buildingY + GAME_CONFIG.TILE_SIZE - 4);
        });
    }

    renderUnits(gameState) {
        gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
            const unitX = unit.x * GAME_CONFIG.TILE_SIZE;
            const unitY = unit.y * GAME_CONFIG.TILE_SIZE;
            const size = GAME_CONFIG.TILE_SIZE * 0.6;

            // 부대 배경
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.beginPath();
            this.ctx.arc(unitX + GAME_CONFIG.TILE_SIZE / 2, unitY + GAME_CONFIG.TILE_SIZE / 2, size / 2, 0, Math.PI * 2);
            this.ctx.fill();

            // 부대 테두리
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // 체력 바
            const healthBarWidth = GAME_CONFIG.TILE_SIZE * 0.8;
            const healthBarHeight = 3;
            const healthPercent = unit.currentHp / unit.hp;

            this.ctx.fillStyle = '#666';
            this.ctx.fillRect(unitX + 2, unitY - 5, healthBarWidth, healthBarHeight);

            this.ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
            this.ctx.fillRect(unitX + 2, unitY - 5, healthBarWidth * healthPercent, healthBarHeight);
        });
    }

    renderGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;

        // 수직선
        for (let x = 0; x <= GAME_CONFIG.MAP_SIZE; x += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * GAME_CONFIG.TILE_SIZE, 0);
            this.ctx.lineTo(x * GAME_CONFIG.TILE_SIZE, GAME_CONFIG.MAP_SIZE * GAME_CONFIG.TILE_SIZE);
            this.ctx.stroke();
        }

        // 수평선
        for (let y = 0; y <= GAME_CONFIG.MAP_SIZE; y += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * GAME_CONFIG.TILE_SIZE);
            this.ctx.lineTo(GAME_CONFIG.MAP_SIZE * GAME_CONFIG.TILE_SIZE, y * GAME_CONFIG.TILE_SIZE);
            this.ctx.stroke();
        }
    }

    renderTiles(gameState) {
        // 타일 상태에 따라 색상 변경
        gameState.tiles.forEach((tile, key) => {
            const [x, y] = key.split(',').map(Number);
            const tileX = x * GAME_CONFIG.TILE_SIZE;
            const tileY = y * GAME_CONFIG.TILE_SIZE;

            if (tile.owner === 'player') {
                this.ctx.fillStyle = '#4ade80';
            } else if (tile.owner === 'enemy') {
                this.ctx.fillStyle = '#ef4444';
            } else if (tile.owner === 'neutral') {
                this.ctx.fillStyle = '#6b7280';
            } else {
                this.ctx.fillStyle = '#1f2937';
            }

            this.ctx.fillRect(tileX, tileY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 0.5;
            this.ctx.strokeRect(tileX, tileY, GAME_CONFIG.TILE_SIZE, GAME_CONFIG.TILE_SIZE);
        });
    }

    renderBases(gameState) {
        gameState.bases.forEach(base => {
            const baseX = base.x * GAME_CONFIG.TILE_SIZE;
            const baseY = base.y * GAME_CONFIG.TILE_SIZE;
            const baseWidth = GAME_CONFIG.BASE_SIZE * GAME_CONFIG.TILE_SIZE;
            const baseHeight = GAME_CONFIG.BASE_SIZE * GAME_CONFIG.TILE_SIZE;

            // 거점 배경
            this.ctx.fillStyle = base.owner === 'player' ? '#22c55e' : '#dc2626';
            this.ctx.fillRect(baseX, baseY, baseWidth, baseHeight);

            // 거점 테두리
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(baseX, baseY, baseWidth, baseHeight);

            // 거점 텍스트
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(base.name, baseX + baseWidth / 2, baseY + baseHeight / 2);
        });
    }
}

// ============================================
// UI 업데이트
// ============================================

class UIManager {
    static updateResourceDisplay(gameState) {
        document.getElementById('wood').textContent = Math.floor(gameState.resources.wood);
        document.getElementById('stone').textContent = Math.floor(gameState.resources.stone);
        document.getElementById('food').textContent = Math.floor(gameState.resources.food);
        document.getElementById('gold').textContent = Math.floor(gameState.resources.gold);
    }

    static updateTimeDisplay(gameState) {
        document.getElementById('season').textContent = gameState.getSeason();
        document.getElementById('day').textContent = `${gameState.currentDay}일차`;
    }

    static updateUnitPanel(gameState) {
        const panel = document.getElementById('unitPanel');
        panel.innerHTML = '';

        // 플레이어 부대 목록
        const playerUnits = gameState.unitManager.getUnitsByOwner('player');
        if (playerUnits.length === 0) {
            panel.innerHTML = '<p style="color: #aaa; font-size: 12px;">부대 없음</p>';
            return;
        }

        playerUnits.slice(0, 5).forEach(unit => {
            const item = document.createElement('div');
            item.className = 'unit-item';
            item.innerHTML = `<div>${unit.name}</div><div style="font-size: 10px; color: #aaa;">HP: ${Math.floor(unit.currentHp)}/${unit.hp}</div>`;
            item.onclick = () => {
                gameState.selectedUnit = unit;
                console.log(`선택된 부대: ${unit.name}`);
            };
            panel.appendChild(item);
        });

        if (playerUnits.length > 5) {
            const more = document.createElement('div');
            more.className = 'unit-item';
            more.textContent = `+${playerUnits.length - 5} 더보기`;
            panel.appendChild(more);
        }
    }

    static updateBuildingPanel(gameState) {
        const panel = document.getElementById('buildingPanel');
        panel.innerHTML = '';

        // 건설 가능한 건물 목록
        const buildingOptions = [
            { id: 1, name: '벌목장', icon: '🌲' },
            { id: 2, name: '채석장', icon: '⛏️' },
            { id: 3, name: '농장', icon: '🌾' },
            { id: 4, name: '요새', icon: '🏰' },
            { id: 5, name: '창고', icon: '📦' },
            { id: 6, name: '대장간', icon: '🔨' }
        ];

        buildingOptions.forEach(building => {
            const item = document.createElement('div');
            item.className = 'building-item';
            item.innerHTML = `<div>${building.icon} ${building.name}</div>`;
            item.onclick = () => {
                console.log(`${building.name} 건설 모드 활성화`);
                // 건설 모드 활성화 (미구현)
            };
            panel.appendChild(item);
        });
    }

    static showProductionInfo(gameState) {
        const production = gameState.resourceSystem.getProductionInfo('player');
        const storage = gameState.resourceSystem.getStorageInfo('player');
        console.log(`생산량 - 목재: ${production.wood.toFixed(2)}/s, 석재: ${production.stone.toFixed(2)}/s, 식량: ${production.food.toFixed(2)}/s`);
        console.log(`저장소 용량: ${storage}`);
    }

    static updateDungeonPanel(gameState) {
        const panel = document.getElementById('dungeonPanel');
        panel.innerHTML = '';

        const dungeonOptions = [
            { difficulty: 'EASY', name: '입문', icon: '🗡️' },
            { difficulty: 'NORMAL', name: '쉬움', icon: '⚔️' },
            { difficulty: 'HARD', name: '어려움', icon: '🔥' },
            { difficulty: 'HELL', name: '지옥', icon: '💀' },
            { difficulty: 'ELITE', name: '진급', icon: '👑' }
        ];

        dungeonOptions.forEach(dungeon => {
            const item = document.createElement('div');
            item.className = 'dungeon-item';
            item.innerHTML = `<div>${dungeon.icon} ${dungeon.name}</div>`;
            item.onclick = () => {
                const playerUnits = gameState.unitManager.getUnitsByOwner('player');
                if (playerUnits.length === 0) {
                    alert('부대가 없습니다!');
                    return;
                }
                const dungeon = gameState.startDungeon(dungeon.difficulty);
                console.log(`${dungeon.difficulty} 던전 시작:`, dungeon);
                
                // 던전 클리어 시뮬레이션
                setTimeout(() => {
                    const rewards = gameState.clearDungeon(dungeon);
                    UIManager.updateResourceDisplay(gameState);
                    alert(`던전 클리어!\n금화: +${rewards.gold}\n경험치: +${rewards.experience}`);
                }, 1000);
            };
            panel.appendChild(item);
        });
    }
}

// ============================================
// 메인 게임 루프
// ============================================

class Game {
    constructor() {
        this.gameState = new GameState();
        this.renderer = new MapRenderer(document.getElementById('gameCanvas'));
        this.isRunning = true;

        this.initializeGame();
        this.gameLoop();
    }

    initializeGame() {
        // 플레이어 거점 생성
        this.gameState.bases.push({
            x: 10,
            y: 10,
            name: '본거지',
            owner: 'player',
            hp: 100,
            level: 1
        });

        // 중립 거점 생성
        this.gameState.bases.push({
            x: 50,
            y: 50,
            name: '중립지',
            owner: 'neutral',
            hp: 50,
            level: 1
        });

        // 초기 건물 생성
        this.gameState.buildingManager.createBuilding(1, 12, 10, 'player'); // 벌목장
        this.gameState.buildingManager.createBuilding(2, 14, 10, 'player'); // 채석장
        this.gameState.buildingManager.createBuilding(3, 16, 10, 'player'); // 농장
        this.gameState.buildingManager.createBuilding(5, 18, 10, 'player'); // 창고

        // 초기 부대 생성
        this.gameState.unitManager.createUnit(1, 11, 11, 'player'); // 검사
        this.gameState.unitManager.createUnit(2, 12, 12, 'player'); // 궁수
        this.gameState.unitManager.createUnit(3, 13, 13, 'player'); // 기병

        // 초기 타일 상태 설정
        for (let x = 0; x < GAME_CONFIG.MAP_SIZE; x += 5) {
            for (let y = 0; y < GAME_CONFIG.MAP_SIZE; y += 5) {
                const key = `${x},${y}`;
                this.gameState.tiles.set(key, {
                    owner: 'neutral',
                    resources: Math.random() > 0.7 ? 'wood' : 'stone'
                });
            }
        }

        // UI 초기화
        UIManager.updateResourceDisplay(this.gameState);
        UIManager.updateTimeDisplay(this.gameState);
        UIManager.updateUnitPanel(this.gameState);
        UIManager.updateBuildingPanel(this.gameState);
        UIManager.updateDungeonPanel(this.gameState);
        UIManager.showProductionInfo(this.gameState);
    }

    gameLoop() {
        if (!this.isRunning) return;

        // 게임 상태 업데이트
        this.gameState.updateSeason();
        this.gameState.updateResources();

        // UI 업데이트
        UIManager.updateResourceDisplay(this.gameState);
        UIManager.updateTimeDisplay(this.gameState);

        // 렌더링
        this.renderer.render(this.gameState);

        requestAnimationFrame(() => this.gameLoop());
    }

    stop() {
        this.isRunning = false;
    }
}

// ============================================
// 게임 시작
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
