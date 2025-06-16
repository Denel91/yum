import {View, StyleSheet, Text} from 'react-native';
import {Link, Stack} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import COLORS from '../constants/Colors';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{title: 'Oops! Not Found', headerBackTitle: 'Menu', headerStyle: {backgroundColor: COLORS.primary},headerTintColor: COLORS.textInvert,}}/>
            <View style={styles.container}>
                <Ionicons name="fast-food-outline" size={150} color={COLORS.accent} style={styles.icon}/>
                <Text style={styles.title}>Oops! Pagina non trovata</Text>
                <Link href="/" style={styles.button}>
                    Torna al Menu Principale
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.textInvert,
        marginBottom: 20,
    },
    button: {
        fontSize: 20,
        textDecorationLine: 'underline',
        color: COLORS.accent,
    },
    icon: {
        marginBottom: 20,
    },
});

