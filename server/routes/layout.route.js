import express from "express"
import { 
    createLayout,
    editLayout,
    getLayoutByType
 } from "../controllers/layout.controller.js";
import { authorizeRoles, isAuthenticated, } from "../middleWare/auth.js";

const layoutRouter = express.Router();
layoutRouter.post("/create-layout" ,isAuthenticated ,authorizeRoles("admin"), createLayout);
layoutRouter.put("/edit-layout" ,isAuthenticated ,authorizeRoles("admin"), editLayout); 
layoutRouter.get("/get-layout" ,isAuthenticated ,authorizeRoles("admin"), getLayoutByType); 


export default layoutRouter 