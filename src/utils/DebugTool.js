export default class DebugTool {
    /**
     * Khởi tạo bộ công cụ Debug toàn năng trên bất kỳ Scene nào.
     * @param {Phaser.Scene} scene 
     */
    static init(scene) {
        if (scene.__debugInitialized) return;
        scene.__debugInitialized = true;

        // Bắt sự kiện kéo thả chuột
        scene.input.on('drag', function (pointer, gameObject, dragX, dragY) {
            gameObject.x = dragX;
            gameObject.y = dragY;
            if (gameObject.debugText) {
                gameObject.debugText.x = dragX;
                gameObject.debugText.y = dragY - (gameObject.displayHeight / 2 * gameObject.scaleY) - 15;
                gameObject.debugText.setText(gameObject.data.get('debugName') + ' -> X: ' + Math.round(dragX) + ', Y: ' + Math.round(dragY) + ' | Tỉ lệ: ' + gameObject.scaleX.toFixed(2));
            }
        });

        // Bắt sự kiện lăn chuột để phóng to thu nhỏ
        scene.input.on('wheel', function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
            if (gameObjects.length > 0) {
                let obj = gameObjects[0];
                if (!obj.data || !obj.data.get('debugName')) return; // Bộ lọc chỉ zoom các item được ghim
                
                let change = deltaY > 0 ? -0.01 : 0.01; 
                obj.setScale(Math.max(0.01, obj.scaleX + change));
                
                if (obj.debugText) {
                    obj.debugText.y = obj.y - (obj.displayHeight / 2 * obj.scaleY) - 15;
                    obj.debugText.setText(obj.data.get('debugName') + ' -> X: ' + Math.round(obj.x) + ', Y: ' + Math.round(obj.y) + ' | Tỉ lệ: ' + obj.scaleX.toFixed(2));
                }
            }
        });

        // Tiêm hàm Bật/Tắt debug vào scene
        scene.enableDebug = (obj, name) => {
            scene.input.setDraggable(obj.setInteractive()); // Bật kéo thả
            obj.setData('debugName', name);
            
            // Vẽ thẻ tên tọa độ đỏ rực trên đầu
            obj.debugText = scene.add.text(obj.x, obj.y - (obj.displayHeight / 2 * obj.scaleY) - 15, 
                name + ' -> X: ' + Math.round(obj.x) + ', Y: ' + Math.round(obj.y) + ' | Tỉ lệ: ' + obj.scaleX.toFixed(2), 
                { font: '14px Arial', fill: '#ff0000', backgroundColor: '#FFFFFF', padding: { x: 3, y: 3 } }).setOrigin(0.5);
            obj.debugText.setDepth(9999);

            // Bấm vào văn bản đỏ sẽ Copy lẻ đối tượng đó thay vì Copy tất cả
            obj.debugText.setInteractive();
            obj.debugText.on('pointerdown', () => {
                let txt = `${name}: X: ${Math.round(obj.x)}, Y: ${Math.round(obj.y)} | Tỉ lệ: ${obj.scaleX.toFixed(2)}`;
                navigator.clipboard.writeText(txt);
                obj.debugText.setColor('#00ff00');
                setTimeout(() => obj.debugText.setColor('#ff0000'), 500);
            });
            return obj; // Trả về để có thể viết gọn dây chuyền
        };
    }
}
