# Vercel + Supabase setup

This game can run as a static PWA on Vercel and sync profile data to Supabase.
If Supabase is not configured or is offline, the game keeps using localStorage.

## 1. Supabase

1. Create a Supabase project.
2. Open Authentication > Sign In / Providers and enable Anonymous sign-ins.
3. Open the SQL editor and run `supabase-schema.sql`.

The table stores one JSON profile store per authenticated Supabase user:

- `user_id`: Supabase Auth user ID from anonymous sign-in
- `device_id`: local device ID for debugging and migration support
- `store`: child profiles, points, streaks, reward flag, map progress, and spirit growth
- `updated_at`: last sync time

Only the signed-in user can read or update their own row through Row Level Security.

## 2. Vercel

Deploy the `Game1` directory to Vercel.

Add these Environment Variables in Vercel:

```txt
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

`/api/runtime-config` exposes only the public Supabase URL and anon key to the browser.
Never use a Supabase service role key in Vercel client-facing configuration.

## 3. Local development

Run without Supabase:

```bash
npm run dev
```

Run with Supabase:

```bash
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY npm run dev
```

PowerShell:

```powershell
$env:SUPABASE_URL='https://YOUR_PROJECT_ID.supabase.co'
$env:SUPABASE_ANON_KEY='YOUR_SUPABASE_ANON_KEY'
npm run dev
```

The app first tries Supabase anonymous auth. If it cannot connect, it shows this-device saving and keeps the game playable.
