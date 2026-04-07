import Phaser from 'phaser';
import DebugTool from '../utils/DebugTool';
import Tooltip from '../utils/Tooltip';
import UIFX from '../utils/UIFX';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        DebugTool.init(this);
        
        // Nền quầy kem chính 
        let bg = this.add.image(512, 384, 'bg-shop');
        bg.setDisplaySize(1024, 768);
        bg.setScrollFactor(0);
        bg.setDepth(0); // Làm nền chính

        // Nút Quay lại (Về Menu)
        let backBtn = this.add.image(70, 70, 'btn-back').setInteractive();
        backBtn.setScale(0.15);
        UIFX.addClickBounce(this, backBtn);
        backBtn.on('pointerdown', () => {
            this.time.delayedCall(200, () => this.scene.start('MenuScene'));
        });
        backBtn.on('pointerover', () => backBtn.setTint(0xdddddd));
        backBtn.on('pointerout', () => backBtn.clearTint());
        Tooltip.bind(this, backBtn, "Rời khỏi Cửa hàng");

        // -------------------------------------------------------------
        // CÁC TRẠM LÀM VIỆC (Hitboxes & Hover events)
        // Đã tinh chỉnh tọa độ chuẩn 100% theo bản mẫu
        // -------------------------------------------------------------

        // 1. Tủ kem (Trạm 2) - Góc dưới bên trái
        let icecreamDrawer = this.add.image(165, 420, 'icecream-drawer').setInteractive();
        icecreamDrawer.setScale(0.20); 
        UIFX.addClickBounce(this, icecreamDrawer);
        
        icecreamDrawer.on('pointerdown', () => {
             this.time.delayedCall(200, () => {
                 this.scene.pause();
                 this.scene.launch('IceCreamStationScene');
             });
        });
        // Hiệu ứng phát sáng khi đưa chuột vào
        icecreamDrawer.on('pointerover', () => icecreamDrawer.setTint(0xdddddd));
        icecreamDrawer.on('pointerout', () => icecreamDrawer.clearTint());
        Tooltip.bind(this, icecreamDrawer, "Vào Tủ Làm Kem");

        // 2. Máy pha đồ uống (Trạm 1) - Trên quầy gỗ bên phải
        let drinkMachine = this.add.image(667, 465, 'drink-machine-front').setInteractive();
        drinkMachine.setScale(0.15); 
        UIFX.addClickBounce(this, drinkMachine);
        
        drinkMachine.on('pointerdown', () => {
             this.time.delayedCall(200, () => {
                 this.scene.pause();
                 this.scene.launch('DrinkStationScene');
             });
        });
        drinkMachine.on('pointerover', () => drinkMachine.setTint(0xdddddd));
        drinkMachine.on('pointerout', () => drinkMachine.clearTint());
        Tooltip.bind(this, drinkMachine, "Vào Quầy Cà Phê");

        // =========================================================
        // HỆ THỐNG KHÁCH HÀNG (CUSTOMER SYSTEM)
        // =========================================================
        this.customers = [];
        // 4 vị trí cho khách xếp hàng (Mở rộng từ 3 lên 4)
        this.standingSpots = [
            { x: 142, y: 600, occupied: false }, // Gần sát tường trái
            { x: 387, y: 600, occupied: false }, // Giữa trái
            { x: 632, y: 600, occupied: false }, // Giữa phải
            { x: 877, y: 600, occupied: false }  // Gần sát vách đứng máy cafe (Phải)
        ];
        
        this.availableTargets = [
            'cup-full',
            // Kem 1 tầng
            'target-mint', 'target-orange', 
            'target-strawberry', 'target-chocolate', 'target-vanilla',
            // Kem 2 tầng
            'target-strawberry-chocolate', 'target-strawberry-vanilla', 'target-chocolate-vanilla', 
            'target-vanilla-mint', 'target-vanilla-strawberry'
        ];
        this.charList = ['char2', 'char3', 'char4'];

        // Khởi tạo Balo và Gold nếu chưa có
        if (!this.registry.has('inventory')) {
            this.registry.set('inventory', []);
        }
        if (!this.registry.has('gold')) {
            this.registry.set('gold', 0);
        }

        // Hiện Quỹ Tiền (Gold) Góc Phải Trên
        let goldUI = this.add.image(921, 41, 'icon-gold').setInteractive();
        goldUI.setScale(0.04); 
        goldUI.setDepth(1000);
        Tooltip.bind(this, goldUI, "Quỹ Tiền");
        
        let goldBg = this.add.graphics();
        goldBg.fillStyle(0xffffff, 0.8);
        goldBg.fillRoundedRect(826, 26, 75, 30, 8);
        goldBg.setDepth(999);

        this.goldText = this.add.text(831, 29, '$ 0', { font: 'bold 20px "Courier New", monospace', fill: '#006600' }).setDepth(1000);

        this.registry.events.on('changedata-gold', (parent, value) => {
            if (this.goldText) this.goldText.setText('$ ' + value);
            // Kiểm tra điều kiện thắng $100
            if (value >= 100) {
                this.time.delayedCall(1000, () => this.showWinScreen());
            }
        });
        this.goldText.setText('$ ' + this.registry.get('gold'));

        // Hiện Balo Góc Phải Dưới
        let baloUI = this.add.image(902, 706, 'icon-balo').setInteractive();
        baloUI.setScale(0.06);
        baloUI.setDepth(1000);
        UIFX.addClickBounce(this, baloUI, true); // True = tắt âm UI cơ bản để dùng âm riêng
        Tooltip.bind(this, baloUI, "Ví Hành Trang (Balo)");
        
        let baloBg = this.add.graphics();
        baloBg.fillStyle(0xffffff, 0.8);
        baloBg.fillRoundedRect(833, 692, 45, 30, 8);
        baloBg.setDepth(999);

        this.baloText = this.add.text(838, 695, 'x 0', { font: 'bold 20px "Courier New", monospace', fill: '#000' }).setDepth(1000);

        // Lắng nghe sự thay đổi của túi đồ (Inventory)
        this.registry.events.on('changedata-inventory', (parent, value) => {
            if (this.baloText) this.baloText.setText('x ' + value.length);
        });

        // Click chơi âm thanh Balo
        baloUI.on('pointerdown', () => {
            this.sound.play('sfx-balo');
        });
        
        // Hiện Sổ Tay Công Thức (Tại quầy)
        let bookUI = this.add.image(573, 241, 'icon-book').setInteractive();
        bookUI.setScale(0.06); 
        bookUI.setDepth(1000);
        UIFX.addClickBounce(this, bookUI, true);
        Tooltip.bind(this, bookUI, "Đọc Sổ Tay Công Thức");
        
        bookUI.on('pointerdown', () => {
            if (bookUI.data && bookUI.data.get('debugName')) return; // Tạm khóa chức năng Pause nếu đang bật kéo thả
            this.sound.play('sfx-book'); // Phát âm thanh giở sách
            this.time.delayedCall(200, () => {
                this.scene.pause(); // Đóng băng mọi sinh hoạt tại Sảnh!
                this.scene.launch('RecipeScene'); // Lột tấm ảnh Recipe đè lên
            });
        });
        
        // Gắn số ban đầu
        this.baloText.setText('x ' + this.registry.get('inventory').length);

        // Vật phẩm trang trí Tiệm Kem (Cố định tọa độ chuẩn theo thiết kế)
        this.add.image(431, 483, 'jar-cone').setScale(0.15).setDepth(1);
        this.add.image(421, 340, 'jar-peanut').setScale(0.20).setDepth(1);
        this.add.image(433, 260, 'jar-sprinkle').setScale(0.20).setDepth(1);
        this.add.image(505, 261, 'jar-cherry').setScale(0.20).setDepth(1);

        // Bộ hẹn giờ sinh khách mới (Thời gian 3s - 7s ngẫu nhiên)
        this.nextSpawn();

        // Cho xuất hiện ngay 1 vị khách đầu tiên sau khi game load 2 giây
        this.time.delayedCall(2000, this.spawnCustomer, [], this);
    }

    nextSpawn() {
        this.time.delayedCall(Phaser.Math.Between(3000, 7000), () => {
            if (this.isWin) return;
            this.spawnCustomer();
            this.nextSpawn();
        });
    }

    // Hàm gọi sinh ra khách hàng mới từ cửa
    spawnCustomer() {
        if (this.customers.length >= 4) return; // Nếu quán ngập 4 khách thì nghỉ nhận thêm
        
        // Tìm 1 ô xếp hàng còn trống
        let emptySpotIdx = this.standingSpots.findIndex(spot => !spot.occupied);
        if (emptySpotIdx === -1) return;
        
        let targetSpot = this.standingSpots[emptySpotIdx];
        targetSpot.occupied = true; // Chiếm chỗ ngay để người sau méo vào
        
        // Random Char và random món
        let randomChar = Phaser.Utils.Array.GetRandom(this.charList); 
        let randomOrder = Phaser.Utils.Array.GetRandom(this.availableTargets);
        
        // Khách đi từ ngoài rìa mép Trái hoặc Phải vào (Giao diện cửa trên ảnh gốc có dải kính bên Trái)
        let startX = 1200;
        let startY = targetSpot.y;
        
        let customer = this.add.sprite(startX, startY, randomChar + '-1').setInteractive();
        customer.setScale(0.23); // Kích thước khách vừa với không gian nhà
        customer.setDepth(100); 
        customer.setFlipX(targetSpot.x < startX); // Lật ảnh tuỳ theo việc đang đi qua Trái hay Phải
        
        UIFX.addClickBounce(this, customer, true);
        Tooltip.bind(this, customer, "Click để Giao Món!");

        // Gắn Data
        customer.mySpot = targetSpot;
        customer.myOrder = randomOrder;
        customer.charType = randomChar;
        this.customers.push(customer);

        // Bỏ spawnTimer delay cập nhật vì ta chỉ trần 1 khách debug
        // if (this.spawnTimer) { ... }

        // Hiệu ứng "Lật bước chân" tạo ảo giác đi bộ
        let walkAnimTimer = this.time.addEvent({
            delay: 200, 
            loop: true,
            callback: () => {
                if (!customer || !customer.active) return; // Fix lỗi Crash khi khách biến mất
                // Nhấp nháy giữa 2 frame img1 và img2
                let nextFrame = customer.texture.key === (randomChar + '-1') ? (randomChar + '-2') : (randomChar + '-1');
                customer.setTexture(nextFrame);
            }
        });

        // Xóa Timer khi dọn Khách Hàng khỏi màn hình để giải phóng bộ nhớ
        customer.on('destroy', () => {
            walkAnimTimer.remove();
        });

        // Tween Di chuyển khách đến vị trí xếp hàng
        this.tweens.add({
            targets: customer,
            x: targetSpot.x,
            duration: 3500, // Đi mất 3.5 giây
            ease: 'Linear',
            onComplete: () => {
                // Giảm tốc độ lật chân vì khách chỉ đang bước nhẹ qua lại chờ đợi
                walkAnimTimer.delay = 500;
                
                // Múi giờ nổ bóng Chat Yêu cầu Món
                this.sound.play('sfx-bubble'); // SFX Bong bóng nổi lên
                customer.bubble = this.add.image(customer.x + 79, customer.y - 210, 'bubble-1');
                customer.bubble.setScale(0.41);
                customer.bubble.setDepth(101);
                
                // Hiện ảnh Món ăn bên trong bóng
                customer.orderIcon = this.add.image(customer.x + 90, customer.y - 209, randomOrder);
                customer.orderIcon.setDepth(102);

                if (randomOrder === 'cup-full') {
                    customer.orderIcon.setScale(0.05);
                    customer.orderOffsetX = 90; // Giữ nguyên cốc coffee
                    customer.orderOffsetY = -214;
                } else {
                    customer.orderIcon.setScale(0.18);
                    customer.orderOffsetX = 83; // Theo số đo mới của người chơi
                    customer.orderOffsetY = -220;
                }

                // Thêm Tween đi dạo qua lại quanh quầy (Cơ chế chống đứng im)
                this.tweens.add({
                    targets: customer,
                    x: targetSpot.x - 120, // Đi qua lại một biên độ lớn hơn (120px) thay vì chỉ 30px
                    duration: 3500, // Thong thả đi bộ trong 3.5s
                    ease: 'Sine.easeInOut',
                    yoyo: true, // Đi tới x xong đi ngược lại chỗ cũ
                    repeat: -1, // Lặp vô hạn
                    onYoyo: () => {
                        // Khi đi đến điểm targetSpot.x - 120 và bắt đầu quay đầu đi ngược lại (Hướng mũi tên sang Phải)
                        if (customer && customer.active) customer.setFlipX(false);
                    },
                    onRepeat: () => {
                        // Khi về đến vạch đích targetSpot.x và bắt đầu sải bước lại vòng lặp (Hướng mũi sang Trái)
                        if (customer && customer.active) customer.setFlipX(true);
                    }
                });

                // ==========================================
                // LÊN ĐỒ ĐỢI KHÁCH
                // ==========================================
                customer.patienceTimer = this.time.addEvent({
                    delay: 90000, // Đợi 1 phút 30 giây
                    callback: () => {
                        // Trễ Order -> Dỗi Bỏ Về
                        customer.bubble.destroy();
                        customer.orderIcon.destroy();
                        targetSpot.occupied = false;
                        
                        let upsetTxt = this.add.text(customer.x - 20, customer.y - 150, 'Quá lâu!', {font:'bold 24px "Courier New", monospace', fill:'red', backgroundColor: '#ffffff', padding: {x: 5, y: 5}});
                        this.tweens.add({ targets: upsetTxt, y: upsetTxt.y - 50, alpha: 0, duration: 2000, onComplete: () => upsetTxt.destroy() });

                        let exitX = 1200; // Quay về cửa
                        customer.setFlipX(exitX < customer.x);

                        // Bật lại máy nhảy hình để đi bộ đi ra
                        let leaveAnim = this.time.addEvent({
                            delay: 200, loop: true,
                            callback: () => {
                                if(!customer.active) return;
                                let nFrame = customer.texture.key === (customer.charType + '-1') ? (customer.charType + '-2') : (customer.charType + '-1');
                                customer.setTexture(nFrame);
                            }
                        });

                        this.tweens.add({
                            targets: customer,
                            x: exitX,
                            duration: 3500,
                            onComplete: () => {
                                leaveAnim.remove();
                                this.customers = this.customers.filter(c => c !== customer);
                                customer.destroy();
                            }
                        });
                    }
                });

                // ==========================================
                // GIAO DỊCH GIAO HÀNG VÀ CƠ CHẾ DẠT RA CHỖ KHÁC
                // ==========================================
                customer.setInteractive();
                
                customer.annoyanceLimit = Phaser.Math.Between(5, 9);
                customer.annoyanceClicks = 0;
                
                customer.on('pointerdown', () => {
                    let inv = this.registry.get('inventory') || [];
                    let idx = inv.indexOf(customer.myOrder);
                   
                    if (idx !== -1) {
                        // TIỀN VÀO TÚI!
                        this.sound.play('sfx-money'); // Tiếng "Leng keng" thu tiền
                        inv.splice(idx, 1); // Rút 1 món khỏi balo
                        this.registry.set('inventory', inv); // Trigger UI text
                        
                        // Cấu tiền
                        let currentGold = this.registry.get('gold');
                        this.registry.set('gold', currentGold + 10);
                       
                        // Dọn dẹp
                        if (customer.patienceTimer) customer.patienceTimer.remove();
                        customer.bubble.destroy();
                        customer.orderIcon.destroy();
                        targetSpot.occupied = false; // Giải phóng Ô đứng
                        this.customers = this.customers.filter(c => c !== customer);
                       
                        let moneyTxt = this.add.text(customer.x - 10, customer.y - 150, '+$10', {font:'bold 34px "Courier New", monospace', fill:'#00ff00', backgroundColor: '#ffffff', stroke: '#005500', strokeThickness: 3});
                        this.tweens.add({ targets: moneyTxt, y: moneyTxt.y-100, alpha: 0, duration: 1500, onComplete: ()=>moneyTxt.destroy()});
                        
                        // Cho khách vui vẻ rời đi thay vì bắt biến mất tức tưởi
                        customer.disableInteractive(); // Không cho ấn spam nữa
                        let exitX = 1200; 
                        customer.setFlipX(exitX < customer.x);

                        // Bật lại máy nhảy chân
                        let happyLeaveAnim = this.time.addEvent({
                            delay: 200, loop: true,
                            callback: () => {
                                if(!customer.active) return;
                                let nFrame = customer.texture.key === (customer.charType + '-1') ? (customer.charType + '-2') : (customer.charType + '-1');
                                customer.setTexture(nFrame);
                            }
                        });

                        this.tweens.add({
                            targets: customer,
                            x: exitX,
                            duration: 3500,
                            onComplete: () => {
                                happyLeaveAnim.remove();
                                customer.destroy();
                            }
                        });
                       
                    } else {
                        this.sound.play('sfx-customer-click'); // Kêu ọt ọt khi bị click
                        customer.annoyanceClicks++;
                        
                        if (customer.annoyanceClicks >= customer.annoyanceLimit) {
                            // Reset limit mới trong trường hợp người chơi click dồn tiếp tục
                            customer.annoyanceClicks = 0;
                            customer.annoyanceLimit = Phaser.Math.Between(5, 9);
                            
                            // Thực hiện lách người chạy chỗ (Đẩy Y xuống dưới mép màn hình 730)
                            // Nếu đang ở 730 thì luân phiên chạy về 600
                            let targetY = customer.y === 600 ? 730 : 600;
                            
                            // Bay hơi thông báo "Đổi chỗ"
                            let shiftTxt = this.add.text(customer.x - 30, customer.y - 120, 'Né ra!', {font:'bold 20px "Courier New", monospace', fill:'#0000ff', backgroundColor:'#ffffff'});
                            this.tweens.add({ targets: shiftTxt, y: shiftTxt.y - 50, alpha: 0, duration: 1000, onComplete: ()=>shiftTxt.destroy()});
                            
                            this.tweens.add({
                                targets: customer,
                                y: targetY,
                                duration: 800,
                                ease: 'Power2'
                            });
                        } else {
                            // SAI MÓN -> Rung người
                            let noTxt = this.add.text(customer.x - 30, customer.y - 250, 'Sai món!', {font:'bold 20px "Courier New", monospace', fill:'red', backgroundColor:'#ffffff'});
                            this.tweens.add({ targets: noTxt, y: noTxt.y-50, alpha: 0, duration: 1000, onComplete: ()=>noTxt.destroy()});
                            this.tweens.add({ targets: customer, x: customer.x + 10, yoyo: true, repeat: 3, duration: 50 });
                        }
                    }
                });
            }
        });
    }

    update() {
        if (this.isWin) return; // Khóa toàn bộ cập nhật khi đã thắng để NPC dừng lại

        // Đồng bộ vị trí bong bóng chat và món ăn luân chuyển theo dao động của khách
        if (this.customers) {
            this.customers.forEach(c => {
                if (c.bubble && c.orderIcon) {
                    c.bubble.x = c.x + 79;
                    c.bubble.y = c.y - 210;
                    if (c.orderOffsetX !== undefined) {
                        c.orderIcon.x = c.x + c.orderOffsetX;
                        c.orderIcon.y = c.y + c.orderOffsetY;
                    } else {
                        c.orderIcon.x = c.x + 90;
                    }
                }
            });
        }
    }

    // ==========================================
    // MÀN HÌNH CHIẾN THẮNG (WIN SCREEN)
    // ==========================================
    showWinScreen() {
        if (this.isWin) return;
        this.isWin = true;

        // Dừng nhạc nền cũ
        let bgm = this.sound.get('bgm-theme');
        if (bgm) bgm.stop();
        
        // Phát nhạc thắng
        this.sound.play('sfx-win');

        // Tạo lớp phủ mờ
        let overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, 1024, 768);
        overlay.setDepth(2000);

        // Chữ Chiến Thắng
        let winTxt = this.add.text(512, 300, 'BẠN ĐÃ THẮNG!', {
            font: 'bold 80px "Courier New", monospace',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 10
        }).setOrigin(0.5).setDepth(2001);

        this.tweens.add({
            targets: winTxt,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Nút QUAY LẠI MENU (Tọa độ giống nút Thoát: 520, 418)
        let menuBtn = this.add.image(520, 418, 'btn-exit').setOrigin(0.5).setDepth(2001).setInteractive();
        menuBtn.setScale(0.14);
        UIFX.addClickBounce(this, menuBtn);
        Tooltip.bind(this, menuBtn, "Quay về Menu chính");
        menuBtn.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Nút NHẬN THƯỞNG (Tọa độ giống nút Play: 520, 290)
        let rewardBtn = this.add.image(520, 290, 'icon-reward').setOrigin(0.5).setDepth(2001).setInteractive();
        rewardBtn.setScale(0.14); 
        UIFX.addClickBounce(this, rewardBtn);
        Tooltip.bind(this, rewardBtn, "Xem Phim Nhận Thưởng!");

        rewardBtn.on('pointerdown', () => {
            this.playRewardVideo();
        });
    }

    playRewardVideo() {
        // Tắt nhạc nền nếu còn
        let bgm = this.sound.get('bgm-theme');
        if (bgm) bgm.stop();
        
        // Chuyển hẳn sang Scene Video để dừng tuyệt đối GameScene
        this.scene.start('VideoScene');
    }
}
