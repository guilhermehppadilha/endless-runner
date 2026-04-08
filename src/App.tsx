import React, { useEffect, useState } from 'react';
import { PhaserGame } from './components/PhaserGame';
import { UIManager } from './components/ui/UIManager';
import { useMobileAppLifecycle } from './hooks/useMobileAppLifecycle';
import { PokiService } from './game/systems/PokiService';

export const App: React.FC = () => {
    const [isPokiReady, setIsPokiReady] = useState(false);

    useMobileAppLifecycle();

    useEffect(() => {
        PokiService.init().finally(() => {
            setIsPokiReady(true);
        });
    }, []);

    if (!isPokiReady) {
        return <div className="bg-black w-screen h-screen flex items-center justify-center text-white">Carregando...</div>;
    }

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            <PhaserGame />
            <UIManager />
        </div>
    );
};
