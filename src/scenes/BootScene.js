import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        const { width, height } = this.cameras.main;
        
        // --- THANH TIẾN TRÌNH ---
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width/2 - 260, height/2 - 25, 520, 50);

        let loadingText = this.add.text(width/2, height/2 - 50, 'Đang tải...', {
            font: '20px Arial', fill: '#ffffff'
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffe064, 1);
            progressBar.fillRect(width/2 - 250, height/2 - 15, 500 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

        // *** BẮT LỖI ASSET - Ngăn game bị treo nếu một file không tải được ***
        this.load.on('loaderror', (file) => {
            console.warn(`[BootScene] Không tải được: ${file.key} (${file.url}) - Bỏ qua và tiếp tục.`);
        });

        // -------------------------------------------------------------
        // NẠP TÀI NGUYÊN CHUẨN HÓA (Standardized Assets)
        // -------------------------------------------------------------

        // 1. ATLAS XML 
        this.load.atlasXML('icon_atlas', 'Game item img/icon/icon_atlas.png', 'Game item img/icon/icon_atlas.xml');
        this.load.atlasXML('char_atlas', 'Game item img/Char/char_atlas.png', 'Game item img/Char/char_atlas.xml');
        this.load.atlasXML('ui_atlas', 'Game item img/icon/UI/ui_atlas.png', 'Game item img/icon/UI/ui_atlas.xml');
        this.load.atlasXML('machine_atlas', 'Game item img/Thiết bị và công cụ làm kem/machine_atlas.png', 'Game item img/Thiết bị và công cụ làm kem/machine_atlas.xml');
        this.load.atlasXML('cream_atlas', 'Game item img/Lớp kem đơn/classCream.png', 'Game item img/Lớp kem đơn/class_cream_atlas.xml');
        this.load.atlasXML('drink_atlas', 'Game item img/Đồ uống/drink_atlas.png', 'Game item img/Đồ uống/drink_atlas.xml');
        this.load.atlasXML('vun_atlas', 'Game item img/bánh vụn trang trí/vun_atlas.png', 'Game item img/bánh vụn trang trí/vun_atlas.xml');
        this.load.atlasXML('target_1_atlas', 'Game item img/các loại kem/1 tầng/cream_atlas.png', 'Game item img/các loại kem/1 tầng/cream_atlas.xml');
        this.load.atlasXML('target_2_atlas', 'Game item img/các loại kem/2 tầng/cream2.png', 'Game item img/các loại kem/2 tầng/cream2.xml');

        // 2. ẢNH NỀN
        this.load.atlasXML('bg_atlas', 'Game item img/Background cửa hàng/background-0.png', 'Game item img/Background cửa hàng/background_atlas.xml');
        
        // 3. ÂM THANH (không bao gồm video vì có thể block loading)
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

        // NẠP VIDEO (Giai đoạn 5.5)
        this.load.video('reward-video', 'video/video.mp4');

        // GHI CHÚ: Video (video.mp4) được load riêng trong VideoScene để tránh block.
    }

    create() {
        // Khởi tạo trạng thái game toàn cục
        if (!this.registry.has('gold')) this.registry.set('gold', 0);
        if (!this.registry.has('inventory')) this.registry.set('inventory', []);

        this.scene.start('MenuScene');
    }
}
