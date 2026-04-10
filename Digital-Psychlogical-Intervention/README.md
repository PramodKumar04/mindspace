# Mental Health Support Platform

A production-ready multi-tenant Mental Health Support Platform built with the MERN stack. This platform provides stigma-free mental health tracking, personalized resources, community support, AI-powered chatbot assistance, and counseling booking services for multiple colleges.

Featuring a modern **Tailwind frosted-glass (glassmorphism)** aesthetic, the platform abstracts rigid clinical exams into a warm, user-friendly experience while maintaining rigorous backend safety protocols.

## 🚀 Features

### Core Features
- **Stigma-Free Onboarding & Check-Ins**: A progressive-disclosure wellness wizard that feels conversational but accurately maps to clinical PHQ-9, GAD-7, and PSS scales under the hood.
- **Interactive Progress Dashboard**: Visualized wellbeing trends using `recharts` area graphs, translating raw clinical scores into friendly, color-coded health labels.
- **Multi-Tenant Architecture**: College-based data isolation
- **Role-Based Access Control**: Tailored dashboards for Student, Counselor, and Admin roles
- **Authentication**: Secure bcrypt-backed password authentication with server-side session tokens
- **Smart Resource Hub**: AI-driven media recommendations dynamically sorted based on the user's latest check-in severities (powered by OpenAI). Features interactive, animated Breathing and Grounding exercise widgets. Counselors and Admins share a dedicated, grid-based Resource Management Hub.
- **Community Forum**: Anonymous posting, nested comment threads (up to depth 3) with `@mentions`, and moderation.
- **AI Chatbot**: **Gemini-powered** mental health support utilizing structured JSON responses, real-time risk detection, session intensity tracking, and interactive therapeutic widgets rendered directly in the chat.
- **Counseling Booking**: Schedule and manage counseling sessions
- **Actionable Admin Dashboard**: Native tools to "Force Delete" flagged posts, dismiss false reports, and mark high-risk AI chat sessions as "Resolved" after intervention.
- **Stability & Polish**: React Error Boundaries, Disclaimer Consent Modals, Mobile-responsive UI, and robust `prefers-reduced-motion` accessibility support.

### Security & Safety Features
- **Automated Crisis Safety Triggers**: Backend isolates self-harm indicators (e.g., PHQ-9 Q9) and automatically flags `needsIntervention` to alert Counselors/Admins. Chatbot sessions automatically deploy a pulsing `CrisisInterventionBanner` when acute risk is detected.
- Password hashing with bcrypt
- Opaque session token authentication with server-side expiry
- Multi-tenant data isolation with strict enforcement
- Input validation and sanitization (express-validator)
- Rate limiting on all endpoints (helmet, express-rate-limit)
- Request logging (morgan)
- Atomic booking operations (MongoDB transactions)
- First-user auto admin assignment

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn
- **Gemini API key** (Optional but recommended - platform falls back to mock JSON responses if not provided)
- **OpenAI API key** (Optional - strictly used for dynamic resource tips)

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mental-health-platform
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash
OPENAI_API_KEY=your-openai-api-key-here
FRONTEND_URL=http://localhost:5173
```

5. Start MongoDB (if not running):
```bash
# On macOS/Linux
mongod

# On Windows
# Start MongoDB service from Services panel or use MongoDB Compass
```

6. **Seed the database**:
```bash
node seed.js
```
*Note: This script creates the default college, default admin user, and seeds 35 expertly curated mental health resources tagged for the AI hub. (Clinical questionnaires are no longer seeded as they are handled dynamically on the frontend).*

**Default Admin Credentials:**
- Email: `admin@default.com`
- Password: `admin123`
- ⚠️ **Change this password after first login!**

7. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (Note: `--legacy-peer-deps` is required to safely bypass Vite/React strict versioning for the charting libraries):
```bash
npm install
npm install recharts react-is --legacy-peer-deps
```

3. Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

4. Update the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🗄️ Database Setup

The database is automatically provisioned and securely populated when you run `node seed.js`. This creates:
- A default college (code: DEFAULT)
- A default admin user (email: admin@default.com, password: admin123)
- 20+ Highly Curated clinical articles, videos, and crisis lines tagged for AI integration.

**No manual database editing required!**

### First-User Auto Admin Logic

If you do not run the seed script, the first user to register will automatically become an admin. However, failing to run the seed script means you will not have any clinical resources available. It is highly recommended to run `node seed.js`.

### Creating Additional Colleges

After logging in as admin:
1. Go to Admin Panel
2. Use the API endpoint: `POST /api/colleges` (requires admin role)
3. Or use MongoDB Compass/Shell if preferred

## 📁 Project Structure

```text
mental-health-platform/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── assessmentController.js
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── chatController.js
│   │   ├── collegeController.js
│   │   ├── commentController.js
│   │   ├── postController.js
│   │   └── resourceController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── roleCheck.js
│   ├── models/
│   │   ├── Booking.js
│   │   ├── ChatSession.js (Includes sessionIntensity & tool tracking)
│   │   ├── College.js
│   │   ├── Comment.js (Supports parentCommentId & mentions)
│   │   ├── Message.js
│   │   ├── Post.js
│   │   ├── Report.js
│   │   ├── Resource.js
│   │   ├── User.js (Includes needsIntervention and onboarding flags)
│   │   └── UserResult.js (Supports granular sub-scores)
│   ├── routes/
│   │   ├── admin.js
│   │   ├── assessments.js
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   ├── chat.js
│   │   ├── colleges.js
│   │   ├── posts.js
│   │   └── resources.js
│   ├── services/
│   │   ├── aiService.js (Gemini JSON integration & OpenAI fallback)
│   │   └── riskDetection.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CrisisInterventionBanner.jsx
│   │   │   ├── DisclaimerModal.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── ExerciseWidgets.jsx
│   │   │   ├── ManageResources.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── constants/
│   │   │   └── crisisLines.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── data/
│   │   │   └── onboardingFlow.js
│   │   ├── pages/
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Bookings.jsx
│   │   │   ├── Chatbot.jsx
│   │   │   ├── CheckIn.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Progress.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Resources.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Colleges
- `GET /api/colleges` - Get all colleges
- `GET /api/colleges/:id` - Get college by ID
- `POST /api/colleges` - Create college (Admin only)

### Resources
- `GET /api/resources` - Get all resources (filtered by college)
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create resource (Admin/Counselor only)
- `PUT /api/resources/:id` - Update resource (Admin/Counselor only)
- `DELETE /api/resources/:id` - Delete resource (Admin/Counselor only)

### Posts
- `GET /api/posts` - Get all posts (filtered by college)
- `GET /api/posts/:id` - Get post with nested comment tree
- `GET /api/posts/:id/mention-candidates` - Get list of users available to @mention
- `POST /api/posts` - Create post (Student only)
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/report` - Report post

### Comments
- `POST /api/posts/:postId/comments` - Create comment (supports `parentCommentId` and `mentions`)
- `DELETE /api/posts/comments/:id` - Delete comment

### Chat
- `GET /api/chat/session` - Get or create chat session (Student only)
- `POST /api/chat/message` - Send message to chatbot (Student only)
- `POST /api/chat/session/:sessionId/close` - Close session (Student only)
- `GET /api/chat/history` - Get chat history (Student only)

### Assessments
- `POST /api/assessments/submit-flow` - Submit wellbeing check-in (calculates hidden clinical scores & safety triggers)
- `GET /api/assessments/results` - Get user's assessment history

### Bookings
- `POST /api/bookings/book` - Book counseling session (Student only)
- `GET /api/bookings/student` - Get student bookings
- `GET /api/bookings/counselor` - Get counselor bookings
- `POST /api/bookings/availability` - Set availability (Counselor only)
- `PUT /api/bookings/:bookingId/status` - Update booking status (Counselor only)

### Admin & Moderation
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:userId/status` - Update user status (Admin only)
- `GET /api/admin/posts/flagged` - Get flagged posts (Admin only)
- `PUT /api/admin/posts/:id/resolve` - Dismiss or delete flagged community content (Admin only)
- `GET /api/admin/chat/flagged` - Get flagged chat sessions (Admin only)
- `PUT /api/admin/chat/:sessionId/resolve` - Mark severe risk sessions as intervened/safe (Admin only)
- `GET /api/admin/stats` - Get dashboard statistics (Admin only)

## 🎯 Usage Guide

### For Students
1. **Onboarding:** Upon first login, complete the interactive Wellbeing Wizard to personalize your space.
2. **Dashboard:** View AI-recommended resources tailored to your specific stress and mood levels.
3. **Progress:** Visit the *My Progress* tab to view beautiful area charts tracking your mental health journey over time.
4. **Routine:** Take routine *Check-Ins* to update your stats and refresh your resource recommendations.
5. **Support:** Participate in the anonymous Community forum with threaded replies, use the Gemini AI Chatbot, or book a counseling session.

### For Counselors
1. Log in to access the dedicated Counselor Dashboard.
2. Manage student appointments via *Bookings & Schedule*.
3. Use the shared *Manage Resources* hub to securely upload and tag new articles or videos for students.

### For Admins
1. Monitor platform health via the glassmorphic Admin Panel.
2. Review pulsing radar alerts for flagged posts or high-risk AI chat sessions.
3. Take immediate action to delete toxic posts or mark crisis sessions as "Resolved".
4. Manage users and colleges.

## 🔒 Security Considerations

- **Never commit `.env` files** - They contain sensitive information
- Rotate session credentials and API keys in production
- **Use HTTPS** in production
- **Implement rate limiting** on all endpoints
- **Validate all inputs** on both frontend and backend
- **Use environment variables** for all configuration
- **Regular security audits** recommended

## 🧪 Testing

To test the platform:

1. Start both backend and frontend servers
2. Register a new user (student or counselor)
3. Create a college (as admin) or use existing one
4. Test each feature:
   - Complete the onboarding flow
   - Browse resources and verify AI recommendations
   - Create posts, use @mentions in nested comments
   - Trigger a safety alert via the chatbot or Check-In to test Admin moderation
   - Check the new interactive Breathing/Grounding tools in the chatbot
   - Book counseling sessions
   - Admin functions (Resolve flags, dismiss posts)

## 🚀 Quick Start Guide

### Complete Setup Sequence

1. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   npm install recharts react-is --legacy-peer-deps
   npm install framer-motion --legacy-peer-deps
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env` in both backend and frontend
   - Update MongoDB URI and API keys.

3. **Start MongoDB:**
   ```bash
   mongod
   ```

4. **Seed database:**
   ```bash
   cd backend
   node seed.js
   ```

5. **Start backend:**
   ```bash
   npm run dev
   ```

6. **Start frontend** (new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Health Check: http://localhost:5000/api/health

8. **Login as admin:**
   - Email: `admin@default.com`
   - Password: `admin123`

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in `.env`
2. Update `MONGODB_URI` to production database
3. Use secure, rotating server credentials and API keys
4. Run `npm run seed` on production (or ensure admin exists)
5. Deploy to platforms like Heroku, Railway, or AWS

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Vercel, Netlify, or similar
3. Update `VITE_API_URL` to production backend URL

## 📝 Notes

- The chatbot uses the Gemini API if `GEMINI_API_KEY` is provided, otherwise uses mock JSON responses
- Risk detection scans for crisis keywords and calculates risk scores
- All data is isolated by `collegeId` for multi-tenant security
- Anonymous posts/comments store user ID but display alias/name based on `isAnonymous` flag

## ✅ Recent Major Updates
- **Three-Objective Refactor:** Migrated the AI Chatbot to **Gemini 2.0** utilizing strictly structured JSON outputs. Introduced **nested comment threads with @mentions** in the community forum. Developed **reusable, animated clinical exercise widgets** (Breathing & Grounding) shared seamlessly between the AI Chatbot and Resource Hub.
- **Stigma-Free Redesign:** Ripped out legacy clinical testing forms. Replaced with a warm, progressive-disclosure onboarding flow that seamlessly maps to clinical scales (PHQ-9, GAD-7, PSS).
- **Visual Analytics:** Integrated `recharts` to build a premium user progress dashboard mapping wellbeing trends.
- **Safety First:** Added the `needsIntervention` database trigger to instantly flag accounts showing self-harm indicators during check-ins.
- **Counselor Empowerment:** Counselors now have full CRUD access to the Resource Library via a standalone UI component alongside Admin users.
- **Actionable Moderation:** Upgraded the Admin panel from simple viewing to active state-management (Force Delete, Dismiss, Resolve).
- **Unified Glassmorphic UI:** Standardized the entire platform using Tailwind frosted glass, vibrant gradients, micro-animations, and seamless responsiveness.
- **Refactoring to ES Modules:** Entire backend controllers, models, routes, and `seed.js` script successfully migrated to pure ES modules using modern middleware architecture.

## 🤝 Contributing

This is a production-ready template. Feel free to extend it with:
- Email notifications
- File uploads for resources
- Video conferencing integration
- Advanced analytics
- Mobile app version

## 📄 License

This project is provided as-is for educational and production use.

## 🆘 Support

For issues or questions:
1. Check the API endpoints documentation above
2. Review the code comments
3. Check MongoDB connection and environment variables
4. Review server logs for errors

---

**Built with ❤️ using MERN Stack**
```
