import jwt from "jsonwebtoken";
import { UserModel } from "./user.model";
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";

dotenv.config();

export async function login(email:string, password: string) {
    //Buscar el usuario en la base de datos
    const user = await UserModel.findOne({email});
    if(!user){
        throw new Error('Credenciales incorrectos');
    }

    //Compara la contraseña con el hash guardado
    const contraseñaCorrecta= await bcrypt.compare(password, user.passwordHash);
    if(!contraseñaCorrecta){
        throw new Error('Contraseña incorrecta');
    }

    //Genera el token JWT
    const token = jwt.sign(
        {
            userId: user._id,
            role: user.role,
        },
        process.env.JWT_ACCESS_SECRET || 'secret',
        { expiresIn: '15m' }
    );

    //Devolver el token y los datos publicos del usuario
    return{
        token,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            role: user. role,
        },
    };
}