import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BookmarkService } from "./bookmark.service";

interface LocationData {
    user: string;
    latitude: number;
    longitude: number;
    active: boolean;
}

const toggleBookmark = catchAsync(async(req: Request, res: Response)=>{
    const employer = req.user.id;
    const service = req.params.id;
    const payload = { employer, service }
    const result = await BookmarkService.toggleBookmark(payload);
    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result
    })
});

const getBookmark = catchAsync(async(req: Request, res: Response)=>{
    const user = req.user;
    const result = await BookmarkService.getBookmark(user);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Bookmark Retrieved Successfully",
        data: result
    })
});

const location = catchAsync(async(req: Request, res: Response)=>{
    //@ts-ignore
    const socketIo = global.io;

    const data = {
        longitude: "2244",
        latitude: "2244"
    }
    socketIo.emit('watch', data);


    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Bookmark Retrieved Successfully",
        // data: result
    })
});


export const BookmarkController = {toggleBookmark, location, getBookmark}