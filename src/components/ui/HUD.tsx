import React, { useEffect, useState } from 'react';
import { EventBus, GameEvents, IScorePayload } from '@/game/events/EventBus';

export const HUD: React.FC = () => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleScoreUpdate = (payload: IScorePayload) => {
      setScore(payload.score);
    };

    EventBus.on(GameEvents.SCORE_UPDATED, handleScoreUpdate);

    return () => {
      EventBus.off(GameEvents.SCORE_UPDATED, handleScoreUpdate);
    };
  }, []);

  return (
    <div className="absolute top-4 left-4 pointer-events-none z-10">
      <h2 className="text-white text-2xl font-mono font-bold" style={{ textShadow: '2px 2px 0 #000' }}>
        ALTURA: {score}m
      </h2>
    </div>
  );
};