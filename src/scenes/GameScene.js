import Phaser from 'phaser';
import LayoutUtils from '../utils/LayoutUtils';
import Tooltip from '../utils/Tooltip';
import UIFX from '../utils/UIFX';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // 1. NỀN TIỆM KEM (Sử dụng chuẩn 2816x1536 từ Atlas)
        const shopBase = { w: 2816, h: 1536 };
        const shopBgPos = LayoutUtils.getPos(this, 0.5, 0.5, shopBase.w, shopBase.h);
        
        let shopBg = this.add.image(shopBgPos.x, shopBgPos.y, 'bg_atlas', 'bg_shop');
        shopBg.setScale(shopBgPos.scale).setDepth(0);

        // 2. CÁC TRẠM LÀM VIỆC (Hệ quy chiếu 2816px)
        const icePos = LayoutUtils.getPos(this, 0.17, 0.52, shopBase.w, shopBase.h);
        let icecreamDrawer = this.add.sprite(icePos.x, icePos.y, 'machine_atlas', 'machine_icecream').setInteractive();
        icecreamDrawer.setScale(0.58 * shopBgPos.scale).setDepth(20); 
        UIFX.addClickBounce(this, icecreamDrawer);
        Tooltip.bind(this, icecreamDrawer, "Làm Kem");
        icecreamDrawer.on('pointerdown', () => this.enterStation('IceCreamStationScene'));

        const drinkPos = LayoutUtils.getPos(this, 0.66, 0.56, shopBase.w, shopBase.h);
        let drinkMachine = this.add.sprite(drinkPos.x, drinkPos.y, 'machine_atlas', 'machine_drink_front').setInteractive();
        drinkMachine.setScale(0.39 * shopBgPos.scale).setDepth(20);
        UIFX.addClickBounce(this, drinkMachine);
        Tooltip.bind(this, drinkMachine, "Pha Nước");
        drinkMachine.on('pointerdown', () => this.enterStation('DrinkStationScene'));

        // 3. UI ICONS (Hệ quy chiếu 1024px)
        const uiBase = { w: 1024, h: 768 };
        const uiMetrics = LayoutUtils.getMetrics(this, uiBase.w, uiBase.h);

        const backPos = LayoutUtils.getPos(this, 0.069, 0.229, uiBase.w, uiBase.h);
        let backBtn = this.add.sprite(backPos.x, backPos.y, 'icon_atlas', 'back').setInteractive();
        backBtn.setScale(0.131 * uiMetrics.scale).setDepth(2000);
        UIFX.addClickBounce(this, backBtn);
        Tooltip.bind(this, backBtn, "Về Menu");
        backBtn.on('pointerdown', () => this.scene.start('MenuScene'));

        const goldPos = LayoutUtils.getPos(this, 0.91, 0.21, uiBase.w, uiBase.h);
        let goldUI = this.add.sprite(goldPos.x, goldPos.y, 'icon_atlas', 'gold').setInteractive();
        goldUI.setScale(0.04 * uiMetrics.scale).setDepth(2000);
        Tooltip.bind(this, goldUI, "Tiền Thu Nhập");

        const baloPos = LayoutUtils.getPos(this, 0.92, 0.80, uiBase.w, uiBase.h);
        let baloUI = this.add.sprite(baloPos.x, baloPos.y, 'icon_atlas', 'balo').setInteractive();
        baloUI.setScale(0.06 * uiMetrics.scale).setDepth(2000);
        Tooltip.bind(this, baloUI, "Kho Đồ");

        const bookPos = LayoutUtils.getPos(this, 0.57, 0.36, uiBase.w, uiBase.h);
        let bookUI = this.add.sprite(bookPos.x, bookPos.y, 'icon_atlas', 'book').setInteractive();
        bookUI.setScale(0.05 * uiMetrics.scale).setDepth(2000);
        UIFX.addClickBounce(this, bookUI);
        Tooltip.bind(this, bookUI, "Sách Công Thức");
        bookUI.on('pointerdown', () => this.enterStation('RecipeScene'));

        // 4. TEXT HIỂN THỊ TRẠNG THÁI (Giai đoạn 1)
        // Gold Text: NX:0.83, NY:0.21 (Bên trái cục Gold)
        const gTextPos = LayoutUtils.getPos(this, 0.81, 0.21, uiBase.w, uiBase.h);
        this.goldText = this.add.text(gTextPos.x, gTextPos.y, `$ ${this.registry.get('gold')}`, {
            font: `bold ${Math.round(20 * uiMetrics.scale)}px Arial`,
            fill: '#006600',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(2000);

        // Balo Text: NX:0.83, NY:0.80 (Bên trái cục Balo)
        const bTextPos = LayoutUtils.getPos(this, 0.83, 0.80, uiBase.w, uiBase.h);
        this.baloText = this.add.text(bTextPos.x, bTextPos.y, `x ${this.registry.get('inventory').length}`, {
            font: `bold ${Math.round(20 * uiMetrics.scale)}px Arial`,
            fill: '#333333',
            backgroundColor: 'rgba(255,255,255,0.7)',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(2000);

        // Lắng nghe thay đổi Registry
        this.registry.events.on('changedata-gold', (parent, value) => {
            if (this.goldText) this.goldText.setText(`$ ${value}`);
        });
        this.registry.events.on('changedata-inventory', (parent, value) => {
            if (this.baloText) this.baloText.setText(`x ${value.length}`);
        });

        this.uiGroup = [backBtn, goldUI, baloUI, bookUI, icecreamDrawer, drinkMachine, this.goldText, this.baloText];

        this.scale.once('resize', () => {
            if (this.scene.isActive('IceCreamStationScene')) this.scene.stop('IceCreamStationScene');
            if (this.scene.isActive('DrinkStationScene')) this.scene.stop('DrinkStationScene');
            if (this.scene.isActive('RecipeScene')) this.scene.stop('RecipeScene');
            this.scene.restart();
        });

        this.customers = [];
        // Available Orders mapping (Phù hợp với inventory code và atlas frame)
        this.availableOrders = [
            { code: 'cup-full', atlas: 'drink_atlas', frame: 'cup_full', type: 'drink' },
            // 1 tầng
            { code: 'target-mint', atlas: 'target_1_atlas', frame: 'cone_mint', type: 'icecream' },
            { code: 'target-orange', atlas: 'target_1_atlas', frame: 'cone_orange', type: 'icecream' },
            { code: 'target-strawberry', atlas: 'target_1_atlas', frame: 'cone_strawberry', type: 'icecream' },
            { code: 'target-chocolate', atlas: 'target_1_atlas', frame: 'cone_chocolate', type: 'icecream' },
            { code: 'target-vanilla', atlas: 'target_1_atlas', frame: 'cone_vanilla', type: 'icecream' },
            // 2 tầng
            { code: 'target-strawberry-chocolate', atlas: 'target_2_atlas', frame: 'kem ốc quế dâu socola.png', type: 'icecream' },
            { code: 'target-strawberry-vanilla', atlas: 'target_2_atlas', frame: 'kem ốc quế dâu vani.png', type: 'icecream' },
            { code: 'target-chocolate-vanilla', atlas: 'target_2_atlas', frame: 'kem ốc quế socola vani.png', type: 'icecream' },
            { code: 'target-vanilla-mint', atlas: 'target_2_atlas', frame: 'kem ốc quế vani bạc hà.png', type: 'icecream' },
            { code: 'target-vanilla-strawberry', atlas: 'target_2_atlas', frame: 'kem ốc quế vani dâu.png', type: 'icecream' }
        ];

        // Customer spots: NX:0.158 -> 0.880, NY ~0.77 (base 2816x1536)
        this.standingSpots = [
            { x: LayoutUtils.getPos(this, 0.158, 0.774, 2816, 1536).x, y: LayoutUtils.getPos(this, 0.158, 0.774, 2816, 1536).y, occupied: false },
            { x: LayoutUtils.getPos(this, 0.401, 0.768, 2816, 1536).x, y: LayoutUtils.getPos(this, 0.401, 0.768, 2816, 1536).y, occupied: false },
            { x: LayoutUtils.getPos(this, 0.640, 0.765, 2816, 1536).x, y: LayoutUtils.getPos(this, 0.640, 0.765, 2816, 1536).y, occupied: false },
            { x: LayoutUtils.getPos(this, 0.880, 0.762, 2816, 1536).x, y: LayoutUtils.getPos(this, 0.880, 0.762, 2816, 1536).y, occupied: false }
        ];

        // Spawn timer giống bản cũ (3s - 7s)
        this.spawnTimer = this.time.addEvent({
            delay: Phaser.Math.Between(3000, 7000),
            callback: () => {
                this.spawnCustomer();
                this.spawnTimer.delay = Phaser.Math.Between(3000, 7000);
            },
            loop: true
        });

        this.events.on('resume', () => {
             this.uiGroup.forEach(item => item.setVisible(true));
             this.customers.forEach(c => {
                 c.setVisible(true);
                 if (c.bubbleContainer) c.bubbleContainer.setVisible(true);
             });
        });
    }

    enterStation(sceneKey) {
        // Đợi 150ms để hiệu ứng nảy (Click Bounce) kịp hiển thị trước khi chuyển cảnh
        this.time.delayedCall(150, () => {
            // Chỉ ẩn UI icons (Gold, Balo, v.v.) khi vào trạm làm việc
            if (sceneKey !== 'RecipeScene') {
                this.uiGroup.forEach(item => item.setVisible(false));
                this.customers.forEach(c => {
                    if (c.bubbleContainer) c.bubbleContainer.setVisible(false);
                });
            }
            
            this.scene.pause();
            this.scene.launch(sceneKey);
        });
    }

    spawnCustomer() {
        if (this.customers.length >= 4) return;
        let spot = this.standingSpots.find(s => !s.occupied);
        if (!spot) return;

        spot.occupied = true;
        const shopBase = { w: 2816, h: 1536 };
        const shopPos = LayoutUtils.getPos(this, 0.5, 0.5, shopBase.w, shopBase.h);
        
        let charNum = Phaser.Math.Between(2, 4);
        let randomOrder = Phaser.Utils.Array.GetRandom(this.availableOrders);

        // Sinh khách hàng ở ngoài mép màn hình
        let startX = this.cameras.main.width + 200;
        let customer = this.add.sprite(startX, spot.y, 'char_atlas', `char_${charNum}_1`);
        customer.setScale(0.469 * shopPos.scale).setDepth(30).setInteractive();
        customer.setFlipX(spot.x < startX);
        
        UIFX.addClickBounce(this, customer, true);
        Tooltip.bind(this, customer, "Click để Giao Món!");

        customer.setData('spot', spot);
        customer.setData('order', randomOrder);
        customer.setData('charNum', charNum);
        this.customers.push(customer);

        // Hiệu ứng bước chân (Walk animation)
        let walkTimer = this.time.addEvent({
            delay: 200,
            loop: true,
            callback: () => {
                if (!customer.active) return;
                let currentFrame = customer.frame.name;
                let nextFrame = currentFrame.endsWith('_1') ? `char_${charNum}_2` : `char_${charNum}_1`;
                customer.setFrame(nextFrame);
            }
        });

        // Tween di chuyển vào chỗ đứng
        this.tweens.add({
            targets: customer,
            x: spot.x,
            duration: 3500,
            onComplete: () => {
                walkTimer.delay = 500; // Đi chậm lại khi đã đứng vào chỗ
                this.sound.play('sfx-bubble');

                // Tạo Container chứa cả Bong bóng và Icon (Giai đoạn 2 - Fix)
                const offsetX = 280 * shopPos.scale;
                const offsetY = 420 * shopPos.scale;
                
                let bubbleContainer = this.add.container(customer.x + offsetX, customer.y - offsetY);
                bubbleContainer.setDepth(35).setAngle(-95);
                
                // Nền bong bóng (Tâm là 0,0 trong container)
                let bubble = this.add.sprite(0, 0, 'char_atlas', 'bubble_1');
                bubble.setScale(0.902 * shopPos.scale).setOrigin(0.5, 1);
                
                // Icon món ăn (Vị trí tương đối so với bong bóng)
                // Do Container xoay -95 độ, chúng ta cần xoay ngược lại hoặc căn chỉnh tọa độ cục bộ
                let orderIcon = this.add.sprite(15 * shopPos.scale, -100 * shopPos.scale, randomOrder.atlas, randomOrder.frame);
                orderIcon.setScale(randomOrder.type === 'drink' ? 0.09 * shopPos.scale : 0.4 * shopPos.scale);
                // Xoay ngược lại 95 độ để icon luôn đứng thẳng trong bong bóng đang bị nghiêng
                orderIcon.setAngle(95); 

                bubbleContainer.add([bubble, orderIcon]);
                customer.bubbleContainer = bubbleContainer;

                // Bộ đếm thời gian kiên nhẫn (90s)
                customer.patienceTimer = this.time.delayedCall(90000, () => {
                    this.leaveCustomer(customer, 'Quá lâu!', 'red');
                });

                // Logic Giao hàng
                customer.on('pointerdown', () => {
                    let inv = this.registry.get('inventory') || [];
                    let idx = inv.indexOf(randomOrder.code);

                    if (idx !== -1) {
                        // Giao món thành công
                        this.sound.play('sfx-money');
                        inv.splice(idx, 1);
                        this.registry.set('inventory', inv);

                        let currentGold = this.registry.get('gold');
                        this.registry.set('gold', currentGold + 10);

                        // KIỂM TRA ĐIỀU KIỆN THẮNG (Giai đoạn 5)
                        if (this.registry.get('gold') >= 100) {
                             this.time.delayedCall(2000, () => {
                                 this.spawnTimer.remove();
                                 this.sound.play('sfx-win');
                                 this.scene.start('WinScene');
                             });
                        }

                        this.leaveCustomer(customer, '+$10', '#00ff00');
                    } else {
                        // Sai món
                        this.sound.play('sfx-customer-click');
                        let noTxt = this.add.text(customer.x, customer.y - 150, 'Sai món!', {
                            font: 'bold 24px Arial', fill: 'red', backgroundColor: '#ffffff', padding: {x:5, y:5}
                        }).setOrigin(0.5).setDepth(100);
                        this.tweens.add({ targets: noTxt, y: noTxt.y - 50, alpha: 0, duration: 1000, onComplete: () => noTxt.destroy() });
                        this.tweens.add({ targets: customer, x: customer.x + 10, yoyo: true, repeat: 3, duration: 50 });
                    }
                });
            }
        });
    }

    leaveCustomer(customer, message, color) {
        if (!customer.active) return;
        if (customer.patienceTimer) customer.patienceTimer.remove();
        if (customer.bubbleContainer) customer.bubbleContainer.destroy();

        let spot = customer.getData('spot');
        spot.occupied = false;
        customer.disableInteractive();

        // Hiển thị thông báo (Tiền hoặc Dỗi)
        let msgTxt = this.add.text(customer.x, customer.y - 150, message, {
            font: 'bold 28px Arial', fill: color, backgroundColor: '#ffffff', padding: {x:5, y:5}
        }).setOrigin(0.5).setDepth(100);
        this.tweens.add({ targets: msgTxt, y: msgTxt.y - 100, alpha: 0, duration: 2000, onComplete: () => msgTxt.destroy() });

        // Rời đi
        let exitX = this.cameras.main.width + 200;
        customer.setFlipX(exitX < customer.x);
        this.tweens.add({
            targets: customer,
            x: exitX,
            duration: 3500,
            onComplete: () => {
                this.customers = this.customers.filter(c => c !== customer);
                customer.destroy();
            }
        });
    }

    update() {
        // Đồng bộ vị trí bong bóng nếu khách đang di chuyển (dạo qua lại chẳng hạn)
        // Hiện tại khách chỉ đứng yên nên không cần update liên tục
    }
}
