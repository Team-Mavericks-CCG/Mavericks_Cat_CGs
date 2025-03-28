import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Player from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

export interface AuthUser {
  playerid: number;
  username?: string;
  lastLogin?: Date | null;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header("Authorization");

  // Check if no token
  if (!token) {
    res.status(401).json({ message: "No token, access denied" });
    return;
  }

  try {
    // Verify token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      id: number;
    };

    // Add user from payload to request object
    req.user = {
      playerid: decoded.id,
    };

    next();
  } catch {
    res.status(401).json({ message: "Token is not valid" });
  }
};

const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(res.status(500).json);
  };

export const verifyToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const token = req.header("Authorization");

    // If token is not provided
    if (!token) {
      res.status(401).json({ message: "Access denied" });
      return;
    }

    try {
      // Verify token
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables");
      }
      // Verify the token with the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
      };

      // Find user by id
      const user = await Player.findByPk(decoded.id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Attach user to request (without password)
      req.user = {
        playerid: user.playerid,
        username: user.username,
        lastLogin: user.lastLogin,
      };

      next();
    } catch {
      // If token is invalid or expired
      res.status(401).json({ message: "Invalid token" });
    }
  }
);
