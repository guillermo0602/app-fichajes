import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import authRouter from './modules/auth/auth.router'
import { authenticate } from './middleware/auth.middleware';

// Carga las variables del archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares — procesan cada petición antes de llegar a las rutas
app.use(cors());          // Permite peticiones desde otros orígenes (el móvil)
app.use(express.json()); // Permite leer JSON en el body de las peticiones
app.use(morgan('dev'));  // Muestra en consola cada petición que llega

app.use('/api/auth', authRouter);

// Ruta de prueba para verificar que el servidor funciona
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', mensaje: 'Servidor funcionando correctamente' });
});

//ruta protegida de prueba
app.get('/api/protegido', authenticate, (_req, res)=>{
    res.json({ succes: true, mensaje: 'Accediste a una ruta protegida'});
});

async function bootstrap(){
    await connectDatabase();
    app.listen(PORT, ()=>{
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
}

bootstrap();

export { app };