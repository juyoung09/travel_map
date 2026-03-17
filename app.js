const STORAGE_KEY = "travel-map-photo-atlas-v2";
const SHARED_STATE_ENDPOINT = "/api/state";
const SHARED_STATE_POLL_MS = 15000;
const METRO_CODES = new Set(["11", "21", "22", "23", "24", "25", "26", "29"]);
const OBJECT_KEYS = {
  world: "countries",
  provinces: "skorea_provinces_2018_geo",
  municipalities: "skorea_municipalities_2018_geo",
  submunicipalities: "skorea_submunicipalities_2018_geo"
};

const VIEW_CONFIGS = [
  {
    id: "world",
    icon: "🌍",
    badge: "Version 1",
    shortTitle: "세계 지도",
    title: "세계 지도 · 실제 국가 경계",
    description: "실제 국가 경계를 기반으로 사진을 채우는 버전입니다. 작은 국가는 상단 지역 선택으로 바로 이동할 수 있습니다.",
    detail: "세계 국가 실경계"
  },
  {
    id: "korea-city",
    icon: "🗺️",
    badge: "Version 2",
    shortTitle: "한국 시 단위",
    title: "남한 지도 · 실제 시군구 경계",
    description: "전국 시군구 실제 경계를 기반으로 구성했고, 도 경계는 굵은 선으로 따로 올렸습니다.",
    detail: "전국 시군구 실경계"
  },
  {
    id: "japan-prefecture",
    icon: "🗾",
    badge: "Version 3",
    shortTitle: "일본 도도부현",
    title: "일본 지도 · 현재 도도부현 경계",
    description: "일본은 현재 기준 47개 도도부현 경계로 나눠서 사진을 채울 수 있게 추가했습니다.",
    detail: "일본 도도부현 실경계"
  },
  {
    id: "metro-detail",
    icon: "🏙️",
    badge: "Version 4",
    shortTitle: "특별·광역시 상세",
    title: "특별·광역시 상세 · 실제 구 경계",
    description: "특별·광역시는 먼저 구 경계를 보고, 원하는 구를 눌러 동·읍·면 상세로 내려가도록 구성했습니다.",
    detail: "광역시·특별시 구 실경계"
  },
  {
    id: "local-detail",
    icon: "📍",
    badge: "Version 5",
    shortTitle: "일반 시·군 상세",
    title: "일반 시·군 상세 · 실제 읍면동 경계",
    description: "일반 시·군과 특별·광역시의 구 단위까지 포함해, 실제 읍·면·동 경계로 세밀하게 사진을 보관할 수 있습니다.",
    detail: "시·군 및 광역시 구 읍면동 실경계"
  }
];

const DEFAULT_REGION_IDS = {
  world: "410",
  "korea-city": "11010",
  "japan-prefecture": "東京都",
  "metro-detail": "11010",
  "local-detail": "3203011"
};
const WORLD_NAME_OVERRIDES = {
  "countries-160": "북키프로스",
  "countries-167": "소말릴란드",
  "countries-174": "코소보"
};
const JAPAN_PREFECTURE_KO = {
  "北海道": "홋카이도",
  "青森県": "아오모리현",
  "岩手県": "이와테현",
  "宮城県": "미야기현",
  "秋田県": "아키타현",
  "山形県": "야마가타현",
  "福島県": "후쿠시마현",
  "茨城県": "이바라키현",
  "栃木県": "도치기현",
  "群馬県": "군마현",
  "埼玉県": "사이타마현",
  "千葉県": "지바현",
  "東京都": "도쿄도",
  "神奈川県": "가나가와현",
  "新潟県": "니가타현",
  "富山県": "도야마현",
  "石川県": "이시카와현",
  "福井県": "후쿠이현",
  "山梨県": "야마나시현",
  "長野県": "나가노현",
  "岐阜県": "기후현",
  "静岡県": "시즈오카현",
  "愛知県": "아이치현",
  "三重県": "미에현",
  "滋賀県": "시가현",
  "京都府": "교토부",
  "大阪府": "오사카부",
  "兵庫県": "효고현",
  "奈良県": "나라현",
  "和歌山県": "와카야마현",
  "鳥取県": "돗토리현",
  "島根県": "시마네현",
  "岡山県": "오카야마현",
  "広島県": "히로시마현",
  "山口県": "야마구치현",
  "徳島県": "도쿠시마현",
  "香川県": "가가와현",
  "愛媛県": "에히메현",
  "高知県": "고치현",
  "福岡県": "후쿠오카현",
  "佐賀県": "사가현",
  "長崎県": "나가사키현",
  "熊本県": "구마모토현",
  "大分県": "오이타현",
  "宮崎県": "미야자키현",
  "鹿児島県": "가고시마현",
  "沖縄県": "오키나와현"
};
const VIEW_VISUALS = {
  world: {
    outlineWidth: 2,
    activeOutlineWidth: 2.6,
    overlayWidth: 0,
    labelSize: 18,
    labelStrokeWidth: 6.5,
    labelWeight: 650
  },
  "korea-city": {
    outlineWidth: 1.15,
    activeOutlineWidth: 1.85,
    overlayWidth: 2.1,
    labelSize: 10.6,
    labelStrokeWidth: 3.1,
    labelWeight: 500
  },
  "japan-prefecture": {
    outlineWidth: 1.5,
    activeOutlineWidth: 2.2,
    overlayWidth: 0,
    labelSize: 9.2,
    labelStrokeWidth: 2.1,
    labelWeight: 420
  },
  "metro-detail": {
    outlineWidth: 1.35,
    activeOutlineWidth: 2,
    overlayWidth: 0,
    labelSize: 13,
    labelStrokeWidth: 4.2,
    labelWeight: 540
  },
  "local-detail": {
    outlineWidth: 0.8,
    activeOutlineWidth: 1.35,
    overlayWidth: 1.6,
    labelSize: 4.8,
    labelStrokeWidth: 1.2,
    labelWeight: 430
  }
};
const VIEW_GEOMETRY_FILTERS = {
  world: {
    minPolygonArea: 20,
    keepLargest: true
  },
  "korea-city": {
    minPolygonArea: 5,
    keepLargest: true
  },
  "japan-prefecture": {
    minPolygonArea: 5,
    keepLargest: true
  },
  "metro-detail": {
    minPolygonArea: 4,
    keepLargest: true
  },
  "local-detail": {
    minPolygonArea: 4,
    keepLargest: true
  }
};
const MAP_ZOOM_LIMITS = {
  minScale: 1,
  maxScale: 12
};
const DATA_INDEX = buildDataIndex(window.MAP_TOPOLOGIES);
const VIEW_CACHE = new Map();

const appState = {
  currentViewId: "world",
  selectedRegionKey: null,
  edits: {},
  filters: {
    metro: DATA_INDEX.metroOptions[0]?.id || "11",
    local: DATA_INDEX.localOptions.find((option) => option.id === "32030")?.id || DATA_INDEX.localOptions[0]?.id || ""
  },
  modal: {
    open: false,
    viewId: null,
    regionId: null,
    focusId: null,
    draft: null,
    drag: null
  },
  map: {
    drag: null,
    suppressClickUntil: 0,
    viewports: {}
  },
  sync: {
    remoteAvailable: false,
    remoteUpdatedAt: null,
    pollHandle: null
  }
};

const refs = {
  viewTabs: document.querySelector("#viewTabs"),
  viewList: document.querySelector("#viewList"),
  viewBadge: document.querySelector("#viewBadge"),
  viewTitle: document.querySelector("#viewTitle"),
  viewDescription: document.querySelector("#viewDescription"),
  viewContextControls: document.querySelector("#viewContextControls"),
  mapStage: document.querySelector("#mapStage"),
  mapTooltip: document.querySelector("#mapTooltip"),
  regionSummary: document.querySelector("#regionSummary"),
  editorModal: document.querySelector("#editorModal"),
  editorScope: document.querySelector("#editorScope"),
  editorTitle: document.querySelector("#editorTitle"),
  editorSubtitle: document.querySelector("#editorSubtitle"),
  photoInput: document.querySelector("#photoInput"),
  clearPhotoBtn: document.querySelector("#clearPhotoBtn"),
  zoomRange: document.querySelector("#zoomRange"),
  zoomValue: document.querySelector("#zoomValue"),
  editorCanvas: document.querySelector("#editorCanvas"),
  editorPreview: document.querySelector("#editorPreview"),
  editorPlaceholder: document.querySelector("#editorPlaceholder"),
  saveDraftBtn: document.querySelector("#saveDraftBtn"),
  resetDraftBtn: document.querySelector("#resetDraftBtn"),
  closeModalBtn: document.querySelector("#closeModalBtn"),
  exportImageBtn: document.querySelector("#exportImageBtn"),
  resetViewBtn: document.querySelector("#resetViewBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput")
};

void init();

async function init() {
  renderViewList();
  bindGlobalEvents();
  ensureSelectionForViewData(getCurrentViewData(), true);
  render();

  await hydrateEdits();
  ensureSelectionForViewData(getCurrentViewData(), true);
  render();
  startSharedStatePolling();
}

function render() {
  const viewConfig = getCurrentViewConfig();
  const viewData = getCurrentViewData();
  ensureSelectionForViewData(viewData);

  refs.viewBadge.textContent = viewConfig.badge;
  refs.viewTitle.textContent = getViewTitle(viewConfig);
  refs.viewDescription.textContent = getViewDescription(viewConfig);

  renderViewTabs();
  renderContextControls(viewConfig, viewData);
  renderMap(viewConfig, viewData);
  renderSummary(viewConfig, viewData);
  renderEditor();
}

function renderViewTabs() {
  refs.viewTabs.innerHTML = "";
  for (const view of VIEW_CONFIGS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `view-tab${view.id === appState.currentViewId ? " active" : ""}`;
    button.innerHTML = `
      <span class="tab-icon" aria-hidden="true">${view.icon}</span>
      <span>${view.shortTitle}</span>
    `;
    button.addEventListener("click", () => {
      appState.currentViewId = view.id;
      ensureSelectionForViewData(getCurrentViewData(), true);
      render();
    });
    refs.viewTabs.appendChild(button);
  }
}

function renderViewList() {
  refs.viewList.innerHTML = "";
  for (const view of VIEW_CONFIGS) {
    const item = document.createElement("li");
    item.textContent = `${view.badge} · ${view.shortTitle} - ${view.detail}`;
    refs.viewList.appendChild(item);
  }
}

function renderContextControls(viewConfig, viewData) {
  refs.viewContextControls.innerHTML = "";
  const selectedRegion = getSelectedRegion(viewData, true);

  if (viewConfig.id === "metro-detail") {
    refs.viewContextControls.appendChild(
      createSelectControl("도시 선택", DATA_INDEX.metroOptions, appState.filters.metro, (value) => {
        appState.filters.metro = value;
        ensureSelectionForViewData(getCurrentViewData(), true);
        render();
      })
    );
  }

  if (viewConfig.id === "local-detail") {
    refs.viewContextControls.appendChild(
      createSelectControl("시·군/구 선택", DATA_INDEX.localOptions, appState.filters.local, (value) => {
        appState.filters.local = value;
        ensureSelectionForViewData(getCurrentViewData(), true);
        render();
      })
    );
  }

  const regionOptions = [...viewData.regions]
    .sort((left, right) => getRegionDisplayName(left).localeCompare(getRegionDisplayName(right), "ko"))
    .map((region) => ({ id: region.id, name: getRegionDisplayName(region) }));

  refs.viewContextControls.appendChild(
    createSelectControl("지역 이동", regionOptions, selectedRegion?.id || "", (value) => {
      appState.selectedRegionKey = value ? getRegionKey(appState.currentViewId, value) : null;
      render();
    }, "선택 안 함")
  );

  const helper = document.createElement("div");
  helper.className = "select-wrap";
  const helperText = document.createElement("span");
  helperText.textContent = viewConfig.id === "metro-detail"
    ? "구 클릭 = 상세 이동 · 휠 줌 · 드래그 이동"
    : "지역 클릭 = 사진 편집 · 휠 줌 · 드래그 이동";
  helper.appendChild(helperText);
  refs.viewContextControls.appendChild(helper);
}

function renderMap(viewConfig, viewData) {
  hideTooltip();

  const viewportState = ensureMapViewport(viewConfig.id, viewData);
  const svg = createSvg("svg", {
    class: "map-svg",
    viewBox: serializeViewBox(viewportState.current),
    role: "img",
    "aria-label": getViewTitle(viewConfig),
    preserveAspectRatio: "xMidYMid meet"
  });
  svg.dataset.viewId = viewConfig.id;
  svg.dataset.viewportKey = viewportState.key;
  applyViewVisualStyle(svg, viewConfig.id);

  const defs = createSvg("defs");
  svg.appendChild(defs);

  svg.addEventListener("click", (event) => {
    if (consumeMapClickSuppression()) {
      return;
    }
    if (event.target === svg) {
      clearCurrentSelection();
    }
  });
  svg.addEventListener("pointerdown", (event) => startMapPan(event, svg));
  svg.addEventListener("pointermove", (event) => moveMapPan(event, svg));
  svg.addEventListener("pointerup", (event) => endMapPan(event, svg));
  svg.addEventListener("pointercancel", (event) => endMapPan(event, svg));
  svg.addEventListener("wheel", (event) => handleMapWheel(event, svg), { passive: false });

  for (const region of viewData.regions) {
    const clipPath = createSvg("clipPath", { id: getClipId(appState.currentViewId, region.id) });
    clipPath.appendChild(createSvg("path", { d: region.path, "fill-rule": "evenodd" }));
    defs.appendChild(clipPath);
  }

  for (const region of viewData.regions) {
    const key = getRegionKey(appState.currentViewId, region.id);
    const edit = appState.edits[key];
    const group = createSvg("g", {
      class: `region-group${appState.selectedRegionKey === key ? " active" : ""}`,
      tabindex: "0"
    });

    const title = createSvg("title");
    title.textContent = getRegionDisplayName(region);
    group.appendChild(title);

    if (edit?.src) {
      const layout = computeImageLayout(region.bounds, edit);
      group.appendChild(createSvg("image", {
        class: "region-image",
        href: edit.src,
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
        "clip-path": `url(#${getClipId(appState.currentViewId, region.id)})`
      }));
    }

    group.appendChild(createSvg("path", {
      class: "region-outline",
      d: region.path,
      "fill-rule": "evenodd"
    }));

    group.appendChild(createSvg("path", {
      class: "region-hit",
      d: region.path,
      "fill-rule": "evenodd"
    }));

    if (!edit?.src && shouldShowLabel(viewConfig, region, key)) {
      const labelMetrics = getRegionLabelMetrics(viewConfig, region, getRegionLabelText(region, viewConfig));
      const label = createSvg("text", {
        class: "region-label",
        x: region.label.x,
        y: region.label.y,
        style: `font-size:${labelMetrics.fontSize}px;stroke-width:${labelMetrics.strokeWidth}px;`
      });
      label.textContent = getRegionLabelText(region, viewConfig);
      group.appendChild(label);
    }

    group.addEventListener("click", (event) => {
      event.stopPropagation();
      handleRegionInteraction(viewConfig, region, key);
    });

    group.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        handleRegionInteraction(viewConfig, region, key);
      }
    });

    group.addEventListener("mousemove", (event) => {
      if (appState.map.drag) {
        return;
      }
      showTooltip(getRegionDisplayName(region), event.clientX, event.clientY);
    });

    group.addEventListener("mouseleave", hideTooltip);
    svg.appendChild(group);
  }

  for (const overlay of viewData.overlays) {
    svg.appendChild(createSvg("path", {
      class: "overlay-boundary",
      d: overlay.path,
      "fill-rule": "evenodd"
    }));
  }

  for (const labelData of viewData.labels || []) {
    const labelMetrics = getRegionLabelMetrics(viewConfig, labelData, labelData.text);
    const label = createSvg("text", {
      class: "region-label",
      x: labelData.x,
      y: labelData.y,
      style: `font-size:${labelMetrics.fontSize}px;stroke-width:${labelMetrics.strokeWidth}px;`
    });
    label.textContent = labelData.text;
    svg.appendChild(label);
  }

  refs.mapStage.querySelector(".map-svg")?.remove();
  refs.mapStage.prepend(svg);
}

function renderSummary(viewConfig, viewData) {
  const region = getSelectedRegion(viewData, true);

  if (!region) {
    const emptyWrapper = document.createElement("div");
    emptyWrapper.className = "empty-state";

    const scope = document.createElement("p");
    scope.className = "eyebrow";
    scope.textContent = viewConfig.shortTitle;

    const title = document.createElement("h3");
    title.textContent = "선택된 지역 없음";

    const description = document.createElement("p");
    description.textContent = viewConfig.id === "metro-detail"
      ? "바다를 누르면 선택이 해제됩니다. 다시 구를 누르면 동·읍·면 상세로 이동합니다."
      : "바다를 누르면 선택이 해제됩니다. 다시 지역을 누르면 사진을 편집할 수 있습니다.";

    emptyWrapper.append(scope, title, description);
    refs.regionSummary.innerHTML = "";
    refs.regionSummary.appendChild(emptyWrapper);
    return;
  }

  const edit = appState.edits[getRegionKey(appState.currentViewId, region.id)];

  const wrapper = document.createElement("div");
  wrapper.className = edit?.src ? "" : "empty-state";

  const scope = document.createElement("p");
  scope.className = "eyebrow";
  scope.textContent = getRegionScope(region, viewConfig);

  const title = document.createElement("h3");
  title.textContent = region.name;

  const description = document.createElement("p");
  description.textContent = getSummaryDescription(viewConfig, region, edit);

  const tag = document.createElement("span");
  tag.className = "summary-tag";
  tag.textContent = getSummaryTag(viewConfig, edit);

  const actionRow = document.createElement("div");
  actionRow.className = "summary-actions";

  if (isRegionEditable(viewConfig)) {
    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.className = "solid-button";
    editButton.textContent = edit?.src ? "사진 다시 편집" : "사진 추가";
    editButton.addEventListener("click", () => {
      openEditor(appState.currentViewId, region.id);
      render();
    });
    actionRow.appendChild(editButton);
  }

  const detailAction = createDetailAction(region, viewConfig);
  if (detailAction) {
    actionRow.appendChild(detailAction);
  }

  wrapper.append(scope, title, description, tag, actionRow);
  refs.regionSummary.innerHTML = "";
  refs.regionSummary.appendChild(wrapper);
}

function ensureMapViewport(viewId, viewData, focusId = getFocusIdForView(viewId)) {
  const key = getViewStateKey(viewId, focusId);
  const base = parseViewBox(viewData.viewBox);
  const existing = appState.map.viewports[key];

  if (!existing || !isSameViewBox(existing.base, base)) {
    appState.map.viewports[key] = {
      key,
      base: { ...base },
      current: { ...base }
    };
  } else {
    existing.base = { ...base };
    existing.current = clampViewport(existing.current, base);
  }

  return appState.map.viewports[key];
}

function startMapPan(event, svg) {
  if (event.button !== 0 || appState.modal.open) {
    return;
  }

  const viewportKey = svg.dataset.viewportKey;
  const viewportState = viewportKey ? appState.map.viewports[viewportKey] : null;
  if (!viewportState) {
    return;
  }

  appState.map.drag = {
    pointerId: event.pointerId,
    viewportKey,
    startClientX: event.clientX,
    startClientY: event.clientY,
    startViewport: { ...viewportState.current },
    moved: false,
    active: false
  };
}

function moveMapPan(event, svg) {
  const drag = appState.map.drag;
  if (!drag || drag.pointerId !== event.pointerId) {
    return;
  }

  const viewportState = appState.map.viewports[drag.viewportKey];
  if (!viewportState) {
    return;
  }

  const rect = svg.getBoundingClientRect();
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  const deltaX = (event.clientX - drag.startClientX) * drag.startViewport.width / width;
  const deltaY = (event.clientY - drag.startClientY) * drag.startViewport.height / height;
  const moved = Math.hypot(event.clientX - drag.startClientX, event.clientY - drag.startClientY) > 4;

  if (!drag.active) {
    if (!moved) {
      return;
    }
    drag.active = true;
    hideTooltip();
    svg.setPointerCapture?.(event.pointerId);
    svg.dataset.dragging = "true";
  }

  viewportState.current = clampViewport({
    ...viewportState.current,
    x: drag.startViewport.x - deltaX,
    y: drag.startViewport.y - deltaY
  }, viewportState.base);

  drag.moved = drag.moved || moved;
  applyViewportToSvg(svg, viewportState.current);
}

function endMapPan(event, svg) {
  const drag = appState.map.drag;
  if (!drag || drag.pointerId !== event.pointerId) {
    return;
  }

  if (drag.active) {
    svg.releasePointerCapture?.(event.pointerId);
    delete svg.dataset.dragging;
  }
  if (drag.active && drag.moved) {
    appState.map.suppressClickUntil = Date.now() + 140;
  }
  appState.map.drag = null;
}

function handleMapWheel(event, svg) {
  const viewportKey = svg.dataset.viewportKey;
  const viewportState = viewportKey ? appState.map.viewports[viewportKey] : null;
  if (!viewportState) {
    return;
  }

  event.preventDefault();
  hideTooltip();

  const rect = svg.getBoundingClientRect();
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  const ratioX = clampNumber((event.clientX - rect.left) / width, 0, 1);
  const ratioY = clampNumber((event.clientY - rect.top) / height, 0, 1);
  const factor = event.deltaY < 0 ? 0.88 : 1.14;
  const minWidth = viewportState.base.width / MAP_ZOOM_LIMITS.maxScale;
  const minHeight = viewportState.base.height / MAP_ZOOM_LIMITS.maxScale;
  const nextWidth = clampNumber(viewportState.current.width * factor, minWidth, viewportState.base.width / MAP_ZOOM_LIMITS.minScale);
  const nextHeight = clampNumber(viewportState.current.height * factor, minHeight, viewportState.base.height / MAP_ZOOM_LIMITS.minScale);
  const anchorX = viewportState.current.x + ratioX * viewportState.current.width;
  const anchorY = viewportState.current.y + ratioY * viewportState.current.height;

  viewportState.current = clampViewport({
    x: anchorX - ratioX * nextWidth,
    y: anchorY - ratioY * nextHeight,
    width: nextWidth,
    height: nextHeight
  }, viewportState.base);

  applyViewportToSvg(svg, viewportState.current);
}

function consumeMapClickSuppression() {
  if (Date.now() <= appState.map.suppressClickUntil) {
    appState.map.suppressClickUntil = 0;
    return true;
  }
  return false;
}

function handleRegionInteraction(viewConfig, region, key) {
  if (consumeMapClickSuppression()) {
    return;
  }
  hideTooltip();

  if (viewConfig.id === "metro-detail") {
    appState.currentViewId = "local-detail";
    appState.filters.local = region.code;
    ensureSelectionForViewData(getCurrentViewData(), true);
    render();
    return;
  }

  appState.selectedRegionKey = key;
  openEditor(appState.currentViewId, region.id);
  render();
}

function applyViewVisualStyle(svg, viewId) {
  const visual = VIEW_VISUALS[viewId] || VIEW_VISUALS.world;
  svg.style.setProperty("--region-outline-width", `${visual.outlineWidth}px`);
  svg.style.setProperty("--region-outline-active-width", `${visual.activeOutlineWidth}px`);
  svg.style.setProperty("--overlay-boundary-width", `${visual.overlayWidth}px`);
  svg.style.setProperty("--region-label-size", `${visual.labelSize}px`);
  svg.style.setProperty("--region-label-stroke-width", `${visual.labelStrokeWidth}px`);
  svg.style.setProperty("--region-label-weight", String(visual.labelWeight));
}

function getSummaryDescription(viewConfig, region, edit) {
  if (viewConfig.id === "metro-detail") {
    return `${region.name}을 열면 그 안의 동·읍·면 경계 지도로 내려갑니다.`;
  }

  if (edit?.src) {
    return "사진이 저장되어 있습니다. 다시 열어서 줌, 위치, 다른 사진으로 교체할 수 있습니다.";
  }

  return "아직 사진이 없습니다. 지역을 눌러 첫 여행 사진을 채워보세요.";
}

function getSummaryTag(viewConfig, edit) {
  if (viewConfig.id === "metro-detail") {
    return "구 단위 상세";
  }

  return edit?.src ? `저장됨 · 확대 ${Math.round(edit.zoom * 100)}%` : "비어 있음";
}

function isRegionEditable(viewConfig) {
  return viewConfig.id !== "metro-detail";
}

function bindGlobalEvents() {
  refs.closeModalBtn.addEventListener("click", closeEditor);
  refs.editorModal.addEventListener("click", (event) => {
    if (event.target instanceof HTMLElement && event.target.dataset.closeModal === "true") {
      closeEditor();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && appState.modal.open) {
      closeEditor();
    }
  });

  refs.photoInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const src = await readFileAsDataUrl(file);
    const dimensions = await getImageDimensions(src);
    appState.modal.draft = clampDraft({
      src,
      naturalWidth: dimensions.width,
      naturalHeight: dimensions.height,
      zoom: 1,
      panX: 0,
      panY: 0
    }, getModalRegion().bounds);

    refs.photoInput.value = "";
    renderEditor();
  });

  refs.clearPhotoBtn.addEventListener("click", () => {
    appState.modal.draft = null;
    renderEditor();
  });

  refs.zoomRange.addEventListener("input", (event) => {
    if (!appState.modal.draft) {
      return;
    }

    appState.modal.draft = clampDraft({
      ...appState.modal.draft,
      zoom: Number(event.target.value)
    }, getModalRegion().bounds);
    renderEditor();
  });

  refs.resetDraftBtn.addEventListener("click", () => {
    if (!appState.modal.draft) {
      return;
    }

    appState.modal.draft = clampDraft({
      ...appState.modal.draft,
      zoom: 1,
      panX: 0,
      panY: 0
    }, getModalRegion().bounds);
    renderEditor();
  });

  refs.saveDraftBtn.addEventListener("click", () => {
    void saveDraft();
  });
  refs.exportImageBtn.addEventListener("click", exportCurrentMapImage);
  refs.resetViewBtn.addEventListener("click", () => {
    void resetCurrentView();
  });
  refs.exportBtn.addEventListener("click", exportEdits);
  refs.importInput.addEventListener("change", (event) => {
    void importEdits(event);
  });

  window.addEventListener("focus", () => {
    void refreshEditsFromServer({ renderOnChange: true, skipWhileEditing: true });
  });

  refs.mapStage.addEventListener("click", (event) => {
    if (consumeMapClickSuppression()) {
      return;
    }
    if (event.target === refs.mapStage) {
      clearCurrentSelection();
    }
  });

  refs.editorPreview.addEventListener("pointerdown", startDrag);
  refs.editorPreview.addEventListener("pointermove", moveDrag);
  refs.editorPreview.addEventListener("pointerup", endDrag);
  refs.editorPreview.addEventListener("pointerleave", endDrag);
  refs.editorPreview.addEventListener("wheel", handleWheelZoom, { passive: false });

  window.addEventListener("resize", () => {
    if (appState.modal.open) {
      renderEditor();
    }
  });
}

function openEditor(viewId, regionId) {
  appState.modal.open = true;
  appState.modal.viewId = viewId;
  appState.modal.regionId = regionId;
  appState.modal.focusId = getFocusIdForView(viewId);
  appState.modal.drag = null;

  const saved = appState.edits[getRegionKey(viewId, regionId)];
  appState.modal.draft = saved ? { ...saved } : null;

  refs.editorModal.classList.add("open");
  refs.editorModal.setAttribute("aria-hidden", "false");
  renderEditor();
}

function closeEditor() {
  appState.modal.open = false;
  appState.modal.viewId = null;
  appState.modal.regionId = null;
  appState.modal.focusId = null;
  appState.modal.draft = null;
  appState.modal.drag = null;
  refs.editorModal.classList.remove("open");
  refs.editorModal.setAttribute("aria-hidden", "true");
  refs.editorPreview.innerHTML = "";
}

function renderEditor() {
  refs.editorPreview.innerHTML = "";

  if (!appState.modal.open || !appState.modal.viewId || !appState.modal.regionId) {
    refs.editorPlaceholder.style.display = "grid";
    return;
  }

  const region = getModalRegion();
  appState.modal.draft = appState.modal.draft ? clampDraft(appState.modal.draft, region.bounds) : null;

  refs.editorCanvas.style.setProperty("--preview-aspect", String(region.bounds.width / Math.max(region.bounds.height, 1)));
  refs.editorScope.textContent = `${getViewConfigById(appState.modal.viewId).badge} · ${getModalScopeLabel(region)}`;
  refs.editorTitle.textContent = region.name;
  refs.editorSubtitle.textContent = "원본 비율을 유지한 채 줌과 이동으로 구도를 맞춘 뒤 저장합니다.";
  refs.zoomRange.value = String(appState.modal.draft?.zoom || 1);
  refs.zoomValue.textContent = `${Math.round((appState.modal.draft?.zoom || 1) * 100)}%`;

  const previewSvg = refs.editorPreview;
  previewSvg.setAttribute("viewBox", `${region.bounds.x} ${region.bounds.y} ${region.bounds.width} ${region.bounds.height}`);

  const defs = createSvg("defs");
  const clipId = `editor-clip-${appState.modal.viewId}-${region.id}`;
  const clipPath = createSvg("clipPath", { id: clipId });
  clipPath.appendChild(createSvg("path", { d: region.path, "fill-rule": "evenodd" }));
  defs.appendChild(clipPath);
  previewSvg.appendChild(defs);

  if (appState.modal.draft?.src) {
    const layout = computeImageLayout(region.bounds, appState.modal.draft);
    previewSvg.appendChild(createSvg("image", {
      class: "preview-image",
      href: appState.modal.draft.src,
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
      "clip-path": `url(#${clipId})`
    }));
    refs.editorPlaceholder.style.display = "none";
  } else {
    refs.editorPlaceholder.style.display = "grid";
  }

  previewSvg.appendChild(createSvg("path", {
    class: "preview-shape",
    d: region.path,
    "fill-rule": "evenodd"
  }));

  previewSvg.appendChild(createSvg("rect", {
    class: `preview-hit${appState.modal.drag ? " dragging" : ""}`,
    x: region.bounds.x,
    y: region.bounds.y,
    width: region.bounds.width,
    height: region.bounds.height
  }));
}

function startDrag(event) {
  if (!appState.modal.draft?.src) {
    return;
  }

  refs.editorPreview.setPointerCapture(event.pointerId);
  appState.modal.drag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    panX: appState.modal.draft.panX,
    panY: appState.modal.draft.panY
  };
  renderEditor();
}

function moveDrag(event) {
  if (!appState.modal.drag || !appState.modal.draft?.src) {
    return;
  }

  const rect = refs.editorPreview.getBoundingClientRect();
  const deltaX = (event.clientX - appState.modal.drag.startX) / Math.max(rect.width, 1);
  const deltaY = (event.clientY - appState.modal.drag.startY) / Math.max(rect.height, 1);

  appState.modal.draft = clampDraft({
    ...appState.modal.draft,
    panX: appState.modal.drag.panX + deltaX,
    panY: appState.modal.drag.panY + deltaY
  }, getModalRegion().bounds);

  renderEditor();
}

function endDrag(event) {
  if (appState.modal.drag && event.pointerId === appState.modal.drag.pointerId) {
    appState.modal.drag = null;
    renderEditor();
  }
}

function handleWheelZoom(event) {
  if (!appState.modal.draft?.src) {
    return;
  }

  event.preventDefault();
  appState.modal.draft = clampDraft({
    ...appState.modal.draft,
    zoom: clampNumber(appState.modal.draft.zoom + (event.deltaY < 0 ? 0.08 : -0.08), 1, 4)
  }, getModalRegion().bounds);
  renderEditor();
}

async function saveDraft() {
  if (!appState.modal.viewId || !appState.modal.regionId) {
    return;
  }

  const key = getRegionKey(appState.modal.viewId, appState.modal.regionId);
  if (appState.modal.draft?.src) {
    appState.edits[key] = { ...appState.modal.draft };
  } else {
    delete appState.edits[key];
  }

  await persistEdits();
  appState.selectedRegionKey = key;
  closeEditor();
  render();
}

async function resetCurrentView() {
  const viewData = getCurrentViewData();
  const hasData = viewData.regions.some((region) => appState.edits[getRegionKey(appState.currentViewId, region.id)]);
  if (!hasData) {
    window.alert("현재 보기에는 저장된 사진이 없습니다.");
    return;
  }

  if (!window.confirm(`${getCurrentViewConfig().shortTitle}에 저장된 사진 구성을 모두 초기화할까요?`)) {
    return;
  }

  for (const region of viewData.regions) {
    delete appState.edits[getRegionKey(appState.currentViewId, region.id)];
  }
  await persistEdits();
  render();
}

function exportEdits() {
  const payload = {
    exportedAt: new Date().toISOString(),
    version: 2,
    edits: appState.edits
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "travel-map-photo-atlas.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

async function exportCurrentMapImage() {
  const svg = refs.mapStage.querySelector(".map-svg");
  if (!svg) {
    window.alert("저장할 지도가 아직 준비되지 않았습니다.");
    return;
  }

  try {
    const pngUrl = await renderSvgToPngUrl(svg);
    const anchor = document.createElement("a");
    anchor.href = pngUrl;
    anchor.download = `travel-map-${appState.currentViewId}-${new Date().toISOString().slice(0, 10)}.png`;
    anchor.click();
    URL.revokeObjectURL(pngUrl);
  } catch (error) {
    window.alert("지도를 이미지로 저장하지 못했습니다.");
  }
}

async function importEdits(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || typeof parsed.edits !== "object") {
      throw new Error("invalid format");
    }

    appState.edits = parsed.edits;
    await persistEdits();
    render();
  } catch (error) {
    window.alert("JSON 형식이 올바르지 않습니다.");
  } finally {
    refs.importInput.value = "";
  }
}

function getCurrentViewConfig() {
  return getViewConfigById(appState.currentViewId);
}

function getViewConfigById(viewId) {
  return VIEW_CONFIGS.find((view) => view.id === viewId) || VIEW_CONFIGS[0];
}

function getCurrentViewData() {
  return getViewData(appState.currentViewId, getFocusIdForView(appState.currentViewId));
}

function getViewStateKey(viewId, focusId = null) {
  return focusId ? `${viewId}:${focusId}` : viewId;
}

function getViewData(viewId, focusId = null) {
  const cacheKey = getViewStateKey(viewId, focusId);
  if (VIEW_CACHE.has(cacheKey)) {
    return VIEW_CACHE.get(cacheKey);
  }

  let viewData;

  if (viewId === "world") {
    viewData = buildProjectedView(DATA_INDEX.worldFeatures, {
      viewBoxWidth: 1400,
      viewBoxHeight: 780,
      padding: 18,
      labelThreshold: Number.POSITIVE_INFINITY,
      projectionMode: "raw",
      projectionOptions: {
        scaleX: 0.84,
        wrapLongitudeStart: -169
      },
      geometryFilter: VIEW_GEOMETRY_FILTERS.world,
      pathOptions: {
        splitThreshold: 220
      }
    });
  } else if (viewId === "japan-prefecture") {
    viewData = buildProjectedView(DATA_INDEX.japanPrefectures, {
      viewBoxWidth: 940,
      viewBoxHeight: 1580,
      padding: 30,
      labelThreshold: 34,
      projectionMode: "geo",
      geometryFilter: VIEW_GEOMETRY_FILTERS["japan-prefecture"]
    });
  } else if (viewId === "korea-city") {
    const projection = createProjection(DATA_INDEX.municipalities, 880, 1500, 30, { mode: "geo" });
    const projectedMunicipalities = projectFeatures(
      DATA_INDEX.municipalities,
      projection,
      0,
      null,
      VIEW_GEOMETRY_FILTERS["korea-city"]
    );
    const projectedProvinces = projectFeatures(
      DATA_INDEX.provinces,
      projection,
      Number.POSITIVE_INFINITY,
      null,
      VIEW_GEOMETRY_FILTERS["korea-city"]
    );
    viewData = {
      viewBox: `0 0 ${projection.width} ${projection.height}`,
      regions: projectedMunicipalities,
      overlays: projectedProvinces.map((region) => ({
        id: region.id,
        path: region.path
      })),
      labels: buildKoreaCityLabels(projectedMunicipalities, projectedProvinces)
    };
  } else if (viewId === "metro-detail") {
    const groupId = focusId || DATA_INDEX.metroOptions[0].id;
    const features = DATA_INDEX.metroDistrictGroups.get(groupId) || [];
    const projection = createProjection(features, 930, 1180, 32, { mode: "geo" });
    viewData = {
      viewBox: `0 0 ${projection.width} ${projection.height}`,
      regions: projectFeatures(
        features,
        projection,
        0,
        null,
        VIEW_GEOMETRY_FILTERS["metro-detail"]
      ),
      overlays: [],
      focusName: DATA_INDEX.metroOptionMap.get(groupId)?.name || ""
    };
  } else {
    const groupId = focusId || DATA_INDEX.localOptions[0].id;
    const features = DATA_INDEX.localGroups.get(groupId) || [];
    const projection = createProjection(features, 980, 1180, 34, { mode: "geo" });
    viewData = {
      viewBox: `0 0 ${projection.width} ${projection.height}`,
      regions: projectFeatures(
        features,
        projection,
        Number.POSITIVE_INFINITY,
        null,
        VIEW_GEOMETRY_FILTERS["local-detail"]
      ),
      overlays: projectFeatures(
        [DATA_INDEX.localMunicipalityMap.get(groupId)],
        projection,
        Number.POSITIVE_INFINITY,
        null,
        VIEW_GEOMETRY_FILTERS["local-detail"]
      )
        .filter(Boolean)
        .map((region) => ({ id: region.id, path: region.path })),
      focusName: DATA_INDEX.localOptionMap.get(groupId)?.name || ""
    };
  }

  VIEW_CACHE.set(cacheKey, viewData);
  return viewData;
}

function parseViewBox(viewBox) {
  const [x, y, width, height] = String(viewBox)
    .trim()
    .split(/\s+/)
    .map((value) => Number(value));
  return {
    x,
    y,
    width,
    height
  };
}

function serializeViewBox(viewBox) {
  return `${round(viewBox.x)} ${round(viewBox.y)} ${round(viewBox.width)} ${round(viewBox.height)}`;
}

function isSameViewBox(left, right) {
  return Math.abs(left.x - right.x) < 0.001
    && Math.abs(left.y - right.y) < 0.001
    && Math.abs(left.width - right.width) < 0.001
    && Math.abs(left.height - right.height) < 0.001;
}

function clampViewport(viewport, base) {
  const width = clampNumber(viewport.width, base.width / MAP_ZOOM_LIMITS.maxScale, base.width);
  const height = clampNumber(viewport.height, base.height / MAP_ZOOM_LIMITS.maxScale, base.height);
  const maxX = base.x + base.width - width;
  const maxY = base.y + base.height - height;
  return {
    x: clampNumber(viewport.x, base.x, Math.max(base.x, maxX)),
    y: clampNumber(viewport.y, base.y, Math.max(base.y, maxY)),
    width,
    height
  };
}

function applyViewportToSvg(svg, viewport) {
  svg.setAttribute("viewBox", serializeViewBox(viewport));
}

function buildProjectedView(features, options) {
  const projection = createProjection(features, options.viewBoxWidth, options.viewBoxHeight, options.padding, {
    mode: options.projectionMode || "raw",
    scaleX: options.projectionOptions?.scaleX || 1,
    scaleY: options.projectionOptions?.scaleY || 1
  });
  const pathOptions = options.pathOptions
    ? {
        ...options.pathOptions,
        wrapLeftX: projection.contentBounds.x,
        wrapRightX: projection.contentBounds.x + projection.contentBounds.width
      }
    : null;
  return {
    viewBox: `0 0 ${projection.width} ${projection.height}`,
    regions: projectFeatures(features, projection, options.labelThreshold, pathOptions, options.geometryFilter),
    overlays: []
  };
}

function createProjection(features, width, height, padding, options = {}) {
  const points = flattenFeaturePoints(features);
  const sourceProjector = createSourceProjector(points, options.mode || "raw", options);
  const sourcePoints = points.map((point) => sourceProjector(point));
  const rawBounds = getPointBounds(sourcePoints);
  const scale = Math.min(
    (width - padding * 2) / Math.max(rawBounds.width, 1),
    (height - padding * 2) / Math.max(rawBounds.height, 1)
  );

  const scaledWidth = rawBounds.width * scale;
  const scaledHeight = rawBounds.height * scale;
  const offsetX = (width - scaledWidth) / 2 - rawBounds.x * scale;
  const offsetY = (height - scaledHeight) / 2 + (rawBounds.y + rawBounds.height) * scale;

  return {
    width,
    height,
    contentBounds: {
      x: round(rawBounds.x * scale + offsetX),
      y: round(offsetY - (rawBounds.y + rawBounds.height) * scale),
      width: round(rawBounds.width * scale),
      height: round(rawBounds.height * scale)
    },
    project(point) {
      const [sourceX, sourceY] = sourceProjector(point);
      return [
        round(sourceX * scale + offsetX),
        round(offsetY - sourceY * scale)
      ];
    }
  };
}

function createSourceProjector(points, mode, options = {}) {
  const scaleX = options.scaleX || 1;
  const scaleY = options.scaleY || 1;
  const wrapLongitudeStart = Number.isFinite(options.wrapLongitudeStart)
    ? options.wrapLongitudeStart
    : null;
  const projectLongitude = wrapLongitudeStart === null
    ? (longitude) => longitude
    : (longitude) => wrapLongitude(longitude, wrapLongitudeStart);

  if (mode !== "geo") {
    return (point) => [projectLongitude(point[0]) * scaleX, point[1] * scaleY];
  }

  const bounds = getPointBounds(points);
  const latitude = bounds.y + bounds.height / 2;
  const longitudeScale = Math.max(0.35, Math.cos(latitude * Math.PI / 180));

  return (point) => [projectLongitude(point[0]) * longitudeScale * scaleX, point[1] * scaleY];
}

function wrapLongitude(longitude, start) {
  let wrapped = longitude;
  const end = start + 360;

  while (wrapped < start) {
    wrapped += 360;
  }
  while (wrapped >= end) {
    wrapped -= 360;
  }

  return wrapped;
}

function projectFeatures(features, projection, labelThreshold, pathOptions = null, geometryFilter = null) {
  return features
    .filter(Boolean)
    .map((feature) => {
      const projectedPolygons = feature.geometry.polygons.map((polygon) =>
        polygon.map((ring) => ring.map((point) => projection.project(point)))
      );
      const visiblePolygons = filterProjectedPolygons(projectedPolygons, geometryFilter);
      const points = flattenProjectedPolygons(visiblePolygons);
      const bounds = getPointBounds(points);
      const area = bounds.width * bounds.height;

      return {
        id: String(feature.id),
        code: feature.properties.code || String(feature.id),
        name: feature.properties.name,
        provinceCode: feature.meta.provinceCode || null,
        provinceName: feature.meta.provinceName || null,
        municipalityCode: feature.meta.municipalityCode || feature.properties.code || null,
        municipalityName: feature.meta.municipalityName || null,
        kind: feature.meta.kind || null,
        path: polygonsToPath(visiblePolygons, pathOptions),
        bounds,
        label: {
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2
        },
        labelPreferred: Math.min(bounds.width, bounds.height) >= labelThreshold,
        area
      };
    })
    .sort((left, right) => right.area - left.area);
}

function ensureSelectionForViewData(viewData, forceFirst = false) {
  if (!viewData.regions.length) {
    appState.selectedRegionKey = null;
    return;
  }

  const validKeys = new Set(viewData.regions.map((region) => getRegionKey(appState.currentViewId, region.id)));
  if (appState.selectedRegionKey === null && !forceFirst) {
    return;
  }

  if (forceFirst || !validKeys.has(appState.selectedRegionKey)) {
    appState.selectedRegionKey = getRegionKey(appState.currentViewId, getDefaultRegionId(viewData));
  }
}

function getSelectedRegion(viewData = getCurrentViewData(), allowEmpty = false) {
  const [, regionId] = String(appState.selectedRegionKey || "").split("::");
  const region = viewData.regions.find((item) => item.id === regionId) || null;
  if (region) {
    return region;
  }
  return allowEmpty ? null : viewData.regions[0];
}

function getModalRegion() {
  const viewData = getViewData(appState.modal.viewId, appState.modal.focusId);
  return viewData.regions.find((region) => region.id === appState.modal.regionId) || viewData.regions[0];
}

function getFocusIdForView(viewId) {
  if (viewId === "metro-detail") {
    return appState.filters.metro;
  }
  if (viewId === "local-detail") {
    return appState.filters.local;
  }
  return null;
}

function getRegionKey(viewId, regionId) {
  return `${viewId}::${regionId}`;
}

function getClipId(viewId, regionId) {
  return `clip-${viewId}-${regionId}`;
}

function clearCurrentSelection() {
  if (appState.modal.open) {
    return;
  }
  appState.selectedRegionKey = null;
  hideTooltip();
  render();
}

function getDefaultRegionId(viewData) {
  const preferredId = DEFAULT_REGION_IDS[appState.currentViewId];
  const preferredRegion = viewData.regions.find((region) => region.id === preferredId);
  if (preferredRegion) {
    return preferredRegion.id;
  }

  const sorted = [...viewData.regions].sort((left, right) => getRegionDisplayName(left).localeCompare(getRegionDisplayName(right), "ko"));
  return sorted[0].id;
}

function shouldShowLabel(viewConfig, region, key) {
  if (viewConfig.id === "korea-city" && (region.kind === "metro" || isKoreaCityDistrictRegion(region))) {
    return false;
  }
  if (appState.selectedRegionKey === key) {
    return true;
  }
  if (viewConfig.id === "korea-city" || viewConfig.id === "metro-detail" || viewConfig.id === "local-detail" || viewConfig.id === "japan-prefecture") {
    return true;
  }
  return false;
}

function getRegionLabelText(region, viewConfig) {
  if (viewConfig.id === "korea-city" || viewConfig.id === "metro-detail") {
    return simplifyKoreanAreaLabel(region.name);
  }
  return region.name;
}

function getRegionLabelMetrics(viewConfig, region, labelText) {
  const visual = VIEW_VISUALS[viewConfig.id] || VIEW_VISUALS.world;
  const text = String(labelText || "");
  const bounds = region?.bounds || null;

  if (viewConfig.id === "local-detail") {
    return {
      fontSize: visual.labelSize,
      strokeWidth: visual.labelStrokeWidth
    };
  }

  let fontSize = visual.labelSize;
  let strokeWidth = visual.labelStrokeWidth;

  if (bounds && text) {
    const availableWidth = Math.max(bounds.width * 0.84, 1);
    const widthEstimate = Math.max(text.length * 0.66, 1);
    const maxByWidth = availableWidth / widthEstimate;
    const heightRatio = viewConfig.id === "japan-prefecture"
        ? 0.32
        : 0.42;
    const maxByHeight = Math.max(bounds.height * heightRatio, 1);
    fontSize = Math.min(fontSize, maxByWidth, maxByHeight);
  }

  const minFontSize = viewConfig.id === "japan-prefecture"
      ? 3.1
      : 4.2;
  fontSize = clampNumber(fontSize, minFontSize, visual.labelSize);
  strokeWidth = clampNumber(Math.min(strokeWidth, fontSize * 0.28), 0.55, visual.labelStrokeWidth);

  return {
    fontSize: round(fontSize),
    strokeWidth: round(strokeWidth)
  };
}

function buildKoreaCityLabels(projectedMunicipalities, projectedProvinces) {
  const labels = projectedProvinces
    .filter((region) => METRO_CODES.has(region.code))
    .map((region) => ({
      id: region.id,
      text: simplifyKoreanAreaLabel(region.name),
      x: region.label.x,
      y: region.label.y,
      bounds: region.bounds
    }));

  const cityGroups = groupBy(
    projectedMunicipalities.filter((region) => isKoreaCityDistrictRegion(region)),
    (region) => getKoreaCityDistrictParentName(region.name)
  );

  for (const [cityName, regions] of cityGroups.entries()) {
    if (!cityName || regions.length < 2) {
      continue;
    }
    const bounds = getCombinedBounds(regions.map((region) => region.bounds));
    labels.push({
      id: `city-label-${cityName}`,
      text: simplifyKoreanAreaLabel(cityName),
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
      bounds
    });
  }

  return labels;
}

function isKoreaCityDistrictRegion(region) {
  if (region.kind !== "local") {
    return false;
  }
  return Boolean(getKoreaCityDistrictParentName(region.name));
}

function getKoreaCityDistrictParentName(name) {
  const match = String(name || "").match(/^(.+?시).+구$/);
  return match ? match[1] : null;
}

function getCombinedBounds(boundsList) {
  const validBounds = boundsList.filter(Boolean);
  if (!validBounds.length) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const bounds of validBounds) {
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }

  return {
    x: minX,
    y: minY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY)
  };
}

function getViewTitle(viewConfig) {
  if (viewConfig.id === "metro-detail") {
    return `${viewConfig.title} · ${DATA_INDEX.metroOptionMap.get(appState.filters.metro)?.name || ""}`;
  }
  if (viewConfig.id === "local-detail") {
    return `${viewConfig.title} · ${getLocalFocusDisplayName()}`;
  }
  return viewConfig.title;
}

function getViewDescription(viewConfig) {
  if (viewConfig.id === "metro-detail") {
    return `${DATA_INDEX.metroOptionMap.get(appState.filters.metro)?.name || ""}의 실제 구 경계만 먼저 보여줍니다. 원하는 구를 선택하면 동·읍·면 상세로 바로 내려갑니다.`;
  }
  if (viewConfig.id === "local-detail") {
    return `${getLocalFocusDisplayName()}의 실제 읍·면·동 경계를 바탕으로 세부 사진 보관이 가능합니다.`;
  }
  return viewConfig.description;
}

function getRegionDisplayName(region) {
  if (region.municipalityName && region.municipalityName !== region.name) {
    return `${region.municipalityName} · ${region.name}`;
  }
  return region.name;
}

function getLocalFocusDisplayName() {
  const feature = DATA_INDEX.localMunicipalityMap.get(appState.filters.local);
  return feature ? getMunicipalityOptionName(feature) : DATA_INDEX.localOptionMap.get(appState.filters.local)?.name || "";
}

function isMetroLocalFocus() {
  const feature = DATA_INDEX.localMunicipalityMap.get(appState.filters.local);
  return feature?.meta.kind === "metro";
}

function simplifyKoreanAreaLabel(name) {
  return String(name || "")
    .replace(/(?:특별자치시|특별자치도|특별시|광역시|자치시|시|군|구)$/, "");
}

function getRegionScope(region, viewConfig) {
  if (viewConfig.id === "world") {
    return "세계 지도";
  }
  if (viewConfig.id === "japan-prefecture") {
    return "일본 지도";
  }
  if (viewConfig.id === "korea-city") {
    return region.provinceName || "남한 지도";
  }
  if (viewConfig.id === "metro-detail") {
    return region.provinceName || "특별·광역시 상세";
  }
  if (region.provinceName && region.municipalityName) {
    return `${region.provinceName} · ${region.municipalityName}`;
  }
  return viewConfig.shortTitle;
}

function getModalScopeLabel(region) {
  if (region.kind === "japan-prefecture") {
    return "일본 지도";
  }
  if (region.provinceName && region.municipalityName) {
    return `${region.provinceName} · ${region.municipalityName}`;
  }
  if (region.provinceName) {
    return region.provinceName;
  }
  return getViewConfigById(appState.modal.viewId).shortTitle;
}

function createDetailAction(region, viewConfig) {
  if (viewConfig.id === "korea-city") {
    if (region.kind === "metro") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ghost-button";
      button.textContent = `${region.provinceName} 구 보기`;
      button.addEventListener("click", () => {
        appState.currentViewId = "metro-detail";
        appState.filters.metro = region.provinceCode;
        appState.selectedRegionKey = getRegionKey("metro-detail", region.id);
        ensureSelectionForViewData(getCurrentViewData(), true);
        render();
      });
      return button;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost-button";
    button.textContent = `${region.name} 읍·면·동 보기`;
    button.addEventListener("click", () => {
      appState.currentViewId = "local-detail";
      appState.filters.local = region.code;
      ensureSelectionForViewData(getCurrentViewData(), true);
      render();
    });
    return button;
  }

  if (viewConfig.id === "metro-detail") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost-button";
    button.textContent = `${region.name} 동·읍·면 보기`;
    button.addEventListener("click", () => {
      appState.currentViewId = "local-detail";
      appState.filters.local = region.code;
      ensureSelectionForViewData(getCurrentViewData(), true);
      render();
    });
    return button;
  }

  if (viewConfig.id === "local-detail") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost-button";
    button.textContent = isMetroLocalFocus() ? "상위 구 보기" : "상위 시·군 보기";
    button.addEventListener("click", () => {
      if (isMetroLocalFocus()) {
        const municipality = DATA_INDEX.localMunicipalityMap.get(region.municipalityCode);
        appState.currentViewId = "metro-detail";
        appState.filters.metro = municipality?.meta.provinceCode || appState.filters.metro;
        appState.selectedRegionKey = getRegionKey("metro-detail", region.municipalityCode);
      } else {
        appState.currentViewId = "korea-city";
        appState.selectedRegionKey = getRegionKey("korea-city", region.municipalityCode);
      }
      render();
    });
    return button;
  }

  return null;
}

function createSelectControl(labelText, options, selectedValue, onChange, emptyLabel = null) {
  const wrapper = document.createElement("label");
  wrapper.className = "select-wrap";

  const label = document.createElement("span");
  label.textContent = labelText;

  const select = document.createElement("select");
  if (emptyLabel !== null) {
    const emptyOption = document.createElement("option");
    emptyOption.value = "";
    emptyOption.textContent = emptyLabel;
    emptyOption.selected = selectedValue === "";
    select.appendChild(emptyOption);
  }

  for (const option of options) {
    const optionElement = document.createElement("option");
    optionElement.value = option.id;
    optionElement.textContent = option.name;
    optionElement.selected = option.id === selectedValue;
    select.appendChild(optionElement);
  }

  select.addEventListener("change", (event) => {
    onChange(event.target.value);
  });

  wrapper.append(label, select);
  return wrapper;
}

function showTooltip(text, clientX, clientY) {
  const stageRect = refs.mapStage.getBoundingClientRect();
  refs.mapTooltip.textContent = text;
  refs.mapTooltip.hidden = false;
  refs.mapTooltip.style.left = `${clientX - stageRect.left + 16}px`;
  refs.mapTooltip.style.top = `${clientY - stageRect.top + 16}px`;
}

function hideTooltip() {
  refs.mapTooltip.hidden = true;
}

async function renderSvgToPngUrl(svg) {
  const viewBox = svg.viewBox.baseVal;
  const currentViewBox = {
    x: viewBox?.x || 0,
    y: viewBox?.y || 0,
    width: Math.max(1, viewBox?.width || svg.getBoundingClientRect().width || 1),
    height: Math.max(1, viewBox?.height || svg.getBoundingClientRect().height || 1)
  };
  const exportBounds = getMapExportBounds(svg, currentViewBox);
  const width = Math.max(1, Math.round(exportBounds.width));
  const height = Math.max(1, Math.round(exportBounds.height));
  const scale = clampNumber(8000 / Math.max(width, height), 3, 8);
  const exportSvg = svg.cloneNode(true);
  const namespace = "http://www.w3.org/2000/svg";
  const style = document.createElementNS(namespace, "style");
  exportSvg.querySelectorAll(".region-label").forEach((label) => label.remove());
  style.textContent = [
    ".map-svg{--region-outline-width:3;--region-outline-active-width:4;--overlay-boundary-width:8;--region-label-size:20px;--region-label-stroke-width:8;--region-label-weight:700;}",
    ".region-outline{fill:rgba(255,255,255,.72);stroke:rgba(64,51,31,.52);stroke-width:var(--region-outline-width,3);stroke-linejoin:round;vector-effect:non-scaling-stroke;}",
    ".region-group.active .region-outline{fill:rgba(197,233,229,.86);stroke:rgba(15,104,95,.92);stroke-width:var(--region-outline-active-width,4);}",
    ".region-label{font-size:var(--region-label-size,20px);font-weight:var(--region-label-weight,700);font-family:Bahnschrift,'Segoe UI Variable','Malgun Gothic',sans-serif;fill:rgba(42,34,22,.9);text-anchor:middle;dominant-baseline:middle;letter-spacing:-0.04em;paint-order:stroke;stroke:rgba(255,250,241,.92);stroke-width:var(--region-label-stroke-width,8);stroke-linejoin:round;}",
    ".overlay-boundary{fill:none;stroke:rgba(35,29,20,.82);stroke-width:var(--overlay-boundary-width,8);stroke-linejoin:round;opacity:.9;pointer-events:none;vector-effect:non-scaling-stroke;}"
  ].join("");

  const defs = exportSvg.querySelector("defs") || createSvg("defs");
  const linearGradient = createSvg("linearGradient", { id: "export-bg-linear", x1: "0%", y1: "0%", x2: "0%", y2: "100%" });
  linearGradient.appendChild(createSvg("stop", { offset: "0%", "stop-color": "rgb(235,243,245)", "stop-opacity": "0.96" }));
  linearGradient.appendChild(createSvg("stop", { offset: "100%", "stop-color": "rgb(245,238,225)", "stop-opacity": "0.96" }));
  const radialGradient = createSvg("radialGradient", { id: "export-bg-radial", cx: "50%", cy: "0%", r: "58%" });
  radialGradient.appendChild(createSvg("stop", { offset: "0%", "stop-color": "rgb(255,255,255)", "stop-opacity": "0.94" }));
  radialGradient.appendChild(createSvg("stop", { offset: "100%", "stop-color": "rgb(255,255,255)", "stop-opacity": "0" }));
  defs.append(linearGradient, radialGradient);
  if (!exportSvg.querySelector("defs")) {
    exportSvg.appendChild(defs);
  }

  const background = document.createElementNS(namespace, "rect");
  background.setAttribute("x", String(exportBounds.x));
  background.setAttribute("y", String(exportBounds.y));
  background.setAttribute("width", String(exportBounds.width));
  background.setAttribute("height", String(exportBounds.height));
  background.setAttribute("fill", "url(#export-bg-linear)");

  const highlight = document.createElementNS(namespace, "rect");
  highlight.setAttribute("x", String(exportBounds.x));
  highlight.setAttribute("y", String(exportBounds.y));
  highlight.setAttribute("width", String(exportBounds.width));
  highlight.setAttribute("height", String(exportBounds.height));
  highlight.setAttribute("fill", "url(#export-bg-radial)");

  exportSvg.setAttribute("xmlns", namespace);
  exportSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  exportSvg.setAttribute("viewBox", serializeViewBox(exportBounds));
  exportSvg.setAttribute("width", String(width));
  exportSvg.setAttribute("height", String(height));
  exportSvg.insertBefore(style, exportSvg.firstChild);
  exportSvg.insertBefore(background, defs);
  exportSvg.insertBefore(highlight, defs);

  const serialized = new XMLSerializer().serializeToString(exportSvg);
  const svgBlob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(svgUrl);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("canvas context unavailable");
    }
    drawExportBackground(context, canvas.width, canvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("png export failed"));
          return;
        }
        resolve(URL.createObjectURL(blob));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

function getMapExportBounds(svg, currentViewBox) {
  const contentBounds = [];
  const exportTargets = svg.querySelectorAll(".region-outline, .overlay-boundary");

  for (const element of exportTargets) {
    if (typeof element.getBBox !== "function") {
      continue;
    }
    try {
      const bbox = element.getBBox();
      const clipped = intersectBounds({
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      }, currentViewBox);
      if (clipped && clipped.width > 0 && clipped.height > 0) {
        contentBounds.push(clipped);
      }
    } catch (error) {
      continue;
    }
  }

  const union = contentBounds.length
    ? getCombinedBounds(contentBounds)
    : currentViewBox;
  const padding = Math.max(6, Math.min(union.width, union.height) * 0.015);

  return clampBoundsToViewport({
    x: union.x - padding,
    y: union.y - padding,
    width: union.width + padding * 2,
    height: union.height + padding * 2
  }, currentViewBox);
}

function intersectBounds(left, right) {
  const x1 = Math.max(left.x, right.x);
  const y1 = Math.max(left.y, right.y);
  const x2 = Math.min(left.x + left.width, right.x + right.width);
  const y2 = Math.min(left.y + left.height, right.y + right.height);

  if (x2 <= x1 || y2 <= y1) {
    return null;
  }

  return {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1
  };
}

function clampBoundsToViewport(bounds, viewport) {
  const x = clampNumber(bounds.x, viewport.x, viewport.x + viewport.width);
  const y = clampNumber(bounds.y, viewport.y, viewport.y + viewport.height);
  const maxWidth = viewport.x + viewport.width - x;
  const maxHeight = viewport.y + viewport.height - y;

  return {
    x,
    y,
    width: clampNumber(bounds.width, 1, Math.max(1, maxWidth)),
    height: clampNumber(bounds.height, 1, Math.max(1, maxHeight))
  };
}

function drawExportBackground(context, width, height) {
  const linear = context.createLinearGradient(0, 0, 0, height);
  linear.addColorStop(0, "rgba(235, 243, 245, 0.98)");
  linear.addColorStop(1, "rgba(245, 238, 225, 0.98)");
  context.fillStyle = linear;
  context.fillRect(0, 0, width, height);

  const radial = context.createRadialGradient(width * 0.5, 0, 0, width * 0.5, 0, Math.max(width, height) * 0.58);
  radial.addColorStop(0, "rgba(255, 255, 255, 0.92)");
  radial.addColorStop(1, "rgba(255, 255, 255, 0)");
  context.fillStyle = radial;
  context.fillRect(0, 0, width, height);
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image load failed"));
    image.src = source;
  });
}

async function hydrateEdits() {
  const cachedEdits = loadLocalEdits();
  appState.edits = cachedEdits;

  try {
    const sharedState = await fetchSharedState();
    const remoteEdits = normalizeEdits(sharedState.edits);
    const hasCachedEdits = Object.keys(cachedEdits).length > 0;
    const hasRemoteEdits = Object.keys(remoteEdits).length > 0;

    if (!hasRemoteEdits && hasCachedEdits) {
      appState.edits = cachedEdits;
      await persistEdits();
      return;
    }

    appState.edits = remoteEdits;
    appState.sync.remoteAvailable = true;
    appState.sync.remoteUpdatedAt = sharedState.updatedAt;
    persistLocalEdits();
  } catch (error) {
    appState.edits = cachedEdits;
    appState.sync.remoteAvailable = false;
    appState.sync.remoteUpdatedAt = null;
    console.warn("Shared state unavailable. Falling back to browser storage.", error);
  }
}

async function refreshEditsFromServer(options = {}) {
  if (options.skipWhileEditing && appState.modal.open) {
    return false;
  }

  try {
    const sharedState = await fetchSharedState();
    const nextEdits = normalizeEdits(sharedState.edits);
    const changed = sharedState.updatedAt !== appState.sync.remoteUpdatedAt
      || JSON.stringify(nextEdits) !== JSON.stringify(appState.edits);

    appState.sync.remoteAvailable = true;
    appState.sync.remoteUpdatedAt = sharedState.updatedAt;

    if (!changed) {
      return false;
    }

    appState.edits = nextEdits;
    persistLocalEdits();
    if (options.renderOnChange) {
      render();
    }
    return true;
  } catch (error) {
    appState.sync.remoteAvailable = false;
    console.warn("Failed to refresh shared state.", error);
    return false;
  }
}

async function persistEdits() {
  persistLocalEdits();

  try {
    const sharedState = await fetch(SHARED_STATE_ENDPOINT, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ edits: normalizeEdits(appState.edits) })
    });

    if (!sharedState.ok) {
      throw new Error(`shared_state_put_${sharedState.status}`);
    }

    const payload = await sharedState.json();
    appState.sync.remoteAvailable = true;
    appState.sync.remoteUpdatedAt = typeof payload?.updatedAt === "string" ? payload.updatedAt : null;
    return true;
  } catch (error) {
    appState.sync.remoteAvailable = false;
    console.warn("Failed to sync shared state.", error);
    return false;
  }
}

function loadLocalEdits() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeEdits(JSON.parse(stored)) : {};
  } catch (error) {
    return {};
  }
}

function persistLocalEdits() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeEdits(appState.edits)));
  } catch (error) {
    console.warn("Browser cache save skipped.", error);
  }
}

async function fetchSharedState() {
  const response = await fetch(SHARED_STATE_ENDPOINT, {
    headers: {
      Accept: "application/json"
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`shared_state_get_${response.status}`);
  }

  const payload = await response.json();
  return {
    updatedAt: typeof payload?.updatedAt === "string" ? payload.updatedAt : null,
    edits: normalizeEdits(payload?.edits)
  };
}

function startSharedStatePolling() {
  if (appState.sync.pollHandle) {
    window.clearInterval(appState.sync.pollHandle);
  }

  appState.sync.pollHandle = window.setInterval(() => {
    if (document.hidden) {
      return;
    }
    void refreshEditsFromServer({ renderOnChange: true, skipWhileEditing: true });
  }, SHARED_STATE_POLL_MS);
}

function normalizeEdits(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(source).filter((entry) => {
      const value = entry[1];
      return value && typeof value === "object" && !Array.isArray(value);
    })
  );
}

function computeImageLayout(bounds, edit) {
  const width = Math.max(bounds.width, 1);
  const height = Math.max(bounds.height, 1);
  const naturalWidth = Math.max(edit.naturalWidth || 1, 1);
  const naturalHeight = Math.max(edit.naturalHeight || 1, 1);
  const baseScale = Math.max(width / naturalWidth, height / naturalHeight);
  const scaledWidth = naturalWidth * baseScale * edit.zoom;
  const scaledHeight = naturalHeight * baseScale * edit.zoom;
  const offsetX = width * (edit.panX || 0);
  const offsetY = height * (edit.panY || 0);

  return {
    width: scaledWidth,
    height: scaledHeight,
    x: bounds.x + width / 2 - scaledWidth / 2 + offsetX,
    y: bounds.y + height / 2 - scaledHeight / 2 + offsetY
  };
}

function clampDraft(draft, bounds) {
  if (!draft?.src) {
    return draft;
  }

  const naturalWidth = Math.max(draft.naturalWidth || 1, 1);
  const naturalHeight = Math.max(draft.naturalHeight || 1, 1);
  const zoom = clampNumber(draft.zoom || 1, 1, 4);
  const baseScale = Math.max(bounds.width / naturalWidth, bounds.height / naturalHeight);
  const displayWidth = naturalWidth * baseScale * zoom;
  const displayHeight = naturalHeight * baseScale * zoom;
  const maxPanX = Math.max(0, (displayWidth - bounds.width) / 2) / Math.max(bounds.width, 1);
  const maxPanY = Math.max(0, (displayHeight - bounds.height) / 2) / Math.max(bounds.height, 1);

  return {
    ...draft,
    zoom,
    panX: clampNumber(draft.panX || 0, -maxPanX, maxPanX),
    panY: clampNumber(draft.panY || 0, -maxPanY, maxPanY)
  };
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("파일을 읽을 수 없습니다."));
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("이미지를 불러올 수 없습니다."));
    image.src = src;
  });
}

function createSvg(tagName, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, String(value));
  }
  return element;
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function getMunicipalityOptionName(feature) {
  if (!feature) {
    return "";
  }

  if (feature.meta?.kind === "metro") {
    return `${feature.meta.provinceName} · ${feature.properties.name}`;
  }

  return feature.properties.name;
}

function buildDataIndex(topologies) {
  const provinceFeatures = topologyToFeatures(topologies.skoreaProvinces, OBJECT_KEYS.provinces);
  const provinceMap = new Map(provinceFeatures.map((feature) => [feature.properties.code, feature.properties.name]));
  const worldNameMap = buildWorldNameMap(topologies.isoCountries);

  const municipalityFeatures = topologyToFeatures(topologies.skoreaMunicipalities, OBJECT_KEYS.municipalities).map((feature) => {
    const provinceCode = feature.properties.code.slice(0, 2);
    return {
      ...feature,
      meta: {
        provinceCode,
        provinceName: provinceMap.get(provinceCode) || "",
        municipalityCode: feature.properties.code,
        municipalityName: feature.properties.name,
        kind: METRO_CODES.has(provinceCode) ? "metro" : "local"
      }
    };
  });

  const municipalityMap = new Map(municipalityFeatures.map((feature) => [feature.properties.code, feature]));
  const municipalityNameMap = new Map(municipalityFeatures.map((feature) => [feature.properties.code, feature.properties.name]));

  const submunicipalityFeatures = topologyToFeatures(topologies.skoreaSubmunicipalities, OBJECT_KEYS.submunicipalities).map((feature) => {
    const provinceCode = feature.properties.code.slice(0, 2);
    const municipalityCode = feature.properties.code.slice(0, 5);
    return {
      ...feature,
      meta: {
        provinceCode,
        provinceName: provinceMap.get(provinceCode) || "",
        municipalityCode,
        municipalityName: municipalityNameMap.get(municipalityCode) || "",
        kind: METRO_CODES.has(provinceCode) ? "metro" : "local"
      }
    };
  });

  const metroDistrictGroups = groupBy(municipalityFeatures.filter((feature) => feature.meta.kind === "metro"), (feature) => feature.meta.provinceCode);
  const localGroups = groupBy(submunicipalityFeatures, (feature) => feature.meta.municipalityCode);

  const metroOptions = provinceFeatures
    .filter((feature) => METRO_CODES.has(feature.properties.code) && metroDistrictGroups.has(feature.properties.code))
    .map((feature) => ({ id: feature.properties.code, name: feature.properties.name }));

  const localOptions = municipalityFeatures
    .filter((feature) => localGroups.has(feature.properties.code))
    .map((feature) => ({
      id: feature.properties.code,
      name: getMunicipalityOptionName(feature),
      shortName: feature.properties.name,
      kind: feature.meta.kind
    }))
    .sort((left, right) => left.name.localeCompare(right.name, "ko"));

  const worldFeatures = topologyToFeatures(topologies.world, OBJECT_KEYS.world)
    .filter((feature) => feature.properties.name !== "Antarctica")
    .map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        name: worldNameMap.get(String(feature.id).padStart(3, "0")) || WORLD_NAME_OVERRIDES[feature.id] || feature.properties.name
      },
      meta: {
        provinceCode: null,
        provinceName: null,
        municipalityCode: null,
        municipalityName: null,
        kind: "world",
        originalName: feature.properties.name
      }
    }));

  const japanPrefectures = geoJsonToFeatures(topologies.japanPrefectures).map((feature) => ({
    ...feature,
    id: feature.properties.P,
    properties: {
      ...feature.properties,
      name: JAPAN_PREFECTURE_KO[feature.properties.P] || feature.properties.P
    },
    meta: {
      provinceCode: null,
      provinceName: null,
      municipalityCode: null,
      municipalityName: null,
      kind: "japan-prefecture",
      originalName: feature.properties.P
    }
  }));

  return {
    provinces: provinceFeatures,
    municipalities: municipalityFeatures,
    worldFeatures,
    japanPrefectures,
    metroDistrictGroups,
    metroOptions,
    metroOptionMap: new Map(metroOptions.map((option) => [option.id, option])),
    localGroups,
    localOptions,
    localOptionMap: new Map(localOptions.map((option) => [option.id, option])),
    localMunicipalityMap: municipalityMap
  };
}

function buildWorldNameMap(isoCountries) {
  const displayNames = new Intl.DisplayNames(["ko"], { type: "region" });
  const map = new Map();

  for (const country of isoCountries) {
    const alpha2 = country["alpha-2"];
    const numeric = country["country-code"];
    const localized = displayNames.of(alpha2);
    if (alpha2 && numeric && localized && localized !== alpha2) {
      map.set(numeric, localized);
    }
  }

  return map;
}

function geoJsonToFeatures(collection) {
  return collection.features
    .map((feature, index) => {
      const geometry = decodeGeoJsonGeometry(feature.geometry);
      if (!geometry) {
        return null;
      }
      return {
        id: feature.id || feature.properties?.P || `geojson-${index}`,
        properties: feature.properties || {},
        geometry,
        meta: {}
      };
    })
    .filter(Boolean);
}

function decodeGeoJsonGeometry(geometry) {
  if (!geometry) {
    return null;
  }

  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      polygons: [geometry.coordinates]
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      polygons: geometry.coordinates
    };
  }

  return null;
}

function topologyToFeatures(topology, objectKey) {
  const object = topology.objects[objectKey];
  return object.geometries
    .map((geometry, index) => {
      const decoded = decodeGeometry(topology, geometry);
      if (!decoded) {
        return null;
      }
      return {
        id: geometry.id || geometry.properties?.code || `${objectKey}-${index}`,
        properties: geometry.properties || {},
        geometry: decoded,
        meta: {}
      };
    })
    .filter(Boolean);
}

function decodeGeometry(topology, geometry) {
  if (geometry.type === "Polygon") {
    return {
      type: "Polygon",
      polygons: [decodePolygon(topology, geometry.arcs)]
    };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      polygons: geometry.arcs.map((polygonArcs) => decodePolygon(topology, polygonArcs))
    };
  }

  return null;
}

function decodePolygon(topology, polygonArcs) {
  return polygonArcs.map((ringArcs) => stitchArcs(topology, ringArcs));
}

function stitchArcs(topology, arcIndexes) {
  const ring = [];
  arcIndexes.forEach((arcIndex, arcPosition) => {
    const points = decodeArc(topology, arcIndex);
    if (arcPosition > 0) {
      points.shift();
    }
    ring.push(...points);
  });
  return ring;
}

function decodeArc(topology, arcIndex) {
  const arc = topology.arcs[arcIndex >= 0 ? arcIndex : ~arcIndex];
  const points = [];
  let x = 0;
  let y = 0;

  for (const entry of arc) {
    x += entry[0];
    y += entry[1];
    points.push(applyTransform(topology.transform, x, y));
  }

  return arcIndex >= 0 ? points : points.reverse();
}

function applyTransform(transform, x, y) {
  if (!transform) {
    return [x, y];
  }
  return [
    x * transform.scale[0] + transform.translate[0],
    y * transform.scale[1] + transform.translate[1]
  ];
}

function polygonsToPath(polygons, options = null) {
  return polygons
    .map((polygon) =>
      polygon
        .map((ring) => ringToPath(ring, options))
        .join("")
    )
    .join("");
}

function ringToPath(ring, options = null) {
  if (!ring.length) {
    return "";
  }

  const segments = [];
  let currentSegment = [ring[0]];

  for (let index = 1; index < ring.length; index += 1) {
    const previous = ring[index - 1];
    const point = ring[index];
    if (shouldSplitRingSegment(previous, point, options)) {
      if (currentSegment.length) {
        segments.push(currentSegment);
      }
      currentSegment = [point];
      continue;
    }
    currentSegment.push(point);
  }

  if (currentSegment.length) {
    segments.push(currentSegment);
  }

  const splitSegmented = segments.length > 1;

  return segments
    .filter((segment) => segment.length >= 2)
    .map((segment) => {
      const commands = segment.map(([x, y]) => `${round(x)},${round(y)}`).join("L");
      const closure = splitSegmented ? getSplitSegmentClosure(segment, options) : "";
      return `M${commands}${closure}Z`;
    })
    .join("");
}

function getSplitSegmentClosure(segment, options) {
  const wrapLeftX = Number.isFinite(options?.wrapLeftX) ? options.wrapLeftX : null;
  const wrapRightX = Number.isFinite(options?.wrapRightX) ? options.wrapRightX : null;
  if (wrapLeftX === null || wrapRightX === null) {
    return "";
  }

  const first = segment[0];
  const last = segment[segment.length - 1];
  const leftDistance = Math.abs(first[0] - wrapLeftX) + Math.abs(last[0] - wrapLeftX);
  const rightDistance = Math.abs(first[0] - wrapRightX) + Math.abs(last[0] - wrapRightX);
  const boundaryX = leftDistance <= rightDistance ? wrapLeftX : wrapRightX;

  return `L${round(boundaryX)},${round(last[1])}L${round(boundaryX)},${round(first[1])}`;
}

function shouldSplitRingSegment(previous, next, options) {
  const splitThreshold = options?.splitThreshold || 0;
  if (!splitThreshold) {
    return false;
  }
  return Math.abs(next[0] - previous[0]) > splitThreshold;
}

function filterProjectedPolygons(polygons, geometryFilter) {
  if (!geometryFilter?.minPolygonArea) {
    return polygons;
  }

  const polygonAreas = polygons.map((polygon) => getPolygonArea(polygon));
  let largestIndex = 0;
  for (let index = 1; index < polygonAreas.length; index += 1) {
    if (polygonAreas[index] > polygonAreas[largestIndex]) {
      largestIndex = index;
    }
  }

  const filtered = polygons.filter((polygon, index) =>
    polygonAreas[index] >= geometryFilter.minPolygonArea
    || (geometryFilter.keepLargest !== false && index === largestIndex)
  );

  return filtered.length ? filtered : polygons.slice(0, 1);
}

function getPolygonArea(polygon) {
  if (!polygon.length) {
    return 0;
  }

  const outerArea = getRingArea(polygon[0]);
  const holeArea = polygon
    .slice(1)
    .reduce((sum, ring) => sum + getRingArea(ring), 0);

  return Math.max(0, outerArea - holeArea);
}

function getRingArea(ring) {
  if (ring.length < 3) {
    return 0;
  }

  let area = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[(index + 1) % ring.length];
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area) / 2;
}

function flattenFeaturePoints(features) {
  return features.flatMap((feature) => flattenProjectedPolygons(feature.geometry.polygons));
}

function flattenProjectedPolygons(polygons) {
  return polygons.flatMap((polygon) => polygon.flat());
}

function getPointBounds(points) {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const x = point[0];
    const y = point[1];
    if (x < minX) {
      minX = x;
    }
    if (x > maxX) {
      maxX = x;
    }
    if (y < minY) {
      minY = y;
    }
    if (y > maxY) {
      maxY = y;
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

function groupBy(items, keySelector) {
  const groups = new Map();
  for (const item of items) {
    const key = keySelector(item);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(item);
  }
  return groups;
}
