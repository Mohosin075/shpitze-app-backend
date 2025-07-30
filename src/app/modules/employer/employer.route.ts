import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { EmployerController } from './employer.controller';

const router = express.Router();

router.patch(
  '/employer-update',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.ADMIN),
  EmployerController.updateEmployerToDB
);

router.get(
  '/',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.ADMIN),
  EmployerController.getAllEmployerFromDb
);

router.delete(
  '/:id',
  auth(USER_ROLES.EMPLOYER, USER_ROLES.ADMIN),
  EmployerController.deleteEmployers
);

export const EmployerRoutes = router;
