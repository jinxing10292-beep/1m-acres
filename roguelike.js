// ============================================
// 로그라이크 정책 및 선택 시스템
// ============================================

const POLICY_CARDS = {
    // 자원 관련
    LUMBER_BOOST: {
        id: 1,
        name: '벌목 기술 개선',
        description: '목재 생산량 +20%',
        icon: '🌲',
        category: 'resource',
        effect: (gameState) => {
            gameState.buildingManager.getBuildingsByType(1, 'player').forEach(b => {
                b.baseProduction *= 1.2;
            });
        }
    },
    STONE_BOOST: {
        id: 2,
        name: '채석 기술 개선',
        description: '석재 생산량 +20%',
        icon: '⛏️',
        category: 'resource',
        effect: (gameState) => {
            gameState.buildingManager.getBuildingsByType(2, 'player').forEach(b => {
                b.baseProduction *= 1.2;
            });
        }
    },
    FARM_BOOST: {
        id: 3,
        name: '농업 기술 개선',
        description: '식량 생산량 +20%',
        icon: '🌾',
        category: 'resource',
        effect: (gameState) => {
            gameState.buildingManager.getBuildingsByType(3, 'player').forEach(b => {
                b.baseProduction *= 1.2;
            });
        }
    },
    STORAGE_EXPANSION: {
        id: 4,
        name: '창고 확장',
        description: '저장소 용량 +30%',
        icon: '📦',
        category: 'resource',
        effect: (gameState) => {
            gameState.buildingManager.getBuildingsByType(5, 'player').forEach(b => {
                b.storagePerLevel *= 1.3;
            });
        }
    },

    // 부대 관련
    UNIT_HEALTH: {
        id: 5,
        name: '부대 강화',
        description: '모든 부대 체력 +15%',
        icon: '❤️',
        category: 'unit',
        effect: (gameState) => {
            gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
                unit.hp *= 1.15;
                unit.currentHp = unit.hp;
            });
        }
    },
    UNIT_ATTACK: {
        id: 6,
        name: '전투 훈련',
        description: '모든 부대 공격력 +15%',
        icon: '⚔️',
        category: 'unit',
        effect: (gameState) => {
            gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
                unit.attack *= 1.15;
            });
        }
    },
    UNIT_DEFENSE: {
        id: 7,
        name: '방어 훈련',
        description: '모든 부대 방어력 +15%',
        icon: '🛡️',
        category: 'unit',
        effect: (gameState) => {
            gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
                unit.defense *= 1.15;
            });
        }
    },
    UNIT_SPEED: {
        id: 8,
        name: '기동력 강화',
        description: '모든 부대 이동거리 +2',
        icon: '💨',
        category: 'unit',
        effect: (gameState) => {
            gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
                unit.moveDistance += 2;
            });
        }
    },

    // 건물 관련
    BUILDING_SPEED: {
        id: 9,
        name: '건설 가속',
        description: '건물 건설 시간 -30%',
        icon: '🏗️',
        category: 'building',
        effect: (gameState) => {
            console.log('건설 시간 -30% 적용');
        }
    },
    BUILDING_COST_REDUCTION: {
        id: 10,
        name: '건설 비용 절감',
        description: '건물 건설 비용 -20%',
        icon: '💰',
        category: 'building',
        effect: (gameState) => {
            console.log('건설 비용 -20% 적용');
        }
    },

    // 전투 관련
    CRITICAL_STRIKE: {
        id: 11,
        name: '치명타 강화',
        description: '치명타 확률 +20%, 데미지 2배',
        icon: '⚡',
        category: 'combat',
        effect: (gameState) => {
            gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
                unit.criticalChance = (unit.criticalChance || 0) + 0.2;
            });
        }
    },
    LIFESTEAL: {
        id: 12,
        name: '생명 흡수',
        description: '공격 시 데미지의 30% 회복',
        icon: '🩸',
        category: 'combat',
        effect: (gameState) => {
            gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
                unit.lifesteal = (unit.lifesteal || 0) + 0.3;
            });
        }
    },
    DODGE: {
        id: 13,
        name: '회피 기술',
        description: '받는 데미지 -20%',
        icon: '🏃',
        category: 'combat',
        effect: (gameState) => {
            gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
                unit.dodgeChance = (unit.dodgeChance || 0) + 0.2;
            });
        }
    },

    // 경제 관련
    TRADE_BONUS: {
        id: 14,
        name: '무역 협정',
        description: '자원 교환 수수료 -30%',
        icon: '🏪',
        category: 'economy',
        effect: (gameState) => {
            console.log('교환 수수료 -30% 적용');
        }
    },
    GOLD_PRODUCTION: {
        id: 15,
        name: '금광 개발',
        description: '금화 생산량 +50%',
        icon: '💎',
        category: 'economy',
        effect: (gameState) => {
            console.log('금화 생산 +50% 적용');
        }
    },

    // 특수 관련
    HERO_RECRUITMENT: {
        id: 16,
        name: '영웅 모집',
        description: '영웅 전당 용량 +1',
        icon: '👑',
        category: 'special',
        effect: (gameState) => {
            console.log('영웅 전당 용량 +1 적용');
        }
    },
    TERRITORY_EXPANSION: {
        id: 17,
        name: '영토 확장',
        description: '점령 시 추가 영토 +1칸',
        icon: '🗺️',
        category: 'special',
        effect: (gameState) => {
            console.log('영토 확장 정책 적용');
        }
    },
    FOOD_EFFICIENCY: {
        id: 18,
        name: '식량 효율화',
        description: '부대 식량 소비 -25%',
        icon: '🍖',
        category: 'special',
        effect: (gameState) => {
            gameState.unitManager.getUnitsByOwner('player').forEach(unit => {
                unit.foodConsumption *= 0.75;
            });
        }
    }
};

// ============================================
// 로그라이크 선택 매니저
// ============================================

class RoguelikeManager {
    constructor() {
        this.selectedPolicies = [];
        this.availablePolicies = [];
        this.policyHistory = [];
    }

    generatePolicyChoices(count = 3) {
        const allPolicies = Object.values(POLICY_CARDS);
        const choices = [];

        // 이미 선택된 정책은 제외
        const available = allPolicies.filter(p => !this.selectedPolicies.includes(p.id));

        // 무작위로 선택
        for (let i = 0; i < Math.min(count, available.length); i++) {
            const randomIndex = Math.floor(Math.random() * available.length);
            choices.push(available[randomIndex]);
            available.splice(randomIndex, 1);
        }

        this.availablePolicies = choices;
        return choices;
    }

    selectPolicy(policyId, gameState) {
        const policy = POLICY_CARDS[Object.keys(POLICY_CARDS).find(k => POLICY_CARDS[k].id === policyId)];
        
        if (!policy) return false;

        // 정책 효과 적용
        policy.effect(gameState);

        // 선택 기록
        this.selectedPolicies.push(policyId);
        this.policyHistory.push({
            policyId: policyId,
            policyName: policy.name,
            timestamp: Date.now()
        });

        this.availablePolicies = [];
        return true;
    }

    getSelectedPolicies() {
        return this.selectedPolicies.map(id => {
            const policy = Object.values(POLICY_CARDS).find(p => p.id === id);
            return policy;
        });
    }

    getPolicyInfo(policyId) {
        return Object.values(POLICY_CARDS).find(p => p.id === policyId);
    }

    canSelectPolicy(policyId) {
        return !this.selectedPolicies.includes(policyId);
    }
}

// ============================================
// 로그라이크 UI 렌더러
// ============================================

class RoguelikeUIRenderer {
    static showPolicyChoicePopup(choices, onSelect) {
        const popup = document.getElementById('choicePopup');
        const options = document.getElementById('choiceOptions');
        options.innerHTML = '';

        choices.forEach(policy => {
            const option = document.createElement('div');
            option.className = 'choice-option';
            option.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 8px;">${policy.icon}</div>
                <div style="font-weight: bold; margin-bottom: 4px;">${policy.name}</div>
                <div style="font-size: 12px; color: #aaa;">${policy.description}</div>
            `;
            option.onclick = () => {
                onSelect(policy.id);
                popup.classList.add('hidden');
            };
            options.appendChild(option);
        });

        popup.classList.remove('hidden');
    }

    static updatePolicyDisplay(gameState) {
        const selectedPolicies = gameState.roguelikeManager.getSelectedPolicies();
        console.log('선택된 정책:', selectedPolicies.map(p => p.name).join(', '));
    }
}
