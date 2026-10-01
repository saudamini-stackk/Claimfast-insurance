const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    claimNumber: { type: String, required: true, unique: true },
    policy: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true },
    claimant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    damageAmount: { type: Number, default: 0 },
    firNumber: { type: String, default: "" },
    photos: [{ type: String }],
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "rejected", "paid"],
      default: "submitted"
    },
    adjuster: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);
