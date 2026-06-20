const loginPanel = document.querySelector("#login-panel");
const adminPanel = document.querySelector("#admin-panel");
const adminNotice = document.querySelector("#admin-notice");
const tokenKey = "tco-admin-token";

function escapeHtml(value = "") {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "sans date";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(date);
}

async function api(url, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem(tokenKey);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "La version en ligne ne répond pas.");
  return data;
}

function notice(message, kind = "success") {
  adminNotice.textContent = message;
  adminNotice.className = `notice ${kind}`;
  adminNotice.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function checkSession() {
  const status = await api("/api/admin/status");
  if (!status.authenticated) localStorage.removeItem(tokenKey);
  loginPanel.classList.toggle("hidden", status.authenticated);
  adminPanel.classList.toggle("hidden", !status.authenticated);
  if (status.authenticated) await loadAdmin();
}

document.querySelector("#login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const loginNotice = document.querySelector("#login-notice");
  try {
    const result = await api("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    });
    localStorage.setItem(tokenKey, result.token);
    form.reset();
    loginNotice.hidden = true;
    await checkSession();
  } catch (error) {
    loginNotice.textContent = error.message;
    loginNotice.className = "notice error";
    loginNotice.hidden = false;
  }
});

document.querySelector("#logout-button").addEventListener("click", () => {
  localStorage.removeItem(tokenKey);
  location.reload();
});

document.querySelector("#garden-message-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/admin/garden-message", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
    });
    notice("Le jardin a un nouveau message.");
    await loadAdmin();
  } catch (error) {
    notice(error.message, "error");
  }
});

function bindUploadForm(selector, resource, success) {
  const form = document.querySelector(selector);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type=submit]");
    button.disabled = true;
    try {
      await api(`/api/admin/${resource}`, { method: "POST", body: new FormData(form) });
      form.reset();
      notice(success);
      await loadAdmin();
    } catch (error) {
      notice(error.message, "error");
    } finally {
      button.disabled = false;
    }
  });
}

bindUploadForm("#residence-form", "residences", "Résidence ajoutée.");
bindUploadForm("#sound-form", "sounds", "Son ajouté.");
bindUploadForm("#species-form", "species", "Observation ajoutée.");
bindUploadForm("#document-form", "documents", "Document ajouté.");

async function loadAdmin() {
  const [home, wall, residences, sounds, species, documents] = await Promise.all([
    api("/api/home"), api("/api/admin/wall"), api("/api/residences"),
    api("/api/sounds"), api("/api/species"), api("/api/documents")
  ]);
  document.querySelector("#garden-message-input").value = home.message?.value || "";
  document.querySelector("#admin-wall-list").innerHTML = wall.length ? wall.map((item) => `
    <article class="admin-item">
      <div><strong>${escapeHtml(item.author || "Anonyme")}</strong><p>${escapeHtml(item.message)}</p><span class="meta">${formatDate(item.created_at)} · ${item.status === "hidden" ? "masqué" : "visible"}</span></div>
      <div class="actions"><button class="secondary" data-wall-toggle="${item.id}" data-status="${item.status === "hidden" ? "visible" : "hidden"}">${item.status === "hidden" ? "Afficher" : "Masquer"}</button><button class="danger" data-delete="wall" data-id="${item.id}">Supprimer</button></div>
    </article>`).join("") : '<p class="empty">Aucun message.</p>';

  renderItems("residences", residences, (item) => `<strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.artist)} · ${formatDate(item.date_start)}</p>`);
  renderItems("sounds", sounds, (item) => `<strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.location || "Lieu non précisé")}</p>`);
  renderItems("species", species, (item) => `<strong>${escapeHtml(item.common_name)}</strong><p>${escapeHtml(item.type)} · ${escapeHtml(item.zone || "zone non précisée")}</p>`);
  renderItems("documents", documents, (item) => `<strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.type)}</p>`);
  bindActions();
}

function renderItems(resource, items, content) {
  document.querySelector(`#admin-${resource}-list`).innerHTML = items.length ? `
    <h3 style="margin-top:2rem">Contenus existants</h3>${items.map((item) => `
      <article class="admin-item"><div>${content(item)}</div><div class="actions"><button class="secondary" data-edit="${resource}" data-id="${item.id}">Modifier</button><button class="danger" data-delete="${resource}" data-id="${item.id}">Supprimer</button></div></article>
    `).join("")}` : '<p class="empty" style="margin-top:2rem">Aucun contenu.</p>';
}

function bindActions() {
  document.querySelectorAll("[data-wall-toggle]").forEach((button) => button.addEventListener("click", async () => {
    try {
      await api(`/api/admin/wall/${encodeURIComponent(button.dataset.wallToggle)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: button.dataset.status })
      });
      await loadAdmin();
    } catch (error) { notice(error.message, "error"); }
  }));

  document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("Supprimer définitivement ce contenu en ligne ?")) return;
    try {
      await api(`/api/admin/${button.dataset.delete}/${encodeURIComponent(button.dataset.id)}`, { method: "DELETE" });
      notice("Contenu supprimé.");
      await loadAdmin();
    } catch (error) { notice(error.message, "error"); }
  }));

  document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => editItem(button.dataset.edit, button.dataset.id)));
}

async function editItem(resource, id) {
  const endpoints = { residences: "residences", sounds: "sounds", species: "species", documents: "documents" };
  const collection = await api(`/api/${endpoints[resource]}`);
  const item = collection.find((entry) => String(entry.id) === String(id));
  if (!item) return;
  const fields = {
    residences: [["title", "Titre"], ["artist", "Artiste / collectif"], ["date_start", "Date de début (AAAA-MM-JJ)"], ["date_end", "Date de fin (AAAA-MM-JJ)"], ["date_label", "Date affichée librement"], ["presentation", "Présentation"]],
    sounds: [["title", "Titre"], ["location", "Lieu"], ["recorded_at", "Date (AAAA-MM-JJ)"], ["description", "Description"]],
    species: [["common_name", "Nom commun"], ["latin_name", "Nom latin"], ["type", "Type"], ["observed_at", "Date (AAAA-MM-JJ)"], ["zone", "Zone"], ["description", "Description"]],
    documents: [["title", "Titre"], ["type", "Type"], ["description", "Description"], ["body", "Texte"]]
  };
  const updated = {};
  for (const [key, label] of fields[resource]) {
    const value = prompt(label, item[key] || "");
    if (value === null) return;
    updated[key] = value;
  }
  try {
    await api(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });
    notice("Contenu modifié.");
    await loadAdmin();
  } catch (error) { notice(error.message, "error"); }
}

checkSession().catch((error) => {
  const target = document.querySelector("#login-notice");
  target.textContent = error.message;
  target.className = "notice error";
  target.hidden = false;
});
