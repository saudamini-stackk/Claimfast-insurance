const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    claim: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", default: null },
    policy: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", default: null },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    type: { type: String, default: "other" },
    filePath: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
