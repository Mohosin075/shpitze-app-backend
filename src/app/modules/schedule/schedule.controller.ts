import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import { ScheduleService } from './schedule.service';

const mySchedule = catchAsync(async(req:Request, res:Response)=>{

    const result = await ScheduleService.myScheduleFromDB(req.user, req.query);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Schedule Retrieved",
        data: result
    })
})


const providerSchedule = catchAsync(async(req:Request, res:Response)=>{
    const result = await ScheduleService.providerScheduleFromDB(req.params.id, req.query);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Schedule Retrieved",
        data: result
    })
})

const updateSchedule = catchAsync(async(req:Request, res:Response)=>{

    await ScheduleService.updateScheduleToDB(req.user, req.body);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Updated Schedule Successfully"
    })
})

const repeatedOff = catchAsync(async(req:Request, res:Response)=>{

    await ScheduleService.repeatedOffInDB(req.user);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Turn Off repeated Scheduling Successfully"
    })
})

export const ScheduleController = {
    mySchedule,
    providerSchedule,
    updateSchedule,
    repeatedOff
} 