import dotenv from "dotenv";
import redis from "redis";
import User from "../models/user.model.js";

dotenv.config();


export const sendToken = async (user, statusCode, res) => {
     //upload session to the redis
     redis.set(User._id, JSON.stringify(user));
     
    // Create access and refresh tokens using the instance methods
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();

    // Options for cookies
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
    const accessRefreshExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);

    const accessTokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax',
    };

    const refreshTokenOptions = {
        expires: new Date(Date.now() + accessRefreshExpire * 1000),
        maxAge: accessRefreshExpire * 1000,
        httpOnly: true,
        sameSite: 'lax',
    };

    // If in production, ensure cookies are secure
    if (process.env.NODE_ENV === "production") {
        accessTokenOptions.secure = true;
        refreshTokenOptions.secure = true;
    }

    // Send the tokens as cookies and respond with the user info
    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user, // Send the user data
        accessToken, // Optionally send the token in the response
    });
};
