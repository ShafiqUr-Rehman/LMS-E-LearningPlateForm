import ErrorHandler from "../utilis/ErrorHandler.js";
import User from "../models/user.model.js";
import { generateLast12MonthsData } from "../utilis/anaylatics.generator.js";
import Course from "../models/course.model.js";
import OrderModel from "../models/order.model.js";

// get User analytics --only Admins
export const getUserAnalytics = async (req, res, next) => {
    try {
        const users = await generateLast12MonthsData(User);
        res.status(201).json({
            success: true,
            users,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// get Course analytics --only Admins
export const getCourseAnalytics = async (req, res, next) => {
    try {
        const coures = await generateLast12MonthsData(Course);
        res.status(201).json({
            success: true,
            coures,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// get Orders analytics --only Admins
export const getOrderAnalytics = async (req, res, next) => {
    try {
        const orders = await generateLast12MonthsData(OrderModel);
        res.status(201).json({
            success: true,
            orders,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};