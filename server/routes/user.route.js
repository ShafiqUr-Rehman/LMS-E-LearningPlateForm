import expres from "express"
import {registerUser,activateUser,LoginUser,LogoutUser} from "../controllers/user.controller.js"
import {isAuthenticated}  from "../middleWare/auth.js"

const userRouter = expres.Router();
userRouter.post("/registration" , registerUser);
userRouter.post("/activate-user" , activateUser);
userRouter.post("/login" , LoginUser);
userRouter.get("/logout", isAuthenticated,LogoutUser);

export default userRouter
