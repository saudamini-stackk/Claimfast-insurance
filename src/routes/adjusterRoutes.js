const express = require("express");

const Adjuster = require("../models/Adjuster");
const { protect, allowRoles } = require("../middleware/auth");
const { requireFields } = require("../middleware/validate");

const router = express.Router();

router.get("/", protect, async (req, res, next) => {
  try {
    const adjusters = await Adjuster.find().populate("user", "name email role");
    res.json(adjusters);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", protect, async (req, res, next) => {
  try {
    const adjuster = await Adjuster.findById(req.params.id).populate(
      "user",
      "name email role"
    );

    if (!adjuster) return res.status(404).json({ message: "Adjuster not found" });

    res.json(adjuster);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  protect,
  allowRoles("admin"),
  requireFields(["user", "employeeId"]),
  async (req, res, next) => {
    try {
      const adjuster = await Adjuster.create({
        user: req.body.user,
        employeeId: req.body.employeeId,
        department: req.body.department || "Claims"
      });

      res.status(201).json(adjuster);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id", protect, allowRoles("admin", "adjuster"), async (req, res, next) => {
  try {
    const adjuster = await Adjuster.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!adjuster) return res.status(404).json({ message: "Adjuster not found" });

    res.json(adjuster);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, allowRoles("admin"), async (req, res, next) => {
  try {
    const adjuster = await Adjuster.findByIdAndDelete(req.params.id);

    if (!adjuster) return res.status(404).json({ message: "Adjuster not found" });

    res.json({ message: "Adjuster deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
