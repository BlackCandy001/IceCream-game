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

        // 0. KHUNG CHỈNH MÀN HÌNH BẢO VỆ (BLOCKER)
        // Chặn mọi sự kiện pointerdown xuống Game Logic khi bật Debug
        const blocker = scene.add.rectangle(0, 0, 4000, 4000, 0x000000, 0)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(99998)
            .setInteractive()
            .setVisible(false);

        // 1. NÚT KHÓA DEBUG (Gắn cố định góc Trái-Trên để không biến mất trên mobile)
        const lockBtn = scene.add.text(10, 10, '🔓 DEBUG: OFF', {
            font: 'bold 15px Arial',
            fill: '#ffffff',
            backgroundColor: '#c0392b',
            padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(100001).setInteractive();

        lockBtn.on('pointerdown', () => {
            DebugTool.isDebugLocked = !DebugTool.isDebugLocked;
            const on = DebugTool.isDebugLocked;
            lockBtn.setText(on ? '🔒 DEBUG: ON' : '🔓 DEBUG: OFF');
            lockBtn.setBackgroundColor(on ? '#27ae60' : '#c0392b');

            blocker.setVisible(on);

            // Hiện/ẩn tất cả debug labels trong scene
            scene.children.each(child => {
                if (child.__isDebugLabel) child.setVisible(on);
            });
        });

        // 2. NÚT COPY ALL
        const copyAllBtn = scene.add.text(10, 50, '📋 COPY ALL', {
            font: 'bold 15px Arial',
            fill: '#ffffff',
            backgroundColor: '#2980b9',
            padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(100001).setInteractive();

        copyAllBtn.on('pointerdown', () => {
            let lines = [];
            scene.children.each(child => {
                if (child.__isDebugLabel && child.__debugOwner) {
                    const obj = child.__debugOwner;
                    const norm = LayoutUtils.getNorm(scene, obj.x, obj.y, obj.data.get('baseW'), obj.data.get('baseH'));
                    const metrics = LayoutUtils.getMetrics(scene, obj.data.get('baseW'), obj.data.get('baseH'));
                    const normScale = obj.scaleX / metrics.scale;
                    lines.push(`${obj.data.get('debugName')}: NX:${norm.nx}, NY:${norm.ny}, NS:${normScale.toFixed(3)}, R:${Math.round(obj.angle)}, W:${Math.round(obj.displayWidth)}, H:${Math.round(obj.displayHeight)}`);
                }
            });
            navigator.clipboard.writeText(lines.join('\n'));
            copyAllBtn.setBackgroundColor('#8e44ad');
            setTimeout(() => copyAllBtn.setBackgroundColor('#2980b9'), 800);
        });

        // 2B. NÚT TÌM ITEM (Thay cho phím F9 bị lỗi mất focus)
        const injectBtn = scene.add.text(10, 90, '🔌 CHỌN TẤT CẢ ITEM', {
            font: 'bold 14px Arial',
            fill: '#ffffff',
            backgroundColor: '#e67e22',
            padding: { x: 10, y: 6 }
        }).setScrollFactor(0).setDepth(100001).setInteractive();

        injectBtn.on('pointerdown', () => {
            scene.children.list.forEach(c => {
                // Tự động nhận diện tất cả hình ảnh/sprite để có thể kéo thả
                if ((c.type === 'Sprite' || c.type === 'Image') && !c.__debugLabel && c !== blocker) {
                    let w = 1024, h = 768; // Mặc định là cho UI Icon
                    let key = c.texture ? c.texture.key : '';
                    if (key.includes('machine') || key.includes('char') || key.includes('bg') || key.includes('drink') || key.includes('cream') || key.includes('vun') || key.includes('target')) {
                        if (scene.scene.key === 'DrinkStationScene' || scene.scene.key === 'IceCreamStationScene') {
                            w = 2760; h = 1504; // Kích thước bàn
                        } else {
                            w = 2816; h = 1536; // Kích thước cảnh chính
                        }
                    }
                    scene.enableDebug(c, c.frame ? c.frame.name : key, w, h);
                }
            });
            
            // Xóa hiệu ứng nút sau khi bấm
            injectBtn.setBackgroundColor('#8e44ad');
            setTimeout(() => injectBtn.setBackgroundColor('#e67e22'), 500);

            // Bật nhãn nếu Đang Khóa:
            if (DebugTool.isDebugLocked) {
                scene.children.each(c => { if (c.__isDebugLabel) c.setVisible(true); });
            }
        });

        // 3. LOGIC KÉO THẢ TÙY CHỈNH QUA BLOCKER
        let draggedObj = null;

        blocker.on('pointerdown', (pointer) => {
            if (!DebugTool.isDebugLocked) return;
            
            // Tìm phần tử dưới chuột (bỏ qua bản thân cái blocker)
            let hits = scene.input.hitTestPointer(pointer);
            let target = hits.find(h => h !== blocker && h.data && h.data.get('debugName'));
            
            if (target) {
                draggedObj = target;
            }
        });

        scene.input.on('pointermove', (pointer) => {
            if (draggedObj && DebugTool.isDebugLocked) {
                draggedObj.x = pointer.x;
                draggedObj.y = pointer.y;
                DebugTool.refreshLabel(scene, draggedObj);
            }
        });

        scene.input.on('pointerup', () => {
            draggedObj = null;
        });

        // 4. LOGIC ZOOM & XOAY QUA BLOCKER
        blocker.on('wheel', (pointer, deltaX, deltaY, deltaZ) => {
            if (!DebugTool.isDebugLocked) return;
            
            let hits = scene.input.hitTestPointer(pointer);
            let obj = hits.find(h => h !== blocker && h.data && h.data.get('debugName'));
            if (!obj) return;

            if (pointer.event.shiftKey) {
                obj.angle += deltaY > 0 ? -5 : 5;
            } else {
                obj.setScale(Math.max(0.01, obj.scaleX + (deltaY > 0 ? -0.01 : 0.01)));
            }
            DebugTool.refreshLabel(scene, obj);
        });

        // 5. TIÊM HÀM enableDebug
        scene.enableDebug = (obj, name, baseW = 1024, baseH = 768) => {
            if (!obj.input) obj.setInteractive(); // Cần interactive để hitTest bắt được
            obj.setData('debugName', name);
            obj.setData('baseW', baseW);
            obj.setData('baseH', baseH);

            const label = scene.add.text(obj.x, obj.y - 20, '', {
                font: '10px Courier New', fill: '#ff0000', backgroundColor: 'rgba(255,255,255,0.9)', padding: { x: 3, y: 2 }
            }).setOrigin(0.5, 1).setDepth(100002).setVisible(false).setInteractive();

            label.__isDebugLabel = true;
            label.__debugOwner = obj;
            obj.__debugLabel = label;

            label.on('pointerdown', () => {
                const norm = LayoutUtils.getNorm(scene, obj.x, obj.y, obj.data.get('baseW'), obj.data.get('baseH'));
                const metrics = LayoutUtils.getMetrics(scene, obj.data.get('baseW'), obj.data.get('baseH'));
                const normScale = obj.scaleX / metrics.scale;
                const txt = `${name}: NX:${norm.nx}, NY:${norm.ny}, NS:${normScale.toFixed(3)}, R:${Math.round(obj.angle)}, W:${Math.round(obj.displayWidth)}, H:${Math.round(obj.displayHeight)}`;
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
        const metrics = LayoutUtils.getMetrics(scene, obj.data.get('baseW'), obj.data.get('baseH'));
        const normScale = obj.scaleX / metrics.scale;
        label.x = obj.x;
        label.y = obj.y - Math.abs(obj.displayHeight) / 2 - 4;
        label.setText(`${obj.data.get('debugName')}\nNX:${norm.nx} NY:${norm.ny}\nNS:${normScale.toFixed(3)} R:${Math.round(obj.angle)}°\n${Math.round(obj.displayWidth)}x${Math.round(obj.displayHeight)}`);
        label.setVisible(DebugTool.isDebugLocked);
    }
}
