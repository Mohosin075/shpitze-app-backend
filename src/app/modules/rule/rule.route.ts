import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { RuleController } from './rule.controller';
const router = express.Router();

//privacy policy
router
  .route('/privacy-policy')
  .post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createPrivacyPolicy)
  .get(RuleController.getPrivacyPolicy);

//terms and conditions
router
  .route('/terms-and-conditions')
  .post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createTermsAndCondition)
  .get(RuleController.getTermsAndCondition);

//privacy policy
router
  .route('/about')
  .post(auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN), RuleController.createAbout)
  .get(RuleController.getAbout);

export const RuleRoutes = router;
