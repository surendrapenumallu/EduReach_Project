# 🎓 EduReach — College Intelligence & Academic Management Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.2-green.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_Cloud-47A248.svg)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-13%20Passed-brightgreen.svg)](https://vitest.dev/)

> **EduReach** is an AI-powered, full-stack College Intelligence and Academic Management Platform. It features intelligent attendance bunk-safety calculations, semester CGPA marksheets, admission application workflows, faculty grading portals, and an Agentic RAG AI Counselor powered by LangChain and Google Gemini.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client ["Frontend (React 19 + Vite 6 + Tailwind 4)"]
        UI["Student / Faculty / Admin Portals"]
        Chat["AI Counselor Drawer"]
        SocketC["Socket.IO Client"]
    end

    subgraph Server ["Backend (Node.js + Express 5 + TypeScript)"]
        Router["Centralized API Router (/api)"]
        AuthM["JWT & Role Middleware"]
        Controllers["Modular Controllers (Auth, Student, Faculty, Results)"]
        RAG["RAG Service + Tool Calling"]
        SocketS["Socket.IO Server"]
        Queue["Async Job Queue Engine"]
    end

    subgraph Storage ["Database & External Services"]
        MongoDB[("MongoDB Atlas Cloud (edureach_db)")]
        Redis[("Redis / TTL In-Memory Cache")]
        Gemini["Google Gemini AI & Embeddings"]
        Cloudinary["Cloudinary Media Storage"]
    end

    UI -->|HTTP / REST| Router
    Chat -->|REST / RAG Query| Router
    SocketC <-->|WebSockets (ws)| SocketS

    Router --> AuthM --> Controllers
    Controllers --> MongoDB
    Controllers --> Redis
    Controllers --> Queue
    RAG --> MongoDB
    RAG --> Gemini
    Controllers --> Cloudinary
```

---

## 📂 Project Directory Structure

```
CAPSTONE_PROJECT/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD pipeline (Lint, Test, Build, Docker)
├── edureach-platform/
│   ├── docker-compose.yml       # Multi-container orchestration (Server, Client, Redis)
│   ├── render.yaml              # Cloud deployment configuration
│   ├── package.json             # Monorepo scripts runner
│   │
│   ├── client/                  # Frontend Application (React 19 + Vite 6)
│   │   ├── src/
│   │   │   ├── assets/          # Static assets & icons
│   │   │   ├── components/      # UI components (Modals, Sections, Drawers, Navbar)
│   │   │   ├── context/         # React Context (AuthContext)
│   │   │   ├── data/            # Static content & mock fixtures
│   │   │   ├── pages/           # Route views (Home, Login, Student, Faculty, Predictor)
│   │   │   ├── services/        # API service layer (Axios + Socket.IO + Barrel Index)
│   │   │   ├── types/           # Shared TypeScript interfaces & types
│   │   │   ├── test/            # Frontend Vitest test suites
│   │   │   ├── App.tsx          # Main React router & layout
│   │   │   └── main.tsx         # React root entry point
│   │   ├── vite.config.ts       # Vite configuration with API reverse proxy
│   │   └── package.json
│   │
│   └── server/                  # Backend Application (Node.js + Express 5)
│       ├── knowledge-base/      # Text corpus for college RAG embedding
│       ├── scripts/             # Diagnostic & maintenance scripts
│       ├── src/
│       │   ├── config/          # Database, Redis, Cloudinary, Swagger configs
│       │   ├── controllers/     # Route request handlers
│       │   ├── middleware/      # Auth, Role-based access, Upload, Error handler
│       │   ├── models/          # Mongoose database models & schemas (with barrel export)
│       │   ├── routes/          # Modular API routes + Centralized router index
│       │   ├── schemas/         # Zod request validation schemas
│       │   ├── services/        # Business logic (RAG, Queue, Upload, Predictor)
│       │   ├── socket/          # Real-time Socket.IO room & event handlers
│       │   ├── utils/           # Async handler & JWT helpers
│       │   ├── app.ts           # Express application configuration
│       │   └── index.ts         # Server bootstrap & MongoDB initialization
│       ├── test/                # Backend Vitest test suites (Auth, Queue, Upload, Predictor)
│       ├── tsconfig.json        # TypeScript configuration
│       └── package.json
│
├── .env.example                 # Root environment variable template
├── package.json                 # Top-level unified scripts runner
└── README.md                    # Project documentation
```

---

## 🚀 Key Modules & Capabilities

### 1. 🎓 Student Intelligence Portal
* **Attendance Bunk Safety Engine**: Automatically computes how many classes a student can safely skip while maintaining &ge; 75% attendance, or how many consecutive recovery classes are required.
* **Academic Marksheet & SGPA/CGPA Analytics**: Interactive grade charts, semester breakdown, and credit tallies.
* **Admission Applications**: Course application submission, document attachment, and real-time status tracker.

### 2. 👨‍🏫 Faculty Portal
* **Course Roster Management**: Real-time student enrollment list by branch and semester.
* **Attendance Tracking**: One-click student attendance logging with automatic threshold alerts.
* **AI Assignment Evaluator**: Automated assignment review and feedback generator.

### 3. 🤖 Agentic RAG AI Counselor
* **Vector Knowledge Base**: College syllabus, fee structure, placement statistics, and policies indexed as embeddings in MongoDB (`knowledge_docs`).
* **Tool Calling Engine**: Natural language query detection for attendance stats, safe bunk calculation, and fee inquiries.
* **Voice-to-Text & Speech Synthesis**: Speech recognition and text-to-speech audio counseling in browser.

### 4. ⚡ Real-Time WebSockets & Notifications
* Powered by **Socket.IO** with role-based channels (`join:role` for students and faculty).
* Live push notifications for campus announcements, grade updates, and attendance alerts.

---

## 🔑 Pre-Configured Demo Accounts

The database is already populated with sample records for immediate evaluation:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Student** | `student@edureach.edu` | `password123` | [Student Dashboard](http://localhost:5173/dashboard) |
| **Faculty** | `faculty@edureach.edu` | `password123` | [Faculty Portal](http://localhost:5173/faculty) |

*(One-click demo login buttons are also available on the [Login Page](http://localhost:5173/login)).*

---

## 🛠️ Quick Start Guide

### Prerequisites
* **Node.js**: v22.x or v24.x (v26 compatible)
* **npm**: v10.x or higher
* **MongoDB**: Atlas Cloud connection string (pre-configured in `.env`)

### 1. Installation
Install dependencies for both frontend and backend:

```bash
cd CAPSTONE_PROJECT/edureach-platform
npm --prefix server install
npm --prefix client install
```

### 2. Run in Development Mode
Start both backend (port `5050`) and frontend (port `5173`) concurrently:

```bash
npm run dev
```

* **Frontend Web App**: 👉 **[http://localhost:5173](http://localhost:5173)**
* **Interactive Swagger API Docs**: **[http://localhost:5050/api/docs](http://localhost:5050/api/docs)**
* **Server Health Check**: **[http://localhost:5050/api/health](http://localhost:5050/api/health)**

---

## 🧪 Automated Testing & Build

Run the automated test suite across both client and server:

```bash
# Run all 13 unit tests
npm test

# Build production bundles
npm run build
```

---

## 📡 API Reference Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register new student or faculty | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `GET` | `/api/auth/me` | Fetch active user profile | Yes (JWT) |
| `GET` | `/api/student/portal` | Get attendance, exams, and SGPA | Yes (Student) |
| `GET` | `/api/results/my-results`| Fetch semester grade reports | Yes (Student) |
| `GET` | `/api/faculty/courses` | Get faculty assigned courses | Yes (Faculty) |
| `POST` | `/api/chat` | Query RAG AI Counselor | Optional |
| `POST` | `/api/predictor/predict`| Calculate cutoff admission odds | No |
| `GET` | `/api/health` | Service health & operational status | No |

Complete interactive documentation with request/response schemas is available at `/api/docs`.

