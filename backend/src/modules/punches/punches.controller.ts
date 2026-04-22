import { Request, Response } from "express";
import { PunchType } from "./punch.model";
import { createPunch, getMyPunches, getPunchesByEmployee } from "./punches.service";

//registro del empleado con la entrada y salida
export async function createPunchController(req: Request, res: Response) {
    try{
        //el employeeId se extrae del token JWT
        const employeeId = req.authenticatedUser!.userId;

        const { type, latitude, longitude } = req.body;

        //Validar que los campos obligatorios estan presentes
        if(!type || latitude === undefined || longitude === undefined){
            res.status(400).json({
                success: false,
                mensaje: 'Tipo, latitud y longitud son obligatorios'
            });
            return;
        }

        //Validar el tipo
        if(!Object.values(PunchType).includes(type)){
            res.status(400).json({
                success: false,
                mensaje: 'El tipo debe ser CLOCK_IN o CLOCK_OUT',
            });
            return;
        }

        //Llamada al servicio con la validacion del geofence
        const punch = await createPunch(employeeId, type, latitude, longitude);

        res.status(201).json({
            success: true,
            data: punch,
        });

    }catch(error: any){
        res.status(400).json({
            success: false,
            mensaje: error.message,
        });
    }
}

//consulta de fichajes
export async function getMyPunchesController(req: Request, res: Response) {
    try{
        //el employeeId viene del token JWT
        const employeeId = req.authenticatedUser!.userId;
        const punches = await getMyPunches(employeeId);

        res.status(200).json({
            success: true,
            data: punches,
        });

    }catch(error: any){
        res.status(500).json({
            success: false,
            mensaje: error.message,
        });
    }
}

//consulta de los fichajes para el admin
export async function getPunchesByEmployeeController(req: Request, res: Response) {
    try{
        //el ID del empleado viene como una URL
        const employeeId = req.params.id as string;

        const punches = await getPunchesByEmployee(employeeId);
        res.status(200).json({
            success: true,
            data: punches,
        });

    }catch(error: any){
        res.status(500).json({
            success: false,
            mensaje: error.message,
        });
    }
}