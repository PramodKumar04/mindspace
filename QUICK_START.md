# 🚀 Quick Start Guide

Get the Mental Health Support Platform running in minutes.

## Prerequisites

- ✅ Node.js (v16+)
- ✅ MongoDB installed and running
- ✅ Terminal / Command Prompt

---

## Setup Steps

### 1️⃣ Install Dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2️⃣ Configure Environment Variables

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-platform
OPENAI_API_KEY=your-openai-key-optional
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

### 3️⃣ Start MongoDB

**Windows:** Open Services → Start MongoDB, or run `mongod --dbpath "C:\data\db"`

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

### 4️⃣ Seed Database
```bash
cd backend
node seed.js  
```
*Note: This single script creates the default college, default admin user, generates the PHQ-9 and GAD-7 questionnaires, cleans out outdated data, and seeds the 34 smart psychological resources.*

**Default admin credentials:**
- Email: `admin@default.com`
- Password: `admin123`
- ⚠️ Change this after first login!

### 5️⃣ Start Backend
```bash
cd backend
npm run dev
```

Expected: `🚀 Server running on port 5000` — keep this terminal open.

### 6️⃣ Start Frontend

Open a **new terminal:**
```bash
cd frontend
npm run dev
```

Expected: `➜ Local: http://localhost:5173/` — keep this terminal open.

### 7️⃣ Open the App
```
http://localhost:5173
```

---

## ✅ Verification Checklist

- [ ] MongoDB running
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can log in with admin credentials
- [ ] Health check: http://localhost:5000/api/health
- [ ] Assessment loads at http://localhost:5173/assessment (log in as student first)
- [ ] Resources feed renders at `/resources`

---

## 🐛 Quick Fixes

| Problem | Fix |
|---------|-----|
| MongoDB connection error | Ensure MongoDB is running, check `MONGODB_URI` |
| Port already in use | Change `PORT` in backend `.env` |
| Resources show empty tags | Make sure you ran `node seed.js` completely. |
| Seeding fails | Check MongoDB connection, drop DB if conflicting data |
| Frontend can't reach backend | Check `VITE_API_URL`, verify backend is running |

---

## 📝 Default Credentials

- **Email:** admin@default.com
- **Password:** admin123
- **College:** Default College (DEFAULT)
