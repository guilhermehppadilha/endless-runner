import { Events } from 'phaser';

export const EventBus = new Events.EventEmitter();

export enum GameEvents {
    SCENE_READY = 'SCENE_READY',
    SCORE_UPDATED = 'SCORE_UPDATED',
    GAME_OVER = 'GAME_OVER',
    START_GAME = 'START_GAME',
    MUTE_TOGGLED = 'MUTE_TOGGLED',
    PAUSE_GAME = 'PAUSE_GAME',
    RESUME_GAME = 'RESUME_GAME',
    QUIT_TO_MENU = 'QUIT_TO_MENU',
    REQUEST_RESTART = 'REQUEST_RESTART',
    REQUEST_REVIVE = 'REQUEST_REVIVE',
}

export interface IScorePayload {
    score: number;
    multiplier?: number;
}