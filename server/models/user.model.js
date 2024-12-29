import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Joi from "joi";
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

// Mongoose User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        default: 'default_avatar_public_id'
      },
      url: {
        type: String,
        default: 'https://example.com/default-avatar.png'
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    courses: {
      type: [
        {
          course_id: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

//  compare password
userSchema.methods.comparePassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};
// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || '');
};

// sing refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
    expiresIn: "5m",
  });
}


// Joi Validation Schemas
userSchema.statics.validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Name is required.",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Provide a valid email address.",
      "string.empty": "Email is required.",
    }),
    password: Joi.string().min(6).required().messages({
      "string.min": "Password must be at least 6 characters.",
      "string.empty": "Password is required.",
    }),
    avatar: Joi.object({
      public_id: Joi.string(),
      url: Joi.string().uri(),
    }),
    role: Joi.string().valid("user", "admin").default("user"),
    courses: Joi.array().items(
      Joi.object({
        course_id: Joi.string().required(),
      })
    ),
  });
  return schema.validate(data);
};

userSchema.statics.validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data);
};

// Export Mongoose model
const User = mongoose.model("User", userSchema);
export default User;