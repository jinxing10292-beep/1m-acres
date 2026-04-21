// ============================================
// 자원 시스템 (식량, 목재, 석재)
// ============================================

const RESOURCE_CONFIG = {
    INITIAL_AMOUNT: 700,        // 초기 자원량
    BASE_PRODUCTION_PER_HOUR: 100, // 기본 시간당 생산량
    HOUR_IN_MS: 3600000,        // 1시간 (밀리초)
    PRODUCTION_TICK: 1000       // 1초마다 계산
};

class ResourceSystem {
    constructor() {
        this.resources = {
            food: RESOURCE_CONFIG.INITIAL_AMOUNT,
            wood: RESOURCE_CONFIG.INITIAL_AMOUNT,
            stone: RESOURCE_CONFIG.INITIAL_AMOUNT
        };
        
        this.production = {
            food: RESOURCE_CONFIG.BASE_PRODUCTION_PER_HOUR,
            wood: RESOURCE_CONFIG.BASE_PRODUCTION_PER_HOUR,
            stone: RESOURCE_CONFIG.BASE_PRODUCTION_PER_HOUR
        };
        
        this.consumption = {
            food: 0  // 병사 수에 따라 증가
        };
        
        this.lastUpdateTime = Date.now();
    }

    /**
     * 병사 추가 시 식량 소비량 증가
     */
    addUnitConsumption(foodConsumption) {
        this.consumption.food += foodConsumption;
        // 식량 생산량에서 소비량 차감
        this.production.food = Math.max(0, RESOURCE_CONFIG.BASE_PRODUCTION_PER_HOUR - this.consumption.food);
    }

    /**
     * 병사 제거 시 식량 소비량 감소
     */
    removeUnitConsumption(foodConsumption) {
        this.consumption.food = Math.max(0, this.consumption.food - foodConsumption);
        // 식량 생산량 복구
        this.production.food = Math.max(0, RESOURCE_CONFIG.BASE_PRODUCTION_PER_HOUR - this.consumption.food);
    }

    /**
     * 자원 업데이트 (1시간 = 3600초)
     */
    update() {
        const now = Date.now();
        const elapsedMs = now - this.lastUpdateTime;
        const elapsedHours = elapsedMs / RESOURCE_CONFIG.HOUR_IN_MS;

        // 각 자원 생산
        this.resources.food += this.production.food * elapsedHours;
        this.resources.wood += this.production.wood * elapsedHours;
        this.resources.stone += this.production.stone * elapsedHours;

        this.lastUpdateTime = now;
    }

    /**
     * 자원 소비
     */
    consume(resource, amount) {
        if (this.resources[resource] >= amount) {
            this.resources[resource] -= amount;
            return true;
        }
        return false;
    }

    /**
     * 자원 추가
     */
    add(resource, amount) {
        this.resources[resource] += amount;
    }

    /**
     * 현재 자원 상태 조회
     */
    getResources() {
        return {
            food: Math.floor(this.resources.food),
            wood: Math.floor(this.resources.wood),
            stone: Math.floor(this.resources.stone)
        };
    }

    /**
     * 생산량 정보 조회
     */
    getProductionInfo() {
        return {
            food: this.production.food,
            wood: this.production.wood,
            stone: this.production.stone,
            foodConsumption: this.consumption.food
        };
    }

    /**
     * 시간당 순 생산량 (생산 - 소비)
     */
    getNetProduction() {
        return {
            food: this.production.food - this.consumption.food,
            wood: this.production.wood,
            stone: this.production.stone
        };
    }
}
