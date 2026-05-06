import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { View, Text, Alert, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import MapView, { MapPressEvent, Marker } from 'react-native-maps';
import { api } from '../../servicios/api';

const GOOGLE_API_KEY = 'AIzaSyBiIZzQ2voRwshISklX1Qar-Dc3VCNgIO8';

export default function PantallaAsignarUbicacion() {

    const navegacion = useNavigation<any>();
    const ruta = useRoute<any>();
    const { empleado } = ruta.params;

    const [coordenadas, setCoordenadas]= useState<{latitude: number; longitude: number} | null>(null);
    const [ nombreUbicacion, setNombreUbicacion ] = useState('');
    const [ guardando, setGuardando ] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [ sugerencias, setSugerencias] = useState<any[]>([]);
    const [ buscando, setBuscando ] = useState(false);
    const temporizador = useRef<any>(null);

    const mapaRef = useRef<MapView>(null);

    //llamada a la API de Google Places
    async function buscarSugerencia(texto: string) {
        setBusqueda(texto);

        //Cancela la busqueda si se sigue escribiendo
        if(temporizador.current) clearTimeout(temporizador.current);

        if(texto.length <3 ){
            setSugerencias([]);
            return;
        }

        //espera 100ms despues de escribir
        temporizador.current = setTimeout(async () => {
            setBuscando(true);
            try {
                const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(texto)}&language=es&key=${GOOGLE_API_KEY}`;
                const respuesta = await fetch(url);
                const datos = await respuesta.json();
                setSugerencias(datos.predictions || []);
            } catch (error) {
                console.log('Error buscando:', error);
            } finally {
                setBuscando(false);
            }
        },100);
    }

    //funcion para la seleccion del usuario al seleccioinar una sugerencia
    async function seleccion(lugar: any){
        setSugerencias([]);
        setBusqueda(lugar.description);
        setNombreUbicacion(lugar.structured_formatting?.main_text || lugar.description);

        try {
            // Obtener las coordenadas del lugar seleccionado
            const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${lugar.place_id}&fields=geometry&key=${GOOGLE_API_KEY}`;
            const respuesta = await fetch(url);
            const datos = await respuesta.json();
            const { lat, lng } = datos.result.geometry.location;

            setCoordenadas({ latitude: lat, longitude: lng });

            mapaRef.current?.animateToRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron obtener las coordenadas del lugar');
        }
    }

    //funcion para que el admin seleccione la ubicación
    function manejarToque(evento: MapPressEvent){
        setCoordenadas(evento.nativeEvent.coordinate);
        setSugerencias([]);
    }

    async function guardarYAsignar() {
        if(!coordenadas){
            Alert.alert('Error','Por favor selecciona un punto en el mapa');
            return;
        }

        if(!nombreUbicacion.trim()){
            Alert.alert('Error', 'Por favor introduce un nombre para la ubicación.');
            return;
        }

        setGuardando(true);
        try{
            //crear la ubicacion en el backend
            const respuestaUbicacion = await api.post('/locations', {
                name: nombreUbicacion,
                latitude: coordenadas.latitude,
                longitude: coordenadas.longitude,
                radiusMeters: 100,
            });

            const locationId = respuestaUbicacion.data.data._id;

            //asignacion de la ubicacion al empleado
            await api.patch(`/employees/${empleado._id}/location`, {locationId});

            Alert.alert('Exito', `Ubicación "${nombreUbicacion}" asignada a ${empleado.fullName}`,
                [{ text: 'OK', onPress: () => navegacion.goBack()}]
            );
        }catch(error: any){
            const mensaje = error.response?.data?.mensaje || 'Error al guardar la ubicación';
            Alert.alert('Error', mensaje);
        }finally{
            setGuardando(false);
        }
    }

    return (
        <KeyboardAvoidingView style={styles.contenedor} behavior={Platform.OS==='ios'?'padding':undefined}>
            <Text style={styles.subtitulo}>
                Asignando ubicación a: <Text style={styles.nombreEmpleado}>{empleado.fullName}</Text>
            </Text>

            {/*Buscador*/}
            <View style={styles.contenedorBuscador}>
                <View style={styles.filaBusqueda}>
                    <TextInput
                    style={styles.inputBuscador}
                    placeholder='Buscar dirección...'
                    value={busqueda}
                    onChangeText={buscarSugerencia}/>
                    {buscando && <ActivityIndicator style={styles.indicador} color='#4CAF50'/>}
                </View>

                {/* Lista sugerencias*/}
                {sugerencias.length > 0 && (
                    <FlatList
                    style={styles.listaSugerencias}
                    data={sugerencias}
                    keyExtractor={(item) => item.place_id}
                    keyboardShouldPersistTaps="handled"
                    renderItem={({item}) => (
                        <TouchableOpacity style={styles.sugerencias} onPress={() => seleccion(item)}>
                            <Text style={styles.textoSugerencias}>{item.description}</Text>
                        </TouchableOpacity>
                    )}/>
                )}
            </View>

            {/*Mapa*/}
            <MapView
            ref={mapaRef}
            style={styles.mapa}
            initialRegion={{
                latitude: 40.4168,
                longitude:-37038,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
            onPress={manejarToque}>
                {coordenadas && (
                    <Marker coordinate={coordenadas} title='Ubicación seleccionada'/>
                )}
            </MapView>

            {/*Introduccion*/}
            <Text style={styles.introduccion}>
                {coordenadas?.latitude && coordenadas?.longitude
                ? `📍 Punto seleccionado: ${coordenadas.latitude.toFixed(4)}, ${coordenadas.longitude.toFixed(4)}`
            : 'Toca el mapa para seleccionar la ubicación'}
            </Text>

            {/*Input nombre*/}
            <TextInput style={styles.input} placeholder='Nombre de la ubicación (ej: sede Central)' value={nombreUbicacion} onChangeText={setNombreUbicacion}/>

            {/*boton guardar*/}
            <TouchableOpacity 
            style={[styles.btnGuardar, (!coordenadas || !nombreUbicacion) && styles.btnDesactivar]}
            onPress={guardarYAsignar}
            disabled={guardando || !coordenadas || !nombreUbicacion}>
                {guardando ? (
                    <ActivityIndicator color='#fff'/>
                ):(
                    <Text style={styles.textobtn}>Guardar y asignar</Text>
                )}
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: '#f5f5f5'},
    subtitulo: { fontSize: 16, padding: 16,paddingTop: 12, paddingBottom: 4, color: '#666'},
    nombreEmpleado: { fontWeight: 'bold', color: '#1a1a2e'},
    inputBuscador: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 14, paddingHorizontal: 12},
    contenedorBuscador: { marginHorizontal: 16, marginBottom: 4, zIndex: 10},
    listaSugerencias: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd'},
    filaSugerencias: { padding: 12},
    textoSugerencias: { fontSize: 14, color: '#1a1a2e'},
    mapa: { flex: 1},
    introduccion: { textAlign: 'center', padding: 12, color: '#666', fontSize: 13},
    input: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 15},
    btnGuardar: { backgroundColor: '#4CAF50', marginHorizontal: 16, marginBottom: 24, padding: 16, borderRadius: 8, alignItems: 'center'},
    btnDesactivar: {backgroundColor: '#aaa'},
    textobtn: { color: '#fff', fontSize: 16, fontWeight: 'bold'},
    filaBusqueda: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8},
    inputBusqueda: { flex: 1, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ddd', padding: 12, fontSize: 15},
    btnBuscar: { backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center'},
    textoBuscar: {fontSize: 18},
    indicador: { marginLeft: 8},
    sugerencias: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'}
});