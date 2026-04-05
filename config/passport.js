import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Users } from "../models/Users.js"; // use the correct path

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await Users.findOne({ email });
        if (!user) return done(null, false, { message: "User not found" });

        const isCorrect = await user.correctPassword(password, user.password);
        if (!isCorrect) return done(null, false, { message: "Wrong password" });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Users.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
