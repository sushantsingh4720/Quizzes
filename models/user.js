import validator from "validator";
import mongoose from "mongoose";
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Your email is required"],
      validate: [validator.isEmail, "Please provide a valid email address"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    profile: {
      firstName: {
        type: String,
        required: true,
        set: (value) => value.replace(/\s/g, ""),
        minlength: [3, "Name must be 3 characters or more"],
      },
      middleName: {
        type: String,
        trim: true,
        set: (value) => value.replace(/\s/g, ""),
      },
      lastName: {
        type: String,
        trim: true,
        set: (value) => value.replace(/\s/g, ""),
      },
    },
    status: {
      type: String,
      enum: ["pending", "active"],
      default: "pending",
    },
    confirmationCode: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
