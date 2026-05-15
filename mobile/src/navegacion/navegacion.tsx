import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAutenticacion } from "../contexto/Autenticacion";
import { NavigationContainer } from "@react-navigation/native";
import PantallaLogin from "../pantallas/PantallaLogin";
import PantallaFichaje from "../pantallas/PantallaFichajes";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PantallaEmpleado from "../pantallas/admin/PantallaEmpleado";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PantallaUbicacion from "../pantallas/admin/PantallaUbicacion";
import PantallaAsignarUbicacion from "../pantallas/admin/PantallaAsignarUbicacion";
import PantallaHistorialEmpleado from "../pantallas/admin/PantallaHistorialEmpleado";
import PantallaCrearEmpleado from "../pantallas/admin/PantallaCrearEmpleado";
import { createDrawerNavigator } from "@react-navigation/drawer";
import PantallaConfiguracion from "../pantallas/PantallaConfiguracion";

const Pila = createNativeStackNavigator();
const Pestanas = createBottomTabNavigator();

function PestanasAdmin(){
    return(
        <Pestanas.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: '#999',
        }}>
            <Pestanas.Screen
            name="Empleados"
            component={PantallaEmpleado}
            options={{
                tabBarLabel: 'Empleados',
                tabBarIcon: ({ color }) => (
                    <Text style={{ fontSize: 20, color}}>👥</Text>
                ),
            }}/>

            <Pestanas.Screen
            name="Ubicaciones"
            component={PantallaUbicacion}
            options={{
                tabBarLabel: 'Ubicaciones',
                tabBarIcon: ({ color }) => (
                    <Text style={{ fontSize: 20, color}}>📍</Text>
                ),
            }}/>
        </Pestanas.Navigator>
    );
}

//Navegacion principal
export default function Navegacion(){
    const { usuario } = useAutenticacion();

    return(
        <NavigationContainer>
            <Pila.Navigator screenOptions={{ headerShown: false }}>
                {!usuario ? (
                    <Pila.Screen name="Login" component={PantallaLogin} />
                ) : usuario.rol === 'ADMIN' ? (
                    <Pila.Screen name="Admin" component={PestanasAdmin} />
                ) : (
                    <Pila.Screen name="Fichaje" component={PantallaFichaje} />
                )}
                    <Pila.Screen
                    name="AsignarUbicacion"
                    component={PantallaAsignarUbicacion}
                    options={{ headerShown: true, title: 'Asignar Ubicación' }}
                    />
                    <Pila.Screen
                    name="HistorialEmpleado"
                    component={PantallaHistorialEmpleado}
                    options={{ headerShown: true, title: 'Historial de fichajes' }}
                    />
                    <Pila.Screen
                    name="CrearEmpleado"
                    component={PantallaCrearEmpleado}
                    options={{ headerShown: true, title: 'Nuevo empleado' }}
                    />
                    <Pila.Screen
                    name="Configuracion"
                    component={PantallaConfiguracion}
                    options={{ headerShown: true, title: 'Configuración'}}
                    />

            </Pila.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
        drawer: { flex: 1, backgroundColor: '#fff' },
        drawerCabecera: {
            backgroundColor: '#1a1a2e',
            padding: 24,
            paddingTop: 60,
        },
        drawerNombre: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
        drawerEmail: { fontSize: 13, color: '#aaa', marginTop: 4 },
        drawerRol: {
            fontSize: 12,
            color: '#4CAF50',
            marginTop: 8,
            fontWeight: 'bold',
        },
        drawerOpcion: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0',
        },
        drawerIcono: { fontSize: 20, marginRight: 12 },
        drawerTexto: { fontSize: 15, color: '#1a1a2e' },
        drawerCerrarSesion: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            position: 'absolute',
            bottom: 32,
        },
        drawerTextoCerrar: { fontSize: 15, color: '#F44336' },
})