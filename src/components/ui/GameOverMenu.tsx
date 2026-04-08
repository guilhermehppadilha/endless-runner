import React, { useEffect, useState } from 'react';
import { EventBus, GameEvents } from '@/game/events/EventBus';

export const GameOverMenu: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [canRevive, setCanRevive] = useState(true);

  useEffect(() => {
    const onGameOver = (data: { score: number; canRevive: boolean }) => {
      setScore(data.score);
      setCanRevive(data.canRevive);
      setIsVisible(true);
    };

    EventBus.on(GameEvents.GAME_OVER, onGameOver);

    return () => {
      EventBus.off(GameEvents.GAME_OVER, onGameOver);
    };
  }, []);

  const handleRestart = () => {
    setIsVisible(false);
    EventBus.emit(GameEvents.REQUEST_RESTART);
  };

  const handleRevive = () => {
    setIsVisible(false);
    EventBus.emit(GameEvents.REQUEST_REVIVE);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center z-[100] p-6 text-center">
      <h1 className="text-red-600 text-5xl font-bold font-mono tracking-tighter mb-4">
        QUEDA LIVRE!
      </h1>

      <div className="mb-10">
        <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Altura Alcançada</p>
        <p className="text-white text-4xl font-mono font-bold">{score}m</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {canRevive && (
          <button
            onClick={handleRevive}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-mono py-4 rounded-lg shadow-lg active:scale-95 transition-all"
          >
            ASSISTIR PARA REVIVER
          </button>
        )}

        <button
          onClick={handleRestart}
          className="border-2 border-white/20 hover:border-white text-white font-mono py-4 rounded-lg active:scale-95 transition-all"
        >
          NOVA TENTATIVA
        </button>
      </div>
    </div>
  );
};