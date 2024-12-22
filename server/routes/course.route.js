import expres from "express"
import {
    uploadCourse
} from "../controllers/course.controller.js"
import { authorizeRoles, isAuthenticated } from "../middleWare/auth.js";


const courseRouter = expres.Router();
courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);

export default courseRouter