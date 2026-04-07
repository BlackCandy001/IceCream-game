import Phaser from 'phaser';
import DebugTool from '../utils/DebugTool';
import Tooltip from '../utils/Tooltip';
import UIFX from '../utils/UIFX';

export default class IceCreamStationScene extends Phaser.Scene {
    constructor() {
        super('IceCreamStationScene');
    }

    create() {
        DebugTool.init(this);
        // Nền bề mặt
        let surfaceBg = this.add.image(512, 384, 'ui-surface');
        surfaceBg.setScale(Math.max(1024 / surfaceBg.width, 768 / surfaceBg.height));

        // Bảng Menu Kem (Panel)
        let panel = this.add.image(834, 457, 'ui-icecream-panel');
        panel.setScale(0.44);

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
        
        let baseVan = this.add.image(857, 244, 'base-vanilla').setInteractive();
        baseVan.setScale(0.87);
        Tooltip.bind(this, baseVan, "Kem Vị Vani");

        let baseStr = this.add.image(785, 387, 'base-strawberry').setInteractive();
        baseStr.setScale(0.86);
        Tooltip.bind(this, baseStr, "Kem Vị Dâu");

        let baseCho = this.add.image(924, 386, 'base-chocolate').setInteractive();
        baseCho.setScale(0.81);
        Tooltip.bind(this, baseCho, "Kem Vị Socola");

        let baseMin = this.add.image(785, 528, 'base-mint').setInteractive();
        baseMin.setScale(0.89);
        Tooltip.bind(this, baseMin, "Kem Vị Bạc Hà");

        let baseOrg = this.add.image(927, 529, 'base-orange').setInteractive();
        baseOrg.setScale(0.82);
        Tooltip.bind(this, baseOrg, "Kem Vị Cam");

        // Cụm Lọ Topping & Ốc quế
        let jarCone = this.add.image(125, 531, 'jar-cone').setInteractive();
        jarCone.setScale(0.24);
        UIFX.addClickBounce(this, jarCone, true);
        Tooltip.bind(this, jarCone, "Lấy đồ đựng (Ốc Quế)");

        let jarCherry = this.add.image(66, 193, 'jar-cherry').setInteractive();
        jarCherry.setScale(0.51);
        UIFX.addClickBounce(this, jarCherry);
        Tooltip.bind(this, jarCherry, "Trang trí: Anh Đào");

        let jarPeanut = this.add.image(213, 190, 'jar-peanut').setInteractive();
        jarPeanut.setScale(0.51);
        UIFX.addClickBounce(this, jarPeanut);
        Tooltip.bind(this, jarPeanut, "Trang trí: Đậu Phộng");

        let jarSprinkle = this.add.image(341, 185, 'jar-sprinkle').setInteractive();
        jarSprinkle.setScale(0.55);
        UIFX.addClickBounce(this, jarSprinkle);
        Tooltip.bind(this, jarSprinkle, "Trang trí: Cốm Màu");

        // Balo giao hàng (Chứa đồ uống/kem đã hoàn thành)
        let balo = this.add.image(866, 72, 'icon-balo').setInteractive();
        balo.setScale(0.07);
        UIFX.addClickBounce(this, balo, true);
        Tooltip.bind(this, balo, "Bỏ vào Hành Trang (Balo)");
        // =========================================================
        // LOGIC KÉO THẢ & TRỘN KEM (DRAG & DROP)
        // =========================================================
        let scene = this;
        let isDraggingScoop = null;
        let activeCone = null;
        let currentIceCreamStack = []; // Mảng lưu các tầng kem
        const DROP_ZONE_X = 500; // Khay đựng nằm giữa bàn
        const DROP_ZONE_Y = 550;

        // 1. Sinh Ốc Quế Đơn
        jarCone.on('pointerdown', () => {
            // Nếu chưa có ốc quế trên bàn, thì tạo ra
            if (!activeCone) { 
                this.sound.play('sfx-place'); // Kêu "cạch" khi đặt quế lên bàn
                activeCone = this.add.image(DROP_ZONE_X, DROP_ZONE_Y, 'item-cone');
                activeCone.setScale(0.5); // Bạn có thể chỉnh sửa tỉ lệ này nếu ốc quế to quá
                activeCone.setDepth(5);
            }
        });

        // 2. Thiết lập kéo lớp kem
        const setupFlavorDrag = (sourceObj, textureKey) => {
            // Lưu lại kích thước ban đầu khay kem
            if (!sourceObj.originalScaleX) {
                sourceObj.originalScaleX = sourceObj.scaleX;
                sourceObj.originalScaleY = sourceObj.scaleY;
            }

            sourceObj.on('pointerdown', (pointer) => {
                if(!activeCone) {
                    // Báo lỗi bằng chữ nổi lên bốc hơi
                    let errTxt = scene.add.text(pointer.x, pointer.y - 40, 'Bạn chưa lấy que ốc quế!', { 
                        font: 'bold 22px "Courier New", monospace', fill: '#ff0000', backgroundColor: '#ffffff', padding: {x: 8, y: 5} 
                    }).setOrigin(0.5);
                    errTxt.setDepth(9999);
                    scene.tweens.add({
                        targets: errTxt,
                        y: errTxt.y - 60,
                        alpha: 0,
                        duration: 1800,
                        onComplete: () => errTxt.destroy()
                    });
                    return; // Ngăn chặn kéo kem
                }
                
                // Thu nhỏ hình ảnh Của Cả Cái Khay Kem để báo hiệu đang bốc kem đi
                sourceObj.setScale(sourceObj.originalScaleX * 0.85);

                // Sinh ra viên kem "nháp" bám theo chuột
                scene.sound.play('sfx-scoop'); // Âm thanh múc kem!
                isDraggingScoop = scene.add.image(pointer.x, pointer.y, textureKey);
                isDraggingScoop.setScale(sourceObj.originalScaleX); // Viên nháp trên tay giữ nguyên tỉ lệ cũ
                isDraggingScoop.setDepth(100);
                
                // Nhớ lại Khay nào để tí thả chuột trả về như cũ
                isDraggingScoop.sourceObj = sourceObj;
            });
        };

        setupFlavorDrag(baseVan, 'base-vanilla');
        setupFlavorDrag(baseStr, 'base-strawberry');
        setupFlavorDrag(baseCho, 'base-chocolate');
        setupFlavorDrag(baseMin, 'base-mint');
        setupFlavorDrag(baseOrg, 'base-orange');

        // Bám theo chuột
        this.input.on('pointermove', (pointer) => {
            if (isDraggingScoop) {
                isDraggingScoop.x = pointer.x;
                isDraggingScoop.y = pointer.y;
            }
        });

        // Thả chuột
        this.input.on('pointerup', (pointer) => {
            if (isDraggingScoop) {
                // TRẢ LẠI HÌNH ẢNH CŨ CHO KHAY KEM (Phóng to lại)
                if (isDraggingScoop.sourceObj) {
                    isDraggingScoop.sourceObj.setScale(isDraggingScoop.sourceObj.originalScaleX);
                }

                // Tính khoảng cách từ con trỏ tới vỏ ốc quế
                let dist = Phaser.Math.Distance.Between(isDraggingScoop.x, isDraggingScoop.y, DROP_ZONE_X, DROP_ZONE_Y);
                
                // Nếu thả đủ gần (khoảng cách < 150px)
                if (dist < 150 && activeCone) {
                    scene.sound.play('sfx-place'); // Âm thanh thả kem vào vỏ ốc quế!
                    let stackCount = currentIceCreamStack.length;
                    
                    // Tính độ cao đôn lên (Mỗi tầng đôn lên 50px)
                    let newY = DROP_ZONE_Y - 40 - (stackCount * 25);
                    
                    let newScoop = scene.add.image(DROP_ZONE_X, newY, isDraggingScoop.texture.key);
                    newScoop.setScale(isDraggingScoop.scaleX); // Cùng tỉ lệ
                    newScoop.setDepth(10 + stackCount); // Kem mới xếp đè lên kem cũ
                    
                    currentIceCreamStack.push(newScoop);
                }
                
                // Xoá viên kem nháp khỏi chuột
                isDraggingScoop.destroy();
                isDraggingScoop = null;
            }
        });

        // =========================================================
        // BALO - LƯU TRỮ VÀO HÀNH TRANG ĐỂ GIAO KHÁCH
        // =========================================================
        balo.on('pointerdown', () => {
            this.sound.play('sfx-balo'); // Tiếng túi đồ
            if (activeCone && currentIceCreamStack.length > 0) {
                // Ánh xạ file asset thực tế (vd: 'base-vanilla' -> 'vanilla')
                const flavorMap = {
                    'base-vanilla': 'vanilla',
                    'base-strawberry': 'strawberry',
                    'base-chocolate': 'chocolate',
                    'base-mint': 'mint',
                    'base-orange': 'orange'
                    // Lược bỏ topping khỏi map để nó chỉ mang tính chất minh họa!
                };

                // Trích xuất tối đa 2 VỊ KEM CHÍNH (bỏ qua các lớp topping xen kẽ)
                let parts = [];
                for (let i = 0; i < currentIceCreamStack.length; i++) {
                    let key = currentIceCreamStack[i].texture.key;
                    if (flavorMap[key]) {
                        parts.push(flavorMap[key]);
                        if (parts.length === 2) break; // Chỉ tính được tối đa kem 2 tầng
                    }
                }
                
                // Kết nối thành mã Code Order chuẩn (giống như target-...)
                let finalCode = 'target-' + parts.join('-');
                
                // Lưu vào kho Inventory trung tâm (dùng this.registry)
                let inv = this.registry.get('inventory') || [];
                inv.push(finalCode);
                this.registry.set('inventory', inv);

                // Dọn bàn làm việc
                activeCone.destroy();
                activeCone = null;
                currentIceCreamStack.forEach(img => img.destroy());
                currentIceCreamStack = [];

                // Thông báo báo hỷ
                let notifyTxt = this.add.text(balo.x, balo.y - 50, 'Đã cất Kem!', {font:'bold 24px Arial', fill:'#00aa00', backgroundColor:'#ffffff', padding:{x:5,y:5}}).setOrigin(0.5);
                this.tweens.add({ targets: notifyTxt, y: notifyTxt.y - 50, alpha: 0, duration: 1500, onComplete: () => notifyTxt.destroy() });
            } else {
                // Rỗng
                let notifyTxt = this.add.text(balo.x, balo.y - 50, 'Chưa có Kem!', {font:'bold 24px Arial', fill:'#ff0000', backgroundColor:'#ffffff', padding:{x:5,y:5}}).setOrigin(0.5);
                this.tweens.add({ targets: notifyTxt, y: notifyTxt.y - 50, alpha: 0, duration: 1500, onComplete: () => notifyTxt.destroy() });
            }
        });
    }
}
