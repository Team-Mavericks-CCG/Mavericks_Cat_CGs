import { Request, Response } from "express";
import Player from "../models/userModel.js";
import argon2 from "@node-rs/argon2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { UniqueConstraintError as SequelizeUniqueConstraintError } from "sequelize";

dotenv.config();

class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}
class ServerError extends Error {
  constructor(message = "Server Error") {
    super(message);
    this.name = "ServerError";
  }
}

// exit if JWT_SECRET is not set, needed for login functionality
if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === "") {
  console.error("JWT_SECRET is not set, check your .env file");
  process.exit(1);
}
const JWT_SECRET: string = process.env.JWT_SECRET;

async function checkPassword(username: string, password: string) {
  try {
    // get the user from the database
    const user = await Player.findOne({ where: { username } });

    // if user is not found, reject with an error message
    if (!user) {
      throw new AuthenticationError("Invalid username or password");
    }

    // verify the password using argon2
    const isMatch = await argon2.verify(user.password, password);

    // if password is incorrect, reject with an error message
    if (!isMatch) {
      throw new AuthenticationError("Invalid username or password");
    }

    // if user is found and password is correct, resolve the user object
    return user;
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new ServerError();
  }
}

// Define an interface for the request body
interface LoginRequestBody {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// User login
export function login(req: Request, res: Response) {
  const { username, password, rememberMe } = req.body as LoginRequestBody;

  try {
    checkPassword(username, password)
      .then(async (user) => {
        // update the last login time
        await user.update({ lastLogin: new Date() }, { silent: true });

        // create a token with user id and secret key for following requests
        const token = jwt.sign({ id: user.playerid }, JWT_SECRET, {
          expiresIn: rememberMe ? "24h" : "1h",
        });

        // send success message
        res.status(200).json({ token });
      })
      .catch((error: unknown) => {
        if (error instanceof AuthenticationError) {
          res.status(401).json({ message: error.message });
        }
        if (error instanceof ServerError) {
          console.error(error);
          res.status(500).json({ message: error.message });
        }
      });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
}

// User registration
export async function register(req: Request, res: Response) {
  // get username and password from request body

  const { username, password } = req.body as LoginRequestBody;

  try {
    // hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    // user is created with username and hashed password, shouldn't change other fields
    const user = await Player.create(
      { username: username, password: hashedPassword },
      { fields: ["username", "password"] }
    );

    // create a token with user id and secret key for following requests
    const token = jwt.sign({ id: user.playerid }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // send success message
    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error: unknown) {
    // only username is a unique field, if there is a unique constraint error, username exists
    if (error instanceof SequelizeUniqueConstraintError) {
      res.status(409).json({ message: "Username already exists" });
    }
    // generic error message
    else {
      res.status(500).json({ message: "Server error" });
    }
  }
}

// Define an interface for the request body
interface changePasswordRequestBody {
  username: string;
  password: string;
  newPassword: string;
}

export function changePassword(req: Request, res: Response) {
  try {
    const { username, password, newPassword } =
      req.body as changePasswordRequestBody;

    checkPassword(username, password)
      .then(async (user) => {
        // hash the new password
        const hashedPassword = await argon2.hash(newPassword);

        // update the user's password
        await user.update({ password: hashedPassword });

        // send success message
        res.status(201).json({ message: "Password changed successfully" });
      })
      .catch((error: unknown) => {
        if (error instanceof AuthenticationError) {
          res.status(401).json({ message: error.message });
        }
        if (error instanceof ServerError) {
          res.status(500).json({ message: error.message });
        }
      });
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
}

export function getProfile(req: Request, res: Response) {
  try {
    // get the user from the request object
    const user = req.user;

    // if user is not found, reject with an error message
    if (!user) {
      throw new AuthenticationError("User not found");
    }

    // send success message
    res.status(200).json({
      user: {
        username: user.username,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      res.status(401).json({ message: error.message });
    }
  }
}
