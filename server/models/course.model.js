import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const reviewSchema = new mongoose.Schema({
    user: String,
    rating: {
        type: Number,
        default: 0,
    },
    comment: String,
    commentReplies : [Object],

});

const linkSchema = new mongoose.Schema({
    title: String,
    url: String,
});

const commentSchema = new mongoose.Schema({
    user: Object,
    question: String,
    questoinReplies: [Object],
});

const courseDataSchema = new mongoose.Schema({
    videoUrl: String,
    title: String,
    videoSection: String,
    description: String,
    videoLength: String,
    videoPlayer: String,
    links: [linkSchema],
    suggestions: String,
    questions: [commentSchema],
});

const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: {
        type: Number,
        required: true
    },
    estimatedPrice: {
        type: Number
    },
    thumbnail: {
        public_id: { type: String,  },
    },
    url: {
        type: String,
      
    },
    tags: {
        type: [String],
        default: [],
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demoUrl: {
        type: String,
        required: true,
    },
    benefits: {
        type: [String],
        default: []
    },
    prerequisites: {
        type: [String],
        default: []
    },
    reviews: {
        type: [reviewSchema],
        default: []
    },
    courseData: {
        type: [courseDataSchema],
        default: []
    },
    ratings: {
        type: Number,
        default: 0
    },
    purchase: {
        type: Number,
        default: 0
    },
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
