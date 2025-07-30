import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { ScheduleController } from "./schedule.controller";
const router = express.Router();

router.get("/mySchedule", auth(USER_ROLES.PROVIDER), ScheduleController.mySchedule);
router.post("/turn-off", auth(USER_ROLES.PROVIDER), ScheduleController.repeatedOff);
router.get("/providerSchedule/:id", auth(USER_ROLES.EMPLOYER), ScheduleController.providerSchedule);
router.patch("/update-schedule", auth(USER_ROLES.PROVIDER), ScheduleController.updateSchedule);

export const ScheduleRoutes = router;