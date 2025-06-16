import React from 'react';
import { Stack } from 'expo-router';
import MenuDetailScreen from '../../screens/MenuDetailScreen';

export default function MenuDetailRoute() {
    return (
        <>
            <Stack.Screen
                options={{
                    title: 'Dettagli Menu',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerBackTitle: 'Menu'
                }}
            />
            <MenuDetailScreen />
        </>
    );
}
