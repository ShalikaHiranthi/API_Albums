import mongoose from "mongoose";

mongoose.set("debug", true);

// const connectMongoDB = (url) => {
//   return mongoose.connect(url)
// }
const connectMongoDB = async () => {
  const uri =
    process.env.NODE_ENV === "test"
      ? process.env.MONGO_URI_TEST
      : process.env.MONGO_URI;

  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB connected"))
    .catch((err) => console.error("DB connection error:", err));
};

export default connectMongoDB;
