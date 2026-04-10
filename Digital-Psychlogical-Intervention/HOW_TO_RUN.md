# 🚀 How to Run the Mental Health Support Platform

Complete step-by-step guide to run the project from scratch.

---

## 📋 Prerequisites

- ✅ Node.js (v16+) — `node --version`
- ✅ MongoDB (v5+) — `mongod --version`
- ✅ npm — `npm --version`

---

## Step 1: Start MongoDB

**Windows:**
```bash
mongod --dbpath "C:\data\db"
```

**macOS/Linux:**
```bash
sudo systemctl start mongod
```

Verify with `mongosh` — if you see the MongoDB shell, it's running.

---

## Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Windows: copy .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-platform
OPENAI_API_KEY=your-openai-api-key-optional
FRONTEND_URL=http://localhost:5173
```

---

## Step 3: Seed the Database

Run the single unified seed command — this establishes a pristine database state containing the default college Admin user, GAD-7 / PHQ-9 analytical structures, and precisely maps 34 tagged psychological resources to the database.

```bash
cd backend
node seed.js
```

Expected output:
```
✅ Database connected and cleared
✅ Default admin created
✅ Assessments created (PHQ-9, GAD-7)
✅ Priority Resources successfully populated (34 count)
```

---

## Step 4: Start Backend
```bash
npm run dev
```

Expected:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

Keep this terminal open.

---

## Step 5: Frontend Setup

Open a **new terminal:**
```bash
cd frontend
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Step 6: Start Frontend
```bash
npm run dev
```

Expected:
```
➜  Local:   http://localhost:5173/
```

Keep this terminal open.

---

## Step 7: Access the App

Open: **http://localhost:5173**

Login as admin:
- Email: `admin@default.com`
- Password: `admin123`

---

## Step 8: Test the AI Assessment Features

1. Register or log in as a **student** account
2. Click **Assessment** in the navbar
3. Complete the PHQ-9 or GAD-7 screening
4. Navigate over to the **Resources** hub
5. The resource grid will automatically bump articles tagged with your highest screening severities straight to the top labeled as "Recommended".

---

## 🔄 Restarting

1. Press `Ctrl+C` in both terminals
2. Restart MongoDB if stopped
3. `cd backend && npm run dev`
4. `cd frontend && npm run dev`

You do **not** need to re-run the `seed.js` script unless you intentionally uninstalled/dropped your database arrays and need to refresh everything back to defaults.

---

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection error | Ensure MongoDB is running, check `MONGODB_URI` |
| Port 5000 in use | Change `PORT` in backend `.env` |
| Module not found | Run `npm install` again |
| Network Error in frontend | Check `VITE_API_URL`, verify backend is running |
| 401 Unauthorized | Token expired — logout and login again |
| Assessment not loading | Run `node seed.js` to ensure PHQ-9 / GAD-7 structural data exists |
| AI Tip isn't personalized | Ensure `OPENAI_API_KEY` is present in backend `.env` |
