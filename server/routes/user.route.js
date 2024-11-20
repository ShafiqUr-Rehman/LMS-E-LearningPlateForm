import expres from "express"
import {registerUser,activateUser,LoginUser,LogoutUser} from "../controllers/user.controller.js"

const userRouter = expres.Router();
userRouter.post("/registration" , registerUser);
userRouter.post("/activate-user" , activateUser);
userRouter.post("/login" , LoginUser);
userRouter.get("/logout", LogoutUser);

export default userRouter
