import {StyleSheet, Text, View, TouchableOpacity, ScrollView} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';

export default function Impostazioni() {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>App Settings</Text>
                <TouchableOpacity style={styles.settingsItem}>
                    <FontAwesome name="language" size={24} color="#666"/>
                    <Text style={styles.settingsText}>Language</Text>
                    <FontAwesome name="chevron-right" size={24} color="#666"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <FontAwesome name="moon-o" size={24} color="#666"/>
                    <Text style={styles.settingsText}>Dark Mode</Text>
                    <FontAwesome name="chevron-right" size={24} color="#666"/>
                </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Privacy</Text>
                <TouchableOpacity style={styles.settingsItem}>
                    <FontAwesome name="lock" size={24} color="#666"/>
                    <Text style={styles.settingsText}>Privacy Settings</Text>
                    <FontAwesome name="chevron-right" size={24} color="#666"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <FontAwesome name="shield" size={24} color="#666"/>
                    <Text style={styles.settingsText}>Security</Text>
                    <FontAwesome name="chevron-right" size={24} color="#666"/>
                </TouchableOpacity>
            </View>

            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Support</Text>
                <TouchableOpacity style={styles.settingsItem}>
                    <FontAwesome name="question-circle" size={24} color="#666"/>
                    <Text style={styles.settingsText}>Help Center</Text>
                    <FontAwesome name="chevron-right" size={24} color="#666"/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsItem}>
                    <FontAwesome name="info-circle" size={24} color="#666"/>
                    <Text style={styles.settingsText}>About</Text>
                    <FontAwesome name="chevron-right" size={24} color="#666"/>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    settingsSection: {
        marginTop: 20,
        backgroundColor: '#fff',
        paddingVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#333',
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    settingsText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 15,
        color: '#333',
    },
});
