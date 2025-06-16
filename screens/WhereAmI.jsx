import {useState, useEffect} from "react";
import {Text, View, StyleSheet} from "react-native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Ionicons} from "@expo/vector-icons";

const API_KEY = "AIzaSyC0925hGIiVxJQOQy3xXA2bYgXbum73-7E";
const URL = `https://maps.google.com/maps/api/geocode/json?key=${API_KEY}&latlng=`;

export default function WhereAmI() {
    const [address, setAddress] = useState("Loading...");
    const [longitude, setLongitude] = useState(0);
    const [latitude, setLatitude] = useState(0);
    const [savedLocation, setSavedLocation] = useState({latitude: null, longitude: null});

    // Funzione per ottenere l'indirizzo da coordinate
    async function getAddressFromCoordinates(latitude, longitude) {
        try {
            const response = await fetch(`${URL}${latitude},${longitude}`);
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                const formattedAddress = data.results[0].formatted_address;
                setAddress(formattedAddress);
                console.log("Indirizzo ottenuto:", formattedAddress);
            } else {
                console.log("Nessun risultato trovato nell'API di geocoding");
                setAddress("Indirizzo non disponibile");
            }
        } catch (error) {
            console.log("Errore nel recupero dell'indirizzo:", error);
        }
    }

    async function getLocation() {
        try {
            const location = await AsyncStorage.getItem("location");
            console.log("Dati recuperati da AsyncStorage:", location);
            if (location !== null) {
                const parsedLocation = JSON.parse(location);
                setSavedLocation(parsedLocation);
                console.log("Dati recuperati:", parsedLocation);

                // Imposta latitude e longitude se non sono già stati impostati
                if (latitude === 0 && longitude === 0) {
                    setLatitude(parsedLocation.latitude);
                    setLongitude(parsedLocation.longitude);

                    // Ottieni l'indirizzo dalle coordinate salvate
                    await getAddressFromCoordinates(parsedLocation.latitude, parsedLocation.longitude);
                }
            } else {
                console.log("Nessun dato trovato");
            }
        } catch (error) {
            console.log("Errore nel recupero dei dati:", error);
        }
    }

    async function saveLocation(latitude, longitude) {
        try {
            await AsyncStorage.setItem("location", JSON.stringify({latitude, longitude}));
            console.log("Dati salvati con successo");
        } catch (error) {
            console.log("Errore nel salvataggio dei dati:", error);
        }
    }

    useEffect(() => {
        // Chiamiamo getLocation all'avvio per recuperare la posizione salvata
        getLocation();

        function setPosition({coords: {latitude, longitude}}) {
            setLongitude(longitude);
            setLatitude(latitude);

            saveLocation(latitude, longitude);

            fetch(`${URL}${latitude},${longitude}`)
                .then((resp) => resp.json())
                .then(({results}) => {
                    // Verifica che i risultati esistano e contengano almeno un elemento
                    if (results && results.length > 0) {
                        // Estrai l'indirizzo formattato dal primo risultato
                        const formattedAddress = results[0].formatted_address;
                        setAddress(formattedAddress);
                        console.log("Indirizzo ottenuto:", formattedAddress);
                    } else {
                        console.log("Nessun risultato trovato nell'API di geocoding");
                        setAddress("Indirizzo non disponibile");
                    }
                })
                .catch((error) => {
                    console.log(error.message);
                });
        }

        let watcher;

        (async () => {
            let {status} = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setAddress("Permesso di localizzazione non concesso");
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setPosition(location);

            watcher = await Location.watchPositionAsync(
                {accuracy: Location.LocationAccuracy.Highest},
                setPosition
            );
        })();

        return () => {
            if (watcher) {
                watcher.remove();
            }
        };
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.addressContainer}>
                <View style={styles.iconContainer}>
                    <Ionicons name="location" size={24} color="#f5a442"/>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.addressLabel}>La tua posizione:</Text>
                    <Text style={styles.addressText}>{address}</Text>
                </View>
            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    addressContainer: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },
    iconContainer: {
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    addressText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
});


