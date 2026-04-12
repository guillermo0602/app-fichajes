import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fichaje';

export async function connectDatabase(): Promise<void> {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado a MongoDB correctamente');
    } catch (error) {
        console.error('Error al conectar con MongoDB:', error);
        process.exit(1); // Si no hay base de datos, el servidor no debe arrancar
    }
}