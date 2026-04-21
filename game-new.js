// ============================================
// 새로운 게임 상태 관리
// ============================================

class NewGameState {
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
        
        // 거점 주변 땅 자동 점령
        this.landMap.occupyAroundBase(250, 250, 5);

        // 거점에 초기 병사 2명 배치 (창병)
        const unit1 = this.unitManager.createUnit(1, 250, 250, 'player');
        const unit2 = this.unitManager.createUnit(1, 250, 250, 'player');
        playerBase.addUnit(unit1);
        playerBase.addUnit(unit2);

        // 식량 소비량 업데이트
        this.resourceSystem.addUnitConsumption(unit1.foodConsumption);
        this.resourceSystem.addUnitConsumption(unit2.foodConsumption);

        // 거점 페이지로 시작
        this.pageManager.goToBase(playerBase.id);

        console.log('✅ 게임 초기화 완료');
        console.log('초기 자원:', this.resourceSystem.getResources());
        console.log('생산량:', this.resourceSystem.getProductionInfo());
    }

    /**
     * 게임 상태 업데이트
     */
    update() {
        // 자원 생산 업데이트
        this.resourceSystem.update();

        // 땅에서의 자원 생산 추가
        const landProduction = this.landMap.getPlayerProduction();
        this.resourceSystem.add('food', landProduction.food / 3600);  // 시간당 생산을 초당으로 변환
        this.resourceSystem.add('wood', landProduction.wood / 3600);
        this.resourceSystem.add('stone', landProduction.stone / 3600);
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
     * 거점으로 이동
     */
    goToBase(baseId) {
        this.pageManager.goToBase(baseId);
    }

    /**
     * 땅으로 이동
     */
    goToLand() {
        this.pageManager.goToLand();
    }

    /**
     * 땅 점령
     */
    occupyLand(x, y) {
        return this.landMap.occupyLand(x, y, 'player');
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
            // 저장 데이터로부터 복원 (미구현)
            return true;
        }
        return false;
    }
}

// ============================================
// UI 관리자
// ============================================

class NewUIManager {
    static updateResourceDisplay(gameState) {
        const resources = gameState.resourceSystem.getResources();
        document.getElementById('wood').textContent = resources.wood;
        document.getElementById('stone').textContent = resources.stone;
        document.getElementById('food').textContent = resources.food;
    }

    static updateProductionDisplay(gameState) {
        const production = gameState.resourceSystem.getProductionInfo();
        const landProduction = gameState.landMap.getPlayerProduction();
        
        const info = `
            시간당 생산: 식량 ${production.food.toFixed(1)} (소비: ${production.foodConsumption.toFixed(1)}) | 목재 ${production.wood.toFixed(1)} | 석재 ${production.stone.toFixed(1)}
            땅 생산: 식량 ${landProduction.food} | 목재 ${landProduction.wood} | 석재 ${landProduction.stone}
        `;
        console.log(info);
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

        if (gameState.pageManager.isBasePage()) {
            const btn = document.createElement('div');
            btn.className = 'building-item';
            btn.style.cursor = 'pointer';
            btn.style.background = '#60a5fa';
            btn.textContent = '🗺️ 땅으로 이동';
            btn.onclick = () => gameState.goToLand();
            panel.appendChild(btn);
        } else {
            const btn = document.createElement('div');
            btn.className = 'building-item';
            btn.style.cursor = 'pointer';
            btn.style.background = '#a78bfa';
            btn.textContent = '🏠 거점으로 돌아가기';
            btn.onclick = () => gameState.goToBase(gameState.baseManager.getPlayerBase().id);
            panel.appendChild(btn);
        }
    }

    static updateLandInfo(gameState) {
        const playerLands = gameState.landMap.getPlayerLands();
        const info = `
            소유 땅: ${playerLands.length}개
            생산: 식량 ${gameState.landMap.getPlayerProduction().food}/h | 목재 ${gameState.landMap.getPlayerProduction().wood}/h | 석재 ${gameState.landMap.getPlayerProduction().stone}/h
        `;
        console.log(info);
    }
}

// ============================================
// 메인 게임 루프
// ============================================

class NewGame {
    constructor() {
        this.gameState = new NewGameState();
        this.renderer = new PageRenderer(document.getElementById('gameCanvas'));
        this.isRunning = true;

        this.setupUI();
        this.gameLoop();
    }

    setupUI() {
        NewUIManager.updateResourceDisplay(this.gameState);
        NewUIManager.updateBasePanel(this.gameState);
        NewUIManager.updatePageButtons(this.gameState);
    }

    gameLoop() {
        if (!this.isRunning) return;

        // 게임 상태 업데이트
        this.gameState.update();

        // UI 업데이트
        NewUIManager.updateResourceDisplay(this.gameState);
        NewUIManager.updateBasePanel(this.gameState);
        NewUIManager.updatePageButtons(this.gameState);

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
    const game = new NewGame();
});
