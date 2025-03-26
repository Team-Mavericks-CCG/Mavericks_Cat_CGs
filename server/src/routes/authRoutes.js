import { Router } from "express";
import {
  login,
  register,
  changePassword,
  verifyToken,
} from "../controllers/authController.js";

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
router.get("/verify", verifyToken);

export default router;
