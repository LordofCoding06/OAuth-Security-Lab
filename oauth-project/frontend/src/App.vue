<script setup>
import { ref, onMounted } from "vue";
import { userManager, login, logout, handleCallback } from "./auth";

const user = ref(null);
const apiData = ref(null);
const loading = ref(false);
const error = ref(null);

async function loadUser() {
  user.value = await userManager.getUser();
}

onMounted(async () => {
  // Wenn wir von Keycloak zurückkommen, sind code & state in der URL
  if (
    window.location.pathname === "/callback" &&
    window.location.search.includes("code=") &&
    window.location.search.includes("state=")
  ) {
    try {
      await handleCallback();
      await loadUser();
      // URL auf Root zurücksetzen, damit /callback verschwindet
      window.history.replaceState({}, document.title, "/");
    } catch (e) {
      console.error(e);
      error.value = "Login-Callback fehlgeschlagen";
    }
  } else {
    await loadUser();
  }
});

async function doLogin() {
  await login();
}

async function doLogout() {
  await logout();
}

async function callProtectedApi() {
  loading.value = true;
  error.value = null;
  apiData.value = null;

  try {
    const currentUser = user.value || (await userManager.getUser());

    if (!currentUser) {
      error.value = "Du bist nicht eingeloggt.";
      return;
    }

    const token = currentUser.access_token;

    const response = await fetch("http://localhost:3001/api/data", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API Fehler ${response.status}`);
    }

    apiData.value = await response.json();
  } catch (e) {
    console.error(e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="app-root">
    <div class="matrix-overlay" />
    <main class="shell">
      <header class="shell-header">
        <div>
          <h1>OAuth Security Lab</h1>
          <p class="subtitle">
            Authorization Code Flow · Keycloak · Vue · Express
          </p>
        </div>

        <div class="status-pill" :class="{ 'status-pill--online': user }">
          <span class="status-dot" />
          <span v-if="user"
            >Online – {{ user.profile.preferred_username }}</span
          >
          <span v-else>Offline – nicht eingeloggt</span>
        </div>
      </header>

      <section class="card">
        <div class="card-header">
          <h2>Authentication</h2>
          <span class="chip">
            <span class="chip-dot" />
            Keycloak · security-lab
          </span>
        </div>

        <p class="card-text">
          Melde dich via <span class="mono">Authorization Code Flow</span> an
          und erhalte ein <span class="mono">Access Token</span>, das deine
          Requests signiert.
        </p>

        <div class="button-row">
          <button v-if="!user" class="btn btn-primary" @click="doLogin">
            ▶ Login mit Keycloak
          </button>
          <button v-else class="btn btn-danger" @click="doLogout">
            ✖ Logout
          </button>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <h2>Geschützte Daten laden</h2>
          <span class="chip chip--secondary">GET /api/data</span>
        </div>

        <p class="card-text">
          Der Request wird mit
          <span class="mono">Authorization: Bearer &lt;token&gt;</span>
          an das Backend gesendet. Express prüft das JWT gegen die
          Keycloak-JWKS.
        </p>

        <div class="button-row">
          <button
            class="btn btn-outline"
            :disabled="loading"
            @click="callProtectedApi"
          >
            {{ loading ? "… Lädt" : "GET /api/data" }}
          </button>
        </div>

        <p v-if="error" class="error-text">
          ▲ Fehler: <span class="mono">{{ error }}</span>
        </p>

        <pre v-if="apiData" class="terminal">
<code>{{ JSON.stringify(apiData, null, 2) }}</code>
        </pre>
      </section>
    </main>
  </div>
</template>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  background: #0a0f0f; /* dein Dark Mode Hintergrund */
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

:root {
  color-scheme: dark;
}

.app-root {
  min-height: 100vh;
  margin: 0;
  padding: 0;
  background: radial-gradient(
    circle at top,
    #18252f 0,
    #05070b 55%,
    #020308 100%
  );
  color: #f5f7ff;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text",
    "Segoe UI", sans-serif;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.matrix-overlay {
  position: fixed;
  inset: 0;
  opacity: 0.1;
  pointer-events: none;
  background-image: linear-gradient(
      rgba(0, 255, 140, 0.12) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(0, 255, 140, 0.12) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at top, black, transparent 65%);
  z-index: 0;
}

.shell {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 900px;
  padding: 3rem 1.5rem 4rem;
}

@media (min-width: 768px) {
  .shell {
    padding: 3.5rem 2.5rem 4rem;
  }
}

.shell-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

h1::before {
  content: "◆";
  font-size: 0.9rem;
  color: #19ff92;
}

.subtitle {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #8ea1b4;
}

.card {
  background: radial-gradient(circle at top left, #17212b 0, #05070b 55%);
  border-radius: 16px;
  border: 1px solid rgba(0, 255, 140, 0.18);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.85);
  padding: 1.5rem 1.5rem 1.75rem;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.card h2 {
  font-size: 1.1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-text {
  font-size: 0.92rem;
  color: #b9c7d6;
  line-height: 1.5;
}

.button-row {
  margin-top: 1.25rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn {
  font-size: 0.9rem;
  border-radius: 999px;
  padding: 0.6rem 1.4rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease-out;
  background: transparent;
  color: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: default;
}

.btn-primary {
  background: linear-gradient(135deg, #19ff92, #36b38c);
  color: #020408;
  font-weight: 600;
  box-shadow: 0 0 20px rgba(25, 255, 146, 0.35);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 0 28px rgba(25, 255, 146, 0.55);
}

.btn-danger {
  background: linear-gradient(135deg, #ff4b6e, #b6243e);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 0 20px rgba(255, 75, 110, 0.35);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 0 28px rgba(255, 75, 110, 0.6);
}

.btn-outline {
  border-color: rgba(25, 255, 146, 0.6);
  color: #e6fff5;
  background: rgba(2, 8, 6, 0.7);
}

.btn-outline:hover:not(:disabled) {
  background: rgba(25, 255, 146, 0.14);
  box-shadow: 0 0 18px rgba(25, 255, 146, 0.4);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  font-size: 0.8rem;
  color: #b1bfd0;
  background: rgba(3, 8, 10, 0.85);
}

.status-pill--online {
  border-color: rgba(25, 255, 146, 0.6);
  color: #ccffe7;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #ff4b6e;
  box-shadow: 0 0 8px rgba(255, 75, 110, 0.6);
}

.status-pill--online .status-dot {
  background: #19ff92;
  box-shadow: 0 0 10px rgba(25, 255, 146, 0.9);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  background: rgba(4, 12, 16, 0.9);
  border: 1px solid rgba(142, 161, 180, 0.4);
  color: #d2e0f0;
}

.chip--secondary {
  border-color: rgba(25, 255, 146, 0.6);
  color: #c4ffe8;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #19ff92;
  box-shadow: 0 0 6px rgba(25, 255, 146, 0.8);
}

.mono {
  font-family: "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular,
    Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.86rem;
  color: #9afad1;
}

.terminal {
  margin-top: 1.3rem;
  border-radius: 12px;
  padding: 1rem 1.1rem;
  background: radial-gradient(circle at top left, #07150d 0, #020606 65%);
  border: 1px solid rgba(25, 255, 146, 0.4);
  color: #95ffce;
  font-size: 0.8rem;
  line-height: 1.45;
  max-height: 360px;
  overflow: auto;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.6);
}

.terminal code {
  font-family: "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular,
    Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.error-text {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #ff8fa3;
}
</style>
