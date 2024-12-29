import ErrorHandler from "../utilis/ErrorHandler.js";
import sendMail from "../utilis/send.mail.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import OrderModel from "../models/order.model.js";
import NotificationModel from "../models/notification.model.js";
import cron from "node-cron";


// get all notification  --- only for Admin
export const getNotification = async(req,res,next)=>{
    try {
        const notification = await NotificationModel.find().sort({createdAt :-1}); // sort notification in reverse order... means get the new notificatoin at top

        res.status(201).json({
            success : "true",
            notification,
        })
        
    } catch (error) {
        return next(new ErrorHandler(error.message,500));
    }
}
// update notification status -- only Admin
export const updateNotification = async (req, res, next) => {
    try {
        const notification = await NotificationModel.findById(req.params.id);
        if (!notification) {
            return next(new ErrorHandler("Notification not found", 404));
        }

        notification.status = "read";
        await notification.save();

        const notifications = await NotificationModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// delete notification --only Admin
cron.schedule("0 0 * * *", async () => {    // Schedule a cron job to run daily
    try {
        console.log("Running daily notification cleanup");

        // Calculate the date 30 days ago
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        await NotificationModel.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
        console.log("Deleted Read notifications successfully.");
    } catch (error) {
        console.error("Error deleting old notifications:", error.message);
    }
});


