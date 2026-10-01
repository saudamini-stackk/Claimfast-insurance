const mongoose = require("mongoose");

const adjusterSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: String, default: "Claims" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adjuster", adjusterSchema);
