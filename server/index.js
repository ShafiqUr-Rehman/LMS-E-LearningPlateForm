// index.js
import express from 'express';
import mongoose from 'mongoose';
import ErrorHandler, { handleMongoError, handleJWTError, handleJWTExpiredError } from './utilis/ErrorHandler.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.route.js';
import { v2 as cloudinary } from 'cloudinary';
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API,
  api_secret: process.env.CLOUD_SECRETE_KEY,
})

const app = express();
app.use(express.json({ limit: "50mb" })); // Limit for large file uploads, e.g., Cloudinary storage
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Connect to MongoDB
const PORT = process.env.PORT || 3000;
mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use("/server/v1", userRouter);

app.all("*", (req, res, next) => {
  next(new ErrorHandler(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);  // Log the full error object

  // Handle MongoDB errors
  if (err.name === 'MongoError' || err.name === 'ValidationError') {
    err = handleMongoError(err);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});