# 🏰 Disney World Wait Time Tracker

A live wait time tracker for all 4 Walt Disney World parks, deployable as an iPhone home screen web app.

---

## Deploy to Vercel (free) — step by step

### 1. Create accounts (free)
- [github.com](https://github.com) — sign up
- [vercel.com](https://vercel.com) — sign up with your GitHub account

### 2. Upload this project to GitHub
1. Go to [github.com/new](https://github.com/new)
2. Name it `disney-wait-tracker`, keep it public, click **Create repository**
3. On your computer, open Terminal and run:
   ```
   cd path/to/disney-app
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/disney-wait-tracker.git
   git push -u origin main
   ```

### 3. Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your `disney-wait-tracker` repo
3. Leave all settings as default — Vercel auto-detects Vite
4. Click **Deploy**
5. In ~60 seconds you'll get a URL like `disney-wait-tracker.vercel.app`

### 4. Add to iPhone home screen
1. Open your Vercel URL in **Safari** on your iPhone
2. Tap the **Share** button (box with arrow at the bottom)
3. Tap **Add to Home Screen**
4. Tap **Add**

It will open fullscreen with no browser chrome, just like a native app. 🎉

---

## Project structure

```
disney-app/
├── index.html          ← Entry point with iPhone PWA meta tags
├── package.json        ← Dependencies (React + Vite)
├── vite.config.js      ← Build config
├── api/
│   └── waittimes.js    ← Vercel serverless proxy for ThemeParks.wiki
└── src/
    ├── main.jsx        ← React entry
    └── App.jsx         ← Main app
```

## How it works

- **Data source:** [ThemeParks.wiki](https://themeparks.wiki) free API — no key required
- **Proxy:** `api/waittimes.js` runs as a Vercel serverless function, fetching from ThemeParks.wiki server-side (avoids browser CORS restrictions)
- **Parks covered:** Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom
