import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { SubcategoryController } from './subcategory.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SubCategoryValidation } from './subcategory.validation';
const router = express.Router();

router.post(
  '/create-subcategory',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(SubCategoryValidation.createSubCategory),
  SubcategoryController.createSubcategory
);

// update subcategory
router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(SubCategoryValidation.updatedSubCategory),
  SubcategoryController.updateSubcategoryToDB
);

// delete subcategory
router.delete(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SubcategoryController.deleteSubcategoryFromDB
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  SubcategoryController.getAllSubcategory
);

export const SubcategoryRoutes = router;
