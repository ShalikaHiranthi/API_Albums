import { StatusCodes } from "http-status-codes";
import APIError from "../errors/APIError.js";

const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  next();
};

const authPerms = (...roles) => {
  return (req, res, next) => {
    // can be expanded to allow multiple roles for different routes
    if (!roles.includes(req.user.role)) {
      throw new APIError(
        "Unauthorized to access this route",
        StatusCodes.FORBIDDEN,
      );
    }
    next();
  };
};

const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);

      if (!resource) {
        return res.status(StatusCodes.NOT_FOUND).json({
          msg: "Resource not found",
        });
      }

      if (req.user.role === "admin") {
        return next();
      }

      if (resource.createdBy.toString() !== req.user.id.toString()) {
        return res.status(StatusCodes.FORBIDDEN).json({
          msg: "Forbidden - Not your resource",
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export { isAuthenticated, authPerms, checkOwnership };
