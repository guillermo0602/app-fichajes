import React, { useEffect, useState } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { crearFichaje, obtenerFichajes } from '../servicios/api';
import * as Location from 'expo-location';
import { useAutenticacion } from '../contexto/Autenticacion';

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

    const diasAgrupados = agruparPorDia(fichaje);

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
                                        <Text style={styles.horasTexto}>
                                            {calcularHorasTrabajadas(par.entrada.timestamp, par.salida.timestamp)} trabajadas
                                        </Text>
                                    </View>
                                    </>
                                ):(
                                    <View style={styles.pendiente}>
                                        <Text style={styles.pendienteTexto}>Salida pendiente</Text>
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
    contenedor:{flex: 1, backgroundColor:'#f5f5f5', paddingTop: 50},
    cabecera:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
    titulo:{ fontSize: 20, fontWeight: 'bold', color: '#1a1a2e'},
    cerrarSesion:{ color: '#f44336', fontSize: 14},
    contenedorBtn:{ alignItems: 'center', marginBottom: 32},
    btnFichaje:{ width: 180, height: 180, borderRadius: 90, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4},
    textoBtn:{ color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center'},
    tituloHistorial:{ fontSize: 18, fontWeight: 'bold', paddingHorizontal: 24, marginBottom: 12, color: '#1a1a2e'},
    grupoDia:{ backgroundColor: '#fff', marginHorizontal: 24, marginBottom: 12, padding: 16, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2},
    fechaDia:{ fontSize: 15, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 8},
    parFichaje:{ marginBottom: 8},
    filaFichaje:{ flexDirection: 'row', alignItems: 'flex-start', gap: 12},
    indicador: { width: 12, height: 12, borderRadius: 6, marginTop: 4},
    tipoTexto:{ fontSize: 15, fontWeight: 'bold', color: '#1a1a2e'},
    horaTexto: { fontSize: 16, color: '#333', marginTop: 2},
    distanciaTexto: { fontSize: 14, color: '#999', marginTop: 3},
    lineaConectora:{ width: 2, height: 16, backgroundColor: '#ddd', marginLeft: 5, marginVertical: 4},
    horasTrabajadas: { backgroundColor: '#f0f9f0', borderRadius: 6, padding: 8, marginTop: 8},
    horasTexto: { fontSize: 14, color: '#4CAF50', fontWeight: 'bold'},
    pendiente: { backgroundColor: '#fff9e6', borderRadius: 6, padding: 8, marginTop: 8},
    pendienteTexto: { fontSize: 13, color: '#f0a500'},
    sinFichaje: { textAlign: 'center', color: '#999', marginTop: 20},
});