import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAutenticacion } from "../contexto/Autenticacion";
import { NavigationContainer } from "@react-navigation/native";
import PantallaLogin from "../pantallas/PantallaLogin";
import PantallaAdmin from "../pantallas/PantallaAdmin";
import PantallaFichaje from "../pantallas/PantallaFichajes";

const Pila = createNativeStackNavigator();

export default function Navegacion(){
    const { usuario } = useAutenticacion();

    return(
        <NavigationContainer>
            <Pila.Navigator screenOptions={{ headerShown: false }}>
                {!usuario ? (
                    //si el usuario no tiene cuenta se muestra el login
                    <Pila.Screen name="Login" component={PantallaLogin}/>
                ): usuario.rol === 'ADMIN'? (
                    //Pnatalla para el admin
                    <Pila.Screen name="Admin" component={PantallaAdmin}/>
                ): (
                    //pantalla para los usuarios
                    <Pila.Screen name="Fichaje" component={PantallaFichaje}/>
                )}
            </Pila.Navigator>
        </NavigationContainer>
    );
}