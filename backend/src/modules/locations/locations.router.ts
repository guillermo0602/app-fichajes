import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.middleware";
import { createLocationController, deleteLocationController, getAllLocationsController, getLocationByIdController } from "./location.controller";

const router = Router();

//TOdas las rutas requieren estar autenticado y ser admin
router.post('/', authenticate, authorize('ADMIN'), createLocationController);

//GET /api/locations - obtiene todas las ubicaciones
router.get('/', authenticate, authorize('ADMIN'), getAllLocationsController);

//GET/api/locations/:id - obtiene una ubicacion por su ID
router.get('/:id', authenticate, authorize('ADMIN'), getLocationByIdController);

//DELETE/api/locations/:id - elimina una ubicación
router.delete('/:id', authenticate, authorize('ADMIN'), deleteLocationController);

export default router;