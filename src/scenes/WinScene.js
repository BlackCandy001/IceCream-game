import Phaser from 'phaser';
import LayoutUtils from '../utils/LayoutUtils';
import UIFX from '../utils/UIFX';

export default class WinScene extends Phaser.Scene {
    constructor() {
        super('WinScene');
    }

    create() {
        const uiBase = { w: 1024, h: 768 };
        const uiMetrics = LayoutUtils.getMetrics(this, uiBase.w, uiBase.h);
        const center = { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2 };

        // 1. NỀN PHỦ MỜ
        let bg = this.add.graphics();
        bg.fillStyle(0x000000, 0.8);
        bg.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

        // 2. TEXT THÔNG BÁO
        this.add.text(center.x, center.y - 100, 'CHÚC MỪNG!', {
            font: `bold ${Math.round(60 * uiMetrics.scale)}px Arial`,
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(center.x, center.y, 'BẠN ĐÃ TRỞ THÀNH ÔNG CHỦ TIỆM KEM GIÀU CÓ!', {
            font: `bold ${Math.round(24 * uiMetrics.scale)}px Arial`,
            fill: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(center.x, center.y + 50, 'TỔNG THU NHẬP: $100', {
            font: `bold ${Math.round(32 * uiMetrics.scale)}px Arial`,
            fill: '#00ff00'
        }).setOrigin(0.5);

        // 3. CÁC NÚT ĐIỀU HƯỚNG (Giai đoạn 5.5)
        const btnGroupY = center.y + 150;
        
        // Nút CHƠI LẠI (Bên trái)
        const restartX = center.x - 120 * uiMetrics.scale;
        let restartBtn = this.add.sprite(restartX, btnGroupY, 'icon_atlas', 'back').setInteractive();
        restartBtn.setScale(0.15 * uiMetrics.scale);
        UIFX.addClickBounce(this, restartBtn);

        this.add.text(restartX, btnGroupY + 60 * uiMetrics.scale, ' ', {
            font: `bold ${Math.round(18 * uiMetrics.scale)}px Arial`,
            fill: '#ffffff'
        }).setOrigin(0.5);

        restartBtn.on('pointerdown', () => {
            this.sound.play('sfx-book');
            this.registry.set('gold', 0);
            this.registry.set('inventory', []);
            this.scene.start('MenuScene');
        });

        // Nút PHẦN THƯỞNG (Bên phải)
        const rewardX = center.x + 120 * uiMetrics.scale;
        let rewardBtn = this.add.sprite(rewardX, btnGroupY, 'icon_atlas', 'reward').setInteractive();
        rewardBtn.setScale(0.25 * uiMetrics.scale); // Icon dải băng nên scale to hơn một chút
        UIFX.addClickBounce(this, rewardBtn);

        this.add.text(rewardX, btnGroupY + 60 * uiMetrics.scale, ' ', {
            font: `bold ${Math.round(18 * uiMetrics.scale)}px Arial`,
            fill: '#ffff00'
        }).setOrigin(0.5);

        rewardBtn.on('pointerdown', () => {
            this.sound.play('sfx-book');
            this.scene.start('VideoScene'); // Chuyển qua màn hình video
        });
    }
}
