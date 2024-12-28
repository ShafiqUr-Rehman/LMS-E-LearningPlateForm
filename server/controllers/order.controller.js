
import ErrorHandler from "../utilis/ErrorHandler.js";
import redisClient from "../utilis/redis.js";
import mongoose from "mongoose";
import sendMail from '../utilis/send.mail.js';
import User from "../models/user.model.js"
import Course from "../models/course.model.js";
import OrderModel from "../models/order.model.js";
import NotificationModel from "../models/notification.model.js";
import ejs from "ejs";
import path from "path";

// create order
export const createOrder = async(req,res,next)=>{
    try {
        
    } catch (error) {
        return next(new ErrorHandler("",404));
    }
}