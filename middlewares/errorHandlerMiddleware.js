import { APIError } from "../errors/custom.js";

const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({ msg: err.message });
  }
  return res.status(500).json({ msg: "There was an error, please try again" });
};

export default errorHandlerMiddleware;
