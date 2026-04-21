// ============================================
// 저장 시스템 (localStorage 기반)
// ============================================

class SaveSystem {
    constructor() {
        this.SAVE_KEY = 'three-kingdoms-save';
        this.AUTO_SAVE_INTERVAL = 30000; // 30초마다 자동 저장
        this.autoSaveTimer = null;
    }

    /**
     * 게임 상태를 저장
     */
    saveGame(gameState) {
        try {
            const saveData = {
                timestamp: Date.now(),
                version: '0.3.0',
                gameState: {
                    resources: gameState.resources,
                    currentDay: gameState.currentDay,
                    currentSeason: gameState.currentSeason,
                    isPvPEnabled: gameState.isPvPEnabled,
                    bases: gameState.bases,
                    tiles: Array.from(gameState.tiles.entries()),
                    selectedPolicies: gameState.roguelikeManager.selectedPolicies
                },
                units: this.serializeUnits(gameState.unitManager),
                buildings: this.serializeBuildings(gameState.buildingManager)
            };

            const jsonString = JSON.stringify(saveData);
            localStorage.setItem(this.SAVE_KEY, jsonString);
            
            console.log('✅ 게임 저장 완료:', new Date(saveData.timestamp).toLocaleString());
            return true;
        } catch (error) {
            console.error('❌ 게임 저장 실패:', error);
            return false;
        }
    }

    /**
     * 저장된 게임 로드
     */
    loadGame() {
        try {
            const jsonString = localStorage.getItem(this.SAVE_KEY);
            if (!jsonString) {
                console.log('저장된 게임이 없습니다.');
                return null;
            }

            const saveData = JSON.parse(jsonString);
            console.log('✅ 게임 로드 완료:', new Date(saveData.timestamp).toLocaleString());
            return saveData;
        } catch (error) {
            console.error('❌ 게임 로드 실패:', error);
            return null;
        }
    }

    /**
     * 저장된 게임 삭제
     */
    deleteSave() {
        try {
            localStorage.removeItem(this.SAVE_KEY);
            console.log('✅ 저장 파일 삭제 완료');
            return true;
        } catch (error) {
            console.error('❌ 저장 파일 삭제 실패:', error);
            return false;
        }
    }

    /**
     * 저장 파일 존재 여부 확인
     */
    hasSave() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }

    /**
     * 저장 파일 정보 조회
     */
    getSaveInfo() {
        try {
            const jsonString = localStorage.getItem(this.SAVE_KEY);
            if (!jsonString) return null;

            const saveData = JSON.parse(jsonString);
            return {
                timestamp: new Date(saveData.timestamp).toLocaleString(),
                version: saveData.version,
                day: saveData.gameState.currentDay,
                season: GAME_CONFIG.SEASONS[saveData.gameState.currentSeason],
                resources: saveData.gameState.resources,
                unitCount: saveData.units.length,
                buildingCount: saveData.buildings.length
            };
        } catch (error) {
            console.error('❌ 저장 정보 조회 실패:', error);
            return null;
        }
    }

    /**
     * 자동 저장 시작
     */
    startAutoSave(gameState) {
        this.autoSaveTimer = setInterval(() => {
            this.saveGame(gameState);
        }, this.AUTO_SAVE_INTERVAL);
        console.log('🔄 자동 저장 시작 (30초 주기)');
    }

    /**
     * 자동 저장 중지
     */
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('⏹️ 자동 저장 중지');
        }
    }

    /**
     * 부대 직렬화
     */
    serializeUnits(unitManager) {
        return unitManager.units.map(unit => ({
            id: unit.id,
            typeId: unit.id,
            name: unit.name,
            x: unit.x,
            y: unit.y,
            owner: unit.owner,
            currentHp: unit.currentHp,
            hp: unit.hp,
            attack: unit.attack,
            defense: unit.defense,
            moveDistance: unit.moveDistance,
            attackRange: unit.attackRange,
            foodConsumption: unit.foodConsumption,
            anger: unit.anger,
            heroId: unit.heroId,
            experience: unit.experience,
            level: unit.level
        }));
    }

    /**
     * 건물 직렬화
     */
    serializeBuildings(buildingManager) {
        return buildingManager.buildings.map(building => ({
            id: building.id,
            typeId: building.id,
            name: building.name,
            x: building.x,
            y: building.y,
            owner: building.owner,
            level: building.level,
            currentHp: building.currentHp,
            hp: building.hp
        }));
    }

    /**
     * 저장 데이터로부터 게임 상태 복원
     */
    restoreGameState(saveData, gameState) {
        try {
            // 기본 상태 복원
            gameState.resources = saveData.gameState.resources;
            gameState.currentDay = saveData.gameState.currentDay;
            gameState.currentSeason = saveData.gameState.currentSeason;
            gameState.isPvPEnabled = saveData.gameState.isPvPEnabled;
            gameState.bases = saveData.gameState.bases;
            gameState.tiles = new Map(saveData.gameState.tiles);
            gameState.roguelikeManager.selectedPolicies = saveData.gameState.selectedPolicies;

            // 부대 복원
            gameState.unitManager.units = [];
            gameState.unitManager.nextUnitId = 0;
            saveData.units.forEach(unitData => {
                const unit = new Unit(1, unitData.x, unitData.y, unitData.owner);
                Object.assign(unit, unitData);
                gameState.unitManager.units.push(unit);
                gameState.unitManager.nextUnitId = Math.max(gameState.unitManager.nextUnitId, unitData.id + 1);
            });

            // 건물 복원
            gameState.buildingManager.buildings = [];
            gameState.buildingManager.nextBuildingId = 0;
            saveData.buildings.forEach(buildingData => {
                const building = new Building(1, buildingData.x, buildingData.y, buildingData.owner);
                Object.assign(building, buildingData);
                gameState.buildingManager.buildings.push(building);
                gameState.buildingManager.nextBuildingId = Math.max(gameState.buildingManager.nextBuildingId, buildingData.id + 1);
            });

            console.log('✅ 게임 상태 복원 완료');
            return true;
        } catch (error) {
            console.error('❌ 게임 상태 복원 실패:', error);
            return false;
        }
    }

    /**
     * 저장소 용량 확인
     */
    getStorageInfo() {
        try {
            const saveData = localStorage.getItem(this.SAVE_KEY);
            const sizeInBytes = new Blob([saveData || '']).size;
            const sizeInKB = (sizeInBytes / 1024).toFixed(2);

            return {
                used: `${sizeInKB} KB`,
                available: '5 MB (localStorage 제한)',
                percentage: ((sizeInBytes / (5 * 1024 * 1024)) * 100).toFixed(2) + '%'
            };
        } catch (error) {
            console.error('❌ 저장소 정보 조회 실패:', error);
            return null;
        }
    }

    /**
     * 모든 저장 파일 내보내기 (JSON)
     */
    exportSave() {
        try {
            const saveData = localStorage.getItem(this.SAVE_KEY);
            if (!saveData) {
                console.log('저장된 게임이 없습니다.');
                return null;
            }

            const dataStr = JSON.stringify(JSON.parse(saveData), null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `three-kingdoms-save-${Date.now()}.json`;
            link.click();
            URL.revokeObjectURL(url);

            console.log('✅ 저장 파일 내보내기 완료');
            return true;
        } catch (error) {
            console.error('❌ 저장 파일 내보내기 실패:', error);
            return false;
        }
    }

    /**
     * 저장 파일 가져오기 (JSON)
     */
    importSave(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const saveData = JSON.parse(e.target.result);
                        localStorage.setItem(this.SAVE_KEY, JSON.stringify(saveData));
                        console.log('✅ 저장 파일 가져오기 완료');
                        resolve(true);
                    } catch (error) {
                        console.error('❌ 저장 파일 파싱 실패:', error);
                        reject(error);
                    }
                };
                reader.readAsText(file);
            } catch (error) {
                console.error('❌ 저장 파일 가져오기 실패:', error);
                reject(error);
            }
        });
    }
}

// ============================================
// 저장 시스템 UI
// ============================================

class SaveSystemUI {
    static createSavePanel() {
        const panel = document.createElement('div');
        panel.id = 'savePanel';
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #2a2a2a;
            border: 2px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            z-index: 100;
            min-width: 250px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        `;

        panel.innerHTML = `
            <div style="color: #fbbf24; font-weight: bold; margin-bottom: 10px;">💾 저장 시스템</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button id="saveBtn" style="padding: 8px; background: #4ade80; color: #000; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">💾 게임 저장</button>
                <button id="loadBtn" style="padding: 8px; background: #60a5fa; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">📂 게임 로드</button>
                <button id="exportBtn" style="padding: 8px; background: #a78bfa; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">📤 내보내기</button>
                <button id="deleteBtn" style="padding: 8px; background: #ef4444; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑️ 삭제</button>
            </div>
            <div id="saveInfo" style="margin-top: 10px; font-size: 12px; color: #aaa; border-top: 1px solid #555; padding-top: 10px;"></div>
        `;

        return panel;
    }

    static updateSaveInfo(saveSystem) {
        const infoDiv = document.getElementById('saveInfo');
        if (!infoDiv) return;

        const saveInfo = saveSystem.getSaveInfo();
        const storageInfo = saveSystem.getStorageInfo();

        if (saveInfo) {
            infoDiv.innerHTML = `
                <div>📅 ${saveInfo.timestamp}</div>
                <div>🌍 ${saveInfo.season} ${saveInfo.day}일차</div>
                <div>👥 부대: ${saveInfo.unitCount}명</div>
                <div>🏗️ 건물: ${saveInfo.buildingCount}개</div>
                <div style="margin-top: 5px; color: #fbbf24;">💾 ${storageInfo.used} / ${storageInfo.percentage}</div>
            `;
        } else {
            infoDiv.innerHTML = '<div style="color: #ef4444;">저장된 게임이 없습니다</div>';
        }
    }

    static setupEventListeners(game, saveSystem) {
        const saveBtn = document.getElementById('saveBtn');
        const loadBtn = document.getElementById('loadBtn');
        const exportBtn = document.getElementById('exportBtn');
        const deleteBtn = document.getElementById('deleteBtn');

        if (saveBtn) {
            saveBtn.onclick = () => {
                saveSystem.saveGame(game.gameState);
                SaveSystemUI.updateSaveInfo(saveSystem);
                alert('✅ 게임이 저장되었습니다!');
            };
        }

        if (loadBtn) {
            loadBtn.onclick = () => {
                const saveData = saveSystem.loadGame();
                if (saveData) {
                    saveSystem.restoreGameState(saveData, game.gameState);
                    UIManager.updateResourceDisplay(game.gameState);
                    UIManager.updateTimeDisplay(game.gameState);
                    UIManager.updateUnitPanel(game.gameState);
                    UIManager.updateBuildingPanel(game.gameState);
                    alert('✅ 게임이 로드되었습니다!');
                } else {
                    alert('❌ 저장된 게임을 찾을 수 없습니다.');
                }
            };
        }

        if (exportBtn) {
            exportBtn.onclick = () => {
                saveSystem.exportSave();
            };
        }

        if (deleteBtn) {
            deleteBtn.onclick = () => {
                if (confirm('정말 저장 파일을 삭제하시겠습니까?')) {
                    saveSystem.deleteSave();
                    SaveSystemUI.updateSaveInfo(saveSystem);
                    alert('✅ 저장 파일이 삭제되었습니다!');
                }
            };
        }
    }
}
