import axios from "axios";
import * as Storage from '../services/storage';

export const API_BASE_URL = 'https://develop.ewlab.di.unimi.it/mc/2425';

// Funzione per effettuare il login
export const register = async () => {
    try {
        const response = await axios.post(`${API_BASE_URL}/user`);
        console.log('Registration successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

// Ottiene informazioni del profilo dell'utente
export async function getUserProfile(sid, uid) {
    try {
        const response = await axios.get(`${API_BASE_URL}/user/${uid}`);
        return response.data;
    } catch (error) {
        console.error('Errore durante il recupero del profilo:', error);
        throw error;
    }
}

// Aggiorna le informazioni del profilo dell'utente
export const updateUserInfo = async (sid, uid, userData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/user/${uid}`, {
            sid,
            ...userData
        });

        console.log('Informazioni utente aggiornate con successo:', response.data);
        return response.data;
    } catch (error) {
        console.error('Errore durante l\'aggiornamento delle informazioni:', error);
        throw new Error('Impossibile aggiornare le informazioni dell\'utente: ' + error.message);
    }
}

// Funzione per ottenere i ristoranti in base alla posizione
export const getMenu = async (latitude, longitude, sid) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/menu`, {
            params: { lat: latitude, lng: longitude, sid: sid }
        });
        console.log('Menu ottenuti con successo:', response.data);
        return response.data;
    } catch (error) {
        console.error('Errore durante il recupero dei menu:', error, latitude, longitude, sid);
        throw error;
    }
}

// Funzione per ottenere i dettagli di un menu specifico
export const getMenuDetails = async (menuId, latitude, longitude, sid) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/menu/${menuId}`, {
            params: { mid: menuId, lat: latitude, lng: longitude, sid: sid }
        });
        console.log('Dettagli menu ottenuti con successo:', response.data);
        return response.data;
    } catch (error) {
        console.error(`Errore durante il recupero dei dettagli del menu ${menuId}:`, error);
        throw error;
    }
}


// Funzione per ottenere l'immagine di un menu
export const getMenuImage = async (menuId, sid) => {
    try {
        // Prima controlla se l'immagine è già memorizzata localmente
        const cachedImage = await Storage.getMenuImage(menuId);

        if (cachedImage) {
            console.log(`Immagine per menu ${menuId} caricata dalla cache locale`);
            return {
                fromCache: true,
                data: cachedImage.imageData
            };
        }

        // Se non è in cache, richiedi l'immagine al server
        console.log(`Immagine per menu ${menuId} non trovata in cache, richiesta al server...`);

        const response = await axios.get(`${API_BASE_URL}/menu/${menuId}/image`, {
            params: { mid: menuId, sid: sid }
        });

        // Il server restituisce già il base64, non c'è bisogno di conversione
        if (response.data) {
            const imageData = response.data.base64;

            // Salva l'immagine nella cache locale
            await Storage.saveMenuImage(menuId, imageData);

            return {
                fromCache: false,
                data: imageData
            };
        } else {
            throw new Error('Risposta del server non valida');
        }
    } catch (error) {
        console.error('Errore durante il recupero dell\'immagine del menu:', error);
        throw error;
    }
}

// Funzione per ordinare un menu
export const orderMenu = async (sid, menuId, locationData) => {
    try {

        const requestData = {
            sid: sid,
            deliveryLocation: {
                lat: locationData.latitude,
                lng: locationData.longitude
            }
        };

        const response = await axios.post(`${API_BASE_URL}/menu/${menuId}/buy`, requestData);

        console.log('Ordine effettuato con successo:', response.data);
        return response.data;
    } catch (error) {
        console.error('Errore durante l\'effettuazione dell\'ordine:', error.message);
        throw error;
    }
}

// Funzione per ottenere lo stato dell'ordine
export const getOrderStatus = async (sid, orderId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/order/${orderId}`, {
            params: {oid: orderId,  sid: sid }
        });
        console.log('Stato dell\'ordine ottenuto con successo:', response.data);
        return response.data;
    } catch (error) {
        console.error('Errore durante il recupero dello stato dell\'ordine:', error);
        throw error;
    }
}


// Elimina l'ultimo ordine effettuato dall'utente.
export const deleteLastOrder = async (sid) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/order`, {
            params: { sid: sid }
        });
        console.log('Ultimo ordine eliminato con successo:', response.data);
        return response.data;
    } catch (error) {
        console.error('Errore durante l\'eliminazione dell\'ultimo ordine:', error);
        throw error;
    }
}








