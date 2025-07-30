import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { PaymentService } from "./payment.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createPaymentCheckout = catchAsync(async (req: Request, res: Response) => {

    const result = await PaymentService.createCheckoutPaymentInDB(req.user, req.body);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Recharge Make Successfully",
        data: result
    })

});

const createAccountToStripe = catchAsync(async(req: Request, res: Response)=>{
    const result = await PaymentService.createAccountToStripe(req.user);
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Connected account created successfully",
        data: result
    })
});


export const PaymentController = {
    createPaymentCheckout,
    createAccountToStripe
}