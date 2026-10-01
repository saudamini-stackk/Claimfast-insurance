const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { verifyFirebaseToken } = require("../config/firebase");
const { requireFields } = require("../middleware/validate");

const router = express.Router();

/* =========================
   CREATE JWT TOKEN
========================= */

function createToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
}

/* =========================
   REGISTER
   POST /api/auth/register
========================= */

router.post(
  "/register",
  requireFields(["name", "email", "password"]),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const normalizedEmail = email.toLowerCase().trim();

      const exists = await User.findOne({
        email: normalizedEmail
      });

      if (exists) {
        return res.status(400).json({
          message: "Email already registered"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: "policyholder"
      });

      res.status(201).json({
        message: "Registration successful",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },

        token: createToken(user)
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================
   LOGIN
   POST /api/auth/login
========================= */

router.post(
  "/login",
  requireFields(["email", "password"]),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const normalizedEmail = email.toLowerCase().trim();

      const user = await User.findOne({
        email: normalizedEmail
      });

      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }

      res.json({
        message: "Login successful",

        token: createToken(user),

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================
   FIREBASE LOGIN
   POST /api/auth/firebase
========================= */

router.post(
  "/firebase",
  requireFields(["idToken"]),
  async (req, res, next) => {
    try {
      const decoded = await verifyFirebaseToken(req.body.idToken);

      const fcmToken = req.body.fcmToken || null;

      let user = await User.findOne({
        firebaseUid: decoded.uid
      });

      /* Existing Firebase user */
      if (!user) {
        user = await User.findOne({
          email: decoded.email
        });

        /* Existing normal account */
        if (user) {
          user.firebaseUid = decoded.uid;

          if (fcmToken) {
            user.fcmToken = fcmToken;
          }

          await user.save();
        }

        /* New Firebase user */
        else {
          user = await User.create({
            name: decoded.name || "Firebase User",
            email: decoded.email,
            password: await bcrypt.hash(
              `firebase-${decoded.uid}`,
              10
            ),
            firebaseUid: decoded.uid,
            fcmToken,
            role: "policyholder"
          });
        }
      } else {
        /* Existing Firebase user */
        if (fcmToken) {
          user.fcmToken = fcmToken;
          await user.save();
        }
      }

      res.json({
        message: "Firebase authentication successful",

        token: createToken(user),

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(401).json({
        message: error.message
      });
    }
  }
);

module.exports = router;