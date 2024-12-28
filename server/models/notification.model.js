import mongoose from "mongoose";
const { Schema } = mongoose;  

const notificationSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "unread",
    }
}, { timestamps: true }); 

const NotificationModel = mongoose.model("Notification", notificationSchema);
export default NotificationModel;
