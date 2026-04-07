import LayoutUtils from './LayoutUtils.js';

export default class DebugTool {
    static isDebugLocked = false;

    /**
     * Khởi tạo bộ công cụ Debug toàn năng trên bất kỳ Scene nào.
     * @param {Phaser.Scene} scene 
     */
    static init(scene) {
        if (scene.__debugInitialized) return;
        scene.__debugInitialized = true;

        // 1. NÚT KHÓA DEBUG (Góc trên phải)
        const lockBtn = scene.add.text(scene.cameras.main.width - 160, 16, '🔓 DEBUG: OFF', {
            font: 'bold 15px Arial',
            fill: '#ffffff',
            backgroundColor: '#c0392b',
            padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(10001).setInteractive();

        lockBtn.on('pointerdown', () => {
            DebugTool.isDebugLocked = !DebugTool.isDebugLocked;
            const on = DebugTool.isDebugLocked;
            lockBtn.setText(on ? '🔒 DEBUG: ON' : '🔓 DEBUG: OFF');
            lockBtn.setBackgroundColor(on ? '#27ae60' : '#c0392b');

            // Hiện/ẩn tất cả debug labels trong scene
            scene.children.each(child => {
                if (child.__isDebugLabel) child.setVisible(on);
            });
        });

        // 2. NÚT COPY ALL
        const copyAllBtn = scene.add.text(scene.cameras.main.width - 160, 52, '📋 COPY ALL', {
            font: 'bold 15px Arial',
            fill: '#ffffff',
            backgroundColor: '#2980b9',
            padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(10001).setInteractive();

        copyAllBtn.on('pointerdown', () => {
            let lines = [];
            scene.children.each(child => {
                if (child.__isDebugLabel && child.__debugOwner) {
                    const obj = child.__debugOwner;
                    const norm = LayoutUtils.getNorm(scene, obj.x, obj.y, obj.data.get('baseW'), obj.data.get('baseH'));
                    lines.push(`${obj.data.get('debugName')}: NX:${norm.nx}, NY:${norm.ny}, S:${obj.scaleX.toFixed(3)}, R:${Math.round(obj.angle)}`);
                }
            });
            navigator.clipboard.writeText(lines.join('\n'));
            copyAllBtn.setBackgroundColor('#8e44ad');
            setTimeout(() => copyAllBtn.setBackgroundColor('#2980b9'), 800);
        });

        // 3. LOGIC KÉO THẢ (DRAG)
        scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (!DebugTool.isDebugLocked) return;
            gameObject.x = dragX;
            gameObject.y = dragY;
            DebugTool.refreshLabel(scene, gameObject);
        });

        // 4. LOGIC ZOOM & XOAY (SCROLL)
        scene.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (!DebugTool.isDebugLocked || gameObjects.length === 0) return;
            let obj = gameObjects[0];
            if (!obj.data || !obj.data.get('debugName')) return;

            if (pointer.event.shiftKey) {
                obj.angle += deltaY > 0 ? -5 : 5;
            } else {
                obj.setScale(Math.max(0.01, obj.scaleX + (deltaY > 0 ? -0.01 : 0.01)));
            }
            DebugTool.refreshLabel(scene, obj);
        });

        // 5. TIÊM HÀM enableDebug
        scene.enableDebug = (obj, name, baseW = 1024, baseH = 768) => {
            scene.input.setDraggable(obj.setInteractive());
            obj.setData('debugName', name);
            obj.setData('baseW', baseW);
            obj.setData('baseH', baseH);

            const label = scene.add.text(obj.x, obj.y - 20, '', {
                font: '10px Courier New', fill: '#ff0000', backgroundColor: 'rgba(255,255,255,0.9)', padding: { x: 3, y: 2 }
            }).setOrigin(0.5, 1).setDepth(10000).setVisible(false).setInteractive();

            label.__isDebugLabel = true;
            label.__debugOwner = obj;
            obj.__debugLabel = label;

            label.on('pointerdown', () => {
                const norm = LayoutUtils.getNorm(scene, obj.x, obj.y, obj.data.get('baseW'), obj.data.get('baseH'));
                const txt = `${name}: NX:${norm.nx}, NY:${norm.ny}, S:${obj.scaleX.toFixed(3)}, R:${Math.round(obj.angle)}`;
                navigator.clipboard.writeText(txt);
                label.setColor('#00cc00');
                label.setText('✓ COPIED!');
                setTimeout(() => {
                    label.setColor('#ff0000');
                    DebugTool.refreshLabel(scene, obj);
                }, 700);
            });

            DebugTool.refreshLabel(scene, obj);
            return obj;
        };
    }

    static refreshLabel(scene, obj) {
        const label = obj.__debugLabel;
        if (!label) return;
        const norm = LayoutUtils.getNorm(scene, obj.x, obj.y, obj.data.get('baseW'), obj.data.get('baseH'));
        label.x = obj.x;
        label.y = obj.y - Math.abs(obj.displayHeight * obj.scaleY) / 2 - 4;
        label.setText(`${obj.data.get('debugName')}\nNX:${norm.nx} NY:${norm.ny}\nS:${obj.scaleX.toFixed(3)} R:${Math.round(obj.angle)}°`);
        label.setVisible(DebugTool.isDebugLocked);
    }
}
