const express = require("express");

const Renewal = require("../models/Renewal");
const Policy = require("../models/Policy");
const { protect } = require("../middleware/auth");
const { requireFields } = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const renewals = await Renewal.find().populate(
      "policy",
      "policyNumber policyType endDate"
    );

    // Simple automatic reminder check: policies ending within the next 30 days.
    const today = new Date();
    const in30Days = new Date();
    in30Days.setDate(today.getDate() + 30);

    const upcomingPolicies = await Policy.find({
      endDate: { $gte: today, $lte: in30Days }
    }).select("policyNumber policyType endDate");

    res.json({
      savedRenewals: renewals,
      upcoming30DayReminders: upcomingPolicies
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  protect,
  requireFields(["policy", "reminderDate"]),
  async (req, res, next) => {
    try {
      const policy = await Policy.findById(req.body.policy);

      if (!policy) return res.status(404).json({ message: "Policy not found" });

      const renewal = await Renewal.create({
        policy: req.body.policy,
        reminderDate: req.body.reminderDate
      });

      res.status(201).json(renewal);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
