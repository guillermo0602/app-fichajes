import { useState } from "react";
import { useAutenticacion } from "../contexto/Autenticacion";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../servicios/api";
import { Ionicons } from '@expo/vector-icons';
import { Colores } from "../colores";

export default function PantallaPerfil(){
    const { usuario } = useAutenticacion();

    const [ contrasenaActual, setContrasenaActual ] = useState('');
    const [ nuevaContrasena, setNuevaContrasena ] = useState('');
    const [ confirmaContrasena, setConfirmaContrasena ] = useState('');
    const [ guardando, setGuardando ] = useState(false);
    const [ mostrarContrasena, setMostrarContrasena ] = useState(false);

    async function cambiarContrasena() {
        if (!contrasenaActual || !nuevaContrasena || !confirmaContrasena){
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        if(nuevaContrasena !== confirmaContrasena){
            Alert.alert('Error', 'Las contraseñas no coinciden');
            return;
        }

        if(nuevaContrasena.length < 8){
            Alert.alert('Error', 'La contraseña debe tener minimo 8 caracteres');
            return;
        }

        setGuardando(true);
        
        try {
            await api.post('/auth/cambiar-contrasena', {
                contrasenaActual,
                nuevaContrasena,
            });

            Alert.alert('Error', 'Contraseña actualizada correctamente');

            //Limpiar los campos
            setContrasenaActual('');
            setNuevaContrasena('');
            setConfirmaContrasena('');
        } catch (error: any) {
            const mensaje = error.response?.data?.mensaje || 'Error al cambiar la contraseña';
            Alert.alert('Error', mensaje);
        }finally{
            setGuardando(true);
        }
    }

    return(
        <ScrollView style={styles.contenedor}>

            {/*Cabecera con avatar*/}
            <View style={styles.cabecera}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarTexto}>{usuario?.nombre.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.nombre}>{usuario?.nombre}</Text>
                <Text style={styles.email}>{usuario?.email}</Text>

                <View style={styles.badgeRol}>
                    <Text style={styles.textoRol}>Empleado</Text>
                </View>
            </View>

            {/*cambiar contraseña*/}
            <View style={styles.seccion}>
                <TouchableOpacity style={styles.seccionCabecera} onPress={() => setMostrarContrasena(!mostrarContrasena)}>
                    <View style={styles.filaIcono}>
                        <Ionicons name="lock-closed-outline" size={20} color={Colores.primario}/>
                        <Text style={styles.seccionTitulo}>Cambiar contraseña</Text>
                    </View>

                    <Ionicons
                    name={mostrarContrasena ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colores.textoGris}/>
                </TouchableOpacity>

                {mostrarContrasena && (
                    <View style={styles.formulario}>
                        <Text style={styles.etiqueta}> Contraseña Actual</Text>
                        <TextInput
                        style={styles.input}
                        value={contrasenaActual}
                        onChangeText={setContrasenaActual}
                        secureTextEntry
                        placeholder="Introduce tu contraseña actual"
                        placeholderTextColor={Colores.textoGris}
                        />

                        <Text style={styles.etiqueta}>Nueva Contraseña</Text>
                        <TextInput
                        style={styles.input}
                        value={nuevaContrasena}
                        onChangeText={setNuevaContrasena}
                        secureTextEntry
                        placeholder="Introduce la nueva contraseña"
                        placeholderTextColor={Colores.textoGris}
                        />

                        <Text style={styles.etiqueta}>Confirmar nueva contraseña</Text>
                        <TextInput
                        style={styles.input}
                        value={confirmaContrasena}
                        onChangeText={setConfirmaContrasena}
                        secureTextEntry
                        placeholder="Ingresa nuevamente la nueva contraseña"
                        placeholderTextColor={Colores.textoGris}
                        />

                        <TouchableOpacity
                        style={[styles.btn, guardando && styles.btnDesactivado]}
                        onPress={cambiarContrasena}
                        disabled={guardando}>
                            {guardando? (
                                <ActivityIndicator color={Colores.fondoPrincipal}/>
                            ):(
                                <>
                                <Ionicons name="checkmark-circle-outline" size={20} color={Colores.fondoPrincipal}/>
                                <Text style={styles.textoBtn}>Guardar Cambios</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: Colores.fondoPrincipal},
    cabecera: { alignItems: 'center', paddingVertical: 32, borderBottomColor: Colores.borde, paddingHorizontal: 24, borderBottomWidth: 1},
    avatar: {backgroundColor: Colores.primarioSuave, width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: Colores.primario, justifyContent: 'center', alignItems: 'center', marginBottom: 12},
    avatarTexto: {color: Colores.primario, fontSize: 32, fontWeight: 'bold'},
    nombre: {color: Colores.textoBlanco, fontSize: 22, fontWeight: 'bold', marginBottom: 4},
    email: {color: Colores.textoGris, fontSize: 15, marginBottom: 12},
    badgeRol: {backgroundColor: Colores.primarioSuave, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: Colores.primario},
    textoRol: {color: Colores.primario, fontSize: 12, fontWeight:'bold'},
    seccion: { backgroundColor: Colores.fondoTarjeta, marginHorizontal: 24, marginTop: 24, borderRadius: 8, borderWidth: 1, borderColor: Colores.borde, overflow: 'hidden'},
    seccionCabecera: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16},
    filaIcono: { flexDirection: 'row', alignItems: 'center', gap: 10},
    seccionTitulo: { color: Colores.textoBlanco, fontSize: 15, fontWeight: 'bold'},
    formulario: { padding: 16, borderTopWidth: 1, borderTopColor: Colores.borde},
    etiqueta: { color: Colores.textoGris, fontSize: 15, marginBottom: 6},
    input: { backgroundColor: Colores.fondoPrincipal, borderRadius: 8,borderWidth: 1, borderColor: Colores.borde, padding: 14, fontSize: 15, color: Colores.textoBlanco, marginBottom: 14},
    btn: { backgroundColor: Colores.primario, borderRadius: 8, padding: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 4},
    btnDesactivado: { backgroundColor: Colores.borde},
    textoBtn: { color: Colores.fondoPrincipal, fontSize: 15, fontWeight: 'bold'},
})