import express from "express"
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { BookingController } from "./booking.controller";
const router = express.Router();

router.post("/", auth(USER_ROLES.EMPLOYER), BookingController.createBooking);
router.get("/", auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), BookingController.getBookings);
router.get("/employer", auth(USER_ROLES.EMPLOYER), BookingController.employerBooking);
router.get("/provider", auth(USER_ROLES.PROVIDER), BookingController.providerBooking);

router.patch("/:id", auth(USER_ROLES.PROVIDER, USER_ROLES.EMPLOYER), BookingController.respondBooking);
router.patch("/confirm/:id", auth(USER_ROLES.EMPLOYER), BookingController.confirmBooking);

router.post("/:id", auth(USER_ROLES.EMPLOYER), BookingController.cancelBooking);

export const BookingRoutes = router;