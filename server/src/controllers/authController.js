import User from "../models/userModel.js";
import argon2 from "@node-rs/argon2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

if (process.env.JWT_SECRET === undefined) {
  console.error("JWT_SECRET is not set");
  process.exit(1);
}

/**
 * @typedef {import('../models/userModel.js').default} User
 */

/**
 * Check if the password is correct for a user
 * @param {string} username - The username to check
 * @param {string} password - The password to verify
 * @returns {Promise<User>} A promise that resolves to a User object
 */
function checkPassword(username, password) {
  return new Promise((resolve, reject) => {
    (async () => {
      try {
        // get the user from the database
        const user = await User.findOne({ where: { username: username } });

        // if user is not found, reject with an error message
        if (!user) {
          reject("Invalid username or password");
        }

        // verify the password using argon2
        const isMatch = await argon2.verify(user.password, password);

        // if password is incorrect, reject with an error message
        if (!isMatch) {
          reject("Invalid username or password");
        }

        // if user is found and password is correct, resolve the user object
        resolve(user);
      } catch {
        reject("Server error");
      }
    })();
  });
}

// User login
export async function login(req, res) {
  const { username, password } = req.body;

  try {
    checkPassword(username, password)
      // if user is found and password is correct
      .then((user) => {
        // update last login time
        user.update({ lastLogin: new Date() }, { silent: true });

        // create a token with user id and secret key for following requests
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        // send the token as response
        res.json({ token });
      })
      // if user is not found or password is incorrect
      .catch((error) => {
        if (error === "Invalid username or password") {
          res.status(401).json({ message: error });
        }
        if (error === "Server error") {
          res.status(500).json({ message: error });
        }
      });
  } catch {
    // generic error message
    res.status(500).json({ message: "Server error" });
  }
}

// User registration
export async function register(req, res) {
  // get username and password from request body
  const { username, password } = req.body;

  try {
    // hash the password using argon2
    const hashedPassword = await argon2.hash(password);

    // user is created with username and hashed password, shouldn't change other fields
    await User.create(
      { username: username, password: hashedPassword },
      { fields: ["username", "password"] }
    );

    // send success message
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    // only username is a unique field, if there is a unique constraint error, username exists
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Username already exists" });
    }
    // generic error message
    else {
      res.status(500).json({ message: "Server error" });
    }
  }
}

// TODO Not Fully Implemented
export async function verifyToken(req, res) {
  // get token from request header
  const token = req.header("Authorization");
  console.log(req);

  // if token is not provided
  if (!token) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    // verify the token with the secret key
    jwt.verify(token, process.env.JWT_SECRET);

    // if token is valid, send success message
    res.status(200).json({ message: "Token is valid" });
  } catch {
    // if token is invalid or expired, send error message
    res.status(401).json({ message: "Invalid token" });
  }
}

export async function changePassword(req, res) {
  try {
    const { username, password, newPassword } = req.body;

    checkPassword(username, password)
      .then(async (user) => {
        // hash the new password
        const hashedPassword = await argon2.hash(newPassword);

        // update the user's password
        await user.update({ password: hashedPassword });

        // send success message
        res.status(200).json({ message: "Password changed successfully" });
      })
      .catch((error) => {
        if (error === "Invalid username or password") {
          return res.status(401).json({ message: error });
        }
        if (error === "Server error") {
          return res.status(500).json({ message: error });
        }
      });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
