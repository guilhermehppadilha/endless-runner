import { Events } from 'phaser';

export const EventBus = new Events.EventEmitter();

export enum GameEvents {
    SCENE_READY = 'SCENE_READY',
    SCORE_UPDATED = 'SCORE_UPDATED',
    GAME_OVER = 'GAME_OVER',
    START_GAME = 'START_GAME',
    PAUSE_GAME = 'PAUSE_GAME',
    RESUME_GAME = 'RESUME_GAME',
    REQUEST_RESTART = 'REQUEST_RESTART',
    REQUEST_REVIVE = 'REQUEST_REVIVE',
    AD_AVAILABILITY_CHANGED = 'AD_AVAILABILITY_CHANGED',
    QUIT_TO_MENU = 'QUIT_TO_MENU',
}

export interface IScorePayload {
    score: number;
}