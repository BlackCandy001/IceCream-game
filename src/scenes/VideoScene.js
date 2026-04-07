import Phaser from 'phaser';

export default class VideoScene extends Phaser.Scene {
    constructor() {
        super('VideoScene');
    }

    create() {
        // Tạo lớp nền đen tuyền
        this.add.rectangle(0, 0, 1024, 768, 0x000000).setOrigin(0);

        console.log("Khởi động VideoScene - Đang phát phần thưởng...");

        // Tạo Video
        let vid = this.add.video(512, 384, 'reward-video');
        
        // Ép dãn toàn màn hình khi phát
        vid.on('play', () => {
            vid.setDisplaySize(1024, 768);
        });

        vid.play();

        // Khi video kết thúc -> Về Menu
        vid.on('complete', () => {
            this.scene.start('MenuScene');
        });
    }
}
