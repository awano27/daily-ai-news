(function (global) {
  "use strict";

  const DEVICE_ID_KEY = "maruppu-device-id";
  const TABLE_NAME = "maruppu_profile_stores";
  let client = null;
  let authUser = null;
  let lastStatus = "local";
  let runtimeConfigPromise = null;

  function getDeviceId() {
    const stored = localStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;
    const generated = global.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  }

  function getConfig() {
    const config = global.MARUPPU_SUPABASE_CONFIG || {};
    const runtimeConfig = global.MARUPPU_RUNTIME_CONFIG?.supabase || {};
    const url = String(runtimeConfig.url || config.url || "");
    const anonKey = String(runtimeConfig.anonKey || config.anonKey || "");
    return {
      enabled: Boolean(runtimeConfig.enabled || config.enabled || (url && anonKey)),
      url,
      anonKey,
    };
  }

  async function loadRuntimeConfig() {
    if (runtimeConfigPromise) return runtimeConfigPromise;
    runtimeConfigPromise = fetch("./api/runtime-config", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.supabase) {
          global.MARUPPU_RUNTIME_CONFIG = { supabase: data.supabase };
        }
        return getConfig();
      })
      .catch(() => getConfig());
    return runtimeConfigPromise;
  }

  function isConfigured() {
    const config = getConfig();
    return config.enabled && config.url.startsWith("https://") && config.anonKey.length > 20 && Boolean(global.supabase?.createClient);
  }

  function getClient() {
    if (client) return client;
    if (!isConfigured()) {
      lastStatus = "local";
      return null;
    }
    const config = getConfig();
    client = global.supabase.createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "maruppu-supabase-auth",
      },
    });
    return client;
  }

  async function init() {
    await loadRuntimeConfig();
    if (!isConfigured()) {
      lastStatus = "local";
      return false;
    }
    return Boolean(getClient());
  }

  async function ensureAuth() {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    const sessionResult = await supabaseClient.auth.getSession();
    if (sessionResult.data?.session?.user) {
      authUser = sessionResult.data.session.user;
      return authUser;
    }
    const { data, error } = await supabaseClient.auth.signInAnonymously();
    if (error) {
      console.warn("Supabase anonymous sign-in failed. Falling back to localStorage.", error);
      lastStatus = "error";
      return null;
    }
    authUser = data?.user || data?.session?.user || null;
    return authUser;
  }

  async function loadProfileStore() {
    await init();
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    const user = await ensureAuth();
    if (!user) return null;
    lastStatus = "loading";
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select("store")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) {
      console.warn("Supabase load failed. Falling back to localStorage.", error);
      lastStatus = "error";
      return null;
    }
    lastStatus = data?.store ? "synced" : "empty";
    return data?.store || null;
  }

  async function saveProfileStore(store) {
    await init();
    const supabaseClient = getClient();
    if (!supabaseClient) return false;
    const user = await ensureAuth();
    if (!user) return false;
    lastStatus = "saving";
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .upsert({
        user_id: user.id,
        device_id: getDeviceId(),
        store,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
    if (error) {
      console.warn("Supabase save failed. Data remains in localStorage.", error);
      lastStatus = "error";
      return false;
    }
    lastStatus = "synced";
    return true;
  }

  global.MaruppuCloudStore = {
    getDeviceId,
    init,
    isConfigured,
    loadProfileStore,
    saveProfileStore,
    userId: () => authUser?.id || "",
    status: () => lastStatus,
  };
})(window);
