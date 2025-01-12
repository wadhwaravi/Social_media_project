import User from "../modules/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
dotenv.config();
export const signup = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingemail = await User.findOne({ email });
    if (existingemail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }
    const existingusername = await User.findOne({ username });
    if (existingusername) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashPassword, username });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.cookie("jwtlinkedin", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict", // prevent csf atttacks
      secure: process.env.NODE_ENV === "production",
    });

    res.status(201).json({ message: "User registered" });
    // todo send welcome email
    const profileUrl = `${process.env.CLIENT_URL}/profile/${user.username}`;
    try {
      await sendWelcomeEmail(user.name, user.email, profileUrl);
    } catch (error) {
      console.log("Error in sending welcome email", error);
    }
  } catch (error) {
    console.log("Error in sign up", error);
    res.status(500).json({ message: "Internal server eror" });
  }
};
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getCurrentUser", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });
    res.cookie("jwtlinkedin", token, {
      httpOnly: true,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      sameSite: "strict", // prevent csf atttacks
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ message: "User logged in" });
  } catch (error) {
    console.log("Error in login", error);
    res.status(500).json({ message: "Internal server eror" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("jwtlinkedin", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "User logged out" });
};
