import ErrorHandler from "../utilis/ErrorHandler.js";
import jwt from "jsonwebtoken";
import  redisClient  from "../utilis/redis.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const access_token = req.cookies?.access_token; 
        console.log("Cookies received:", req.cookies);
        console.log("Access token:", access_token);

        if (!access_token) {
            return next(new ErrorHandler("Please login to access this resource", 401));
        }

        const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);
        if (!decoded || !decoded.id) {
            return next(new ErrorHandler("Access token is not valid", 401));
        }

        const user = await redisClient.get(decoded.id);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }

        req.user = JSON.parse(user);
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new ErrorHandler("Invalid token", 401));
        }
        return next(new ErrorHandler(error.message || "Authentication failed", 500));
    }
};

