// ============================================
// 턴제 전투 시스템
// ============================================

class CombatSystem {
    constructor() {
        this.currentBattle = null;
        this.battleLog = [];
    }

    startBattle(attacker, defender, location) {
        this.currentBattle = {
            attacker: attacker,
            defender: defender,
            location: location,
            turn: 0,
            isActive: true,
            participants: {
                attacker: [],
                defender: []
            },
            log: []
        };

        this.battleLog = [];
        return this.currentBattle;
    }

    addParticipant(battle, unit, side) {
        if (side === 'attacker') {
            battle.participants.attacker.push(unit);
        } else {
            battle.participants.defender.push(unit);
        }
    }

    executeTurn(battle) {
        if (!battle.isActive) return;

        battle.turn++;
        const log = [];

        // 공격자 턴
        battle.participants.attacker.forEach(unit => {
            if (!unit.isAlive()) return;

            const target = this.selectTarget(unit, battle.participants.defender);
            if (target) {
                const damage = this.calculateDamage(unit, target);
                const killed = target.takeDamage(damage);
                
                log.push({
                    attacker: unit.name,
                    defender: target.name,
                    damage: damage,
                    killed: killed,
                    turn: battle.turn,
                    side: 'attacker'
                });
            }
        });

        // 방어자 턴
        battle.participants.defender.forEach(unit => {
            if (!unit.isAlive()) return;

            const target = this.selectTarget(unit, battle.participants.attacker);
            if (target) {
                const damage = this.calculateDamage(unit, target);
                const killed = target.takeDamage(damage);
                
                log.push({
                    attacker: unit.name,
                    defender: target.name,
                    damage: damage,
                    killed: killed,
                    turn: battle.turn,
                    side: 'defender'
                });
            }
        });

        // 전투 종료 체크
        const attackerAlive = battle.participants.attacker.some(u => u.isAlive());
        const defenderAlive = battle.participants.defender.some(u => u.isAlive());

        if (!attackerAlive || !defenderAlive) {
            battle.isActive = false;
            const winner = attackerAlive ? 'attacker' : 'defender';
            log.push({
                type: 'battle_end',
                winner: winner,
                turn: battle.turn
            });
        }

        battle.log.push(...log);
        this.battleLog.push(...log);
        return log;
    }

    selectTarget(unit, enemies) {
        // 가장 가까운 적 선택
        let closest = null;
        let minDistance = Infinity;

        enemies.forEach(enemy => {
            if (!enemy.isAlive()) return;
            const distance = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
            if (distance < minDistance && distance <= unit.attackRange) {
                minDistance = distance;
                closest = enemy;
            }
        });

        return closest;
    }

    calculateDamage(attacker, defender) {
        const attackerStats = attacker.getEffectiveStats();
        const defenderStats = defender.getEffectiveStats();

        // 기본 데미지 = 공격력 - 방어력 * 0.5
        let baseDamage = attackerStats.attack - defenderStats.defense * 0.5;
        baseDamage = Math.max(1, baseDamage); // 최소 1 데미지

        // 분노치에 따른 데미지 증가 (분노치 100당 10% 증가)
        const angerBonus = 1 + (attacker.anger / 100) * 0.1;
        const finalDamage = Math.floor(baseDamage * angerBonus);

        return finalDamage;
    }

    getBattleResult(battle) {
        if (battle.isActive) return null;

        const winner = battle.participants.attacker.some(u => u.isAlive()) ? 'attacker' : 'defender';
        const loser = winner === 'attacker' ? 'defender' : 'attacker';

        return {
            winner: winner,
            winnerUnits: battle.participants[winner].filter(u => u.isAlive()),
            loserUnits: battle.participants[loser].filter(u => !u.isAlive()),
            totalTurns: battle.turn,
            rewards: this.calculateRewards(battle)
        };
    }

    calculateRewards(battle) {
        const rewards = {
            gold: 0,
            experience: 0,
            loot: []
        };

        // 패배한 부대 수에 따른 보상
        const defeatedCount = battle.participants.defender.filter(u => !u.isAlive()).length;
        rewards.gold = defeatedCount * 10;
        rewards.experience = defeatedCount * 50;

        // 전리품 (확률 기반)
        if (Math.random() > 0.5) {
            rewards.loot.push({
                name: '은 상자',
                value: 100,
                rarity: 'silver'
            });
        }

        return rewards;
    }

    endBattle() {
        this.currentBattle = null;
    }
}

// ============================================
// 타일 기반 이동 시스템
// ============================================

class MovementSystem {
    constructor() {
        this.selectedUnit = null;
        this.validMoves = [];
    }

    getValidMoves(unit, obstacles = []) {
        const moves = [];
        const visited = new Set();
        const queue = [{ x: unit.x, y: unit.y, distance: 0 }];

        while (queue.length > 0) {
            const current = queue.shift();
            const key = `${current.x},${current.y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            if (current.distance > 0) {
                moves.push({ x: current.x, y: current.y, distance: current.distance });
            }

            if (current.distance < unit.moveDistance) {
                // 상하좌우 이동
                const directions = [
                    { x: current.x + 1, y: current.y },
                    { x: current.x - 1, y: current.y },
                    { x: current.x, y: current.y + 1 },
                    { x: current.x, y: current.y - 1 }
                ];

                directions.forEach(dir => {
                    if (dir.x >= 0 && dir.x < GAME_CONFIG.MAP_SIZE &&
                        dir.y >= 0 && dir.y < GAME_CONFIG.MAP_SIZE) {
                        const obstacleKey = `${dir.x},${dir.y}`;
                        if (!obstacles.includes(obstacleKey)) {
                            queue.push({
                                x: dir.x,
                                y: dir.y,
                                distance: current.distance + 1
                            });
                        }
                    }
                });
            }
        }

        return moves;
    }

    moveUnit(unit, targetX, targetY) {
        const distance = Math.sqrt((unit.x - targetX) ** 2 + (unit.y - targetY) ** 2);
        
        if (distance <= unit.moveDistance) {
            unit.x = targetX;
            unit.y = targetY;
            return true;
        }

        return false;
    }

    getAttackableTargets(unit, enemies) {
        const targets = [];

        enemies.forEach(enemy => {
            const distance = Math.sqrt((unit.x - enemy.x) ** 2 + (unit.y - enemy.y) ** 2);
            if (distance <= unit.attackRange && enemy.isAlive()) {
                targets.push({
                    unit: enemy,
                    distance: distance
                });
            }
        });

        return targets;
    }
}

// ============================================
// 성벽 공성 시스템
// ============================================

class SiegeSystem {
    constructor() {
        this.walls = [];
    }

    createWall(x, y, owner = 'player') {
        const wall = {
            x: x,
            y: y,
            owner: owner,
            hp: 300,
            maxHp: 300,
            hitPoints: 4, // 타점 4곳
            currentHits: 0,
            level: 1
        };

        this.walls.push(wall);
        return wall;
    }

    attackWall(wall, damage) {
        wall.hp = Math.max(0, wall.hp - damage);
        wall.currentHits++;

        if (wall.hp <= 0) {
            return { destroyed: true, hitsNeeded: wall.currentHits };
        }

        return { destroyed: false, hitsNeeded: wall.currentHits };
    }

    getWallStatus(wall) {
        return {
            hp: wall.hp,
            maxHp: wall.maxHp,
            hitsNeeded: wall.hitPoints - (wall.currentHits % wall.hitPoints),
            level: wall.level
        };
    }

    upgradeWall(wall) {
        if (wall.level < 10) {
            wall.level++;
            wall.maxHp += 20;
            wall.hp = wall.maxHp;
            wall.currentHits = 0;
            return true;
        }
        return false;
    }

    removeDestroyedWalls() {
        this.walls = this.walls.filter(w => w.hp > 0);
    }
}

// ============================================
// 영웅 시스템
// ============================================

const HEROES = {
    1: {
        id: 1,
        name: '유비',
        description: '인자한 지도자',
        stats: { attack: 1.2, defense: 1.15, hp: 1.1 },
        skill: '인애의 손길 - 아군 체력 20% 회복'
    },
    2: {
        id: 2,
        name: '관우',
        description: '무술의 대가',
        stats: { attack: 1.35, defense: 1.1, hp: 1.15 },
        skill: '청룡언월도 - 광범위 공격'
    },
    3: {
        id: 3,
        name: '장비',
        description: '맹렬한 전사',
        stats: { attack: 1.4, defense: 1.05, hp: 1.2 },
        skill: '분노의 일격 - 데미지 2배'
    },
    4: {
        id: 4,
        name: '제갈량',
        description: '천재 전략가',
        stats: { attack: 1.1, defense: 1.2, hp: 0.9 },
        skill: '팔괘진 - 적 이동 제한'
    },
    5: {
        id: 5,
        name: '여포',
        description: '무신의 화신',
        stats: { attack: 1.5, defense: 1.0, hp: 1.25 },
        skill: '천하무적 - 모든 공격 회피'
    },
    6: {
        id: 6,
        name: '손권',
        description: '영리한 군주',
        stats: { attack: 1.15, defense: 1.25, hp: 1.1 },
        skill: '해상 전술 - 이동 거리 2배'
    }
};

class HeroSystem {
    constructor() {
        this.heroes = [];
        this.heroHalls = [];
    }

    createHeroHall(level = 1) {
        const hall = {
            level: level,
            capacity: Math.min(level, 4), // 최대 4명
            heroes: []
        };

        this.heroHalls.push(hall);
        return hall;
    }

    recruitHero(heroId, hall) {
        if (hall.heroes.length >= hall.capacity) {
            return false;
        }

        const heroData = HEROES[heroId];
        if (!heroData) return false;

        const hero = {
            ...heroData,
            level: 1,
            experience: 0
        };

        hall.heroes.push(hero);
        this.heroes.push(hero);
        return true;
    }

    assignHeroToUnit(hero, unit) {
        unit.heroId = hero.id;
        return true;
    }

    removeHeroFromUnit(unit) {
        unit.heroId = null;
        return true;
    }

    getHeroStats(heroId) {
        return HEROES[heroId];
    }
}

// ============================================
// 몬스터 및 PvE 시스템
// ============================================

const MONSTER_DIFFICULTIES = {
    EASY: {
        name: '입문',
        minMonsters: 1,
        maxMonsters: 6,
        minBoxes: 1,
        maxBoxes: 3,
        boxType: 'wood' // 나무 상자
    },
    NORMAL: {
        name: '쉬움',
        minMonsters: 2,
        maxMonsters: 8,
        minBoxes: 2,
        maxBoxes: 5,
        boxType: 'wood'
    },
    HARD: {
        name: '어려움',
        minMonsters: 7,
        maxMonsters: 15,
        minBoxes: 6,
        maxBoxes: 10,
        boxType: 'silver' // 은 상자
    },
    HELL: {
        name: '지옥',
        minMonsters: 10,
        maxMonsters: 20,
        minBoxes: 8,
        maxBoxes: 12,
        boxType: 'silver'
    },
    ELITE: {
        name: '진급',
        minMonsters: 1,
        maxMonsters: 1,
        isBoss: true,
        bossHp: 5000,
        bossAttack: 50,
        minBoxes: 6,
        maxBoxes: 8,
        boxType: 'gold' // 금 상자
    }
};

class PvESystem {
    constructor() {
        this.dungeons = [];
    }

    generateDungeon(difficulty) {
        const diffData = MONSTER_DIFFICULTIES[difficulty];
        const monsterCount = Math.floor(Math.random() * (diffData.maxMonsters - diffData.minMonsters + 1)) + diffData.minMonsters;
        const boxCount = Math.floor(Math.random() * (diffData.maxBoxes - diffData.minBoxes + 1)) + diffData.minBoxes;

        const dungeon = {
            difficulty: difficulty,
            monsters: [],
            boxes: [],
            cleared: false,
            rewards: {
                gold: 0,
                experience: 0,
                items: []
            }
        };

        // 몬스터 생성
        for (let i = 0; i < monsterCount; i++) {
            dungeon.monsters.push({
                id: i,
                hp: diffData.isBoss ? diffData.bossHp : Math.floor(Math.random() * 50) + 20,
                attack: diffData.isBoss ? diffData.bossAttack : Math.floor(Math.random() * 15) + 5,
                isBoss: diffData.isBoss || false
            });
        }

        // 보상 상자 생성
        for (let i = 0; i < boxCount; i++) {
            dungeon.boxes.push({
                id: i,
                type: diffData.boxType,
                value: this.getBoxValue(diffData.boxType)
            });
        }

        this.dungeons.push(dungeon);
        return dungeon;
    }

    getBoxValue(boxType) {
        const values = {
            'wood': 50,
            'silver': 200,
            'gold': 500
        };
        return values[boxType] || 50;
    }

    clearDungeon(dungeon) {
        dungeon.cleared = true;
        dungeon.rewards.gold = dungeon.boxes.reduce((sum, box) => sum + box.value, 0);
        dungeon.rewards.experience = dungeon.monsters.length * 100;

        // 특수 보상: 만능 보물상자 (유적 클리어 또는 적 거점 함락 시)
        if (dungeon.difficulty === 'ELITE') {
            dungeon.rewards.items.push({
                name: '만능 보물상자',
                rarity: 'legendary',
                value: 1000
            });
        }

        return dungeon.rewards;
    }
}
