# 🔧 Setup Guide

Detailed setup reference for developers picking up this project.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Server port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `OPENAI_API_KEY` | No | OpenAI key for contextual tips & chatbot (mock used if absent) |
| `FRONTEND_URL` | Yes | Frontend URL for CORS (default: http://localhost:5173) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL (default: http://localhost:5000/api) |

---

## Database Seeding

Only one unified command is structurally required per instance:
```bash
cd backend
node seed.js
```

This intelligent drop-in script:
1. Verifies/Creates the `DEFAULT` college architecture.
2. Registers/Updates the default Admin payload.
3. Implants PHQ-9 & GAD-7 testing frameworks.
4. Generates all 34 Smart Tags matched Resources mapping precisely to severity algorithms.

**Default admin credentials after seeding:**
- Email: `admin@default.com`
- Password: `admin123`

---

## Key Architectural Decisions

### ES Modules
The entire backend uses native ES module syntax. All controllers, schema models, and server routing files use standard `import`/`export` terminology. CommonJS (`require`) throws structural incompatibility errors.

### Smart Tag Sorting Algorithm 
When users query `/api/resources?ranked=true`, the `resourceController` silently queries the student's highest clinical symptoms recorded inside `UserResult`. Utilizing mapping constants like `SEVERITY_TAG_MAP`, the database manipulates the API return array so materials with matching target tags dynamically shift to index `0` of the presentation grid. 

### Multi-Tenancy Architecture
Every piece of data strictly isolates behind a static `collegeId`. The `/middleware/auth.js` intercepts all `bearer tokens` establishing standard isolation context: `req.user.collegeId` which binds the tenant safely across the rest of the application ecosystem.

### Auth Middleware Payload
The `authenticate` block structurally attaches the following payload:
```js
req.user = { userId, email, role, collegeId }
```

### Aesthetic System
The entire MERN ecosystem adheres precisely to a light-themed Tailwind CSS Glassmorphic paradigm: gradients from indigo to pink (`bg-gradient-to-br from-indigo-50...`), rounded translucent borders (`border-white/50 bg-white/60`), deep interactive hovering logic (`hover:-translate-y-2`) and heavy utilization of `.backdrop-blur-xl`. Custom inline constants were eradicated.

---

## Role Permissions

| Feature | Student | Counselor | Admin |
|---------|---------|-----------|-------|
| Assessment Pipeline | ✅ | ❌ | ❌ |
| AI Smart Resources | ✅ (Dynamic) | ❌ | ✅ (Static Editor) |
| Community Hub | ✅ | ❌ | ✅ (Moderate) |
| OpenAI Chatbot Support | ✅ | ❌ | ❌ |
| Telehealth Bookings | ✅ (Book) | ✅ (Manage) | ❌ |
| Dashboard Routing | ❌ | ❌ | ✅ |

---

## Project Phase Tracker

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Standalone assessment module |
| Phase 2 | ✅ Complete | Integration into main platform |
| Phase 3 | ✅ Complete | Interactive chronological Results screen |
| Phase 4 | ✅ Complete | Dual-testing parameters (GAD-7) |
| Phase 5 | ✅ Complete | Architecture polish & bug mitigation |
| Phase 6 | ✅ Complete | AI Smart Hub, Curated Feeds & Aesthetic Transformation |
