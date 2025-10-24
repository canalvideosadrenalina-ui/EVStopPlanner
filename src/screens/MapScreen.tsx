import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';

/////////////////////////////////////////////////////////
// ðŸ”‘ COLA TUA CHAVE AQUI ENTRE ASPAS
const GOOGLE_API_KEY = 'AIzaSyAx3zyWR6tOq7P9c4qBB4QFH6yJaDBmDv0';
/////////////////////////////////////////////////////////

export default function MapScreen() {
  const [region, setRegion] = useState(null);
  const [chargingStations, setChargingStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [routeCoords, setRouteCoords] = useState([]);
  const [batteryLevel, setBatteryLevel] = useState(75);
  const [rangeKm, setRangeKm] = useState(175);

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        });
        fetchChargingStations(latitude, longitude);
      },
      error => {
        Alert.alert('Erro ao obter localizaÃ§Ã£o', error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }, []);

  const fetchChargingStations = async (lat, lon) => {
    try {
      const radius = 50000;
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=charging_station&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.results) {
        const stations = data.results.map((item, index) => ({
          id: index,
          name: item.name,
          lat: item.geometry.location.lat,
          lon: item.geometry.location.lng,
          address: item.vicinity,
          rating: item.rating || 0,
        }));
        setChargingStations(stations);
      }
    } catch (error) {
      console.error('Erro ao buscar eletropostos:', error);
    } finally {
      setLoading(false);
    }
  };

  const decodePolyline = (encoded) => {
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return points;
  };

  const planSmartRoute = async () => {
    if (!region || chargingStations.length === 0) {
      Alert.alert('Nenhum ponto de recarga encontrado.');
      return;
    }

    const destination = chargingStations[0];
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${region.latitude},${region.longitude}&destination=${destination.lat},${destination.lon}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoords(points);
        Alert.alert('Rota gerada!', `Destino: ${destination.name}`);
      } else {
        Alert.alert('Erro', 'NÃ£o foi possÃ­vel criar a rota.');
      }
    } catch (error) {
      console.error('Erro ao gerar rota:', error);
    }
  };

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          customMapStyle={darkMapStyle}
          region={region}
          showsUserLocation={true}
        >
          {chargingStations.map((st) => (
            <Marker
              key={st.id}
              coordinate={{ latitude: st.lat, longitude: st.lon }}
              title={st.name}
              description={st.address || 'Ponto de recarga elÃ©trica'}
            />
          ))}
          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#2ECC71" />
          )}
        </MapView>
      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2ECC71" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Obtendo localizaÃ§Ã£o...</Text>
        </View>
      )}

      <View style={styles.topButtons}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#2C3E50' }]}> 
          <Text style={styles.buttonText}>DETALHES DO PLANO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#C0392B' }]}> 
          <Ionicons name="warning" color="#fff" size={16} />
          <Text style={styles.buttonText}> ROUBO E FURTO</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.panel}>
        <Text style={styles.vehicleName}>RIO-2A19</Text>
        <Text style={styles.autonomy}>Autonomia: {rangeKm} km</Text>
        <View style={styles.batteryContainer}>
          <Ionicons name="battery-half" size={48} color="#2ECC71" />
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
        </View>
        <TouchableOpacity style={styles.routeButton} onPress={planSmartRoute}>
          <Text style={styles.routeButtonText}>CRIAR ROTAS COM PARADAS DE CARREGAMENTO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.locationButton}>
          <Ionicons name="location" size={18} color="#fff" />
          <Text style={styles.locationButtonText}> LOCALIZAÃ‡ÃƒO</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>ðŸ“ PatrocÃ­nio: Canal Eletrificados YouTube</Text>
      </View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#212121' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { ...StyleSheet.absoluteFillObject },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  topButtons: { position: 'absolute', top: 50, flexDirection: 'row', justifyContent: 'space-around', width: '100%', zIndex: 10 },
  button: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
  panel: { position: 'absolute', bottom: 100, width: '100%', backgroundColor: 'rgba(25,25,25,0.9)', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  vehicleName: { fontSize: 20, color: '#fff', textAlign: 'center', fontWeight: '700' },
  autonomy: { fontSize: 16, color: '#aaa', textAlign: 'center', marginTop: 5 },
  batteryContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
  batteryText: { color: '#2ECC71', fontSize: 22, marginLeft: 10 },
  routeButton: { backgroundColor: '#34495E', padding: 12, borderRadius: 10, marginVertical: 5 },
  routeButtonText: { color: '#fff', fontSize: 13, textAlign: 'center' },
  locationButton: { backgroundColor: '#27AE60', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 14, borderRadius: 12, marginVertical: 10 },
  locationButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' },
  footerText: { color: '#2ECC71' },
});
