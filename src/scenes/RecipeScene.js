import Phaser from 'phaser';
import LayoutUtils from '../utils/LayoutUtils';
import UIFX from '../utils/UIFX';

export default class RecipeScene extends Phaser.Scene {
    constructor() {
        super('RecipeScene');
    }

    create() {
        const { width, height } = this.cameras.main;
        const uiBase = { w: 1024, h: 768 };
        const metrics = LayoutUtils.getMetrics(this, uiBase.w, uiBase.h);

        // 1. LỚP PHỦ TRONG SUỐT (Giai đoạn 5 - Fix)
        // Giảm alpha xuống 0.3 để vẫn nhìn thấy tiệm kem và khách hàng phía sau
        const bg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.3);
        bg.setInteractive();

        // 2. BẢNG RECIPE
        const panelPos = LayoutUtils.getPos(this, 0.5, 0.5, uiBase.w, uiBase.h);
        // let panel = this.add.sprite(panelPos.x, panelPos.y, 'ui_atlas', 'panel_recipe');
        // panel.setScale(0.35 * metrics.scale).setDepth(100);

        const notiPos = LayoutUtils.getPos(this, 0.5, 0.54, uiBase.w, uiBase.h);
        let noti = this.add.sprite(notiPos.x, notiPos.y, 'ui_atlas', 'noti');
        noti.setScale(0.22 * metrics.scale).setDepth(110);

        // NỘI DUNG HƯỚNG DẪN (Giai đoạn 5.5 - Fix)
        const textPos = LayoutUtils.getPos(this, 0.5, 0.53, uiBase.w, uiBase.h);
        const instructions = 
            "[1]. Đón Khách: Chờ Khách đứng vào ô gọi món.\n" +
            "[2]. Pha Chế: Tương tác Máy Cà Phê hoặc Tủ Kem.\n" +
            "[3]. Đóng Gói: Múc đủ món, bấm Balo để cất.\n" +
            "[4]. Thu Tiền: Click trực tiếp vào Khách để giao.\n" +
            "!! CHÚ Ý: Bán trước 90 giây kẻo khách bỏ đi !";

        this.add.text(textPos.x, textPos.y, instructions, {
            font: `bold ${Math.round(18 * metrics.scale)}px "Courier New", monospace`,
            fill: '#222222',
            align: 'center',
            lineSpacing: 15
        }).setOrigin(0.5).setDepth(120);

        // 3. NÚT QUAY LẠI
        const closePos = LayoutUtils.getPos(this, -0.080, 0.123, uiBase.w, uiBase.h);
        let closeBtn = this.add.sprite(closePos.x, closePos.y, 'icon_atlas', 'back').setInteractive();
        closeBtn.setScale(0.172 * metrics.scale).setDepth(2000); // Tăng depth để không bị panel che khuất
        UIFX.addClickBounce(this, closeBtn);
        closeBtn.on('pointerdown', () => {
             this.scene.stop();
             this.scene.resume('GameScene');
        });

        // --- VÁ LỖI RESIZE ---
        this.scale.once('resize', () => this.scene.restart());
    }
}
