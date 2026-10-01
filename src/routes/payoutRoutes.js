const express = require("express");

const Payout = require("../models/Payout");
const Claim = require("../models/Claim");
const { protect, allowRoles } = require("../middleware/auth");
const { requireFields } = require("../middleware/validate");
const makeId = require("../utils/generateId");

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("adjuster", "admin"),
  requireFields(["claim", "amount", "bankAccount"]),
  async (req, res, next) => {
    try {
      const claim = await Claim.findById(req.body.claim);

      if (!claim) return res.status(404).json({ message: "Claim not found" });

      if (claim.status !== "approved") {
        return res.status(400).json({
          message: "Payout can be created only for an approved claim"
        });
      }

      const payout = await Payout.create({
        claim: req.body.claim,
        amount: Number(req.body.amount),
        bankAccount: req.body.bankAccount,
        status: "paid",
        transactionId: makeId("TXN"),
        paidAt: new Date()
      });

      claim.status = "paid";
      await claim.save();

      res.status(201).json({
        message: "Mock bank payout successful",
        payout
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", protect, async (req, res, next) => {
  try {
    const payouts = await Payout.find().populate("claim", "claimNumber status");
    res.json(payouts);
  } catch (error) {
    next(error);
  }
});

router.get("/claim/:id", protect, async (req, res, next) => {
  try {
    const payouts = await Payout.find({ claim: req.params.id });
    res.json(payouts);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", protect, allowRoles("adjuster", "admin"), async (req, res, next) => {
  try {
    const payout = await Payout.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!payout) return res.status(404).json({ message: "Payout not found" });

    res.json(payout);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const payout = await Payout.findByIdAndDelete(req.params.id);

    if (!payout) return res.status(404).json({ message: "Payout not found" });

    res.json({ message: "Payout deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
