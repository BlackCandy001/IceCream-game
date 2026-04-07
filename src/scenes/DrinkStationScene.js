import Phaser from 'phaser';
import DebugTool from '../utils/DebugTool';
import Tooltip from '../utils/Tooltip';
import UIFX from '../utils/UIFX';

export default class DrinkStationScene extends Phaser.Scene {
    constructor() {
        super('DrinkStationScene');
    }

    create() {
        DebugTool.init(this);
        // Nền bề mặt
        let surfaceBg = this.add.image(512, 384, 'ui-surface');
        surfaceBg.setScale(Math.max(1024 / surfaceBg.width, 768 / surfaceBg.height));

        // Nút quay lại
        let backBtn = this.add.image(70, 70, 'btn-back').setInteractive();
        backBtn.setScale(0.15); // Tỉ lệ ướm chừng chuẩn xác
        backBtn.setDepth(1000);
        UIFX.addClickBounce(this, backBtn);
        backBtn.on('pointerdown', () => {
            this.time.delayedCall(200, () => {
                this.scene.stop();
                this.scene.resume('GameScene');
            });
        });
        backBtn.on('pointerover', () => backBtn.setTint(0xdddddd));
        backBtn.on('pointerout', () => backBtn.clearTint());
        Tooltip.bind(this, backBtn, "Vùng Sảnh Chính");

        // ---------------------------------------------------------
        // KHU VỰC SẮP XẾP GIAO DIỆN CHUẨN TỌA ĐỘ
        // ---------------------------------------------------------
        // Ban đầu máy không có cốc
        let dMachine = this.add.image(515, 353, 'drink-machine-empty').setInteractive();
        dMachine.setScale(0.41);
        UIFX.addClickBounce(this, dMachine);
        Tooltip.bind(this, dMachine, "Máy Pha Cà Phê");

        let cupStack = this.add.image(169, 434, 'cup-empty').setInteractive();
        cupStack.setScale(0.17);
        UIFX.addClickBounce(this, cupStack);
        Tooltip.bind(this, cupStack, "Lấy cốc rỗng");

        // =========================================================
        // LOGIC LÀM ĐỒ UỐNG (CÀ PHÊ)
        // =========================================================
        
        let currentCupItem = null; // Trạng thái cốc hiện tại nằm trên mâm máy
        let isBrewing = false; // Máy có đang chạy hay không

        // Tọa độ khay đỡ cốc của máy pha cà phê (Canh chỉnh lại cho vừa với vòi)
        const TRAY_X = 515;
        const TRAY_Y = 480; 

        // 1. Nhấn vào chồng cốc rỗng -> Sinh cốc đặt vào máy
        cupStack.on('pointerdown', () => {
            // Chỉ thả cốc vào khi máy đang trống và không pha
            if (!currentCupItem && !isBrewing) {
                // Đổi texture máy thành loại ĐÃ ĐÍNH KÈM CỐC TRONG ẢNH
                dMachine.setTexture('drink-machine-close');
                
                // Mẹo: Vẫn cấp 1 object ảo để vượt qua bài test "Có cốc chưa" của hàm sau
                currentCupItem = { texture: { key: 'cup-empty' }, destroy: () => {} }; 
            }
        });
        
        // Hover cho trực quan
        cupStack.on('pointerover', () => cupStack.setTint(0xcccccc));
        cupStack.on('pointerout', () => cupStack.clearTint());

        // Hover cho trực quan
        dMachine.on('pointerover', () => dMachine.setTint(0xcccccc));
        dMachine.on('pointerout', () => dMachine.clearTint());

        // 2. Nhấn vào thân Máy Chế Cà Phê -> Róttttttt!
        dMachine.on('pointerdown', (pointer) => {
            // Máy chỉ pha khi thỏa mãn: Đang bật + CÓ CỐC RỖNG bên trong
            if (!currentCupItem || currentCupItem.texture.key !== 'cup-empty') {
                if (!isBrewing) {
                    // Cảnh báo nếu quên đặt cốc rỗng
                    let errTxt = this.add.text(pointer.x, pointer.y - 40, 'Bạn chưa đặt cốc rỗng!', { 
                        font: 'bold 22px "Courier New", monospace', fill: '#ff0000', backgroundColor: '#ffffff', padding: {x: 8, y: 5} 
                    }).setOrigin(0.5);
                    errTxt.setDepth(9999);
                    this.tweens.add({
                        targets: errTxt,
                        y: errTxt.y - 60,
                        alpha: 0,
                        duration: 1800,
                        onComplete: () => errTxt.destroy()
                    });
                }
                return;
            }

            if (!isBrewing) {
                isBrewing = true;
                
                // Mở tiếng rót Cà phê
                let pourSound = this.sound.add('sfx-pour');
                pourSound.play();

                // Hiển thị trạng thái máy đang kêu "Rè rè..."
                let brewingText = this.add.text(TRAY_X, TRAY_Y - 80, 'Brewing...', { 
                    font: 'bold 22px "Courier New", monospace', fill: '#5c3a21', backgroundColor: '#ffffff' 
                }).setOrigin(0.5);

                // Lắp bộ hẹn giờ 3 giây (3000ms) để rót xong
                this.time.delayedCall(3000, () => {
                    pourSound.stop(); // Cúp âm thanh khi đầy

                    if (currentCupItem) {
                        currentCupItem.destroy(); // Hủy cốc rỗng (ảo)
                        
                        // Đổi máy pha về trạng thái Xả rỗng cốc
                        dMachine.setTexture('drink-machine-empty');
                        
                        // Đè ảnh cốc đầy lên mâm đúng theo yêu cầu
                        currentCupItem = this.add.image(TRAY_X, TRAY_Y, 'cup-full'); 
                        currentCupItem.setScale(0.17);
                    }
                    brewingText.destroy(); // Tắt dòng chữ
                    isBrewing = false; // Trả lại trạng thái nghỉ cho máy
                });
            }
        });

        // =========================================================
        // BALO - GÓI HÀNG
        // =========================================================
        let balo = this.add.image(850, 600, 'icon-balo').setInteractive();
        balo.setScale(0.15);
        UIFX.addClickBounce(this, balo, true);
        Tooltip.bind(this, balo, "Bỏ vào Hành Trang (Balo)");

        // Hiệu ứng hover Balo
        balo.on('pointerover', () => balo.setTint(0xdddddd));
        balo.on('pointerout', () => balo.clearTint());

        // Đóng gói đồ ăn
        balo.on('pointerdown', () => {
            this.sound.play('sfx-balo'); // Âm thanh mở túi balo
            
            if (currentCupItem && currentCupItem.texture.key === 'cup-full') {
                // Đủ điều kiện lấy Cà Phê
                let inv = this.registry.get('inventory') || [];
                inv.push('cup-full');
                this.registry.set('inventory', inv);
                
                currentCupItem.destroy();
                currentCupItem = null;

                let notifyTxt = this.add.text(balo.x, balo.y - 70, 'Đã cất Cà Phê!', {font:'bold 24px Arial', fill:'#00aa00', backgroundColor:'#ffffff'}).setOrigin(0.5);
                this.tweens.add({ targets: notifyTxt, y: notifyTxt.y - 50, alpha: 0, duration: 1500, onComplete: () => notifyTxt.destroy() });
            } else if (currentCupItem && currentCupItem.texture.key === 'cup-empty') {
                // Báo lỗi: Đồ uống chưa rót
                let notifyTxt = this.add.text(balo.x, balo.y - 70, 'Cốc rỗng!', {font:'bold 24px Arial', fill:'#ff0000', backgroundColor:'#ffffff'}).setOrigin(0.5);
                this.tweens.add({ targets: notifyTxt, y: notifyTxt.y - 50, alpha: 0, duration: 1500, onComplete: () => notifyTxt.destroy() });
            }
        });
    }
}
