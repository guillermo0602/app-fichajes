import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAutenticacion } from "../contexto/Autenticacion";
import { NavigationContainer } from "@react-navigation/native";
import PantallaLogin from "../pantallas/PantallaLogin";
import PantallaFichaje from "../pantallas/PantallaFichajes";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PantallaEmpleado from "../pantallas/admin/PantallaEmpleado";
import { StyleSheet } from "react-native";
import PantallaUbicacion from "../pantallas/admin/PantallaUbicacion";
import PantallaAsignarUbicacion from "../pantallas/admin/PantallaAsignarUbicacion";
import PantallaHistorialEmpleado from "../pantallas/admin/PantallaHistorialEmpleado";
import PantallaCrearEmpleado from "../pantallas/admin/PantallaCrearEmpleado";
import PantallaConfiguracion from "../pantallas/PantallaConfiguracion";
import { Colores } from "../colores";
import { Ionicons } from "@expo/vector-icons";
import PantallaPerfil from "../pantallas/PantallaPerfil";
import PantallaInforme from "../pantallas/admin/PantallaInforme";

const Pila = createNativeStackNavigator();
const Pestanas = createBottomTabNavigator();

function PestanasAdmin(){
    return(
        <Pestanas.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colores.primario,
            tabBarInactiveTintColor: Colores.textoGris,
        }}>
            <Pestanas.Screen
            name="Empleados"
            component={PantallaEmpleado}
            options={{
                tabBarLabel: 'Empleados',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="people-outline" size={24} color={color}/>
                ),
            }}/>

            <Pestanas.Screen
            name="Ubicaciones"
            component={PantallaUbicacion}
            options={{
                tabBarLabel: 'Ubicaciones',
                tabBarIcon: ({ color }) => (
                    <Ionicons name ="location-outline" size={24} color={color}/>
                ),
            }}/>
        </Pestanas.Navigator>
    );
}

const PestanasEmpleado = createBottomTabNavigator();

//funcion para que el empleado pueda navegar entre funciones
function NavegacionEmpleado(){
    return(
        <PestanasEmpleado.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: Colores.primario,
            tabBarInactiveTintColor: Colores.textoGris,
            tabBarStyle:{
                backgroundColor: Colores.fondoCabecera,
                borderTopColor: Colores.borde,
            },
        }}>
            <PestanasEmpleado.Screen
            name="Fichaje"
            component={PantallaFichaje}
            options={{
                tabBarLabel:'Fichaje',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="finger-print-outline" size={24} color={color}/>
                ),
            }}/>

            <PestanasEmpleado.Screen
            name="Perfil"
            component={PantallaPerfil}
            options={{
                tabBarLabel: 'Pefil',
                tabBarIcon: ({ color }) => (
                    <Ionicons name="person-outline" size={24} color={color}/>
                ),
            }}/>
        </PestanasEmpleado.Navigator>
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
                    <Pila.Screen
                    name="Empleado"
                    component={NavegacionEmpleado}/>
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

                    <Pila.Screen
                    name="Informe"
                    component={PantallaInforme}
                    options={{ headerShown: true, title: 'Informe mensual'}}
                    />
            </Pila.Navigator>
        </NavigationContainer>
    );
}