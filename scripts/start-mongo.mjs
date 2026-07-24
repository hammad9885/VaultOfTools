import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { MongoMemoryServer } from "mongodb-memory-server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", ".mongo-data");
fs.mkdirSync(dbPath, { recursive: true });

const server = await MongoMemoryServer.create({
  instance: { port: 27017, dbPath, ip: "127.0.0.1" },
});

console.log("MongoDB ready at", server.getUri());
console.log("Data dir:", dbPath);
console.log("Keep this terminal open. Press Ctrl+C to stop.");

process.on("SIGINT", async () => {
  try { await server.stop(); } catch (e) {}
  process.exit(0);
});
process.on("SIGTERM", async () => {
  try { await server.stop(); } catch (e) {}
  process.exit(0);
});
process.stdin.resume();
