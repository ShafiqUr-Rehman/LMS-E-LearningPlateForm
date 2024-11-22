import expres from "express"
import {registerUser,activateUser,LoginUser,LogoutUser,updateAccessToken} from "../controllers/user.controller.js"
import {isAuthenticated, authorizeRoles}  from "../middleWare/auth.js"

const userRouter = expres.Router();
userRouter.post("/registration" , registerUser);
userRouter.post("/activate-user" , activateUser);
userRouter.post("/login" , LoginUser);
userRouter.get("/logout", isAuthenticated, LogoutUser);
userRouter.get("/refresh", updateAccessToken);

// userRouter.get("/logout", isAuthenticated, (req, res, next) => {      to protect admin route must pass parameters
//     try {
//         authorizeRoles("admin", "user")(req, res, next);
//     } catch (error) {
//         console.error("Unexpected error in authorizeRoles:", error);
//         next(error);
//     }
// }, LogoutUser);


export default userRouter
