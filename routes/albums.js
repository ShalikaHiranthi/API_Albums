import express from "express";
import * as albumController from "../controllers/albums.js";
import requireDebug from "../middlewares/requireDebug.js";
import {
  isAuthenticated,
  authPerms,
  checkOwnership,
} from "../middlewares/auth.js";
import Albums from "../models/Albums.js";

const router = express.Router();

router.get(
  "/",
  isAuthenticated,
  authPerms("user", "admin"),
  albumController.getuserAlbums,
);
router.get("/all", albumController.getAllAlbums);
router.get("/:id", albumController.getAlbumById);
router.post(
  "/",
  isAuthenticated,
  authPerms("user", "admin"),
  albumController.createAlbum,
);
router.put(
  "/:id",
  isAuthenticated,
  authPerms("user", "admin"),
  albumController.updateAlbum,
);
router.delete(
  "/:id",
  isAuthenticated,
  requireDebug,
  checkOwnership(Albums),
  albumController.deleteAlbum,
);
router.get("/genre/:genre", albumController.getAlbumsByGenre);

export default router;
