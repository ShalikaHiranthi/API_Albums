import express from "express";
import passport from "passport";
import { Users } from "../models/Users.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "All fields required" });

    const existingUser = await Users.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "Email already registered" });

    const newUser = await Users.create({ name, email, password });
    res.status(201).json({
      msg: "User registered",
      user: { id: newUser._id, name: newUser.name },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
});

// Login
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ msg: info.message });

    req.login(user, (err) => {
      if (err) return next(err);
      return res.json({
        msg: "Login successful",
        user: { id: user._id, name: user.name, email: user.email },
      });
    });
  })(req, res, next);
});

// Logout
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    // ← Passport requires a callback
    if (err) return next(err);
    req.session.destroy((err) => {
      // ← also destroy the session
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.clearCookie("connect.sid"); // ← clear the cookie
      res.status(200).json({ message: "Logged out" });
    });
  });
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({
      loggedIn: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    });
  }

  res.json({ loggedIn: false });
});

export default router;
