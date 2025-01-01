
import User from "../models/user.model.js";
import redisClient from "../utilis/redis.js";
import ErrorHandler from "../utilis/ErrorHandler.js";

export const getUserById = async (id, res) => {
    try {
        const userJson = await redisClient.get(id);

        // Check if data is found
        if (!userJson) {
            return res.status(404).json({
                success: false,
                message: "User not found in Redis",
            });
        };
        if (userJson) {
            const user = JSON.parse(userJson);
            res.status(200).json({
                success: true,
                user,
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All User Services
export const getAllUserService = async (req, res, next) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        next(new ErrorHandler(error.message, 500)); // Properly use next
    }
};

// Update user role 
export const updateUserRoleService = async (id, role, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            return next(new ErrorHandler('User not found', 404));
        }
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(new ErrorHandler(error.message, 500));
    }
};



