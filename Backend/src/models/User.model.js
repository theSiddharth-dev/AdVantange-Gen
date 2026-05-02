import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: [true, "Username must be unique"],
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: [true, "email must be unique"],
  },
  avatar: {
    type: String,
  },
  authProvider: {
    type: String,
    default: "local",
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
});

const userModel = mongoose.model("users", userSchema);

export default userModel;
