// tests/albums.test.js
import mongoose from "mongoose";
vi.mock("../middlewares/auth.js", () => ({
  isAuthenticated: (req, res, next) => {
    req.user = {
      _id: new mongoose.Types.ObjectId("000000000000000000000001"),
      role: "user",
    };
    next();
  },
  authPerms:
    (...roles) =>
    (req, res, next) =>
      next(),
  checkOwnership: (model) => (req, res, next) => next(),
}));
import {
  describe,
  it,
  beforeAll,
  beforeEach,
  afterAll,
  expect,
  vi,
} from "vitest";
import supertest from "supertest";
import app from "../app.js"; // your Express app
import Albums from "../models/Albums.js";
import testData from "./data.json";

// ---- CONNECT TO TEST DB ----
beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST);
});

// ---- RESET DB BEFORE EACH TEST ----
beforeEach(async () => {
  await Albums.deleteMany();
  await Albums.insertMany(testData);
});

// ---- CLOSE DB AFTER ALL TESTS ----
afterAll(async () => {
  await mongoose.connection.close();
});

describe("GET /albums", () => {
  it("should return correct number of albums", async () => {
    const res = await supertest(app).get("/albums/all");
    expect(res.status).toBe(200);
    expect(res.body.albums.length).toBe(testData.length);
  });
});

describe("POST /albums", () => {
  it("should add a new album and verify count and data", async () => {
    const newAlbum = {
      title: "New Album",
      artist: "New Artist",
      year: 2023,
      genre: "Pop",
    };

    // Get count before
    const before = await supertest(app).get("/albums/all");
    const countBefore = before.body.albums.length;

    const res = await supertest(app).post("/albums").send(newAlbum);
    //console.log(res.body);

    expect(res.status).toBe(201);

    // Verify returned album has correct data
    expect(res.body.title).toBe(newAlbum.title);
    expect(res.body.artist).toBe(newAlbum.artist);
    expect(res.body.year).toBe(newAlbum.year);
    expect(res.body.genre).toBe(newAlbum.genre);

    // Verify count increased by one
    const after = await supertest(app).get("/albums/all");
    expect(after.body.albums.length).toBe(countBefore + 1);
  });
});

describe("DELETE /albums/:id", () => {
  it("should delete an album and verify count decreases", async () => {
    // Pick an album from the seeded test data
    const album = await Albums.findOne({ title: "Album 1" });
    const id = album._id;

    const before = await supertest(app).get("/albums/all");
    const countBefore = before.body.albums.length;

    const res = await supertest(app).delete(`/albums/${id}?debug=true`);
    //console.log(res.body);

    expect(res.status).toBe(200);

    // Verify count decreased by one
    const after = await supertest(app).get("/albums/all");
    expect(after.body.albums.length).toBe(countBefore - 1);

    // Verify the specific album is no longer present
    const deleted = await Albums.findById(id);
    expect(deleted).toBeNull();
  });

  it("should return 404 when deleting a non-existent album", async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const res = await supertest(app).delete(
      `/albums/${nonExistentId}?debug=true`,
    );
    console.log(res.body);

    expect(res.status).toBe(404);
  });
});
