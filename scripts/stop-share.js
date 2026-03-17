const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const shareStatusPath = path.join(rootDir, "data", "public-share-status.json");

try {
  const payload = JSON.parse(fs.readFileSync(shareStatusPath, "utf8"));
  if (!payload?.pid) {
    throw new Error("missing_pid");
  }

  process.kill(payload.pid, "SIGTERM");
  console.log(`Stopped public share process ${payload.pid}.`);
} catch (error) {
  if (error.code === "ENOENT") {
    console.log("No public share status file was found.");
    process.exit(0);
  }

  if (error.code === "ESRCH") {
    console.log("Public share process is not running anymore.");
    process.exit(0);
  }

  console.error(error.message || error);
  process.exit(1);
}
