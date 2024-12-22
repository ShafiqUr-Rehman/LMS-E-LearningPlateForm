import Course from "../models/course.model.js";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.services.js";
import ErrorHandler from "../utilis/ErrorHandler.js";

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
        next(error);
    }
};


