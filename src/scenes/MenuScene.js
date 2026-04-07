import Phaser from 'phaser';
import DebugTool from '../utils/DebugTool';
import UIFX from '../utils/UIFX';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        DebugTool.init(this);

        // Khởi chạy Nhạc nền (nếu chưa chạy) để xuyên suốt Game
        let bgm = this.sound.get('bgm-theme');
        if (!bgm || !bgm.isPlaying) {
            this.sound.play('bgm-theme', { loop: true, volume: 0.3 });
        }

        // Ảnh nền ngoài cửa hàng
        let bg = this.add.image(512, 384, 'bg-outside');
        // Cố định kích cỡ ảnh nền quét vừa khít 100% tỷ lệ khung hình game (1024x768) để không bị hở viền đen và không bị thu nhỏ
        bg.setDisplaySize(1024, 768);
        bg.setScrollFactor(0);
        bg.setDepth(0);

        // Nút Play
        let playBtn = this.add.image(520, 290, 'btn-play').setInteractive();
        playBtn.setScale(0.14); // Thu nhỏ nút theo tỷ lệ mới
        playBtn.setDepth(11);
        UIFX.addClickBounce(this, playBtn);

        // Nút Exit (Thay thế Upgrade)
        let exitBtn = this.add.image(520, 418, 'btn-exit').setInteractive();
        exitBtn.setScale(0.14); // Thu nhỏ nút theo tỷ lệ mới
        exitBtn.setDepth(11);
        UIFX.addClickBounce(this, exitBtn);

        // Tiêu đề Game (Đã cố định tọa độ chuẩn theo bản thiết kế)
        let candyTxt = this.add.text(527, 51, "Black Candy", {
            font: 'bold 50px "Courier New", monospace',
            fill: '#ffb3d9', 
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(20).setScale(0.80);

        let chocoIcon = this.add.text(526, 121, "🍫", {
            font: 'bold 50px "Courier New", monospace',
            fill: '#ffffff', 
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(20).setScale(1.00);

        // Event click 
        playBtn.on('pointerdown', () => {
            this.time.delayedCall(200, () => this.scene.start('GameScene'));
        });
        exitBtn.on('pointerdown', () => {
            this.time.delayedCall(200, () => window.close());
        });

        // Hover effect effect nhẹ
        playBtn.on('pointerover', () => { playBtn.setTint(0xcccccc); });
        playBtn.on('pointerout', () => { playBtn.clearTint(); });
        exitBtn.on('pointerover', () => { exitBtn.setTint(0xcccccc); });
        exitBtn.on('pointerout', () => { exitBtn.clearTint(); });

        this.charList = ['char2', 'char3', 'char4']; 
        this.time.delayedCall(500, () => this.spawnPasserby());
    }

    // Hàm gọi sinh ra Khách hàng đi dạo ngoài Menu màn hình
    spawnPasserby() {
        let isLeft = Phaser.Math.Between(0, 1) === 0;
        let startX = isLeft ? -100 : 1100;
        let endX = isLeft ? 1200 : -200;
        let pChar = Phaser.Utils.Array.GetRandom(this.charList);
        
        let passerby = this.add.sprite(startX, 600, pChar + '-1'); 
        passerby.setScale(0.23); 
        passerby.setDepth(1); // Nằm sau Bảng UI Menu (depth 10)
        passerby.setFlipX(!isLeft); 

        // Nháy khung hình bước đi
        let walkTimer = this.time.addEvent({
            delay: 200, loop: true,
            callback: () => {
                if(!passerby.active) return;
                let nFrame = passerby.texture.key === (pChar + '-1') ? (pChar + '-2') : (pChar + '-1');
                passerby.setTexture(nFrame);
            }
        });

        // Đi băng qua đường
        this.tweens.add({
            targets: passerby,
            x: endX,
            duration: Phaser.Math.Between(7000, 11000), 
            onComplete: () => {
                walkTimer.remove();
                passerby.destroy();
            }
        });

        // Gọi người tiếp theo xuất hiện
        this.time.delayedCall(Phaser.Math.Between(4000, 10000), () => this.spawnPasserby());
    }
}
