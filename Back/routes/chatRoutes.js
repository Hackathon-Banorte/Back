import { Router } from "express";
import {
    estado_base,
    consultar_informacion,
    procesar_transaccion,
    manejo_de_finanzas,
} from "../controllers/userController.js";

const router = Router();

router.get("estado-base", estado_base);
router.get("informacion", consultar_informacion);
router.get("transacciones", procesar_transaccion);
router.get("manejo-de-finanzas", manejo_de_finanzas);

export default router;