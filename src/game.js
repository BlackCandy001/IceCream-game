import Phaser from 'phaser';

// Import Scenes
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import DrinkStationScene from './scenes/DrinkStationScene.js';
import IceCreamStationScene from './scenes/IceCreamStationScene.js';
import RecipeScene from './scenes/RecipeScene.js';
import VideoScene from './scenes/VideoScene.js';

const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: 1024,
    height: 768,
    pixelArt: true, 
    transparent: true,
    scale: {
        mode: Phaser.Scale.FIT,
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
        VideoScene
    ]
};

const game = new Phaser.Game(config);
