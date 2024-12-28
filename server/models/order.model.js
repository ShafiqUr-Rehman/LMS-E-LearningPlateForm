import mongoose from "mongoose";
const { Schema } = mongoose;  // Ensure Schema is properly destructured
const orderSchema = new Schema({
   courseId: {
    type: String,
    required: true,
   },
   userId: {
    type: String,
    required: true,
   },
   payment_info: {
    type: Object,
   // required: true,     after writing Frontend then we will make it true
   },
}, { timestamps: true });

const OrderModel = mongoose.model("Order", orderSchema);
export default OrderModel;
