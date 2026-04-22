import { error, timeStamp } from "node:console";
import { UserModel } from "../auth/user.model";
import { PunchModel, PunchType } from "./punch.model";
import { LocationModel } from "../locations/location.model";

//Formula de haversine - esta calcula la distancia en metros entre dos puntos GPS
function calculateDistanceMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const EARTH_RADIUS_METERS = 6_371_000;

    //Convertir grados a radiantes
    const toRadians =(degrees: number) => (degrees * Math.PI)/180;

    const deltaLat = toRadians(lat2-lat1);
    const deltaLon = toRadians(lon2-lon1);

    const a = Math.sin(deltaLat/2)**2 + Math.cos(toRadians(lat1))* Math.cos(toRadians(lat2))* Math.sin(deltaLon/2)**2;

    const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return EARTH_RADIUS_METERS * centralAngle;
}

//Crear el fichaje
export async function createPunch(
    employeeId: string,
    type: PunchType,
    latitude: number,
    longitude: number,
) {
    //buscar empleado y si tiene alguna ubicación
    const employee = await UserModel.findById(employeeId);
    if (!employee){
        throw new Error('Empleado no encontrado');
    }

    if(!employee.assignedLocationId){
        throw new Error('No tienes una ubicacion asignada. Contacta con tu administrador')
    }
    
    //buscar la ubicacion
    const location = await LocationModel.findById(employee.assignedLocationId);
    if(!location){
        throw new Error('Ubicacion asignada no encontrada');
    }

    //calcular la distancia del empleado y el centro de la zona asignada
    const distanceMeters = calculateDistanceMeters(
        latitude,
        longitude,
        location.center.latitude,
        location.center.longitude
    );

    //verificar si el empleado este dentro del radio
    if(distanceMeters > location.radiusMeters){
        throw new Error(`Fichaje fallido. Estas a ${Math.round(distanceMeters)}m de la zona asignada. Radio permitido: ${location.radiusMeters}m`);
    }

    //guarda el fichaje en la base de datos
    const punch = await PunchModel.create({
        employeeId,
        locationId: location._id,
        type,
        coordinates: { latitude, longitude},
        distanceFromCenterMeters: Math.round(distanceMeters),
        timestamp: new Date(),
    });

    return punch;
}

//Obtener los fichajes del empleado 
export async function getMyPunches(employeeId: string) {
    const punches = await PunchModel.find({ employeeId })
    .sort({ timeStamp: -1})
    .limit(50);

    return punches;
}

//Obtener los fichajes de empleados - este solo para el ADMIN
export async function getPunchesByEmployee(employeeId: string) {
    const punches = await PunchModel.find({ employeeId }).sort({ timeStamp: -1 });
    return punches;
}