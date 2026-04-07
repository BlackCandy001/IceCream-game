import Phaser from 'phaser';
import DebugTool from '../utils/DebugTool';

export default class RecipeScene extends Phaser.Scene {
    constructor() {
        super('RecipeScene');
    }

    create() {
        DebugTool.init(this);

        // Lớp màng chắn đen thui mờ mờ vắt ngang màn chơi (cản luôn click để không bấm nhầm GameScene bên dưới)
        let overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(0, 0, 1024, 768);
        overlay.setInteractive(new Phaser.Geom.Rectangle(0, 0, 1024, 768), Phaser.Geom.Rectangle.Contains);

        // Hiện bảng Noti (Thu nhỏ lại để không chiếm hết cả màn hình che mất nút)
        let board = this.add.image(512, 384, 'ui-noti');
        board.setScale(0.3); // Kích thước an toàn để không che mù mịt
        
        // Thêm text chỉ dẫn Thoát
        let text = this.add.text(512, 700, '(Nhấp chuột ra vòng ngoài màn hình đen để Đóng)', { font: '24px Arial', fill: '#ffffff', fontStyle: 'italic' }).setOrigin(0.5);

        // ============================================
        // KHU VỰC VIẾT CHỮ LÊN BẢNG THÔNG BÁO (NOTI)
        // ============================================
        // Hướng dẫn: Bạn chỉ cần đổi X, Y và Nội Dung trong dấu nháy đơn. Lập tức game sẽ nhảy chữ theo!
        
        // 1. Tiêu đề
        this.add.text(512, 250, 'TIỆM KEM PIXEL - HƯỚNG DẪN', { 
            font: 'bold 26px "Courier New", monospace', 
            fill: '#883311' 
        }).setOrigin(0.5); // Nằm trong phạm vi mép trên bảng

        // 2. Nội dung hướng dẫn cách chơi
        let phanHuongDan = 
            "[1]. Đón Khách: Chờ Khách đứng vào ô gọi món.\n\n" +
            "[2]. Pha Chế: Tương tác Máy Cà Phê hoặc Tủ Kem.\n\n" +
            "[3]. Đóng Gói: Múc đủ món, bấm Balo để cất.\n\n" +
            "[4]. Thu Tiền: Click trực tiếp vào Khách để giao.\n\n" +
            "[5]. Bị khách che khuất: Click liên tục vào Khách để di chuyển\n\n" +
            "!! CHÚ Ý: Bán trước 90 giây kẻo khách bỏ đi !";

        this.add.text(512, 400, phanHuongDan, { 
            font: 'bold 18px "Courier New", monospace', 
            fill: '#222222',
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        // ============================================

        // Đóng bảng Recipe và Tiếp tục GameScene
        overlay.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('GameScene'); // Khôi phục dòng chảy thời gian của quầy
        });
    }
}
