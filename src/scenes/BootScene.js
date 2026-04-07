import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Thêm thanh tiến trình 
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 360, 520, 50);

        let width = this.cameras.main.width;
        let height = this.cameras.main.height;
        let loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'Đang tải...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 370, 500 * value, 30);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // Load Backgrounds
        this.load.image('bg-outside', 'Game item img/Background cửa hàng/Ảnh ngoài cửa hàng.png');
        this.load.image('bg-shop', 'Game item img/Background cửa hàng/quầy làm kem không item.png');
        this.load.image('ui-board', 'Game item img/icon/UI/Bảng.png');
        this.load.image('ui-surface', 'Game item img/icon/UI/Bề mặt.png');
        this.load.image('ui-icecream-panel', 'Game item img/icon/UI/bảng kem.png');
        this.load.image('ui-noti', 'Game item img/icon/UI/noti.png');

        // Load Equipments
        this.load.image('drink-machine-front', 'Game item img/Thiết bị và công cụ làm kem/máy pha đồ uồng đối diện.png');
        this.load.image('drink-machine-close', 'Game item img/Thiết bị và công cụ làm kem/máy pha đồ uống.png');
        this.load.image('drink-machine-empty', 'Game item img/Thiết bị và công cụ làm kem/máy pha cà phê không cốc.png');
        this.load.image('icecream-drawer', 'Game item img/Thiết bị và công cụ làm kem/tủ kem.png');

        // Load Buttons & UI
        this.load.image('btn-play', 'Game item img/icon/Play.png');
        this.load.image('btn-exit', 'Game item img/icon/Thoát.png');
        this.load.image('btn-stop', 'Game item img/icon/Stop.png');
        this.load.image('btn-back', 'Game item img/icon/Quay lại.png');
        this.load.image('icon-balo', 'Game item img/icon/balo.png');
        this.load.image('icon-gold', 'Game item img/icon/Goild.png');
        this.load.image('icon-book', 'Game item img/icon/book.png');

        // Load Toppings (Lọ và Phễu)
        this.load.image('jar-cone', 'Game item img/bánh vụn trang trí/bánh ốc quế.png');
        this.load.image('item-cone', 'Game item img/bánh vụn trang trí/ốc quế đơn.png');
        this.load.image('jar-cherry', 'Game item img/bánh vụn trang trí/anh đào.png');
        this.load.image('jar-sprinkle', 'Game item img/bánh vụn trang trí/cớm.png');
        this.load.image('jar-peanut', 'Game item img/bánh vụn trang trí/đậu phộng.png');

        // Load Lớp Kem Đơn (Ice Cream Bases)
        this.load.image('base-vanilla', 'Game item img/Lớp kem đơn/Vani.png');
        this.load.image('base-strawberry', 'Game item img/Lớp kem đơn/dâu.png');
        this.load.image('base-chocolate', 'Game item img/Lớp kem đơn/socola.png');
        this.load.image('base-mint', 'Game item img/Lớp kem đơn/bạc hà.png');
        this.load.image('base-orange', 'Game item img/Lớp kem đơn/cam.png');

        // Load Cốc Cà Phê
        this.load.image('cup-empty', 'Game item img/Đồ uống/Cốc cà phê rỗng.png');
        this.load.image('cup-full', 'Game item img/Đồ uống/Cốc cà phê đầy.png');

        // Load Nhân vật Khách Hàng (Mỗi khách 2 frame)
        this.load.image('char2-1', 'Game item img/Char/Char 2/img1.png');
        this.load.image('char2-2', 'Game item img/Char/Char 2/img2.png');
        this.load.image('char3-1', 'Game item img/Char/Char 3/img1.png');
        this.load.image('char3-2', 'Game item img/Char/Char 3/img2.png');
        this.load.image('char4-1', 'Game item img/Char/Char 4/img1.png');
        this.load.image('char4-2', 'Game item img/Char/Char 4/img2.png');

        // Load Bóng Chat
        this.load.image('bubble-1', 'Game item img/Char/Bóng chat/Bóng chat 1.png');
        this.load.image('bubble-2', 'Game item img/Char/Bóng chat/Bóng chat 2.png');

        // Load một số icon mẫu món ăn để đưa vào Bóng chat yêu cầu
        // 1 Tầng
        this.load.image('target-mint', 'Game item img/các loại kem/1 tầng/kem ốc quế bạc hà.png');
        this.load.image('target-orange-cherry', 'Game item img/các loại kem/1 tầng/kem ốc quế cam anh đào.png');
        this.load.image('target-orange', 'Game item img/các loại kem/1 tầng/kem ốc quế cam.png');
        this.load.image('target-strawberry', 'Game item img/các loại kem/1 tầng/kem ốc quế dâu.png');
        this.load.image('target-chocolate-peanut', 'Game item img/các loại kem/1 tầng/kem ốc quế socola đậu phộng.png');
        this.load.image('target-chocolate', 'Game item img/các loại kem/1 tầng/kem ốc quế socola.png');
        this.load.image('target-vanilla', 'Game item img/các loại kem/1 tầng/kem ốc quế vani.png');

        // 2 Tầng
        this.load.image('target-strawberry-chocolate', 'Game item img/các loại kem/2 tầng/kem ốc quế dâu socola.png');
        this.load.image('target-strawberry-vanilla', 'Game item img/các loại kem/2 tầng/kem ốc quế dâu vani.png');
        this.load.image('target-chocolate-vanilla', 'Game item img/các loại kem/2 tầng/kem ốc quế socola vani.png');
        this.load.image('target-vanilla-mint', 'Game item img/các loại kem/2 tầng/kem ốc quế vani bạc hà.png');
        this.load.image('target-vanilla-strawberry', 'Game item img/các loại kem/2 tầng/kem ốc quế vani dâu.png');

        // Load Audio (Nhạc nền & SFX)
        this.load.audio('bgm-theme', 'Game sound/theme tiệm kem pixel.mp3');
        this.load.audio('sfx-pour', 'Game sound/Coffee Pouring into a Cup.mp3');
        this.load.audio('sfx-bubble', 'Game sound/bong bóng chat.mp3');
        this.load.audio('sfx-balo', 'Game sound/click balo.mp3');
        this.load.audio('sfx-customer-click', 'Game sound/click cusrumer.mp3');
        this.load.audio('sfx-book', 'Game sound/mở sách.mp3');
        this.load.audio('sfx-pick', 'Game sound/pick.mp3');
        this.load.audio('sfx-scoop', 'Game sound/pop cream.mp3');
        this.load.audio('sfx-place', 'Game sound/đặt kem.mp3');
        this.load.audio('sfx-money', 'Game sound/money.mp3');
        this.load.audio('sfx-win', 'Game sound/win.mp3');

        // Load Icon bổ sung
        this.load.image('icon-reward', 'Game item img/icon/nhận thưởng.png');

        // Load Video (Lưu ý: 33MB có thể gây loading lâu)
        this.load.video('reward-video', 'video/video.mp4');
    }

    create() {
        // Sau khi load xong, chuyển qua Menu
        this.scene.start('MenuScene');
    }
}
