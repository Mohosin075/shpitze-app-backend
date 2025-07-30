import express from 'express';

import { ReportController } from './report.controller';
import validateRequest from '../../middlewares/validateRequest';
import { ReportValidation } from './report.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create-report',
  validateRequest(ReportValidation.reportSchema),
  auth(USER_ROLES.EMPLOYER),
  ReportController.createReportToDB
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  ReportController.getAllReportsFromDB
);

export const ReportRoutes = router;
