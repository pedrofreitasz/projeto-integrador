import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import rechargeRoutes from "./routes/rechargeRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import chargingPointRoutes from "./routes/chargingPointRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/auth", authRoutes);
app.use("/recharges", rechargeRoutes);
app.use("/employees", employeeRoutes);
app.use("/charging-points", chargingPointRoutes);
app.use("/admin", adminRoutes);

export default app;
