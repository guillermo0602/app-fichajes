import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { api } from '../../servicios/api';
import { useAutenticacion } from '../../contexto/Autenticacion';

export default function PantallaEmpleado() {

    const navegacion = useNavigation<any>();
    const [empleados, setEmpleados] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    const {usuario, logout}=useAutenticacion();

    useEffect (() => {
        cargarEmpleados();
    },[]);

    async function cargarEmpleados() {
        try{
            setCargando(true);
            const respuesta = await api.get('/employees');
            setEmpleados(respuesta.data.data);
        }catch(error: any){
            console.log('Error cargando empleados: ', error);
        }finally{
            setCargando(false);
        }
    }

    return (
        <View style={styles.contenedor}>
            <View style={styles.cabecera}>
                <Text style={styles.titulo}>Empleados</Text>

                <TouchableOpacity onPress={logout}>
                    <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>
            {cargando ? (
                <ActivityIndicator size="large" color='#4CAF50'/>
            ): (
                <FlatList
                data={empleados}
                keyExtractor={(item) => item._id}
                renderItem={({item})=> (
                    <TouchableOpacity style={[styles.tarjeta, item.assignedLocationId && styles.tarjetaAsignada]} 
                    onPress={() => {
                        if (item.assignedLocationId){
                            Alert.alert('Ubicación asignada',`${item.fullName} ya tieneasiganada una ubicación. ¿Que deseas hacer?`,
                                [
                                    { text: 'Cancelar', style: 'cancel'},
                                    { 
                                        text: 'Cambiar ubicación',
                                        onPress:()=> navegacion.navigate('AsignarUbicacion', {empleado: item})
                                    },
                                ]
                            );
                            return;
                        }
                        navegacion.navigate('AsignarUbicacion', {empleado: item});
                    }}>
                        <Text style={styles.nombre}>{item.fullName}</Text>
                        <Text style={styles.email}>{item.email}</Text>
                        <Text style={styles.ubicacion}>
                            {item.assignedLocationId ? 'Ubicacion asignada': 'Sin ubicación'}
                        </Text>
                        <Text style={styles.accion}>Toca para asignar ubicación</Text>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={styles.sinDatos}>No hay empleados registrados</Text>
                }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1,backgroundColor: '#f5f5f5', paddingTop: 50},
    titulo: { fontSize: 22, fontWeight: 'bold',color: '#1a1a2e'},
    tarjeta: { backgroundColor: '#fff', marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#4CAF50'},
    nombre: { fontSize: 17, fontWeight: 'bold', color: '#1a1a2e'},
    email: { fontSize: 15, color: '#666', marginTop: 4},
    ubicacion: {fontSize: 14, color: '#999', marginTop: 6},
    accion: { fontSize: 14, color: '#4CAF50', marginTop: 8},
    sinDatos: { textAlign: 'center', color: '#999', marginTop: 20},
    cerrarSesion:{ color: '#f44336', fontSize: 14},
    cabecera:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 32 },
    tarjetaAsignada: { borderLeftColor: '#aaa', opacity: 0.7},
})