import { Router } from "express";
import * as medicineController from "../controller/medicine.controller.js";

import { validateJWT } from "../../middlewares/JWT.middleware.js";
import { verifyAdminRole } from "../../middlewares/role.middleware.js";

const router = Router();

router.use(validateJWT, verifyAdminRole);

router.get("/", medicineController.getMedicines);

router.get("/:id", medicineController.getMedicine);

router.post("/", medicineController.createMedicine);

router.put("/:id", medicineController.updateMedicine);

router.patch("/:id", medicineController.deactivateMedicine);

export default router;