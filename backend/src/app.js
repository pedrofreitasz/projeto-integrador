import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import rechargeRoutes from "./routes/rechargeRoutes.js";

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/recharges", rechargeRoutes);

export default app;
