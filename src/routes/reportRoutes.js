const express = require("express");
const Claim = require("../models/Claim");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

router.get("/claims", protect, allowRoles("adjuster", "admin"), async (req, res, next) => {
  try {
    const total = await Claim.countDocuments();
    const approved = await Claim.countDocuments({ status: "approved" });
    const rejected = await Claim.countDocuments({ status: "rejected" });
    const paid = await Claim.countDocuments({ status: "paid" });

    res.json({
      totalClaims: total,
      approvedClaims: approved,
      rejectedClaims: rejected,
      paidClaims: paid
    });
  } catch (error) {
    next(error);
  }
});

router.get("/monthly", protect, allowRoles("adjuster", "admin"), async (req, res, next) => {
  try {
    const report = await Claim.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalClaims: { $sum: 1 },
          totalDamageAmount: { $sum: "$damageAmount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json(report);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
