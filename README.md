# WorkRush — Telegram Tap Game Starter Kit

A sellable Telegram Mini App / browser tap-game template.

Core loop:

> Work tap → earn WRK coins → spend energy → upgrade skills → level up → leaderboard → admin grants.

## Stack

- Vite
- Vanilla JavaScript
- Supabase RPC + PostgreSQL
- GitHub Pages deployment
- Telegram WebApp shell support
- Browser demo mode without Telegram/Supabase

## File tree

```txt
telegram-tap-game-starter/
├─ .github/workflows/deploy.yml
├─ supabase/schema.sql
├─ src/
│  ├─ game/economy.js
│  ├─ lib/config.js
│  ├─ lib/format.js
│  ├─ lib/storage.js
│  ├─ lib/supabase.js
│  ├─ lib/telegram.js
│  ├─ services/gameApi.js
│  ├─ app.js
│  ├─ main.js
│  └─ styles.css
├─ .env.example
├─ .gitignore
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md
```

## 1. Local start

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```txt
http://localhost:5173
```

Without Supabase keys the app runs in local browser demo mode.

## 2. Create Supabase backend

1. Create a Supabase project.
2. Open **SQL Editor**.
3. Paste the full content of `supabase/schema.sql`.
4. Run it.
5. Go to **Project Settings → API**.
6. Copy:
   - Project URL
   - anon public key

Put them into `.env`:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_APP_NAME=WorkRush
```

Restart dev server:

```bash
npm run dev
```

## 3. Important Supabase note

The SQL blocks direct public table writes and exposes game actions via RPC functions.

This is enough for a demo/sellable MVP, but production Telegram auth should validate `initData` server-side before trusting Telegram user IDs.

## 4. Admin panel

Default admin PIN after SQL install:

```txt
1234
```

Change it before showing clients:

```sql
update public.admin_settings
set value = '"YOUR_NEW_PIN"'::jsonb
where key = 'admin_pin';
```

Admin tools included:

- grant coins by Telegram ID
- reset player by Telegram ID

## 5. GitHub Pages deploy

1. Push this repo to GitHub.
2. Go to repository **Settings → Secrets and variables → Actions**.
3. Add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Add repository variable:
   - `VITE_APP_NAME` = `WorkRush`
5. Go to **Settings → Pages**.
6. Source: **GitHub Actions**.
7. Push to `main`.

The workflow builds the Vite app and deploys `dist` to Pages.

## 6. Telegram setup

1. Create bot via BotFather.
2. Create a Mini App / Web App from BotFather.
3. Use your GitHub Pages URL as the app URL.
4. Open the app from Telegram.

Browser mode still works for testing and client demos.

## 7. What to record for sales video

Recommended 45-second demo:

1. Open app.
2. Tap Work several times.
3. Show energy drain.
4. Buy Power upgrade.
5. Claim daily bonus.
6. Show leaderboard.
7. Show admin grant coins.
8. Say: “Source ZIP $299, setup $499, custom branding from $800.”

## 8. Suggested sales packages

| Package | Price |
|---|---:|
| Source ZIP | $299 |
| Source ZIP + setup | $499 |
| Custom branding | $800–1500 |
| Full adaptation | $2000+ |

## 9. Production upgrades to sell as add-ons

- Real Telegram initData verification through Supabase Edge Function
- Referral system
- Task wall / missions
- Skins shop
- Telegram channel subscription checks
- Payments / Stars integration
- Anti-cheat rate limits
- Admin dashboard with real auth
- Multilingual UI
