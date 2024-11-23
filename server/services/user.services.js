// user.services.js
import redisClient from "../utilis/redis.js";

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
