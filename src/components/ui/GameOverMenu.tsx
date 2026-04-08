import React, { useEffect, useState } from 'react';
import { EventBus, GameEvents } from '@/game/events/EventBus';
import { useUIStore } from '@/store/useUIStore';
import { AdManager } from '@/game/systems/AdManager';

interface GameOverProps {
  score: number;
  canRevive: boolean;
}

export const GameOverMenu: React.FC<GameOverProps> = ({ score, canRevive }) => {
  const setScreen = useUIStore((state) => state.setScreen);
  const [isAdAvailable, setIsAdAvailable] = useState(AdManager.isRewardedReady);

  useEffect(() => {
    const handleAdChange = (ready: boolean) => setIsAdAvailable(ready);
    EventBus.on(GameEvents.AD_AVAILABILITY_CHANGED, handleAdChange);

    return () => EventBus.off(GameEvents.AD_AVAILABILITY_CHANGED, handleAdChange);
  }, []);

  const onRestart = () => {
    setScreen('playing'); // Volta a tela para o jogo
    EventBus.emit(GameEvents.REQUEST_RESTART);
  };

  const onRevive = () => {
    setScreen('playing'); // Volta a tela para o jogo
    EventBus.emit(GameEvents.REQUEST_REVIVE);
  };

  return (
    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-6 backdrop-blur-sm">
      <h1 className="text-red-500 text-6xl font-bold mb-4 drop-shadow-lg">QUEDA LIVRE!</h1>

      <div className="mb-8">
        <p className="text-gray-400 text-sm tracking-widest uppercase">Altura</p>
        <p className="text-white text-4xl font-bold">{score}m</p>
      </div>

      <div className="flex flex-col gap-4">
        {canRevive && (
          <button
            onClick={onRevive}
            disabled={!isAdAvailable}
            className={`font-bold py-4 px-8 rounded-lg transition-all ${isAdAvailable
              ? "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg"
              : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
              }`}
          >
            {isAdAvailable ? "ASSISTIR PARA REVIVER" : "ANÚNCIO INDISPONÍVEL"}
          </button>
        )}

        <button
          onClick={onRestart}
          className="border-2 border-white/30 text-white hover:bg-white/10 py-4 px-8 rounded-lg active:scale-95 transition-all"
        >
          NOVA TENTATIVA
        </button>
      </div>
    </div>
  );
};