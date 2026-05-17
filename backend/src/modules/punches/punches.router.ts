import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { createPunchController, getMyPunchesController, getPunchesByEmployeeController } from "./punches.controller";
import { generarInformeEmpleado } from "./punches.reports.service";

const router = Router();

//ficha de entrada y salida
router.post('/', authenticate, authorize('EMPLOYEE'), createPunchController);

//consulta de fichajes por parte de los empleados
router.get('/me', authenticate, authorize('EMPLOYEE'), getMyPunchesController);

//consulta de fichajes por parte del admin
router.get('/:id', authenticate, authorize('ADMIN'), getPunchesByEmployeeController);

//genera informe de un empleado
router.get(
    '/informe/:empleadoId',
    authenticate,
    authorize('ADMIN'),
    async (req, res) => {
        try {
            const empleadoId = req.params.empleadoId as string;
            const { fechaInicio, fechaFin } = req.query;

            if(!fechaInicio || !fechaFin){
                res.status(400).json({
                    success: false,
                    mensaje: 'Los parametros fechaInicio y fechaFin son obligatorios',
                });
                return;
            }

            const informe = await generarInformeEmpleado(
                empleadoId,
                new Date(fechaInicio as string),
                new Date( fechaFin as string)
            );

            res.status(200).json({
                success: true,
                data: informe,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                mensaje: error.message,
            });
        }
    }
);

export default router;