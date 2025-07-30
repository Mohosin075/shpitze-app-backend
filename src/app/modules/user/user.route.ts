import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/create-employer')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createEmployer
  )

router
  .route('/profile-update')
  .patch(
    auth(USER_ROLES.EMPLOYER, USER_ROLES.PROVIDER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    UserController.updateProfile
  );

router
  .route('/create-provider')
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createProvider
  )

router.get(
  '/profile',
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.PROVIDER,
    USER_ROLES.EMPLOYER
  ),
  UserController.getUserProfile
);


router.patch('/update-location',
  auth(USER_ROLES.PROVIDER, USER_ROLES.EMPLOYER),
  UserController.updateLocation
);

router.get('/provider-profile',
  auth(USER_ROLES.PROVIDER),
  UserController.getProviderProfile
);

router.get('/provider',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  UserController.getProviderList
)
;router.get('/employer',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  UserController.getEmployerList
);

router.get('/:id',
  auth(USER_ROLES.EMPLOYER),
  UserController.getProviderDetails
);

export const UserRoutes = router;
