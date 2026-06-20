const observerLogin = document.querySelector("#observer-login");
const observerPanel = document.querySelector("#observer-form-panel");
const loginForm = document.querySelector("#observer-login-form");
const observationForm = document.querySelector("#observer-form");
const loginNotice = document.querySelector("#observer-login-notice");
const formNotice = document.querySelector("#observer-form-notice");
const observedAt = document.querySelector("#observed-at");
const isEnglish = location.pathname === "/en" || location.pathname.startsWith("/en/");
const tokenKey = "tco-observer-token";

const messages = isEnglish ? {
  unavailable: "The local server is not responding.",
  saved: "Observation saved. Thank you!",
  loginError: "Incorrect code.",
  submit: "Save observation",
  saving: "Saving…"
} : {
  unavailable: "Le serveur local ne répond pas.",
  saved: "Observation enregistrée. Merci !",
  loginError: "Code incorrect.",
  submit: "Enregistrer l’observation",
  saving: "Enregistrement…"
};

if (isEnglish) {
  document.querySelector("#common-name").placeholder = "E.g. Blue tit";
  document.querySelector("#observation-zone").placeholder = "E.g. North hedge";
  document.querySelector("#observation-description").placeholder = "Number, behaviour, weather…";
}

async function observerApi(url, options = {}) {
  const token = localStorage.getItem(tokenKey);
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || messages.unavailable);
  return data;
}

function observerNotice(element, message, kind = "success") {
  element.textContent = message;
  element.className = `notice ${kind}`;
  element.hidden = false;
}

function setToday() {
  observedAt.value = new Date().toISOString().slice(0, 10);
}

async function updateObserverState() {
  const status = await observerApi("/api/observer/status");
  if (!status.authenticated) localStorage.removeItem(tokenKey);
  observerLogin.classList.toggle("hidden", status.authenticated);
  observerPanel.classList.toggle("hidden", !status.authenticated);
  if (status.authenticated) setToday();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector("button");
  button.disabled = true;
  try {
    const result = await observerApi("/api/observer/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(loginForm)))
    });
    localStorage.setItem(tokenKey, result.token);
    loginForm.reset();
    loginNotice.hidden = true;
    await updateObserverState();
  } catch (error) {
    observerNotice(loginNotice, error.message || messages.loginError, "error");
  } finally {
    button.disabled = false;
  }
});

observationForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = observationForm.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = messages.saving;
  try {
    await observerApi("/api/observer/species", {
      method: "POST",
      body: new FormData(observationForm)
    });
    observationForm.reset();
    setToday();
    observerNotice(formNotice, messages.saved);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    observerNotice(formNotice, error.message, "error");
  } finally {
    button.disabled = false;
    button.textContent = messages.submit;
  }
});

document.querySelector("#observer-logout").addEventListener("click", async () => {
  localStorage.removeItem(tokenKey);
  location.reload();
});

updateObserverState().catch((error) => observerNotice(loginNotice, error.message, "error"));
