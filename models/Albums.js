import { Schema, model, mongoose } from "mongoose";
import bcrypt from "bcryptjs";

const currentYear = new Date().getFullYear();

const allowedGenres = [
  "Rock",
  "Pop",
  "K-Pop",
  "Hip-Hop",
  "Jazz Rock",
  "Jazz",
  "Classical",
  "Electronic",
  "Country",
  "R&B",
  "Metal",
];

const albumsSchema = new Schema({
  artist: {
    type: String,
    required: [true, "Artist name is required"],
    minlength: [3, "Artist name must be at least 3 characters"],
    maxlength: [50, "Artist name must not exceed 50 characters"],
    trim: true,
  },
  title: {
    type: String,
    required: [true, "Album title is required"],
    minlength: [3, "Album title must be at least 3 characters"],
    maxlength: [50, "Album title must not exceed 50 characters"],
    trim: true,
    validate: {
      validator: async function (value) {
        const Album = this.model("Albums"); // Use the current model
        const existing = await Album.findOne({
          title: value,
          artist: this.artist,
          _id: { $ne: this._id }, // exclude current document when updating
        });
        return !existing; // true = valid
      },
      message: "An album with this artist and title already exists",
    },
  },
  year: {
    type: Number,
    required: [true, "Release year is required"],
    min: [1900, "Release year must be after 1900"],
    max: [currentYear, `Release year cannot exceed ${currentYear}`],
  },
  genre: {
    type: String,
    required: [true, "Genre is required"],
    enum: {
      values: allowedGenres,
      message: "Genre must be one of the predefined values",
    },
  },
  tracks: {
    type: Number,
    required: false,
    min: [1, "Track count must be greater than 0"],
    max: [100, "Track count cannot exceed 100"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

albumsSchema.pre("save", async function () {
  this.artistTitle = `${this.artist.toLowerCase().trim()}-${this.title.toLowerCase().trim()}`;
});

albumsSchema.virtual("ageInYears").get(function () {
  return new Date().getFullYear() - this.year;
});

albumsSchema.methods.isClassic = function () {
  return this.ageInYears > 25;
};

albumsSchema.statics.findByGenre = function (genre) {
  return this.find({ genre });
};

export default model("Albums", albumsSchema);
