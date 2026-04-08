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

        this.scale.on('resize', () => {
             this.scene.restart(); 
        });

        // Khi video kết thúc -> Về Menu
        vid.on('complete', () => {
            this.scene.start('MenuScene');
        });
    }
}
