import { Router } from "express";
import { login, profile, register, updateProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateFields } from "../middlewares/validateFields.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.post(
  "/register",
  validateFields({
    name: {
      required: true,
      requiredMessage: "Informe seu nome completo."
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
    }
  }),
  register
);

router.post(
  "/login",
  validateFields({
    email: {
      required: true,
      type: "email",
      requiredMessage: "Informe um e-mail válido."
    },
    password: {
      required: true,
      requiredMessage: "Informe sua senha."
    }
  }),
  login
);

router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, upload.single("imagem"), updateProfile);

export default router;

