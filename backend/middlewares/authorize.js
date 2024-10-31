// backend/middlewares/authorize.js

module.exports = function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: false,
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};
