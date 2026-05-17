import { Router } from "express";
import { loginController, cambiarContrasenaController} from "./auth.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.post('/login', loginController);

//cambiar la contraseña
router.post('/cambiar-contrasena', authenticate, cambiarContrasenaController)

export default router;