import { Router } from "express";
import {
    getTransactionsFromUser
} from "../controllers/transactionsController.js";

const router = Router();

router.get("/get-transactions", getTransactionsFromUser);

export default router;


