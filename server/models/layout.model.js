import mongoose from "mongoose";
const { Schema } = mongoose;

const faqSchema = new Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
});

const categorySchema = new Schema({
    title: { type: String, required: true },
});

const bannerImageSchema = new Schema({
    public_id: { type: String, required: true },
    url: { type: String, required: true },
});

const layoutSchema = new Schema({
    type: { type: String, required: true },
    faq: [faqSchema],
    categories: [categorySchema],
    banner: {
        img: [bannerImageSchema],
        title: { type: String, required: true },
        subTitle: { type: String, required: true },
    },
});

const layoutModel = mongoose.model("Layout", layoutSchema);
export default layoutModel;
