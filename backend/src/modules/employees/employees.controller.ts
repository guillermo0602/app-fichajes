import { Request, Response } from "express";
import { assignLocation, createEmployee, deleteEmployee, getAllEmployees, getEmployeeById } from "./employees.service";

export async function createEmployeeController(req:Request, res: Response) {
    try{
        //Extraer los datos del body
        const { fullName, email, password } = req.body;

        //Validamos que los campos obligatorios esten 
        if(!fullName || !email || !password){
            res.status(400).json({
                success: false,
                mensaje: 'Nombre, email y contraseña son obligatorios',
            });
            return;
        }

        //Llamamos al servicio para crear el empleado
        const employee = await createEmployee(fullName,email, password);

        res.status(201).json({
            success: true,
            data: employee,
        });
    }catch (error: any){
        res.status(400).json({
            success: false,
            mensaje: error.message,
        });
    }
}

//para obtener a los empleados 
export async function getAllEmployeeController(_req: Request, res: Response) {
    try{
        const employee = await getAllEmployees();

        res.status(200).json({
            success: true,
            data: employee,
        });
    }catch(error: any){
        res.status(500).json({
            success: false,
            mensaje: error.message,
        });
    }
}

//obtener empleados por su id
export async function getEmployeeByIdController(req: Request, res: Response) {
    try{
        const id = req.params.id as string;

        const employee = await getEmployeeById(id);

        res.status(200).json({
            success: true,
            data: employee,
        });

    }catch(error: any){
        res.status(404).json({
            success: false,
            mensaje: error.message,
        });
    }
}

//Asignar una ubicación a un empleado
export async function assignLocationController(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        // El locationId viene en el body de la petición
        const { locationId } = req.body;

        if (!locationId) {
        res.status(400).json({
            success: false,
            mensaje: 'El locationId es obligatorio',
        });
        return;
        }

        const employee = await assignLocation(id, locationId);

        res.status(200).json({
        success: true,
        data: employee,
        });
    } catch (error: any) {
        res.status(400).json({
        success: false,
        mensaje: error.message,
        });
    }
}

// Elimina un empleado
export async function deleteEmployeeController(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        await deleteEmployee(id);

        // 204 significa éxito sin contenido que devolver
        res.status(204).send();
    } catch (error: any) {
        res.status(404).json({
        success: false,
        mensaje: error.message,
        });
    }
}