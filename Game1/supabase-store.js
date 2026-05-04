(function (global) {
  "use strict";

  const DEVICE_ID_KEY = "maruppu-device-id";
  const TABLE_NAME = "maruppu_profile_stores";
  let client = null;
  let lastStatus = "local";

  function getDeviceId() {
    const stored = localStorage.getItem(DEVICE_ID_KEY);
    if (stored) return stored;
    const generated = global.crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(DEVICE_ID_KEY, generated);
    return generated;
  }

  function getConfig() {
    const config = global.MARUPPU_SUPABASE_CONFIG || {};
    return {
      enabled: Boolean(config.enabled),
      url: String(config.url || ""),
      anonKey: String(config.anonKey || ""),
    };
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
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return client;
  }

  async function loadProfileStore() {
    const supabaseClient = getClient();
    if (!supabaseClient) return null;
    lastStatus = "loading";
    const { data, error } = await supabaseClient
      .from(TABLE_NAME)
      .select("store")
      .eq("device_id", getDeviceId())
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
    const supabaseClient = getClient();
    if (!supabaseClient) return false;
    lastStatus = "saving";
    const { error } = await supabaseClient
      .from(TABLE_NAME)
      .upsert({
        device_id: getDeviceId(),
        store,
        updated_at: new Date().toISOString(),
      }, { onConflict: "device_id" });
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
    isConfigured,
    loadProfileStore,
    saveProfileStore,
    status: () => lastStatus,
  };
})(window);
