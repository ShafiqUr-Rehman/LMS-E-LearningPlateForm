import Course from "../models/course.model.js";

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
