const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
process.on("unhandledRejection", (err) => { console.error("UNHANDLED:", err); process.exit(1); });

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Vault of Tools API running on http://localhost:${PORT}`);
  });
});
