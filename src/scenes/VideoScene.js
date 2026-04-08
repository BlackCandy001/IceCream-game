import Phaser from 'phaser';
import LayoutUtils from '../utils/LayoutUtils';
import UIFX from '../utils/UIFX';

export default class VideoScene extends Phaser.Scene {
    constructor() {
        super('VideoScene');
    }

    create() {
        const metrics = LayoutUtils.getMetrics(this);

        // Tạo lớp nền đen tuyền phủ toàn màn hình
        this.add.rectangle(0, 0, metrics.width, metrics.height, 0x000000).setOrigin(0);

        console.log("Khởi động VideoScene - Đang phát phần thưởng...");

        // Tạo Video - (0.5, 0.5)
        const vPos = LayoutUtils.getPos(this, 0.5, 0.5);
        let vid = this.add.video(vPos.x, vPos.y, 'reward-video');
        
        // Ép dãn theo tỷ lệ an toàn khi phát
        vid.on('play', () => {
            vid.setDisplaySize(1024 * metrics.scale, 768 * metrics.scale);
        });

        vid.play();

        // Thêm nút Quay lại (Back) để skip video
        const uiBase = { w: 1024, h: 768 };
        const uiMetrics = LayoutUtils.getMetrics(this, uiBase.w, uiBase.h);
        
        // Đồng bộ hoàn toàn tọa độ nút Back với các màn hình khác
        const backPos = LayoutUtils.getPos(this, -0.080, 0.123, uiBase.w, uiBase.h);
        let skipBtn = this.add.sprite(backPos.x, backPos.y, 'icon_atlas', 'back').setInteractive();
        skipBtn.setScale(0.172 * uiMetrics.scale).setDepth(200).setVisible(false);

        UIFX.addClickBounce(this, skipBtn);

        const onResize = () => {
             if (this.scene.isActive('VideoScene')) this.scene.restart(); 
        };
        this.scale.on('resize', onResize);

        this.events.on('shutdown', () => {
             this.scale.off('resize', onResize);
        });

        const returnToMenu = () => {
            if (this.isExiting) return;
            this.isExiting = true;
            this.registry.set('gold', 0); // Reset game state here too
            this.registry.set('inventory', []);
            this.scene.start('MenuScene');
        };

        skipBtn.on('pointerdown', () => {
            vid.stop(); // Dừng video ngay
            returnToMenu();
        });

        // Khi video kết thúc -> Về Menu
        vid.on('complete', () => {
            returnToMenu();
        });

        // Đồng hồ đếm 5 giây để đánh thức nút Skip
        this.time.delayedCall(5000, () => {
             if (this.scene.isActive('VideoScene')) {
                  skipBtn.setVisible(true);
             }
        });
    }
}
