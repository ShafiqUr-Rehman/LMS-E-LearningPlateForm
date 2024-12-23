import expres from "express"
import {
    uploadCourse,editCourse,getSingleCourse, getAllCourse
} from "../controllers/course.controller.js"
import { authorizeRoles, isAuthenticated } from "../middleWare/auth.js";


const courseRouter = expres.Router();
courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourse);


export default courseRouter