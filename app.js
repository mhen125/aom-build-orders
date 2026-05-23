const pantheons = window.AOM_DATA.pantheons;

const selectionSection = document.getElementById("selectionSection");
const selectionEyebrow = document.getElementById("selectionEyebrow");
const selectionHeading = document.getElementById("selection-heading");
const selectionDescription = document.getElementById("selectionDescription");
const pantheonGrid = document.getElementById("pantheonGrid");
const godGrid = document.getElementById("godGrid");
const resetSelectionButton = document.getElementById("resetSelectionButton");

let selectedPantheonId = null;
let isTransitioning = false;

function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function godCardPortraitPath(godId) {
  return `assets/images/gods/${godId}_portrait.png`;
}

function godHeroPortraitPath(godId) {
  return `assets/images/gods/${godId}_breakoutportrait.png`;
}

function buildUrl(godId) {
  return `builds.html?god=${encodeURIComponent(godId)}`;
}

function createPantheonCard(pantheon) {
  const card = document.createElement("button");

  card.className = "pantheon-card";
  card.type = "button";
  card.dataset.pantheonId = pantheon.id;
  card.setAttribute("aria-label", `Select ${pantheon.name} pantheon`);

  card.innerHTML = `
    <div class="pantheon-card-glow"></div>

    <div class="pantheon-card-content">
      <img class="pantheon-card-icon" src="${pantheon.icon}" alt="${pantheon.name} icon">
      <h3>${pantheon.name}</h3>
      <p>${pantheon.description || "Select this pantheon to view its major gods."}</p>
    </div>
  `;

  card.addEventListener("click", () => {
    if (isTransitioning) {
      return;
    }

    selectPantheon(pantheon.id);
  });

  return card;
}

function createGodCard(god, index) {
  const card = document.createElement("button");

  card.className = "god-card";
  card.type = "button";
  card.style.animationDelay = `${index * 75}ms`;
  card.dataset.godId = god.id;
  card.dataset.heroImage = godHeroPortraitPath(god.id);
  card.setAttribute("aria-label", `View build orders for ${god.name}`);

  card.innerHTML = `
    <div class="god-card-portrait-wrap">
      <img class="god-card-portrait" src="${godCardPortraitPath(god.id)}" alt="${god.name}">
    </div>

    <div class="god-card-name">${god.name}</div>
  `;

  card.addEventListener("click", () => {
    window.location.href = buildUrl(god.id);
  });

  return card;
}

function renderPantheons() {
  if (!pantheonGrid) {
    return;
  }

  pantheonGrid.innerHTML = "";

  pantheons.forEach((pantheon) => {
    pantheonGrid.appendChild(createPantheonCard(pantheon));
  });
}

function renderGods(pantheon) {
  if (!godGrid) {
    return;
  }

  godGrid.innerHTML = "";

  pantheon.gods.forEach((god, index) => {
    godGrid.appendChild(createGodCard(god, index));
  });
}

function selectPantheon(pantheonId) {
  const pantheon = pantheons.find((item) => item.id === pantheonId);

  if (!pantheon || !selectionSection) {
    return;
  }

  selectedPantheonId = pantheonId;
  isTransitioning = true;

  selectionSection.style.setProperty("--pantheon-bg", `url("${pantheon.background}")`);
  selectionSection.classList.add("has-pantheon-bg");
  selectionSection.classList.add("god-selection-active");

  if (selectionEyebrow) {
    selectionEyebrow.textContent = `${pantheon.name} Pantheon`;
  }

  if (selectionHeading) {
    selectionHeading.textContent = "Choose a Major God";
  }

  if (selectionDescription) {
    selectionDescription.textContent = "Select a major god to view build orders, openings, and strategy notes.";
  }

  if (resetSelectionButton) {
    resetSelectionButton.classList.remove("hidden");
  }

  pantheonGrid.classList.add("leaving");

  window.setTimeout(() => {
    pantheonGrid.classList.add("hidden");
    pantheonGrid.classList.remove("leaving");

    renderGods(pantheon);

    godGrid.classList.remove("hidden");
    godGrid.classList.add("entering");

    window.setTimeout(() => {
      godGrid.classList.remove("entering");
      isTransitioning = false;
    }, 540);
  }, 260);
}

function clearSelection() {
  if (isTransitioning || !selectionSection) {
    return;
  }

  selectedPantheonId = null;
  isTransitioning = true;

  if (selectionEyebrow) {
    selectionEyebrow.textContent = "Pantheon Selection";
  }

  if (selectionHeading) {
    selectionHeading.textContent = "Choose a Pantheon";
  }

  if (selectionDescription) {
    selectionDescription.textContent = "Select a pantheon to reveal its major gods.";
  }

  if (resetSelectionButton) {
    resetSelectionButton.classList.add("hidden");
  }

  selectionSection.classList.remove("god-selection-active");
  godGrid.classList.add("leaving");

  window.setTimeout(() => {
    godGrid.classList.add("hidden");
    godGrid.classList.remove("leaving");
    godGrid.innerHTML = "";

    selectionSection.classList.remove("has-pantheon-bg");

    pantheonGrid.classList.remove("hidden");
    pantheonGrid.classList.add("entering");

    window.setTimeout(() => {
      pantheonGrid.classList.remove("entering");
      selectionSection.style.removeProperty("--pantheon-bg");
      isTransitioning = false;
    }, 540);
  }, 260);
}

function initFromUrl() {
  const requestedPantheonId = getUrlParam("pantheon");

  if (!requestedPantheonId) {
    return;
  }

  const pantheon = pantheons.find((item) => item.id === requestedPantheonId);

  if (!pantheon) {
    return;
  }

  window.setTimeout(() => {
    selectPantheon(requestedPantheonId);
  }, 80);
}

function initHomePage() {
  if (!window.AOM_DATA || !Array.isArray(window.AOM_DATA.pantheons)) {
    console.error("AOM_DATA.pantheons was not found. Make sure data.js loads before app.js.");
    return;
  }

  if (!selectionSection || !pantheonGrid || !godGrid) {
    console.error("Home page elements were not found. Make sure app.js is only loaded on index.html.");
    return;
  }

  if (resetSelectionButton) {
    resetSelectionButton.addEventListener("click", clearSelection);
  }

  renderPantheons();
  initFromUrl();
}

initHomePage();