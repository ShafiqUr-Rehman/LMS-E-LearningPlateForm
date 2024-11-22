import dotenv from "dotenv";
import redisClient from '../utilis/redis.js';

dotenv.config();


const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || "300",10);
const accessRefreshExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || "300",10);
export const accessTokenOptions = {
    // Set the expiration time for the access token cookie
    expires: new Date(Date.now() + accessTokenExpire * 60 * 1000), // Access token expires after 'accessTokenExpire' minutes
    maxAge: accessTokenExpire * 60 * 1000, // Max age for access token cookie (in milliseconds)
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    sameSite: 'lax', // Cookie will be sent only to the same origin or top-level navigation
};
export const refreshTokenOptions = {
    // Set the expiration time for the refresh token cookie
    expires: new Date(Date.now() + accessRefreshExpire * 1000), // Refresh token expires after 'accessRefreshExpire' seconds (3 days)
    maxAge: accessRefreshExpire * 1000, // Max age for refresh token cookie (in milliseconds)
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    sameSite: 'lax', // Cookie will be sent only to the same origin or top-level navigation
};

export const sendToken = async (user, statusCode, res) => {
    // Store user data in Redis
    console.log('Storing user in Redis:', user._id.toString());
    await redisClient.set(user._id.toString(), JSON.stringify(user), {
        EX: 90 * 24 * 60 * 60 // 90 days in seconds
    });
    console.log('User stored in Redis');


    // Create access and refresh tokens using the instance methods
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
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
