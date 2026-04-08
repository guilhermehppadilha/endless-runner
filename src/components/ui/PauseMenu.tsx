import React from 'react';
import { Play, LogOut } from 'lucide-react';
import { EventBus, GameEvents } from '@/game/events/EventBus';
import { useUIStore } from '@/store/useUIStore';

export const PauseMenu: React.FC = () => {
    const setScreen = useUIStore((state) => state.setScreen);

    const handleResume = () => {
        setScreen('PLAYING');
        EventBus.emit(GameEvents.RESUME_GAME);
    };

    const handleQuit = () => {
        setScreen('MAIN_MENU');
        EventBus.emit(GameEvents.QUIT_TO_MENU);
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-50 text-white">
            <h2 className="text-4xl font-bold mb-10">JOGO PAUSADO</h2>

            <div className="flex flex-col gap-4 w-64">
                <button
                    onClick={handleResume}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 py-4 rounded-xl font-bold text-xl transition-all"
                >
                    <Play size={24} fill="currentColor" />
                    CONTINUAR
                </button>

                <button
                    onClick={handleQuit}
                    className="flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-500 py-3 rounded-xl font-semibold transition-all"
                >
                    <LogOut size={20} />
                    SAIR PARA O MENU
                </button>
            </div>
        </div>
    );
};