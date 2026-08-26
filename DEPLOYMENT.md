# 🚀 Cloud Deployment Guide (Render + Vercel)

This guide walks you through deploying the **Support Ticket & SLA Tracker** live to the cloud:
- **Backend + PostgreSQL Database**: Deployed on **[Render.com](https://render.com/)**
- **Frontend SPA**: Deployed on **[Vercel.com](https://vercel.com/)**

---

## 🛠️ Step 1: Deploy Backend & PostgreSQL on Render

### Option A: Using Render Blueprints (`render.yaml` - Recommended)
1. Push your repository to GitHub.
2. Go to your **[Render Dashboard](https://dashboard.render.com/)**.
3. Click **"New +"** $\to$ Select **"Blueprint"**.
4. Connect your GitHub repository `Support-Ticket-SLA-Service-Level-Agreement-Tracker`.
5. Render will automatically detect `render.yaml` and provision:
   - 🐘 **PostgreSQL Database** (`burdenoff-db`)
   - ⚡ **Web Service** (`burdenoff-backend`)
6. Click **"Apply"** and wait for deployment to finish.
7. Once deployed, note your backend URL (e.g. `https://burdenoff-backend.onrender.com`).

---

### Option B: Manual Setup on Render

#### 1. Create PostgreSQL Database
1. In Render Dashboard, click **"New +"** $\to$ **"PostgreSQL"**.
2. Name: `burdenoff-db` $\to$ Database: `burdenoff` $\to$ Plan: **Free**.
3. Click **"Create Database"** and copy the **Internal Database URL** (or External Database URL).

#### 2. Create Web Service for Backend
1. In Render Dashboard, click **"New +"** $\to$ **"Web Service"**.
2. Connect your GitHub repository.
3. Configure settings:
   - **Name**: `burdenoff-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node` (or `Bun`)
   - **Build Command**: `npm install --include=dev && npm run build` (or `bun install && bun run build`)
   - **Start Command**: `npm start` (or `node dist/server.js`)
4. Add **Environment Variables**:
   - `DATABASE_URL`: *(paste the PostgreSQL connection string from step 1)*
   - `JWT_SECRET`: `super-secret-jwt-key-burdenoff-support-tracker-2026`
   - `BUSINESS_TIMEZONE`: `Asia/Kolkata`
   - `CORS_ORIGIN`: `*`
   - `NODE_ENV`: `production`
5. Click **"Deploy Web Service"**.

#### 3. Seed Database (One-time)
Once the service is active, open the **Render Shell** tab and run:
```bash
bun run prisma/seed.ts
```
*(or `npm run prisma:seed`)*

---

## 🌐 Step 2: Deploy Frontend on Vercel

1. Go to your **[Vercel Dashboard](https://vercel.com/)**.
2. Click **"Add New..."** $\to$ Select **"Project"**.
3. Import your GitHub repository `Support-Ticket-SLA-Service-Level-Agreement-Tracker`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* $\to$ Select `frontend`
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
5. Add **Environment Variable**:
   - Key: `VITE_GRAPHQL_ENDPOINT`
   - Value: `https://burdenoff-backend.onrender.com/graphql` *(replace with your actual Render backend URL)*
6. Click **"Deploy"**.

---

## ✅ Step 3: Verification & Live Testing

1. Open your Vercel deployment URL (e.g. `https://burdenoff-tracker.vercel.app`).
2. On the Starting Page, click **"Enter as Agent"** or **"Enter as Reporter"**.
3. You will be authenticated against the live Render GraphQL Yoga backend and the ticket dashboard will load live!
