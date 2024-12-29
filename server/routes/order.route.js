import expres from "express"
import {
    createOrder,
} from "../controllers/order.controller.js"
import {isAuthenticated } from "../middleWare/auth.js";


const orderRouter = expres.Router();
orderRouter.post("/create-order", isAuthenticated,createOrder);



export default orderRouter