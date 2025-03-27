import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Middleware to verify JWT token, does not attach the user to the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const auth = (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "No token, access denied" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user from payload to request object
    req.user = {
      id: decoded.id,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

/**
 * Middleware to verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const verifyToken = async (req, res, next) => {
  // Get token from header
  const token = req.header("Authorization");

  // If token is not provided
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    // Verify the token with the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach user to request (without password)
    req.user = {
      id: user.id,
      username: user.username,
      lastLogin: user.lastLogin,
    };

    next();
  } catch (error) {
    // If token is invalid or expired
    res.status(401).json({ message: "Invalid token" });
  }
};
