# 🎓 EduPath — AI-Powered Career Learning Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)

> A full-stack, AI-powered platform that helps users assess skills, get personalized career roadmaps, build resumes, and deploy portfolios.

---

## 🏗️ Architecture

```
Frontend (React/Vite)     →     Backend (Node.js/Express)     →     AI Service (Python/FastAPI)
   localhost:5173                   localhost:4000                      localhost:8000
```

---

## ✨ Core Features

- **Skill Assessments** — Quizzes, aptitude tests, CS fundamentals (QuizAPI), AI mock interviews
- **Career Roadmap** — AI-generated personalized weekly learning plan with skill nodes, resources & mini-projects
- **Resume Tools** — Parse resumes with Surya OCR, build AI-powered resumes (PDF/DOCX), ATS scoring
- **Portfolio Generator** — Build portfolios and deploy live to Vercel with one click
- **Admin Panel** — Manage users, quiz attempts, roadmaps, and analytics

---

## 🛠️ Tech Stack

| Layer | Stack |
|---|---|
| **Frontend** | React 19, Vite, TailwindCSS 4, Framer Motion, Recharts, React Router |
| **Backend** | Express 5, MongoDB/Mongoose, JWT, Multer, Cloudinary, Nodemailer, Groq SDK |
| **AI Service** | FastAPI, Surya OCR, LangChain, HuggingFace, spaCy, PyMuPDF |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account
- API keys: Groq, HuggingFace, Cloudinary, Vercel, QuizAPI, Gmail App Password

---

### 1. Backend

```bash
cd backend
npm install
# Create .env (see below)
npm run dev       # runs on localhost:4000
```

**`backend/.env`**
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
GROQ_API_KEY=your_groq_key
HF_TOKEN=your_hf_token
VERCEL_TOKEN=your_vercel_token
QUIZ_API_KEY=your_quizapi_key
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173/
```

---

### 2. AI Service

```bash
cd ai_service
python -m venv .venv
.venv\Scripts\activate       # Windows
# source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
python main.py               # runs on localhost:8000
```

> API docs available at **http://localhost:8000/docs**

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                  # runs on localhost:5173
```

---

## 📡 API Overview

| Base Path | Description |
|---|---|
| `POST /api/auth/signup` | Register user |
| `POST /api/auth/login` | Login (email or loginId) |
| `POST /api/auth/forgot-password` | Send reset email |
| `GET /api/profile` | Get/update user profile |
| `GET /api/quiz/topics` | Browse quiz topics |
| `POST /api/quiz/start` | Start a quiz session |
| `POST /api/quiz/submit` | Submit quiz answers |
| `POST /api/roadmap/generate` | Generate AI roadmap |
| `GET /api/roadmap` | Get active roadmap |
| `PATCH /api/roadmap/skill-status` | Update skill progress |
| `POST /api/resume-generator/generate` | Build AI resume |
| `POST /api/ats/analyze` | ATS score resume |
| `POST /api/portfolio/parse-resume` | Extract portfolio from resume |
| `POST /api/portfolio/deploy-vercel/:id` | Deploy portfolio to Vercel |
| `POST /api/mock-interview/question` | Get AI interview question |

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (10 rounds)
- **JWT** auth with 7-day token expiry
- Account lockout after **5 failed login attempts** (15-min lock)
- Rate limiting, helmet headers, CORS, input validation

---

## 📁 Project Structure

```
EduPath/
├── frontend/        # React app (pages, components, admin panel)
├── backend/         # Node.js API (controllers, models, routes, services)
└── ai_service/      # Python FastAPI (OCR, LLM agents, roadmap generator)
```

---

## 📄 License

ISC License
