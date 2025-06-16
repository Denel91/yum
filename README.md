# Descrizione

**Yum** è un'applicazione mobile sviluppata con React Native e Expo che si concentra sulla gestione e consegna di cibo. L'app offre un'esperienza utente completa per navigare tra menu, effettuare ordini e tracciare le consegne in tempo reale tramite l'integrazione di mappe.

# Caratteristiche Principali

## Sistema di Navigazione
L'app è strutturata con un sistema di navigazione a tab che permette agli utenti di accedere facilmente alle funzionalità principali:
- **Home/Menu**: Visualizzazione dei menu disponibili
- **Consegna**: Tracciamento in tempo reale delle consegne tramite mappa
- **Profilo**: Gestione delle informazioni personali dell'utente
- **Impostazioni**: Configurazione delle preferenze dell'app

## Gestione Menu
L'app include una sezione dedicata alla visualizzazione dei menu con:
- Visualizzazione dettagliata dei singoli elementi del menu
- Possibilità di navigare tra diverse categorie di cibo

## Funzionalità di Geolocalizzazione
Yum integra potenti funzionalità di mappe per:
- Tracciare la posizione corrente dell'utente
- Visualizzare il percorso di consegna
- Monitorare in tempo reale lo stato delle consegne

## Gestione Utenti
L'applicazione include un completo sistema di gestione utenti che consente:
- Creazione e autenticazione degli account
- Memorizzazione delle preferenze personali
- Gestione dei dati degli utenti tramite database SQLite locale

# Architettura Tecnica

## Tecnologie Utilizzate
- **Framework**: React Native 0.79.3 con Expo SDK 53
- **Navigazione**: Expo Router 5.1.0 con React Navigation 7.1.9
- **Gestione Stato**: Zustand 5.0.5
- **Database Locale**: SQLite tramite expo-sqlite
- **Mappe**: react-native-maps per la visualizzazione delle mappe
- **Geolocalizzazione**: expo-location per il tracciamento della posizione

## Struttura del Progetto
L'app è organizzata in una struttura modulare:
- **/app**: Contiene le schermate principali organizzate per funzionalità
    - : Schermate accessibili dalla navigazione a tab **/app/(tabs)**
    - **/app/menu**: Gestione dei menu e dettagli degli elementi
- **/components**: Componenti riutilizzabili in tutta l'applicazione
- **/services**: Servizi per la gestione delle API e dello storage
- **/screens**: Schermate principali dell'applicazione
- **/store**: Gestione dello stato globale dell'applicazione
- **/constants**: Definizione di costanti come colori e stili

## Funzionalità di Database
L'app utilizza SQLite per:
- Memorizzare i dati degli utenti (nome, cognome, numero carta di credito)
- Gestire operazioni CRUD (Creazione, Lettura, Aggiornamento, Eliminazione)
- Persistenza dei dati tra le sessioni
