import { Router } from "express";
import {
    estado_base,
    //procesar_transaccion,
    //manejo_de_finanzas,
} from "../controllers/chatController.js";

const router = Router();

router.post("/estado-base", estado_base);

export default router;