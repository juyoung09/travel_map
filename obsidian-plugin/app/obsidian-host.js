(() => {
  const CHANNEL = "travel-photo-atlas-plugin";
  const pending = new Map();
  let nextId = 0;

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || data.channel !== CHANNEL || data.direction !== "response") {
      return;
    }

    const request = pending.get(data.id);
    if (!request) {
      return;
    }

    window.clearTimeout(request.timeoutId);
    pending.delete(data.id);

    if (data.ok) {
      request.resolve(data.result);
      return;
    }

    request.reject(new Error(data.error || "bridge_request_failed"));
  });

  function callHost(type, payload) {
    return new Promise((resolve, reject) => {
      const id = `travel-photo-atlas-${Date.now()}-${nextId += 1}`;
      const timeoutId = window.setTimeout(() => {
        pending.delete(id);
        reject(new Error(`bridge_timeout:${type}`));
      }, 15000);

      pending.set(id, { resolve, reject, timeoutId });
      window.parent.postMessage({
        channel: CHANNEL,
        direction: "request",
        id,
        type,
        payload
      }, "*");
    });
  }

  window.TRAVEL_MAP_HOST = {
    isAvailable: true,
    loadEdits() {
      return callHost("loadEdits");
    },
    saveEdits(edits) {
      return callHost("saveEdits", { edits });
    }
  };
})();
