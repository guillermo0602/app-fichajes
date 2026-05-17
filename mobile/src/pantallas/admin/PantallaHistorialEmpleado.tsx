import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../../servicios/api';
import { Colores } from '../../colores';
import { Ionicons } from '@expo/vector-icons';

// Reutilizamos la misma lógica de cálculo de horas
function calcularHorasTrabajadas(entrada: string, salida: string): string {
    const diff = new Date(salida).getTime() - new Date(entrada).getTime();
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${horas}h ${minutos}m`;
}

function agruparPorDia(fichajes: any[]) {
    const grupos: { [fecha: string]: { entrada: any; salida: any }[] } = {};

    const ordenados = [...fichajes].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    ordenados.forEach((fichaje) => {
        const fecha = new Date(fichaje.timestamp).toLocaleDateString('es-ES');
        if (!grupos[fecha]) grupos[fecha] = [];

        if (fichaje.type === 'CLOCK_IN') {
            grupos[fecha].push({ entrada: fichaje, salida: null });
        } else {
            const parSinSalida = grupos[fecha].findLast((p) => !p.salida);
            if (parSinSalida) parSinSalida.salida = fichaje;
        }
    });

    return Object.entries(grupos)
        .map(([fecha, pares]) => ({ fecha, pares }))
        .reverse();
}

export default function PantallaHistorialEmpleado() {
    const ruta = useRoute<any>();
    const { empleado } = ruta.params;

    const [fichajes, setFichajes] = useState<any[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        cargarFichajes();
    }, []);

    async function cargarFichajes() {
        try {
            setCargando(true);
            const respuesta = await api.get(`/punches/${empleado._id}`);
            setFichajes(respuesta.data.data);
        } catch (error) {
            console.log('Error cargando fichajes:', error);
        } finally {
            setCargando(false);
        }
    }

    const diasAgrupados = agruparPorDia(fichajes);

    const navegacion = useNavigation<any>();

    return (
        <View style={styles.contenedor}>
        <Text style={styles.subtitulo}>
            Empleado: <Text style={styles.nombreEmpleado}>{empleado.fullName}</Text>
        </Text>

        <TouchableOpacity style={styles.btnInforme} onPress={() => navegacion.navigate('Informe', { empleado }) }>
            <Ionicons name="bar-chart-outline" size={16} color={Colores.fondoPrincipal}/>
            <Text style={styles.textoBtnInforme}>Ver informe mensual</Text>
        </TouchableOpacity>

        {cargando ? (
            <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
            <FlatList
            data={diasAgrupados}
            keyExtractor={(item) => item.fecha}
            renderItem={({ item }) => (
                <View style={styles.grupoDia}>
                <Text style={styles.fechaDia}>{item.fecha}</Text>

                {item.pares.map((par, index) => (
                    <View key={index} style={styles.parFichaje}>
                    <View style={styles.filaFichaje}>
                        <View style={[styles.indicador, { backgroundColor: '#4CAF50' }]} />
                        <View>
                        <Text style={styles.tipoTexto}>Entrada</Text>
                        <Text style={styles.horaTexto}>
                            {new Date(par.entrada.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            })}
                        </Text>
                        </View>
                    </View>

                    {par.salida ? (
                        <>
                        <View style={styles.lineaConectora} />
                        <View style={styles.filaFichaje}>
                            <View style={[styles.indicador, { backgroundColor: '#F44336' }]} />
                            <View>
                            <Text style={styles.tipoTexto}>Salida</Text>
                            <Text style={styles.horaTexto}>
                                {new Date(par.salida.timestamp).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                })}
                            </Text>
                            </View>
                        </View>
                        <View style={styles.horasTrabajadas}>
                            <Ionicons name="time" size={15} color={Colores.primario}>
                                <Text style={styles.horasTexto}>
                                    {calcularHorasTrabajadas(par.entrada.timestamp, par.salida.timestamp)} trabajadas
                                </Text>
                            </Ionicons>
                        </View>
                        </>
                    ) : (
                        <View style={styles.pendiente}>
                            <Ionicons name="warning" size={15} padding={8} color={Colores.advertencia}>
                                <Text style={styles.pendienteTexto}>Salida pendiente</Text>
                            </Ionicons>
                            
                        </View>
                    )}
                    </View>
                ))}
                </View>
            )}
            ListEmptyComponent={
                <Text style={styles.sinFichajes}>No hay fichajes registrados</Text>
            }
            />
        )}
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: Colores.fondoPrincipal, paddingTop: 16 },
    subtitulo: { fontSize: 15, paddingHorizontal: 24, marginBottom: 16, color: Colores.textoGris },
    nombreEmpleado: { fontWeight: 'bold', color: Colores.primario },
    grupoDia: {
        backgroundColor: Colores.fondoTarjeta,
        marginHorizontal: 24,
        marginBottom: 12,
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: Colores.borde
    },
    fechaDia: {
        fontSize: 15,
        fontWeight: 'bold',
        color: Colores.primario,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colores.borde,
        paddingBottom: 8,
    },
    parFichaje: { marginBottom: 8 },
    filaFichaje: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    indicador: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
    tipoTexto: { fontSize: 14, fontWeight: 'bold', color: Colores.textoBlanco },
    horaTexto: { fontSize: 16, color: Colores.textoOscuro, marginTop: 2,},
    lineaConectora: {
        width: 2,
        height: 16,
        backgroundColor: Colores.textoBlanco,
        marginLeft: 5,
        marginVertical: 4,
    },
    horasTrabajadas: {
        backgroundColor: Colores.primarioSuave,
        borderRadius: 6,
        padding: 8,
        marginTop: 8,
    },
    horasTexto: { fontSize: 13, color: Colores.primario, fontWeight: 'bold', },
    pendiente: {
        backgroundColor: '#FFB80020',
        borderRadius: 6,
        padding: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: Colores.advertencia,
    },
    pendienteTexto: { fontSize: 13, color: Colores.advertencia },
    sinFichajes: { textAlign: 'center', color: Colores.textoGris, marginTop: 20 },
    btnInforme: { backgroundColor: Colores.primario, marginHorizontal: 24, marginBottom: 16, padding: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8},
    textoBtnInforme: { color: Colores.fondoPrincipal, fontWeight: 'bold', fontSize: 14},
});