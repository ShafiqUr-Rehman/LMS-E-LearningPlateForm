import expres from "express"
import {
    uploadCourse,editCourse,getSingleCourse, getAllCourse,getCourseByUser,addQuestions,
    AddAnswer, addReview, addReplyToReview,getAllCourses
} from "../controllers/course.controller.js"
import { authorizeRoles, isAuthenticated, } from "../middleWare/auth.js";


const courseRouter = expres.Router();
courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);
courseRouter.put("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourse);
courseRouter.get("/get-course-content/:id",isAuthenticated ,getCourseByUser);
courseRouter.put("/add-question",isAuthenticated ,addQuestions);
courseRouter.put("/add-answer",isAuthenticated ,AddAnswer);
courseRouter.put("/add-review/:id",isAuthenticated ,addReview);
courseRouter.put("/add-reply",isAuthenticated , authorizeRoles("admin"), addReplyToReview);
courseRouter.get("/get-all-courses",isAuthenticated , authorizeRoles("admin"), getAllCourses);


export default courseRouter