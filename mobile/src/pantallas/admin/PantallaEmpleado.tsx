import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { api } from '../../servicios/api';
import { useAutenticacion } from '../../contexto/Autenticacion';
import { Ionicons } from '@expo/vector-icons';
import { Colores } from '../../colores';

export default function PantallaEmpleado() {

    const navegacion = useNavigation<any>();

    const [empleados, setEmpleados] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    const {usuario, logout}=useAutenticacion();

    const [menuVisible, setMenuVisible] = useState(false);

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
                <View>
                    <Text style={styles.titulo}>Empleados</Text>
                    <Text style={styles.subtitulo}>Hola, {usuario?.nombre}</Text>
                </View>
                
                <TouchableOpacity style={styles.btnMenu} onPress={() => setMenuVisible(true)}>
                    <Ionicons name="menu" size={22} color='#fff' />
                </TouchableOpacity>
            </View>

            {/*Modal del Menu*/}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.fondoModal}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.contenidoMenu}>

                    {/* Cabecera del menú */}
                        <View style={styles.menuCabecera}>
                            <Text style={styles.menuNombre}>{usuario?.nombre}</Text>
                            <Text style={styles.menuEmail}>{usuario?.email}</Text>
                        </View>

                    {/* Opciones */}
                        <TouchableOpacity
                            style={styles.opcionMenu}
                            onPress={() => {
                                setMenuVisible(false);
                                navegacion.navigate('CrearEmpleado');
                            }}
                        >
                            <Ionicons name="person-add-outline" size={20} color='#1a1a2e'/>
                            <Text style={styles.textoOpcion}> Nuevo empleado</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.opcionMenu}
                            onPress={() => {
                                setMenuVisible(false);
                                cargarEmpleados();
                            }}
                        >
                            <Ionicons name= "refresh-outline" size={20} color='#1a1a2e'/>
                            <Text style={styles.textoOpcion}> Actualizar lista</Text>
                        </TouchableOpacity>

                        {/* Cerrar sesión */}
                        <TouchableOpacity
                            style={[styles.opcionMenu, styles.opcionCerrarSesion]}
                            onPress={() => {
                                setMenuVisible(false);
                                logout();
                            }}
                        >
                            <Ionicons name="log-out-outline" size={20} color='#F44336'/>
                            <Text style={styles.textoCerrarSesion}> Cerrar sesión</Text>
                        </TouchableOpacity>

                    </View>
                </TouchableOpacity>
            </Modal>

            {/*lista de empleados*/}
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
                            <Ionicons name="location" size={14} color='#4CAF50'/>
                            {item.assignedLocationId ? ' Ubicacion asignada': <Ionicons name="warning-outline" size={14} color='#f0a500'>'Sin ubicación'</Ionicons>}
                        </Text>
                        <Text style={styles.accion}>Toca para asignar ubicación</Text>

                        <TouchableOpacity style={styles.btnHistorial} onPress={()=> navegacion.navigate('HistorialEmpleado', {empleado: item})}>
                            <Text style={styles.textoHistorial}>Ver Historial</Text>
                        </TouchableOpacity>
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
    contenedor: { flex: 1,backgroundColor: Colores.fondoPrincipal, paddingTop: 50},
    titulo: { fontSize: 22, fontWeight: 'bold',color: Colores.textoBlanco},
    tarjeta: { backgroundColor: Colores.fondoTarjeta, marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: Colores.primario, borderColor: Colores.borde},
    nombre: { fontSize: 17, fontWeight: 'bold', color: Colores.textoBlanco},
    email: { fontSize: 15, color: Colores.textoBlanco, marginTop: 4},
    ubicacion: {fontSize: 14, color: Colores.textoOscuro, marginTop: 6},
    accion: { fontSize: 14, color: Colores.primario, marginTop: 8},
    sinDatos: { textAlign: 'center', color: Colores.textoGris, marginTop: 20},
    cerrarSesion:{ color: '#f44336', fontSize: 14},
    tarjetaAsignada: { borderLeftColor: Colores.primario},
    btnHistorial: { marginTop: 8},
    textoHistorial: { fontSize: 14, color: Colores.primario, fontWeight: 'bold'},

    cabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16},
    subtitulo: { fontSize: 13, color: Colores.textoGris, marginTop: 2 },
    btnMenu: { backgroundColor: Colores.fondoTarjeta, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colores.primario },
    iconoMenu: { fontSize: 18, color: '#f9f1f1' },
    fondoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-start', alignItems: 'flex-end'},
    contenidoMenu: { backgroundColor: Colores.fondoTarjeta, width: 280, marginTop: 50, marginRight: 16, borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colores.borde,
        elevation: 5,
    },
    menuCabecera: { backgroundColor: Colores.fondoCabecera, padding: 16, borderBottomWidth: 1, borderBottomColor: Colores.borde },
    menuNombre: { fontSize: 16, fontWeight: 'bold', color: Colores.textoBlanco },
    menuEmail: { fontSize: 12, color: Colores.textoGris, marginTop: 4 },
    opcionMenu: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: Colores.borde},
    iconoOpcion: { fontSize: 18, marginRight: 12 },
    textoOpcion: { fontSize: 15, color: Colores.textoBlanco},
    opcionCerrarSesion: { borderBottomWidth: 0 },
    textoCerrarSesion: { fontSize: 15, color: Colores.error },
})