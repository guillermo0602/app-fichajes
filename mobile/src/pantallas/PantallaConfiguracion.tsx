import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colores } from '../colores';
import { cancelarRecordatorio } from '../servicios/notificaciones';


export default function PantallaConfiguracion() {
    const [recordatorioEntrada, setRecordatorioEntrada] = useState(false);
    const [recordatorioSalida, setRecordatorioSalida] = useState(false);

    // Horas por defecto
    const [horaEntrada] = useState({ hora: 8, minutos: 0 });
    const [horaSalida] = useState({ hora: 17, minutos: 0 });

    async function toggleRecordatorioEntrada(valor: boolean) {
        setRecordatorioEntrada(valor);
        if (valor) {
        await recordatorioEntrada(horaEntrada.hora, horaEntrada.minutos);
        Alert.alert(
            'Recordatorio activado',
            `Te avisaremos a las ${horaEntrada.hora}:${String(horaEntrada.minutos).padStart(2, '0')} para fichar tu entrada`
        );
        } else {
        await cancelarRecordatorio();
        if (recordatorioSalida) {
            await recordatorioSalida(horaSalida.hora, horaSalida.minutos);
        }
        }
    }

    async function toggleRecordatorioSalida(valor: boolean) {
        setRecordatorioSalida(valor);
        if (valor) {
        await recordatorioSalida(horaSalida.hora, horaSalida.minutos);
        Alert.alert(
            'Recordatorio activado',
            `Te avisaremos a las ${horaSalida.hora}:${String(horaSalida.minutos).padStart(2, '0')} para fichar tu salida`
        );
        } else {
        await cancelarRecordatorio();
        if (recordatorioEntrada) {
            await recordatorioEntrada(horaEntrada.hora, horaEntrada.minutos);
        }
        }
    }

    return (
        <View style={estilos.contenedor}>
        <Text style={estilos.titulo}>Configuración</Text>
        <Text style={estilos.seccion}>Recordatorios de fichaje</Text>

        {/* Recordatorio entrada */}
        <View style={estilos.tarjeta}>
            <View style={estilos.fila}>
            <View style={estilos.filaIzquierda}>
                <Ionicons name="log-in-outline" size={22} color={Colores.primario} />
                <View style={estilos.textos}>
                <Text style={estilos.textoTarjeta}>Recordatorio de entrada</Text>
                <Text style={estilos.subtexto}>
                    {horaEntrada.hora}:{String(horaEntrada.minutos).padStart(2, '0')} cada día laboral
                </Text>
                </View>
            </View>
            <Switch
                value={recordatorioEntrada}
                onValueChange={toggleRecordatorioEntrada}
                trackColor={{ false: Colores.borde, true: Colores.primario }}
                thumbColor={Colores.fondoPrincipal}
            />
            </View>
        </View>

        {/* Recordatorio salida */}
        <View style={estilos.tarjeta}>
            <View style={estilos.fila}>
            <View style={estilos.filaIzquierda}>
                <Ionicons name="log-out-outline" size={22} color={Colores.error} />
                <View style={estilos.textos}>
                <Text style={estilos.textoTarjeta}>Recordatorio de salida</Text>
                <Text style={estilos.subtexto}>
                    {horaSalida.hora}:{String(horaSalida.minutos).padStart(2, '0')} cada día laboral
                </Text>
                </View>
            </View>
            <Switch
                value={recordatorioSalida}
                onValueChange={toggleRecordatorioSalida}
                trackColor={{ false: Colores.borde, true: Colores.primario }}
                thumbColor={Colores.fondoPrincipal}
            />
            </View>
        </View>

        <Text style={estilos.nota}>
            * Los recordatorios se mostrarán diariamente a la hora indicada
        </Text>
        </View>
    );
}

const estilos = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: Colores.fondoPrincipal, paddingTop: 50 },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingHorizontal: 24,
        marginBottom: 24,
        color: Colores.textoBlanco,
    },
    seccion: {
        fontSize: 13,
        color: Colores.textoGris,
        paddingHorizontal: 24,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tarjeta: {
        backgroundColor: Colores.fondoTarjeta,
        marginHorizontal: 24,
        marginBottom: 12,
        padding: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colores.borde,
    },
    fila: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filaIzquierda: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    textos: { flex: 1 },
    textoTarjeta: { fontSize: 15, color: Colores.textoBlanco, fontWeight: 'bold' },
    subtexto: { fontSize: 12, color: Colores.textoGris, marginTop: 4 },
    nota: {
        fontSize: 12,
        color: Colores.textoGris,
        paddingHorizontal: 24,
        marginTop: 8,
        fontStyle: 'italic',
    },
});