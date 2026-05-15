import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

//configuracion para mostrar las notificaciones cuando la app esta abierta
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

//solicita permisos y obtener el token push del dispositivo
export async function registrarNotificaciones(): Promise<string | null> {
    //las notificaciones push para dispositivos fisicos
    if(!Device.isDevice){
        console.log('Las notificaciones push requieren un dispositivo fisico');
        return null;
    }

    //solicitar permisos
    const { status: estadoActual } = await Notifications.getPermissionsAsync();
    let estadoFinal = estadoActual;

    if(estadoActual !== 'granted'){
        const { status } = await Notifications.requestPermissionsAsync();
        estadoFinal=status;
    }

    if(estadoFinal !== 'granted'){
        console.log('Permisos de notificaciones denegados');
        return null;
    }

    if(Platform.OS === 'android'){
        await Notifications.setNotificationChannelAsync('fichajes', {
            name: 'Fichajes',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    //obtener el token push del dispositivo
    const token = await Notifications.getExpoPushTokenAsync({
        projectId: 'app-fichaje',
    });
    return token.data;
}

//Recordatorio de fichaje de entrada 
export async function recordatorioEntrada(hora: number, minutos: number) {
    //cancelar recordatorios anteriores para evitar duplicados 
    await cancelarRecordatorio();

    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Recuerda fichar tu entrada',
            body: 'No olvides registrar tu entrada al trabajo',
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hora,
            minute: minutos,
        },
    });
}

//Recordatorio fichaje de salida
export async function recordatorioSalida(hora: number, minutos: number) {
    await Notifications.scheduleNotificationAsync({
        content:{
            title: 'Recuerda fichar tu salida',
            body: 'No olvides registrar tu hora de salida',
            sound: true,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: hora,
            minute: minutos,
        },
    });
}

//cancelar recordatorio programado
export async function cancelarRecordatorio() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

//notificacion inmediata, para cuando el empleado ficha
export async function notificarFichaje(tipo: 'CLOCK_IN'|'CLOCK_OUT') {
    await Notifications.scheduleNotificationAsync({
        content:{
            title: tipo === 'CLOCK_IN' ? 'Entrada registrada':'Salida registrada',
            body: tipo === 'CLOCK_IN'
            ? 'Tu fichaje de entrada ha sido registrado correctamente'
            : 'Tu fichaje de salida ha sido registrado correctamente',
            sound: true,
        },
        trigger: null,
    });
}

