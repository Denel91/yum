import {useState, useEffect} from 'react';
import {View, Text, Image, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert} from 'react-native';
import {useLocalSearchParams, router} from 'expo-router';
import * as api from '../services/api';
import useSessionStore from '../store/useSessionStore';
import {getData, getMenuImage, saveMenuImage} from '../services/storage';
import {Ionicons} from '@expo/vector-icons';
import COLORS from "../constants/Colors";

const MenuDetailScreen = () => {
    const {mid} = useLocalSearchParams();
    const [menuDetails, setMenuDetails] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [location, setLocation] = useState(null);
    const [deletingOrder, setDeletingOrder] = useState(false);
    const [deletingAllOrders, setDeletingAllOrders] = useState(false);
    const sid = useSessionStore((state) => state.sid);

    // Funzione per recuperare la posizione da AsyncStorage
    const getLocationFromStorage = async () => {
        try {
            const locationData = await getData('location');
            if (locationData) {
                const parsedLocation = JSON.parse(locationData);
                setLocation(parsedLocation);
                return parsedLocation;
            }
            return null;
        } catch (error) {
            console.error('Errore nel recupero della posizione da AsyncStorage:', error);
            return null;
        }
    };

    // Verifica se abbiamo già i dati nella cache locale
    const checkLocalCache = async () => {
        try {
            // Controlla se abbiamo l'immagine in cache
            const cachedImage = await getMenuImage(mid);
            if (cachedImage && cachedImage.imageData) {
                console.log('Immagine recuperata dalla cache locale');
                setImageData(cachedImage.imageData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Errore nel recupero dati dalla cache:', error);
            return false;
        }
    };

    // Funzione per eliminare l'ultimo ordine
    const handleDeleteLastOrder = async () => {
        try {
            // Mostra un dialogo di conferma
            Alert.alert(
                "Elimina ultimo ordine",
                "Sei sicuro di voler eliminare l'ultimo ordine effettuato?",
                [
                    {
                        text: "Annulla",
                        style: "cancel"
                    },
                    {
                        text: "Elimina",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                setDeletingOrder(true);
                                const result = await api.deleteLastOrder(sid);

                                if (result.success) {
                                    Alert.alert(
                                        "Ordine eliminato",
                                        "L'ultimo ordine è stato eliminato con successo.",
                                        [{ text: "OK" }]
                                    );
                                } else {
                                    Alert.alert(
                                        "Errore",
                                        "Non è stato possibile eliminare l'ordine.",
                                        [{ text: "OK" }]
                                    );
                                }
                            } catch (error) {
                                console.error('Errore durante l\'eliminazione dell\'ordine:', error);
                                Alert.alert(
                                    "Errore",
                                    "Si è verificato un errore durante l'eliminazione dell'ordine.",
                                    [{ text: "OK" }]
                                );
                            } finally {
                                setDeletingOrder(false);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Errore durante l\'eliminazione dell\'ordine:', error);
        }
    };

    // Funzione per eliminare tutti gli ordini uno per uno
    const handleDeleteAllOrders = async () => {
        try {
            // Mostra un dialogo di conferma
            Alert.alert(
                "Elimina tutti gli ordini",
                "Sei sicuro di voler eliminare TUTTI gli ordini effettuati? Questa azione non può essere annullata.",
                [
                    {
                        text: "Annulla",
                        style: "cancel"
                    },
                    {
                        text: "Elimina tutti",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                setDeletingAllOrders(true);

                                // Continua a eliminare l'ultimo ordine finché non ci sono più ordini
                                let hasMoreOrders = true;
                                let count = 0;

                                while (hasMoreOrders) {
                                    try {
                                        const result = await api.deleteLastOrder(sid);

                                        if (result.success) {
                                            count++;
                                            console.log(`Ordine #${count} eliminato con successo`);
                                        } else {
                                            // Se la risposta non ha successo, usciamo dal ciclo
                                            hasMoreOrders = false;
                                        }
                                    } catch (error) {
                                        console.error(`Errore durante l'eliminazione dell'ordine #${count + 1}:`, error);

                                        // Se l'errore è 404 (ordine non trovato), significa che non ci sono più ordini
                                        if (error.response && error.response.status === 404) {
                                            hasMoreOrders = false;
                                        } else {
                                            // Altri errori, interrompiamo l'operazione
                                            throw error;
                                        }
                                    }
                                }

                                if (count > 0) {
                                    Alert.alert(
                                        "Ordini eliminati",
                                        `${count} ordine/i eliminato/i con successo.`,
                                        [{ text: "OK" }]
                                    );
                                } else {
                                    Alert.alert(
                                        "Nessun ordine",
                                        "Non ci sono ordini da eliminare.",
                                        [{ text: "OK" }]
                                    );
                                }
                            } catch (error) {
                                console.error('Errore durante l\'eliminazione degli ordini:', error);
                                Alert.alert(
                                    "Errore",
                                    "Si è verificato un errore durante l'eliminazione degli ordini.",
                                    [{ text: "OK" }]
                                );
                            } finally {
                                setDeletingAllOrders(false);
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Errore durante l\'eliminazione di tutti gli ordini:', error);
        }
    };



    useEffect(() => {
        const loadMenuDetails = async () => {
            if (!mid || !sid) return;

            try {
                setLoading(true);

                // Prima verifica se abbiamo già i dati in cache
                const hasCachedData = await checkLocalCache();

                // Recupera la posizione da AsyncStorage
                const locationData = await getLocationFromStorage();

                if (!locationData || !locationData.latitude || !locationData.longitude) {
                    throw new Error('Posizione non disponibile');
                }

                // Carica i dati in parallelo invece che in sequenza
                const [detailsResult, imageResult] = await Promise.all([
                    api.getMenuDetails(
                        mid,
                        locationData.latitude,
                        locationData.longitude,
                        sid
                    ),
                    // Carica l'immagine solo se non l'abbiamo già in cache
                    hasCachedData ? Promise.resolve(null) : api.getMenuImage(mid, sid)
                ]);

                setMenuDetails(detailsResult);

                // Salva l'immagine se l'abbiamo caricata dal server
                if (!hasCachedData && imageResult) {
                    setImageData(imageResult.data);
                    // Salva l'immagine nella cache locale per usi futuri
                    await saveMenuImage(mid, imageResult.data);
                }

                setLoading(false);
            } catch (err) {
                console.error(`Errore nel caricamento dei dettagli per il menu ${mid}:`, err);
                setError(true);
                setLoading(false);
            }
        };

        loadMenuDetails();
    }, [mid, sid]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f5a442" />
                <Text style={styles.loadingText}>Caricamento dettagli menu...</Text>
            </View>
        );
    }

    if (error || !menuDetails) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={60} color="#f5a442" />
                <Text style={styles.errorText}>Impossibile caricare i dettagli del menu</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Torna indietro</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.imageContainer}>
                {imageData ? (
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${imageData}` }}
                        style={styles.menuImage}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.menuImage, styles.errorImage]}>
                        <Text>Immagine non disponibile</Text>
                    </View>
                )}
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.menuTitle}>{menuDetails.name}</Text>

                <View style={styles.infoRow}>
                    <View style={styles.priceContainer}>
                        <Ionicons name="pricetag-outline" size={18} color="#f5a442" style={styles.icon} />
                        <Text style={styles.menuPrice}>{menuDetails.price} €</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={18} color="#888" style={styles.icon} />
                        <Text style={styles.menuDeliveryTime}>{menuDetails.deliveryTime} min</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descrizione</Text>
                    <Text style={styles.description}>{menuDetails.longDescription || menuDetails.shortDescription}</Text>
                </View>

                <TouchableOpacity
                    style={styles.orderButton}
                    onPress={ async () => {
                        try {

                            // Verifica che la posizione sia disponibile
                            if (!location || !location.latitude || !location.longitude) {
                                alert('Posizione non disponibile. Impossibile completare l\'ordine.');
                                return;
                            }

                            const orderResult = await api.orderMenu(sid, mid, location);
                            console.log(orderResult);

                            console.log(`Ordine completato per il menu ${menuDetails.name} con ID ${mid}`);

                        } catch (error) {
                            console.error('Errore nell\'ordinazione del menu:', error.response.data);
                            alert('Errore nell\'ordinazione del menu. Riprova più tardi.');
                        }

                    }}>
                    <Text style={styles.orderButtonText}>Ordina Ora</Text>
                    <Ionicons name="cart-outline" size={22} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteOrderButton}
                    onPress={handleDeleteLastOrder}
                    disabled={deletingOrder}
                >
                    {deletingOrder ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.deleteOrderButtonText}>Elimina Ultimo Ordine</Text>
                            <Ionicons name="trash-outline" size={22} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.deleteAllOrdersButton}
                    onPress={handleDeleteAllOrders}
                    disabled={deletingAllOrders}
                >
                    {deletingAllOrders ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <>
                            <Text style={styles.deleteAllOrdersButtonText}>Elimina Tutti gli Ordini</Text>
                            <Ionicons name="trash-bin-outline" size={22} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>


            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    errorText: {
        marginTop: 15,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#f5a442',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    backButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#f2f2f2',
    },
    menuImage: {
        width: '100%',
        height: '100%',
    },
    errorImage: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        padding: 16,
    },
    menuTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff8e5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        marginRight: 10,
    },
    menuPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f5a442',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    menuDeliveryTime: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    ingredientsList: {
        marginTop: 5,
    },
    ingredientItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    ingredientText: {
        fontSize: 15,
        color: '#555',
    },
    allergeniText: {
        fontSize: 15,
        color: '#d32f2f',
        lineHeight: 22,
    },
    orderButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    orderButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 8,
    },
    icon: {
        marginRight: 5,
    },
    deleteOrderButton: {
        backgroundColor: COLORS.error,
        borderRadius: 10,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteOrderButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 8,
    },
    deleteAllOrdersButton: {
        backgroundColor: '#d32f2f', // Rosso più scuro per enfatizzare l'azione più pericolosa
        borderRadius: 10,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteAllOrdersButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
});

export default MenuDetailScreen;


