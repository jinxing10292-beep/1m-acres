// ============================================
// 땅 시스템
// ============================================

const LAND_TYPES = {
    WASTELAND: 'wasteland',      // 황야
    FOOD_FIELD: 'food_field',    // 식량 생산지
    WOOD_FOREST: 'wood_forest',  // 목재 생산지
    STONE_MINE: 'stone_mine'     // 석재 생산지
};

const LAND_CONFIG = {
    MAX_LEVEL: 10,
    PRODUCTION_PER_LEVEL: {
        food_field: 10,   // 레벨당 10
        wood_forest: 10,
        stone_mine: 10
    }
};

class Land {
    constructor(x, y, type = LAND_TYPES.WASTELAND, level = 1) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.level = level;
        this.owner = null;  // 'player' 또는 null
        this.production = this.calculateProduction();
    }

    /**
     * 생산량 계산
     */
    calculateProduction() {
        if (this.type === LAND_TYPES.WASTELAND) {
            return 0;
        }
        return LAND_CONFIG.PRODUCTION_PER_LEVEL[this.type] * this.level;
    }

    /**
     * 레벨 업그레이드
     */
    upgrade() {
        if (this.level < LAND_CONFIG.MAX_LEVEL) {
            this.level++;
            this.production = this.calculateProduction();
            return true;
        }
        return false;
    }

    /**
     * 땅 점령
     */
    occupy(owner) {
        this.owner = owner;
    }

    /**
     * 땅 해방
     */
    release() {
        this.owner = null;
    }

    /**
     * 땅 정보 조회
     */
    getInfo() {
        return {
            x: this.x,
            y: this.y,
            type: this.type,
            level: this.level,
            owner: this.owner,
            production: this.production
        };
    }

    /**
     * 땅 타입 표시 (UI용)
     */
    getTypeDisplay() {
        const displays = {
            wasteland: '황야',
            food_field: '🌾 식량',
            wood_forest: '🌲 목재',
            stone_mine: '⛏️ 석재'
        };
        return displays[this.type] || '?';
    }

    /**
     * 땅 색상 (UI용)
     */
    getColor() {
        const colors = {
            wasteland: '#6b7280',
            food_field: '#fbbf24',
            wood_forest: '#22c55e',
            stone_mine: '#94a3b8'
        };
        return colors[this.type] || '#1f2937';
    }
}

/**
 * 땅 맵 관리
 */
class LandMap {
    constructor(mapSize = 500) {
        this.mapSize = mapSize;
        this.lands = new Map();
        this.initializeLands();
    }

    /**
     * 모든 땅 초기화
     */
    initializeLands() {
        for (let x = 0; x < this.mapSize; x++) {
            for (let y = 0; y < this.mapSize; y++) {
                const type = this.generateLandType();
                const level = Math.floor(Math.random() * LAND_CONFIG.MAX_LEVEL) + 1;
                const land = new Land(x, y, type, level);
                this.lands.set(`${x},${y}`, land);
            }
        }
    }

    /**
     * 땅 타입 무작위 생성
     */
    generateLandType() {
        const rand = Math.random();
        if (rand < 0.5) return LAND_TYPES.WASTELAND;
        if (rand < 0.65) return LAND_TYPES.FOOD_FIELD;
        if (rand < 0.8) return LAND_TYPES.WOOD_FOREST;
        return LAND_TYPES.STONE_MINE;
    }

    /**
     * 특정 좌표의 땅 조회
     */
    getLand(x, y) {
        return this.lands.get(`${x},${y}`);
    }

    /**
     * 특정 좌표의 땅 점령
     */
    occupyLand(x, y, owner) {
        const land = this.getLand(x, y);
        if (land && !land.owner) {
            land.occupy(owner);
            return true;
        }
        return false;
    }

    /**
     * 특정 좌표의 땅 해방
     */
    releaseLand(x, y) {
        const land = this.getLand(x, y);
        if (land) {
            land.release();
            return true;
        }
        return false;
    }

    /**
     * 플레이어가 소유한 모든 땅 조회
     */
    getPlayerLands() {
        const playerLands = [];
        this.lands.forEach(land => {
            if (land.owner === 'player') {
                playerLands.push(land);
            }
        });
        return playerLands;
    }

    /**
     * 플레이어 소유 땅의 총 생산량
     */
    getPlayerProduction() {
        const production = {
            food: 0,
            wood: 0,
            stone: 0
        };

        this.getPlayerLands().forEach(land => {
            if (land.type === LAND_TYPES.FOOD_FIELD) {
                production.food += land.production;
            } else if (land.type === LAND_TYPES.WOOD_FOREST) {
                production.wood += land.production;
            } else if (land.type === LAND_TYPES.STONE_MINE) {
                production.stone += land.production;
            }
        });

        return production;
    }

    /**
     * 특정 범위 내의 땅 조회
     */
    getLandsInArea(centerX, centerY, radius) {
        const lands = [];
        for (let x = Math.max(0, centerX - radius); x <= Math.min(this.mapSize - 1, centerX + radius); x++) {
            for (let y = Math.max(0, centerY - radius); y <= Math.min(this.mapSize - 1, centerY + radius); y++) {
                const land = this.getLand(x, y);
                if (land) {
                    lands.push(land);
                }
            }
        }
        return lands;
    }

    /**
     * 거점 주변 땅 자동 점령 (거점 생성 시)
     */
    occupyAroundBase(baseX, baseY, radius = 5) {
        const lands = this.getLandsInArea(baseX, baseY, radius);
        lands.forEach(land => {
            if (!land.owner) {
                land.occupy('player');
            }
        });
    }
}
