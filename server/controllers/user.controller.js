//controller.js
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utilis/ErrorHandler.js";
import sendMail from '../utilis/send.mail.js';
import dotenv from "dotenv";
import ejs from "ejs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sendToken } from "../utilis/jwt.js";
import redisClient from "../utilis/redis.js";
import {accessTokenOptions , refreshTokenOptions} from "../utilis/jwt.js";
import { getUserById } from "../services/user.services.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DEFAULT_AVATAR = {
    public_id: 'default_avatar_public_id',
    url: 'https://example.com/default-avatar.png'
};

const createActivationToken = (userData) => {
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("ACTIVATION_SECRET:", process.env.ACTIVATION_SECRET);
    if (!process.env.ACTIVATION_SECRET) {
        throw new Error("ACTIVATION_SECRET is not set in the environment variables");
    }
    const token = jwt.sign({
        userData,
        activationCode
    }, process.env.ACTIVATION_SECRET, {
        expiresIn: "5m",
    });
    return { token, activationCode };
};

export const registerUser = async (req, res, next) => {
    console.log("Received registration request:", req.body);
    try {
        const { name, email, password } = req.body;
        const isEmailExists = await User.findOne({ email });
        if (isEmailExists) {
            return next(new ErrorHandler("Email already exists!", 400));
        }

        // Generate activation token
        const { token: activationToken, activationCode } = createActivationToken({ name, email, password });

        const data = { user: { name }, activationCode };
        const templatePath = join(__dirname, '..', 'mails', 'activation-mail.ejs');
        console.log("Template path:", templatePath);

        try {
            const html = await ejs.renderFile(templatePath, data);
            await sendMail({
                email: email,
                subject: "Activate your email",
                html: html,
            });

            res.status(200).json({
                success: true,
                message: `Please check your email ${email} to activate your account`,
                activationToken,
            });
        } catch (error) {
            console.error("Error in email sending:", error);
            return next(new ErrorHandler(error.message, 500));
        }
    } catch (error) {
        console.error("Error in user registration:", error);
        return next(new ErrorHandler(error.message, 500));
    }
};

export const activateUser = async (req, res, next) => {
    try {
        const { activationToken, activationCode } = req.body;

        const { userData, activationCode: tokenCode } = jwt.verify(
            activationToken,
            process.env.ACTIVATION_SECRET
        );

        if (tokenCode !== activationCode) {
            return next(new ErrorHandler("Invalid activation code", 404));
        }

        const { name, email, password } = userData;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler("Email already exists", 400));
        }
        const newUser = new User({
            name,
            email,
            password,
            avatar: DEFAULT_AVATAR,
        });
        await newUser.save();
        res.status(201).json({
            success: true,
            message: "User activated successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
};


export const LoginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler("please enter email or password"));
        }
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new ErrorHandler("Invalid email or password"));
        }
        const isPasswordMatch = await user.comparePassword(password);  // call the comparePassword funciton
        if (!isPasswordMatch) {
            return next(new ErrorHandler("Invalid Email or password"));
        }

        // Pass the user instance to sendToken function
        sendToken(user, 200, res); 
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
};


export const LogoutUser = async (req, res, next) => {
    try {
        res.cookie("access_token", "", { maxAge: 1, httpOnly: true, secure: process.env.NODE_ENV === "production" });
        res.cookie("refresh_token", "", { maxAge: 1, httpOnly: true, secure: process.env.NODE_ENV === "production" });

        const userId = req.user?._id?.toString();
        if (userId) {
            await redisClient.del(userId);
        }

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// Function to update access token using a new refresh token name
export const updateAccessToken = async (req, res, next) => {
    try {
        const newRefreshToken = req.cookies?.refresh_token;
        const decoded = jwt.verify(newRefreshToken, process.env.REFRESH_TOKEN);
        if (!decoded) {
            return next(new ErrorHandler("Could not refresh token", 400)); 
        }

        // Get the user session from Redis using the decoded user ID
        const session = await redisClient.get(decoded.id);
        if (!session) {
            return next(new ErrorHandler("Could not refresh token", 400)); 
        }

        // Parse session data to get user information
       // The JSON.parse() method is used to convert a JSON-formatted string into a JavaScript object adn vice versa
        const user = JSON.parse(session);

        // Create new access token and refresh token
        const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, {
            expiresIn: "5m", 
        });

        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN, {
            expiresIn: "3d", 
        });

        // Set the new tokens in cookies and send the response
        res.cookie("access_token", accessToken,accessTokenOptions); 
        res.cookie("refresh_token", refreshToken,refreshTokenOptions); 
        res.status(200).json({
            success: true,
            message: "Tokens refreshed successfully",
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500)); 
    }
};

// get User (load user)
export const getUserInfo = async (req, res, next) => {
    try {
        const userId = req.user?._id; // Extract user ID from the authenticated request
        await getUserById(userId, res); // Pass the userId directly
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// Social Auth function
export const socialAuth = async (req, res, next) => {
    try {
        const {name,email,avatar} = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            const newUser = await User.create({ name,email,avatar}); // Await added here
            sendToken(newUser, 200, res); 
        } else {
            sendToken(user, 200, res); 
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 400));
    }
};

// update User info


