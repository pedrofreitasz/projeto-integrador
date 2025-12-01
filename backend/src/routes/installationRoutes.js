import { Router } from "express";
import {
  createInstallationRequest,
  getAllInstallationRequests,
  getInstallationRequestById,
  assignProfessionals,
  completeInstallation,
  getBalance,
  getEmployeesByPosition
} from "../controllers/installationController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { employeeAuthMiddleware, requireCEO, requireCEOOrInstalador } from "../middlewares/employeeAuthMiddleware.js";

const router = Router();

router.post("/", authMiddleware, createInstallationRequest);
router.get("/", employeeAuthMiddleware, getAllInstallationRequests);
router.get("/:id", employeeAuthMiddleware, getInstallationRequestById);
router.post("/:id/professionals", employeeAuthMiddleware, requireCEOOrInstalador, assignProfessionals);
router.post("/:id/complete", employeeAuthMiddleware, requireCEOOrInstalador, completeInstallation);
router.get("/employees/position/:position", employeeAuthMiddleware, getEmployeesByPosition);
router.get("/admin/balance", employeeAuthMiddleware, requireCEO, getBalance);

export default router;

