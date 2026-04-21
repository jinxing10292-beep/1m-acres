// ============================================
// 자원 시스템 (식량, 목재, 석재)
// ============================================

const RESOURCE_CONFIG = {
    INITIAL_AMOUNT: 700,        // 초기 자원량
    BASE_PRODUCTION_PER_HOUR: 100, // 기본 시간당 생산량
    HOUR_IN_MS: 3600000,        // 1시간 (밀리초)
    REWARD_POINTS_PER_DAY: 50,  // 매일 지급 포인트
    MAX_REWARD_POINTS: 50       // 최대 보상 포인트
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
        
        this.rewardPoints = RESOURCE_CONFIG.MAX_REWARD_POINTS;
        this.lastProductionTime = Date.now();
        this.lastRewardTime = Date.now();
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
     * 자원 업데이트 (1시간마다 딱 1번)
     */
    update() {
        const now = Date.now();
        const elapsedMs = now - this.lastProductionTime;
        
        // 1시간 경과 시 자원 생산
        if (elapsedMs >= RESOURCE_CONFIG.HOUR_IN_MS) {
            this.resources.food += this.production.food;
            this.resources.wood += this.production.wood;
            this.resources.stone += this.production.stone;
            
            this.lastProductionTime = now;
            console.log('✅ 자원 생산:', this.getResources());
        }

        // 보상 포인트 업데이트 (1시간마다)
        if (elapsedMs >= RESOURCE_CONFIG.HOUR_IN_MS) {
            this.rewardPoints = Math.min(
                this.rewardPoints + RESOURCE_CONFIG.REWARD_POINTS_PER_DAY,
                RESOURCE_CONFIG.MAX_REWARD_POINTS
            );
            console.log('✅ 보상 포인트:', this.rewardPoints);
        }
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
     * 보상 포인트 사용
     */
    useRewardPoints(amount) {
        if (this.rewardPoints >= amount) {
            this.rewardPoints -= amount;
            return true;
        }
        return false;
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

    /**
     * 보상 포인트 조회
     */
    getRewardPoints() {
        return this.rewardPoints;
    }
}
