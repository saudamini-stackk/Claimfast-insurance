const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    claim: { type: mongoose.Schema.Types.ObjectId, ref: "Claim", required: true },
    amount: { type: Number, required: true },
    bankAccount: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    transactionId: { type: String, default: "" },
    paidAt: { type: Date, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payout", payoutSchema);
