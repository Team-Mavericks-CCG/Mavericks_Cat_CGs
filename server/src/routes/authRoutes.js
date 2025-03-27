import { Router } from "express";
import {
  login,
  register,
  changePassword,
} from "../controllers/authController.js";
import { auth, verifyToken } from "../middleware/auth.js";

// routes are appended to the default /api/auth route
// e.g. /api/auth/login
const router = Router();

// Route for user login
router.post("/login", login);

// Route for user registration
router.post("/register", register);

// Route for changing password
router.post("/change-password", changePassword);

// Route for jwt verification
router.get("/verify", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Token is valid",
    user: {
      username: req.user.username,
      lastLogin: req.user.lastLogin,
    },
  });
});

// Route for testing auth middleware
router.get("/test", auth, (_req, res) => {
  res.status(202).json({ message: "Auth middleware works" });
});

export default router;
