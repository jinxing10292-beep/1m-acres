// ============================================
// 거점 시스템
// ============================================

class Base {
    constructor(x, y, name = '거점', owner = 'player') {
        this.x = x;
        this.y = y;
        this.name = name;
        this.owner = owner;
        this.hp = 100;
        this.maxHp = 100;
        this.level = 1;
        this.units = [];  // 거점에 주둔한 병사들
        this.baseInner = new BaseInner();  // 거점 내부 (10x10)
        this.createdAt = Date.now();
    }

    /**
     * 거점에 병사 추가
     */
    addUnit(unit) {
        this.units.push(unit);
    }

    /**
     * 거점에서 병사 제거
     */
    removeUnit(unitId) {
        const index = this.units.findIndex(u => u.id === unitId);
        if (index !== -1) {
            this.units.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * 거점의 모든 병사 조회
     */
    getUnits() {
        return this.units.filter(u => u.isAlive());
    }

    /**
     * 거점 정보 조회
     */
    getInfo() {
        return {
            x: this.x,
            y: this.y,
            name: this.name,
            owner: this.owner,
            hp: this.hp,
            maxHp: this.maxHp,
            level: this.level,
            unitCount: this.getUnits().length
        };
    }

    /**
     * 거점 레벨 업그레이드
     */
    upgrade() {
        if (this.level < 10) {
            this.level++;
            this.maxHp += 20;
            this.hp = this.maxHp;
            return true;
        }
        return false;
    }

    /**
     * 거점 피해
     */
    takeDamage(damage) {
        this.hp = Math.max(0, this.hp - damage);
        return this.hp <= 0;
    }

    /**
     * 거점 회복
     */
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    isDestroyed() {
        return this.hp <= 0;
    }
}

class BaseManager {
    constructor() {
        this.bases = [];
        this.nextBaseId = 0;
    }

    /**
     * 거점 생성
     */
    createBase(x, y, name = '거점', owner = 'player') {
        const base = new Base(x, y, name, owner);
        base.id = this.nextBaseId++;
        this.bases.push(base);
        return base;
    }

    /**
     * 특정 ID의 거점 조회
     */
    getBase(baseId) {
        return this.bases.find(b => b.id === baseId);
    }

    /**
     * 플레이어 거점 조회
     */
    getPlayerBase() {
        return this.bases.find(b => b.owner === 'player');
    }

    /**
     * 모든 거점 조회
     */
    getAllBases() {
        return this.bases;
    }

    /**
     * 거점 제거
     */
    removeBase(baseId) {
        const index = this.bases.findIndex(b => b.id === baseId);
        if (index !== -1) {
            this.bases.splice(index, 1);
            return true;
        }
        return false;
    }

    /**
     * 특정 좌표의 거점 조회
     */
    getBaseAtLocation(x, y) {
        return this.bases.find(b => b.x === x && b.y === y);
    }
}
