import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

dotenv.config();

//Añadir el ususario autenticado al objeto Request de Express
declare global{
    namespace Express {
        interface Request {
            authenticatedUser?: {
                userId: string;
                role: string;
            };
        }
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction){
    //lee el token de la cabecera Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(401).json({
            succes: false,
            mensaje: 'No autorizado. Token no proporcionado'
        });
        return;
    }

    //Extraer el token (quita el "Bearer" frl inicio)
    const token = authHeader.slice(7);

    try{
        //aqui se verifica el token
        const payload = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET || 'secret'
        ) as { userId: string, role: string};

        //adjuntar el ususario al request para usarlo en los controllers
        req.authenticatedUser = {
            userId: payload.userId,
            role: payload.role,
        };

        //dejar pasar la peticion
        next();

    }catch(error){
        res.status(401).json({
            succes: false,
            mensaje: 'No autorizado. Token invalido o expirado'
        });
    }
}

//Verificar que el ususario tiene el rol requerido
export function authorize(...roles:string[]){
    return(req:Request, res: Response, next: NextFunction)=>{
        if(!req.authenticatedUser){
            res.status(401).json({
                succes: false,
                mensaje: 'No autorizado.'
            });
            return;
        }

        if(!roles.includes(req.authenticatedUser.role)){
            res.status(403).json({
                succes: false,
                mensaje: 'Acceso denegado. No tiene los permisos necesarios'
            });
            return;
        }

        next();
    };
}