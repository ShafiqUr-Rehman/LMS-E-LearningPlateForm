import Course from "../models/course.model.js";
import jwt from "jsonwebtoken";
import ErrorHandler from "../utilis/ErrorHandler.js";
import sendMail from '../utilis/send.mail.js';
import dotenv from "dotenv";
import ejs from "ejs";
import cloudinary from "cloudinary";

// upload course
export const uploadCourse = async(req,res,nest)=>{
    try {
        const data = req.body;
        const thumbnail = req.body;
        const course = req.body;
    } catch (error) {
        
    }
}