# PRISM — LGBTQ+ Friendly Profile Discovery Platform

> *"Find Your People. Discover. Connect. Be Yourself."*

PRISM is a modern, mobile-first, full-stack web application designed for discovering and connecting with genuine people through public community profiles, guest exploration, verified LGBTQ+ identity badges, granular contact privacy controls, and a comprehensive SaaS-style administration portal.

---

## 🌟 Key Features

### 1. Public & Guest Experience
- **Continue as Guest**: Browse, search, filter, and view detailed public profiles without being forced to create an account.
- **Spectrum of Identity**: 10+ LGBTQ+ gender identities (*Non-binary, Trans woman, Trans man, Genderfluid, Genderqueer, Agender, Woman, Man, Other with custom input*), optional pronouns, and multi-select intentions (*Friendship, Dating, Relationship, Community, Networking, Chatting*).
- **Safe External Social Connections**: Direct WhatsApp chat triggers and Instagram links rendered only when the profile owner enables public visibility.
- **Zero Forced Swipes**: Discovery-focused UX: Discover → Search → View Profile → Connect.

### 2. 18+ Safety & User Controls
- **18+ DOB Verification**: Mandatory date of birth validation upon registration. Full birth dates are strictly private; only calculated age is ever shown publicly.
- **Symmetric Profile Blocking**: Blocking a profile removes both accounts from each other's discovery results.
- **Community Abuse Reporting**: Report spam, impersonation, harassment, or scams with direct moderation triage under 24 hours.
- **Instant Privacy Controls**: One-click toggling between Public and Hidden profile discovery, WhatsApp visibility, and Instagram visibility.
- **Account Self-Deletion**: Soft deletion with immediate removal from discovery.

### 3. Professional Admin SaaS Portal (`/admin`)
- **Real-Time Analytics & KPIs**: Dynamic PostgreSQL-backed dashboard with gender spectrum distribution charts, age brackets, and moderation reports pipeline.
- **Profile Moderation**: Search, filter, verify, feature on homepage, block, or delete profiles.
- **Direct Admin Profile Creator**: Create verified community profiles directly with `createdByAdmin: true`.
- **Abuse Reports Triage**: Review reports with resolution notes and direct disciplinary actions.
- **Role-Based Access Control (RBAC)**: `SUPER_ADMIN`, `ADMIN`, `MODERATOR`.
- **Full Audit Logging**: Complete chronological tracking of all administrative actions.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 / 19 + Vite + TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism and modern gradient design system
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **Data Fetching**: REST API client with JWT automatic refresh

### Backend
- **Runtime**: Node.js + Express + TypeScript
- **ORM & Database**: Prisma ORM + PostgreSQL 18
- **Authentication**: JWT (Access Token + Refresh Token) & bcrypt password hashing
- **Validation**: Zod schema validation on all endpoints
- **Security**: Helmet, CORS, Express Rate Limiting, input sanitization
- **Storage**: Dual-mode image handling (Cloudinary SDK + static local storage fallback)

---

## 📁 Monorepo Folder Structure

```
d:/tinder website
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma DB models, relations & indexes
│   │   └── seed.ts             # 20+ diverse LGBTQ+ profiles & demo accounts
│   ├── src/
│   │   ├── config/             # DB, Prisma, Cloudinary, and Env config
│   │   ├── controllers/        # Auth, Profile, Interaction, Admin controllers
│   │   ├── middleware/         # Auth, RBAC, Validation, Error handling, Multer
│   │   ├── routes/             # REST API endpoints
│   │   ├── utils/              # JWT, Password hashing, Response formatting
│   │   ├── validators/         # Zod schemas (18+ DOB, Profile, Reports)
│   │   ├── app.ts              # Express application setup
│   │   └── server.ts           # Server entrypoint
│   ├── .env                    # Database URL, JWT secrets, Cloudinary keys
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                # API client with token refresh
│   │   ├── components/         # Navbar, Footer, ProfileCard, ReportModal, BlockModal
│   │   ├── context/            # AuthContext provider
│   │   ├── pages/              # Home, Discover, ProfileDetail, Auth, Dashboard, Policies
│   │   │   └── admin/          # SaaS Dashboard, Profiles, Create, Reports, Users, Audit
│   │   ├── types/              # TypeScript models
│   │   ├── App.tsx             # Route architecture
│   │   ├── main.tsx            # Providers wrapper
│   │   └── index.css           # Glassmorphism, Tailwind utilities
│   ├── index.html              # SEO tags and Google fonts
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Database & Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```
Backend runs at `http://localhost:5000` with health check at `http://localhost:5000/api/health`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🔑 Demo & Test Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@prism.app` | `AdminPass123!` | Complete system & user management (`/admin`) |
| **Moderator** | `moderator@prism.app` | `ModPass123!` | Reports triage & profile verification (`/admin`) |
| **Regular User** | `alex@prism.app` | `UserPass123!` | Profile management & favorites (`/dashboard`) |
| **Guest User** | *None required* | *None required* | Free browsing & search (`/discover`) |
