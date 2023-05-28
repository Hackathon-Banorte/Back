import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import developRoutes from "./routes/developRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import express from "express";
const app = express();  

app.use(cors());
app.use(express.json());
app.use("/chat",chatRoutes);
app.use("/develop", developRoutes);
app.use("/transactions", transactionRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    });
