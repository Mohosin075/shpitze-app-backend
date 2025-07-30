import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ReportService } from './report.service';

const createReportToDB = catchAsync(async (req, res,) => {

  const payload = {
    employer : req.user?.id,
    ...req.body
  }
  const result = await ReportService.createReportToDB(payload);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Report created successfully',
    data: result,
  });
});

const getAllReportsFromDB = catchAsync(async (req, res, next) => {
  const result = await ReportService.getAllReportsFromDB(req.query);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Report Retrieved successfully',
    data: result,
  });
});

export const ReportController = {
  createReportToDB,
  getAllReportsFromDB,
};
