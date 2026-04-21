import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import {
    createEmployeeController,
    getEmployeeByIdController,
    assignLocationController,
    deleteEmployeeController,
    getAllEmployeeController,
} from './employees.controller';

const router = Router();

//crea un nuevo empleado
router.post('/', authenticate, authorize('ADMIN'), createEmployeeController);

//obtiene todos los empleados
router.get('/', authenticate, authorize('ADMIN'), getAllEmployeeController);

//obtiene un empleado por su ID
router.get('/:id', authenticate, authorize('ADMIN'), getEmployeeByIdController);

//asigna una ubicación a un empleado
router.patch('/:id/location', authenticate, authorize('ADMIN'), assignLocationController);

//elimina un empleado
router.delete('/:id', authenticate, authorize('ADMIN'), deleteEmployeeController);

export default router;