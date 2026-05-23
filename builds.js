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
    bonuses: ["Starts with 10 Favor.",
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
    bonuses: ["Town Ceneter and Citaedel Centers support +5 population.",
      "Monuments shield against enemy God Powers (25 range; 50 when empowered)",
      "Empowered Monuments heal nearby units (50 range) and generate Favor 100% faster.",
      "Technologies cost -10%.",
      "Obelisks  cost -5 Gold, and are built 40% faster."
    ]
  },
  set: {
    focus: "Barracks units.",
    bonuses: ["Pharohs can summon Animals of Set.",
      "Priests can convert wild animals, but converted animals lost 25% of their Food.",
      "+5% Spearmen, Axemen, and Slinger speed.",
      "Barracks, Siege Works, and Migdol Strongholds cost +25% Gold.",
      "Monuments reduce the cost of units nearby Barracks and Migdol Strongholds by 10%."
    ]
  },
  thor: {
    focus: "Dwarves and Armory.",
    bonuses: ["Start with Dwarves instead of Gatherers.",
      "Dwarves cost -10 Gold, and gather Food and Wood nearly as fast as Gatherers.",
      "Dwarven Armor can be built and research upgrades in any age.",
      "Armory upgrades cost -10% less.",
      "Receive a free Dwarf for each Dwarven Armory upgrade.",
      "Cab research 3 extra Dwarven Armory upgrades."
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
    bonuses: ["Has a potent defensive God Power that gets more powerful with each age advanced.",
      "Technologies cost -50% Food, Wood, and Gold, but take 150% longer to research.",
      "Hill Forts and Hill Fort units +10% damage.",
      "Repairing buildings is free.",
      "Gatherers and Dwarves can repair."
    ]
  },
  oranos: {
    focus: "Vision and Mobility.",
    bonuses: ["Citizens can build a new Sky Passage each age.",
      "Units can enter Sky Passages to instantly teleport between them.",
      "All units have +4 Line of Sight.",
      "Oracles generate +25% Favor at full Line of Sight.",
      "Damaged enemy units remain visibile for 25 seconds."
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
    bonuses: ["God Blessing: Yin and Yang.",
      "On Favored Land: Buildings research 300% faster and Military Camp/Machine Workshop additions cost -25%.",
      "Gains access to Nezha in the Classical Age, an additional legendary hero that gets stronger each age.",
    ]
  },
  nüwa: {
    focus: "Economy and Support.",
    bonuses: []
  },
  shennong: {
    focus: "Economy and Farming.",
    bonuses: ["God Blessing: Gift of Beasts.",
      "On Favored Land: Myth units recover 1.5 hit points per second, increasing by 1.5 per age.",
      "Farms are available in Archaic Age, and build instantly on favored land.",
      "Plow, Irrigation, and Flood control are researched instantly for free in their respective ages.",
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
      "Increases Shinobi and Cavalry attack with each Bushidö tier.",
      "Each technology researched grants Bushidö XP.",
      "Advancing to the next Age is 25% faster.",
      "A free Kitsune appears at the Temple each Age."
    ]
  },
  susanoo: {
    focus: "Military and Economy.",
    bonuses: [
    ]
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
  },
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
      summary:
        "This build slot is ready for a real build order. Create one in the editor or add it to data.js.",
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