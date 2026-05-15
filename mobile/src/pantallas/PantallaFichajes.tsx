import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { crearFichaje, obtenerFichajes } from '../servicios/api';
import * as Location from 'expo-location';
import { useAutenticacion } from '../contexto/Autenticacion';
import { Colores } from '../colores';
import { notificarFichaje, registrarNotificaciones } from '../servicios/notificaciones';

import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';


//funcion para calcular las horas trabajada entre dos fechas
function calcularHorasTrabajadas(entrada: string, salida: string): string{
    const diff = new Date(salida).getTime()- new Date(entrada).getTime();
    const horas = Math.floor(diff/(1000*60*60));
    const minutos = Math.floor((diff%(1000*60*60))/(1000*60));
    return`${horas}h ${minutos}m`;
}

//funcion para agrupar fichajes por dia y horas
function agruparPorDia(fichajes: any[]){
    const grupos: { [fecha: string]: { entrada: any; salida: any}[]}={};

    const ordenados = [...fichajes].sort(
        (a,b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    //agrupacion por dia
    ordenados.forEach((fichajes) => {
        const fecha = new Date(fichajes.timestamp).toLocaleDateString('es-ES');
        if(!grupos[fecha]) grupos[fecha] = [];

        if(fichajes.type === 'CLOCK_IN'){
            grupos[fecha].push({ entrada: fichajes, salida: null});
        }else{
            //asignar la salida al ultimo par sin salida
            const parSinSalida = grupos[fecha].findLast((p) => !p.salida);

            if(parSinSalida){
                parSinSalida.salida = fichajes;
            }
        }
    });

    //convertir a un array ordenado por fecha descendente 
    return Object.entries(grupos)
    .map(([fecha, pares])=>({fecha, pares}))
    .reverse();
}

export default function PantallaFichaje() {
    const {usuario, logout} = useAutenticacion();

    const [cargando, setCargando]= useState(false);
    const [fichaje, setFichaje] = useState<any[]>([]);
    const [cargardoFichaje, setCargardoFichaje] = useState(true);

    const navegacion = useNavigation<any>();

    //carga el historial de fichajes al entrar en la pantalla
    useEffect(() =>{
        cargarFichaje();
        registrarNotificaciones();
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


            //enviar el fichaje al backend
            await crearFichaje(tipo, latitude, longitude);
            await notificarFichaje(tipo);

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

    const diasAgrupados = agruparPorDia(fichaje);

    return (
        <View style={styles.contenedor}>
            {/*Cabecera*/}
            <View style={styles.cabecera}>
                <Text style={styles.titulo}>Hola, {usuario?.nombre}</Text>

                <TouchableOpacity onPress={() => navegacion.navigate('Configuracion')}>
                    <Ionicons name= "settings-outline" size={22} color={Colores.textoBlanco}/>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={logout}>
                    <Text style={styles.cerrarSesion}>Cerrar sesión</Text>
                </TouchableOpacity>
            </View>

            {/*Boton de fichaje*/}
            <View style={styles.contenedorBtn}>
                <TouchableOpacity style={[styles.btnFichaje, {backgroundColor: proximoFichaje === 'CLOCK_IN' ? Colores.primario: Colores.error },
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
            <Text style={styles.tituloHistorial}>Historial Fichajes</Text>

            {cargardoFichaje ? (
                <ActivityIndicator color='#4CAF50'/>
            ):(
                <FlatList
                data={diasAgrupados}
                keyExtractor={(item) => item.fecha}
                renderItem={({item})=> (
                    <View style={styles.grupoDia}>
                        {/*cabecera del dia*/}
                        <Text style={styles.fechaDia}>
                            {item.fecha}
                        </Text>

                        {/*Entrada y salida del dia*/}
                        {item.pares.map((par, index) => (
                            <View key={index} style={styles.parFichaje}>
                                {/*Entrada*/}
                                <View style={styles.filaFichaje}>
                                    <View style={[styles.indicador, {backgroundColor: '#4CAF50'}]}/>
                                    <View>
                                        <Text style={styles.tipoTexto}>Entrada</Text>
                                        <Text style={styles.horaTexto}>
                                            {new Date(par.entrada.timestamp).toLocaleDateString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </Text>
                                    </View>
                                </View>

                                {/*Salida*/}
                                {par.salida ? (
                                    <>
                                    <View style={styles.lineaConectora}/>
                                    <View style={styles.filaFichaje}>
                                        <View style={[styles.indicador, { backgroundColor: '#F44336'}]}/>
                                        <View>
                                            <Text style={styles.tipoTexto}>Salida</Text>
                                            <Text style={styles.horaTexto}>
                                                {new Date(par.salida.timestamp).toLocaleDateString('es-ES',{
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </Text>
                                            <Text style={styles.distanciaTexto}>
                                                {par.salida.distanceFromCenterMeters}m del centro
                                            </Text>
                                        </View>
                                    </View>

                                    {/*horas trabajadas*/}
                                    <View style={styles.horasTrabajadas}>
                                        <Ionicons name="time" size={15} color={Colores.primario}>
                                            <Text style={styles.horasTexto}> {calcularHorasTrabajadas(par.entrada.timestamp, par.salida.timestamp)} trabajadas</Text>
                                        </Ionicons>
                                    </View>
                                    </>
                                ):(
                                    <View style={styles.pendiente}>
                                        <Ionicons name="triangle" size={15} color={Colores.advertencia}>
                                            <Text style={styles.pendienteTexto}> Salida pendiente</Text>
                                        </Ionicons>
                                        
                                    </View>
                                )}
                            </View>
                        ))}
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
    contenedor:{flex: 1, backgroundColor: Colores.fondoPrincipal, paddingTop: 50},
    cabecera:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
    titulo:{ fontSize: 20, fontWeight: 'bold', color: Colores.textoBlanco},
    cerrarSesion:{ color: Colores.error, fontSize: 14},
    contenedorBtn:{ alignItems: 'center', marginBottom: 32},
    btnFichaje:{ width: 180, height: 180, borderRadius: 90, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: Colores.primario, shadowOffset: { width: 0, height: 0}, shadowOpacity: 0.8, shadowRadius: 15},
    textoBtn:{ color: Colores.fondoPrincipal, fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
    tituloHistorial:{ fontSize: 18, fontWeight: 'bold', paddingHorizontal: 24, marginBottom: 12, color: Colores.textoBlanco},
    grupoDia:{ backgroundColor: Colores.fondoTarjeta, marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 8, borderColor: Colores.borde },
    fechaDia:{ fontSize: 15, fontWeight: 'bold', color: Colores.primario, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colores.borde, paddingBottom: 8},
    parFichaje:{ marginBottom: 8},
    filaFichaje:{ flexDirection: 'row', alignItems: 'flex-start', gap: 12},
    indicador: { width: 12, height: 12, borderRadius: 6, marginTop: 4},
    tipoTexto:{ fontSize: 15, fontWeight: 'bold', color: Colores.textoBlanco },
    horaTexto: { fontSize: 16, color: Colores.textoOscuro, marginTop: 2},
    distanciaTexto: { fontSize: 14, color: Colores.textoGris, marginTop: 3},
    lineaConectora:{ width: 2, height: 16, backgroundColor: Colores.borde, marginLeft: 5, marginVertical: 4},
    horasTrabajadas: { backgroundColor: Colores.primarioSuave, borderRadius: 6, padding: 8, marginTop: 8},
    horasTexto: { fontSize: 14, color: Colores.primario, fontWeight: 'bold'},
    pendiente: { backgroundColor: '#FFB80020', borderRadius: 6, padding: 8, marginTop: 8,borderWidth: 1, borderColor: Colores.borde, },
    pendienteTexto: { fontSize: 13, color: Colores.advertencia},
    sinFichaje: { textAlign: 'center', color: Colores.textoGris, marginTop: 20},
});