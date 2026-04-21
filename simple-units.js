// ============================================
// 간단한 병사 시스템
// ============================================

const UNIT_TYPES_SIMPLE = {
    SPEARMAN: {
        id: 1,
        name: '창병',
        attack: 10,
        defense: 8,
        hp: 25,
        moveDistance: 3,
        attackRange: 1,
        foodConsumption: 1,  // 시간당 식량 소비
        cost: { food: 50, wood: 20, stone: 10 }
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
        cost: { food: 60, wood: 30, stone: 15 }
    },
    CAVALRY: {
        id: 3,
        name: '기병',
        attack: 15,
        defense: 7,
        hp: 30,
        moveDistance: 5,
        attackRange: 1,
        foodConsumption: 2,
        cost: { food: 80, wood: 40, stone: 20 }
    }
};

class SimpleUnit {
    constructor(typeId, x, y, owner = 'player') {
        const typeData = Object.values(UNIT_TYPES_SIMPLE).find(u => u.id === typeId);
        if (!typeData) throw new Error(`Unknown unit type: ${typeId}`);

        Object.assign(this, typeData);
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.currentHp = this.hp;
        this.experience = 0;
        this.level = 1;
    }

    takeDamage(damage) {
        this.currentHp = Math.max(0, this.currentHp - damage);
        return this.currentHp <= 0;
    }

    heal(amount) {
        this.currentHp = Math.min(this.hp, this.currentHp + amount);
    }

    isAlive() {
        return this.currentHp > 0;
    }

    getInfo() {
        return {
            name: this.name,
            level: this.level,
            hp: this.currentHp,
            maxHp: this.hp,
            x: this.x,
            y: this.y
        };
    }
}

class SimpleUnitManager {
    constructor() {
        this.units = [];
        this.nextUnitId = 0;
    }

    createUnit(typeId, x, y, owner = 'player') {
        const unit = new SimpleUnit(typeId, x, y, owner);
        unit.id = this.nextUnitId++;
        this.units.push(unit);
        return unit;
    }

    getUnitsByOwner(owner) {
        return this.units.filter(u => u.owner === owner && u.isAlive());
    }

    getUnitsAtLocation(x, y) {
        return this.units.filter(u => u.x === x && u.y === y && u.isAlive());
    }

    removeDeadUnits() {
        this.units = this.units.filter(u => u.isAlive());
    }

    getTotalFoodConsumption(owner) {
        return this.getUnitsByOwner(owner).reduce((sum, u) => sum + u.foodConsumption, 0);
    }

    moveUnit(unitId, newX, newY) {
        const unit = this.units.find(u => u.id === unitId);
        if (unit) {
            unit.x = newX;
            unit.y = newY;
            return true;
        }
        return false;
    }

    removeUnit(unitId) {
        const index = this.units.findIndex(u => u.id === unitId);
        if (index !== -1) {
            this.units.splice(index, 1);
            return true;
        }
        return false;
    }
}
