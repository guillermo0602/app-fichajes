import React, { createContext, useContext, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import { establecerToken, iniciarSesion } from "../servicios/api";

//Define la forma del contexto
interface autenticacion {
    token: string | null;
    usuario: {
        id: string;
        email: string;
        nombre: string;
        rol: string;
    } | null;
    cargando: boolean;
    login: (email: string, contrasena: string) => Promise<void>;
    logout: () => Promise<void>;
}

//crear el contexto
const Contexto= createContext<autenticacion | null>(null);

//proveedor del contexto
export function ProveedorAutenticacion({children}:{children : React.ReactNode}){
    const [token, setToken] = useState<string | null>(null);
    const [usuario, setUsuario] = useState<autenticacion['usuario']>(null);
    const [cargando, setCargando] = useState(false);

    //Inicia session y guarda el token
    async function login(email: string, contrasena: string) {
        setCargando(true);
        try{
            const respuesta = await iniciarSesion(email, contrasena);
            const { token: nuevoToken, user}= respuesta.data;

            //gaurdar token en almacenamiento del movil
            await SecureStore.setItemAsync('token', nuevoToken);


            //actualiza el estado 
            establecerToken(nuevoToken);
            setToken(nuevoToken);
            setUsuario({
                id: user.id,
                email: user.email,
                nombre: user.fullName,
                rol: user.role,
            });
        }finally{
            setCargando(false);
        }
    }

    //cierra sesión y elimina token
    async function logout() {
        await SecureStore.deleteItemAsync('token');
        establecerToken(null);
        setToken(null);
        setUsuario(null);
    }

    return(
        <Contexto.Provider value={{ token, usuario, cargando, login, logout}}>
            {children}
        </Contexto.Provider>
    );
}

//hook personalizado para usar el contexto en cualquier pantalla
export function useAutenticacion(){
    const contexto = useContext(Contexto);
    if(!contexto){
        throw new Error('useAutenticación debe usarse dentro de ProveedorAutenticacion');
    }
    return contexto;
}