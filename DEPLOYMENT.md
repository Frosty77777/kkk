# Deployment Guide - Render

This project uses **single-service deployment**: the Express backend serves both the API and the static frontend (HTML/CSS/JS). Everything deploys to Render as one web service.

---

## 1. Prerequisites

- [GitHub](https://github.com) account
- [Render](https://render.com) account (free tier available)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster with your data

---

## 2. Prepare MongoDB Atlas

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Go to **Network Access** → **Add IP Address**
3. Add **`0.0.0.0/0`** (allows connections from anywhere — required for Render's dynamic IPs)
4. Go to **Database** → **Connect** → **Drivers** and copy your connection string
5. Replace `<password>` with your database user password

---

## 3. Deploy to Render

### Option A: Using render.yaml (recommended)

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create the web service
5. In the service **Environment** tab, add:
   - **MONGODB_URI** — your Atlas connection string
   - **SESSION_SECRET** — (auto-generated if using Blueprint, or create one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

### Option B: Manual setup

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Web Service**
3. Connect your repository
4. Configure:
   - **Name:** `web2assign2` (or any name)
   - **Region:** Choose nearest to you
   - **Root Directory:** (leave blank — use repo root)
   - **Runtime:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`

5. Click **Advanced** → **Add Environment Variable**:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `SESSION_SECRET` = a long random string (e.g. from `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

6. Click **Create Web Service**

---

## 4. Environment Variables Summary

| Variable       | Required | Description                                      |
|----------------|----------|--------------------------------------------------|
| `MONGODB_URI`  | Yes      | MongoDB Atlas connection string                  |
| `SESSION_SECRET` | Yes    | Secret for session cookies (use a random string) |
| `NODE_ENV`     | No       | Set to `production` on Render                    |
| `PORT`         | No       | Render sets this automatically                   |

---

## 5. After Deployment

- Your app will be live at `https://your-service-name.onrender.com`
- The first deploy may take a few minutes
- Free tier services spin down after inactivity; the first request may take ~30 seconds to wake up

---

## 6. Notes

- **File uploads:** The `public/uploads` folder is ephemeral on Render. Uploaded images may be lost on redeploy. For production, consider cloud storage (e.g. Cloudinary, AWS S3).
- **CORS:** The app uses `origin: true`, which accepts requests from any origin. For stricter security, set a specific origin in production.
