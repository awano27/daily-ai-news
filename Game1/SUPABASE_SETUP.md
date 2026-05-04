# Supabase setup

This game can sync profile data to Supabase while keeping localStorage as an offline fallback.

## 1. Create the table

Open the Supabase SQL editor and run `supabase-schema.sql`.

The app stores one JSON profile store per browser/device:

- `device_id`: random ID generated in localStorage
- `store`: all child profiles, points, companion settings, reward flag, and streak data
- `updated_at`: last sync time

## 2. Configure the app

Edit `supabase-config.js`:

```js
window.MARUPPU_SUPABASE_CONFIG = {
  enabled: true,
  url: "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};
```

The anon key is designed to be public, but do not put service role keys in this file.

## 3. Safety note

This version does not add login. For a child-facing app, ask users to use nicknames instead of real names.

The app continues to work offline. If Supabase is unavailable, it saves to localStorage and shows `local fallback`.
