import React, { useEffect, useState } from 'react';
import { EventBus, GameEvents } from '@/game/events/EventBus';
import { GameOverMenu } from './GameOverMenu';
import { useUIStore } from '@/store/useUIStore';
import { MainMenu } from './MainMenu';
import { PauseMenu } from './PauseMenu';
import { HUD } from './HUD';

export const UIManager: React.FC = () => {
    const setScreen = useUIStore((state) => state.setScreen);
    const currentScreen = useUIStore((state) => state.currentScreen);

    const [gameOverData, setGameOverData] = useState({ score: 0, canRevive: true });

    useEffect(() => {
        const handleGameOver = (data: { score: number; canRevive: boolean }) => {
            setGameOverData(data);
            setScreen('GAME_OVER');
        };

        EventBus.on(GameEvents.GAME_OVER, handleGameOver);
        EventBus.on(GameEvents.PAUSE_GAME, () => setScreen('PAUSED'));
        EventBus.on(GameEvents.RESUME_GAME, () => setScreen('PLAYING'));
        EventBus.on(GameEvents.QUIT_TO_MENU, () => setScreen('MAIN_MENU'));

        return () => {
            EventBus.off(GameEvents.GAME_OVER);
            EventBus.off(GameEvents.PAUSE_GAME);
            EventBus.off(GameEvents.RESUME_GAME);
            EventBus.off(GameEvents.QUIT_TO_MENU);
        };
    }, [setScreen]);

    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            {currentScreen === 'MAIN_MENU' && <div className="pointer-events-auto"><MainMenu /></div>}
            {currentScreen === 'PLAYING' && <HUD />}
            {currentScreen === 'PAUSED' && <div className="pointer-events-auto"><PauseMenu /></div>}
            {currentScreen === 'GAME_OVER' && (
                <div className="pointer-events-auto">
                    <GameOverMenu score={gameOverData.score} canRevive={gameOverData.canRevive} />
                </div>
            )}
        </div>
    );
};