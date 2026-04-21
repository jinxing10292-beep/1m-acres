// ============================================
// 병사 데이터 및 시스템
// ============================================

const UNIT_TYPES = {
    // 기본 병과 (1~6)
    SWORDSMAN: {
        id: 1,
        name: '검사',
        attack: 15,
        defense: 10,
        hp: 30,
        moveDistance: 3,
        attackRange: 1,
        foodConsumption: 2,
        angerThreshold: 100,
        inventorySlots: 1,
        cost: { wood: 10, stone: 5, gold: 10 }
    },
    ARCHER: {
        id: 2,
        name: '궁수',
        attack: 12,
        defense: 5,
        hp: 20,
        moveDistance: 4,
        attackRange: 3,
        foodConsumption: 1.5,
        angerThreshold: 80,
        inventorySlots: 2,
        cost: { wood: 15, stone: 5, gold: 15 }
    },
    CAVALRY: {
        id: 3,
        name: '기병',
        attack: 18,
        defense: 8,
        hp: 35,
        moveDistance: 5,
        attackRange: 1,
        foodConsumption: 3,
        angerThreshold: 120,
        inventorySlots: 1,
        cost: { wood: 20, stone: 10, gold: 25 }
    },
    MAGE: {
        id: 4,
        name: '마법사',
        attack: 20,
        defense: 3,
        hp: 15,
        moveDistance: 2,
        attackRange: 4,
        foodConsumption: 1,
        angerThreshold: 60,
        inventorySlots: 3,
        cost: { wood: 25, stone: 15, gold: 40 }
    },
    PRIEST: {
        id: 5,
        name: '사제',
        attack: 8,
        defense: 12,
        hp: 25,
        moveDistance: 2,
        attackRange: 2,
        foodConsumption: 1.5,
        angerThreshold: 90,
        inventorySlots: 2,
        cost: { wood: 15, stone: 20, gold: 30 }
    },
    BERSERKER: {
        id: 6,
        name: '광전사',
        attack: 25,
        defense: 5,
        hp: 40,
        moveDistance: 3,
        attackRange: 1,
        foodConsumption: 4,
        angerThreshold: 150,
        inventorySlots: 1,
        cost: { wood: 30, stone: 10, gold: 35 }
    },

    // 고급 병과 (7~13)
    PALADIN: {
        id: 7,
        name: '성기사',
        attack: 16,
        defense: 16,
        hp: 45,
        moveDistance: 3,
        attackRange: 1,
        foodConsumption: 2.5,
        angerThreshold: 110,
        inventorySlots: 2,
        cost: { wood: 25, stone: 25, gold: 50 }
    },
    RANGER: {
        id: 8,
        name: '레인저',
        attack: 14,
        defense: 8,
        hp: 28,
        moveDistance: 5,
        attackRange: 4,
        foodConsumption: 2,
        angerThreshold: 85,
        inventorySlots: 3,
        cost: { wood: 20, stone: 15, gold: 40 }
    },
    KNIGHT: {
        id: 9,
        name: '기사',
        attack: 17,
        defense: 14,
        hp: 50,
        moveDistance: 4,
        attackRange: 1,
        foodConsumption: 3.5,
        angerThreshold: 130,
        inventorySlots: 1,
        cost: { wood: 30, stone: 20, gold: 60 }
    },
    WIZARD: {
        id: 10,
        name: '마법사 (상급)',
        attack: 24,
        defense: 5,
        hp: 20,
        moveDistance: 2,
        attackRange: 5,
        foodConsumption: 1.5,
        angerThreshold: 70,
        inventorySlots: 3,
        cost: { wood: 35, stone: 25, gold: 70 }
    },
    ASSASSIN: {
        id: 11,
        name: '암살자',
        attack: 22,
        defense: 6,
        hp: 18,
        moveDistance: 6,
        attackRange: 1,
        foodConsumption: 1.5,
        angerThreshold: 75,
        inventorySlots: 2,
        cost: { wood: 25, stone: 20, gold: 55 }
    },
    MONK: {
        id: 12,
        name: '수도사',
        attack: 12,
        defense: 10,
        hp: 30,
        moveDistance: 4,
        attackRange: 2,
        foodConsumption: 1,
        angerThreshold: 100,
        inventorySlots: 2,
        cost: { wood: 20, stone: 25, gold: 45 }
    },
    DRUID: {
        id: 13,
        name: '드루이드',
        attack: 10,
        defense: 8,
        hp: 28,
        moveDistance: 3,
        attackRange: 3,
        foodConsumption: 1.2,
        angerThreshold: 95,
        inventorySlots: 3,
        cost: { wood: 30, stone: 30, gold: 50 }
    },

    // 특수 병과 (14~20)
    DRAGON_KNIGHT: {
        id: 14,
        name: '용기사',
        attack: 28,
        defense: 12,
        hp: 60,
        moveDistance: 5,
        attackRange: 2,
        foodConsumption: 5,
        angerThreshold: 160,
        inventorySlots: 2,
        cost: { wood: 50, stone: 40, gold: 100 }
    },
    NECROMANCER: {
        id: 15,
        name: '죽음의 마법사',
        attack: 18,
        defense: 4,
        hp: 22,
        moveDistance: 2,
        attackRange: 4,
        foodConsumption: 2,
        angerThreshold: 80,
        inventorySlots: 3,
        cost: { wood: 40, stone: 35, gold: 80 }
    },
    TEMPLAR: {
        id: 16,
        name: '성전사',
        attack: 19,
        defense: 15,
        hp: 48,
        moveDistance: 3,
        attackRange: 1,
        foodConsumption: 2.8,
        angerThreshold: 125,
        inventorySlots: 2,
        cost: { wood: 35, stone: 30, gold: 70 }
    },
    SHADOW_DANCER: {
        id: 17,
        name: '그림자 무용수',
        attack: 20,
        defense: 7,
        hp: 22,
        moveDistance: 6,
        attackRange: 2,
        foodConsumption: 1.8,
        angerThreshold: 85,
        inventorySlots: 2,
        cost: { wood: 30, stone: 25, gold: 65 }
    },
    GOLEM: {
        id: 18,
        name: '골렘',
        attack: 16,
        defense: 20,
        hp: 80,
        moveDistance: 2,
        attackRange: 1,
        foodConsumption: 0,
        angerThreshold: 200,
        inventorySlots: 1,
        cost: { wood: 20, stone: 60, gold: 90 }
    },
    PHOENIX_KNIGHT: {
        id: 19,
        name: '불사조 기사',
        attack: 26,
        defense: 11,
        hp: 55,
        moveDistance: 4,
        attackRange: 2,
        foodConsumption: 4,
        angerThreshold: 140,
        inventorySlots: 2,
        cost: { wood: 45, stone: 35, gold: 95 }
    },
    VOID_WALKER: {
        id: 20,
        name: '공허의 행자',
        attack: 23,
        defense: 6,
        hp: 25,
        moveDistance: 5,
        attackRange: 3,
        foodConsumption: 2.5,
        angerThreshold: 90,
        inventorySlots: 3,
        cost: { wood: 40, stone: 30, gold: 85 }
    },

    // 전설 병과 (21~26)
    IMMORTAL: {
        id: 21,
        name: '불멸자',
        attack: 30,
        defense: 18,
        hp: 100,
        moveDistance: 4,
        attackRange: 2,
        foodConsumption: 6,
        angerThreshold: 180,
        inventorySlots: 3,
        cost: { wood: 60, stone: 50, gold: 150 }
    },
    CELESTIAL_SAGE: {
        id: 22,
        name: '천상의 현자',
        attack: 28,
        defense: 8,
        hp: 35,
        moveDistance: 3,
        attackRange: 5,
        foodConsumption: 2,
        angerThreshold: 100,
        inventorySlots: 3,
        cost: { wood: 50, stone: 45, gold: 140 }
    },
    TITAN: {
        id: 23,
        name: '타이탄',
        attack: 32,
        defense: 14,
        hp: 120,
        moveDistance: 3,
        attackRange: 2,
        foodConsumption: 8,
        angerThreshold: 200,
        inventorySlots: 2,
        cost: { wood: 70, stone: 60, gold: 180 }
    },
    SHADOW_LORD: {
        id: 24,
        name: '그림자의 군주',
        attack: 29,
        defense: 10,
        hp: 45,
        moveDistance: 6,
        attackRange: 3,
        foodConsumption: 3,
        angerThreshold: 110,
        inventorySlots: 3,
        cost: { wood: 55, stone: 50, gold: 160 }
    },
    DIVINE_GUARDIAN: {
        id: 25,
        name: '신성한 수호자',
        attack: 24,
        defense: 22,
        hp: 90,
        moveDistance: 2,
        attackRange: 2,
        foodConsumption: 4,
        angerThreshold: 150,
        inventorySlots: 2,
        cost: { wood: 60, stone: 70, gold: 170 }
    },
    CHAOS_INCARNATE: {
        id: 26,
        name: '혼돈의 화신',
        attack: 35,
        defense: 9,
        hp: 50,
        moveDistance: 5,
        attackRange: 4,
        foodConsumption: 5,
        angerThreshold: 120,
        inventorySlots: 3,
        cost: { wood: 70, stone: 55, gold: 200 }
    }
};

// ============================================
// 유닛 인스턴스 클래스
// ============================================

class Unit {
    constructor(typeId, x, y, owner = 'player') {
        const typeData = Object.values(UNIT_TYPES).find(u => u.id === typeId);
        if (!typeData) throw new Error(`Unknown unit type: ${typeId}`);

        Object.assign(this, typeData);
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.currentHp = this.hp;
        this.anger = 0;
        this.inventory = [];
        this.heroId = null; // 영웅 빙의 ID
        this.experience = 0;
        this.level = 1;
    }

    takeDamage(damage) {
        this.currentHp = Math.max(0, this.currentHp - damage);
        this.anger += damage * 0.5;
        return this.currentHp <= 0;
    }

    heal(amount) {
        this.currentHp = Math.min(this.hp, this.currentHp + amount);
    }

    addToInventory(item) {
        if (this.inventory.length < this.inventorySlots) {
            this.inventory.push(item);
            return true;
        }
        return false;
    }

    getEffectiveStats() {
        let stats = {
            attack: this.attack,
            defense: this.defense,
            hp: this.hp
        };

        // 영웅 빙의 시 스탯 증가 (미구현)
        if (this.heroId) {
            stats.attack *= 1.2;
            stats.defense *= 1.15;
            stats.hp *= 1.1;
        }

        return stats;
    }

    canMove(distance) {
        return distance <= this.moveDistance;
    }

    canAttack(targetDistance) {
        return targetDistance <= this.attackRange;
    }

    isAlive() {
        return this.currentHp > 0;
    }
}

// ============================================
// 유닛 매니저
// ============================================

class UnitManager {
    constructor() {
        this.units = [];
        this.nextUnitId = 0;
    }

    createUnit(typeId, x, y, owner = 'player') {
        const unit = new Unit(typeId, x, y, owner);
        unit.id = this.nextUnitId++;
        this.units.push(unit);
        return unit;
    }

    getUnitsByOwner(owner) {
        return this.units.filter(u => u.owner === owner && u.isAlive());
    }

    getUnitsInArea(x, y, radius) {
        return this.units.filter(u => {
            const distance = Math.sqrt((u.x - x) ** 2 + (u.y - y) ** 2);
            return distance <= radius && u.isAlive();
        });
    }

    removeDeadUnits() {
        this.units = this.units.filter(u => u.isAlive());
    }

    getTotalFoodConsumption(owner) {
        return this.getUnitsByOwner(owner).reduce((sum, u) => sum + u.foodConsumption, 0);
    }
}
