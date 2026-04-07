export default class Tooltip {
    /**
     * Gắn chú thích Tooltip cho một đối tượng tương tác
     * @param {Phaser.Scene} scene - Scene hiện tại
     * @param {Phaser.GameObjects.GameObject} gameObject - Vật thể gắn tooltip
     * @param {String} textStr - Chữ muốn hiển thị
     */
    static bind(scene, gameObject, textStr) {
        // Khởi tạo một đối tượng UI dùng chung cho toàn Scene (chỉ tạo 1 lần)
        // Nếu .txt.active == false nghĩa là Scene vừa bị Stop() và khởi động lại, cần cấp lại
        if (!scene.__tooltipUI || !scene.__tooltipUI.txt.active) {
            let bg = scene.add.graphics();
            
            let txt = scene.add.text(0, 0, '', {
                font: 'bold 16px "Courier New", monospace',
                fill: '#ffffff',
                padding: { x: 8, y: 5 }
            });
            
            scene.__tooltipUI = { bg, txt, active: false };
            scene.__tooltipUI.bg.setDepth(999998); // Nổi lên trên cùng
            scene.__tooltipUI.txt.setDepth(999999);
            scene.__tooltipUI.bg.setVisible(false);
            scene.__tooltipUI.txt.setVisible(false);

            // Tự động dọn dẹp khi Scene bị đóng
            scene.events.once('shutdown', () => {
                scene.__tooltipUI = null;
            });
            
            // Chuột di chuyển sẽ lôi khung tooltip chạy theo
            scene.input.on('pointermove', (pointer) => {
                if (scene.__tooltipUI.active) {
                    let gw = scene.__tooltipUI.txt.width;
                    let gh = scene.__tooltipUI.txt.height;
                    
                    let x = pointer.x + 15;
                    let y = pointer.y + 15;
                    
                    // Chống tràn màn hình
                    if (x + gw > scene.cameras.main.width) {
                        x = pointer.x - gw - 5;
                    }
                    if (y + gh > scene.cameras.main.height) {
                        y = pointer.y - gh - 5;
                    }
                    
                    scene.__tooltipUI.txt.setPosition(x, y);
                    
                    // Vẽ lại nền viền đen
                    scene.__tooltipUI.bg.clear();
                    scene.__tooltipUI.bg.fillStyle(0x000000, 0.85); // Nền đen trong mờ
                    scene.__tooltipUI.bg.lineStyle(2, 0xffffff, 1); // Viền trắng
                    scene.__tooltipUI.bg.fillRoundedRect(x, y, gw, gh, 6);
                    scene.__tooltipUI.bg.strokeRoundedRect(x, y, gw, gh, 6);
                }
            });
        }
        
        // Đảm bảo vật thể bắt được sự kiện
        gameObject.setInteractive();
        
        // Khi chuột lướt vào
        gameObject.on('pointerover', () => {
            scene.__tooltipUI.txt.setText(textStr);
            scene.__tooltipUI.bg.setVisible(true);
            scene.__tooltipUI.txt.setVisible(true);
            scene.__tooltipUI.active = true;
        });
        
        // Khi lôi chuột ra
        gameObject.on('pointerout', () => {
            scene.__tooltipUI.bg.setVisible(false);
            scene.__tooltipUI.txt.setVisible(false);
            scene.__tooltipUI.active = false;
        });
        
        // Khi chuyển Scene, đôi lúc con trỏ mắc nghẹt làm hiện mãi -> Tắt khi click
        gameObject.on('pointerdown', () => {
            scene.__tooltipUI.bg.setVisible(false);
            scene.__tooltipUI.txt.setVisible(false);
            scene.__tooltipUI.active = false;
        });
    }
}
