import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity } from 'react-native';
import { api } from '../../servicios/api';
import { Colores } from '../../colores';
import { Ionicons } from '@expo/vector-icons';

export default function PantallaUbicacion() {
    const [ ubicacion, setUbicacion ] = useState<any[]>([]);
    const [ cargando, setCargando ] = useState(true);

    useEffect(() => {
        cargandoUbicacion();
    },[]);

    async function cargandoUbicacion() {
        try{
            setCargando(true);
            const respuesta = await api.get('/locations');
            setUbicacion(respuesta.data.data);
        }catch(error){
            console.log('Error cargando ubicación: ', error);
        }finally{
            setCargando(false);
        }
    }

    async function eliminarUbicación(id: string, nombre: string) {
        Alert.alert('Eliminar ubicación', `¿Estas seguro de que quieres eliminar "${nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () =>{
                        try{
                            await api.delete(`/locations/${id}`);
                            cargandoUbicacion();
                        }catch(error: any){
                            Alert.alert('Error','No se pudo eliminar la ubicación');
                        }
                    },
                },
            ]
        );
    }
    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>Ubicaciones</Text>

            {cargando ? (
                <ActivityIndicator size='large' color='#4CAF50'/>
            ):(
                <FlatList
                data={ubicacion}
                keyExtractor={(item) => item._id}
                renderItem={({item}) => (
                    <View style={styles.tarjeta}>
                        <View style={styles.filaCabecera}>
                            <Text style={styles.nombre}>{item.name}</Text>
                            <TouchableOpacity onPress={() => eliminarUbicación(item._id, item.name)}>
                                <Ionicons name="trash-outline" style={styles.btnEliminar}/>
                            </TouchableOpacity>
                        </View>
                        <Ionicons name="location"  size={14} color={Colores.primario} marginTop={4}>
                            <Text style={styles.dato}>
                                {item.center.latitude.toFixed(4)}, {item.center.longitude.toFixed(4)}
                            </Text>
                        </Ionicons>
                        <Ionicons name="radio" size={14} color={Colores.textoBlanco} marginTop={4}>
                            <Text style={styles.dato}>
                                Radio: {item.radiusMeters} metros
                            </Text>
                        </Ionicons>
                        <Ionicons name="calendar-number-outline" size={18} color={Colores.textoBlanco}>
                            <Text style={styles.dato}>
                                {new Date(item.createdAt).toLocaleDateString('es-ES')}
                            </Text>
                        </Ionicons>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.sinDatos}>No hay ubicaciones registradas</Text>
                }/>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor:{ flex: 1, backgroundColor: Colores.fondoPrincipal, paddingTop: 50},
    titulo: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 24, marginBottom: 16, color: Colores.textoBlanco},
    tarjeta: { backgroundColor: Colores.fondoTarjeta, marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 10,borderLeftWidth:4, borderLeftColor: Colores.primario, borderWidth: 1, borderColor: Colores.borde},
    filaCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
    nombre: { fontSize: 16, fontWeight: 'bold', color: Colores.textoBlanco},
    btnEliminar: { fontSize: 20, color: Colores.textoBlanco},
    dato: { fontSize: 15, color: Colores.textoGris, marginTop: 4, },
    sinDatos: { textAlign: 'center', color: Colores.textoGris, marginTop: 20},
})