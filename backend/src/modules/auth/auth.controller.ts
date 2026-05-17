import { Request, Response } from "express";
import { cambiarContrasena, login } from "./auth.service";

export async function loginController(req:Request, res: Response) {
    try{
        //Extraer email y contraseña del body de la petición
        const { email, password }= req.body;

        //Extraer email y contraseña del body de la petición
        if (!email || !password){
            res.status(400).json({
                succes: false,
                mensaje: 'Email y contraseña son obligatorios'
            });
            return;
        }

        //Llamar al servicio del login
        const resultado=await login(email,password);

        //Devolver el token y los datos del servicio
        res.status(200).json({
            succes: true,
            data: resultado
        });
    }catch(error: any){
        res.status(401).json({
            succes: false,
            mensaje: error.message
        });
    }
    
}

export async function cambiarContrasenaController(req: Request, res: Response) {
    try {
        const { contrasenaActual, contrasenaNueva } = req.body;

        if(!contrasenaActual || !contrasenaNueva){
            res.status(400).json({
                success: false,
                mensaje: 'La contraseña actual y la nueva contraseña son oblogatorios',
            });
            return;
        }

        //El userId viene del token JWT
        const userId = req.authenticatedUser!.userId;

        await cambiarContrasena(userId, contrasenaActual, contrasenaNueva);

        res.status(200).json({
            success: true,
            mensaje: 'Contraseña actuañizada correctamente',
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            mensaje: error.message,
        });
    }
}