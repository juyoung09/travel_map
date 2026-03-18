const { ItemView, Notice, Plugin, normalizePath } = require("obsidian");

const VIEW_TYPE = "travel-photo-atlas-view";
const VIEW_NAME = "Travel Photo Atlas";
const CHANNEL = "travel-photo-atlas-plugin";

module.exports = class TravelPhotoAtlasPlugin extends Plugin {
  async onload() {
    await this.ensureDefaultData();

    this.registerView(VIEW_TYPE, (leaf) => new TravelPhotoAtlasView(leaf, this));

    this.addRibbonIcon("map-pinned", VIEW_NAME, () => {
      void this.activateView();
    });

    this.addCommand({
      id: "open-travel-photo-atlas",
      name: "Open Travel Photo Atlas",
      callback: () => {
        void this.activateView();
      }
    });

    this.registerDomEvent(window, "message", (event) => {
      void this.handleBridgeMessage(event);
    });

    this.app.workspace.onLayoutReady(() => {
      window.setTimeout(() => {
        void this.activateView();
      }, 300);
    });
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  getPluginDir() {
    return normalizePath(`${this.app.vault.configDir}/plugins/${this.manifest.id}`);
  }

  getAppUrl() {
    const entryPath = normalizePath(`${this.getPluginDir()}/app/index.html`);
    return this.app.vault.adapter.getResourcePath(entryPath);
  }

  async activateView() {
    let leaf = this.app.workspace.getLeavesOfType(VIEW_TYPE)[0];

    if (!leaf) {
      leaf = this.app.workspace.getLeaf("tab") || this.app.workspace.getLeaf(true);
      await leaf.setViewState({
        type: VIEW_TYPE,
        active: true
      });
    }

    this.app.workspace.revealLeaf(leaf);
  }

  async ensureDefaultData() {
    const existing = await this.loadData();
    if (existing && typeof existing === "object") {
      return;
    }

    await this.saveData(createEmptyState());
  }

  async loadAtlasState() {
    const stored = await this.loadData();
    return normalizeState(stored);
  }

  async saveAtlasState(edits) {
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      edits: isPlainObject(edits) ? edits : {}
    };

    await this.saveData(payload);
    return payload;
  }

  async handleBridgeMessage(event) {
    const data = event.data;
    if (!data || data.channel !== CHANNEL || data.direction !== "request") {
      return;
    }

    const sourceWindow = event.source;
    if (!sourceWindow || typeof sourceWindow.postMessage !== "function") {
      return;
    }

    try {
      let result;

      if (data.type === "loadEdits") {
        result = await this.loadAtlasState();
      } else if (data.type === "saveEdits") {
        result = await this.saveAtlasState(data.payload?.edits);
      } else {
        throw new Error(`Unknown request: ${data.type}`);
      }

      sourceWindow.postMessage({
        channel: CHANNEL,
        direction: "response",
        id: data.id,
        ok: true,
        result
      }, "*");
    } catch (error) {
      sourceWindow.postMessage({
        channel: CHANNEL,
        direction: "response",
        id: data.id,
        ok: false,
        error: error?.message || String(error)
      }, "*");
      new Notice("Travel Photo Atlas request failed.");
    }
  }
};

class TravelPhotoAtlasView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return VIEW_NAME;
  }

  getIcon() {
    return "map-pinned";
  }

  async onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("travel-photo-atlas-view");

    const frame = this.contentEl.createEl("iframe", {
      cls: "travel-photo-atlas-frame"
    });
    frame.src = this.plugin.getAppUrl();
    frame.setAttribute("allow", "clipboard-write");
  }

  async onClose() {
    this.contentEl.empty();
  }
}

function createEmptyState() {
  return {
    version: 1,
    updatedAt: null,
    edits: {}
  };
}

function normalizeState(value) {
  return {
    version: 1,
    updatedAt: typeof value?.updatedAt === "string" ? value.updatedAt : null,
    edits: isPlainObject(value?.edits) ? value.edits : {}
  };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
