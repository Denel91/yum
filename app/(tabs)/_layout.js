import {Tabs} from 'expo-router';
import {StatusBar} from "expo-status-bar";
import AntDesign from '@expo/vector-icons/AntDesign';
import COLORS from "../../constants/Colors";

export default function TabLayout() {
    return (
        <>
            <StatusBar style="auto"/>
            <Tabs screenOptions={({route}) => ({
                tabBarIcon: ({color, size= 24}) => {
                    let iconName;

                    if (route.name === 'index') {
                        iconName = 'home';
                    } else if (route.name === 'consegna') {
                        iconName = 'car';
                    } else if (route.name === 'profilo') {
                        iconName = 'user';
                    } else if (route.name === 'impostazioni') {
                        iconName = 'setting';
                    }

                    return <AntDesign name={iconName} size={size} color={color}/>;
                },

                tabBarActiveTintColor: COLORS.primary, // Colore delle tab attive

                tabBarInactiveTintColor: COLORS.textLight, // Colore delle tab inattive

                tabBarStyle: {
                    backgroundColor: COLORS.background, // Colore di sfondo della barra delle tab
                },

                headerStyle: {
                    backgroundColor: COLORS.primary, // Colore di sfondo dell'header
                },

                headerTintColor: COLORS.textInvert, // Colore del testo nell'header

                headerTitleStyle: {
                    fontWeight: 'bold',
                },

                title: route.name === 'index' ? 'Menu' :
                    route.name.charAt(0).toUpperCase() + route.name.slice(1)
            })}
            >
                <Tabs.Screen name="index"/>
                <Tabs.Screen name="consegna"/>
                <Tabs.Screen name="profilo"/>
                <Tabs.Screen name="impostazioni"/>
            </Tabs>
        </>
    );
}

