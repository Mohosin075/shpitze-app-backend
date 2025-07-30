import { JwtPayload } from "jsonwebtoken"
import { ISchedule } from "./schedule.interface"
import { Schedule } from "./schedule.model"
import mongoose, { UpdateResult } from "mongoose";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";


const myScheduleFromDB = async (user: JwtPayload, queries:any): Promise<ISchedule[]> => {

    const anyConditions = [];
    anyConditions.push({
        provider: user?.id
    });

    // filter by month and year
    if(Object.keys(queries).length){
        anyConditions.push({
            $and: Object.entries(queries).map(([field, value])=>({
                [field]: value
            }))
        })
    }

    const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};

    const result = await Schedule.find(whereConditions).lean();
    return result;
};


const providerScheduleFromDB= async (id:string, queries:any): Promise<ISchedule[]>=>{

    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Id")
    }

    const anyConditions = [];
    anyConditions.push({
        provider: id
    });

    // filter by month and year
    if(Object.keys(queries).length){
        anyConditions.push({
            $and: Object.entries(queries).map(([field, value])=>({
                [field]: value
            }))
        })
    }

    const whereConditions = anyConditions.length > 0 ? { $and: anyConditions } : {};

    const result = await Schedule.find(whereConditions).lean();
    return result;
}


const updateScheduleToDB = async (user:JwtPayload, payload: any): Promise<ISchedule | undefined> => {
    const { newDate, removeDate } = payload;

    if (newDate) {
        for (const element of newDate) {
            // Find the existing schedule for the date
            const isExistDate: any = await Schedule.findOne({ date: element.date });

            if (isExistDate) {

                // Get a list of existing times
                const existingTimes = isExistDate.times.map((entry: any) => entry.time);

                // Filter out the times that already exist
                const newTimes = element.times.filter((time: string) => !existingTimes.includes(time));

                // Use $addToSet to avoid duplicate times
                await Schedule.findOneAndUpdate(
                    { date: element.date },
                    {
                        $addToSet: {
                            times: { $each: newTimes?.map((time: string) => ({ time })) }
                        }
                    },
                    { new: true }
                );
            } else {
                // If no schedule exists for the date, create a new one
                await Schedule.create({
                    provider: user?.id,
                    date: element.date,
                    repeated: element?.repeated ? element?.repeated : undefined,
                    month: element?.date?.split(" ")[1],
                    year: element?.date?.split(" ")[2],
                    times: element.times.map((time: string) => ({ time }))
                });
            }
        }
    }

    if(removeDate){
        for (const element of removeDate) {
            await Schedule.findOneAndUpdate(
                { date: element.date },
                {
                    $pull: {
                        times: { _id: element.id }
                    }
                },
                { new: true }
            );
        }
    }

    return;
};

const repeatedOffInDB = async (user: JwtPayload) => {

    const schedule = await Schedule.updateMany(
        { provider: user?.id },
        { $set : { repeated: undefined }  },
        { new: true }
    );

    if(!schedule.modifiedCount){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to update schedule")
    }
    return schedule;
};


export const ScheduleService = {
    providerScheduleFromDB,
    myScheduleFromDB,
    updateScheduleToDB,
    repeatedOffInDB
}