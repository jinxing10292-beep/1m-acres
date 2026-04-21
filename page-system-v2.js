// ============================================
// 페이지 시스템 v2
// ============================================

const PAGE_TYPES = {
    BASE: 'base',           // 거점 페이지
    BASE_INNER: 'base_inner', // 거점 내부 페이지
    LAND: 'land',           // 땅 페이지
    LAND_INNER: 'land_inner' // 땅 내부 페이지
};

class PageManager {
    constructor() {
        this.currentPage = PAGE_TYPES.BASE;
        this.currentBaseId = null;
        this.currentLandX = null;
        this.currentLandY = null;
    }

    goToBase(baseId) {
        this.currentPage = PAGE_TYPES.BASE;
        this.currentBaseId = baseId;
    }

    goToBaseInner(baseId) {
        this.currentPage = PAGE_TYPES.BASE_INNER;
        this.currentBaseId = baseId;
    }

    goToLand() {
        this.currentPage = PAGE_TYPES.LAND;
        this.currentLandX = null;
        this.currentLandY = null;
    }

    goToLandInner(x, y) {
        this.currentPage = PAGE_TYPES.LAND_INNER;
        this.currentLandX = x;
        this.currentLandY = y;
    }

    getCurrentPage() {
        return this.currentPage;
    }

    isBasePage() {
        return this.currentPage === PAGE_TYPES.BASE;
    }

    isBaseInnerPage() {
        return this.currentPage === PAGE_TYPES.BASE_INNER;
    }

    isLandPage() {
        return this.currentPage === PAGE_TYPES.LAND;
    }

    isLandInnerPage() {
        return this.currentPage === PAGE_TYPES.LAND_INNER;
    }
}

/**
 * 페이지 렌더러 v2
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
        this.selectedLand = null;
        this.selectedBuilding = null;

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

            // 그라데이션 효과
            const gradient = this.ctx.createLinearGradient(x, y, x + 32, y + 32);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, y, 32, 32);

            // 테두리
            if (land.owner === 'player') {
                this.ctx.strokeStyle = '#fbbf24';
                this.ctx.lineWidth = 2;
                this.ctx.shadowColor = 'rgba(251, 191, 36, 0.5)';
                this.ctx.shadowBlur = 8;
            } else {
                this.ctx.strokeStyle = '#555';
                this.ctx.lineWidth = 0.5;
                this.ctx.shadowColor = 'transparent';
            }
            this.ctx.strokeRect(x, y, 32, 32);
            this.ctx.shadowColor = 'transparent';

            // 아이콘 및 레벨 표시
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            // 아이콘
            const icon = land.getIcon();
            if (icon) {
                this.ctx.font = '16px Arial';
                this.ctx.fillText(icon, x + 16, y + 12);
            }

            // 레벨
            this.ctx.font = 'bold 8px Arial';
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.fillText(`Lv${land.level}`, x + 16, y + 24);
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

    /**
     * 거점 내부 페이지 렌더링
     */
    renderBaseInnerPage(gameState) {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const base = gameState.baseManager.getPlayerBase();
        if (!base) return;

        const tileSize = 50;
        const startX = (this.canvas.width - tileSize * 10) / 2;
        const startY = (this.canvas.height - tileSize * 10) / 2;

        // 10x10 그리드 렌더링
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const px = startX + x * tileSize;
                const py = startY + y * tileSize;

                // 배경
                this.ctx.fillStyle = '#2a3f5f';
                this.ctx.fillRect(px, py, tileSize, tileSize);

                // 테두리
                this.ctx.strokeStyle = '#0ea5e9';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(px, py, tileSize, tileSize);

                // 건물 렌더링
                const building = base.baseInner.getBuildingAt(x, y);
                if (building) {
                    const colors = {
                        1: '#8b7355',  // 성벽
                        2: '#4a90e2'   // 군영
                    };
                    this.ctx.fillStyle = colors[building.id] || '#555';
                    this.ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);

                    // 그라데이션
                    const grad = this.ctx.createLinearGradient(px, py, px + tileSize, py + tileSize);
                    grad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
                    grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
                    this.ctx.fillStyle = grad;
                    this.ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);

                    // 테두리
                    this.ctx.strokeStyle = '#fbbf24';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);

                    // 아이콘 및 레벨
                    this.ctx.fillStyle = '#fff';
                    this.ctx.font = 'bold 20px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(building.icon, px + tileSize / 2, py + tileSize / 2 - 8);

                    this.ctx.font = 'bold 10px Arial';
                    this.ctx.fillStyle = '#fbbf24';
                    this.ctx.fillText(`Lv${building.level}`, px + tileSize / 2, py + tileSize / 2 + 12);
                }
            }
        }
    }

    /**
     * 땅 내부 페이지 렌더링
     */
    renderLandInnerPage(gameState) {
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const land = gameState.landMap.getLand(this.currentLandX, this.currentLandY);
        if (!land) return;

        const tileSize = 50;
        const startX = (this.canvas.width - tileSize * 10) / 2;
        const startY = (this.canvas.height - tileSize * 10) / 2;

        // 10x10 그리드 렌더링
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                const px = startX + x * tileSize;
                const py = startY + y * tileSize;

                // 배경
                this.ctx.fillStyle = land.getColor();
                this.ctx.fillRect(px, py, tileSize, tileSize);

                // 그라데이션
                const grad = this.ctx.createLinearGradient(px, py, px + tileSize, py + tileSize);
                grad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
                grad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
                this.ctx.fillStyle = grad;
                this.ctx.fillRect(px, py, tileSize, tileSize);

                // 테두리
                this.ctx.strokeStyle = '#0ea5e9';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(px, py, tileSize, tileSize);
            }
        }

        // 땅 정보 표시
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${land.getTypeDisplay()} Lv${land.level}`, 30, 50);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillText(`시간당 생산: ${land.production}`, 30, 80);
        
        this.ctx.fillStyle = land.owner ? '#10b981' : '#ef4444';
        this.ctx.fillText(`소유: ${land.owner === 'player' ? '내 땅' : '중립'}`, 30, 110);
    }

    render(gameState, pageManager) {
        if (pageManager.isLandPage()) {
            this.renderLandPage(gameState);
        } else if (pageManager.isBaseInnerPage()) {
            this.renderBaseInnerPage(gameState);
        } else if (pageManager.isLandInnerPage()) {
            this.renderLandInnerPage(gameState);
        }
    }
}
