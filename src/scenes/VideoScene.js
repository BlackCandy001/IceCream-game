import Phaser from 'phaser';
import LayoutUtils from '../utils/LayoutUtils';

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

        const resizeHandle = () => {
             this.scene.restart(); 
        };
        this.scale.on('resize', resizeHandle);

        // NÚT BỎ QUA (Mượn icon.back) - ẨN TRONG 5 GIÂY ĐẦU
        const uiBase = { w: 1024, h: 768 };
        const uiMetrics = LayoutUtils.getMetrics(this, uiBase.w, uiBase.h);
        
        // Đồng bộ hoàn toàn tọa độ nút Back với bản PC
        const backPos = LayoutUtils.getPos(this, 0.069, 0.229, uiBase.w, uiBase.h);
        let skipBtn = this.add.sprite(backPos.x, backPos.y, 'icon_atlas', 'back').setInteractive({ useHandCursor: true });
        skipBtn.setScale(0.131 * uiMetrics.scale).setDepth(200).setVisible(false);

        // HIỂN THỊ NÚT SKIP SAU 5 GIÂY
        this.time.delayedCall(5000, () => {
             if (this.scene.isActive('VideoScene')) {
                 skipBtn.setVisible(true);
             }
        });

        // XỬ LÝ THOÁT
        const returnToMenu = () => {
             // Không gọi vid.stop() đây vì dễ gây lỗi DOM crash khi scene đóng
             this.registry.set('gold', 0);
             this.registry.set('inventory', []);
             this.scale.off('resize', resizeHandle);
             this.scene.start('MenuScene');
        };

        skipBtn.on('pointerdown', () => returnToMenu());
        // Dự phòng: Có nhiều người quen bấm thả nên add thêm pointerup
        skipBtn.on('pointerup', () => returnToMenu());
        vid.on('complete', () => returnToMenu());
    }
}
