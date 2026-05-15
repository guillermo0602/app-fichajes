import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../servicios/api';
import { Colores } from '../../colores';


export default function PantallaCrearEmpleado() {
    const navegacion = useNavigation<any>();

    const [nombreCompleto, setNombreCompleto] = useState('');
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [guardando, setGuardando] = useState(false);

    async function crearEmpleado() {
        // Validar campos obligatorios
        if (!nombreCompleto.trim() || !email.trim() || !contrasena.trim()) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        // Validar formato de email
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailValido) {
            Alert.alert('Error', 'El formato del email no es válido');
            return;
        }

        // Validar longitud de contraseña
        if (contrasena.length < 8) {
            Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setGuardando(true);
        try {
        await api.post('/employees', {
            fullName: nombreCompleto,
            email: email.toLowerCase(),
            password: contrasena,
        });

        Alert.alert(
            'Empleado creado',
            `${nombreCompleto} ha sido registrado correctamente`,
            [{ text: 'OK', onPress: () => navegacion.goBack() }]
        );
        } catch (error: any) {
            const mensaje = error.response?.data?.mensaje || 'Error al crear el empleado';
            Alert.alert('Error', mensaje);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <KeyboardAvoidingView
        style={estilos.contenedor}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={estilos.scroll}>
                <Text style={estilos.descripcion}>
                    Introduce los datos del nuevo empleado. Recibirá sus credenciales para acceder a la app.
                </Text>

                {/* Nombre completo */}
                <Text style={estilos.etiqueta}>Nombre completo</Text>
                <TextInput
                    style={estilos.input}
                    placeholder="Ej: Juan García López"
                    value={nombreCompleto}
                    onChangeText={setNombreCompleto}
                    autoCapitalize="words"
                    placeholderTextColor={Colores.textoGris}
                />

                {/* Email */}
                <Text style={estilos.etiqueta}>Email</Text>
                <TextInput
                    style={estilos.input}
                    placeholder="Ej: juan@empresa.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={Colores.textoGris}
                />

                {/* Contraseña */}
                <Text style={estilos.etiqueta}>Contraseña</Text>
                <TextInput
                    style={estilos.input}
                    placeholder="Mínimo 8 caracteres"
                    value={contrasena}
                    onChangeText={setContrasena}
                    secureTextEntry
                    placeholderTextColor={Colores.textoGris}
                />

                {/* Botón guardar */}
                <TouchableOpacity
                style={[estilos.boton, guardando && estilos.botonDesactivado]}
                onPress={crearEmpleado}
                disabled={guardando}
                >
                    {guardando ? (
                        <ActivityIndicator color={Colores.fondoPrincipal} />
                    ) : (
                        <Text style={estilos.textoBoton}>Crear empleado</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const estilos = StyleSheet.create({
    contenedor: { flex: 1, backgroundColor: Colores.fondoPrincipal },
    scroll: { padding: 24 },
    descripcion: { fontSize: 14, color: Colores.textoGris, marginBottom: 24, lineHeight: 20 },
    etiqueta: { fontSize: 14, fontWeight: 'bold', color: Colores.textoBlanco, marginBottom: 6 },
    input: {
        backgroundColor: Colores.fondoTarjeta,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colores.borde,
        padding: 14,
        fontSize: 15,
        marginBottom: 16,
    },
    boton: {
        backgroundColor: Colores.primario,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    botonDesactivado: { backgroundColor: Colores.borde },
    textoBoton: { color: Colores.fondoPrincipal, fontSize: 16, fontWeight: 'bold' },
});