import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { createPunchController, getMyPunchesController, getPunchesByEmployeeController } from "./punches.controller";

const router = Router();

//ficha de entrada y salida
router.post('/', authenticate, authorize('EMPLOYEE'), createPunchController);

//consulta de fichajes por parte de los empleados
router.get('/me', authenticate, authorize('EMPLOYEE'), getMyPunchesController);

//consulta de fichajes por parte del admin
router.get('/:id', authenticate, authorize('ADMIN'), getPunchesByEmployeeController);

export default router;