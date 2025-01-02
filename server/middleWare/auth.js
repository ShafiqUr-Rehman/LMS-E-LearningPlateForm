import ErrorHandler from "../utilis/ErrorHandler.js";
import jwt from "jsonwebtoken";
import  redisClient  from "../utilis/redis.js";
import User  from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const access_token = req.cookies?.access_token;
        // console.log("Cookies received:", req.cookies);
        // console.log("Access token:", access_token);    

        if (!access_token) {
            return next(new ErrorHandler("Please login to access this resource", 401));
        }

        // Verify and decode the access token
        const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);
        if (!decoded) {
            return next(new ErrorHandler("Invalid token", 401));
        }

        if (!decoded.id) {
            return next(new ErrorHandler("Token does not contain a valid user ID", 401));
        }

        // Fetch user from Redis
        const user = await redisClient.get(decoded.id);
        if (!user) {
            // console.error("isAuthenticated Middleware: User not found in Redis");
            return next(new ErrorHandler("Please login to access this resource", 404));
        }

        req.user = JSON.parse(user); // Parse user data from Redis

        // console.log("isAuthenticated Middleware: req.user =", req.user);  
        next(); 

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new ErrorHandler("Invalid token", 401));
        }
        console.error("isAuthenticated Middleware Error:", error);
        return next(new ErrorHandler("Authentication failed", 500));
    }
};


// validate user role
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log("authorizeRoles Middleware triggered");
        console.log("Roles allowed:", roles);     //  Roles allowed: [ 'admin', 'user' ]
        console.log("User role:", req.user?.role);  // User role: user

        if (!req.user) {
            console.log("User not authenticated");
            return next(new ErrorHandler("Unauthorized: User not authenticated", 401));
        }
        if (!roles.includes(req.user.role)) {
            console.log(`Role ${req.user.role} not allowed`);
            return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`, 403));
        }
        console.log("Role authorized");
        next();
    };
};




