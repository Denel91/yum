import {useEffect, useState} from "react";
import {StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator} from 'react-native';
import { useRouter } from 'expo-router';
import * as Storage from '../../services/storage';
import { Ionicons } from '@expo/vector-icons';
import useSessionStore from '../../store/useSessionStore';

export default function Profilo() {
    const { sid, uid, updateProfile, logout } = useSessionStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        cardFullName: '',
        cardNumber: '',
        cardExpireMonth: 0,
        cardExpireYear: 0,
        cardCVV: '',
        uid: 0,
        lastOid: 0,
        orderStatus: '',
    });
    const [successVisible, setSuccessVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                // Verifica che sid e uid siano disponibili
                if (!sid || !uid) {
                    console.log('ID sessione non trovati.');
                    return;
                }

                console.log('SID salvato:', sid);
                console.log('UID salvato:', uid);

                // Verifica se c'è una chiave che indica se è il primo avvio
                const isFirstLaunch = await Storage.getData('isFirstLaunch');

                // Profilo predefinito vuoto
                const emptyProfile = {
                    firstName: '',
                    lastName: '',
                    cardFullName: '',
                    cardNumber: '',
                    cardExpireMonth: 0,
                    cardExpireYear: 0,
                    cardCVV: '',
                    uid: Number(uid),
                    lastOid: 0,
                    orderStatus: '',
                };

                // Se è il primo avvio, imposta direttamente il profilo vuoto senza interrogare il database
                if (isFirstLaunch === null || isFirstLaunch === 'true') {
                    console.log('Primo avvio dell\'app, inizializzazione profilo vuoto');
                    setProfile(emptyProfile);

                    // Segna che non è più il primo avvio
                    await Storage.storeData('isFirstLaunch', 'false');
                } else {
                    // Non è il primo avvio, tenta di recuperare il profilo dal database
                    try {
                        const profileData = await Storage.getUserByUid(uid);

                        if (profileData) {
                            console.log('Profilo recuperato dal database locale');
                            const validatedProfile = {
                                firstName: profileData.firstName || '',
                                lastName: profileData.lastName || '',
                                cardFullName: profileData.cardFullName || '',
                                cardNumber: profileData.cardNumber || '',
                                cardExpireMonth: Number(profileData.cardExpireMonth) || 0,
                                cardExpireYear: Number(profileData.cardExpireYear) || 0,
                                cardCVV: profileData.cardCVV || '',
                                uid: Number(profileData.uid) || 0,
                                lastOid: Number(profileData.lastOid) || 0,
                                orderStatus: profileData.orderStatus || '',
                            };
                            setProfile(validatedProfile);
                        } else {
                            console.log('Nessun profilo trovato per l\'utente:', uid);
                            setProfile(emptyProfile);
                        }
                    } catch (dbError) {
                        console.error('Errore durante l\'accesso al database locale:', dbError);
                        setProfile(emptyProfile);
                    }
                }

            } catch (error) {
                console.error('Errore durante il recupero del profilo:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [sid, uid]);


    // Funzione per salvare il profilo nel database locale
    const saveProfileToLocalDB = async (uid, profile) => {
        try {
            // Verifica se l'utente esiste già nel database usando l'UID
            const existingUser = await Storage.getUserByUid(uid);

            if (existingUser) {
                console.log('Profilo esistente nel database locale');
                console.log('Profilo esistente:', existingUser.uid);
                return existingUser.uid;
            } else {
                // Utente non trovato - Crea un nuovo profilo
                const result = await Storage.addUser(profile);

                if (result > 0) {
                    console.log('Nuovo profilo creato con successo nel database locale con UID:', uid);
                    return uid; // Restituisci l'UID dell'utente appena creato
                } else {
                    console.log('Errore durante la creazione del profilo nel database locale');
                    return null; // Restituisci null in caso di errore
                }
            }
        } catch (error) {
            console.error('Errore durante il salvataggio del profilo:', error);
            return null;
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);

            // Validazione base
            if (!profile.firstName || !profile.lastName || !profile.cardFullName || !profile.cardNumber || !profile.cardCVV || !profile.cardExpireMonth || !profile.cardExpireYear) {
                Alert.alert('Campi Obbligatori', 'Tutti i campi sono obbligatori.');
                return;
            }

            // Formatta i dati assicurando i tipi corretti
            const formattedProfile = {
                ...profile,
                cardExpireMonth: Number(profile.cardExpireMonth) || 0,
                cardExpireYear: Number(profile.cardExpireYear) || 0,
                uid: Number(uid) || 0,
                lastOid: Number(profile.lastOid) || 0
            };

            // Aggiorna il profilo sul server usando la funzione dallo store Zustand
            await updateProfile(formattedProfile);
            console.log('Profilo aggiornato con successo sul server');

            // Salva il profilo nel database locale
            const savedUid = await saveProfileToLocalDB(uid, formattedProfile);

            if (savedUid) {
                console.log('Profilo salvato con successo nel database locale con UID:', savedUid);
            } else {
                console.log('Errore durante il salvataggio del profilo nel database locale');
            }

            setSuccessMessage('Profilo salvato con successo!');
            setSuccessVisible(true);

            setTimeout(() => {
                setSuccessVisible(false);
            }, 3000);

        } catch (error) {
            console.error('Errore durante il salvataggio del profilo:', error);
            Alert.alert('Errore', 'Si è verificato un errore durante il salvataggio del profilo.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            // Imposta lo stato di caricamento
            setSaving(true);

            // Usa la funzione logout dallo store Zustand
            const logoutSuccess = await logout();

            if (logoutSuccess) {
                // Mostra un toast di conferma
                setSuccessMessage('Logout effettuato con successo!');
                setSuccessVisible(true);

                setTimeout(() => {
                    setSuccessVisible(false);

                    // Reimposta i valori di stato
                    setProfile({
                        firstName: '',
                        lastName: '',
                        cardFullName: '',
                        cardNumber: '',
                        cardExpireMonth: 0,
                        cardExpireYear: 0,
                        cardCVV: '',
                        uid: 0,
                        lastOid: 0,
                        orderStatus: '',
                    });

                    // Naviga alla homepage
                    router.navigate('/');

                }, 1500);
            } else {
                // Se il logout non è riuscito, mostra un messaggio di errore
                Alert.alert('Errore', 'Logout non riuscito. Riprova.');
                console.log('Logout non riuscito');
            }
        } catch (error) {
            console.error('Errore durante il logout:', error);
            Alert.alert('Errore', 'Si è verificato un errore durante il logout.');
        } finally {
            setSaving(false);
        }
    };

    const resetFirstLaunch = async () => {
        try {
            await Storage.storeData('isFirstLaunch', 'true');
            Alert.alert('Successo', 'Il valore di isFirstLaunch è stato reimpostato su true');
            console.log('isFirstLaunch reimpostato su "true"');
        } catch (error) {
            console.error('Errore durante il reset di isFirstLaunch:', error);
            Alert.alert('Errore', 'Impossibile reimpostare isFirstLaunch');
        }
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.sectionTitle}>Dati Personali</Text>

            {/* Informazioni di sessione */}
            <View style={styles.sessionInfo}>
                <Text style={styles.sessionText}>ID Sessione: {sid}</Text>
                <Text style={styles.sessionText}>ID Utente: {uid}</Text>
            </View>

            <Text style={styles.label}>Nome</Text>
            <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(text) => setProfile({...profile, firstName: text})}
                placeholder="Inserisci il tuo nome"
            />

            <Text style={styles.label}>Cognome</Text>
            <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(text) => setProfile({...profile, lastName: text})}
                placeholder="Inserisci il tuo cognome"
            />

            <Text style={styles.sectionTitle}>Dati Carta di Credito</Text>

            <Text style={styles.label}>Nome sulla Carta</Text>
            <TextInput
                style={styles.input}
                value={profile.cardFullName}
                onChangeText={(text) => setProfile({...profile, cardFullName: text})}
                placeholder="Nome e cognome come sulla carta"
            />

            <Text style={styles.label}>Numero Carta</Text>
            <TextInput
                style={styles.input}
                value={profile.cardNumber}
                onChangeText={(text) => setProfile({...profile, cardNumber: text})}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={16}
            />

            <View style={styles.row}>
                <View style={styles.halfInputContainer}>
                    <Text style={styles.label}>Mese Scadenza</Text>
                    <TextInput
                        style={styles.halfInput}
                        value={profile.cardExpireMonth !== 0 ? `${profile.cardExpireMonth}` : ''}
                        onChangeText={(text) => setProfile({...profile, cardExpireMonth: text ? Number(text) : 0})}
                        placeholder="MM"
                        keyboardType="numeric"
                        maxLength={2}
                    />
                </View>

                <View style={styles.halfInputContainer}>
                    <Text style={styles.label}>Anno Scadenza</Text>
                    <TextInput
                        style={styles.halfInput}
                        value={profile.cardExpireYear !== 0 ? `${profile.cardExpireYear}` : ''}
                        onChangeText={(text) => setProfile({...profile, cardExpireYear: text ? Number(text) : 0})}
                        placeholder="AAAA"
                        keyboardType="numeric"
                        maxLength={4}
                    />
                </View>
            </View>

            <Text style={styles.label}>Codice di Sicurezza</Text>
            <TextInput
                style={styles.input}
                value={profile.cardCVV}
                onChangeText={(text) => setProfile({...profile, cardCVV: text})}
                placeholder="123"
                keyboardType="numeric"
                maxLength={3}
            />

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.saveButtonText}>Salva Profilo</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveButton, {backgroundColor: '#3498db', marginTop: 10}]}
                    onPress={resetFirstLaunch}
                >
                    <Text style={styles.saveButtonText}>Resetta First Launch</Text>
                </TouchableOpacity>


                {saving &&
                    <View style={styles.savingIndicator}>
                        <ActivityIndicator color="white" size="small" />
                        <Text style={styles.savingText}>Salvataggio in corso...</Text>
                    </View>
                }

                {successVisible &&
                    <View style={styles.successToast}>
                        <Ionicons name="checkmark-circle" size={24} color="#fff" />
                        <Text style={styles.successText}>{successMessage}</Text>
                    </View>
                }
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white',
    },
    sessionInfo: {
        backgroundColor: '#323232',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    sessionText: {
        color: '#fff',
        fontSize: 12,
    },
    buttonsContainer: {
        marginVertical: 16,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    greetingTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#333',
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: 'tomato',
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#666',
    },
    input: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInputContainer: {
        width: '48%',
    },
    halfInput: {
        height: 40,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    saveButton: {
        backgroundColor: 'tomato',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    logoutButton: {
        backgroundColor: 'red',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastOrderContainer: {
        marginTop: 30,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 20,
    },
    lastOrderText: {
        fontSize: 16,
        marginBottom: 5,
    },
    viewOrderButton: {
        backgroundColor: '#333',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 15,
    },
    viewOrderButtonText: {
        color: 'white',
        fontSize: 14,
    },
    savingIndicator: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1000,
    },
    savingText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 14,
    },
    successToast: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000,
    },
    successText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
