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

const HUD_RING_BASE_PATH = "../assets/images/pantheons/major_gods/hud/";
const HUD_RING_FALLBACK = `${HUD_RING_BASE_PATH}Hud_Ring_Gauge.png`;

const GOD_HUD_RING_FILES = {
  gaia: "Hud_Ring_Atl_Gaia.png",
  kronos: "Hud_Ring_Atl_Kronos.png",
  oranos: "Hud_Ring_Atl_Oranos.png",

  huitzilopochtli: "Hud_Ring_Azt_Huitzilopochtli.png",
  quetzalcoatl: "Hud_Ring_Azt_Quetzalcoatl.png",
  tezcatlipoca: "Hud_Ring_Azt_Tezcatlipoca.png",

  fuxi: "Hud_Ring_Chi_Fuxi.png",
  nuwa: "Hud_Ring_Chi_Nuwa.png",
  shennong: "Hud_Ring_Chi_Shennong.png",

  isis: "Hud_Ring_Egy_Isis.png",
  ra: "Hud_Ring_Egy_Ra.png",
  set: "Hud_Ring_Egy_Set.png",

  demeter: "Hud_Ring_Grk_Demeter.png",
  hades: "Hud_Ring_Grk_Hades.png",
  poseidon: "Hud_Ring_Grk_Poseidon.png",
  zeus: "Hud_Ring_Grk_Zeus.png",

  amaterasu: "Hud_Ring_Jpn_Amaterasu.png",
  susanoo: "Hud_Ring_Jpn_Susanoo.png",
  tsukuyomi: "Hud_Ring_Jpn_Tsukuyomi.png",

  freyr: "Hud_Ring_Nor_Freyr.png",
  loki: "Hud_Ring_Nor_Loki.png",
  odin: "Hud_Ring_Nor_Odin.png",
  thor: "Hud_Ring_Nor_Thor.png"
};

const DEFAULT_BUILD = {
  id: "amaterasu-opening",
  title: "Amaterasu Opening Build Order",
  subtitle: "Each row shows what changes at that moment, plus the villager distribution after the step.",
  goalLabel: "Goal",
  goalText: "Click Age Up",
  portrait: "../assets/images/gods/amaterasu_portrait.png",
  goalIcon: "images/score_age_2.png",
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
let activeBuild = null;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

function getGodContextForBuild(build) {
  if (build.sourceGodId) {
    return findGodById(build.sourceGodId);
  }

  return findStaticBuildById(build.id);
}

function getBuildGodId(build) {
  if (build.sourceGodId) {
    return build.sourceGodId;
  }

  const context = findStaticBuildById(build.id);
  return context?.god?.id || "";
}

function getCurrentGodId(selectedBuild) {
  const requestedGodId = getUrlParam("god");

  if (requestedGodId) {
    return requestedGodId;
  }

  return getBuildGodId(selectedBuild);
}

function godPortraitPath(godId) {
  return `../assets/images/gods/${godId}_portrait.png`;
}

function godHudRingPath(godId) {
  const filename = GOD_HUD_RING_FILES[godId];

  if (!filename) {
    return HUD_RING_FALLBACK;
  }

  return `${HUD_RING_BASE_PATH}${filename}`;
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
  const normalized = {
    id: build.id || createId(),
    title: build.title || DEFAULT_BUILD.title,
    subtitle: build.subtitle || build.detailSubtitle || build.summary || DEFAULT_BUILD.subtitle,
    goalLabel: build.goalLabel || DEFAULT_BUILD.goalLabel,
    goalText: build.goalText || build.meta || DEFAULT_BUILD.goalText,
    portrait: build.portrait || DEFAULT_BUILD.portrait,
    goalIcon: build.goalIcon || DEFAULT_BUILD.goalIcon,
    steps: Array.isArray(build.steps) ? build.steps : clone(DEFAULT_BUILD.steps),
    meta: build.meta || "",
    sourceGodId: build.sourceGodId || "",
    sourcePantheonId: build.sourcePantheonId || ""
  };

  normalized.portrait = repairPortraitPath(normalized.portrait, normalized);
  normalized.goalIcon = repairGoalIconPath(normalized.goalIcon);

  return normalized;
}

function staticBuildToDisplayBuild(build, god, pantheon) {
  return normalizeBuild({
    id: build.id,
    title: build.title,
    subtitle: build.detailSubtitle || build.summary || `${god.name} build order.`,
    goalLabel: build.goalLabel || "Goal",
    goalText: build.goalText || build.meta || "Build Order",
    portrait: build.portrait || godPortraitPath(god.id),
    goalIcon: build.goalIcon || "images/score_age_2.png",
    steps: Array.isArray(build.steps) ? build.steps : [],
    meta: build.meta || "",
    sourceGodId: god.id,
    sourcePantheonId: pantheon.id
  });
}

function loadStaticBuildCollection() {
  const { pantheons, buildOrders } = getStaticData();
  const staticBuilds = [];

  pantheons.forEach((pantheon) => {
    pantheon.gods.forEach((god) => {
      const godBuilds = buildOrders[god.id] || [];

      godBuilds.forEach((build) => {
        staticBuilds.push(staticBuildToDisplayBuild(build, god, pantheon));
      });
    });
  });

  return staticBuilds;
}

function loadSavedBuildCollection() {
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

  return [];
}

function loadBuildCollection() {
  const staticBuilds = loadStaticBuildCollection();
  const savedBuilds = loadSavedBuildCollection();
  const mergedBuilds = new Map();

  staticBuilds.forEach((build) => {
    mergedBuilds.set(build.id, build);
  });

  savedBuilds.forEach((build) => {
    mergedBuilds.set(build.id, build);
  });

  if (!mergedBuilds.has(DEFAULT_BUILD.id)) {
    mergedBuilds.set(DEFAULT_BUILD.id, normalizeBuild(DEFAULT_BUILD));
  }

  return Array.from(mergedBuilds.values());
}

function getActiveBuildId(builds) {
  const requestedBuildId = getUrlParam("build") || getUrlParam("id");

  if (requestedBuildId && builds.some((build) => build.id === requestedBuildId)) {
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, requestedBuildId);
    return requestedBuildId;
  }

  const requestedGodId = getUrlParam("god");

  if (requestedGodId) {
    const firstGodBuild = builds.find((build) => build.sourceGodId === requestedGodId);

    if (firstGodBuild) {
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, firstGodBuild.id);
      return firstGodBuild.id;
    }
  }

  const savedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);

  if (savedId && builds.some((build) => build.id === savedId)) {
    return savedId;
  }

  const fallbackId = builds[0]?.id || DEFAULT_BUILD.id;
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, fallbackId);

  return fallbackId;
}

function setActiveBuildId(buildId) {
  localStorage.setItem(STORAGE_ACTIVE_ID_KEY, buildId);
}

function getActiveBuild(builds) {
  const activeId = getActiveBuildId(builds);
  return builds.find((build) => build.id === activeId) || builds[0] || clone(DEFAULT_BUILD);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatArrowText(value) {
  return String(value ?? "")
    .replace(/\s+-\s+/g, " → ")
    .replace(/^\s*-\s*$/g, "→")
    .replace(/^\s*-\s+/g, "→ ")
    .replace(/\s+-\s*$/g, " →");
}

function makeIcon(name, className, altText) {
  return `<img class="${className}" src="${ICONS[name]}" alt="${escapeHtml(altText)}">`;
}

function makeHeader(label, iconName) {
  return `
    <span class="header-label">
      ${makeIcon(iconName, "icon", label)}
      <span>${escapeHtml(label)}</span>
    </span>
  `;
}

function makeResourceCell(value, resourceClass, iconName) {
  if (!value || String(value).trim() === "") {
    return "";
  }

  return `
    <span class="resource-pill ${resourceClass}">
      ${makeIcon(iconName, "mini-icon", resourceClass)}
      <span>${escapeHtml(formatArrowText(value))}</span>
    </span>
  `;
}

function makeActionCell(step) {
  const hasAction = step.action && String(step.action).trim() !== "";
  const hasNote = step.note && String(step.note).trim() !== "";

  if (!hasAction && !hasNote) {
    return "";
  }

  return `
    ${hasAction ? `
      <span class="action-box">
        ${makeIcon("villager", "mini-icon", "Action")}
        <span>${escapeHtml(step.action)}</span>
      </span>
    ` : ""}

    ${hasNote ? `<span class="note">${escapeHtml(step.note)}</span>` : ""}
  `;
}

function makeVillagerDistributionCell(split) {
  if (!split) {
    return "";
  }

  const food = Number.isFinite(Number(split.food)) ? Number(split.food) : 0;
  const wood = Number.isFinite(Number(split.wood)) ? Number(split.wood) : 0;
  const gold = Number.isFinite(Number(split.gold)) ? Number(split.gold) : 0;
  const favor = Number.isFinite(Number(split.favor)) ? Number(split.favor) : 0;

  return `
    <div class="villager-distribution">
      <span class="distribution-part">
        ${makeIcon("food", "mini-icon", "Food")}${food}
      </span>

      <span class="distribution-part">
        ${makeIcon("wood", "mini-icon", "Wood")}${wood}
      </span>

      <span class="distribution-part">
        ${makeIcon("gold", "mini-icon", "Gold")}${gold}
      </span>

      <span class="distribution-part">
        ${makeIcon("favor", "mini-icon", "Favor")}${favor}
      </span>
    </div>
  `;
}

function buildDetailUrl(buildId) {
  const context = getGodContextForBuild({ id: buildId }) || findStaticBuildById(buildId);
  const params = new URLSearchParams();

  params.set("build", buildId);

  if (context?.god?.id) {
    params.set("god", context.god.id);
  }

  return `index.html?${params.toString()}`;
}

function renderBuildPicker(builds, selectedBuild) {
  const picker = document.getElementById("buildPickerSelect");

  if (!picker) {
    return;
  }

  const currentGodId = getCurrentGodId(selectedBuild);

  let visibleBuilds = builds.filter((build) => {
    return getBuildGodId(build) === currentGodId;
  });

  if (visibleBuilds.length === 0) {
    visibleBuilds = [selectedBuild];
  }

  picker.innerHTML = visibleBuilds.map((build) => {
    const selected = build.id === selectedBuild.id ? "selected" : "";

    return `
      <option value="${escapeHtml(build.id)}" ${selected}>
        ${escapeHtml(build.title)}
      </option>
    `;
  }).join("");

  picker.addEventListener("change", () => {
    const selectedId = picker.value;
    const selected = buildCollection.find((build) => build.id === selectedId);

    if (!selected) {
      return;
    }

    setActiveBuildId(selected.id);
    window.location.href = buildDetailUrl(selected.id);
  });
}

function renderBuildInfo(build) {
  document.title = `${build.title} | AoM Build Orders`;

  const context = getGodContextForBuild(build);
  const godId = context?.god?.id || build.sourceGodId || getUrlParam("god") || "";

  document.getElementById("buildTitle").textContent = build.title;
  document.getElementById("buildSubtitle").textContent = build.subtitle;

  const portrait = document.getElementById("buildPortrait");

  if (portrait) {
    portrait.src = build.portrait;
    portrait.alt = `${build.title} portrait`;
  }

  const detailGodRing = document.getElementById("detailGodRing");

  if (detailGodRing) {
    detailGodRing.style.backgroundImage = `url("${godHudRingPath(godId)}")`;
  }

  const goalLabel = document.getElementById("goalLabel");

  if (goalLabel) {
    goalLabel.textContent = build.goalLabel;
  }

  const goalText = document.getElementById("goalText");

  if (goalText) {
    goalText.textContent = build.goalText;
  }

  const goalIcon = document.getElementById("goalIcon");

  if (goalIcon) {
    goalIcon.src = build.goalIcon;
    goalIcon.alt = build.goalText || "Goal icon";
  }

  const editBuildLink = document.getElementById("editBuildLink");

  if (editBuildLink) {
    const params = new URLSearchParams();

    params.set("id", build.id);

    if (godId) {
      params.set("god", godId);
    }

    editBuildLink.href = `editor.html?${params.toString()}`;
  }

  const backToBuildsLink = document.getElementById("backToBuildsLink");

  if (backToBuildsLink) {
    if (godId) {
      backToBuildsLink.href = `../builds.html?god=${encodeURIComponent(godId)}`;
    } else {
      backToBuildsLink.href = "../index.html";
    }
  }
}

function renderEmptyDetailTable(build) {
  document.getElementById("buildOrderTable").innerHTML = `
    <div class="empty-detail-state">
      <h2>${escapeHtml(build.title)}</h2>
      <p>
        This opening is connected to the new build library, but no detailed row-by-row steps
        have been added to this build entry yet.
      </p>
      <p>
        Use <strong>Edit Build</strong> to add the exact villager assignments, timing rows,
        notes, and villager distribution for this opening.
      </p>
    </div>
  `;
}

function renderBuildOrderTable(build) {
  if (!Array.isArray(build.steps) || build.steps.length === 0) {
    renderEmptyDetailTable(build);
    return;
  }

  const tableRows = build.steps.map((step) => {
    if (step.type === "phase") {
      return `
        <tr class="phase-row">
          <td colspan="8">
            <span class="phase-label">
              ${makeIcon("pop", "mini-icon", "Phase")}
              ${escapeHtml(step.label || "Phase")}
            </span>
          </td>
        </tr>
      `;
    }

    return `
      <tr>
        <td class="time-cell">${escapeHtml(step.time || "")}</td>
        <td>${makeResourceCell(step.food, "food", "food")}</td>
        <td>${makeResourceCell(step.wood, "wood", "wood")}</td>
        <td>${makeResourceCell(step.gold, "gold", "gold")}</td>
        <td>${makeResourceCell(step.favor, "favor", "favor")}</td>
        <td>${makeResourceCell(step.pop, "pop", "pop")}</td>
        <td class="action-cell">${makeActionCell(step)}</td>
        <td class="distribution-cell">${makeVillagerDistributionCell(step.split)}</td>
      </tr>
    `;
  }).join("");

  document.getElementById("buildOrderTable").innerHTML = `
    <div class="table-wrap">
      <table>
        <colgroup>
          <col class="time-col">
          <col class="resource-col">
          <col class="resource-col">
          <col class="resource-col">
          <col class="resource-col">
          <col class="pop-col">
          <col class="action-col">
          <col class="distribution-col">
        </colgroup>

        <thead>
          <tr>
            <th>Time</th>
            <th>${makeHeader("Food", "food")}</th>
            <th>${makeHeader("Wood", "wood")}</th>
            <th>${makeHeader("Gold", "gold")}</th>
            <th>${makeHeader("Favor", "favor")}</th>
            <th>${makeHeader("Pop", "pop")}</th>
            <th>${makeHeader("Action", "villager")}</th>
            <th>Distribution</th>
          </tr>
        </thead>

        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>
  `;
}

function initDisplayPage() {
  buildCollection = loadBuildCollection();
  activeBuild = getActiveBuild(buildCollection);

  renderBuildPicker(buildCollection, activeBuild);
  renderBuildInfo(activeBuild);
  renderBuildOrderTable(activeBuild);
}

initDisplayPage();