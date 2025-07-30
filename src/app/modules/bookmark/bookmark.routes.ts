import express from "express";
import { BookmarkController } from "./bookmark.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";

const router = express.Router();

router.get("/", auth(USER_ROLES.EMPLOYER), BookmarkController.getBookmark);
router.post("/:id", auth(USER_ROLES.EMPLOYER), BookmarkController.toggleBookmark);
router.get("/location", BookmarkController.location);

export const BookmarkRoutes = router;
