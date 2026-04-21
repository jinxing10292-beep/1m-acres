// ============================================
// 페이지 시스템 (거점 vs 땅)
// ============================================

const PAGE_TYPES = {
    BASE: 'base',      // 거점 페이지
    LAND: 'land'       // 땅 페이지
};

class PageManager {
    constructor() {
        this.currentPage = PAGE_TYPES.BASE;
        this.currentBaseId = null;
    }

    /**
     * 거점 페이지로 이동
     */
    goToBase(baseId) {
        this.currentPage = PAGE_TYPES.BASE;
        this.currentBaseId = baseId;
    }

    /**
     * 땅 페이지로 이동
     */
    goToLand() {
        this.currentPage = PAGE_TYPES.LAND;
        this.currentBaseId = null;
    }

    /**
     * 현재 페이지 조회
     */
    getCurrentPage() {
        return this.currentPage;
    }

    /**
     * 현재 거점 ID 조회
     */
    getCurrentBaseId() {
        return this.currentBaseId;
    }

    /**
     * 거점 페이지 여부
     */
    isBasePage() {
        return this.currentPage === PAGE_TYPES.BASE;
    }

    /**
     * 땅 페이지 여부
     */
    isLandPage() {
        return this.currentPage === PAGE_TYPES.LAND;
    }
}

/**
 * 페이지 렌더러
 */
class PageRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.offsetX = 0;
        this.offsetY = 0;
        this.zoom = 1;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        this.setupCanvas();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 180;
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('click', (e) => this.onClick(e));

        window.addEventListener('resize', () => this.setupCanvas());
    }

    onMouseDown(e) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
    }

    onMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;
            this.offsetX += deltaX;
            this.offsetY += deltaY;
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
        }
    }

    onMouseUp(e) {
        this.isDragging = false;
    }

    onWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom *= zoomFactor;
        this.zoom = Math.max(0.5, Math.min(3, this.zoom));
    }

    onClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offsetX) / (32 * this.zoom);
        const y = (e.clientY - rect.top - this.offsetY) / (32 * this.zoom);

        const tileX = Math.floor(x);
        const tileY = Math.floor(y);

        if (tileX >= 0 && tileX < 500 && tileY >= 0 && tileY < 500) {
            console.log(`Clicked: (${tileX}, ${tileY})`);
        }
    }

    /**
     * 거점 페이지 렌더링
     */
    renderBasePage(gameState) {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const base = gameState.baseManager.getPlayerBase();
        if (!base) return;

        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.zoom, this.zoom);

        // 거점 렌더링
        this.renderBase(base);

        // 거점의 병사들 렌더링
        this.renderBaseUnits(base);

        this.ctx.restore();

        // UI 정보 표시
        this.renderBaseInfo(base);
    }

    renderBase(base) {
        const size = 64;
        const x = -size / 2;
        const y = -size / 2;

        // 거점 배경
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(x, y, size, size);

        // 거점 테두리
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, size, size);

        // 거점 이름
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(base.name, 0, 0);

        // 체력 바
        const barWidth = size - 10;
        const barHeight = 4;
        const barX = -barWidth / 2;
        const barY = size / 2 + 5;

        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        const healthPercent = base.hp / base.maxHp;
        this.ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
        this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }

    renderBaseUnits(base) {
        const units = base.getUnits();
        const radius = 100;
        const unitSize = 20;

        units.forEach((unit, index) => {
            const angle = (index / units.length) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            // 병사 원형
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.beginPath();
            this.ctx.arc(x, y, unitSize / 2, 0, Math.PI * 2);
            this.ctx.fill();

            // 병사 테두리
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // 체력 바
            const healthPercent = unit.currentHp / unit.hp;
            this.ctx.fillStyle = healthPercent > 0.5 ? '#22c55e' : '#ef4444';
            this.ctx.fillRect(x - unitSize / 2, y - unitSize / 2 - 5, unitSize * healthPercent, 2);
        });
    }

    renderBaseInfo(base) {
        const info = `
            거점: ${base.name} | Lv${base.level}
            체력: ${base.hp}/${base.maxHp}
            병사: ${base.getUnits().length}명
        `;

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(info, 10, 30);
    }

    /**
     * 땅 페이지 렌더링
     */
    renderLandPage(gameState) {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.zoom, this.zoom);

        // 그리드 렌더링
        this.renderGrid();

        // 땅 렌더링
        this.renderLands(gameState);

        // 거점 렌더링
        this.renderBases(gameState);

        this.ctx.restore();
    }

    renderGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;

        for (let x = 0; x <= 500; x += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * 32, 0);
            this.ctx.lineTo(x * 32, 500 * 32);
            this.ctx.stroke();
        }

        for (let y = 0; y <= 500; y += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * 32);
            this.ctx.lineTo(500 * 32, y * 32);
            this.ctx.stroke();
        }
    }

    renderLands(gameState) {
        const visibleLands = this.getVisibleLands(gameState);

        visibleLands.forEach(land => {
            const x = land.x * 32;
            const y = land.y * 32;

            // 땅 배경색
            this.ctx.fillStyle = land.getColor();
            this.ctx.fillRect(x, y, 32, 32);

            // 테두리
            this.ctx.strokeStyle = land.owner === 'player' ? '#fbbf24' : '#555';
            this.ctx.lineWidth = land.owner === 'player' ? 2 : 0.5;
            this.ctx.strokeRect(x, y, 32, 32);

            // 텍스트 (레벨 및 타입)
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 8px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`Lv${land.level}`, x + 16, y + 16);
        });
    }

    renderBases(gameState) {
        gameState.baseManager.getAllBases().forEach(base => {
            const x = base.x * 32;
            const y = base.y * 32;
            const size = 64;

            this.ctx.fillStyle = base.owner === 'player' ? '#22c55e' : '#dc2626';
            this.ctx.fillRect(x - size / 2, y - size / 2, size, size);

            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x - size / 2, y - size / 2, size, size);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(base.name, x, y);
        });
    }

    getVisibleLands(gameState) {
        const startX = Math.max(0, Math.floor(-this.offsetX / (32 * this.zoom)));
        const startY = Math.max(0, Math.floor(-this.offsetY / (32 * this.zoom)));
        const endX = Math.min(500, Math.ceil((this.canvas.width - this.offsetX) / (32 * this.zoom)));
        const endY = Math.min(500, Math.ceil((this.canvas.height - this.offsetY) / (32 * this.zoom)));

        const visibleLands = [];
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                const land = gameState.landMap.getLand(x, y);
                if (land) {
                    visibleLands.push(land);
                }
            }
        }
        return visibleLands;
    }

    render(gameState, pageManager) {
        if (pageManager.isBasePage()) {
            this.renderBasePage(gameState);
        } else {
            this.renderLandPage(gameState);
        }
    }
}
