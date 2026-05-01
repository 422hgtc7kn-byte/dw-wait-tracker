# 🏰 Disney World Wait Time Tracker

Live wait times, show schedules, favorites, alerts, and crowd trend charts for all 4 Walt Disney World parks.

---

## Deploy to Vercel — step by step

### 1. Create accounts (free)
- [github.com](https://github.com) — sign up
- [vercel.com](https://vercel.com) — sign up with your GitHub account

### 2. Upload this project to GitHub
1. Go to [github.com/new](https://github.com/new), name it `disney-wait-tracker`, click **Create repository**
2. In Terminal:
   ```
   cd path/to/disney-app
   git init && git add . && git commit -m "initial"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/disney-wait-tracker.git
   git push -u origin main
   ```

### 3. Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new), import `disney-wait-tracker`
2. Leave all settings default — Vercel auto-detects Vite
3. Click **Deploy** (~60 seconds)

### 4. Set up Vercel KV (for trend history)
This enables the app to store real wait time snapshots that improve the trend charts over time.

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database** → choose **KV** → name it `disney-waits` → click **Create**
3. On the KV database page, click **Connect to Project** and select your `disney-wait-tracker` project
4. Vercel automatically adds the required `KV_URL`, `KV_REST_API_URL`, and `KV_REST_API_TOKEN` environment variables
5. Go to your project **Settings → Environment Variables** and confirm they are there
6. Redeploy: go to **Deployments** tab → click the ⋯ menu on the latest deploy → **Redeploy**

> **Note:** The app works fine without KV set up — it just shows typical crowd patterns instead of real historical data. KV just makes the trend charts get smarter over time.

### 5. Add to iPhone home screen
1. Open your Vercel URL in **Safari** on your iPhone
2. Tap the **Share** button → **Add to Home Screen** → **Add**

Opens fullscreen like a native app. 🎉

---

## How trends work

- **Typical curves** (shown immediately): Research-based crowd patterns for Disney World, broken down by ride thrill level (Thrill / Moderate / Mild). Solid color = real data, translucent = estimated.
- **Real data** (builds over time): Every time the app refreshes, it saves the current wait time for each ride to Vercel KV, bucketed by hour-of-day. After a few visits across different times of day, bars start filling in with your actual observed data.
- **Best times**: ★ markers on the 3 lowest-wait hours of the day.

## Project structure

```
disney-app/
├── index.html              ← Entry point with iPhone PWA meta tags
├── package.json
├── vite.config.js
├── api/
│   ├── waittimes.js        ← Proxy for ThemeParks.wiki live data
│   └── history.js          ← Vercel KV read/write for trend snapshots
└── src/
    ├── main.jsx
    ├── App.jsx             ← Main app
    ├── TrendChart.jsx      ← SVG bar chart component
    └── trends.js           ← Typical crowd curves + merge logic
```
