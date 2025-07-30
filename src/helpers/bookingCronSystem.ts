import cron from "node-cron";
import { Booking } from "../app/modules/booking/booking.model";
import { logger } from "../shared/logger";
import { PROVIDER_NOTIFICATION } from "../enums/notification";
import { sendNotifications } from "./notificationsHelper";

export const bookingAcceptAutomation = () => {
    const HOURS_THRESHOLD = 24; // Change to 24 hours

    cron.schedule("0 * * * *", async () => { // Runs every hour at the 0th minute
        try {
            const cutoffDate = new Date(Date.now() - HOURS_THRESHOLD * 60 * 60 * 1000);

            // Find all bookings older than 24 hours with a 'Pending' status
            const bookings = await Booking.find({
                status: 'Pending',
                createdAt: { $lt: cutoffDate },
            });

            if (bookings.length === 0) {
                logger.info("No bookings found to update.");
                return;
            }

            // Update the status of all these bookings
            const bookingIds = bookings.map((booking) => booking._id);
            const result = await Booking.updateMany(
                { _id: { $in: bookingIds } },
                { $set: { status: 'Accept' } }
            );

            // Send notifications for each updated booking
            for (const booking of bookings) {
                const notificationData = {
                    text: `The hygienist has not responded to your booking request. You can resend the request or book another ${booking.category}.`,
                    title: PROVIDER_NOTIFICATION.BOOKING_REQUEST,
                    link: booking._id, // Assuming a link to the booking details
                    direction: "booking",
                    receiver: booking.employer
                };

                await sendNotifications(notificationData);
            }






            // logger.info(`Updated ${result.modifiedCount} bookings to 'Accept' and sent notifications.`);
        } catch (error) {
            logger.error("Error during booking automation task:", error);
        }
    });

    logger.info("Booking automation job scheduled to run every hour.");
};

export const bookingCompleteAutomation = () => {
    const HOURS_THRESHOLD = 48; // Change to 48 hours

    cron.schedule("0 * * * *", async () => { // Runs every hour at the 0th minute
        try {
            const cutoffDate = new Date(Date.now() - HOURS_THRESHOLD * 60 * 60 * 1000);

            // Find all bookings older than 24 hours with a 'Pending' status
            const bookings = await Booking.find({
                status: 'Accept',
                createdAt: { $lt: cutoffDate },
            });

            if (bookings.length === 0) {
                logger.info("No bookings found to update.");
                return;
            }

            await Promise.all(bookings.map(async (booking) => {
                booking.schedule.forEach((schedule:any) => {
                    const scheduleDate = new Date(schedule?.date);
                    if (scheduleDate < cutoffDate) {
                        return Booking.updateOne({ _id: booking._id }, { status: 'Complete' });
                    }
                });
            }));

            

            // Update the status of all these bookings
            const bookingIds = bookings.map((booking) => booking._id);
            const result = await Booking.updateMany(
                { _id: { $in: bookingIds } },
                { $set: { status: 'Complete' } }
            );

            // Send notifications for each updated booking
            for (const booking of bookings) {
                const notificationData = {
                    text: `The shift on [Date and Time] has been automatically marked as completed after 48 hours without confirmation.`,
                    title: PROVIDER_NOTIFICATION.BOOKING_REQUEST,
                    link: booking._id, // Assuming a link to the booking details
                    direction: "booking",
                    receiver: booking.employer
                };

                await sendNotifications(notificationData);
            }




            

            // logger.info(`Updated ${result.modifiedCount} bookings to 'Accept' and sent notifications.`);
        } catch (error) {
            logger.error("Error during booking automation task:", error);
        }
    });

    logger.info("Booking automation job scheduled to run every hour.");
};