// ============================================
// 건물 데이터 및 시스템
// ============================================

const BUILDING_TYPES = {
    LUMBER_MILL: {
        id: 1,
        name: '벌목장',
        description: '목재 생산',
        baseProduction: 1,
        productionMultiplier: 5,
        resource: 'wood',
        buildCost: { wood: 50, stone: 20, gold: 10 },
        upgradeCost: { wood: 30, stone: 15, gold: 5 },
        maxLevel: 10,
        icon: '🌲'
    },
    QUARRY: {
        id: 2,
        name: '채석장',
        description: '석재 생산',
        baseProduction: 1,
        productionMultiplier: 5,
        resource: 'stone',
        buildCost: { wood: 20, stone: 50, gold: 10 },
        upgradeCost: { wood: 15, stone: 30, gold: 5 },
        maxLevel: 10,
        icon: '⛏️'
    },
    FARM: {
        id: 3,
        name: '농장',
        description: '식량 생산',
        baseProduction: 2,
        productionMultiplier: 5,
        resource: 'food',
        buildCost: { wood: 40, stone: 30, gold: 15 },
        upgradeCost: { wood: 25, stone: 20, gold: 10 },
        maxLevel: 10,
        icon: '🌾'
    },
    FORTRESS: {
        id: 4,
        name: '요새',
        description: '방어 시설 (이동 속도 3배 증가)',
        hp: 80,
        attack: 30,
        hpPerLevel: 5,
        attackPerLevel: 2,
        buildCost: { wood: 100, stone: 100, gold: 50 },
        upgradeCost: { wood: 60, stone: 60, gold: 30 },
        maxLevel: 10,
        icon: '🏰',
        speedBonus: 3
    },
    WAREHOUSE: {
        id: 5,
        name: '창고',
        description: '자원 보관',
        storagePerLevel: 1500,
        buildCost: { wood: 60, stone: 60, gold: 20 },
        upgradeCost: { wood: 40, stone: 40, gold: 15 },
        maxLevel: 10,
        icon: '📦'
    },
    BLACKSMITH: {
        id: 6,
        name: '대장간',
        description: '장비 제작 및 제련',
        buildCost: { wood: 80, stone: 80, gold: 40 },
        upgradeCost: { wood: 50, stone: 50, gold: 25 },
        maxLevel: 10,
        icon: '🔨',
        unlocksEquipmentAtLevel: {
            1: ['철검', '가죽갑옷'],
            3: ['강철검', '강철갑옷'],
            5: ['마법검', '마법갑옷'],
            7: ['전설의 검', '전설의 갑옷'],
            10: ['신성한 검', '신성한 갑옷']
        }
    },
    WALL: {
        id: 7,
        name: '성벽',
        description: '거점 방어 (체력 300, 타점 4곳)',
        hp: 300,
        hitPoints: 4,
        hpPerLevel: 20,
        buildCost: { wood: 70, stone: 100, gold: 30 },
        upgradeCost: { wood: 50, stone: 70, gold: 20 },
        maxLevel: 10,
        icon: '🧱'
    },
    MARKET: {
        id: 8,
        name: '연맹 시장',
        description: '자원 물물교환 (수수료 60%)',
        buildCost: { wood: 90, stone: 90, gold: 50 },
        upgradeCost: { wood: 60, stone: 60, gold: 35 },
        maxLevel: 5,
        icon: '🏪',
        exchangeFee: 0.6
    },
    EMBASSY: {
        id: 9,
        name: '대사관',
        description: '연맹 창설 (3레벨 & 영지 100개 이상)',
        buildCost: { wood: 120, stone: 120, gold: 80 },
        upgradeCost: { wood: 80, stone: 80, gold: 50 },
        maxLevel: 10,
        icon: '🏛️',
        allianceCapacity: {
            1: 0,
            2: 0,
            3: 30,
            4: 30,
            5: 30,
            6: 30,
            7: 30,
            8: 30,
            9: 30,
            10: 30
        },
        specialPoliciesUnlock: {
            50: '정책 1',
            250: '정책 2',
            450: '정책 3'
        }
    },
    DEFENSE_TOWER: {
        id: 10,
        name: '방어 초소',
        description: '자동 배치 (기본 HP 40, ATK 20)',
        hp: 40,
        attack: 20,
        hpPerLevel: 5,
        attackPerLevel: 2,
        buildCost: { wood: 30, stone: 30, gold: 10 },
        upgradeCost: { wood: 20, stone: 20, gold: 5 },
        maxLevel: 10,
        icon: '🗼',
        autoPlaced: true
    }
};

// ============================================
// 건물 인스턴스 클래스
// ============================================

class Building {
    constructor(typeId, x, y, owner = 'player') {
        const typeData = BUILDING_TYPES[Object.keys(BUILDING_TYPES).find(k => BUILDING_TYPES[k].id === typeId)];
        if (!typeData) throw new Error(`Unknown building type: ${typeId}`);

        Object.assign(this, typeData);
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.level = 1;
        this.currentHp = this.hp || 0;
        this.lastProductionTime = Date.now();
        this.totalProduction = 0;
    }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            if (this.hp) {
                this.currentHp = this.hp + (this.hpPerLevel || 0) * (this.level - 1);
            }
            return true;
        }
        return false;
    }

    getProductionPerSecond() {
        if (!this.resource) return 0;
        return (this.baseProduction * this.productionMultiplier) * this.level;
    }

    getStorageCapacity() {
        if (this.id !== 5) return 0; // 창고만 해당
        return this.storagePerLevel * this.level;
    }

    takeDamage(damage) {
        if (!this.hp) return false;
        this.currentHp = Math.max(0, this.currentHp - damage);
        return this.currentHp <= 0;
    }

    isDestroyed() {
        return this.hp && this.currentHp <= 0;
    }

    getEffectiveStats() {
        let stats = {
            hp: this.hp || 0,
            attack: this.attack || 0
        };

        if (this.hp) {
            stats.hp += (this.hpPerLevel || 0) * (this.level - 1);
        }
        if (this.attack) {
            stats.attack += (this.attackPerLevel || 0) * (this.level - 1);
        }

        return stats;
    }
}

// ============================================
// 건물 매니저
// ============================================

class BuildingManager {
    constructor() {
        this.buildings = [];
        this.nextBuildingId = 0;
    }

    createBuilding(typeId, x, y, owner = 'player') {
        const building = new Building(typeId, x, y, owner);
        building.id = this.nextBuildingId++;
        this.buildings.push(building);
        return building;
    }

    getBuildingsByOwner(owner) {
        return this.buildings.filter(b => b.owner === owner && !b.isDestroyed());
    }

    getBuildingsByType(typeId, owner) {
        return this.getBuildingsByOwner(owner).filter(b => b.id === typeId);
    }

    getBuildingsInArea(x, y, radius) {
        return this.buildings.filter(b => {
            const distance = Math.sqrt((b.x - x) ** 2 + (b.y - y) ** 2);
            return distance <= radius && !b.isDestroyed();
        });
    }

    calculateTotalProduction(owner, resource) {
        let total = 0;
        this.getBuildingsByOwner(owner).forEach(building => {
            if (building.resource === resource) {
                total += building.getProductionPerSecond();
            }
        });
        return total;
    }

    calculateTotalStorage(owner) {
        let total = 0;
        this.getBuildingsByOwner(owner).forEach(building => {
            if (building.id === 5) { // 창고
                total += building.getStorageCapacity();
            }
        });
        return total;
    }

    removeDestroyedBuildings() {
        this.buildings = this.buildings.filter(b => !b.isDestroyed());
    }

    getUnlockedEquipment(owner) {
        const blacksmiths = this.getBuildingsByType(6, owner); // 대장간
        const equipment = [];
        blacksmiths.forEach(bs => {
            const unlockedAtLevel = BUILDING_TYPES.BLACKSMITH.unlocksEquipmentAtLevel;
            for (let level = 1; level <= bs.level; level++) {
                if (unlockedAtLevel[level]) {
                    equipment.push(...unlockedAtLevel[level]);
                }
            }
        });
        return [...new Set(equipment)]; // 중복 제거
    }
}

// ============================================
// 자원 생산 시스템
// ============================================

class ResourceSystem {
    constructor(buildingManager) {
        this.buildingManager = buildingManager;
        this.lastUpdateTime = Date.now();
    }

    updateProduction(gameState, owner) {
        const now = Date.now();
        const elapsedSeconds = (now - this.lastUpdateTime) / 1000;

        if (elapsedSeconds < 1) return; // 1초마다 업데이트

        const resources = ['wood', 'stone', 'food'];
        resources.forEach(resource => {
            const production = this.buildingManager.calculateTotalProduction(owner, resource);
            gameState.resources[resource] += production * elapsedSeconds;
        });

        this.lastUpdateTime = now;
    }

    getProductionInfo(owner) {
        const info = {
            wood: this.buildingManager.calculateTotalProduction(owner, 'wood'),
            stone: this.buildingManager.calculateTotalProduction(owner, 'stone'),
            food: this.buildingManager.calculateTotalProduction(owner, 'food')
        };
        return info;
    }

    getStorageInfo(owner) {
        return this.buildingManager.calculateTotalStorage(owner);
    }
}
