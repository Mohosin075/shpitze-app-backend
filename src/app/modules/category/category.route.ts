import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { CategoryController } from './category.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';
const router = express.Router();

router.post(
  '/create-category',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  fileUploadHandler(),
  validateRequest(CategoryValidation.createCategory),
  CategoryController.createCategory
);

router.get(
  '/:subCategory',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.PROVIDER),
  CategoryController.getSubCategoryByCategory
);

router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  fileUploadHandler(),
  validateRequest(CategoryValidation.updatedCategory),
  CategoryController.updateCategoryToDB
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.EMPLOYER, USER_ROLES.PROVIDER),
  CategoryController.getAllCategory
);
router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  CategoryController.getSingleCategoryFromDB
);
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  CategoryController.deleteCategoryFromDB
);

export const CategoryRoutes = router;
