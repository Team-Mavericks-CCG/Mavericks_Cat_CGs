import { Request, Response, Router } from "express";
import {
  login,
  register,
  changePassword,
  getProfile,
  updateProfilePicture,
  getProfilePicture,
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
router.get("/verify", verifyToken, (req: Request, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ message: "Token is not valid" });
    return;
  }
  res.status(200).json({
    message: "Token is valid",
    user: {
      username: req.user.username,
      lastLogin: req.user.lastLogin,
    },
  });
});

router.get("/profile", verifyToken, getProfile);

router.post("/update-profile-picture", verifyToken, updateProfilePicture);

router.get("/profile-picture", verifyToken, getProfilePicture);

// Route for testing auth middleware
router.get("/test", auth, (_req, res: Response) => {
  res.status(202).json({ message: "Auth middleware works" });
});

export default router;
