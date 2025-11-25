import { Router } from "express";
import { createRecharge, getRecharges, deleteRecharge } from "../controllers/rechargeController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateFields } from "../middlewares/validateFields.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  validateFields({
    local: {
      required: true,
      requiredMessage: "Informe o local da recarga."
    },
    endereco: {
      required: true,
      requiredMessage: "Informe o endereço."
    },
    dataHora: {
      required: true,
      requiredMessage: "Informe a data e hora."
    },
    duracao: {
      required: true,
      requiredMessage: "Informe a duração."
    },
    energia: {
      required: true,
      requiredMessage: "Informe a energia consumida."
    },
    custo: {
      required: true,
      requiredMessage: "Informe o custo."
    }
  }),
  createRecharge
);

router.get("/", getRecharges);

router.delete("/:id", deleteRecharge);

export default router;


