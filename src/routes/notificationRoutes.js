const express = require("express");

const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");
const { requireFields } = require("../middleware/validate");
const { sendPushNotification } = require("../config/firebase");

const router = express.Router();

router.post(
  "/send",
  protect,
  requireFields(["user", "title", "body"]),
  async (req, res, next) => {
    try {
      const notification = await Notification.create({
        user: req.body.user,
        title: req.body.title,
        body: req.body.body,
        token: req.body.token || ""
      });

      let result = {
        sent: false,
        message: "Notification saved"
      };

      if (req.body.token) {
        result = await sendPushNotification(
          req.body.token,
          req.body.title,
          req.body.body
        );

        notification.sent = result.sent;
        await notification.save();
      }

      res.status(201).json({
        message: result.message,
        notification
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
