import React, { useEffect, useState } from 'react';
import { EventBus, GameEvents } from '@/game/events/EventBus';
import { GameOverMenu } from './GameOverMenu';
import { useUIStore } from '@/store/useUIStore';

export const UIManager: React.FC = () => {
    const setScreen = useUIStore((state) => state.setScreen);
    const currentScreen = useUIStore((state) => state.currentScreen);

    const [gameOverData, setGameOverData] = useState({ score: 0, canRevive: true });

    useEffect(() => {
        EventBus.on(GameEvents.PAUSE_GAME, () => setScreen('pause'));
        EventBus.on(GameEvents.RESUME_GAME, () => setScreen('playing'));

        const handleGameOver = (data: { score: number; canRevive: boolean }) => {
            setGameOverData(data);
            setScreen('GAME_OVER');
        };

        EventBus.on(GameEvents.GAME_OVER, handleGameOver);

        return () => {
            EventBus.off(GameEvents.GAME_OVER, handleGameOver);
        };
    }, [setScreen]);

    return (
        <div className="absolute inset-0 pointer-events-none z-50">
            {currentScreen === 'playing' && <HUD />}
            {currentScreen === 'pause' && <div className="pointer-events-auto"><PauseMenu /></div>}
            {currentScreen === 'game_over' && <div className="pointer-events-auto"><GameOverMenu score={gameOverData.score} canRevive={gameOverData.canRevive} /></div>}
        </div>
    );
};