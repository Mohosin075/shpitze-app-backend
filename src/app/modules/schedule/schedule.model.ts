import { model, Schema } from "mongoose";
import { ISchedule, ScheduleModel } from "./schedule.interface";

const scheduleSchema = new Schema<ISchedule, ScheduleModel>(
    {   
        provider: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String,
            required: true,
        },
        month: {
            type: String,
            enum: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            required: true,
        },
        year: {
            type: String,
            required: false,
            default: new Date().getFullYear().toString()
        },
        repeated: { type: String },
        times: [
            {
                time: {
                    type: String,
                    required: true,
                },
                status: {
                    type: String,
                    enum: ['booked', 'available'],
                    default: 'available'
                }
            }
        ]
    },
    {timestamps: true}
)

export const Schedule = model<ISchedule, ScheduleModel>("Schedule", scheduleSchema);