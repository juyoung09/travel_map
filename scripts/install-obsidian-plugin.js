const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const vaultPath = process.argv[2];
const pluginId = "travel-photo-atlas";

if (!vaultPath) {
  console.error("Usage: node scripts/install-obsidian-plugin.js <vault-path>");
  process.exit(1);
}

const targetDir = path.join(vaultPath, ".obsidian", "plugins", pluginId);
const targetAppDir = path.join(targetDir, "app");
const sourcePluginDir = path.join(rootDir, "obsidian-plugin");
const sharedStatePath = path.join(rootDir, "data", "shared-state.json");
const targetDataPath = path.join(targetDir, "data.json");

install().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function install() {
  await fs.promises.mkdir(targetAppDir, { recursive: true });

  await copyFile(path.join(sourcePluginDir, "manifest.json"), path.join(targetDir, "manifest.json"));
  await copyFile(path.join(sourcePluginDir, "main.js"), path.join(targetDir, "main.js"));
  await copyFile(path.join(sourcePluginDir, "styles.css"), path.join(targetDir, "styles.css"));
  await copyFile(path.join(sourcePluginDir, "app", "obsidian-host.js"), path.join(targetAppDir, "obsidian-host.js"));

  await copyFile(path.join(rootDir, "app.js"), path.join(targetAppDir, "app.js"));
  await copyFile(path.join(rootDir, "styles.css"), path.join(targetAppDir, "styles.css"));
  await copyFile(path.join(rootDir, "map-data.js"), path.join(targetAppDir, "map-data.js"));

  const sourceHtml = await fs.promises.readFile(path.join(rootDir, "index.html"), "utf8");
  const targetHtml = injectObsidianHost(sourceHtml);
  await fs.promises.writeFile(path.join(targetAppDir, "index.html"), targetHtml, "utf8");
  await seedPluginData();

  await enablePlugin(vaultPath, pluginId);

  console.log(`Installed ${pluginId} to ${targetDir}`);
}

async function seedPluginData() {
  try {
    await fs.promises.access(targetDataPath, fs.constants.F_OK);
    return;
  } catch (error) {
    // Continue and seed from shared state when the plugin has no existing data file.
  }

  try {
    const raw = await fs.promises.readFile(sharedStatePath, "utf8");
    const parsed = JSON.parse(raw);
    const payload = {
      version: 1,
      updatedAt: typeof parsed?.updatedAt === "string" ? parsed.updatedAt : null,
      edits: parsed?.edits && typeof parsed.edits === "object" && !Array.isArray(parsed.edits) ? parsed.edits : {}
    };
    await fs.promises.writeFile(targetDataPath, JSON.stringify(payload, null, 2), "utf8");
  } catch (error) {
    const fallback = {
      version: 1,
      updatedAt: null,
      edits: {}
    };
    await fs.promises.writeFile(targetDataPath, JSON.stringify(fallback, null, 2), "utf8");
  }
}

async function copyFile(source, target) {
  await fs.promises.copyFile(source, target);
}

function injectObsidianHost(html) {
  if (html.includes("obsidian-host.js")) {
    return html;
  }

  return html.replace(
    /(\s*<script src="map-data\.js\?v=[^"]+"><\/script>)/,
    '\n    <script src="obsidian-host.js"></script>$1'
  );
}

async function enablePlugin(vaultDir, id) {
  const communityPluginsPath = path.join(vaultDir, ".obsidian", "community-plugins.json");
  let plugins = [];

  try {
    const raw = await fs.promises.readFile(communityPluginsPath, "utf8");
    const parsed = JSON.parse(raw);
    plugins = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    plugins = [];
  }

  if (!plugins.includes(id)) {
    plugins.push(id);
    await fs.promises.writeFile(communityPluginsPath, JSON.stringify(plugins, null, 2), "utf8");
  }
}
