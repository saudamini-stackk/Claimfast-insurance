const mongoose = require("mongoose");

const renewalSchema = new mongoose.Schema(
  {
    policy: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true },
    reminderDate: { type: Date, required: true },
    sent: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Renewal", renewalSchema);
