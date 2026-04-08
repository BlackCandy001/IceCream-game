import Phaser from 'phaser';
import LayoutUtils from '../utils/LayoutUtils';
import UIFX from '../utils/UIFX';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        // PHÁT NHẠC NỀN (Giai đoạn 5)
        if (!this.sound.get('bgm-theme')) {
            this.sound.play('bgm-theme', { loop: true, volume: 0.3 });
        }

        const menuBase = { w: 1380, h: 752 };
        const bgPos = LayoutUtils.getPos(this, 0.5, 0.5, menuBase.w, menuBase.h);
        
        let menuBg = this.add.image(bgPos.x, bgPos.y, 'bg_atlas', 'bg_menu');
        menuBg.setScale(bgPos.scale).setDepth(0);

        const uiBase = { w: 1024, h: 768 };
        const uiMetrics = LayoutUtils.getMetrics(this, uiBase.w, uiBase.h);

        // PlayBtn
        const playPos = LayoutUtils.getPos(this, 0.518, 0.404, uiBase.w, uiBase.h);
        let playBtn = this.add.sprite(playPos.x, playPos.y, 'icon_atlas', 'play').setInteractive();
        playBtn.setScale(0.196 * uiMetrics.scale).setDepth(10);
        UIFX.addClickBounce(this, playBtn);
        playBtn.on('pointerdown', () => {
            this.sound.play('sfx-book');
            this.time.delayedCall(200, () => {
                this.scene.start('GameScene');
            });
        });

        // ExitBtn
        const exitPos = LayoutUtils.getPos(this, 0.521, 0.588, uiBase.w, uiBase.h);
        let exitBtn = this.add.sprite(exitPos.x, exitPos.y, 'icon_atlas', 'exit').setInteractive();
        exitBtn.setScale(0.174 * uiMetrics.scale).setDepth(10);
        UIFX.addClickBounce(this, exitBtn);
        exitBtn.on('pointerdown', () => {
            this.time.delayedCall(200, () => {
                // Thử đóng cửa sổ trình duyệt
                window.close();
                // Dự phòng nếu trình duyệt chặn window.close()
                setTimeout(() => {
                    window.location.href = 'about:blank';
                }, 100);
            });
        });

        // --- HỆ THỐNG NGƯỜI ĐI ĐƯỜNG (Giai đoạn 5.5) ---
        // Sử dụng AtlasKey 'char_atlas'
        this.pedestrians = this.add.group();
        
        // Timer sinh nhân vật ngẫu nhiên (Mỗi 3-6 giây cho nhộn nhịp)
        this.pedestrianTimer = this.time.addEvent({
            delay: Phaser.Math.Between(3000, 6000),
            callback: () => {
                this.spawnPedestrian();
                this.pedestrianTimer.reset({
                    delay: Phaser.Math.Between(3000, 6000),
                    callback: this.pedestrianTimer.callback,
                    callbackScope: this
                });
            },
            callbackScope: this,
            loop: true
        });

        // Sinh ngay 1 người đầu tiên
        this.time.delayedCall(500, () => this.spawnPedestrian());

        // Dọn dẹp khi chuyển Scene
        this.events.on('shutdown', () => {
            if (this.pedestrianTimer) this.pedestrianTimer.destroy();
        });

        this.scale.once('resize', () => this.scene.restart());
    }

    spawnPedestrian() {
        // Sử dụng hệ quy chiếu 2816x1536 để đồng bộ với GameScene
        const shopBase = { w: 2816, h: 1536 };
        const metrics = LayoutUtils.getMetrics(this, shopBase.w, shopBase.h);
        
        // 1. CHỌN HƯỚNG ĐI (Random)
        const isLeftToRight = Phaser.Math.Between(0, 1) === 0;
        const startX = isLeftToRight ? -0.2 : 1.2;
        const endX = isLeftToRight ? 1.2 : -0.2;
        const sidewalkY = 0.774; // Tọa độ Y đồng bộ với khách hàng ở GameScene

        const startPos = LayoutUtils.getPos(this, startX, sidewalkY, shopBase.w, shopBase.h);
        const endPos = LayoutUtils.getPos(this, endX, sidewalkY, shopBase.w, shopBase.h);

        // 2. CHỌN NHÂN VẬT (Random char_2, char_3, char_4 từ atlas)
        const charID = Phaser.Utils.Array.GetRandom(['2', '3', '4']);
        const charPrefix = `char_${charID}_`;
        
        let p = this.add.sprite(startPos.x, startPos.y, 'char_atlas', charPrefix + '1');
        // Scale 0.469 đồng bộ với khách hàng ở GameScene
        p.setScale(0.469 * metrics.scale).setDepth(5); 
        p.setFlipX(!isLeftToRight); 

        this.pedestrians.add(p);

        // 3. HOẠT ẢNH ĐI BỘ (Đổi frame mỗi 250ms)
        let walkTimer = this.time.addEvent({
            delay: 250,
            loop: true,
            callback: () => {
                if (!p || !p.active) return;
                const nextFrame = p.frame.name === (charPrefix + '1') ? (charPrefix + '2') : (charPrefix + '1');
                p.setFrame(nextFrame);
            }
        });

        // 4. DI CHUYỂN QUA MÀN HÌNH (Tween) thong thả
        this.tweens.add({
            targets: p,
            x: endPos.x,
            duration: Phaser.Math.Between(10000, 15000),
            ease: 'Linear',
            onComplete: () => {
                walkTimer.destroy();
                p.destroy();
            }
        });
    }
}
