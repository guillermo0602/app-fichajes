import { useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { cancelarRecordatorio, programaRecordatorioEntrada, programaRecordatorioSalida } from "../servicios/notificaciones";
import { Ionicons } from "@expo/vector-icons";
import { Colores } from "../colores";

export default function PantallaConfiguracion(){
    const [ recordatorioEntrada, setRecordatorioEntrada ] = useState(false);
    const [ recordatorioSalida, setRecordatorioSalida ] = useState(false);

    //Horas por defecto
    const [horaEntrada] = useState({hora: 8, minutos: 0});
    const [horaSalida] = useState({hora: 17, minutos: 0});

    async function toggleRecordatorioEntrada(valor: boolean) {
        setRecordatorioEntrada(valor);
        if(valor){
            await programaRecordatorioEntrada(horaEntrada.hora, horaEntrada.minutos);
            Alert.alert(
                'Recordatorio activo',
                `Te avisaremos a las ${horaEntrada.hora}:${String(horaEntrada.minutos).padStart(2, '0')} para fichar tu entrada`
            );
        }else{
            await cancelarRecordatorio();
            if(recordatorioSalida){
                await programaRecordatorioSalida(horaSalida.hora, horaSalida.minutos);
            }
        }
    }


    async function toggleRecordatorioSalida(valor: boolean) {
        setRecordatorioSalida(valor);
        if(valor){
            await programaRecordatorioSalida(horaSalida.hora, horaSalida.minutos);
            Alert.alert(
                'Recordatorio activado',
                `Te avisaremos a las ${horaSalida.hora}:${String(horaSalida.minutos).padStart(2, '0')} para fichar tu salida`
            );
        }else{
            await cancelarRecordatorio();
            if(recordatorioEntrada){
                await programaRecordatorioEntrada(horaEntrada.hora, horaEntrada.minutos);
            }
        }
    }


    return(
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>Configuracion</Text>
            <Text style={styles.seccion}>Recordatorio de fichaje</Text>

            {/*Recordatorio de entrada*/}
            <View style={styles.tarjeta}>
                <View style={styles.fila}>
                    <View style={styles.filaIzquierda}>
                        <Ionicons name="log-in-outline" size={22} color={Colores.primario}/>
                        <View style={styles.textos}>
                            <Text style={styles.textoTarjeta}>Recordatorio de entrada</Text>
                            <Text style={styles.subTexto}>{horaEntrada.hora}:{String(horaEntrada.minutos).padStart(2, '0')} cada dia laboral</Text>
                        </View>
                    </View>

                    <Switch
                    value={recordatorioEntrada}
                    onValueChange={toggleRecordatorioEntrada}
                    trackColor={{false: Colores.borde, true: Colores.primario}}
                    thumbColor={Colores.fondoPrincipal}/>
                </View>
            </View>

            {/*Recordatorio salida*/}
            <View style={styles.tarjeta}>
                <View style={styles.fila}>
                    <View style={styles.filaIzquierda}>
                        <Ionicons name="log-out-outline" size={22} color={Colores.error}/>
                        <View style={styles.textos}>
                            <Text style={styles.textoTarjeta}>Recordatorio de salida</Text>
                            <Text style={styles.subTexto}>{horaSalida.hora}:{String(horaSalida.minutos).padStart(2, '0')} cada dia laboral</Text>
                        </View>
                    </View>

                    <Switch
                    value={recordatorioSalida}
                    onValueChange={toggleRecordatorioSalida}
                    trackColor={{false: Colores.borde, true: Colores.primario}}
                    thumbColor={Colores.fondoPrincipal}/>
                </View>
            </View>

            <Text style={styles.nota}>
                * Los recordatorios se mostraran diariamente a la hora indicada
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: Colores.fondoPrincipal, padding: 25},
    titulo: {fontSize: 22, color: Colores.textoBlanco, fontWeight: 'bold', paddingHorizontal: 2, marginBottom: 24},
    seccion: { color: Colores.textoGris, fontSize: 15, paddingHorizontal: 2, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1},
    tarjeta: { backgroundColor: Colores.fondoTarjeta, marginBottom: 12, padding: 16, borderRadius: 8, borderWidth: 1, borderColor: Colores.borde},
    fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    filaIzquierda: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1},
    textos: { flex: 1},
    textoTarjeta: { color: Colores.textoBlanco, fontSize: 15, fontWeight: 'bold'},
    subTexto: { color: Colores.textoGris, fontSize: 14, marginTop: 4},
    nota: { color: Colores.textoGris, fontSize: 13, paddingHorizontal: 2, marginTop: 8, fontStyle: 'italic'},
})