import { Router } from "express";
import {
  createChargingPoint,
  getAllChargingPoints,
  getChargingPointById,
  updateChargingPoint,
  deleteChargingPoint
} from "../controllers/chargingPointController.js";
import { employeeAuthMiddleware, requireCEOOrInstalador } from "../middlewares/employeeAuthMiddleware.js";

const router = Router();

router.get("/", getAllChargingPoints);
router.get("/:id", getChargingPointById);

router.post("/", employeeAuthMiddleware, requireCEOOrInstalador, createChargingPoint);
router.put("/:id", employeeAuthMiddleware, requireCEOOrInstalador, updateChargingPoint);
router.delete("/:id", employeeAuthMiddleware, requireCEOOrInstalador, deleteChargingPoint);

export default router;



