import Phaser from 'phaser';

/**
 * LayoutUtils.js - Triển khai Pixel-Perfect Responsive UI
 * Đảm bảo item luôn giữ đúng vị trí tương đối trên mọi kích thước màn hình.
 */
export default class LayoutUtils {
    /**
     * Lấy các thông số Scale và Offset dựa trên kích thước vùng chứa thực tế
     * @param {Phaser.Scene} scene 
     * @param {number} baseW 
     * @param {number} baseH 
     */
    static getMetrics(scene, baseW = 1024, baseH = 768) {
        const { width, height } = scene.cameras.main;
        
        const scaleX = width / baseW;
        const scaleY = height / baseH;
        const scale = Math.min(scaleX, scaleY); // Chế độ "Contain" (Fit)

        const scaledWidth = baseW * scale;
        const scaledHeight = baseH * scale;
        const offsetX = (width - scaledWidth) / 2;
        const offsetY = (height - scaledHeight) / 2;

        return { scale, offsetX, offsetY, width, height, baseW, baseH };
    }

    /**
     * Chuyển tọa độ Normalized sang tọa độ thực tế trên màn hình
     */
    static getPos(scene, normX, normY, baseW = 1024, baseH = 768) {
        const { scale, offsetX, offsetY } = this.getMetrics(scene, baseW, baseH);
        const x = (normX * baseW * scale) + offsetX;
        const y = (normY * baseH * scale) + offsetY;
        return { x, y, scale };
    }

    /**
     * Chuyển ngược từ tọa độ màn hình sang tọa độ Normalized theo ảnh nền
     */
    static getNorm(scene, x, y, baseW = 1024, baseH = 768) {
        const { scale, offsetX, offsetY } = this.getMetrics(scene, baseW, baseH);
        return {
            nx: ((x - offsetX) / (baseW * scale)).toFixed(3),
            ny: ((y - offsetY) / (baseH * scale)).toFixed(3)
        };
    }
}
