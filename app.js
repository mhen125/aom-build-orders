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
    <div class="pantheon-icon-shell">
      <div class="pantheon-art" style="background-image: url('${pantheon.image}')"></div>
      <div class="pantheon-frame"></div>
    </div>

    <div class="nameplate pantheon-nameplate">
      <span>${pantheon.name}</span>
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
    <div class="god-icon-shell">
      <div class="god-art" style="background-image: url('${godCardPortraitPath(god.id)}')"></div>
      <div class="god-frame"></div>
    </div>

    <div class="nameplate god-nameplate">
      <span>${god.name}</span>
    </div>
  `;

  card.addEventListener("click", () => {
    window.location.href = buildUrl(god.id);
  });

  return card;
}

function renderPantheons() {
  pantheonGrid.innerHTML = "";

  pantheons.forEach((pantheon) => {
    pantheonGrid.appendChild(createPantheonCard(pantheon));
  });
}

function renderGods(pantheon) {
  godGrid.innerHTML = "";

  pantheon.gods.forEach((god, index) => {
    godGrid.appendChild(createGodCard(god, index));
  });
}

function selectPantheon(pantheonId) {
  const pantheon = pantheons.find((item) => item.id === pantheonId);

  if (!pantheon) {
    return;
  }

  selectedPantheonId = pantheonId;
  isTransitioning = true;

  selectionSection.style.setProperty("--pantheon-bg", `url("${pantheon.background}")`);
  selectionSection.classList.add("has-pantheon-bg");
  selectionSection.classList.add("god-selection-active");

  selectionEyebrow.textContent = "";
  selectionHeading.textContent = "Choose a Major God";
  selectionDescription.textContent = "";
  resetSelectionButton.classList.remove("hidden");

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
  if (isTransitioning) {
    return;
  }

  selectedPantheonId = null;
  isTransitioning = true;

  selectionEyebrow.textContent = "Pantheon Selection";
  selectionHeading.textContent = "Choose a Pantheon";
  selectionDescription.textContent = "Select a pantheon to reveal its major gods.";
  resetSelectionButton.classList.add("hidden");
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

resetSelectionButton.addEventListener("click", clearSelection);

renderPantheons();