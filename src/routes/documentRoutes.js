const express = require("express");
const fs = require("fs");
const path = require("path");

const Document = require("../models/Document");
const Policy = require("../models/Policy");
const { protect } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { requireFields } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("file"),
  requireFields(["title"]),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File is required" });
      }

      const document = await Document.create({
        claim: req.body.claim || null,
        policy: req.body.policy || null,
        uploadedBy: req.user._id,
        title: req.body.title,
        type: req.body.type || "other",
        filePath: `/uploads/${req.file.filename}`
      });

      res.status(201).json({
        message: "Document uploaded",
        document
      });
    } catch (error) {
      next(error);
    }
  }
);

// Simple policy-document generator required by the case study.
router.post(
  "/generate",
  protect,
  requireFields(["policy"]),
  async (req, res, next) => {
    try {
      const policy = await Policy.findById(req.body.policy).populate(
        "holder",
        "name email"
      );

      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }

      const title = req.body.title || `Policy Document - ${policy.policyNumber}`;
      const fileName = `policy-${policy.policyNumber}-${Date.now()}.txt`;
      const filePath = path.join(process.cwd(), "uploads", fileName);

      const documentText = [
        "CLAIMFAST POLICY DOCUMENT",
        "---------------------------",
        `Policy Number: ${policy.policyNumber}`,
        `Policy Holder: ${policy.holder.name}`,
        `Email: ${policy.holder.email}`,
        `Policy Type: ${policy.policyType}`,
        `Vehicle Number: ${policy.vehicleNumber || "N/A"}`,
        `Coverage Amount: ${policy.coverageAmount}`,
        `Start Date: ${new Date(policy.startDate).toDateString()}`,
        `End Date: ${new Date(policy.endDate).toDateString()}`
      ].join("\n");

      fs.writeFileSync(filePath, documentText);

      const document = await Document.create({
        policy: policy._id,
        uploadedBy: req.user._id,
        title,
        type: "policy",
        filePath: `/uploads/${fileName}`
      });

      res.status(201).json({
        message: "Policy document generated",
        document
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/", protect, async (req, res, next) => {
  try {
    const documents = await Document.find()
      .populate("claim", "claimNumber status")
      .populate("policy", "policyNumber policyType")
      .populate("uploadedBy", "name email");

    res.json(documents);
  } catch (error) {
    next(error);
  }
});

router.get("/claims/:id", protect, async (req, res, next) => {
  try {
    const documents = await Document.find({ claim: req.params.id });
    res.json(documents);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);

    if (!document) return res.status(404).json({ message: "Document not found" });

    res.json({ message: "Document deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
