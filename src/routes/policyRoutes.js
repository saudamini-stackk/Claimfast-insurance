const express = require("express");
const Policy = require("../models/Policy");
const { protect } = require("../middleware/auth");
const { requireFields } = require("../middleware/validate");
const makeId = require("../utils/generateId");

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const policies = await Policy.find().populate("holder", "name email");
    res.json(policies);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    const policy = await Policy.findById(req.params.id).populate("holder", "name email");

    if (!policy) return res.status(404).json({ message: "Policy not found" });

    res.json(policy);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  protect,
  requireFields(["policyType", "coverageAmount", "startDate", "endDate"]),
  async (req, res, next) => {
    try {
      const policy = await Policy.create({
        policyNumber: makeId("POL"),
        holder: req.body.holder || req.user._id,
        policyType: req.body.policyType,
        vehicleNumber: req.body.vehicleNumber || "",
        coverageAmount: req.body.coverageAmount,
        startDate: req.body.startDate,
        endDate: req.body.endDate
      });

      res.status(201).json(policy);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", protect, async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!policy) return res.status(404).json({ message: "Policy not found" });

    res.json(policy);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);

    if (!policy) return res.status(404).json({ message: "Policy not found" });

    res.json({ message: "Policy deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
