import { Router } from "express";
import {
  getAllEmployees,
  deleteEmployee,
  getAllUsers,
  deleteUser
} from "../controllers/adminController.js";
import { employeeAuthMiddleware, requireCEO } from "../middlewares/employeeAuthMiddleware.js";

const router = Router();

router.get("/employees", employeeAuthMiddleware, requireCEO, getAllEmployees);
router.delete("/employees/:id", employeeAuthMiddleware, requireCEO, deleteEmployee);
router.get("/users", employeeAuthMiddleware, requireCEO, getAllUsers);
router.delete("/users/:id", employeeAuthMiddleware, requireCEO, deleteUser);

export default router;




