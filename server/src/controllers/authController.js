import User from "../models/userModel.js";
import argon2 from "@node-rs/argon2";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// exit if JWT_SECRET is not set, needed for login functionality
if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === "") {
  console.error("JWT_SECRET is not set, check your .env file");
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
        // update last login time, silent is used to stop changes in updatedAt
        user.update({ lastLogin: new Date() }, { silent: true });

        // create a token with user id and secret key for following requests
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        // send the token as response
        res.status(200).json({ token });
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
    const user = await User.create(
      { username: username, password: hashedPassword },
      { fields: ["username", "password"] }
    );

    // create a token with user id and secret key for following requests
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // send success message
    res.status(201).json({
      message: "User registered successfully",
      token,
    });
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
