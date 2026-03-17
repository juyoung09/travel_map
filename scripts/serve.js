const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const sharedStatePath = path.join(rootDir, "data", "shared-state.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".geojson": "application/geo+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = http
  .createServer((request, response) => {
    const pathname = decodeURIComponent((request.url || "/").split("?")[0] || "/");

    if (pathname === "/api/health") {
      writeJson(response, 200, { ok: true });
      return;
    }

    if (pathname === "/api/state") {
      handleSharedStateRequest(request, response);
      return;
    }

    const requestPath = pathname === "/" ? "/index.html" : pathname;
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    const targetPath = path.join(rootDir, safePath);

    if (!targetPath.startsWith(rootDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(targetPath, (error, buffer) => {
      if (error) {
        response.writeHead(error.code === "ENOENT" ? 404 : 500);
        response.end(error.code === "ENOENT" ? "Not Found" : "Server Error");
        return;
      }

      response.writeHead(200, {
        "Content-Type": contentTypes[path.extname(targetPath).toLowerCase()] || "application/octet-stream"
      });
      response.end(buffer);
    });
  })
  .listen(port, host, () => {
    const urls = getServerUrls(port, host);
    console.log("Travel Map Photo Atlas server running at:");
    urls.forEach((url) => console.log(`- ${url}`));
  });

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Close the existing server or run with PORT=<other port>.`);
    return;
  }
  if (error.code === "EACCES") {
    console.error(`Cannot listen on ${host}:${port}. Try a different port or run with HOST=127.0.0.1 for local-only access.`);
    return;
  }
  console.error(error);
});

function getServerUrls(portNumber, hostName) {
  const urls = new Set([`http://localhost:${portNumber}`]);
  if (hostName !== "127.0.0.1" && hostName !== "localhost") {
    urls.add(`http://${hostName === "0.0.0.0" ? "127.0.0.1" : hostName}:${portNumber}`);
  }

  const interfaces = os.networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) {
        urls.add(`http://${entry.address}:${portNumber}`);
      }
    }
  }

  return [...urls];
}

function handleSharedStateRequest(request, response) {
  if (request.method === "GET") {
    readSharedState()
      .then((state) => writeJson(response, 200, state))
      .catch((error) => {
        console.error(error);
        writeJson(response, 500, { error: "state_read_failed" });
      });
    return;
  }

  if (request.method === "PUT") {
    readJsonBody(request)
      .then((payload) => {
        if (!payload || typeof payload !== "object" || Array.isArray(payload) || typeof payload.edits !== "object" || !payload.edits || Array.isArray(payload.edits)) {
          writeJson(response, 400, { error: "invalid_state_payload" });
          return null;
        }
        return writeSharedState(payload.edits).then((state) => writeJson(response, 200, state));
      })
      .catch((error) => {
        const statusCode = error && error.code === "PAYLOAD_TOO_LARGE" ? 413 : 400;
        writeJson(response, statusCode, { error: error?.message || "invalid_json" });
      });
    return;
  }

  response.writeHead(405, { Allow: "GET, PUT" });
  response.end("Method Not Allowed");
}

async function readSharedState() {
  try {
    const raw = await fs.promises.readFile(sharedStatePath, "utf8");
    return normalizeSharedState(JSON.parse(raw));
  } catch (error) {
    if (error.code === "ENOENT") {
      return createEmptySharedState();
    }
    throw error;
  }
}

async function writeSharedState(edits) {
  const state = normalizeSharedState({
    version: 1,
    updatedAt: new Date().toISOString(),
    edits
  });

  await fs.promises.mkdir(path.dirname(sharedStatePath), { recursive: true });
  await fs.promises.writeFile(sharedStatePath, JSON.stringify(state, null, 2), "utf8");
  return state;
}

function createEmptySharedState() {
  return {
    version: 1,
    updatedAt: null,
    edits: {}
  };
}

function normalizeSharedState(payload) {
  const fallback = createEmptySharedState();
  return {
    version: 1,
    updatedAt: typeof payload?.updatedAt === "string" ? payload.updatedAt : fallback.updatedAt,
    edits: isPlainObject(payload?.edits) ? payload.edits : fallback.edits
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;

    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > 100 * 1024 * 1024) {
        const error = new Error("payload_too_large");
        error.code = "PAYLOAD_TOO_LARGE";
        reject(error);
        request.destroy();
        return;
      }
      body += chunk;
    });
    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("invalid_json"));
      }
    });
    request.on("error", reject);
  });
}

function writeJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}
