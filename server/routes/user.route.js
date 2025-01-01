import expres from "express"
import {
    registerUser, activateUser, LoginUser, LogoutUser, updateAccessToken,
    getUserInfo, socialAuth, updateUserInfo,updateUserPassword,updateUserAvatar,
     getAllUser,updateUserRole,deleteUser
} from "../controllers/user.controller.js"
import { isAuthenticated, authorizeRoles } from "../middleWare/auth.js"

const userRouter = expres.Router();
userRouter.post("/registration", registerUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login", LoginUser);
userRouter.get("/logout", isAuthenticated, LogoutUser);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/social-auth", socialAuth);
userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);
userRouter.put("/update-user-password", isAuthenticated, updateUserPassword);
userRouter.put("/update-user-avatar", isAuthenticated, updateUserAvatar);
userRouter.get("/get-all-users", isAuthenticated, authorizeRoles("admin") ,getAllUser);
userRouter.put("/update-user-role", isAuthenticated, authorizeRoles("admin") ,updateUserRole);
userRouter.delete("/delete-user/:id", isAuthenticated, authorizeRoles("admin") ,deleteUser);


// userRouter.get("/logout", isAuthenticated, (req, res, next) => {      to protect admin route must pass parameters
//     try {
//         authorizeRoles("admin", "user")(req, res, next);
//     } catch (error) {
//         console.error("Unexpected error in authorizeRoles:", error);
//         next(error);
//     }
// }, LogoutUser);


export default userRouter
