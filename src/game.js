import Phaser from 'phaser';

// Import Scenes
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import DrinkStationScene from './scenes/DrinkStationScene.js';
import IceCreamStationScene from './scenes/IceCreamStationScene.js';
import RecipeScene from './scenes/RecipeScene.js';
import VideoScene from './scenes/VideoScene.js';
import WinScene from './scenes/WinScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: '100%',
    height: '100%',
    pixelArt: true, 
    transparent: true,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [
        BootScene,
        MenuScene,
        GameScene,
        DrinkStationScene,
        IceCreamStationScene,
        RecipeScene,
        VideoScene,
        WinScene
    ]
};

const game = new Phaser.Game(config);
