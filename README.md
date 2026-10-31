# Sigma UBT - Fullstack Next.js Examination Platform

A production-grade, fullstack **Ubiquitous-Based Test (UBT)** system for EPS-TOPIK Korean Language examination preparation, featuring multi-institute tenancy, anti-cheat question delivery, persistent Prisma database, and automated scoring.

---

## 1. Quick Start

### Installation & Database Setup
```bash
npm install
npx prisma db push
npm run prisma:seed
```

### Run Development Server
```bash
npm run dev
```

Open: **[http://localhost:3000](http://localhost:3000)**

---

## 2. Default Accounts

| Role | Username | Password | Dashboard URL | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin` | `Admin@Sigma2026!` | `/admin` | Manages institutes, packages, questions, global notices |
| **Institute** | `sigma` | `Institute@Sigma2026!` | `/institute` | Manages student enrollments, batches, exam preview |
| **Student** | `student` / phone | `1234` | `/student` | Takes 40-question UBT exam with listening audio & timer |

---

## 3. Architecture & Backend Features

- **Fullstack Next.js App Router:** Unified frontend and backend in a single repository.
- **Prisma ORM with SQLite/PostgreSQL:** Relational data models for Institutes, Students, Packages, Sets, Questions, Sessions, and Results.
- **Anti-Cheat Exam Engine (`/api/student/exams/[examId]/start`):** Answer keys are strictly omitted from client payloads during active exam sessions.
- **Server-Side Scoring (`/api/student/exams/[examId]/submit`):**
  - Reading questions 1–20 (up to 100 points, 5 points each).
  - Listening questions 21–40 (up to 100 points, 5 points each).
  - Total 200 points + automated pass/fail computation.
- **Audio & Image Uploads (`/api/upload`):** Question diagrams and MP3 listening tracks uploaded directly to storage with public CDN URLs.
- **JWT & HTTP-Only Cookies:** Secure session authentication with password hashing using bcrypt.
- **Subscription Expiry Middleware:** Automatic validation of institute subscription periods (1M / 3M / 6M / 1Y).

---

## 4. Production Build & Deployment

```bash
npm run build
npm run start
```
To switch from SQLite to PostgreSQL in production, update `prisma/schema.prisma` datasource provider to `postgresql` and provide your production `DATABASE_URL` in `.env`.
