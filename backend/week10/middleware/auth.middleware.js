const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "coding");
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ msg: "Please Login First" });
  }
};

module.exports = { auth };
