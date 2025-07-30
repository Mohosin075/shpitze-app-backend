import express from 'express';

import { ServiceListController } from './serviceList.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ServiceListValidationZodSchema } from './serviceList.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/create-serviceList',
  fileUploadHandler(),
  // validateRequest(ServiceListValidationZodSchema.createServiceListSchema),
  auth(USER_ROLES.PROVIDER),
  ServiceListController.createServiceListToDB
);

router.get(
  '/service-details',
  auth(USER_ROLES.PROVIDER),
  ServiceListController.serviceDetails
);

router.get(
  '/:subCategory',
  auth(USER_ROLES.EMPLOYER),
  ServiceListController.getServiceBySubCategory
);

router.patch('/',
  auth(USER_ROLES.PROVIDER),
  ServiceListController.updateServiceToDB
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  ServiceListController.getAllServiceListFromDB
);



export const ServiceListRoute = router;
