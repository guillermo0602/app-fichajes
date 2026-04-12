import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { UserModel, UserRole } from '../modules/auth/user.model';

dotenv.config();

async function createAdmin() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fichaje');

    // Comprueba si ya existe un admin para no duplicarlo
    const existingAdmin = await UserModel.findOne({ role: UserRole.ADMIN });
    if (existingAdmin) {
        console.log('Ya existe un administrador:', existingAdmin.email);
        await mongoose.disconnect();
        return;
    }

    const passwordHash = await bcrypt.hash('admin123', 12);

    await UserModel.create({
        email: 'admin@fichaje.com',
        passwordHash,
        fullName: 'Administrador',
        role: UserRole.ADMIN,
    });

    console.log('Administrador creado correctamente');
    console.log('Email: admin@fichaje.com');
    console.log('Contraseña: admin123');

    await mongoose.disconnect();
}

createAdmin();