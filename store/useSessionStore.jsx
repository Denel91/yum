import {create} from "zustand";
import * as api from '../services/api';
import * as Storage from '../services/storage';

const useSessionStore = create((set, get) => ({
    sid: null,
    uid: null,
    isInitialized: false,
    isLoading: true,
    error: null,
    isInitializing: false, // Previene race conditions

    // Imposta sid e uid
    setSid: (newSid) => set({sid: newSid}),
    setUid: (newUid) => set({uid: newUid}),

    // Pulisce l'errore
    clearError: () => set({error: null}),

    // Inizializza la sessione
    initializeSession: async () => {
        const state = get();

        // Previeni inizializzazioni multiple simultanee
        if (state.isInitializing) {
            console.log('Inizializzazione già in corso...');
            return { sid: state.sid, uid: state.uid };
        }

        // Se già inizializzato, restituisci i dati esistenti
        if (state.isInitialized && state.sid && state.uid) {
            return { sid: state.sid, uid: state.uid };
        }

        try {

            set({
                isLoading: true,
                isInitializing: true,
                error: null
            });

            // Recupera i dati da AsyncStorage
            let storedSid = await Storage.getData('sid');
            let storedUid = await Storage.getData('uid');

            // Se non esistono, registra un nuovo utente
            if (!storedSid || !storedUid) {
                console.log('Registrazione nuovo utente...');
                const registrationData = await api.register();

                if (!registrationData || !registrationData.sid || !registrationData.uid) {
                    throw new Error('Dati di registrazione non validi ricevuti dal server');
                }

                const {sid, uid} = registrationData;


                // Salva i nuovi valori
                await Storage.storeData('sid', sid);
                await Storage.storeData('uid', uid);

                storedSid = sid;
                storedUid = uid;

                console.log('Nuovo utente registrato:', { sid, uid });

            } else {
                console.log('Sessione recuperata:', { sid: storedSid, uid: storedUid });

            }

            set({
                sid: storedSid,
                uid: storedUid,
                isInitialized: true,
                isLoading: false,
                isInitializing: false,
                error: null
            });

            return { sid: storedSid, uid: storedUid };


        } catch (error) {
            console.error('Errore durante l\'inizializzazione della sessione:', error);
            set({
                isLoading: false,
                isInitialized: false,
                isInitializing: false,
                error: error.message || 'Errore durante l\'inizializzazione'
            });
            return null;
        }
    },

    // Ottieni profilo
    getProfile: async () => {
        const {sid, uid} = get();
        try {
            if (!sid || !uid) {
                console.error('SID o UID non impostati. Inizializza prima la sessione.');
                return null;
            }

            set({ error: null });
            const profile = await api.getUserProfile(sid, uid);
            if (!profile) {
                throw new Error('Profilo non trovato');
            }

            return profile;

        } catch (error) {
            console.error('Errore recupero profilo:', error);
            set({ error: error.message || 'Errore durante il recupero del profilo' });
            return null;
        }
    },


    // Aggiorna le informazioni del profilo
    updateProfile: async (userData) => {
        const {sid, uid} = get();
        try {
            if (!sid || !uid) {
                console.error('SID o UID non impostati. Inizializza prima la sessione.');
                return null;
            }

            set({ error: null });
            const updatedProfile = await api.updateUserInfo(sid, uid, userData);

            if (!updatedProfile) {
                throw new Error('Aggiornamento profilo fallito');
            }

            console.log('Profilo aggiornato con successo:', updatedProfile);
            return updatedProfile;

        } catch (error) {
            console.error('Errore aggiornamento profilo:', error);
            set({ error: error.message || 'Errore durante l\'aggiornamento del profilo' });
            return null;
        }
    },

    // Logout
    logout: async () => {
        try {

            set({ error: null, isLoading: true });

            // Elimina i dati dalla memoria
            await Storage.removeData('sid');
            await Storage.removeData('uid');

            // Resetta lo store
            set({
                sid: null,
                uid: null,
                isInitialized: false,
                isLoading: false,
                error: null,
                isInitializing: false
            });

            console.log('Logout completato con successo');
            return true;

        } catch (error) {
            console.error('Errore durante il logout:', error);
            set({
                error: error.message || 'Errore durante il logout',
                isLoading: false
            });
            return false;
        }
    },

    // Metodo per re-inizializzare dopo logout
    reinitialize: async () => {
        const state = get();

        // Resetta completamente lo stato
        set({
            sid: null,
            uid: null,
            isInitialized: false,
            isLoading: false,
            error: null,
            isInitializing: false
        });

        // Inizializza nuovamente
        return await get().initializeSession();
    }
}));

export default useSessionStore;
