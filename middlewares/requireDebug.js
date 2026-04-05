const requireDebug = (req, res, next) => {
  const debug = req.query.debug;

  if (!debug || debug !== "true") {
    return res.status(400).json({
      error: "Debug mode required. Add ?debug=true to access this endpoint",
    });
  }

  req.debugMode = true;
  next();
};

export default requireDebug;
