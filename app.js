import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import MongoStore from "connect-mongo";
import albumRoutes from "./routes/albums.js";
import authRoutes from "./routes/auth.js";
import "./config/passport.js"; // load strategy

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.static(path.join(path.resolve(), "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // ← make sure this is set on Render
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api", authRoutes);
app.use("/api/albums", albumRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: err.message || "Server error" });
});

export default app;
