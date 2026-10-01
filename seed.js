require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./src/config/db");
const User = require("./src/models/User");
const Policy = require("./src/models/Policy");
const makeId = require("./src/utils/generateId");

async function seed() {
  await connectDB();

  await User.deleteMany({
    email: {
      $in: [
        "demo.policyholder@claimfast.com",
        "demo.adjuster@claimfast.com",
        "demo.admin@claimfast.com"
      ]
    }
  });

  const password = await bcrypt.hash("123456", 10);

  const policyholder = await User.create({
    name: "Demo Policyholder",
    email: "demo.policyholder@claimfast.com",
    password,
    role: "policyholder"
  });

  const adjuster = await User.create({
    name: "Demo Adjuster",
    email: "demo.adjuster@claimfast.com",
    password,
    role: "adjuster"
  });

  const admin = await User.create({
    name: "Demo Admin",
    email: "demo.admin@claimfast.com",
    password,
    role: "admin"
  });

  const policy = await Policy.create({
    policyNumber: makeId("POL"),
    holder: policyholder._id,
    policyType: "Car Insurance",
    vehicleNumber: "MH46AB1234",
    coverageAmount: 500000,
    startDate: new Date("2026-01-01"),
    endDate: new Date("2026-12-31")
  });

  console.log("\\nDemo data created:");
  console.log("Policyholder: demo.policyholder@claimfast.com / 123456");
  console.log("Adjuster:     demo.adjuster@claimfast.com / 123456");
  console.log("Admin:        demo.admin@claimfast.com / 123456");
  console.log("Policy ID:    " + policy._id);
  console.log("Adjuster ID:  " + adjuster._id);
  console.log("Admin ID:     " + admin._id);

  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
