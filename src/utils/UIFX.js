export default class UIFX {
    /**
     * Bổ sung hiệu ứng nảy (thu nhỏ rồi to lại) khi click chuột vào item
     * @param {Phaser.Scene} scene 
     * @param {Phaser.GameObjects.GameObject} gameObject 
     * @param {boolean} disableSound Tắt âm pick mặc định nếu bằng true
     */
    static addClickBounce(scene, gameObject, disableSound = false) {
        gameObject.on('pointerdown', () => {
            // Lưu lại scale gốc để không bị lệch sau khi nảy
            if (!gameObject.originalScaleX) {
                gameObject.originalScaleX = gameObject.scaleX;
                gameObject.originalScaleY = gameObject.scaleY;
            }
            
            // Phát âm thanh click chung nếu đã nạp và không bị khóa
            if (!disableSound && scene.sound && scene.cache.audio.exists('sfx-pick')) {
                scene.sound.play('sfx-pick');
            }

            scene.tweens.add({
                targets: gameObject,
                scaleX: gameObject.originalScaleX * 0.85, 
                scaleY: gameObject.originalScaleY * 0.85,
                duration: 80, 
                yoyo: true,
                onComplete: () => {
                    // Đảm bảo tuyệt đối quay về đúng scale gốc sau khi xong
                    if (gameObject.originalScaleX) {
                        gameObject.setScale(gameObject.originalScaleX, gameObject.originalScaleY);
                    }
                }
            });
        });
    }
}
