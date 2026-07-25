import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User";
import { hashPassword } from "../utils/auth";

async function seed() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";
  const mongoUri = process.env.MONGODB_URI;

  if (!email || !password || !mongoUri) {
    console.error(
      "Set MONGODB_URI, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD in your environment before running this script."
    );
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`Admin user ${email} already exists. Skipping.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword(password);
  await User.create({ email: email.toLowerCase(), passwordHash, name });
  console.log(`Created admin user: ${email}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
