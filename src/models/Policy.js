const mongoose = require("mongoose");

const policySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true, unique: true },
    holder: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    policyType: { type: String, required: true },
    vehicleNumber: { type: String, default: "" },
    coverageAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Policy", policySchema);
