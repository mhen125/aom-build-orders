const { pantheons, buildOrders } = window.AOM_DATA;

const STORAGE_BUILDS_KEY = "aomBuildOrder.builds";

const buildPage = document.getElementById("buildPage");
const pantheonLabel = document.getElementById("pantheonLabel");
const godName = document.getElementById("godName");
const godSummary = document.getElementById("godSummary");
const godHeroArt = document.getElementById("godHeroArt");
const godDetailsPanel = document.getElementById("godDetailsPanel");
const buildGrid = document.getElementById("buildGrid");
const buildSectionHeading = document.getElementById("buildSectionHeading");

const GOD_DETAILS = {
  zeus: {
    focus: "Infantry and Heroes.",
    bonuses: [
      "Starts with 10 Favor.",
      "Gains Favor 20% faster.",
      "Myth units cost 1 less population.",
      "Infantry do +60% damage to buildings.",
      "Hoplites move 15% faster."
    ]
  },

  hades: {
    focus: "Ranged Soldiers and Buildings.",
    bonuses: []
  },

  poseidon: {
    focus: "Cavalry and Economy.",
    bonuses: []
  },

  demeter: {
    focus: "Expansion and Resource Gathering.",
    bonuses: []
  },

  ra: {
    focus: "Migdol Stronghold units and Empowerment.",
    bonuses: []
  },

  isis: {
    focus: "Technology.",
    bonuses: [
      "Town Centers and Citadel Centers support +5 population.",
      "Monuments shield against enemy God Powers.",
      "Empowered Monuments heal nearby units and generate Favor faster.",
      "Technologies cost -10%.",
      "Obelisks cost -5 Gold and are built faster."
    ]
  },

  set: {
    focus: "Barracks units.",
    bonuses: [
      "Pharaohs can summon Animals of Set.",
      "Priests can convert wild animals.",
      "Spearmen, Axemen, and Slingers move faster.",
      "Barracks, Siege Works, and Migdol Strongholds cost more Gold.",
      "Monuments reduce the cost of units near Barracks and Migdol Strongholds."
    ]
  },

  thor: {
    focus: "Dwarves and Armory.",
    bonuses: [
      "Starts with Dwarves instead of Gatherers.",
      "Dwarves cost less Gold and gather Food and Wood efficiently.",
      "Dwarven Armory can be built and upgraded in any age.",
      "Armory upgrades cost less.",
      "Receives a free Dwarf for each Dwarven Armory upgrade.",
      "Can research extra Dwarven Armory upgrades."
    ]
  },

  odin: {
    focus: "Great Hall units.",
    bonuses: []
  },

  loki: {
    focus: "Myth units.",
    bonuses: []
  },

  freyr: {
    focus: "Technology and Defense.",
    bonuses: [
      "Has a defensive God Power that grows stronger each age.",
      "Technologies cost less Food, Wood, and Gold, but take longer to research.",
      "Hill Forts and Hill Fort units deal more damage.",
      "Repairing buildings is free.",
      "Gatherers and Dwarves can repair."
    ]
  },

  oranos: {
    focus: "Vision and Mobility.",
    bonuses: [
      "Citizens can build a new Sky Passage each age.",
      "Units can teleport between Sky Passages.",
      "All units have increased Line of Sight.",
      "Oracles generate more Favor at full Line of Sight.",
      "Damaged enemy units remain visible for a short duration."
    ]
  },

  gaia: {
    focus: "Economy and Buildings.",
    bonuses: []
  },

  kronos: {
    focus: "Siege and Myth units.",
    bonuses: []
  },

  fuxi: {
    focus: "Human Soldiers and Heroes.",
    bonuses: [
      "God Blessing: Yin and Yang.",
      "On Favored Land, buildings research faster.",
      "On Favored Land, Military Camp and Machine Workshop additions cost less.",
      "Gains access to Nezha in the Classical Age."
    ]
  },

  nuwa: {
    focus: "Economy and Support.",
    bonuses: []
  },

  nüwa: {
    focus: "Economy and Support.",
    bonuses: []
  },

  shennong: {
    focus: "Economy and Farming.",
    bonuses: [
      "God Blessing: Gift of Beasts.",
      "On Favored Land, Myth units regenerate hit points.",
      "Farms are available in the Archaic Age.",
      "Farms build instantly on Favored Land.",
      "Farm upgrades are researched instantly for free in their respective ages."
    ]
  },

  amaterasu: {
    focus: "Economy and Samurai.",
    bonuses: [
      "Earns an increasing Gold trickle with each Bushido tier.",
      "Samurai and Onna-mushas earn 300% more XP outside of combat.",
      "Shrines increase the content of nearby resources, up to 140%.",
      "Samurai and Onna-mushas regenerate hit points, twice as fast in combat."
    ]
  },

  tsukuyomi: {
    focus: "Technology, Shinobi, and Cavalry.",
    bonuses: [
      "Increases Shinobi and Cavalry attack with each Bushido tier.",
      "Each technology researched grants Bushido XP.",
      "Advancing to the next Age is faster.",
      "A free Kitsune appears at the Temple each Age."
    ]
  },

  susanoo: {
    focus: "Military and Economy.",
    bonuses: []
  },

  huitzilopochtli: {
    focus: "Military and Economy.",
    bonuses: []
  },

  huitlipochtli: {
    focus: "Military and Economy.",
    bonuses: []
  },

  quetzalcoatl: {
    focus: "Military and Economy.",
    bonuses: []
  },

  tezcatlipoca: {
    focus: "Military and Economy.",
    bonuses: []
  }
};

function getGodIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("god");
}

function findGod(godId) {
  for (const pantheon of pantheons) {
    const god = pantheon.gods.find((item) => item.id === godId);

    if (god) {
      return {
        god,
        pantheon
      };
    }
  }

  return null;
}

function godHeroPortraitPath(godId) {
  return `assets/images/gods/${godId}_breakoutportrait.png`;
}

function pantheonReturnUrl(pantheonId) {
  if (!pantheonId) {
    return "index.html";
  }

  return `index.html?pantheon=${encodeURIComponent(pantheonId)}`;
}

function buildDetailUrl(buildId, godId) {
  const params = new URLSearchParams();

  params.set("build", buildId);

  if (godId) {
    params.set("god", godId);
  }

  return `build_orders/index.html?${params.toString()}`;
}

function readSavedBuilds() {
  try {
    const raw = localStorage.getItem(STORAGE_BUILDS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Could not read saved builds.", error);
    return [];
  }
}

function getStaticBuildsForGod(godId) {
  return buildOrders[godId] || [];
}

function getSavedBuildsForGod(godId) {
  return readSavedBuilds().filter((build) => {
    return build.sourceGodId === godId;
  });
}

function mergeBuilds(staticBuilds, savedBuilds) {
  const merged = new Map();

  staticBuilds.forEach((build) => {
    merged.set(build.id, {
      ...build,
      isSavedBuild: false
    });
  });

  savedBuilds.forEach((build) => {
    merged.set(build.id, {
      ...build,
      isSavedBuild: true
    });
  });

  return Array.from(merged.values());
}

function createFallbackBuild(god, pantheon) {
  return [
    {
      id: `${god.id}-starter-build`,
      title: `${god.name} Starter Build`,
      meta: `${pantheon.name} · Draft`,
      summary: "This build slot is ready for a real build order. Create one in the editor or add it to data.js.",
      steps: []
    }
  ];
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getGodDetails(god) {
  return god.details || GOD_DETAILS[god.id] || null;
}

function updateReturnLinks(pantheon) {
  const backButton = document.querySelector(".build-back-button");
  const chooseAnotherGodLink = document.querySelector(".primary-link-button");
  const url = pantheonReturnUrl(pantheon?.id);

  if (backButton) {
    backButton.href = url;
    backButton.setAttribute("aria-label", "Back to pantheon selection");
  }

  if (chooseAnotherGodLink) {
    chooseAnotherGodLink.href = url;
    chooseAnotherGodLink.textContent = "Choose Another God";
  }
}

function renderGodDetails(god) {
  if (!godDetailsPanel) {
    return;
  }

  const details = getGodDetails(god);

  if (!details) {
    godDetailsPanel.classList.add("hidden");
    godDetailsPanel.innerHTML = "";
    return;
  }

  const bonuses = Array.isArray(details.bonuses)
    ? details.bonuses
    : [];

  const bonusesHtml = bonuses
    .map((bonus) => `<li>${escapeHtml(bonus)}</li>`)
    .join("");

  godDetailsPanel.innerHTML = `
    <div class="god-details-focus">
      <span>Focus:</span>
      <strong>${escapeHtml(details.focus || "General strategy.")}</strong>
    </div>

    ${bonusesHtml ? `
      <ul class="god-details-list">
        ${bonusesHtml}
      </ul>
    ` : ""}
  `;

  godDetailsPanel.classList.remove("hidden");
}

function renderHero(god, pantheon) {
  document.title = `${god.name} Build Orders | AoM Build Orders`;

  buildPage.style.setProperty("--pantheon-bg", `url("${pantheon.background}")`);

  pantheonLabel.textContent = `${pantheon.name} Pantheon`;
  godName.textContent = god.name;
  godSummary.textContent = god.subtitle;
  godHeroArt.style.backgroundImage = `url("${godHeroPortraitPath(god.id)}")`;
  buildSectionHeading.textContent = `${god.name} Build Orders`;

  updateReturnLinks(pantheon);
  renderGodDetails(god);
}

function renderBuildCard(build, god) {
  const card = document.createElement("article");
  card.className = "build-card";

  const meta = build.meta || build.goalText || "";
  const summary =
    build.summary ||
    build.subtitle ||
    "A saved build order created in the editor.";

  card.innerHTML = `
    <div class="build-card-header">
      <h3>${escapeHtml(build.title)}</h3>
      <div class="build-card-meta">${escapeHtml(meta)}</div>
    </div>

    <p class="build-card-summary">${escapeHtml(summary)}</p>

    <a class="build-card-link" href="${buildDetailUrl(build.id, god.id)}">
      View Build
    </a>
  `;

  return card;
}

function renderBuilds(god, pantheon) {
  const staticBuilds = getStaticBuildsForGod(god.id);
  const savedBuilds = getSavedBuildsForGod(god.id);
  const builds = mergeBuilds(staticBuilds, savedBuilds);

  const finalBuilds = builds.length > 0
    ? builds
    : createFallbackBuild(god, pantheon);

  buildGrid.innerHTML = "";

  finalBuilds.forEach((build) => {
    buildGrid.appendChild(renderBuildCard(build, god));
  });
}

function renderNotFound() {
  document.title = "God Not Found | AoM Build Orders";

  pantheonLabel.textContent = "Unknown God";
  godName.textContent = "Build Orders Not Found";
  godSummary.textContent =
    "The requested god could not be found. Return to the homepage and choose a pantheon again.";

  updateReturnLinks(null);

  if (godDetailsPanel) {
    godDetailsPanel.classList.add("hidden");
    godDetailsPanel.innerHTML = "";
  }

  buildGrid.innerHTML = `
    <div class="empty-builds">
      No matching god was found for this URL. Use the back button or choose another god from the homepage.
    </div>
  `;
}

function initBuildPage() {
  const godId = getGodIdFromUrl();
  const result = findGod(godId);

  if (!result) {
    renderNotFound();
    return;
  }

  renderHero(result.god, result.pantheon);
  renderBuilds(result.god, result.pantheon);
}

initBuildPage();