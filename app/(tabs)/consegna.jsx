import {View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

export default function Delivery() {
    return (
        <View style={{flex: 1}}>
            <MapView
                style={{flex: 1}}
                initialRegion={{
                    latitude: 46.056428900480256,
                    longitude: 13.218224589685919,
                    latitudeDelta: 0.1,
                    longitudeDelta: 0.1,
                }}
            >
                <Marker
                    coordinate={{latitude: 46.056428900480256, longitude: 13.218224589685919}}
                    title={"Consegna"}
                    description={"Descrizione della consegna"}
                />
            </MapView>
        </View>
    );
}
