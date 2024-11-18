exports.adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({
      error: "Admin access required",
    });
  }
  next();
};
exports.selfOrAdmin = (req, res, next) => {
  if (req.user.isAdmin || req.user.userId === parseInt(req.params.userId)) {
    next();
  } else {
    return res.status(403).json({
      error: "Unauthorized access",
    });
  }
};
