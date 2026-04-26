import axios from "axios";

const URL_BASE ='http://10.0.2.2:3000/api';

export const api = axios.create({
    baseURL: URL_BASE,
    timeout: 10000,
});

//Añade y elimina eñ token de autenticacion en las peticiones
export function establecerToken(token: string| null){
    if(token){
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }else{
        delete api.defaults.headers.common['Authorization'];
    }
}

//Autenticación
export async function iniciarSesion(email: string, password: string) {
    const respuesta = await api.post('/auth/login', {email, password});
    return respuesta.data;
}

//Fichajes
export async function crearFichaje(
    tipo: 'CLOCK_IN' |'CLOCK_OUT',
    latitud: number,
    longitud: number
) {
    const respuesta = await api.post('/punches', {
        type: tipo,
        latitude: latitud,
        longitude: longitud,
    });
    return respuesta.data;
}

export async function obtenerFichajes() {
    const respuesta = await api.get('/punches/me');
    return respuesta.data;
}