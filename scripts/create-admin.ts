import { connectDB } from "../app/lib/config/db.js";
import User from "../app/lib/models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const envLocal = path.join(root, ".env.local");
if (fs.existsSync(envLocal)) {
  for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w._-]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

async function createAdmin() {
  await connectDB();
  const email = "mrhammadghg@gmail.com";
  const password = "Hammad@2121";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "super_admin";
    existing.status = "active";
    existing.password = password;
    await existing.save();
    console.log("Updated existing user to super_admin:", existing.email);
  } else {
    const user = new User({
      email,
      password,
      displayName: "Hammad",
      role: "super_admin",
      status: "active",
    });
    await user.save();
    console.log("Created super_admin user:", user.email);
  }

  const verify = await User.findOne({ email });
  const ok = await verify!.comparePassword(password);
  console.log("Login check:", ok ? "password OK" : "password MISMATCH");

  const total = await User.countDocuments();
  console.log("Total users in DB:", total);
  const superAdmins = await User.find({ role: "super_admin" });
  console.log("Super admins:", superAdmins.map((u) => u.email));
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
