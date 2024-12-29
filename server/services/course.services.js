import Course from "../models/course.model.js";
import ErrorHandler from "../utilis/ErrorHandler.js";

export const createCourse = async (data, res, next) => {
    try {
        const course = await Course.create(data);
        res.status(201).json({
            success: true,
            course,
        });
    } catch (error) {
        next(error); 
    }
};

// Get All Courses  
export const getAllCourseService = async (req, res, next) => {
    try {
        const courses = await Course.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            courses,
        });
    } catch (error) {
        next(new ErrorHandler(error.message, 500)); 
    }
};

