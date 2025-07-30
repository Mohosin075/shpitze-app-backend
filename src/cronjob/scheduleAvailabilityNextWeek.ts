import cron from "node-cron";
import moment from "moment";
import { Schedule } from "../app/modules/schedule/schedule.model";
import { Booking } from "../app/modules/booking/booking.model";

// Function to book the next full week
export const scheduleAvailabilityNextWeek = async () => {
    try {

        const today = new Date();
        const matchedDate = today.getDate() + ' ' + today.toLocaleString('en-US', { month: 'long' }) + ' ' + today.getFullYear();

        const users = await Schedule.find().distinct("provider");

        for (const user of users) {
            const update = await Schedule.findOne({ provider: user, repeated: matchedDate }).sort({ createdAt: -1 });
            if (update) {

                let lastDay = new Date(update.repeated as string);
                lastDay.setDate(lastDay.getDate() + 7);
                const lastDate = `${lastDay.getDate()} ${lastDay.toLocaleString('en-US', { month: 'long' })} ${lastDay.getFullYear()}`;

                for (let i = 0; i < 7; i++) {
                    let nextDay = new Date(update.repeated as string);
                    nextDay.setDate(nextDay.getDate() + 1 + i);
                    const nextDate = `${nextDay.getDate()} ${nextDay.toLocaleString('en-US', { month: 'long' })} ${nextDay.getFullYear()}`;

                    await Schedule.create({
                        provider: user,
                        date: nextDate,
                        repeated: lastDate,
                        month: nextDate?.split(" ")[1],
                        year: nextDate?.split(" ")[2],
                        times: update?.times?.map((time: any) => ({ time: time.time, status: "available" }))
                    })
                }
            }
        }

        console.log("Next week's schedules booked successfully.");
    } catch (error) {
        console.error("Error booking next week's schedule:", error);
    }
};


const makeComplete = async () => {
    try {
        const today = moment().startOf('day');

        // Find all bookings with schedule dates that might be in the past
        const bookings = await Booking.find({
            schedule: { $exists: true, $not: { $size: 0 } }
        });

        for (const booking of bookings) {
            const hasPastDate = booking.schedule.some((s:any) =>
                moment(s.date, 'DD MMMM YYYY').isBefore(today)
            );

            if (hasPastDate && booking.status !== 'Reject') {
                booking.status = 'Reject';
                await booking.save();
                console.log(`Booking ${booking._id} status updated to Reject.`);
            }
        }
    } catch (error) {
        console.error("Error updating booking status:", error);
    }
};

export const bookingCompleteAutomation = () => {
    cron.schedule("0 0 * * *", () => {
        console.log("Running schedule update...");
        scheduleAvailabilityNextWeek();
        makeComplete();
    });
}