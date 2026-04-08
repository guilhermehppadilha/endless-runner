import React, { useEffect, useState } from 'react';
import { EventBus, GameEvents, IScorePayload } from '../../game/events/EventBus';

export const HUD: React.FC = () => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleScore = (payload: IScorePayload) => setScore(payload.score);
    EventBus.on(GameEvents.SCORE_UPDATED, handleScore);
    return () => { EventBus.off(GameEvents.SCORE_UPDATED, handleScore); };
  }, []);

  const onPause = () => {
    EventBus.emit(GameEvents.PAUSE_GAME);
  };

  return (
    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start pointer-events-none z-20">
      <div className="bg-black/50 p-2 rounded backdrop-blur-sm">
        <p className="text-white font-mono text-xl font-bold">ALTURA: {score}m</p>
      </div>
      <button
        onClick={onPause}
        className="pointer-events-auto bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors backdrop-blur-sm"
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </svg>
      </button>
    </div>
  );
};