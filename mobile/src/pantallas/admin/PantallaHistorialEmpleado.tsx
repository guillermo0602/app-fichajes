import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from '../../servicios/api';

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

    return (
        <View style={estilos.contenedor}>
        <Text style={estilos.subtitulo}>
            Empleado: <Text style={estilos.nombreEmpleado}>{empleado.fullName}</Text>
        </Text>

        {cargando ? (
            <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
            <FlatList
            data={diasAgrupados}
            keyExtractor={(item) => item.fecha}
            renderItem={({ item }) => (
                <View style={estilos.grupoDia}>
                <Text style={estilos.fechaDia}>{item.fecha}</Text>

                {item.pares.map((par, index) => (
                    <View key={index} style={estilos.parFichaje}>
                    <View style={estilos.filaFichaje}>
                        <View style={[estilos.indicador, { backgroundColor: '#4CAF50' }]} />
                        <View>
                        <Text style={estilos.tipoTexto}>Entrada</Text>
                        <Text style={estilos.horaTexto}>
                            {new Date(par.entrada.timestamp).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit',
                            })}
                        </Text>
                        </View>
                    </View>

                    {par.salida ? (
                        <>
                        <View style={estilos.lineaConectora} />
                        <View style={estilos.filaFichaje}>
                            <View style={[estilos.indicador, { backgroundColor: '#F44336' }]} />
                            <View>
                            <Text style={estilos.tipoTexto}>Salida</Text>
                            <Text style={estilos.horaTexto}>
                                {new Date(par.salida.timestamp).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                })}
                            </Text>
                            </View>
                        </View>
                        <View style={estilos.horasTrabajadas}>
                            <Text style={estilos.horasTexto}>
                            ⏱ {calcularHorasTrabajadas(par.entrada.timestamp, par.salida.timestamp)} trabajadas
                            </Text>
                        </View>
                        </>
                    ) : (
                        <View style={estilos.pendiente}>
                        <Text style={estilos.pendienteTexto}>⚠️ Salida pendiente</Text>
                        </View>
                    )}
                    </View>
                ))}
                </View>
            )}
            ListEmptyComponent={
                <Text style={estilos.sinFichajes}>No hay fichajes registrados</Text>
            }
            />
        )}
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 16 },
    subtitulo: { fontSize: 15, paddingHorizontal: 24, marginBottom: 16, color: '#666' },
    nombreEmpleado: { fontWeight: 'bold', color: '#1a1a2e' },
    grupoDia: {
        backgroundColor: '#fff',
        marginHorizontal: 24,
        marginBottom: 12,
        borderRadius: 8,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    fechaDia: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    parFichaje: { marginBottom: 8 },
    filaFichaje: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    indicador: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
    tipoTexto: { fontSize: 14, fontWeight: 'bold', color: '#1a1a2e' },
    horaTexto: { fontSize: 16, color: '#333', marginTop: 2 },
    lineaConectora: {
        width: 2,
        height: 16,
        backgroundColor: '#ddd',
        marginLeft: 5,
        marginVertical: 4,
    },
    horasTrabajadas: {
        backgroundColor: '#f0f9f0',
        borderRadius: 6,
        padding: 8,
        marginTop: 8,
    },
    horasTexto: { fontSize: 13, color: '#4CAF50', fontWeight: 'bold' },
    pendiente: {
        backgroundColor: '#fff9e6',
        borderRadius: 6,
        padding: 8,
        marginTop: 8,
    },
    pendienteTexto: { fontSize: 13, color: '#f0a500' },
    sinFichajes: { textAlign: 'center', color: '#999', marginTop: 20 },
});