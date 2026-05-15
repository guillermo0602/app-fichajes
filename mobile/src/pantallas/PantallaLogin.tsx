import { useState } from "react";
import { useAutenticacion } from "../contexto/Autenticacion";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Colores } from "../colores";

export default function PantallaLogin(){
    const { login, cargando } = useAutenticacion();

    //Estado del formulario
    const [email, setEmail]= useState('');
    const [contrasena, setContrasena]= useState('');

    async function manejarLogin() {
        //validar que los campos no esten vacios
        if(!email || !contrasena){
            Alert.alert('Error', 'Por favor introduce tu email y contraseña');
            return;
        }

        try{
            await login(email, contrasena);
            //si el login es correcto se redirige a la pantalla
        }catch(error: any){
            console.log('Error completo: ', JSON.stringify(error));
            console.log('Mensaje: ',error.message)
            Alert.alert('Error', 'Credenciales incorrectas. Intentalo de nuevo.');
        }
    }

    return(
        <View style={styles.container}>
            <Text style={styles.titulo}>App Fichaje</Text>
            <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

            <TextInput style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={Colores.textoGris}/>

            <TextInput style={styles.input}
            placeholder="Contrasena"
            value={contrasena}
            onChangeText={setContrasena}
            secureTextEntry
            placeholderTextColor={Colores.textoGris}/>

            <TouchableOpacity
            style={styles.boton}
            onPress={manejarLogin}
            disabled={cargando}>
                {cargando ? (
                    <ActivityIndicator color='#fff'/>
                ): (
                    <Text style={styles.textoBoton}>Entrar</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{ flex : 1, justifyContent: 'center', padding: 24, backgroundColor: Colores.fondoPrincipal},
    titulo: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginBottom: 8, color: Colores.primario, letterSpacing: 2},
    subtitulo: { fontSize: 16, textAlign: 'center', marginBottom: 32, color: Colores.textoGris},
    input: { backgroundColor: Colores.fondoTarjeta, borderRadius: 8, padding: 16, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: Colores.borde, color: Colores.textoBlanco},
    boton: { backgroundColor: Colores.primario, borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8},
    textoBoton: { color: Colores.fondoPrincipal, fontSize: 16, fontWeight: 'bold'},
});