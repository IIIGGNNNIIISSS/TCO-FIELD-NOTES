import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createRequire } from "node:module";
import { getStore } from "@netlify/blobs";

const require = createRequire(import.meta.url);
const seedInventory = require("../../data/inventory-data.cjs");

const observationStore = getStore("tco-observations");
const imageStore = getStore("tco-observation-images");
const wallStore = getStore("tco-wall");
const settingsStore = getStore("tco-settings");
const residenceStore = getStore("tco-residences");
const soundStore = getStore("tco-sounds");
const documentStore = getStore("tco-documents");
const fileStore = getStore("tco-files");
const allowedTypes = new Set([
  "plante", "oiseau", "insecte", "mammifère", "champignon", "autre"
]);

const programme = [
  {
    id: "waterworks-2026",
    title: "Waterworks",
    artist: "w/ Suzanne Husky + Mouvement d’Alliance pour le peuple Castor + Département de la Nièvre",
    date_start: "2026-10-01",
    date_end: null,
    date_label: "Octobre 2026",
    presentation: "Projet Waterworks inscrit dans la programmation 2026.",
    files: [{ kind: "link", label: "En savoir plus", path: "https://terrainscommuns.org/Festival" }]
  },
  {
    id: "aerocene-2026",
    title: "Aerocene",
    artist: "w/ Pirate Baratte",
    date_start: "2026-10-01",
    date_end: null,
    date_label: "Octobre 2026",
    presentation: "Événement de la programmation 2026.",
    files: []
  },
  {
    id: "renouer-03",
    title: "Renouer! Festival 03",
    artist: "Terrains Communs",
    date_start: "2026-09-12",
    date_end: "2026-09-13",
    date_label: "12—13.09.26",
    presentation: "Troisième édition du festival Renouer! à Terrains Communs.",
    files: []
  },
  {
    id: "ciel-2026",
    title: "CIEL : Open Air Gallery opening",
    artist: "Bourges 2028 — European Capital of Culture · w/ Pirate Baratte + Ravisius Textor",
    date_start: "2026-07-04",
    date_end: null,
    date_label: "4.007.26",
    presentation: "Ouverture de CIEL, galerie à ciel ouvert.",
    files: [{ kind: "link", label: "En savoir plus", path: "https://terrainscommuns.org/Festival" }]
  },
  {
    id: "ecole-couleur-2026",
    title: "L’école de la couleur",
    artist: "Centre de recherche européen de Bibracte",
    date_start: "2026-06-09",
    date_end: "2026-06-13",
    date_label: "9—13.06.26",
    presentation: "Programme accueilli au Centre de recherche européen de Bibracte.",
    files: []
  },
  {
    id: "manon-cezaro-2026",
    title: "Manon Cezaro [résidence EAC]",
    artist: "Manon Cezaro",
    date_start: "2026-05-01",
    date_end: null,
    date_label: "Mai 2026",
    presentation: "Résidence d’éducation artistique et culturelle.",
    files: [{ kind: "link", label: "En savoir plus", path: "https://terrainscommuns.org/Festival" }]
  },
  {
    id: "laura-misch-2026",
    title: "Laura Misch [résidence de création]",
    artist: "Laura Misch",
    date_start: "2026-04-01",
    date_end: null,
    date_label: "Avril 2026",
    presentation: "Résidence de création à Terrains Communs.",
    files: []
  },
  {
    id: "no-school-2025",
    title: "NØ SCHOOL : workshop",
    artist: "NØ SCHOOL",
    date_start: "2025-06-27",
    date_end: null,
    date_label: "27.06.25",
    presentation: "Workshop NØ SCHOOL.",
    files: [{ kind: "link", label: "En savoir plus", path: "https://terrainscommuns.org/NO-SCHOOL-25" }]
  }
];

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });
}

function error(message, status = 400) {
  return json({ error: message }, status);
}

function secret() {
  return process.env.SESSION_SECRET || "";
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function createToken(scope) {
  const expiration = Date.now() + 90 * 24 * 60 * 60 * 1000;
  const payload = `${expiration}.${scope}`;
  return `${payload}.${sign(payload)}`;
}

function validToken(request, requiredScope) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const [expirationText, scope = "", signature = ""] = token.split(".");
  const expiration = Number(expirationText);
  if (!expiration || expiration < Date.now() || !secret() || scope !== requiredScope) return false;
  const expected = sign(`${expiration}.${scope}`);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function text(value, max = 4000) {
  return String(value || "").trim().slice(0, max);
}

async function listJSON(store) {
  const result = await store.list({ paginate: false });
  const entries = await Promise.all(
    (result.blobs || []).map((entry) => store.get(entry.key, {
      type: "json",
      consistency: "strong"
    }))
  );
  return entries.filter(Boolean);
}

function seededSpecies() {
  return seedInventory.map((item, index) => ({
    id: `seed-${index + 1}`,
    common_name: item.commonName,
    latin_name: item.latinName,
    type: item.type,
    observed_at: "2026-05-12",
    zone: "Terrains Communs",
    description: `Groupe : ${item.group}. Inventaire Terrains Communs, mise à jour du 12 mai 2026.`,
    image_path: null,
    created_at: "2026-05-12T12:00:00.000Z"
  }));
}

async function allSpecies() {
  const changes = await listJSON(observationStore);
  const merged = new Map(seededSpecies().map((item) => [String(item.id), item]));
  for (const item of changes) {
    if (item?._deleted) merged.delete(String(item.id));
    else if (item?.id) merged.set(String(item.id), item);
  }
  return [...merged.values()].sort((a, b) =>
    String(b.observed_at || "").localeCompare(String(a.observed_at || ""))
  );
}

async function mergedCollection(store, seeds = []) {
  const merged = new Map(seeds.map((item) => [String(item.id), item]));
  for (const item of await listJSON(store)) {
    if (item?._deleted) merged.delete(String(item.id));
    else if (item?.id) merged.set(String(item.id), item);
  }
  return [...merged.values()];
}

async function allResidences() {
  return (await mergedCollection(residenceStore, programme)).sort((a, b) =>
    String(b.date_start || "").localeCompare(String(a.date_start || ""))
  );
}

async function saveFile(file, folder, maxSize = 40 * 1024 * 1024) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > maxSize) throw new Error("Le fichier dépasse la taille autorisée.");
  const extension = (file.name.split(".").pop() || "bin").replace(/[^a-z0-9]/gi, "").toLowerCase();
  const key = `${folder}/${randomUUID()}.${extension}`;
  await fileStore.set(key, file, {
    metadata: {
      contentType: file.type || "application/octet-stream",
      filename: text(file.name, 180)
    }
  });
  return {
    key,
    path: `/api/file/${encodeURIComponent(key)}`,
    label: text(file.name, 180)
  };
}

async function gardenMessage() {
  return await settingsStore.get("garden-message", {
    type: "json",
    consistency: "strong"
  }) || {
    value: "La saponaire est sur le point de fleurir.",
    updated_at: "2026-06-18T12:00:00.000Z"
  };
}

async function fetchWeather(limit = 72) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: "46.9896",
    longitude: "3.1590",
    current: "temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,shortwave_radiation,rain",
    hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m,pressure_msl,shortwave_radiation,rain",
    past_days: "2",
    forecast_days: "1",
    timezone: "Europe/Paris"
  }).toString();
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Weather unavailable");
  const data = await response.json();
  const rows = data.hourly.time.map((time, index) => ({
    id: `weather-${index}`,
    measured_at: `${time}:00`,
    temperature: data.hourly.temperature_2m[index],
    humidity: data.hourly.relative_humidity_2m[index],
    wind: data.hourly.wind_speed_10m[index],
    pressure: data.hourly.pressure_msl[index],
    sunshine: data.hourly.shortwave_radiation[index],
    rain: data.hourly.rain[index],
    source: "Open-Meteo · Nevers"
  })).filter((row) => new Date(row.measured_at).getTime() <= Date.now());
  return rows.reverse().slice(0, limit);
}

async function handleSpecies(request, url) {
  if (request.method === "GET") {
    const type = url.searchParams.get("type");
    const rows = await allSpecies();
    return json(type ? rows.filter((row) => row.type === type) : rows);
  }
  return error("Method not allowed.", 405);
}

async function handleObservation(request) {
  if (!validToken(request, "observer")) return error("Code d’observation requis.", 401);
  const form = await request.formData();
  const commonName = text(form.get("common_name"), 160);
  const type = text(form.get("type"), 30);
  if (!commonName || !allowedTypes.has(type)) {
    return error(!commonName ? "Le nom commun est requis." : "Choisissez une catégorie.");
  }

  const id = randomUUID();
  const file = form.get("image");
  let imagePath = null;
  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) return error("Le fichier doit être une image.");
    if (file.size > 8 * 1024 * 1024) return error("La photo dépasse 8 Mo.");
    const extension = (file.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "");
    const imageKey = `${id}.${extension}`;
    await imageStore.set(imageKey, file, {
      metadata: { contentType: file.type || "image/jpeg" }
    });
    imagePath = `/api/media/${encodeURIComponent(imageKey)}`;
  }

  const item = {
    id,
    common_name: commonName,
    latin_name: text(form.get("latin_name"), 160) || null,
    type,
    observed_at: text(form.get("observed_at"), 20) || new Date().toISOString().slice(0, 10),
    zone: text(form.get("zone"), 160) || null,
    description: text(form.get("description"), 4000) || null,
    image_path: imagePath,
    created_at: new Date().toISOString()
  };
  await observationStore.setJSON(id, item);
  return json({ id }, 201);
}

async function handleWall(request) {
  if (request.method === "GET") {
    const messages = await listJSON(wallStore);
    return json(messages
      .filter((item) => item.status !== "hidden" && !item._deleted)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 100));
  }
  if (request.method === "POST") {
    const body = await request.json();
    const message = text(body.message, 500);
    if (!message) return error("Le message est vide.");
    const id = randomUUID();
    const item = {
      id,
      author: text(body.author, 60) || null,
      message,
      status: "visible",
      created_at: new Date().toISOString()
    };
    await wallStore.setJSON(id, item);
    return json(item, 201);
  }
  return error("Method not allowed.", 405);
}

function requireAdmin(request) {
  return validToken(request, "admin");
}

function fileKind(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "document";
}

async function createAdminResource(resource, request) {
  const form = await request.formData();
  const id = randomUUID();
  const now = new Date().toISOString();

  if (resource === "residences") {
    const title = text(form.get("title"), 160);
    const artist = text(form.get("artist"), 160);
    const presentation = text(form.get("presentation"), 8000);
    if (!title || !artist || !presentation) {
      return error("Titre, artiste et présentation sont requis.");
    }
    const files = [];
    for (const file of form.getAll("files")) {
      if (!(file instanceof File) || file.size === 0) continue;
      const saved = await saveFile(file, "residences");
      files.push({ kind: fileKind(file), label: saved.label, path: saved.path });
    }
    const item = {
      id, title, artist,
      date_start: text(form.get("date_start"), 20) || null,
      date_end: text(form.get("date_end"), 20) || null,
      date_label: text(form.get("date_label"), 80) || null,
      presentation, files, created_at: now
    };
    await residenceStore.setJSON(id, item);
    return json({ id }, 201);
  }

  if (resource === "sounds") {
    const title = text(form.get("title"), 160);
    const audio = form.get("audio");
    if (!title || !(audio instanceof File) || audio.size === 0) {
      return error(!title ? "Le titre est requis." : "Un fichier audio est requis.");
    }
    if (!audio.type.startsWith("audio/")) return error("Le fichier doit être un son.");
    const saved = await saveFile(audio, "sounds");
    const item = {
      id, title,
      description: text(form.get("description"), 4000) || null,
      recorded_at: text(form.get("recorded_at"), 20) || null,
      location: text(form.get("location"), 160) || null,
      audio_path: saved.path,
      created_at: now
    };
    await soundStore.setJSON(id, item);
    return json({ id }, 201);
  }

  if (resource === "species") {
    const commonName = text(form.get("common_name"), 160);
    const type = text(form.get("type"), 30);
    if (!commonName || !allowedTypes.has(type)) {
      return error(!commonName ? "Le nom commun est requis." : "Choisissez une catégorie.");
    }
    const image = form.get("image");
    let imagePath = null;
    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) return error("Le fichier doit être une image.");
      imagePath = (await saveFile(image, "species", 8 * 1024 * 1024)).path;
    }
    const item = {
      id, common_name: commonName,
      latin_name: text(form.get("latin_name"), 160) || null,
      type,
      observed_at: text(form.get("observed_at"), 20) || new Date().toISOString().slice(0, 10),
      zone: text(form.get("zone"), 160) || null,
      description: text(form.get("description"), 4000) || null,
      image_path: imagePath,
      created_at: now
    };
    await observationStore.setJSON(id, item);
    return json({ id }, 201);
  }

  if (resource === "documents") {
    const title = text(form.get("title"), 160);
    if (!title) return error("Le titre est requis.");
    const file = form.get("file");
    const saved = file instanceof File && file.size > 0 ? await saveFile(file, "documents") : null;
    const item = {
      id, title,
      description: text(form.get("description"), 4000) || null,
      type: text(form.get("type"), 30) || "texte",
      file_path: saved?.path || null,
      body: text(form.get("body"), 12000) || null,
      created_at: now
    };
    await documentStore.setJSON(id, item);
    return json({ id }, 201);
  }

  return error("Ressource inconnue.", 404);
}

async function updateAdminResource(resource, id, request) {
  const body = await request.json();
  const collections = {
    residences: await allResidences(),
    sounds: await mergedCollection(soundStore),
    species: await allSpecies(),
    documents: await mergedCollection(documentStore)
  };
  const current = collections[resource]?.find((item) => String(item.id) === String(id));
  if (!current) return error("Contenu introuvable.", 404);

  let updated;
  let store;
  if (resource === "residences") {
    updated = {
      ...current,
      title: text(body.title, 160),
      artist: text(body.artist, 160),
      date_start: text(body.date_start, 20) || null,
      date_end: text(body.date_end, 20) || null,
      date_label: text(body.date_label, 80) || null,
      presentation: text(body.presentation, 8000)
    };
    store = residenceStore;
  } else if (resource === "sounds") {
    updated = {
      ...current,
      title: text(body.title, 160),
      description: text(body.description, 4000) || null,
      recorded_at: text(body.recorded_at, 20) || null,
      location: text(body.location, 160) || null
    };
    store = soundStore;
  } else if (resource === "species") {
    const type = text(body.type, 30);
    if (!allowedTypes.has(type)) return error("Choisissez une catégorie.");
    updated = {
      ...current,
      common_name: text(body.common_name, 160),
      latin_name: text(body.latin_name, 160) || null,
      type,
      observed_at: text(body.observed_at, 20) || null,
      zone: text(body.zone, 160) || null,
      description: text(body.description, 4000) || null
    };
    store = observationStore;
  } else if (resource === "documents") {
    updated = {
      ...current,
      title: text(body.title, 160),
      description: text(body.description, 4000) || null,
      type: text(body.type, 30) || "texte",
      body: text(body.body, 12000) || null
    };
    store = documentStore;
  } else {
    return error("Ressource inconnue.", 404);
  }
  await store.setJSON(String(id), updated);
  return json({ ok: true });
}

async function deleteAdminResource(resource, id) {
  const stores = {
    residences: residenceStore,
    sounds: soundStore,
    species: observationStore,
    documents: documentStore
  };
  const store = stores[resource];
  if (!store) return error("Ressource inconnue.", 404);
  await store.setJSON(String(id), { id, _deleted: true, deleted_at: new Date().toISOString() });
  return json({ ok: true });
}

export default async (request) => {
  const url = new URL(request.url);
  const marker = "/api/";
  const markerIndex = url.pathname.indexOf(marker);
  const path = markerIndex >= 0 ? url.pathname.slice(markerIndex + marker.length) : "";

  try {
    if (path === "observer/status") {
      return json({ authenticated: validToken(request, "observer") });
    }
    if (path === "observer/login" && request.method === "POST") {
      if (!secret() || !process.env.OBSERVER_PASSWORD) {
        return error("Configuration Netlify incomplète.", 503);
      }
      const body = await request.json();
      if (String(body.password || "") !== process.env.OBSERVER_PASSWORD) {
        return error("Code incorrect.", 401);
      }
      return json({ authenticated: true, token: createToken("observer") });
    }
    if (path === "observer/logout") return json({ authenticated: false });
    if (path === "observer/species" && request.method === "POST") {
      return handleObservation(request);
    }
    if (path === "admin/status") {
      return json({ authenticated: requireAdmin(request) });
    }
    if (path === "admin/login" && request.method === "POST") {
      if (!secret() || !process.env.ADMIN_PASSWORD) {
        return error("Configuration Netlify incomplète.", 503);
      }
      const body = await request.json();
      if (String(body.password || "") !== process.env.ADMIN_PASSWORD) {
        return error("Mot de passe incorrect.", 401);
      }
      return json({ authenticated: true, token: createToken("admin") });
    }
    if (path === "admin/logout") return json({ authenticated: false });
    if (path === "admin/garden-message" && request.method === "PUT") {
      if (!requireAdmin(request)) return error("Authentification requise.", 401);
      const body = await request.json();
      const value = text(body.message, 300);
      if (!value) return error("Le message est vide.");
      const item = { value, updated_at: new Date().toISOString() };
      await settingsStore.setJSON("garden-message", item);
      return json(item);
    }
    if (path === "admin/wall" && request.method === "GET") {
      if (!requireAdmin(request)) return error("Authentification requise.", 401);
      return json((await listJSON(wallStore))
        .filter((item) => !item._deleted)
        .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))));
    }
    if (path.startsWith("admin/wall/")) {
      if (!requireAdmin(request)) return error("Authentification requise.", 401);
      const id = decodeURIComponent(path.slice("admin/wall/".length));
      const current = await wallStore.get(id, { type: "json", consistency: "strong" });
      if (!current) return error("Message introuvable.", 404);
      if (request.method === "PATCH") {
        const body = await request.json();
        await wallStore.setJSON(id, {
          ...current,
          status: body.status === "hidden" ? "hidden" : "visible"
        });
        return json({ ok: true });
      }
      if (request.method === "DELETE") {
        await wallStore.setJSON(id, { id, _deleted: true, created_at: current.created_at });
        return json({ ok: true });
      }
    }
    const adminResourceMatch = path.match(/^admin\/(residences|sounds|species|documents)(?:\/([^/]+))?$/);
    if (adminResourceMatch) {
      if (!requireAdmin(request)) return error("Authentification requise.", 401);
      const [, resource, encodedId] = adminResourceMatch;
      if (request.method === "POST" && !encodedId) return createAdminResource(resource, request);
      if (request.method === "PUT" && encodedId) {
        return updateAdminResource(resource, decodeURIComponent(encodedId), request);
      }
      if (request.method === "DELETE" && encodedId) {
        return deleteAdminResource(resource, decodeURIComponent(encodedId));
      }
      return error("Method not allowed.", 405);
    }
    if (path === "species") return handleSpecies(request, url);
    if (path === "residences") return json(await allResidences());
    if (path === "sounds") return json(await mergedCollection(soundStore));
    if (path === "documents") return json(await mergedCollection(documentStore));
    if (path === "wall") return handleWall(request);
    if (path === "weather") {
      const limit = Math.min(Math.max(Number(url.searchParams.get("limit")) || 24, 1), 72);
      return json(await fetchWeather(limit));
    }
    if (path === "home") {
      const [message, species, weather, wall, residences] = await Promise.all([
        gardenMessage(),
        allSpecies(),
        fetchWeather(1),
        listJSON(wallStore),
        allResidences()
      ]);
      return json({
        message,
        weather: weather[0] || null,
        counts: {
          observations: species.length,
          residences: residences.length,
          messages: wall.filter((item) => item.status !== "hidden" && !item._deleted).length
        }
      });
    }
    if (path.startsWith("media/") && request.method === "GET") {
      const key = decodeURIComponent(path.slice("media/".length));
      const result = await imageStore.getWithMetadata(key, {
        type: "arrayBuffer",
        consistency: "strong"
      });
      if (!result) return new Response("Not found", { status: 404 });
      return new Response(result.data, {
        headers: {
          "Content-Type": result.metadata?.contentType || "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }
    if (path.startsWith("file/") && request.method === "GET") {
      const key = decodeURIComponent(path.slice("file/".length));
      const result = await fileStore.getWithMetadata(key, {
        type: "arrayBuffer",
        consistency: "strong"
      });
      if (!result) return new Response("Not found", { status: 404 });
      return new Response(result.data, {
        headers: {
          "Content-Type": result.metadata?.contentType || "application/octet-stream",
          "Content-Disposition": `inline; filename="${String(result.metadata?.filename || "fichier").replaceAll('"', "")}"`,
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }
    return error("Route introuvable.", 404);
  } catch (caught) {
    console.error(caught);
    return error("Une erreur est survenue sur la version en ligne.", 500);
  }
};
