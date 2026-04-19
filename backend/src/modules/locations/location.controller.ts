import { Request, Response } from "express";
import { createLocation, deleteLocation, getAllLocations, getLocationById } from "./location.service";


//Se crea una nueva ubicacion- solo el ADMIN puede llamar a este
export async function createLocationController(req:Request, res: Response) {
    try{
        //Extraemos los datos del body de la petición
        const { name, latitude, longitude, radiusMeters }= req.body;

        //Validar que los campos obligatorios esten presentes
        if(!name || latitude === undefined || longitude === undefined){
            res.status(400).json({
                success: false,
                mensaje: 'Nombre, latitud y longitud son obligatorios',
            });
            return;
        }

        //Llamamos al servicio para crear la ubicacion en la BD
        const location = await createLocation(name, latitude, longitude, radiusMeters);

        //Devolvemos la ubicacion creada con codigo 201
        res.status(201).json({
            seccess: true,
            data: location,
        });
    }catch (error: any){
        res.status(500).json({
            success: false,
            mensaje: error.message,
        });
    }
}

//Obtener todas las ubicaciones
export async function getAllLocationsController(_req: Request, res: Response) {
    try{
        const locations= await getAllLocations();

        res.status(200).json({
            success: true,
            data: locations,
        });
    }catch(error: any){
        res.status(500).json({
            success: false,
            mensaje: error.message,
        });
    }
}


//Obtiener la ubicacion por su ID
export async function getLocationByIdController(req: Request, res: Response) {
    try{
        //El ID viene como parametro en la URL: api/locations/:id
        const  id = req.params.id as string;

        const location = await getLocationById(id);

        res.status(200).json({
            seccess: true,
            data: location,
        });
    }catch(error: any){
        //Si no se encuentra se devuelve 404
        res.status(404).json({
            success: false,
            mensaje: error.message,
        });
    }
}

//Elimina la ubicacion por su ID
export async function deleteLocationController(req: Request, res: Response) {
    try{
        const id = req.params.id as string;

        await deleteLocation(id);

        //204 significa 'exito sin contenido que devolver'
        res.status(204).send();
    }catch(error: any){
        res.status(404).json({
            success: false,
            mensaje: error.message,
        });
    }
}