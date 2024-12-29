import OrderModel from "../models/order.model.js";
import ErrorHandler from "../utilis/ErrorHandler.js";

export const newOrder = async (data, res, next) => {
    try {
        const order = await OrderModel.create(data);
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Failed to create order", 500));
    }
};

// Get All Orders
export const getAllOrderService = async (req, res, next) => {
    try {
        const orders = await OrderModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(new ErrorHandler(error.message, 500)); 
    }
};
