import Course from "../models/course.model.js";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services.js";
import ErrorHandler from "../utilis/ErrorHandler.js";
import redisClient from "../utilis/redis.js";

export const uploadCourse = async (req, res, next) => {
    try {
        const data = req.body;
        if (req.body.thumbnail) {
            try {
                const myCloud = await cloudinary.v2.uploader.upload(req.body.thumbnail, {
                    folder: "course",
                });

                data.thumbnail = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            } catch (uploadError) {
                return next(new ErrorHandler("Failed to upload thumbnail to Cloudinary", 500));
            }
        }

        if (!data.thumbnail) {
            data.thumbnail = {
                public_id: null,
                url: null,
            };
        }
        await createCourse(data, res, next);
    } catch (error) {
        next(error);
    }
};
export const editCourse = async (req, res, next) => {
    try {
        console.log(req.body);
        const courseId = req.params.id;
        const updates = req.body;
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }


        if (updates.thumbnail) {
            if (course.thumbnail && course.thumbnail.public_id) {
                await cloudinary.v2.uploader.destroy(course.thumbnail.public_id);
            }
            const myCloud = await cloudinary.v2.uploader.upload(updates.thumbnail, {
                folder: "course",
            });

            updates.thumbnail = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }

        const updatedCourse = await Course.findByIdAndUpdate(courseId, updates, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            course: updatedCourse,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// Get single Course -- without purchase
export const getSingleCourse = async (req, res, next) => {
    try {
        const courseId = req.params.id;

        const isCacheExist = await redisClient.get(courseId);

        if (isCacheExist) {
            console.log("Request hitting Redis");
            const course = JSON.parse(isCacheExist);
            return res.status(200).json({
                success: true,
                course
            });
        } else {
            console.log("Request hitting MongoDB");
            const course = await Course.findById(courseId)
                .select("-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links");

            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: "Course not found"
                });
            }

            await redisClient.set(courseId, JSON.stringify(course), {
                EX: 3600 // 1 hour expiration
            });

            return res.status(200).json({
                success: true,
                course
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// Get all course -- without purchase and some fields
export const getAllCourse = async (req, res, next) => {
    try {
        const isCashExists = await redisClient.get("allCourses");
        if (isCashExists) {
            const courses = JSON.parse(isCashExists);
            console.log("Request hitting Redis");
            return res.status(200).json({
                success: true,
                courses,
            });
        } else {
            const courses = await Course.find().select("-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links");
            console.log("Request hitting MongoDB");
            
            await redisClient.set("allCourses", JSON.stringify(courses));

            if (!courses || courses.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No courses found"
                });
            }

            return res.status(200).json({
                success: true,
                courses
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};



