import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { crearFichaje, obtenerFichajes } from '../servicios/api';
import * as Location from 'expo-location';
import { useAutenticacion } from '../contexto/Autenticacion';


export default function PantallaFichaje() {
    const {usuario, logout} = useAutenticacion();

    const [cargando, setCargando]= useState(false);
    const [fichaje, setFichaje] = useState<any[]>([]);
    const [cargardoFichaje, setCargardoFichaje] = useState(true);

    //carga el historial de fichajes al entrar en la pantalla
    useEffect(() =>{
        cargarFichaje();
    },[]);

    async function cargarFichaje() {
        try{
            setCargardoFichaje(true);
            const respuesta = await obtenerFichajes();
            setFichaje(respuesta.data);
        }catch(error: any){
            console.log('Error cargando el fichaje: ',error);
        }finally{
            setCargardoFichaje(false);
        }
    }

    async function manejarFichaje(tipo: 'CLOCK_IN'| 'CLOCK_OUT') {
        setCargando(true);

        try{
            //pedir el permiso de ubicación
            const { status } = await Location.requestForegroundPermissionsAsync();

            if(status !== 'granted'){
                Alert.alert('Error', 'Es necesario el acceso a tu ubucación para fichar');
                return;
            }

            //obtener la ubicación actual
            const ubicacion = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const { latitude, longitude } = ubicacion.coords;

            console.log('Coordenada actual: ', latitude, longitude);

            //enviar el fichaje al backend
            await crearFichaje(tipo, latitude, longitude);

            Alert.alert('Fichaje registrado', tipo==='CLOCK_IN' ? 'Entrada registrada correctamente': 'Salida registrada correctamente');

            //recargar el historial
            await cargarFichaje();
        }catch(error: any){
            const mensaje = error.response?.data?.mensaje || 'Error al registrar el fichaje';
            Alert.alert('Fichaje rechazado', mensaje);
        }finally{
            setCargando(false);
        }
    }

    //Determina el tipo del proximo fichaje dependiendo del ultimo registrado
    function obtenerProximoTipo(): 'CLOCK_IN' |'CLOCK_OUT'{

        if(fichaje.length === 0) return 'CLOCK_IN';

        //ordena por fecha para obtener el mas reciente
        const ordenar = [...fichaje].sort(
            (a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        return ordenar[0].type === 'CLOCK_IN' ? 'CLOCK_OUT':'CLOCK_IN';
    }

    const proximoFichaje = obtenerProximoTipo();

    return (
        <View style={styles.contenedor}>
            {/*Cabecera*/}
            <View style={styles.cabecera}>
                <Text style={styles.titulo}>Hola, {usuario?.nombre}</Text>
                <TouchableOpacity onPress={logout}>
                    <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>

            {/*Boton de fichaje*/}
            <View style={styles.contenedorBtn}>
                <TouchableOpacity style={[styles.btnFichaje, {backgroundColor: proximoFichaje === 'CLOCK_IN' ? '#4CAF50':'#F44336'},
                ]}
                onPress={() => manejarFichaje(proximoFichaje)}
                disabled={cargando}
                >
                    {cargando ? (
                        <ActivityIndicator color='#fff' size='large'/>
                    ):(
                        <>
                        <Text style={styles.textoBtn}>
                            {proximoFichaje === 'CLOCK_IN' ? 'Fichar Entrada': 'Fichar Salida'}
                        </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/*historial de los fichajes*/}
            <Text style={styles.tituloHistorial}>Ultimos Fichajes</Text>

            {cargardoFichaje ? (
                <ActivityIndicator/>
            ):(
                <FlatList
                data={fichaje}
                keyExtractor={(item) => item._id}
                renderItem={({item})=> (
                    <View style={styles.itemFichaje}>
                        <Text style={styles.tipoFichaje}>
                            {item.type === 'CLOCK_IN' ? 'Entrada' : 'Salida'}
                        </Text>
                        <Text style={styles.fechaFichaje}>
                            {new Date(item.timestamp).toLocaleString('es-ES')}
                        </Text>
                        <Text style={styles.distancia}>
                            {item.distanceFromCenterMeters}m del centro
                        </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.sinFichaje}>No hay Fichajes registrados</Text>
                }></FlatList>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor:{flex: 1, backgroundColor:'#f5f5f5', paddingTop: 50},
    cabecera:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 32 },
    titulo:{ fontSize: 20, fontWeight: 'bold', color: '#1a1a2e'},
    cerrarSesion:{ color: '#f44336', fontSize: 14},
    contenedorBtn:{ alignItems: 'center', marginBottom: 40},
    btnFichaje:{ width: 200, height: 200, borderRadius: 100, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4},
    textoBtn:{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
    tituloHistorial:{ fontSize: 18, fontWeight: 'bold', paddingHorizontal: 24, marginBottom: 12, color: '#1a1a2e'},
    itemFichaje:{ backgroundColor: '#fff', marginHorizontal: 24, marginBottom: 8, padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#4CAF50'},
    tipoFichaje:{ fontSize: 16, fontWeight: 'bold', color: '#1a1a2e'},
    fechaFichaje:{ fontSize: 14, color: '#666', marginTop: 4},
    distancia:{ fontSize: 12, color: '#999', marginTop: 2},
    sinFichaje:{ textAlign: 'center', color: '#999', marginTop: 20},
})