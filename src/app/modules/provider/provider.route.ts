import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ProviderController } from './provider.controller';
const router = express.Router();

router.get(
  '/',
  // auth(USER_ROLES.PROVIDER, USER_ROLES.ADMIN),
  ProviderController.getAllProvider
);

router.delete(
  '/:id',
  auth(USER_ROLES.PROVIDER, USER_ROLES.ADMIN),
  ProviderController.deleteProviderFromDb
);

router.patch(
  '/education',
  auth(USER_ROLES.PROVIDER),
  ProviderController.updateEducation
);

export const ProviderRoutes = router;
