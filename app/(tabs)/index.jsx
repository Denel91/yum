import {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet, ActivityIndicator} from 'react-native';
import * as Location from 'expo-location';
import 'expo-router/entry';
import {getMenu} from "../../services/api";
import useSessionStore from '../../store/useSessionStore';
import MenuItemCard from '../../screens/MenuItemCard';
import WhereAmI from '../../screens/WhereAmI';
// import COLORS from "../../constants/Colors";

export default function MenuListScreen() {
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const { sid, isLoading, isInitialized } = useSessionStore();

    useEffect(() => {
        // Non fare nulla se Zustand è ancora in fase di inizializzazione
        if (isLoading || !isInitialized) return;

        const fetchLocationAndMenus = async () => {
            try {
                // Chiedi il permesso di accesso alla posizione
                let {status} = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Permission to access location was denied');
                    return;
                }

                // Ottieni la posizione attuale
                let currentLocation = await Location.getCurrentPositionAsync({});
                console.log('Posizione attuale:', currentLocation);
                console.log("Coordinate:", currentLocation.coords.latitude, currentLocation.coords.longitude);
                console.log("SID:", sid);
                setLocation(currentLocation);

                // Verifica che sid sia definito
                if (!sid) {
                    console.error("SID è null o non definito!");
                    setError('Errore di autenticazione. Riprova più tardi.');
                    setLoading(false);
                    return;
                }

                // Recupera i menu vicini
                const menuData = await getMenu(
                    currentLocation.coords.latitude,
                    currentLocation.coords.longitude,
                    sid
                );
                setMenus(menuData);
            } catch (error) {
                console.error('Errore durante il recupero dei menu:', error);
                setError('Impossibile caricare i menu. Riprova più tardi.');

            } finally {
                setLoading(false);
            }
        };

        fetchLocationAndMenus();

    }, [sid,  isLoading, isInitialized]);

    return (
        <View style={styles.container}>
            <View style={styles.addressContainer}>
                <WhereAmI />
            </View>
            <Text style={styles.title}>Il meglio della tua zona</Text>
            <View style={styles.separator}/>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff"/>
            ) : error ? (
                <Text style={styles.description}>{error}</Text>
            ) : (
                <FlatList
                    data={menus}
                    keyExtractor={(item) => item.mid}
                    renderItem={({item}) => <MenuItemCard item={item} />}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    addressContainer: {
        width: '100%',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    list: {
        width: '100%',
        paddingBottom: 20,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        marginTop: 16,
    },
    separator: {
        marginVertical: 20,
        height: 2,
        width: '80%',
        backgroundColor: 'orange',
    },
    description: {
        fontSize: 18,
        color: '#666',
    },
    menuItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    menuInfo: {
        flex: 1,
        marginLeft: 16,
    },
    menuDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
});
