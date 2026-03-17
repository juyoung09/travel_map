const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const localHost = "127.0.0.1";
const localUrl = `http://${localHost}:${port}`;
const shareStatusPath = path.join(rootDir, "data", "public-share-status.json");

let serverProcess = null;
let tunnelProcess = null;
let shuttingDown = false;
let announcedUrl = false;

start().catch((error) => {
  console.error(error);
  shutdown(1);
});

async function start() {
  writeShareStatus({
    status: "starting",
    localUrl,
    publicUrl: null,
    pid: process.pid
  });

  console.log("Starting Travel Map Photo Atlas for public sharing...");
  serverProcess = spawn(process.execPath, [path.join(__dirname, "serve.js")], {
    cwd: rootDir,
    env: {
      ...process.env,
      HOST: localHost,
      PORT: String(port)
    },
    stdio: ["inherit", "pipe", "pipe"],
    windowsHide: true
  });

  pipeOutput(serverProcess.stdout, "[server]");
  pipeOutput(serverProcess.stderr, "[server]");
  serverProcess.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`Local server stopped (code ${code ?? "unknown"}).`);
      shutdown(code || 1);
    }
  });

  await waitForServerOutput(serverProcess, "Travel Map Photo Atlas server running at:", 15000);
  console.log(`Local app ready at ${localUrl}`);

  const tunnelArgs = [
    "-T",
    "-o",
    "StrictHostKeyChecking=no",
    "-o",
    "ServerAliveInterval=60",
    "-o",
    "ExitOnForwardFailure=yes",
    "-R",
    `80:${localHost}:${port}`,
    "nokey@localhost.run"
  ];

  tunnelProcess = spawn("ssh", tunnelArgs, {
    cwd: rootDir,
    env: process.env,
    stdio: ["inherit", "pipe", "pipe"],
    windowsHide: true
  });

  pipeOutput(tunnelProcess.stdout, "[tunnel]", true);
  pipeOutput(tunnelProcess.stderr, "[tunnel]", true);
  tunnelProcess.on("exit", (code) => {
    if (!shuttingDown) {
      console.error(`Public tunnel stopped (code ${code ?? "unknown"}).`);
      shutdown(code || 1);
    }
  });

  console.log("Opening public tunnel...");
  console.log("Keep this window open while you want other computers to access the app.");
}

function pipeOutput(stream, prefix, scanForUrl = false) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    const text = String(chunk);
    process.stdout.write(`${prefix} ${text}`);
    if (scanForUrl) {
      announcePublicUrl(text);
    }
  });
}

function announcePublicUrl(text) {
  const publicUrl = extractPublicUrl(text);
  if (!publicUrl || announcedUrl) {
    return;
  }

  announcedUrl = true;
  writeShareStatus({
    status: "running",
    localUrl,
    publicUrl,
    pid: process.pid
  });
  console.log("");
  console.log("Public share URL");
  console.log(publicUrl);
  console.log("");
  console.log("Open that address on any other computer or mobile device.");
}

function waitForServerOutput(childProcess, marker, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("server_start_timeout"));
    }, timeoutMs);

    const handleData = (chunk) => {
      if (!String(chunk).includes(marker)) {
        return;
      }
      cleanup();
      resolve();
    };

    const handleExit = (code) => {
      cleanup();
      reject(new Error(`server_exit_${code ?? "unknown"}`));
    };

    const cleanup = () => {
      clearTimeout(timer);
      childProcess.stdout.off("data", handleData);
      childProcess.stderr.off("data", handleData);
      childProcess.off("exit", handleExit);
    };

    childProcess.stdout.on("data", handleData);
    childProcess.stderr.on("data", handleData);
    childProcess.on("exit", handleExit);
  });
}

function shutdown(exitCode) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  if (tunnelProcess && !tunnelProcess.killed) {
    tunnelProcess.kill();
  }
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill();
  }

  writeShareStatus({
    status: "stopped",
    localUrl,
    publicUrl: null,
    pid: process.pid
  });

  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

function extractPublicUrl(text) {
  const candidates = text.match(/https:\/\/[^\s\]]+/gi) || [];
  const preferred = candidates.find((candidate) => candidate.includes(".lhr.life"));
  if (preferred) {
    return preferred;
  }

  return candidates.find((candidate) => {
    return !candidate.includes("twitter.com")
      && !candidate.includes("admin.localhost.run")
      && !candidate.includes("localhost.run/docs")
      && !candidate.includes("localhost:3000");
  }) || null;
}

function writeShareStatus(status) {
  try {
    fs.mkdirSync(path.dirname(shareStatusPath), { recursive: true });
    fs.writeFileSync(shareStatusPath, JSON.stringify({
      ...status,
      updatedAt: new Date().toISOString()
    }, null, 2));
  } catch (error) {
    console.error("Failed to write share status.", error);
  }
}
