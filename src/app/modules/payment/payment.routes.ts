import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { PaymentController } from "./payment.controller";
const router = express.Router();

router.post("/",
    auth(USER_ROLES.EMPLOYER),
    PaymentController.createPaymentCheckout
);
router.post("/create-account",
    auth(USER_ROLES.PROVIDER),
    PaymentController.createAccountToStripe
);

export const PaymentRoutes = router;