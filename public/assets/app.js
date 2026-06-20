const page = document.body.dataset.page;
const lang = location.pathname === "/en" || location.pathname.startsWith("/en/") ? "en" : "fr";
const copy = {
  fr: {
    labels: { temperature: "Température", humidity: "Humidité", wind: "Vent", pressure: "Pression", sunshine: "Ensoleillement", rain: "Pluie" },
    latest: "dernière mesure",
    waiting: "en attente",
    noReading: "Aucune mesure",
    reading: "Mesure",
    anonymous: "Anonyme",
    wallEmpty: "Le chat attend son premier message.",
    wallSuccess: "Votre message pousse maintenant sur le chat.",
    dateUnknown: "Date non précisée",
    datesComing: "Dates à venir",
    from: "Du",
    to: "au",
    residencesEmpty: "Les prochaines résidences apparaîtront ici.",
    docsLink: "Consulter la documentation",
    soundPlace: "Lieu non précisé",
    soundsEmpty: "La bibliothèque sonore attend ses premiers enregistrements.",
    zoneUnknown: "Zone non précisée",
    speciesEmpty: "Aucune observation dans cette catégorie.",
    documentsEmpty: "La bibliothèque est encore silencieuse.",
    openFile: "Ouvrir le fichier"
  },
  en: {
    labels: { temperature: "Temperature", humidity: "Humidity", wind: "Wind", pressure: "Pressure", sunshine: "Sunlight", rain: "Rain" },
    latest: "latest reading",
    waiting: "waiting",
    noReading: "No reading",
    reading: "Reading",
    anonymous: "Anonymous",
    wallEmpty: "The chat is waiting for its first message.",
    wallSuccess: "Your message is now growing on the chat.",
    dateUnknown: "Date not specified",
    datesComing: "Dates to come",
    from: "From",
    to: "to",
    residencesEmpty: "Upcoming residencies will appear here.",
    docsLink: "View documentation",
    soundPlace: "Location not specified",
    soundsEmpty: "The sound library is waiting for its first recordings.",
    zoneUnknown: "Area not specified",
    speciesEmpty: "No observations in this category.",
    documentsEmpty: "The library is still quiet.",
    openFile: "Open file"
  }
}[lang];
const typeNames = lang === "en" ? {
  plante: "plant",
  oiseau: "bird",
  insecte: "insect",
  mammifère: "mammal",
  champignon: "fungus",
  autre: "other"
} : {};

function localizeContent(value = "") {
  if (lang !== "en") return value;
  if (value === "Le sureau est en fleur.") return "The elder is in bloom.";
  if (value === "La saponaire est sur le point de fleurir.") return "The soapwort is about to bloom.";
  return value
    .replace(/^Groupe : /, "Group: ")
    .replace("Inventaire Terrains Communs, mise à jour du 12 mai 2026.", "Terrains Communs inventory, updated May 12, 2026.");
}

const units = {
  temperature: "°C",
  humidity: "%",
  wind: "km/h",
  pressure: "hPa",
  sunshine: "W/m²",
  rain: "mm"
};

const labels = copy.labels;

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value, withTime = false) {
  if (!value) return copy.dateUnknown;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "fr-FR", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" } : {})
  }).format(date);
}

function dateRange(start, end) {
  if (!start && !end) return copy.datesComing;
  if (start && end) return `${copy.from} ${formatDate(start)} ${copy.to} ${formatDate(end)}`;
  return formatDate(start || end);
}

async function api(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "La station locale ne répond pas.");
  return data;
}

function showNotice(element, message, kind = "success") {
  element.textContent = message;
  element.className = `notice ${kind}`;
  element.hidden = false;
}

function metricCards(weather) {
  return Object.keys(units).map((key) => `
    <article class="metric">
      <span class="metric-label">${labels[key]}</span>
      <strong class="metric-value">${escapeHtml(weather?.[key] ?? "—")} <small>${units[key]}</small></strong>
      <span class="meta">${weather ? copy.latest : copy.waiting}</span>
    </article>
  `).join("");
}

function setupNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

async function loadHome() {
  const data = await api("/api/home");
  document.querySelector("#garden-message").textContent = localizeContent(
    data.message?.value || (lang === "en" ? "The garden is listening." : "Le jardin écoute.")
  );
  document.querySelector("#weather-metrics").innerHTML = metricCards(data.weather);
  document.querySelector("#weather-date").textContent = data.weather
    ? `${copy.reading} ${formatDate(data.weather.measured_at, true)} · ${data.weather.source}`
    : copy.noReading;
  document.querySelector("#count-observations").textContent = data.counts.observations;
  document.querySelector("#count-residences").textContent = data.counts.residences;
  document.querySelector("#count-messages").textContent = data.counts.messages;
}

async function loadWeather() {
  const readings = await api("/api/weather?limit=72");
  document.querySelector("#weather-metrics").innerHTML = metricCards(readings[0]);
  document.querySelector("#weather-history-body").innerHTML = readings.map((row) => `
    <tr>
      <td>${formatDate(row.measured_at, true)}</td>
      <td>${row.temperature} °C</td>
      <td>${row.humidity} %</td>
      <td>${row.wind} km/h</td>
      <td>${row.pressure} hPa</td>
      <td>${row.sunshine} W/m²</td>
      <td>${row.rain} mm</td>
    </tr>
  `).join("");
}

async function loadWall() {
  const container = document.querySelector("#wall-list");
  const messages = await api("/api/wall");
  container.innerHTML = messages.length ? messages.map((item) => `
    <article class="wall-message">
      <p>${escapeHtml(item.message)}</p>
      <span class="meta">${escapeHtml(item.author || copy.anonymous)} · ${formatDate(item.created_at, true)}</span>
    </article>
  `).join("") : `<p class="empty">${copy.wallEmpty}</p>`;
}

function setupWallForm() {
  const form = document.querySelector("#wall-form");
  const notice = document.querySelector("#wall-notice");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      await api("/api/wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form)))
      });
      form.reset();
      showNotice(notice, copy.wallSuccess);
      await loadWall();
    } catch (error) {
      showNotice(notice, error.message, "error");
    } finally {
      button.disabled = false;
    }
  });
}

async function loadResidences() {
  const items = await api("/api/residences");
  const container = document.querySelector("#residences-list");
  container.innerHTML = items.length ? items.map((item) => {
    const images = item.files.filter((file) => file.kind === "image");
    const audio = item.files.filter((file) => file.kind === "audio");
    const documents = item.files.filter((file) => ["document", "link"].includes(file.kind));
    return `
      <article class="card">
        ${images[0] ? `<img class="media-image" src="${escapeHtml(images[0].path)}" alt="">` : ""}
        <span class="eyebrow">${escapeHtml(item.artist)}</span>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="meta">${escapeHtml(item.date_label || dateRange(item.date_start, item.date_end))}</p>
        <p>${escapeHtml(item.presentation)}</p>
        ${audio.map((file) => `<audio controls preload="none" src="${escapeHtml(file.path)}"></audio>`).join("")}
        ${documents.map((file) => `<p><a href="${escapeHtml(file.path)}"${file.path.startsWith("http") ? ' target="_blank" rel="noopener"' : ""}>${escapeHtml(file.label || copy.docsLink)}</a></p>`).join("")}
      </article>
    `;
  }).join("") : `<p class="empty">${copy.residencesEmpty}</p>`;
}

async function loadSounds() {
  const items = await api("/api/sounds");
  const container = document.querySelector("#sounds-list");
  container.innerHTML = items.length ? items.map((item) => `
    <article class="card">
      <span class="eyebrow">${formatDate(item.recorded_at)}</span>
      <h2>${escapeHtml(item.title)}</h2>
      <p class="meta">${escapeHtml(item.location || copy.soundPlace)}</p>
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
      <audio controls preload="none" src="${escapeHtml(item.audio_path)}">
        Votre navigateur ne peut pas lire ce son.
      </audio>
    </article>
  `).join("") : `<p class="empty">${copy.soundsEmpty}</p>`;
}

async function loadSpecies(type = "") {
  const items = await api(`/api/species${type ? `?type=${encodeURIComponent(type)}` : ""}`);
  const container = document.querySelector("#species-list");
  container.innerHTML = items.length ? items.map((item) => `
    <article class="card">
      ${item.image_path ? `<img class="media-image" src="${escapeHtml(item.image_path)}" alt="${escapeHtml(item.common_name)}">` : ""}
      <span class="tag" data-type="${escapeHtml(item.type)}">${escapeHtml(typeNames[item.type] || item.type)}</span>
      <h2>${escapeHtml(item.common_name)}</h2>
      ${item.latin_name ? `<p class="latin">${escapeHtml(item.latin_name)}</p>` : ""}
      <p class="meta">${formatDate(item.observed_at)} · ${escapeHtml(item.zone || copy.zoneUnknown)}</p>
      ${item.description ? `<p>${escapeHtml(localizeContent(item.description))}</p>` : ""}
    </article>
  `).join("") : `<p class="empty">${copy.speciesEmpty}</p>`;
}

function setupSpeciesFilters() {
  document.querySelectorAll("[data-species-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-species-filter]").forEach((item) => item.classList.add("secondary"));
      button.classList.remove("secondary");
      loadSpecies(button.dataset.speciesFilter);
    });
  });
}

async function loadDocuments() {
  const items = await api("/api/documents");
  const container = document.querySelector("#documents-list");
  container.innerHTML = items.length ? items.map((item) => `
    <article class="list-row">
      <div>
        <span class="tag">${escapeHtml(item.type)}</span>
        <p class="meta">${formatDate(item.created_at)}</p>
      </div>
      <div>
        <h2>${escapeHtml(item.title)}</h2>
        ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
        ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
        ${item.file_path ? `<a class="button secondary" href="${escapeHtml(item.file_path)}">${copy.openFile}</a>` : ""}
      </div>
    </article>
  `).join("") : `<p class="empty">${copy.documentsEmpty}</p>`;
}

setupNavigation();

const loaders = {
  home: loadHome,
  weather: loadWeather,
  wall: async () => { setupWallForm(); await loadWall(); },
  residences: loadResidences,
  sounds: loadSounds,
  species: async () => { setupSpeciesFilters(); await loadSpecies(); },
  documents: loadDocuments
};

if (loaders[page]) {
  loaders[page]().catch((error) => {
    const target = document.querySelector("[data-error-target]") || document.querySelector("main");
    const message = document.createElement("p");
    message.className = "notice error container";
    message.textContent = error.message;
    target.prepend(message);
  });
}
