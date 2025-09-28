const jwt = require("jsonwebtoken");
const { User } = require("../models/user");

const JWT_SECRET_KEY = "devTinder_2%25";


const userAuth = async (req, res, next) => {
  try {
    const { jwtToken } = req.cookies;

    if (!jwtToken) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const decodedJwt = jwt.verify(jwtToken, JWT_SECRET_KEY);
    const user = await User.findById(decodedJwt.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    req.currentUser = user; 
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(403).json({
      message: "Invalid or expired session. Please log in again."
    });
  }
};

module.exports = { userAuth };
