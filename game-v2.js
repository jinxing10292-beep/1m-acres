// ============================================
// 게임 상태 관리 v2
// ============================================

class GameState {
    constructor() {
        this.resourceSystem = new ResourceSystem();
        this.landMap = new LandMap(500);
        this.baseManager = new BaseManager();
        this.unitManager = new SimpleUnitManager();
        this.pageManager = new PageManager();
        this.saveSystem = new SaveSystem();

        this.initializeGame();
    }

    initializeGame() {
        // 플레이어 거점 생성
        const playerBase = this.baseManager.createBase(250, 250, '본거지', 'player');
        
        // 거점에 초기 병사 2명 배치 (창병)
        const unit1 = this.unitManager.createUnit(1, 250, 250, 'player');
        const unit2 = this.unitManager.createUnit(1, 250, 250, 'player');
        playerBase.addUnit(unit1);
        playerBase.addUnit(unit2);

        // 식량 소비량 업데이트
        this.resourceSystem.addUnitConsumption(unit1.foodConsumption);
        this.resourceSystem.addUnitConsumption(unit2.foodConsumption);

        // 거점 내부 페이지로 시작
        this.pageManager.goToBaseInner(playerBase.id);

        console.log('✅ 게임 초기화 완료');
        console.log('초기 자원:', this.resourceSystem.getResources());
        console.log('보상 포인트:', this.resourceSystem.getRewardPoints());
    }

    /**
     * 게임 상태 업데이트
     */
    update() {
        // 자원 생산 업데이트 (1시간마다 딱 1번)
        this.resourceSystem.update();
    }

    /**
     * 병사 생성
     */
    createUnit(typeId, baseId) {
        const base = this.baseManager.getBase(baseId);
        if (!base) return false;

        const unitType = Object.values(UNIT_TYPES_SIMPLE).find(u => u.id === typeId);
        if (!unitType) return false;

        // 자원 확인
        if (!this.resourceSystem.consume('food', unitType.cost.food) ||
            !this.resourceSystem.consume('wood', unitType.cost.wood) ||
            !this.resourceSystem.consume('stone', unitType.cost.stone)) {
            console.log('❌ 자원 부족');
            return false;
        }

        // 병사 생성
        const unit = this.unitManager.createUnit(typeId, base.x, base.y, 'player');
        base.addUnit(unit);

        // 식량 소비량 업데이트
        this.resourceSystem.addUnitConsumption(unit.foodConsumption);

        console.log(`✅ ${unitType.name} 생성`);
        return true;
    }

    /**
     * 병사 제거
     */
    removeUnit(unitId) {
        const unit = this.unitManager.units.find(u => u.id === unitId);
        if (!unit) return false;

        // 식량 소비량 업데이트
        this.resourceSystem.removeUnitConsumption(unit.foodConsumption);

        // 거점에서 제거
        const base = this.baseManager.getAllBases().find(b => b.units.some(u => u.id === unitId));
        if (base) {
            base.removeUnit(unitId);
        }

        // 유닛 제거
        this.unitManager.removeUnit(unitId);

        console.log('✅ 병사 제거');
        return true;
    }

    /**
     * 땅 점령
     */
    occupyLand(x, y) {
        return this.landMap.occupyLand(x, y, 'player');
    }

    /**
     * 땅 진입
     */
    enterLand(x, y) {
        this.pageManager.goToLandInner(x, y);
    }

    /**
     * 거점 진입
     */
    enterBase(baseId) {
        this.pageManager.goToBaseInner(baseId);
    }

    /**
     * 거점 나가기
     */
    exitBase() {
        this.pageManager.goToLand();
    }

    /**
     * 땅 나가기
     */
    exitLand() {
        this.pageManager.goToLand();
    }

    /**
     * 건물 업그레이드
     */
    upgradeBuilding(building, resourceCost) {
        if (!this.resourceSystem.consume('wood', resourceCost.wood) ||
            !this.resourceSystem.consume('stone', resourceCost.stone)) {
            console.log('❌ 자원 부족');
            return false;
        }

        building.upgrade();
        console.log(`✅ ${building.name} Lv${building.level}로 업그레이드`);
        return true;
    }

    /**
     * 보상 포인트로 보물 상자 획득
     */
    getRewardBox(land, pointCost) {
        if (!this.resourceSystem.useRewardPoints(pointCost)) {
            console.log('❌ 보상 포인트 부족');
            return false;
        }

        // 보상 계산 (간단히 자원 추가)
        const reward = {
            food: Math.floor(Math.random() * 100) + 50,
            wood: Math.floor(Math.random() * 100) + 50,
            stone: Math.floor(Math.random() * 100) + 50
        };

        this.resourceSystem.add('food', reward.food);
        this.resourceSystem.add('wood', reward.wood);
        this.resourceSystem.add('stone', reward.stone);

        console.log('✅ 보물 상자 획득:', reward);
        return true;
    }

    /**
     * 저장
     */
    save() {
        return this.saveSystem.saveGame(this);
    }

    /**
     * 로드
     */
    load() {
        const saveData = this.saveSystem.loadGame();
        if (saveData) {
            return true;
        }
        return false;
    }
}

// ============================================
// UI 관리자 v2
// ============================================

class UIManager {
    static updateResourceDisplay(gameState) {
        const resources = gameState.resourceSystem.getResources();
        document.getElementById('food').textContent = resources.food;
        document.getElementById('wood').textContent = resources.wood;
        document.getElementById('stone').textContent = resources.stone;
    }

    static updatePageInfo(gameState) {
        const pageManager = gameState.pageManager;
        let pageInfo = '';

        if (pageManager.isLandPage()) {
            pageInfo = '🗺️ 땅';
        } else if (pageManager.isLandInnerPage()) {
            const land = gameState.landMap.getLand(pageManager.currentLandX, pageManager.currentLandY);
            pageInfo = `📍 ${land.getTypeDisplay()} Lv${land.level}`;
        } else if (pageManager.isBaseInnerPage()) {
            pageInfo = '🏰 거점 내부';
        }

        document.getElementById('pageInfo').textContent = pageInfo;
    }

    static updateBasePanel(gameState) {
        const panel = document.getElementById('unitPanel');
        const base = gameState.baseManager.getPlayerBase();
        
        if (!base) {
            panel.innerHTML = '';
            return;
        }

        panel.innerHTML = '';
        const units = base.getUnits();

        units.forEach(unit => {
            const item = document.createElement('div');
            item.className = 'unit-item';
            item.innerHTML = `
                <div>${unit.name}</div>
                <div style="font-size: 10px; color: #aaa;">HP: ${unit.currentHp}/${unit.hp}</div>
            `;
            panel.appendChild(item);
        });

        // 병사 생성 버튼
        const createBtn = document.createElement('div');
        createBtn.className = 'unit-item';
        createBtn.style.cursor = 'pointer';
        createBtn.style.background = '#4ade80';
        createBtn.innerHTML = '<div>+ 병사 생성</div>';
        createBtn.onclick = () => {
            const menu = document.createElement('div');
            menu.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #2a2a2a;
                border: 2px solid #fbbf24;
                border-radius: 8px;
                padding: 20px;
                z-index: 1000;
            `;

            Object.values(UNIT_TYPES_SIMPLE).forEach(unitType => {
                const btn = document.createElement('button');
                btn.style.cssText = `
                    display: block;
                    width: 100%;
                    padding: 10px;
                    margin: 5px 0;
                    background: #3a3a3a;
                    color: #fff;
                    border: 1px solid #555;
                    border-radius: 4px;
                    cursor: pointer;
                `;
                btn.textContent = `${unitType.name} (식량${unitType.cost.food} 목재${unitType.cost.wood} 석재${unitType.cost.stone})`;
                btn.onclick = () => {
                    gameState.createUnit(unitType.id, base.id);
                    document.body.removeChild(menu);
                    UIManager.updateResourceDisplay(gameState);
                    UIManager.updateBasePanel(gameState);
                };
                menu.appendChild(btn);
            });

            document.body.appendChild(menu);
        };
        panel.appendChild(createBtn);
    }

    static updatePageButtons(gameState) {
        const panel = document.getElementById('buildingPanel');
        panel.innerHTML = '';

        const pageManager = gameState.pageManager;

        if (pageManager.isLandPage()) {
            const btn = document.createElement('div');
            btn.className = 'building-item';
            btn.style.cursor = 'pointer';
            btn.style.background = '#a78bfa';
            btn.textContent = '🏠 거점 진입';
            btn.onclick = () => gameState.enterBase(gameState.baseManager.getPlayerBase().id);
            panel.appendChild(btn);
        } else if (pageManager.isLandInnerPage()) {
            const btn = document.createElement('div');
            btn.className = 'building-item';
            btn.style.cursor = 'pointer';
            btn.style.background = '#60a5fa';
            btn.textContent = '🗺️ 나가기';
            btn.onclick = () => gameState.exitLand();
            panel.appendChild(btn);

            // 땅 정보 표시
            const land = gameState.landMap.getLand(pageManager.currentLandX, pageManager.currentLandY);
            const infoBtn = document.createElement('div');
            infoBtn.className = 'building-item';
            infoBtn.style.background = '#3a3a3a';
            infoBtn.innerHTML = `
                <div>${land.getTypeDisplay()} Lv${land.level}</div>
                <div style="font-size: 10px; color: #aaa;">생산: ${land.production}/h</div>
            `;
            panel.appendChild(infoBtn);

            // 액션 버튼
            if (!land.owner) {
                const occupyBtn = document.createElement('div');
                occupyBtn.className = 'building-item';
                occupyBtn.style.cursor = 'pointer';
                occupyBtn.style.background = '#4ade80';
                occupyBtn.textContent = '🚩 점령';
                occupyBtn.onclick = () => {
                    gameState.occupyLand(pageManager.currentLandX, pageManager.currentLandY);
                    UIManager.updatePageButtons(gameState);
                };
                panel.appendChild(occupyBtn);
            } else if (land.owner === 'player') {
                const dungeonBtn = document.createElement('div');
                dungeonBtn.className = 'building-item';
                dungeonBtn.style.cursor = 'pointer';
                dungeonBtn.style.background = '#f59e0b';
                dungeonBtn.textContent = '💎 둔전 (50포인트)';
                dungeonBtn.onclick = () => {
                    gameState.getRewardBox(land, 50);
                    UIManager.updateResourceDisplay(gameState);
                };
                panel.appendChild(dungeonBtn);
            } else {
                const marchBtn = document.createElement('div');
                marchBtn.className = 'building-item';
                marchBtn.style.background = '#ef4444';
                marchBtn.textContent = '⚔️ 행군';
                panel.appendChild(marchBtn);
            }
        } else if (pageManager.isBaseInnerPage()) {
            const btn = document.createElement('div');
            btn.className = 'building-item';
            btn.style.cursor = 'pointer';
            btn.style.background = '#60a5fa';
            btn.textContent = '🗺️ 나가기';
            btn.onclick = () => gameState.exitBase();
            panel.appendChild(btn);
        }
    }
}

// ============================================
// 메인 게임 루프 v2
// ============================================

class Game {
    constructor() {
        this.gameState = new GameState();
        this.renderer = new PageRenderer(document.getElementById('gameCanvas'));
        this.isRunning = true;

        this.setupUI();
        this.setupClickHandler();
        this.gameLoop();
    }

    setupUI() {
        UIManager.updateResourceDisplay(this.gameState);
        UIManager.updatePageInfo(this.gameState);
        UIManager.updateBasePanel(this.gameState);
        UIManager.updatePageButtons(this.gameState);
    }

    setupClickHandler() {
        this.renderer.canvas.addEventListener('click', (e) => {
            this.renderer.handleClick(e, this.gameState, this.gameState.pageManager);
        });
    }

    gameLoop() {
        if (!this.isRunning) return;

        // 게임 상태 업데이트
        this.gameState.update();

        // UI 업데이트
        UIManager.updateResourceDisplay(this.gameState);
        UIManager.updatePageInfo(this.gameState);
        UIManager.updateBasePanel(this.gameState);
        UIManager.updatePageButtons(this.gameState);

        // 렌더링
        this.renderer.render(this.gameState, this.gameState.pageManager);

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
