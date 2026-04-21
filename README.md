# 삼국: 계절의 패자 (Three Kingdoms: Season's Loser)

> 500x500 그리드 맵 기반 턴제 RPG + 영토 점령형 전략 시뮬레이션 게임

![Game Status](https://img.shields.io/badge/Status-Phase%203%20Complete-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Platform](https://img.shields.io/badge/Platform-Web%20Browser-orange)

## 🎮 게임 개요

**삼국: 계절의 패자**는 나인 사우전드 에이커(Nine Thousand Acres) 스타일의 귀여운 픽셀 아트 기반 전략 게임입니다.

### 핵심 특징
- 🗺️ **500x500 타일 맵** - 드래그 & 줌 가능한 대규모 맵
- 🌍 **계절 시스템** - 3일 주기의 4계절 변화 (봄/여름/가을/겨울)
- 🛡️ **영토 점령** - 거점 점령으로 주변 영토 확보
- 🎖️ **26종 병과** - 기본/고급/특수/전설 병과 시스템
- 🏗️ **건물 시스템** - 10종 건물로 자원 생산 및 방어
- ⚔️ **턴제 전투** - 타일 기반 턴제 전투 시스템
- 🎲 **로그라이크 정책** - 3택 1 정책 선택으로 성장
- 🏰 **PvE 던전** - 5가지 난이도의 던전 도전

## 📋 프로젝트 구조

```
1m-acres/
├── index.html          # 메인 HTML 파일
├── styles.css          # UI 스타일시트
├── game.js             # 메인 게임 엔진
├── units.js            # 26종 병과 시스템
├── buildings.js        # 10종 건물 시스템
├── combat.js           # 턴제 전투 로직
├── roguelike.js        # 로그라이크 정책 시스템
├── PRD.md              # 프로젝트 요구사항 문서
└── README.md           # 이 파일
```

## 🚀 빠른 시작

### 로컬 실행
```bash
# 저장소 클론
git clone https://github.com/jinxing10292-beep/1m-acres.git
cd 1m-acres

# 로컬 서버 실행 (Python)
python -m http.server 8000

# 또는 Node.js
npx http-server

# 브라우저에서 열기
http://localhost:8000
```

### GitHub Pages 배포
```bash
# 저장소 설정에서 GitHub Pages 활성화
# main 브랜치 선택 후 저장
# https://jinxing10292-beep.github.io/1m-acres 에서 접속 가능
```

## 🎯 게임 시스템

### Phase 1: 코어 엔진 ✅
- [x] 500x500 그리드 맵 렌더링 (Canvas)
- [x] 드래그 팬 & 마우스 휠 줌
- [x] 2x2 거점 표시
- [x] 타일 클릭 이벤트

### Phase 2: 데이터 구조 ✅
- [x] 26종 병과 완전 구현
- [x] 10종 건물 시스템
- [x] 자원 생산 로직
- [x] 식량 소비/생산 시스템
- [x] 저장소 용량 관리

### Phase 3: 턴제 전투 ✅
- [x] 턴제 전투 엔진
- [x] 타일 기반 이동 시스템
- [x] 성벽 공성 시스템
- [x] 영웅 시스템 (6명)
- [x] PvE 던전 (5가지 난이도)
- [x] 로그라이크 정책 (18가지)

### Phase 4: 저장 및 배포 🔄
- [ ] localStorage 저장 시스템
- [ ] 게임 로드/저장 UI
- [ ] GitHub Pages 배포 최적화
- [ ] 모바일 반응형 개선

## 🎮 게임플레이 가이드

### 자원 관리
- **목재**: 벌목장에서 생산
- **석재**: 채석장에서 생산
- **식량**: 농장에서 생산 (부대 유지에 필수)
- **금화**: 던전 클리어 및 거래로 획득

### 부대 운영
1. 부대 선택 (하단 패널)
2. 맵에서 이동 (타일 클릭)
3. 적 부대와 전투 (자동 턴제)
4. 경험치 및 보상 획득

### 건물 건설
1. 건물 선택 (하단 패널)
2. 맵에서 위치 선택
3. 자원 소비하여 건설
4. 레벨 업그레이드로 생산량 증가

### 정책 선택
- 3일차마다 자동으로 팝업 표시
- 3가지 정책 중 1개 선택
- 선택한 정책의 효과 즉시 적용

## 📊 게임 밸런스

### 병과 스탯 예시
| 병과 | 공격 | 방어 | 체력 | 이동 | 공격범위 | 식량소비 |
|------|------|------|------|------|---------|---------|
| 검사 | 15 | 10 | 30 | 3 | 1 | 2 |
| 궁수 | 12 | 5 | 20 | 4 | 3 | 1.5 |
| 기병 | 18 | 8 | 35 | 5 | 1 | 3 |
| 마법사 | 20 | 3 | 15 | 2 | 4 | 1 |

### 건물 생산량
- 기본 생산량 × 5배 배수 (레벨당 증가)
- 예: 벌목장 Lv1 = 5/s, Lv2 = 10/s

### 던전 난이도
| 난이도 | 몬스터 수 | 상자 등급 | 보상 |
|--------|----------|---------|------|
| 입문 | 1-6 | 나무 | 낮음 |
| 쉬움 | 2-8 | 나무 | 낮음 |
| 어려움 | 7-15 | 은 | 중간 |
| 지옥 | 10-20 | 은 | 중간 |
| 진급 | 1 보스 | 금 | 높음 |

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Graphics**: Canvas API
- **Storage**: localStorage (Phase 4)
- **Deployment**: GitHub Pages
- **Version Control**: Git

## 📝 주요 클래스

### GameState
게임의 전체 상태 관리
```javascript
- resources: 자원 (목재, 석재, 식량, 금화)
- unitManager: 부대 관리
- buildingManager: 건물 관리
- combatSystem: 전투 시스템
- roguelikeManager: 정책 선택 관리
```

### Unit
개별 부대 인스턴스
```javascript
- 26종 병과 데이터
- 체력, 분노치, 인벤토리
- 영웅 빙의 시스템
```

### Building
개별 건물 인스턴스
```javascript
- 10종 건물 데이터
- 레벨 업그레이드
- 자원 생산 계산
```

### CombatSystem
턴제 전투 엔진
```javascript
- 턴 실행 및 데미지 계산
- 전투 로그 기록
- 보상 계산
```

## 🎨 UI/UX

### 상단 바
- 자원 표시 (목재, 석재, 식량, 금화)
- 현재 계절 및 일차

### 중앙 맵
- 500x500 타일 그리드
- 드래그로 팬, 휠로 줌
- 건물, 부대, 거점 표시

### 하단 패널
- 부대 편성 (현재 부대 목록)
- 건물 건설 (건설 가능 건물)
- 던전 (5가지 난이도)

### 팝업
- 정책 선택 (3택 1)
- 전투 로그 (전투 결과)

## 🔮 향후 계획 (Phase 4+)

### Phase 4: 저장 및 배포
- [ ] localStorage 저장/로드
- [ ] 자동 저장 시스템
- [ ] GitHub Pages 배포

### Phase 5: 고급 기능
- [ ] 멀티플레이어 (로컬)
- [ ] AI 적 NPC
- [ ] 더 많은 영웅 추가
- [ ] 스킬 시스템

### Phase 6: 콘텐츠 확장
- [ ] 더 많은 건물 종류
- [ ] 특수 이벤트
- [ ] 업적 시스템
- [ ] 리더보드

## 🐛 알려진 문제

- 모바일 터치 이벤트 최적화 필요
- 대규모 전투 시 성능 최적화 필요
- 저장 시스템 미구현

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 👨‍💻 개발자

**Kiro AI Development**
- Phase 1-3 구현 완료
- 지속적인 업데이트 진행 중

## 🤝 기여

버그 리포트 및 기능 제안은 Issues에서 받습니다.

## 📞 연락처

- GitHub: [@jinxing10292-beep](https://github.com/jinxing10292-beep)
- Issues: [프로젝트 이슈](https://github.com/jinxing10292-beep/1m-acres/issues)

---

**마지막 업데이트**: 2026년 4월 21일
**현재 버전**: 0.3.0 (Phase 3 Complete)
