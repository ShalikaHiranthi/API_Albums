import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";

import albumRoutes from "./routes/albums.js";
import authRoutes from "./routes/auth.js";
import "./config/passport.js"; // load strategy
import connectMongoDB from "./db/mongodb.js";

dotenv.config();
const app = express();

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.static(path.join(path.resolve(), "public")));

// Session middleware
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/albums", albumRoutes);
app.use("/api", authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ msg: err.message || "Server error" });
});

// const startServer = async () => {
//   try {
//     await connectMongoDB(MONGO_URI);
//     app.listen(PORT, () => {
//       console.log(`Server running on http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     // graceful shutdown
//     process.exit(1);
//   }
// };

// startServer();
export default app;
