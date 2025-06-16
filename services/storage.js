import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

let db;


// Funzione per creare il database SQLite
export async function createTable() {
    db = await SQLite.openDatabaseAsync('yum_app.db');
    const query = `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT,
        lastName TEXT,
        cardFullName TEXT,
        cardNumber TEXT,
        cardExpireMonth INTEGER,
        cardExpireYear INTEGER,
        cardCVV TEXT,
        uid INTEGER,
        lastOid INTEGER,
        orderStatus TEXT
    )`;

    // Nuova tabella per le immagini
    const imagesTableQuery = `CREATE TABLE IF NOT EXISTS menu_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        menu_id TEXT NOT NULL UNIQUE,
        image_data TEXT NOT NULL,
        timestamp INTEGER NOT NULL
    )`;

    try {
        await db.execAsync(query);
        await db.execAsync(imagesTableQuery);
        console.log("Tabelle create con successo");
    } catch (error) {
        console.error("Errore durante la creazione delle tabelle", error);
    }
}

export async function fetchUsers() {
    try {
        const allRows = await db.getAllAsync('SELECT * FROM users');

        if (!allRows || allRows.length === 0) {
            console.log("Nessun utente trovato");
            return [];
        }

        console.log("Utenti recuperati con successo:", allRows);

        return allRows.map(row => ({
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            cardFullName: row.cardFullName,
            cardNumber: row.cardNumber,
            cardExpireMonth: row.cardExpireMonth,
            cardExpireYear: row.cardExpireYear,
            cardCVV: row.cardCVV,
            uid: row.uid,
            lastOid: row.lastOid,
            orderStatus: row.orderStatus
        }));


    } catch (error) {
        console.error("Errore durante il recupero degli utenti:", error);
        return [];
    }
}

export async function deleteUserByUid(uid) {
    try {
        const results = await db.runAsync('DELETE FROM users WHERE uid = ?', [uid]);

        if (results.changes > 0) {
            console.log(`Utente con UID ${uid} eliminato con successo.`);
        } else {
            console.log(`Nessun utente trovato con l'UID ${uid}.`);
        }

        return results.changes; // Restituisce il numero di righe eliminate
    } catch (error) {
        console.error("Errore durante l'eliminazione dell'utente:", error);
        return 0; // Restituisce 0 in caso di errore
    }
}

export async function addUser(user) {
    try {
        const {
            firstName,
            lastName,
            cardFullName,
            cardNumber,
            cardExpireMonth,
            cardExpireYear,
            cardCVV,
            uid,
            lastOid,
            orderStatus
        } = user;
        const results = await db.runAsync('INSERT INTO users (firstName, lastName, cardFullName, cardNumber, cardExpireMonth, cardExpireYear, cardCVV, uid, lastOid, orderStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [firstName, lastName, cardFullName, cardNumber, cardExpireMonth, cardExpireYear, cardCVV, uid, lastOid, orderStatus]);

        if (results.changes > 0) {
            console.log(`Utente ${firstName} ${lastName} aggiunto con successo.`);
        } else {
            console.log("Errore durante l'aggiunta dell'utente.");
        }

        return results.changes; // Restituisce il numero di righe aggiunte
    } catch (error) {
        console.error("Errore durante l'aggiunta dell'utente:", error);
    }
}

export async function updateUserByUid(uid, user) {
    try {
        const {
            firstName,
            lastName,
            cardFullName,
            cardNumber,
            cardExpireMonth,
            cardExpireYear,
            cardCVV,
            lastOid,
            orderStatus
        } = user;

        const results = await db.runAsync(
            'UPDATE users SET firstName = ?, lastName = ?, cardFullName = ?, cardNumber = ?, cardExpireMonth = ?, cardExpireYear = ?, cardCVV = ?, lastOid = ?, orderStatus = ? WHERE uid = ?',
            [firstName, lastName, cardFullName, cardNumber, cardExpireMonth, cardExpireYear, cardCVV, lastOid, orderStatus, uid]
        );

        if (results.changes > 0) {
            console.log(`Utente con UID ${uid} aggiornato con successo.`);
        } else {
            console.log(`Nessun utente trovato con l'UID ${uid}.`);
        }

        return results.changes; // Restituisce il numero di righe aggiornate
    } catch (error) {
        console.error("Errore durante l'aggiornamento dell'utente:", error);
        return 0; // Restituisce 0 in caso di errore
    }
}

export async function getUserByUid(uid) {
    try {
        // Modifica: cerca per uid invece di id
        const results = await db.getAllAsync('SELECT * FROM users WHERE uid = ?', [uid]);

        // Verifica se sono stati trovati risultati
        if (results && results.length > 0) {
            console.log(`Utente con UID ${uid} recuperato con successo.`, results[0]);

            // Prendi il primo risultato trovato
            const user = results[0];

            // Restituisci l'oggetto utente con tutti i campi
            return {
                id: user.id,                // Questo è l'ID del database
                firstName: user.firstName,
                lastName: user.lastName,
                cardFullName: user.cardFullName,
                cardNumber: user.cardNumber,
                cardExpireMonth: user.cardExpireMonth,
                cardExpireYear: user.cardExpireYear,
                cardCVV: user.cardCVV,
                uid: user.uid,              // Questo è l'UID del server
                lastOid: user.lastOid,
                orderStatus: user.orderStatus
            };
        } else {
            console.log(`Nessun utente trovato con l'UID ${uid}.`);
            return null;
        }
    } catch (error) {
        console.error("Errore durante il recupero dell'utente:", error);
        return null;  // Aggiungi un return in caso di errore
    }
}

export const storeData = async (key, value) => {
    try {
        const valueToStore = typeof value === 'string'
            ? value
            : JSON.stringify(value);

        await AsyncStorage.setItem(key, valueToStore);
        console.log(`Dati salvati con successo per chiave: ${key}`);
        return true;
    } catch (error) {
        console.error(`Errore durante il salvataggio dei dati per chiave ${key}:`, error);
        return false;
    }
};

export const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);

        if (value === null) {
            console.log(`Nessun dato trovato per chiave: ${key}`);
            return null;
        }

        console.log(`Dati recuperati con successo per chiave: ${key}`);
        return value;

    } catch (error) {
        console.error(`Errore durante il recupero dei dati per chiave ${key}:`, error);
        return null;
    }
};

export const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
        console.log(`Dati rimossi con successo per chiave: ${key}`);
        return true;
    } catch (error) {
        console.error(`Errore durante la rimozione dei dati per chiave ${key}:`, error);
        return false;
    }
};

export const getAllKeys = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        console.log('Tutte le chiavi recuperate con successo');
        console.log(keys);
        return keys;
    } catch (error) {
        console.error('Errore durante il recupero di tutte le chiavi:', error);
        return [];
    }
};

// Funzione per salvare un'immagine del menu
export async function saveMenuImage(menuId, imageData) {
    try {
        console.log(`Tentativo di salvare immagine per menu ${menuId}`);

        const timestamp = Date.now();
        // Prima cancella qualsiasi immagine esistente con lo stesso menu_id
        try {
            await db.runAsync('DELETE FROM menu_images WHERE menu_id = ?', [menuId]);
            console.log(`Eliminazione precedente immagine per menu ${menuId} completata`);
        } catch (deleteError) {
            console.error(`Errore durante l'eliminazione dell'immagine precedente per menu ${menuId}:`, deleteError);
        }

        // Poi inserisci la nuova immagine
        try {
            const results = await db.runAsync(
                'INSERT INTO menu_images (menu_id, image_data, timestamp) VALUES (?, ?, ?)',
                [menuId, imageData, timestamp]
            );

            if (results.changes > 0) {
                console.log(`Immagine per menu ${menuId} salvata con successo`);
                return true;
            } else {
                console.log(`Nessuna riga modificata durante il salvataggio dell'immagine per menu ${menuId}`);
                return false;
            }
        } catch (insertError) {
            console.error(`Errore specifico durante l'inserimento dell'immagine per menu ${menuId}:`, insertError.message || insertError);
            return false;
        }
    } catch (error) {
        console.error(`Errore generale durante il salvataggio dell'immagine per menu ${menuId}:`, error);
        return false;
    }
}

export async function getMenuImage(menuId) {
    try {
        const results = await db.getAllAsync(
            'SELECT * FROM menu_images WHERE menu_id = ?',
            [menuId]
        );

        if (results && results.length > 0) {
            console.log(`Immagine per menu ${menuId} recuperata dal database locale`);
            return {
                imageData: results[0].image_data,
                timestamp: results[0].timestamp
            };
        } else {
            console.log(`Nessuna immagine trovata per menu ${menuId}`);
            return null;
        }
    } catch (error) {
        console.error(`Errore durante il recupero dell'immagine per menu ${menuId}:`, error);
        return null;
    }
}

export async function deleteMenuImage(menuId) {
    try {
        const results = await db.runAsync(
            'DELETE FROM menu_images WHERE menu_id = ?',
            [menuId]
        );

        if (results.changes > 0) {
            console.log(`Immagine per menu ${menuId} eliminata con successo`);
            return true;
        } else {
            console.log(`Nessuna immagine trovata per menu ${menuId} da eliminare`);
            return false;
        }
    } catch (error) {
        console.error(`Errore durante l'eliminazione dell'immagine per menu ${menuId}:`, error);
        return false;
    }
}









