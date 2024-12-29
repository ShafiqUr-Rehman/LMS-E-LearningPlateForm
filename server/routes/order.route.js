import expres from "express"
import {
    createOrder,getAllOrder
} from "../controllers/order.controller.js"
import {authorizeRoles, isAuthenticated } from "../middleWare/auth.js";


const orderRouter = expres.Router();
orderRouter.post("/create-order", isAuthenticated,createOrder);
orderRouter.get("/get-all-orders", isAuthenticated, authorizeRoles("admin"), getAllOrder);



export default orderRouter