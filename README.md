# LUMEN — Proactive Local Voice AI Showcase Webpage

This is a premium, high-visual, dynamic landing page and mock-terminal sandbox for **LUMEN (FRIDAY Core Engine)**, built using **Next.js** and styled with a custom vanilla CSS glassmorphism design system. It contains both a responsive frontend dashboard and simulated backend API endpoints to demonstrate local voice assistant mechanics, active automation pipelines, and core skill dispatcher routines.

## Features Included
- **Dynamic AI Orb core**: Responsive glowing core which updates statuses dynamically (`STANDBY`, `AWAKE`, `PROCESSING`).
- **Interactive Voice wave visualizer**: Pulsating organic audio waveforms activated during simulated audio streams.
- **Interactive Terminal Sandbox**: Execute commands (like `status`, `screenshot`, `volume 80`, `remember info`) and view outputs mimicking Friday's actual Python code handlers.
- **Hardware telemetry logs**: Displays live fluctuating CPU/RAM usage and SQLite databases sizes.
- **Filterable skill matrix registry**: Explores 12 core Python scripts (like screen read, whatsapp send, and weather queries) categorised by service layers.

---

## Local Setup & Development

To run this project on your local machine, make sure you have [Node.js](https://nodejs.org/) installed:

1. **Navigate into the directory**:
   ```bash
   cd lumen-showcase
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Run the local development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Backend API Structure
The app utilizes Next.js Pages API routes located under `/pages/api`:
- **`/api/info`**: Serves static metadata about the assistant, system diagnostics schema, capabilities grid, and active skills list.
- **`/api/action`**: Simulates the natural language parser logic from `assistant.py` (processes command strings, matches keywords to mock skill actions, and returns state shifts).

---

## Deploying to Vercel

This project is configured out-of-the-box for seamless deployments on Vercel:

### Option A: Using Vercel CLI (Quickest)
1. In this project directory, run the Vercel builder using `npx`:
   ```bash
   npx vercel
   ```
2. Follow the login prompts (if not logged in) and confirm the default setup options.
3. Once the preview build completes, run the following to deploy to production:
   ```bash
   npx vercel --prod
   ```

### Option B: Import to GitHub & Connect dashboard
1. Initialize a git repository inside the folder, add your files, and push to a new GitHub repository:
   ```bash
   git init
   ```
2. Log into the [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **Add New** > **Project** and select your newly created GitHub repository.
4. Click **Deploy**. Vercel will automatically detect Next.js settings, build, and deploy the application.
