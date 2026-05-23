const STORAGE_BUILDS_KEY = "aomBuildOrder.builds";
const STORAGE_ACTIVE_ID_KEY = "aomBuildOrder.activeBuildId";
const LEGACY_STORAGE_KEY = "aomBuildOrder.active";

const ICONS = {
  food: "../assets/images/res_Food.png",
  wood: "../assets/images/res_Wood.png",
  gold: "../assets/images/gold.png",
  favor: "../assets/images/favor.png",
  pop: "../assets/images/res_pop.png",
  villager: "../assets/images/res_population.png"
};

const GOD_TO_PANTHEON = {
  zeus: "greek",
  hades: "greek",
  poseidon: "greek",
  demeter: "greek",

  odin: "norse",
  thor: "norse",
  loki: "norse",
  freyr: "norse",

  ra: "egyptian",
  isis: "egyptian",
  set: "egyptian",

  oranos: "atlantean",
  kronos: "atlantean",
  gaia: "atlantean",
  prometheus: "atlantean",

  fuxi: "chinese",
  nuwa: "chinese",
  shennong: "chinese",

  amaterasu: "japanese",
  tsukuyomi: "japanese",
  susanoo: "japanese",

  quetzalcoatl: "aztec",
  tezcatlipoca: "aztec",
  huitzilopochtli: "aztec"
};

const DEFAULT_BUILD = {
  id: "amaterasu-opening",
  title: "Amaterasu Opening Build Order",
  subtitle: "Each row shows what changes at that moment, plus the villager distribution after the step.",
  goalLabel: "Goal",
  goalText: "Click Age Up",
  portrait: "../assets/images/amaterasu_icon.png",
  goalIcon: "../assets/images/score_age_2.png",
  meta: "Land · Standard",
  summary: "A saved Amaterasu opening build order.",
  sourceGodId: "amaterasu",
  sourcePantheonId: "japanese",
  steps: [
    {
      type: "phase",
      label: "Opening"
    },
    {
      time: "0:00",
      food: "4 - Hunt",
      wood: "",
      gold: "",
      favor: "",
      pop: "",
      action: "Queue villagers",
      note: "Send the starting villagers to food immediately.",
      split: {
        food: 4,
        wood: 0,
        gold: 0,
        favor: 0,
        pop: "4/15"
      }
    },
    {
      time: "0:20",
      food: "",
      wood: "1 - Wood",
      gold: "",
      favor: "",
      pop: "",
      action: "Miko builds Shrine",
      note: "This starts favor generation while the economy continues.",
      split: {
        food: 4,
        wood: 1,
        gold: 0,
        favor: 1,
        pop: "5/15"
      }
    },
    {
      time: "1:10",
      food: "",
      wood: "",
      gold: "1 - Gold",
      favor: "",
      pop: "",
      action: "Miko builds Temple",
      note: "Move the next villager to gold so the age-up cost is ready.",
      split: {
        food: 4,
        wood: 1,
        gold: 1,
        favor: 1,
        pop: "6/15"
      }
    },
    {
      time: "1:35",
      food: "Next - Hunt",
      wood: "",
      gold: "",
      favor: "",
      pop: "",
      action: "Maintain villager production",
      note: "The Town Center should stay active the entire opening.",
      split: {
        food: 5,
        wood: 1,
        gold: 1,
        favor: 1,
        pop: "7/15"
      }
    },
    {
      time: "2:00",
      food: "",
      wood: "Next - Wood",
      gold: "",
      favor: "",
      pop: "House",
      action: "Avoid population block",
      note: "Use this row style whenever the population timing matters.",
      split: {
        food: 5,
        wood: 2,
        gold: 1,
        favor: 1,
        pop: "8/25"
      }
    },
    {
      type: "phase",
      label: "Age-Up Window"
    },
    {
      time: "2:30",
      food: "",
      wood: "",
      gold: "",
      favor: "",
      pop: "",
      action: "Click Age Up",
      note: "Exact timing depends on hunt quality, walking distance, and idle time.",
      split: {
        food: 5,
        wood: 2,
        gold: 1,
        favor: 1,
        pop: "8/25"
      }
    }
  ]
};

let buildCollection = [];
let editorBuild = null;
let activeComposerMode = "step";
let editingIndex = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getElement(id) {
  return document.getElementById(id);
}

function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `build-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function getEditorTargetId() {
  return getUrlParam("id") || getUrlParam("build");
}

function getRequestedGodId() {
  return getUrlParam("god") || "";
}

function isCreateNewMode() {
  return getUrlParam("new") === "true";
}

function getStaticData() {
  return window.AOM_DATA || { pantheons: [], buildOrders: {} };
}

function findGodById(godId) {
  const { pantheons } = getStaticData();

  for (const pantheon of pantheons) {
    const god = pantheon.gods.find((item) => item.id === godId);

    if (god) {
      return { god, pantheon };
    }
  }

  return null;
}

function findStaticBuildById(buildId) {
  const { pantheons, buildOrders } = getStaticData();

  for (const pantheon of pantheons) {
    for (const god of pantheon.gods) {
      const builds = buildOrders[god.id] || [];
      const build = builds.find((item) => item.id === buildId);

      if (build) {
        return { build, god, pantheon };
      }
    }
  }

  return null;
}

function pantheonIdForGod(godId) {
  const found = findGodById(godId);

  if (found?.pantheon?.id) {
    return found.pantheon.id;
  }

  return GOD_TO_PANTHEON[godId] || "";
}

function getBuildGodId(build) {
  if (build?.sourceGodId) {
    return build.sourceGodId;
  }

  const context = build?.id ? findStaticBuildById(build.id) : null;

  if (context?.god?.id) {
    return context.god.id;
  }

  return "";
}

function getCurrentGodId() {
  const requestedGodId = getRequestedGodId();

  if (requestedGodId) {
    return requestedGodId;
  }

  if (editorBuild?.sourceGodId) {
    return editorBuild.sourceGodId;
  }

  return DEFAULT_BUILD.sourceGodId;
}

function getCurrentPantheonId() {
  const godId = getCurrentGodId();

  if (editorBuild?.sourcePantheonId) {
    return editorBuild.sourcePantheonId;
  }

  return pantheonIdForGod(godId) || DEFAULT_BUILD.sourcePantheonId;
}

function godPortraitPath(godId) {
  return `../assets/images/gods/${godId}_portrait.png`;
}

function repairPortraitPath(portrait, build = {}) {
  if (!portrait) {
    if (build.sourceGodId) {
      return godPortraitPath(build.sourceGodId);
    }

    return DEFAULT_BUILD.portrait;
  }

  const normalizedPortrait = String(portrait).trim();

  if (normalizedPortrait.startsWith("../assets/")) {
    return normalizedPortrait;
  }

  if (normalizedPortrait.startsWith("assets/")) {
    return `../${normalizedPortrait}`;
  }

  if (normalizedPortrait.startsWith("/assets/")) {
    return `..${normalizedPortrait}`;
  }

  if (normalizedPortrait.startsWith("build_orders/images/")) {
    return normalizedPortrait.replace("build_orders/", "");
  }

  if (normalizedPortrait === "images/amaterasu_icon.png") {
    return godPortraitPath("amaterasu");
  }

  const oldGodIconMatch = normalizedPortrait.match(/^images\/(.+)_icon\.png$/);

  if (oldGodIconMatch) {
    return godPortraitPath(oldGodIconMatch[1]);
  }

  return normalizedPortrait;
}

function repairGoalIconPath(goalIcon) {
  if (!goalIcon) {
    return DEFAULT_BUILD.goalIcon;
  }

  const normalizedGoalIcon = String(goalIcon).trim();

  if (normalizedGoalIcon.startsWith("../assets/")) {
    return normalizedGoalIcon;
  }

  if (normalizedGoalIcon.startsWith("assets/")) {
    return `../${normalizedGoalIcon}`;
  }

  if (normalizedGoalIcon.startsWith("/images/")) {
    return normalizedGoalIcon.slice(1);
  }

  if (normalizedGoalIcon.startsWith("build_orders/images/")) {
    return normalizedGoalIcon.replace("build_orders/", "");
  }

  return normalizedGoalIcon;
}

function normalizeBuild(build) {
  const requestedGodId = getRequestedGodId();
  const sourceGodId =
    build.sourceGodId ||
    requestedGodId ||
    DEFAULT_BUILD.sourceGodId;

  const sourcePantheonId =
    build.sourcePantheonId ||
    pantheonIdForGod(sourceGodId) ||
    DEFAULT_BUILD.sourcePantheonId;

  const normalized = {
    id: build.id || createId(),
    title: build.title || DEFAULT_BUILD.title,
    subtitle: build.subtitle || build.detailSubtitle || build.summary || DEFAULT_BUILD.subtitle,
    goalLabel: build.goalLabel || DEFAULT_BUILD.goalLabel,
    goalText: build.goalText || build.meta || DEFAULT_BUILD.goalText,
    portrait: build.portrait || DEFAULT_BUILD.portrait,
    goalIcon: build.goalIcon || DEFAULT_BUILD.goalIcon,
    meta: build.meta || build.goalText || "",
    summary: build.summary || build.subtitle || "",
    sourceGodId,
    sourcePantheonId,
    steps: Array.isArray(build.steps) ? build.steps : clone(DEFAULT_BUILD.steps)
  };

  normalized.portrait = repairPortraitPath(normalized.portrait, normalized);
  normalized.goalIcon = repairGoalIconPath(normalized.goalIcon);

  return normalized;
}

function staticBuildToEditorBuild(staticBuild, god, pantheon) {
  return normalizeBuild({
    id: staticBuild.id,
    title: staticBuild.title,
    subtitle: staticBuild.detailSubtitle || staticBuild.summary || `${god.name} build order.`,
    goalLabel: staticBuild.goalLabel || "Goal",
    goalText: staticBuild.goalText || staticBuild.meta || "Build Order",
    portrait: staticBuild.portrait || godPortraitPath(god.id),
    goalIcon: staticBuild.goalIcon || "../assets/images/score_age_2.png",
    meta: staticBuild.meta || "",
    summary: staticBuild.summary || "",
    sourceGodId: god.id,
    sourcePantheonId: pantheon.id,
    steps: Array.isArray(staticBuild.steps) ? staticBuild.steps : []
  });
}

function loadBuildCollection() {
  const savedBuilds = localStorage.getItem(STORAGE_BUILDS_KEY);

  if (savedBuilds) {
    try {
      const parsed = JSON.parse(savedBuilds);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeBuild);
      }
    } catch (error) {
      console.error("Failed to parse saved build collection.", error);
    }
  }

  const legacyBuild = localStorage.getItem(LEGACY_STORAGE_KEY);

  if (legacyBuild) {
    try {
      const parsedLegacyBuild = normalizeBuild(JSON.parse(legacyBuild));
      parsedLegacyBuild.id = parsedLegacyBuild.id || createId();

      localStorage.setItem(STORAGE_BUILDS_KEY, JSON.stringify([parsedLegacyBuild], null, 2));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, parsedLegacyBuild.id);

      return [parsedLegacyBuild];
    } catch (error) {
      console.error("Failed to migrate legacy build.", error);
    }
  }

  const defaultBuild = normalizeBuild(clone(DEFAULT_BUILD));

  localStorage.setItem(STORAGE_BUILDS_KEY, JSON.stringify([defaultBuild], null, 2));
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, defaultBuild.id);

  return [defaultBuild];
}

function saveBuildCollection(builds) {
  localStorage.setItem(STORAGE_BUILDS_KEY, JSON.stringify(builds.map(normalizeBuild), null, 2));
}

function getActiveBuildId() {
  const savedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);

  if (savedId && buildCollection.some((build) => build.id === savedId)) {
    return savedId;
  }

  const fallbackId = buildCollection[0]?.id || DEFAULT_BUILD.id;
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, fallbackId);

  return fallbackId;
}

function setActiveBuildId(buildId) {
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, buildId);
}

function getBuildById(buildId) {
  return buildCollection.find((build) => build.id === buildId) || null;
}

function createNewBuild() {
  const godId = getCurrentGodId();
  const pantheonId = pantheonIdForGod(godId) || getCurrentPantheonId();

  return normalizeBuild({
    ...clone(DEFAULT_BUILD),
    id: createId(),
    title: "New Build Order",
    subtitle: "Describe the detailed build order here.",
    goalLabel: "Goal",
    goalText: "Build Order",
    meta: "Land · Standard",
    summary: "A saved build order created in the editor.",
    sourceGodId: godId,
    sourcePantheonId: pantheonId,
    portrait: godPortraitPath(godId),
    steps: []
  });
}

function duplicateCurrentBuild() {
  readBuildInfoFields();

  const duplicatedBuild = normalizeBuild({
    ...clone(editorBuild),
    id: createId(),
    title: `${editorBuild.title || "Build Order"} Copy`
  });

  buildCollection.push(duplicatedBuild);
  saveBuildCollection(buildCollection);

  editorBuild = normalizeBuild(duplicatedBuild);
  setActiveBuildId(editorBuild.id);
  updateEditorUrl(editorBuild.id, editorBuild.sourceGodId);

  setBuildInfoFields(editorBuild);
  clearComposer();
  renderRowsList();
  renderEditorBuildPicker();

  const button = getElement("duplicateBuildButton");
  const originalText = button.textContent;

  button.textContent = "Duplicated";

  setTimeout(() => {
    button.textContent = originalText;
  }, 900);
}

function deleteCurrentBuild() {
  if (!editorBuild) {
    return;
  }

  const visibleBuilds = getVisibleEditorBuilds();
  const buildTitle = editorBuild.title || "this build";

  const confirmed = confirm(`Delete "${buildTitle}"? This cannot be undone.`);

  if (!confirmed) {
    return;
  }

  buildCollection = buildCollection.filter((build) => build.id !== editorBuild.id);

  let nextBuild =
    visibleBuilds.find((build) => build.id !== editorBuild.id) ||
    buildCollection.find((build) => build.sourceGodId === editorBuild.sourceGodId) ||
    buildCollection[0];

  if (!nextBuild) {
    nextBuild = createNewBuild();
    buildCollection.push(nextBuild);
  }

  saveBuildCollection(buildCollection);

  editorBuild = normalizeBuild(nextBuild);
  setActiveBuildId(editorBuild.id);
  updateEditorUrl(editorBuild.id, editorBuild.sourceGodId);

  setBuildInfoFields(editorBuild);
  clearComposer();
  renderRowsList();
  renderEditorBuildPicker();
}

function loadInitialEditorBuild() {
  buildCollection = loadBuildCollection();

  if (isCreateNewMode()) {
    const newBuild = createNewBuild();

    buildCollection.push(newBuild);
    saveBuildCollection(buildCollection);
    setActiveBuildId(newBuild.id);
    updateEditorUrl(newBuild.id, newBuild.sourceGodId);

    return normalizeBuild(newBuild);
  }

  const requestedId = getEditorTargetId();

  if (requestedId) {
    const requestedBuild = getBuildById(requestedId);

    if (requestedBuild) {
      setActiveBuildId(requestedBuild.id);
      return normalizeBuild(requestedBuild);
    }

    const staticContext = findStaticBuildById(requestedId);

    if (staticContext) {
      const clonedStaticBuild = staticBuildToEditorBuild(
        staticContext.build,
        staticContext.god,
        staticContext.pantheon
      );

      const existingIndex = buildCollection.findIndex((build) => build.id === clonedStaticBuild.id);

      if (existingIndex >= 0) {
        buildCollection[existingIndex] = clonedStaticBuild;
      } else {
        buildCollection.push(clonedStaticBuild);
      }

      saveBuildCollection(buildCollection);
      setActiveBuildId(clonedStaticBuild.id);
      updateEditorUrl(clonedStaticBuild.id, clonedStaticBuild.sourceGodId);

      return normalizeBuild(clonedStaticBuild);
    }
  }

  const activeId = getActiveBuildId();
  const activeBuild = getBuildById(activeId);

  if (activeBuild) {
    updateEditorUrl(activeBuild.id, activeBuild.sourceGodId || getRequestedGodId());
    return normalizeBuild(activeBuild);
  }

  return normalizeBuild(buildCollection[0] || clone(DEFAULT_BUILD));
}

function updateEditorUrl(buildId, godId = "") {
  const params = new URLSearchParams();

  params.set("id", buildId);

  const finalGodId =
    godId ||
    getRequestedGodId() ||
    editorBuild?.sourceGodId ||
    "";

  if (finalGodId) {
    params.set("god", finalGodId);
  }

  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

function getVisibleEditorBuilds() {
  const currentGodId = getCurrentGodId();

  if (!currentGodId) {
    return buildCollection;
  }

  const filtered = buildCollection.filter((build) => {
    return build.sourceGodId === currentGodId;
  });

  if (editorBuild && !filtered.some((build) => build.id === editorBuild.id)) {
    filtered.unshift(editorBuild);
  }

  return filtered.length > 0 ? filtered : buildCollection;
}

function renderEditorBuildPicker() {
  const picker = getElement("editorBuildPickerSelect");
  const visibleBuilds = getVisibleEditorBuilds();

  picker.innerHTML = visibleBuilds.map((build) => {
    const selected = editorBuild && build.id === editorBuild.id ? "selected" : "";

    return `
      <option value="${escapeHtml(build.id)}" ${selected}>
        ${escapeHtml(build.title)}
      </option>
    `;
  }).join("");
}

function updateNavigationLinks() {
  const godId = getCurrentGodId();

  const backToGodBuildsLink = getElement("backToGodBuildsLink");
  const backToDisplayLink = getElement("backToDisplayLink");

  if (backToGodBuildsLink) {
    if (godId) {
      backToGodBuildsLink.href = `../builds.html?god=${encodeURIComponent(godId)}`;
    } else {
      backToGodBuildsLink.href = "../index.html";
    }
  }

  if (backToDisplayLink && editorBuild?.id) {
    const params = new URLSearchParams();

    params.set("build", editorBuild.id);

    if (godId) {
      params.set("god", godId);
    }

    backToDisplayLink.href = `index.html?${params.toString()}`;
  }
}

function handleEditorBuildPickerChange() {
  readBuildInfoFields();

  const selectedId = getElement("editorBuildPickerSelect").value;
  const selectedBuild = getBuildById(selectedId);

  if (!selectedBuild) {
    return;
  }

  const savedVersion = getBuildById(editorBuild.id);
  const hasUnsavedChanges =
    JSON.stringify(normalizeBuild(editorBuild)) !==
    JSON.stringify(normalizeBuild(savedVersion || {}));

  if (hasUnsavedChanges) {
    const shouldSwitch = confirm("Switch builds without saving your current changes?");

    if (!shouldSwitch) {
      renderEditorBuildPicker();
      return;
    }
  }

  editorBuild = normalizeBuild(selectedBuild);
  setActiveBuildId(editorBuild.id);
  updateEditorUrl(editorBuild.id, editorBuild.sourceGodId);

  setBuildInfoFields(editorBuild);
  clearComposer();
  renderRowsList();
  renderEditorBuildPicker();
  updateNavigationLinks();
}

function setBuildInfoFields(build) {
  getElement("titleInput").value = build.title;
  getElement("subtitleInput").value = build.subtitle;
  getElement("metaInput").value = build.meta || "";
  getElement("summaryInput").value = build.summary || "";
  getElement("goalLabelInput").value = build.goalLabel;
  getElement("goalTextInput").value = build.goalText;
  getElement("portraitInput").value = build.portrait;
  getElement("goalIconInput").value = build.goalIcon;
}

function readBuildInfoFields() {
  const sourceGodId = editorBuild.sourceGodId || getRequestedGodId() || DEFAULT_BUILD.sourceGodId;
  const sourcePantheonId =
    editorBuild.sourcePantheonId ||
    pantheonIdForGod(sourceGodId) ||
    DEFAULT_BUILD.sourcePantheonId;

  editorBuild.title = getElement("titleInput").value.trim() || "Untitled Build Order";
  editorBuild.subtitle = getElement("subtitleInput").value.trim();
  editorBuild.meta = getElement("metaInput").value.trim();
  editorBuild.summary = getElement("summaryInput").value.trim();
  editorBuild.goalLabel = getElement("goalLabelInput").value.trim() || "Goal";
  editorBuild.goalText = getElement("goalTextInput").value.trim() || "Click Age Up";
  editorBuild.portrait = getElement("portraitInput").value.trim() || godPortraitPath(sourceGodId);
  editorBuild.goalIcon = getElement("goalIconInput").value.trim() || "../assets/images/score_age_2.png";
  editorBuild.sourceGodId = sourceGodId;
  editorBuild.sourcePantheonId = sourcePantheonId;

  if (!editorBuild.meta) {
    editorBuild.meta = editorBuild.goalText || "";
  }

  if (!editorBuild.summary) {
    editorBuild.summary = editorBuild.subtitle || "A saved build order created in the editor.";
  }
}

function setComposerMode(mode) {
  activeComposerMode = mode;
  editingIndex = null;

  const isStep = mode === "step";

  getElement("stepModeButton").classList.toggle("active", isStep);
  getElement("milestoneModeButton").classList.toggle("active", !isStep);

  getElement("stepComposer").classList.toggle("hidden", !isStep);
  getElement("milestoneComposer").classList.toggle("hidden", isStep);

  getElement("addRowButton").textContent = isStep ? "Add Step Row" : "Add Milestone Row";

  renderRowsList();
}

function readStepComposer() {
  return {
    time: getElement("rowTimeInput").value.trim(),
    food: getElement("rowFoodInput").value.trim(),
    wood: getElement("rowWoodInput").value.trim(),
    gold: getElement("rowGoldInput").value.trim(),
    favor: getElement("rowFavorInput").value.trim(),
    pop: getElement("rowPopInput").value.trim(),
    action: getElement("rowActionInput").value.trim(),
    note: getElement("rowNoteInput").value.trim(),
    split: {
      food: toNonNegativeNumber(getElement("splitFoodInput").value),
      wood: toNonNegativeNumber(getElement("splitWoodInput").value),
      gold: toNonNegativeNumber(getElement("splitGoldInput").value),
      favor: toNonNegativeNumber(getElement("splitFavorInput").value),
      pop: getElement("splitPopInput").value.trim() || "0/0"
    }
  };
}

function readMilestoneComposer() {
  return {
    type: "phase",
    label: getElement("milestoneTextInput").value.trim() || "New Milestone"
  };
}

function fillStepComposer(step) {
  getElement("rowTimeInput").value = step.time || "";
  getElement("rowFoodInput").value = step.food || "";
  getElement("rowWoodInput").value = step.wood || "";
  getElement("rowGoldInput").value = step.gold || "";
  getElement("rowFavorInput").value = step.favor || "";
  getElement("rowPopInput").value = step.pop || "";
  getElement("rowActionInput").value = step.action || "";
  getElement("rowNoteInput").value = step.note || "";

  const split = step.split || {};

  getElement("splitFoodInput").value = split.food ?? 0;
  getElement("splitWoodInput").value = split.wood ?? 0;
  getElement("splitGoldInput").value = split.gold ?? 0;
  getElement("splitFavorInput").value = split.favor ?? 0;
  getElement("splitPopInput").value = split.pop || "0/0";
}

function fillMilestoneComposer(step) {
  getElement("milestoneTextInput").value = step.label || "";
}

function clearComposer() {
  editingIndex = null;

  getElement("rowTimeInput").value = "";
  getElement("rowFoodInput").value = "";
  getElement("rowWoodInput").value = "";
  getElement("rowGoldInput").value = "";
  getElement("rowFavorInput").value = "";
  getElement("rowPopInput").value = "";
  getElement("rowActionInput").value = "";
  getElement("rowNoteInput").value = "";

  getElement("splitFoodInput").value = 0;
  getElement("splitWoodInput").value = 0;
  getElement("splitGoldInput").value = 0;
  getElement("splitFavorInput").value = 0;
  getElement("splitPopInput").value = "0/0";

  getElement("milestoneTextInput").value = "";

  getElement("addRowButton").textContent =
    activeComposerMode === "step" ? "Add Step Row" : "Add Milestone Row";

  renderRowsList();
}

function addOrUpdateRow() {
  readBuildInfoFields();

  const newRow = activeComposerMode === "step"
    ? readStepComposer()
    : readMilestoneComposer();

  if (editingIndex !== null && editorBuild.steps[editingIndex]) {
    editorBuild.steps[editingIndex] = newRow;
  } else {
    editorBuild.steps.push(newRow);
  }

  clearComposer();
  renderRowsList();
}

function editRow(index) {
  const step = editorBuild.steps[index];

  if (!step) {
    return;
  }

  editingIndex = index;

  if (step.type === "phase") {
    activeComposerMode = "milestone";

    getElement("stepModeButton").classList.remove("active");
    getElement("milestoneModeButton").classList.add("active");
    getElement("stepComposer").classList.add("hidden");
    getElement("milestoneComposer").classList.remove("hidden");

    fillMilestoneComposer(step);
    getElement("addRowButton").textContent = "Update Milestone Row";
  } else {
    activeComposerMode = "step";

    getElement("stepModeButton").classList.add("active");
    getElement("milestoneModeButton").classList.remove("active");
    getElement("stepComposer").classList.remove("hidden");
    getElement("milestoneComposer").classList.add("hidden");

    fillStepComposer(step);
    getElement("addRowButton").textContent = "Update Step Row";
  }

  renderRowsList();

  document.querySelector(".composer-panel").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function duplicateRow(index) {
  const step = editorBuild.steps[index];

  if (!step) {
    return;
  }

  editorBuild.steps.splice(index + 1, 0, clone(step));
  renderRowsList();
}

function removeRow(index) {
  if (!editorBuild.steps[index]) {
    return;
  }

  editorBuild.steps.splice(index, 1);

  if (editingIndex === index) {
    clearComposer();
  } else if (editingIndex !== null && editingIndex > index) {
    editingIndex -= 1;
  }

  renderRowsList();
}

function moveRowUp(index) {
  if (index <= 0) {
    return;
  }

  const temp = editorBuild.steps[index - 1];
  editorBuild.steps[index - 1] = editorBuild.steps[index];
  editorBuild.steps[index] = temp;

  if (editingIndex === index) {
    editingIndex = index - 1;
  } else if (editingIndex === index - 1) {
    editingIndex = index;
  }

  renderRowsList();
}

function moveRowDown(index) {
  if (index >= editorBuild.steps.length - 1) {
    return;
  }

  const temp = editorBuild.steps[index + 1];
  editorBuild.steps[index + 1] = editorBuild.steps[index];
  editorBuild.steps[index] = temp;

  if (editingIndex === index) {
    editingIndex = index + 1;
  } else if (editingIndex === index + 1) {
    editingIndex = index;
  }

  renderRowsList();
}

function clearRows() {
  const confirmed = confirm("Clear all rows from the current build? This will not affect the saved display until you click Save Build.");

  if (!confirmed) {
    return;
  }

  editorBuild.steps = [];
  clearComposer();
  renderRowsList();
}

function formatArrowText(value) {
  return String(value ?? "")
    .replace(/\s+-\s+/g, " → ")
    .replace(/^\s*-\s*$/g, "→")
    .replace(/^\s*-\s+/g, "→ ")
    .replace(/\s+-\s*$/g, " →");
}

function renderRowsList() {
  const rowsList = getElement("rowsList");

  if (!editorBuild.steps.length) {
    rowsList.innerHTML = `
      <div class="empty-state">
        No rows yet. Use the composer above to add a build step or milestone line.
      </div>
    `;
    return;
  }

  rowsList.innerHTML = editorBuild.steps.map((step, index) => {
    if (step.type === "phase") {
      return renderMilestoneRow(step, index);
    }

    return renderStepRow(step, index);
  }).join("");

  bindRowButtons();
}

function renderMilestoneRow(step, index) {
  const editingClass = editingIndex === index ? "editing" : "";

  return `
    <article class="editor-row milestone-row">
      <div class="editor-row-number">${index + 1}</div>

      <div class="editor-row-content">
        <div class="milestone-label">
          <img src="${ICONS.pop}" alt="Milestone">
          ${escapeHtml(step.label || "Milestone")}
        </div>
      </div>

      <div class="row-actions">
        <button class="icon-button ${editingClass}" type="button" data-action="edit" data-index="${index}" title="Edit row">✎</button>
        <button class="icon-button" type="button" data-action="duplicate" data-index="${index}" title="Duplicate row">⧉</button>
        <button class="icon-button" type="button" data-action="up" data-index="${index}" title="Move up">↑</button>
        <button class="icon-button" type="button" data-action="down" data-index="${index}" title="Move down">↓</button>
        <button class="icon-button danger" type="button" data-action="delete" data-index="${index}" title="Delete row">×</button>
      </div>
    </article>
  `;
}

function renderStepRow(step, index) {
  const editingClass = editingIndex === index ? "editing" : "";
  const split = step.split || {
    food: 0,
    wood: 0,
    gold: 0,
    favor: 0,
    pop: "0/0"
  };

  return `
    <article class="editor-row">
      <div class="editor-row-number">${index + 1}</div>

      <div class="editor-row-content">
        <div class="editor-row-main">
          ${step.time ? `<span class="editor-time">${escapeHtml(step.time)}</span>` : ""}

          ${makeEditorPill(step.food, "food", "food")}
          ${makeEditorPill(step.wood, "wood", "wood")}
          ${makeEditorPill(step.gold, "gold", "gold")}
          ${makeEditorPill(step.favor, "favor", "favor")}
          ${makeEditorPill(step.pop, "pop", "pop")}

          ${step.action ? `
            <span class="editor-action">
              <img src="${ICONS.villager}" alt="Action">
              ${escapeHtml(step.action)}
            </span>
          ` : ""}
        </div>

        ${step.note ? `<span class="editor-note">${escapeHtml(step.note)}</span>` : ""}

        <div class="editor-split">
          <span><img src="${ICONS.food}" alt="Food">${escapeHtml(split.food ?? 0)}</span>
          <span><img src="${ICONS.wood}" alt="Wood">${escapeHtml(split.wood ?? 0)}</span>
          <span><img src="${ICONS.gold}" alt="Gold">${escapeHtml(split.gold ?? 0)}</span>
          <span><img src="${ICONS.favor}" alt="Favor">${escapeHtml(split.favor ?? 0)}</span>
        </div>
      </div>

      <div class="row-actions">
        <button class="icon-button ${editingClass}" type="button" data-action="edit" data-index="${index}" title="Edit row">✎</button>
        <button class="icon-button" type="button" data-action="duplicate" data-index="${index}" title="Duplicate row">⧉</button>
        <button class="icon-button" type="button" data-action="up" data-index="${index}" title="Move up">↑</button>
        <button class="icon-button" type="button" data-action="down" data-index="${index}" title="Move down">↓</button>
        <button class="icon-button danger" type="button" data-action="delete" data-index="${index}" title="Delete row">×</button>
      </div>
    </article>
  `;
}

function makeEditorPill(value, resourceClass, iconName) {
  if (!value || String(value).trim() === "") {
    return "";
  }

  return `
    <span class="editor-pill ${resourceClass}">
      <img src="${ICONS[iconName]}" alt="${resourceClass}">
      ${escapeHtml(formatArrowText(value))}
    </span>
  `;
}

function bindRowButtons() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;
      const index = Number(button.dataset.index);

      if (!Number.isInteger(index)) {
        return;
      }

      if (action === "edit") {
        editRow(index);
      }

      if (action === "duplicate") {
        duplicateRow(index);
      }

      if (action === "up") {
        moveRowUp(index);
      }

      if (action === "down") {
        moveRowDown(index);
      }

      if (action === "delete") {
        removeRow(index);
      }
    });
  });
}

function saveBuild() {
  readBuildInfoFields();

  if (!editorBuild.id) {
    editorBuild.id = createId();
  }

  const normalizedBuild = normalizeBuild(editorBuild);
  const existingIndex = buildCollection.findIndex((build) => build.id === normalizedBuild.id);

  if (existingIndex >= 0) {
    buildCollection[existingIndex] = normalizedBuild;
  } else {
    buildCollection.push(normalizedBuild);
  }

  editorBuild = normalizeBuild(normalizedBuild);

  saveBuildCollection(buildCollection);
  setActiveBuildId(editorBuild.id);
  updateEditorUrl(editorBuild.id, editorBuild.sourceGodId);
  renderEditorBuildPicker();
  updateNavigationLinks();

  const button = getElement("saveBuildButton");
  const originalText = button.textContent;

  button.textContent = "Saved";
  button.disabled = true;

  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 900);
}

function createAndSwitchToNewBuild() {
  readBuildInfoFields();

  const shouldCreate = confirm("Create a new build? Unsaved changes to the current build will be lost unless you save first.");

  if (!shouldCreate) {
    return;
  }

  const newBuild = createNewBuild();

  buildCollection.push(newBuild);
  saveBuildCollection(buildCollection);

  editorBuild = normalizeBuild(newBuild);
  setActiveBuildId(editorBuild.id);
  updateEditorUrl(editorBuild.id, editorBuild.sourceGodId);

  setBuildInfoFields(editorBuild);
  clearComposer();
  renderRowsList();
  renderEditorBuildPicker();
  updateNavigationLinks();
}

function exportJson() {
  readBuildInfoFields();
  getElement("jsonBox").value = JSON.stringify(normalizeBuild(editorBuild), null, 2);
}

function importJson() {
  const rawJson = getElement("jsonBox").value.trim();

  if (!rawJson) {
    alert("Paste build JSON into the box first.");
    return;
  }

  try {
    const importedBuild = normalizeBuild(JSON.parse(rawJson));

    if (!importedBuild.id) {
      importedBuild.id = createId();
    }

    editorBuild = importedBuild;

    const existingIndex = buildCollection.findIndex((build) => build.id === editorBuild.id);

    if (existingIndex >= 0) {
      buildCollection[existingIndex] = editorBuild;
    } else {
      buildCollection.push(editorBuild);
    }

    saveBuildCollection(buildCollection);
    setActiveBuildId(editorBuild.id);
    updateEditorUrl(editorBuild.id, editorBuild.sourceGodId);

    setBuildInfoFields(editorBuild);
    clearComposer();
    renderRowsList();
    renderEditorBuildPicker();
    updateNavigationLinks();

    alert("Build JSON imported.");
  } catch (error) {
    alert("Invalid JSON. Check the formatting and try again.");
    console.error(error);
  }
}

function resetBuild() {
  const confirmed = confirm("Reset this build to the default Amaterasu build? This will replace the currently selected build after you save.");

  if (!confirmed) {
    return;
  }

  const currentId = editorBuild.id;
  const sourceGodId = editorBuild.sourceGodId || getRequestedGodId() || DEFAULT_BUILD.sourceGodId;
  const sourcePantheonId = editorBuild.sourcePantheonId || pantheonIdForGod(sourceGodId) || DEFAULT_BUILD.sourcePantheonId;

  editorBuild = normalizeBuild({
    ...clone(DEFAULT_BUILD),
    id: currentId,
    sourceGodId,
    sourcePantheonId,
    portrait: godPortraitPath(sourceGodId)
  });

  setBuildInfoFields(editorBuild);
  clearComposer();
  renderRowsList();
  updateNavigationLinks();
}

function toNonNegativeNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return 0;
  }

  return number;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function bindPageEvents() {
  getElement("editorBuildPickerSelect").addEventListener("change", handleEditorBuildPickerChange);

  getElement("stepModeButton").addEventListener("click", () => setComposerMode("step"));
  getElement("milestoneModeButton").addEventListener("click", () => setComposerMode("milestone"));

  getElement("addRowButton").addEventListener("click", addOrUpdateRow);
  getElement("clearComposerButton").addEventListener("click", clearComposer);

  getElement("clearRowsButton").addEventListener("click", clearRows);

  getElement("newBuildButton").addEventListener("click", createAndSwitchToNewBuild);
  getElement("duplicateBuildButton").addEventListener("click", duplicateCurrentBuild);
  getElement("deleteBuildButton").addEventListener("click", deleteCurrentBuild);
  getElement("saveBuildButton").addEventListener("click", saveBuild);
  getElement("exportJsonButton").addEventListener("click", exportJson);
  getElement("importJsonButton").addEventListener("click", importJson);
  getElement("resetButton").addEventListener("click", resetBuild);
}

function initEditorPage() {
  editorBuild = loadInitialEditorBuild();

  setBuildInfoFields(editorBuild);
  renderEditorBuildPicker();
  setComposerMode("step");
  bindPageEvents();
  renderRowsList();
  updateNavigationLinks();
}

initEditorPage();