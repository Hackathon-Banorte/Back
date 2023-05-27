import dotenv from 'dotenv';
dotenv.config();
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import express from "express";

const app = express();  

app.use(cors());
app.use(express.json());
app.use("/chat/",userRoutes);
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
    });
