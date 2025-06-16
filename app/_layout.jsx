import {Stack} from 'expo-router';
import {useEffect} from "react";
import * as Storage from '../services/storage';
import useSessionStore from '../store/useSessionStore';

export default function RootLayout() {
    const initializeSession = useSessionStore((state) => state.initializeSession);

    // Inizializziamo il database all'avvio dell'app
    useEffect(() => {
        const initialize = async () => {
            try {
                // Inizializza prima il database
                await Storage.createTable();
                // Poi inizializza la sessione per ottenere sid e uid
                const sessionData = await initializeSession();
                if (sessionData) {
                    console.log('Sessione inizializzata con successo', {
                        sid: sessionData.sid,
                        uid: sessionData.uid
                    });
                } else {
                    console.error('Errore durante l\'inizializzazione della sessione');
                }
            } catch (error) {
                console.error('Errore durante l\'inizializzazione:', error);
            }
        };

        initialize();

    }, []);

    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown: false}}/>
        </Stack>
    );
}
