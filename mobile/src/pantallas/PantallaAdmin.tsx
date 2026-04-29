import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useAutenticacion } from '../contexto/Autenticacion';
import { api } from '../servicios/api';

export default function PantallaAdmin() {
    const { usuario, logout } = useAutenticacion();

    const [ empleado, setEmpleado ] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarEmpleado();
    },[]);

    async function cargarEmpleado() {
        try{
            setCargando(true);
            const respuesta = await api.get('/employees');
            setEmpleado(respuesta.data.data);
        }catch(error: any){
            console.log('Error cargando empleados: ',error);
        }finally{
            setCargando(false);
        }
    }
    return (
        <View style={styles.contenedor}>
            {/*cabecera*/}
            <View style={styles.cabecera}>
                <Text style={styles.titulo}>Panel Admin</Text>
                <TouchableOpacity onPress={logout}>
                    <Text style={styles.cerrarSesion}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.bienvenida}>Hola, {usuario?.nombre}</Text>
            <Text style={styles.subtitulo}>Empleados registrados</Text>


            {cargando ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                data={empleado}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={styles.tarjetaEmpleado}>
                    <Text style={styles.nombreEmpleado}>{item.fullName}</Text>
                    <Text style={styles.emailEmpleado}>{item.email}</Text>
                    <Text style={styles.ubicacion}>
                        {item.assignedLocationId
                        ? '📍 Ubicación asignada'
                        : '⚠️ Sin ubicación asignada'}
                    </Text>
                    </View>
                )}
                ListEmptyComponent={
                    <Text style={styles.sinEmpleados}>No hay empleados registrados</Text>
                }
                />
            )}
        </View>
    );
}

const styles =StyleSheet.create({
    contenedor: {flex: 1, backgroundColor: '#f5f5f5', paddingTop: 50},
    cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 8},
    titulo: {fontSize: 22, fontWeight: 'bold', color: '#1a1a2e'},
    cerrarSesion: {color: '#f44336', fontSize: 15},
    bienvenida: { paddingHorizontal: 24, fontSize: 16,color: '#666', marginBottom: 24},
    subtitulo: { paddingHorizontal: 24, fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 12},
    tarjetaEmpleado: { backgroundColor: '#fff', marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#4CAF50'},
    nombreEmpleado: { fontSize: 16, fontWeight: 'bold', color: '#1a1a2e'},
    emailEmpleado: { fontSize: 15, color: '#666', marginTop: 4},
    ubicacion: { fontSize: 15, color: '#999', marginTop: 6},
    sinEmpleados: { textAlign: 'center', color: '#999', marginTop: 20},
});