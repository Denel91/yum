import React, { useState, useEffect } from 'react';
import { TouchableOpacity, View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import * as api from '../services/api';
import useSessionStore from '../store/useSessionStore';
import {Ionicons} from "@expo/vector-icons";
import COLORS from "../constants/Colors";

const MenuItemCard = ({ item }) => {
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const sid = useSessionStore((state) => state.sid);

    useEffect(() => {
        const loadMenuImage = async () => {
            if (!item.mid || !sid) return;

            try {
                setLoading(true);
                const result = await api.getMenuImage(item.mid, sid);
                setImageData(result.data);
                setLoading(false);
            } catch (err) {
                console.error(`Errore nel caricamento dell'immagine per ${item.name}:`, err);
                setError(true);
                setLoading(false);
            }
        };

        loadMenuImage();

    }, [item.mid, sid]);

    return (
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push(`/menu/${item.mid}`)}>
            <View style={styles.menuImageContainer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#0000ff" style={styles.menuImage} />
                ) : error ? (
                    <View style={[styles.menuImage, styles.errorImage]}>
                        <Text style={styles.errorText}>Immagine non disponibile</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: `data:image/jpeg;base64,${imageData}`}}
                        style={styles.menuImage}
                        resizeMode="cover"
                    />
                )}
            </View>
            <View style={styles.menuInfo}>
                <Text style={styles.menuTitle} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
                <Text style={styles.menuDescription} numberOfLines={3} ellipsizeMode="tail">{item.shortDescription}</Text>
                <View style={styles.priceDeliveryContainer}>
                    <View style={styles.priceContainer}>
                        <Ionicons name="pricetag-outline" size={16} color="#f5a442" style={styles.icon} />
                        <Text style={styles.menuPrice}>{item.price} €</Text>
                    </View>
                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={16} color="#888" style={styles.icon} />
                        <Text style={styles.menuDeliveryTime}>{item.deliveryTime} min</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    menuItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.background,
        borderRadius: 10,
        marginVertical: 12,
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
        width: '100%', // La card occupa tutta la larghezza dello schermo
        height: 180,
    },
    menuImageContainer: {
        width: '40%', // L'immagine occupa il 40% della larghezza
        height: '100%',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        overflow: 'hidden',
        backgroundColor: COLORS.card,
    },
    menuImage: {
        width: '100%',
        height: '100%',
    },
    menuInfo: {
        width: '60%', // Le informazioni occupano il 60% della larghezza
        paddingVertical: 8,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
        color: COLORS.text,
    },
    menuDescription: {
        fontSize: 14,
        color: COLORS.textLight,
        marginBottom: 8,
        lineHeight: 18,
    },
    priceDeliveryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
    },
    menuPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.card,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
    },
    menuDeliveryTime: {
        fontSize: 14,
        color: COLORS.text,
    },
    errorImage: {
        backgroundColor: COLORS.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        marginRight: 5,
    }
});

export default MenuItemCard;

