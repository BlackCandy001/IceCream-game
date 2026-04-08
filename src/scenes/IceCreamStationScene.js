import Phaser from 'phaser';
import LayoutUtils from '../utils/LayoutUtils';
import Tooltip from '../utils/Tooltip';
import UIFX from '../utils/UIFX';

export default class IceCreamStationScene extends Phaser.Scene {
    constructor() {
        super('IceCreamStationScene');
    }

    create() {
        // Hệ quy chiếu ảnh mặt bàn (2760x1504)
        const surfaceBase = { w: 2760, h: 1504 };
        const bgPos = LayoutUtils.getPos(this, 0.5, 0.5, surfaceBase.w, surfaceBase.h);
        // bgPos.scale ≈ 0.3565 tại viewport 984x705

        let surfaceBg = this.add.image(bgPos.x, bgPos.y, 'bg_atlas', 'ui_surface');
        surfaceBg.setScale(bgPos.scale);

        // === PANEL === NX:0.860, NY:0.580, S:0.330 → coeff = 0.330/0.3565 ≈ 0.926
        const panelPos = LayoutUtils.getPos(this, 0.860, 0.580, surfaceBase.w, surfaceBase.h);
        let panel = this.add.sprite(panelPos.x, panelPos.y, 'ui_atlas', 'panel_icecream');
        panel.setScale(0.926 * bgPos.scale);

        // === ĐIỀU HƯỚNG (UI base 1024x768) ===
        // uiMetrics.scale ≈ 0.918 tại viewport 984x705
        const uiBase = { w: 1024, h: 768 };
        const uiMetrics = LayoutUtils.getMetrics(this, uiBase.w, uiBase.h);

        // BackBtn: NX:0.067, NY:0.225, S:0.120 → coeff = 0.120/0.918 ≈ 0.131
        const backPos = LayoutUtils.getPos(this, -0.080, 0.123, uiBase.w, uiBase.h);
        let backBtn = this.add.sprite(backPos.x, backPos.y, 'icon_atlas', 'back').setInteractive();
        backBtn.setScale(0.172 * uiMetrics.scale).setDepth(2000);
        UIFX.addClickBounce(this, backBtn);
        backBtn.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
        });

        const baloPos = LayoutUtils.getPos(this, 0.658, 0.167, uiBase.w, uiBase.h);
        let baloUI = this.add.sprite(baloPos.x, baloPos.y, 'icon_atlas', 'balo').setInteractive();
        baloUI.setScale(0.105 * uiMetrics.scale).setDepth(2000);
        UIFX.addClickBounce(this, baloUI, true);

        // === LỚP KEM ĐƠN (2760x1504 base) ===
        // coeff chung cho kem: S≈0.601 → 0.601/0.3565 ≈ 1.685

        // VanillaLayer: NX:0.862, NY:0.338, S:0.605 → coeff ≈ 1.697
        const vPos = LayoutUtils.getPos(this, 0.862, 0.338, surfaceBase.w, surfaceBase.h);
        let baseVan = this.add.sprite(vPos.x, vPos.y, 'cream_atlas', 'vanilla').setInteractive();
        baseVan.setScale(1.697 * bgPos.scale);

        // StrawberryLayer: NX:0.809, NY:0.541, S:0.625 → coeff = 0.625/0.3565 ≈ 1.753
        const sPos = LayoutUtils.getPos(this, 0.809, 0.541, surfaceBase.w, surfaceBase.h);
        let baseStr = this.add.sprite(sPos.x, sPos.y, 'cream_atlas', 'strawberry').setInteractive();
        baseStr.setScale(1.753 * bgPos.scale);

        // ChocolateLayer: NX:0.915, NY:0.539, S:0.625 → coeff = 0.625/0.3565 ≈ 1.753
        const cPos = LayoutUtils.getPos(this, 0.915, 0.539, surfaceBase.w, surfaceBase.h);
        let baseCho = this.add.sprite(cPos.x, cPos.y, 'cream_atlas', 'chocolate').setInteractive();
        baseCho.setScale(1.753 * bgPos.scale);

        // MintLayer: NX:0.810, NY:0.722, S:0.612 → coeff ≈ 1.717
        const mPos = LayoutUtils.getPos(this, 0.810, 0.722, surfaceBase.w, surfaceBase.h);
        let baseMin = this.add.sprite(mPos.x, mPos.y, 'cream_atlas', 'mint').setInteractive();
        baseMin.setScale(1.717 * bgPos.scale);

        // OrangeLayer: NX:0.915, NY:0.720, S:0.601 → coeff ≈ 1.685
        const oPos = LayoutUtils.getPos(this, 0.915, 0.720, surfaceBase.w, surfaceBase.h);
        let baseOrg = this.add.sprite(oPos.x, oPos.y, 'cream_atlas', 'orange').setInteractive();
        baseOrg.setScale(1.685 * bgPos.scale);

        // === TOPPING (2760x1504 base) ===

        // JarCone: NX:0.160, NY:0.640, S:0.230 → coeff = 0.230/0.3565 ≈ 0.645
        const jarCPos = LayoutUtils.getPos(this, 0.160, 0.640, surfaceBase.w, surfaceBase.h);
        let jarCone = this.add.sprite(jarCPos.x, jarCPos.y, 'vun_atlas', 'cone_stack').setInteractive();
        jarCone.setScale(0.645 * bgPos.scale);

        // JarCherry: NX:0.222, NY:0.267, S:0.378, R:-90 → coeff = 0.378/0.3565 ≈ 1.060
        const jarCHPos = LayoutUtils.getPos(this, 0.222, 0.267, surfaceBase.w, surfaceBase.h);
        let jarCherry = this.add.sprite(jarCHPos.x, jarCHPos.y, 'vun_atlas', 'cherry').setInteractive();
        jarCherry.setScale(1.060 * bgPos.scale).setAngle(-90);

        // JarSprinkle: NX:0.316, NY:0.259, S:0.378, R:-90 → coeff = 1.060
        const jarSPos = LayoutUtils.getPos(this, 0.316, 0.259, surfaceBase.w, surfaceBase.h);
        let jarSpr = this.add.sprite(jarSPos.x, jarSPos.y, 'vun_atlas', 'sprinkle').setInteractive();
        jarSpr.setScale(1.060 * bgPos.scale).setAngle(-90);

        // JarPeanut: NX:0.416, NY:0.262, S:0.378, R:-90 → coeff = 1.060
        const jarPPos = LayoutUtils.getPos(this, 0.416, 0.262, surfaceBase.w, surfaceBase.h);
        let jarPea = this.add.sprite(jarPPos.x, jarPPos.y, 'vun_atlas', 'peanut').setInteractive();
        jarPea.setScale(1.060 * bgPos.scale).setAngle(-90);

        this.scale.once('resize', () => this.scene.restart());

        // =========================================================
        // LOGIC LÀM KEM (Giai đoạn 3)
        // =========================================================
        this.activeCone = null;
        this.currentStack = []; // Lưu trữ các Sprite viên kem đã xếp
        this.isDraggingScoop = null;
        
        // Điểm thả kem (Drop Zone) - NX:0.5, NY:0.65 (base 2760x1504)
        const dropPos = LayoutUtils.getPos(this, 0.5, 0.65, 2760, 1504);
        
        // 1. LẤY ỐC QUẾ
        jarCone.on('pointerdown', () => {
             if (this.activeCone) return;
             this.sound.play('sfx-place');
             this.activeCone = this.add.sprite(dropPos.x, dropPos.y, 'vun_atlas', 'cone_single');
             this.activeCone.setScale(1.2 * bgPos.scale).setDepth(10).setAngle(-90);
        });

        // 2. MÚC KEM & KÉO THẢ
        const flavors = [
            { obj: baseVan, key: 'vanilla' },
            { obj: baseStr, key: 'strawberry' },
            { obj: baseCho, key: 'chocolate' },
            { obj: baseMin, key: 'mint' },
            { obj: baseOrg, key: 'orange' }
        ];

        flavors.forEach(flavor => {
            flavor.obj.on('pointerdown', (pointer) => {
                if (!this.activeCone) {
                    this.showErrorText(pointer.x, pointer.y, 'Bạn chưa lấy ốc quế!');
                    return;
                }
                if (this.currentStack.length >= 5) {
                    this.showErrorText(pointer.x, pointer.y, 'Đã đầy 5 tầng!');
                    return;
                }

                this.sound.play('sfx-scoop');
                this.isDraggingScoop = this.add.sprite(pointer.x, pointer.y, 'cream_atlas', flavor.key);
                this.isDraggingScoop.setScale(2.2 * bgPos.scale).setDepth(200);
                this.isDraggingScoop.flavorKey = flavor.key;
            });
        });

        this.input.on('pointermove', (pointer) => {
            if (this.isDraggingScoop) {
                this.isDraggingScoop.x = pointer.x;
                this.isDraggingScoop.y = pointer.y;
            }
        });

        this.input.on('pointerup', (pointer) => {
            if (this.isDraggingScoop) {
                // XÁC ĐỊNH MỤC TIÊU HÍT (Fix Logic Giai đoạn 3)
                // Nếu chưa có kem: hít vào ốc quế. Nếu đã có kem: hít vào viên kem trên cùng.
                let targetX = dropPos.x;
                let targetY = dropPos.y;
                if (this.currentStack.length > 0) {
                    let topScoop = this.currentStack[this.currentStack.length - 1];
                    targetX = topScoop.x;
                    targetY = topScoop.y;
                }

                let dist = Phaser.Math.Distance.Between(this.isDraggingScoop.x, this.isDraggingScoop.y, targetX, targetY);
                
                // Kiểm tra nếu thả gần mục tiêu (khoảng 150px)
                if (dist < 150 * bgPos.scale && this.activeCone) {
                    this.sound.play('sfx-place');
                    let count = this.currentStack.length;
                    
                    // TINH CHỈNH TỌA ĐỘ CĂN CHỈNH (Fix Giai đoạn 3)
                    // newX: Bù nhẹ 2px để tâm kem khớp tâm ốc quế sau khi xoay -90
                    // newY: Giảm từ 45 xuống 20 để viên kem đầu lún sâu vào miệng ốc tự nhiên hơn
                    let newX = dropPos.x + (2 * bgPos.scale);
                    let newY = dropPos.y - (150 * bgPos.scale) - (count * 50 * bgPos.scale);
                    
                    let scoop = this.add.sprite(newX, newY, 'cream_atlas', this.isDraggingScoop.flavorKey);
                    scoop.setScale(2.2 * bgPos.scale).setDepth(11 + count);
                    scoop.flavorKey = this.isDraggingScoop.flavorKey;
                    
                    this.currentStack.push(scoop);
                }
                
                this.isDraggingScoop.destroy();
                this.isDraggingScoop = null;
            }
        });

        // 3. ĐÓNG GÓI VÀO BALO
        baloUI.on('pointerdown', () => {
            if (this.activeCone && this.currentStack.length > 0) {
                this.sound.play('sfx-balo');
                
                // Chuyển đổi stack kem thành mã món ăn (lấy tối đa 2 tầng vị đầu tiên cho logic giao hàng)
                let parts = [];
                for (let i = 0; i < this.currentStack.length; i++) {
                    parts.push(this.currentStack[i].flavorKey);
                    if (parts.length === 2) break;
                }
                let code = 'target-' + parts.join('-');
                
                // Lưu vào Inventory
                let inv = this.registry.get('inventory') || [];
                inv.push(code);
                this.registry.set('inventory', inv);

                // Dọn bàn
                this.activeCone.destroy();
                this.activeCone = null;
                this.currentStack.forEach(s => s.destroy());
                this.currentStack = [];

                let okTxt = this.add.text(baloUI.x, baloUI.y - 50, 'Đã cất Kem!', {
                    font: 'bold 24px Arial', fill: '#00aa00', backgroundColor: '#ffffff', padding: {x:5, y:5}
                }).setOrigin(0.5);
                this.tweens.add({ targets: okTxt, y: okTxt.y - 50, alpha: 0, duration: 1500, onComplete: () => okTxt.destroy() });
            } else {
                this.showErrorText(baloUI.x, baloUI.y, 'Chống không!');
            }
        });
    }

    showErrorText(x, y, message) {
        let errTxt = this.add.text(x, y - 50, message, {
            font: 'bold 24px Arial', fill: 'red', backgroundColor: '#ffffff', padding: {x:5, y:5}
        }).setOrigin(0.5).setDepth(9000);
        this.tweens.add({ targets: errTxt, y: errTxt.y - 50, alpha: 0, duration: 1500, onComplete: () => errTxt.destroy() });
    }
}
