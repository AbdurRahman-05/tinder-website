# PRISM — Production Deployment Guide

This guide provides step-by-step instructions to deploy PRISM to production.

---

## Architecture Overview

PRISM consists of 4 components:
1. **Managed PostgreSQL Database** (Stores users, profiles, categories, blocks, reports, and audit logs)
2. **Backend Node.js/Express API** (`/backend`)
3. **Frontend React SPA** (`/frontend`)
4. **Cloudinary CDN** (For profile photos and image optimization)

---

## 🚀 Option 1: Modern Cloud Deployment (Recommended & Free-Tier Friendly)

This is the fastest, most cost-effective method (zero server maintenance required).

- **Database**: [Supabase](https://supabase.com/) or [Neon.tech](https://neon.tech/) (Free PostgreSQL)
- **Backend**: [Render.com](https://render.com/) or [Railway.app](https://railway.app/)
- **Frontend**: [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/)
- **Media**: [Cloudinary](https://cloudinary.com/) (Free 25GB/mo tier)

---

### Step 1: Push Code to GitHub

Open a terminal in your project root (`d:\tinder website`):

```bash
git init
git add .
git commit -m "Initial commit of PRISM platform"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

### Step 2: Set Up Managed PostgreSQL Database (Neon / Supabase)

1. Sign up for free at **[Neon.tech](https://neon.tech/)** or **[Supabase.com](https://supabase.com/)**.
2. Create a new project named `prism-production`.
3. Copy your **Pooled Connection String** (format looks like):
   ```
   postgresql://username:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this URL for the backend environment variables.

---

### Step 3: Deploy Backend on Render

1. Sign in to **[Render.com](https://render.com/)**.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository.
4. Fill in the service details:
   - **Name**: `prism-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. In the **Environment Variables** section, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `DATABASE_URL`: *(Your PostgreSQL URL from Step 2)*
   - `JWT_SECRET`: *(Generate a secure 32+ character random string)*
   - `JWT_REFRESH_SECRET`: *(Generate another secure 32+ character random string)*
   - `FRONTEND_URL`: *(Leave blank for now, you will update it in Step 5)*
   - `CLOUDINARY_CLOUD_NAME`: *(From your Cloudinary dashboard)*
   - `CLOUDINARY_API_KEY`: *(From your Cloudinary dashboard)*
   - `CLOUDINARY_API_SECRET`: *(From your Cloudinary dashboard)*
6. Click **Create Web Service**.
7. Once deployed, Render will provide a public URL (e.g. `https://prism-api.onrender.com`).
8. Run migrations and database seeding remotely via the Render Shell tab:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

---

### Step 4: Deploy Frontend on Vercel

1. Sign in to **[Vercel.com](https://vercel.com/)**.
2. Click **Add New** → **Project**.
3. Import your GitHub repository.
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://prism-api.onrender.com/api` *(Your Render backend URL + /api)*
6. Click **Deploy**.
7. Vercel will build and assign your domain (e.g. `https://prism-app.vercel.app`).

---

### Step 5: Final Cross-Origin Link

1. Go back to your **Render.com** backend service dashboard.
2. Go to **Environment** tab.
3. Update `FRONTEND_URL` to your Vercel domain:
   ```
   FRONTEND_URL = https://prism-app.vercel.app
   ```
4. Render will automatically re-deploy with updated CORS headers.
5. Your platform is now live and fully operational!

---

## 🐳 Option 2: Single VPS / Cloud Server with Docker Compose

If you have an Ubuntu VPS (DigitalOcean Droplet, AWS EC2, Hetzner, Linode):

### 1. Install Docker & Docker Compose on Server
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose
sudo systemctl enable docker
sudo systemctl start docker
```

### 2. Clone Repository & Launch
```bash
git clone https://github.com/YOUR_USERNAME/prism-platform.git
cd prism-platform

# Edit passwords and credentials in docker-compose.yml or .env
nano docker-compose.yml

# Build and start all 3 services in the background
docker-compose up -d --build

# Run database schema push and seed inside the container
docker-compose exec backend npx prisma db push
docker-compose exec backend npx prisma db seed
```

### 3. Setup Domain & Free SSL with Nginx + Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Configure Nginx proxy to port 80 (frontend) and port 5000 (backend)
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## 🔒 Post-Deployment Security Checklist

- [ ] Change default admin password (`admin@prism.app` default: `AdminPass123!`) immediately after seeding.
- [ ] Ensure `NODE_ENV` is set to `production`.
- [ ] Confirm `JWT_SECRET` and `JWT_REFRESH_SECRET` are randomized, long, high-entropy secrets.
- [ ] Verify that SSL/HTTPS is enforced on both frontend and backend domains.
- [ ] Confirm CORS whitelist in `FRONTEND_URL` matches your actual production domain.
