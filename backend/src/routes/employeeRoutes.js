import { Router } from "express";
import { login, profile, register, updateProfile } from "../controllers/employeeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateFields } from "../middlewares/validateFields.js";
import { uploadEmployee } from "../middlewares/uploadEmployeeMiddleware.js";

const router = Router();

router.post(
  "/register",
  validateFields({
    name: {
      required: true,
      requiredMessage: "Informe seu nome completo."
    },
    cpf: {
      required: true,
      requiredMessage: "Informe seu CPF."
    },
    email: {
      required: true,
      type: "email",
      requiredMessage: "Informe um e-mail válido."
    },
    password: {
      required: true,
      min: 6,
      minMessage: "A senha deve conter no mínimo 6 caracteres."
    },
    passwordConfirm: {
      required: true,
      requiredMessage: "Confirme sua senha."
    },
    position: {
      required: true,
      requiredMessage: "Selecione um cargo."
    }
  }),
  register
);

router.post(
  "/login",
  validateFields({
    cpf: {
      required: true,
      requiredMessage: "Informe seu CPF."
    },
    password: {
      required: true,
      requiredMessage: "Informe sua senha."
    }
  }),
  login
);

router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, uploadEmployee.single("imagem"), updateProfile);

export default router;

