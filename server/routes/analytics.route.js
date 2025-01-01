import express from "express"
import {
    getCourseAnalytics,
    getOrderAnalytics,
    getUserAnalytics
} from "../controllers/anaylatics.controller.js"
import { authorizeRoles, isAuthenticated, } from "../middleWare/auth.js";

const analyticsRouter = express.Router();
analyticsRouter.get("/get-user-analytics", isAuthenticated, authorizeRoles("admin"), getUserAnalytics);
analyticsRouter.get("/get-course-analytics", isAuthenticated, authorizeRoles("admin"), getCourseAnalytics);
analyticsRouter.get("/get-order-analytics", isAuthenticated, authorizeRoles("admin"), getOrderAnalytics);

export default analyticsRouter