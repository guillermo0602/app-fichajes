import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAutenticacion } from "../contexto/Autenticacion";
import { NavigationContainer } from "@react-navigation/native";
import PantallaLogin from "../pantallas/PantallaLogin";
import PantallaFichaje from "../pantallas/PantallaFichajes";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PantallaEmpleado from "../pantallas/admin/PantallaEmpleado";
import { Text } from "react-native";
import PantallaUbicacion from "../pantallas/admin/PantallaUbicacion";
import PantallaAsignarUbicacion from "../pantallas/admin/PantallaAsignarUbicacion";
import PantallaHistorialEmpleado from "../pantallas/admin/PantallaHistorialEmpleado";

const Pila = createNativeStackNavigator();
const Pestanas = createBottomTabNavigator();

function NavegacionAdmin(){
    return(
        <Pestanas.Navigator
        screenOptions={{
            headerShown: false,
            tabBarActiveBackgroundColor: '#4CAF50',
            tabBarInactiveTintColor: '#999',
        }}>
            <Pestanas.Screen 
            name="Empleados"
            component={PantallaEmpleado}
            options={{
                tabBarLabel: 'Empleados',
                tabBarIcon: ({ color }) => (
                    <Text style={{ fontSize: 20, color}}>👥</Text>
                )
            }}/>
            <Pestanas.Screen
            name="Ubicaciones"
            component={PantallaUbicacion}
            options={{
                tabBarLabel: 'Ubicaciones',
                tabBarIcon: ({ color }) => (
                    <Text style={{ fontSize:20, color}}>📍</Text>
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
                    //si el usuario no tiene cuenta se muestra el login
                    <Pila.Screen name="Login" component={PantallaLogin}/>
                ): usuario.rol === 'ADMIN'? (
                    //Pantalla para el admin
                    <Pila.Screen name="Admin" component={NavegacionAdmin}/>
                ):(
                    //pantalla para los usuarios
                    <Pila.Screen name="Fichaje" component={PantallaFichaje}/>
                )}
                <Pila.Screen
                    name="AsignarUbicacion"
                    component={PantallaAsignarUbicacion}
                    options={{ headerShown: true, title: 'Asignar Ubicación'}}/>

                <Pila.Screen
                    name="HistorialEmpleado"
                    component={PantallaHistorialEmpleado}
                    options={{ headerShown: true, title: 'Historial de fichajes'}}/>
            </Pila.Navigator>
        </NavigationContainer>
    );
}