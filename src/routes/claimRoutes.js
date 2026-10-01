const express = require("express");

const Claim = require("../models/Claim");
const User = require("../models/User");
const Notification = require("../models/Notification");

const { protect, allowRoles } = require("../middleware/auth");
const { requireFields } = require("../middleware/validate");
const upload = require("../middleware/upload");
const makeId = require("../utils/generateId");
const { emitClaimUpdate } = require("../config/socket");
const { sendPushNotification } = require("../config/firebase");

const router = express.Router();

/* =========================================================
   CREATE CLAIM
   POST /api/claims
========================================================= */

router.post(
  "/",
  protect,
  upload.any(),
  requireFields(["policy", "description"]),
  async (req, res, next) => {
    try {
      const photos = (req.files || []).map(
        (file) => `/uploads/${file.filename}`
      );

      const claim = await Claim.create({
        claimNumber: makeId("CLM"),
        policy: req.body.policy,
        claimant: req.user._id,
        description: req.body.description,
        damageAmount: Number(req.body.damageAmount || 0),
        firNumber: req.body.firNumber || "",
        photos
      });

      res.status(201).json({
        message: "Claim submitted successfully",
        claim
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   GET ALL CLAIMS
   GET /api/claims
========================================================= */

router.get("/", protect, async (req, res, next) => {
  try {
    const filter =
      req.user.role === "policyholder"
        ? { claimant: req.user._id }
        : {};

    const claims = await Claim.find(filter)
      .populate("policy", "policyNumber policyType")
      .populate("claimant", "name email")
      .populate("adjuster", "name email");

    res.json(claims);
  } catch (error) {
    next(error);
  }
});

/* =========================================================
   GET SINGLE CLAIM
   GET /api/claims/:id
========================================================= */

router.get("/:id", protect, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("policy")
      .populate("claimant", "name email")
      .populate("adjuster", "name email");

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found"
      });
    }

    res.json(claim);
  } catch (error) {
    next(error);
  }
});

/* =========================================================
   UPDATE CLAIM
   PUT /api/claims/:id
========================================================= */

router.put("/:id", protect, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found",
        requestedId: req.params.id
      });
    }

    if (
      req.user.role === "policyholder" &&
      claim.claimant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can update only your own claim"
      });
    }

    const allowedFields = [
      "description",
      "damageAmount",
      "firNumber"
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        claim[field] = req.body[field];
      }
    });

    await claim.save();

    res.status(200).json({
      message: "Claim updated successfully",
      claim
    });
  } catch (error) {
    next(error);
  }
});

/* =========================================================
   UPDATE CLAIM STATUS
   PUT /api/claims/:id/status

   Only adjuster/admin can update status
========================================================= */

router.put(
  "/:id/status",
  protect,
  allowRoles("adjuster", "admin"),
  requireFields(["status"]),
  async (req, res, next) => {
    try {
      const claim = await Claim.findById(req.params.id);

      if (!claim) {
        return res.status(404).json({
          message: "Claim not found"
        });
      }

      claim.status = req.body.status;
      claim.adjuster = req.user._id;

      await claim.save();

      /* =====================================================
         SOCKET.IO REAL-TIME UPDATE
      ===================================================== */

      emitClaimUpdate({
        claimId: claim._id,
        status: claim.status
      });

      /* =====================================================
         FIND CLAIMANT
      ===================================================== */

      const claimant = await User.findById(claim.claimant);

      /* =====================================================
         CREATE DATABASE NOTIFICATION
      ===================================================== */

      const title = "Claim Status Updated";
      const body = `Your claim ${claim.claimNumber} is now ${claim.status}.`;

      const notification = await Notification.create({
        user: claim.claimant,
        title,
        body,
        token: claimant?.fcmToken || "",
        sent: false
      });

      /* =====================================================
         FIREBASE PUSH NOTIFICATION
      ===================================================== */

      let pushResult = {
        sent: false,
        message: "No Firebase notification sent"
      };

      if (claimant && claimant.fcmToken) {
        try {
          pushResult = await sendPushNotification(
            claimant.fcmToken,
            title,
            body
          );

          notification.sent = pushResult.sent;
          await notification.save();
        } catch (firebaseError) {
          console.error(
            "Firebase notification failed:",
            firebaseError.message
          );

          pushResult = {
            sent: false,
            message: "Claim updated, but Firebase notification failed"
          };
        }
      }

      /* =====================================================
         RESPONSE
      ===================================================== */

      res.json({
        message: "Claim status updated",
        claim,
        notification: {
          id: notification._id,
          title: notification.title,
          body: notification.body,
          sent: notification.sent
        },
        push: pushResult
      });
    } catch (error) {
      next(error);
    }
  }
);

/* =========================================================
   DELETE CLAIM
   DELETE /api/claims/:id
========================================================= */

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const claim = await Claim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        message: "Claim not found"
      });
    }

    if (
      req.user.role === "policyholder" &&
      claim.claimant.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You can delete only your own claim"
      });
    }

    await claim.deleteOne();

    res.json({
      message: "Claim deleted"
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;