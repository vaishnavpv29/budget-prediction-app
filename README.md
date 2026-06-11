# ESTIMATRIX – AI-Based Project Cost, Timeline & Progress Management

A full-stack MERN application that uses historical project data to predict costs and timelines, integrates GitHub for real-time commit tracking, and provides separate dashboards for admins and employees.

## Tech Stack
- **Frontend**: React + Vite, React Router, Recharts, React Icons, React Hot Toast
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT Auth
- **Integrations**: GitHub REST API

---

## Quick Start

### 1. Configure Environment
Edit `backend/.env`:
```
MONGO_URI=mongodb+srv://dharshhh:<password>@cluster0.ajkqiqz.mongodb.net/estimatrix?retryWrites=true&w=majority
JWT_SECRET=estimatrix_jwt_secret_key_2024
PORT=5000
GITHUB_TOKEN=your_github_personal_access_token   # optional, increases rate limit
```

### 2. Start Backend
```bash
cd backend
npm install
npm run dev        # uses nodemon for hot reload
# or: npm start
```

### 3. Start Frontend
```bash
cd frontend
npm install
npm run dev        # Vite dev server on http://localhost:3000
```

---

## First-Time Setup

1. **Create Admin account** – POST to `/api/auth/register` with `role: "admin"`:
```json
{
  "name": "Admin User",
  "email": "admin@company.com",
  "password": "admin123",
  "role": "admin"
}
```

2. **Login** at `http://localhost:3000/admin/login`

3. **Add Historical Data** → Admin → Historical Data (improves AI predictions)

4. **Create Employees** → Admin → Employees → Add Employee

5. **Create a Project** → Admin → Projects → New Project (AI predictions run automatically)

6. **Assign Tasks** → Admin → Tasks → Assign Task

7. **Employee Login** at `http://localhost:3000/employee/login`

---

## Features

| Feature | Description |
|---------|-------------|
| 🤖 AI Cost Prediction | Uses historical data to predict project cost vs budget |
| ⏳ Timeline Estimation | Predicts delivery timeline based on complexity & team size |
| ⚠️ Risk Analysis | Flags high-risk projects with cost/time overrun alerts |
| 🐙 GitHub Integration | Tracks commits per employee, verifies task completion via commit hash |
| 📊 Admin Dashboard | Charts for project completion, task distribution, risk alerts |
| 👤 Employee Dashboard | Personal task list, project progress, GitHub activity |
| 📝 Weekly Reports | Employees submit reports; admin reviews and approves |
| 🗄️ Historical Data | Upload past project data to train the prediction engine |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login (returns JWT) |
| GET/POST | `/api/projects` | List / Create projects |
| GET/PUT/DELETE | `/api/projects/:id` | Project CRUD |
| GET | `/api/projects/stats` | Dashboard stats |
| GET/POST | `/api/tasks` | List / Create tasks |
| PUT | `/api/tasks/:id` | Update task progress |
| GET/POST | `/api/reports` | List / Submit weekly reports |
| PUT | `/api/reports/:id/review` | Admin review report |
| GET/POST | `/api/historical` | Historical data CRUD |
| GET | `/api/github/contributors/:projectId` | GitHub contributors |
| GET | `/api/github/activity/:username` | User weekly activity |

---

## Project Structure

```
estimatrix/
├── backend/
│   ├── config/db.js
│   ├── controllers/        # authController, projectController, taskController...
│   ├── middleware/         # auth.js, errorHandler.js
│   ├── models/             # User, Project, Task, WeeklyReport, HistoricalProject
│   ├── routes/             # authRoutes, projectRoutes, taskRoutes...
│   ├── services/           # predictionService.js, githubService.js
│   ├── server.js
│   └── .env
└── frontend/
    └── src/
        ├── components/common/   # Navbar, Sidebar, Card, Layout
        ├── context/AuthContext.jsx
        ├── pages/
        │   ├── auth/            # AdminLogin, EmployeeLogin
        │   ├── admin/           # Dashboard, Projects, Tasks, Reports...
        │   └── employee/        # Dashboard, Tasks, Reports, GitHub
        ├── services/api.js
        └── App.jsx
```
