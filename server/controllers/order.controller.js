import ErrorHandler from "../utilis/ErrorHandler.js";
import sendMail from "../utilis/send.mail.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import OrderModel from "../models/order.model.js";
import NotificationModel from "../models/notification.model.js";
import ejs from "ejs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createOrder = async (req, res, next) => {
    try {
        const { courseId, userId } = req.body;
      
        const course = await Course.findById(courseId);
        if (!course) {
            return next(new ErrorHandler("Course not found", 404));
        }

        const user = await User.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
          // Check if user already purchased the course
          const courseAlreadyPurchased = user.courses.some(
              (course) => course.course_id.toString() === courseId
          );
  
          if (courseAlreadyPurchased) {
              return res.status(400).json({
                  success: false,
                  message: 'You have already purchased this course.',
              });
          }

        const orderData = {
            courseId: course._id,
            userId: user._id,
            payment_info: {
                method: "Credit Card",
                status: "Paid",
            },
        };

        const mailData = {
            order: {
                _id: course._id.toString().slice(0, 6),
                name: course.name,
                price: course.price,
                date: new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                items: [
                    {
                        name: course.name,
                        price: course.price,
                    },
                ],
            },
        };

        const templatePath = join(__dirname, "../mails/order-confirmation.ejs");
        const html = await ejs.renderFile(templatePath, {
            order: mailData.order,
            user: { name: user.name },
        });

        await sendMail({
            email: user.email,
            subject: "Order Confirmation",
            html,
        });

        if (!user.courses.some((c) => c.course_id === course._id.toString())) {
            user.courses.push({ course_id: course._id.toString() }); // Proper structure
            await user.save();
        }

        await NotificationModel.create({
            user: user._id,
            title: "New Order",
            message: `You have successfully ordered the course: ${course.name}.`,
        });

        course.purchase = course.purchase ? course.purchase + 1 : 1;
        await course.save();

        const newOrder = await OrderModel.create(orderData);

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: newOrder,
        });
    } catch (error) {
        return next(new ErrorHandler(error.message || "Internal Server Error", 500));
    }
};

