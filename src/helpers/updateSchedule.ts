import mongoose from "mongoose";
import { IBooking } from "../app/modules/booking/booking.interface";
import { Schedule } from "../app/modules/schedule/schedule.model";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const updateSchedule = async (payload: any) => {

    const { schedule }: {schedule :any} = payload;

    for (const date of schedule) {
        const isExistDate:any = await Schedule.findById({_id: new mongoose.Types.ObjectId(date?.id)});

        if(!isExistDate){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Schedule")
        }
        
        if(isExistDate?.times){
            for (const time of isExistDate?.times) {
                for (const updatedTime of date?.times) {
                    if(time.time === updatedTime){
                        time.status = "booked"
                    }

                }
            }
        }
        await isExistDate.save();
    }
}

export default updateSchedule;
