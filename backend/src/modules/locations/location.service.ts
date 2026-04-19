import { LocationModel } from "./location.model";

export async function createLocation(
    name: string,
    latitude: number,
    longitude: number,
    radiusMeters: number=100
) {
    const location = await LocationModel.create({
        name,
        center: {latitude, longitude},
        radiusMeters,
    });

    return location;
}

export async function getAllLocations() {
    const locations = await LocationModel.find().sort({ createAt: -1});
    return locations;
}

export async function getLocationById(locationId: string) {
    const location = await LocationModel.findById(locationId);

    if(!location){
        throw new Error('Ubicación no encontrada');
    }
    return location;
}

export async function deleteLocation(locationId:string) {
    const location = await LocationModel.findByIdAndDelete(locationId);

    if(!location){
        throw new Error('Ubicación encontrada');
    }
}