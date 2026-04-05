import { Users } from "../models/Albums.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export async function userRegister(req, res) {
  try {
    const { name, email, password, passwordConfirm } = req.body;

    if (!name || !email || !password || !passwordConfirm) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    const newUser = await Users.create({
      name,
      email,
      password,
      passwordConfirm,
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    const user = await Users.findOne({ email });
    if (!user)
      return res.status(401).json({ msg: "Incorrect email or password" });

    const isCorrect = await user.correctPassword(password, user.password);
    if (!isCorrect)
      return res.status(401).json({ msg: "Incorrect email or password" });

    const token = jwt.sign(
      { id: user._id, username: user.name },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      msg: "Login successful",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
