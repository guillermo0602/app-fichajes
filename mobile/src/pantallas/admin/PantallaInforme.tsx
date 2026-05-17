import { useRoute } from "@react-navigation/native";
import { useState } from "react";
import { api } from "../../servicios/api";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colores } from "../../colores";
export default function PantallaInforme(){
    const ruta = useRoute<any>();
    const { empleado } = ruta.params;

    const [informe, setInforme] = useState<any>(null);
    const [cargando, setCargando] = useState(false);
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date());

    async function cargarInforme(fecha: Date) {
        setCargando(true);

        try {
            //calcular primer y ultimo dia del mes seleccionado

            const fechaInicio = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
            const fechaFin = new Date(fecha.getFullYear(), fecha.getMonth() + 1,0,23,59,59);

            const respuesta = await api.get(`/punches/informe/${empleado._id}`, {
                params: {
                    fechaInicio: fechaInicio.toISOString(),
                    fechaFin: fechaFin.toISOString(),
                },
            });

            setInforme(respuesta.data.data);

        } catch (error: any) {
            Alert.alert('Error', 'No se pudo cargar el informe');
        }finally{
            setCargando(false);
        }
    }

    function mesAnterior(){
        const nuevaFecha = new Date(mesSeleccionado.getFullYear(), mesSeleccionado.getMonth() -1, 1);
        setMesSeleccionado(nuevaFecha);
        cargarInforme(nuevaFecha);
    }

    function mesSiguiente(){
        const nuevaFecha = new Date(mesSeleccionado.getFullYear(), mesSeleccionado.getMonth() +1, 1);
        setMesSeleccionado(nuevaFecha);
        cargarInforme(nuevaFecha);
    }

    function formatearMes(fecha: Date): string{
        return fecha.toLocaleDateString('es-ES', {month: 'long', year: 'numeric'});
    }

    function formatearHoras(horas: number): string{
        const h = Math.floor(horas);
        const m = Math.round((horas - h)*60);

        return `${h}h ${m}m`;
    }

    return(
        <ScrollView style={styles.contenedor}>
            {/*Cabecera de empleado*/}
            <View style={styles.cabeceraEmpleado}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarTexto}>{empleado.fullName.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.nombreEmpleado}>{empleado.fullName}</Text>
                <Text style={styles.emailEmpleado}>{empleado.email}</Text>
            </View>

            {/*selector del mes*/}
            <View style={styles.selectorMes}>
                <TouchableOpacity onPress={mesAnterior}>
                    <Ionicons name="chevron-back" size={24} color={Colores.primario}/>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnMes} onPress={() => cargarInforme(mesSeleccionado)}>
                    <Text style={styles.textoMes}>{formatearMes(mesSeleccionado)}</Text>
                    <Ionicons name="refresh-outline" size={16} color={Colores.textoGris}/>
                </TouchableOpacity>

                <TouchableOpacity onPress={mesSiguiente}>
                    <Ionicons name="chevron-forward" size={24} color={Colores.primario}/>
                </TouchableOpacity>
            </View>

            {cargando ? (
                <ActivityIndicator size="large" color={Colores.primario} style={{marginTop: 40}}/>
            ): informe?(
                <>
                {/*resumen del mes*/}
                <View style={styles.resumen}>
                    <View style={styles.tarjetaResumen}>
                        <Ionicons name="time-outline" size={28} color={Colores.primario}/>
                        <Text style={styles.valorResumen}>
                            {formatearHoras(informe.totalHorasTrabajadas)}
                        </Text>
                        <Text style={styles.etiquetaResumen}>Total horas</Text>
                    </View>

                    <View style={styles.tarjetaResumen}>
                        <Ionicons name="calendar-outline" size={28} color={Colores.primario}/>
                        <Text style={styles.valorResumen}>{informe.totalDiasTrabajados}</Text>
                        <Text style={styles.etiquetaResumen}>Dias trabajados</Text>
                    </View>

                    <View style={[styles.tarjetaResumen, informe.diasConFichajeIncompleto > 0 && styles.tarjetaAdvertencia]}>
                        <Ionicons name="warning-outline" size={28} color={informe.diasConFichajeIncompleto > 0 ? Colores.advertencia : Colores.primario}/>
                        <Text style={[styles.valorResumen, informe.diasConFichajeIncompleto > 0 && styles.textoAdvertencia]}>
                            {informe.diasConFichajeIncompleto}
                        </Text>
                        <Text style={styles.etiquetaResumen}>Incompletos</Text>
                    </View>
                </View>

                {/*desglose por dia*/}
                <Text style={styles.tituloDesglose}>Desglose por dia</Text>

                {informe.desglosePorDia.map((dia: any) => (
                    <View
                    key={dia.fecha}
                    style={[styles.tarjetaDia, dia.fichajeIncompleto && styles.tarjetaDiaIncompleta]}
                    >
                        <View style={styles.filaDia}>
                            <Text style={styles.fechaDia}>
                                {new Date(dia.fecha).toLocaleDateString('es-ES', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                })}
                            </Text>
                            <Text style={styles.horasDia}>{formatearHoras(dia.horasTrabajadas)}</Text>
                        </View>

                    {/* Entradas y salidas del día */}
                    {dia.entradas.map((entrada: string, index: number) => (
                        <View key={index} style={styles.filaFichaje}>
                            <View style={styles.fichajeTipo}>
                                <Ionicons name="log-in-outline" size={14} color={Colores.primario} />
                                <Text style={styles.horaFichaje}>
                                    {new Date(entrada).toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </Text>
                            </View>
                            {dia.salidas[index] && (
                                <View style={styles.fichajeTipo}>
                                    <Ionicons name="log-out-outline" size={14} color={Colores.error} />
                                    <Text style={styles.horaFichaje}>
                                        {new Date(dia.salidas[index]).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Text>
                                </View>
                            )}
                            {!dia.salidas[index] && (
                                <Text style={styles.textoIncompleto}>⚠️ Sin salida</Text>
                            )}
                        </View>
                    ))}
                </View>
            ))}
                </>
            ) : (
            <View style={styles.sinDatos}>
                <Ionicons name="document-outline" size={48} color={Colores.textoGris} />
                <Text style={styles.textoSinDatos}>Selecciona un mes para ver el informe</Text>
                <TouchableOpacity style={styles.botonCargar} onPress={() => cargarInforme(mesSeleccionado)}>
                    <Text style={styles.textoBotonCargar}>Cargar informe</Text>
                </TouchableOpacity>
            </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: Colores.fondoPrincipal },
    cabeceraEmpleado: { alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: Colores.borde,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colores.primarioSuave,
        borderWidth: 2,
        borderColor: Colores.primario,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarTexto: { fontSize: 24, fontWeight: 'bold', color: Colores.primario },
    nombreEmpleado: { fontSize: 18, fontWeight: 'bold', color: Colores.textoBlanco },
    emailEmpleado: { fontSize: 13, color: Colores.textoGris, marginTop: 4 },
    selectorMes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    btnMes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    textoMes: { fontSize: 16, fontWeight: 'bold', color: Colores.textoBlanco },
    resumen: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 12,
        marginBottom: 24,
    },
    tarjetaResumen: {
        flex: 1,
        backgroundColor: Colores.fondoTarjeta,
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colores.borde,
    },
    tarjetaAdvertencia: {
        borderColor: Colores.advertencia,
        backgroundColor: '#FFB80010',
    },
    valorResumen: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colores.textoBlanco,
        marginTop: 8,
    },
    textoAdvertencia: { color: Colores.advertencia },
    etiquetaResumen: { fontSize: 11, color: Colores.textoGris, marginTop: 4, textAlign: 'center' },
    tituloDesglose: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colores.textoBlanco,
        paddingHorizontal: 24,
        marginBottom: 12,
    },
    tarjetaDia: {
        backgroundColor: Colores.fondoTarjeta,
        marginHorizontal: 24,
        marginBottom: 8,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: Colores.borde,
    },
    tarjetaDiaIncompleta: {
        borderColor: Colores.advertencia,
    },
    filaDia: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    fechaDia: { fontSize: 14, fontWeight: 'bold', color: Colores.textoBlanco },
    horasDia: { fontSize: 14, color: Colores.primario, fontWeight: 'bold' },
    filaFichaje: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 4,
    },
    fichajeTipo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    horaFichaje: { fontSize: 13, color: Colores.textoOscuro },
    textoIncompleto: { fontSize: 12, color: Colores.advertencia },
    sinDatos: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 24 },
    textoSinDatos: {
        fontSize: 15,
        color: Colores.textoGris,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    botonCargar: {
        backgroundColor: Colores.primario,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    textoBotonCargar: { color: Colores.fondoPrincipal, fontWeight: 'bold' },
})