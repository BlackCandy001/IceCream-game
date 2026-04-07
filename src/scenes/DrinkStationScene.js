import Phaser from 'phaser';
import LayoutUtils from '../utils/LayoutUtils';
import Tooltip from '../utils/Tooltip';
import UIFX from '../utils/UIFX';

export default class DrinkStationScene extends Phaser.Scene {
    constructor() {
        super('DrinkStationScene');
    }

    create() {
        // Hệ quy chiếu ảnh mặt bàn (2760x1504)
        const surfaceBase = { w: 2760, h: 1504 };
        const bgPos = LayoutUtils.getPos(this, 0.5, 0.5, surfaceBase.w, surfaceBase.h);
        // bgPos.scale ≈ 0.3565 tại viewport 984x705

        let surfaceBg = this.add.image(bgPos.x, bgPos.y, 'bg_atlas', 'ui_surface');
        surfaceBg.setScale(bgPos.scale);

        // === ĐIỀU HƯỚNG (UI base 1024x768) ===
        // uiMetrics.scale ≈ 0.918 tại viewport 984x705
        const uiBase = { w: 1024, h: 768 };
        const uiMetrics = LayoutUtils.getMetrics(this, uiBase.w, uiBase.h);

        // BackBtn: NX:0.084, NY:0.220, S:0.135 → coeff = 0.135/0.918 ≈ 0.147
        const backPos = LayoutUtils.getPos(this, 0.084, 0.220, uiBase.w, uiBase.h);
        let backBtn = this.add.sprite(backPos.x, backPos.y, 'icon_atlas', 'back').setInteractive();
        backBtn.setScale(0.147 * uiMetrics.scale).setDepth(2000);
        UIFX.addClickBounce(this, backBtn);
        backBtn.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('GameScene');
        });

        // Balo: NX:0.874, NY:0.679, S:0.096 → coeff = 0.096/0.918 ≈ 0.105
        const baloPos = LayoutUtils.getPos(this, 0.874, 0.679, uiBase.w, uiBase.h);
        let baloUI = this.add.sprite(baloPos.x, baloPos.y, 'icon_atlas', 'balo').setInteractive();
        baloUI.setScale(0.105 * uiMetrics.scale).setDepth(2000);
        UIFX.addClickBounce(this, baloUI, true);

        // === MÁY PHA & HỨ (2760x1504 base) ===

        // CoffeeMachine: NX:0.520, NY:0.480, S:0.281, R:-90 → coeff = 0.281/0.3565 ≈ 0.788
        const dMachinePos = LayoutUtils.getPos(this, 0.520, 0.480, surfaceBase.w, surfaceBase.h);
        let dMachine = this.add.sprite(dMachinePos.x, dMachinePos.y, 'machine_atlas', 'machine_coffee_empty').setInteractive();
        dMachine.setScale(0.788 * bgPos.scale).setAngle(-90);
        UIFX.addClickBounce(this, dMachine);

        // CupStack: NX:0.132, NY:0.587, S:0.119 → coeff = 0.119/0.3565 ≈ 0.334
        const cupSPos = LayoutUtils.getPos(this, 0.132, 0.587, surfaceBase.w, surfaceBase.h);
        let cupStack = this.add.sprite(cupSPos.x, cupSPos.y, 'drink_atlas', 'cup_empty').setInteractive();
        cupStack.setScale(0.334 * bgPos.scale);
        UIFX.addClickBounce(this, cupStack);

        // =========================================================
        // LOGIC PHA ĐỒ UỐNG (Giai đoạn 4)
        // =========================================================
        this.activeCup = null;
        this.isBrewing = false;

        // Điểm đặt cốc (CUP_SPOT) - NX:0.525, NY:0.62 (base 2760x1504)
        const cupPos = LayoutUtils.getPos(this, 0.500, 0.62, 2760, 1504);

        // 1. LẤY CỐC RỖNG
        cupStack.on('pointerdown', () => {
            if (this.activeCup) return;
            this.sound.play('sfx-pick');
            this.activeCup = this.add.sprite(cupPos.x, cupPos.y, 'drink_atlas', 'cup_empty');
            this.activeCup.setScale(0.334 * bgPos.scale).setDepth(15);
            this.activeCup.isFull = false;
        });

        // 2. VẬN HÀNH MÁY PHA
        dMachine.on('pointerdown', () => {
            if (this.activeCup && !this.activeCup.isFull && !this.isBrewing) {
                this.isBrewing = true;
                this.sound.play('sfx-pour');
                
                let brewTxt = this.add.text(dMachine.x, dMachine.y - 120, 'Đang pha...', {
                    font: 'bold 24px Arial', fill: '#ffffff', backgroundColor: '#804000', padding: {x:5, y:5}
                }).setOrigin(0.5).setDepth(2100);

                // Rung máy nhẹ khi đang pha
                this.tweens.add({ targets: dMachine, x: dMachine.x + 2, yoyo: true, repeat: 15, duration: 100 });

                this.time.delayedCall(3000, () => {
                    if (this.activeCup) {
                        this.activeCup.setFrame('cup_full');
                        this.activeCup.isFull = true;
                        brewTxt.setText('Xong!');
                        this.time.delayedCall(1000, () => brewTxt.destroy());
                    }
                    this.isBrewing = false;
                });
            } else if (!this.activeCup) {
                 this.showErrorText(dMachine.x, dMachine.y, 'Chưa có cốc!');
            }
        });

        // 3. ĐÓNG GÓI VÀO BALO
        baloUI.on('pointerdown', () => {
            if (this.activeCup && this.activeCup.isFull) {
                this.sound.play('sfx-balo');
                
                // Lưu vào Inventory
                let inv = this.registry.get('inventory') || [];
                inv.push('cup-full');
                this.registry.set('inventory', inv);

                // Xóa cốc
                this.activeCup.destroy();
                this.activeCup = null;

                let okTxt = this.add.text(baloUI.x, baloUI.y - 50, 'Đã cất!', {
                    font: 'bold 24px Arial', fill: '#00aa00', backgroundColor: '#ffffff', padding: {x:5, y:5}
                }).setOrigin(0.5).setDepth(2100);
                this.tweens.add({ targets: okTxt, y: okTxt.y - 50, alpha: 0, duration: 1500, onComplete: () => okTxt.destroy() });
            } else {
                this.showErrorText(baloUI.x, baloUI.y, 'Cốc chưa đầy!');
            }
        });

        this.scale.once('resize', () => this.scene.restart());
    }

    showErrorText(x, y, message) {
        let errTxt = this.add.text(x, y - 50, message, {
            font: 'bold 24px Arial', fill: 'red', backgroundColor: '#ffffff', padding: {x:5, y:5}
        }).setOrigin(0.5).setDepth(9000);
        this.tweens.add({ targets: errTxt, y: errTxt.y - 50, alpha: 0, duration: 1500, onComplete: () => errTxt.destroy() });
    }
}
