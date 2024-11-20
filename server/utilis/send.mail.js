import ejs from "ejs";
import path from "path";
import ErrorHandler from "./ErrorHandler.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sendMail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMPT_HOST,
            port: process.env.SMPT_PORT || '587',
            service: process.env.SMPT_SERVICE,
            secure: process.env.SMPT_PORT === '465', // true for port 465, false for other ports
            auth: {
                user: process.env.SMPT_MAIL,
                pass: process.env.SMPT_PASSWORD,
            },
        });

        const { email, subject, template, data, html: directHtml } = options;
        let html;

        if (template) {
            // Get the path to the email template file
            const templatePath = join(__dirname, "..", "mails", template);
            // Render the email template
            html = await ejs.renderFile(templatePath, data);
        } else if (directHtml) {
            html = directHtml;
        } else {
            throw new Error("Either template or html must be provided");
        }

        const mailOptions = {
            from: process.env.SMPT_MAIL,
            to: email,
            subject,
            html,
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error in sendMail:", error);
        throw new ErrorHandler(error.message, 500);
    }
};

export default sendMail;