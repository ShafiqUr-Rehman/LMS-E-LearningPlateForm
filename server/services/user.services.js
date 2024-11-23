// user.services.js
import User from "../models/user.model.js"

export const getUserById = async (id, res) => {
    try {
        // Correcting the method call: Passing the ID directly
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};