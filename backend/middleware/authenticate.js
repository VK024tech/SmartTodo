const { access } = require("fs");
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const token = req.headers.token;

  try {
    const access = jwt.verify(token, process.env.SECRET);
    req.headers.userId = access.userId;
  } catch (error) {
    return res.status(401).json({
      message: "You're not signed in!",
    });
  }

  next();
}

module.exports = {
  authMiddleware: authMiddleware,
};
