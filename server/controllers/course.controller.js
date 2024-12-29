import Course from "../models/course.model.js";
import cloudinary from "cloudinary";
import { createCourse, getAllCourseService } from "../services/course.services.js";
import ErrorHandler from "../utilis/ErrorHandler.js";
import redisClient from "../utilis/redis.js";
import mongoose from "mongoose";
import sendMail from '../utilis/send.mail.js';

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


// get course content --only for valid users

export const getCourseByUser = async (req, res, next) => {
    try {
        const userCourseList = req.user?.courses; // Courses from user's profile
        const courseId = req.params.id;

        console.log("Requested Course ID:", courseId);
        console.log("User's Courses:", userCourseList);

        // Ensure the course exists in the user's list
        const courseExists = userCourseList?.find(course => course._id.toString() === courseId);
        if (!courseExists) {
            return next(new ErrorHandler("You are not eligible to access this course", 403));
        }

        // Fetch the course details from the database
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        console.log("Found Course:", course);

        // Extract course content
        const content = course.courseData;

        res.status(200).json({
            success: true,
            content,
        });
    } catch (error) {
        console.error("Error in getCourseByUser:", error.message);
        return next(new ErrorHandler(error.message, 500));
    }
};

// Add Questions in Course
export const addQuestions = async (req, res, next) => {
    try {
        const { question, courseId, contentId } = req.body;
        const course = await Course.findById(courseId);
        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return new (ErrorHandler("Invalid Content Id : ", 400));
        }
        const courseContent = course?.courseData?.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(ErrorHandler("Invalid Content Id :", 400));
        }
        //crete a new quesiton object
        const newQuestion = {
            user: req.user,
            question,
            questoinReplies: [],
        };
        // add this question to our couseeContent;
        courseContent.questions.push(newQuestion);
        await NotificationModel.create({
            user: req.user._id,
            title: "New Question Received",
            message: `You have a new Question in ${courseContent?.title}.`,
        });
        await course?.save();

        res.status(200).json({
            success: true,
            course,
        })
    } catch (error) {
        console.error("Cannot add Question please later", error.message);
        return next(new ErrorHandler(error.message, 500));
    }
}

// Add Anwsers in the Course Question
export const AddAnswer = async (req, res, next) => {
    try {
        const { answer, courseId, contentId, questionId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return next(new ErrorHandler("Invalid Course Id", 400));
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        if (!mongoose.Types.ObjectId.isValid(contentId)) {
            return next(new ErrorHandler("Invalid Content Id", 400));
        }

        const courseContent = course.courseData.find((item) => item._id.equals(contentId));
        if (!courseContent) {
            return next(new ErrorHandler("Invalid Content Id", 400));
        }

        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return next(new ErrorHandler("Invalid Question Id", 400));
        }

        const question = courseContent.questions.find((item) => item._id.equals(questionId));
        if (!question) {
            return next(new ErrorHandler("Invalid Question", 404));
        }

        // Create a new Answer
        const newAnswer = {
            user: req.user,
            answer,
            createdAt: new Date()
        };

        // Add this answer to our course
        if (!question.questoinReplies) {
            question.questoinReplies = [];
        }
        question.questoinReplies.push(newAnswer);

        // Mark the nested fields as modified
        course.markModified('courseData');
        await course.save();

        // Send notification email if the answer is not from the question creator
        if (req.user._id.toString() !== question.user._id.toString()) {
            const data = {
                name: question.user.name,
                title: courseContent.title,
            };
            try {
                
            // add notification later
                await NotificationModel.create({
                    user: req.user._id,
                    title: "New Question Reply Received",
                    message: `You have a new Question in ${courseContent?.title}.`,
                });

            } catch (error) {
                console.error("Error sending email:", error);
                // Continue execution even if email fails
            }
        } else {
            console.log("Condition not met: Answer is from the question creator");
        }
        res.status(200).json({
            success: true,
            course,
        });

    } catch (error) {
        console.error("Cannot add Answer:", error.message);
        return next(new ErrorHandler(error.message, 500));
    }
};

// Add Review in Course
export const addReview = async (req, res, next) => {
    try {
        const userCourselist = req.user?.courses;
        const courseId = req.params.id;

        // Check if the user has access to the course
        const courseExists = userCourselist?.some((course) => course._id.toString() === courseId.toString());
        if (!courseExists) return next(new ErrorHandler("You are not eligible to access this course", 404));

        const course = await Course.findById(courseId);
        const { review, rating } = req.body;

        // Add the review to the course
        const reviewData = { user: req.user, rating, comment: review };
        course?.reviews.push(reviewData);

        // Calculate the new average rating
        let avg = 0;
        course?.reviews.forEach((rev) => (avg += rev.rating));
        if (course) course.rating = avg / course.reviews.length;

        await course.save();

        // Notification placeholder (to be implemented later)
        const notification = {
            title: "New Review Received",
            message: `${req.user?.name} has given a review on your course ${course?.name}`,
        };

        res.status(200).json({
            success: true,
            course,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

// add Reply to the Review
export const addReplyToReview = async (req, res, next) => {
    try {
        const { comment, courseId, reviewId } = req.body;
        const course = await Course.findById(courseId);
        if (!course) return next(new ErrorHandler("Course not found", 404));

        const review = course.reviews.find((rev) => rev._id.toString() === reviewId);
        if (!review) return next(new ErrorHandler("Review not found", 404));

        if (!req.user) return next(new ErrorHandler("User not authenticated", 401));

        const replyData = { user: req.user._id, comment };
        if (!review.commentReplies) {
            review.commentReplies = []
        };
        review.commentReplies.push(replyData);
        await course.save();

        res.status(200).json({ success: true, course });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};



//Get all Courses --only Admin
export const getAllCourses = async (req, res, next) => {
    try {
        await getAllCourseService(req, res, next);
    } catch (error) {
        next(new ErrorHandler(error.message, 400));  
    }
};


