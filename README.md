# Sigma UBT - Complete Starter

## 1. Open the project
Open this `sigma-ubt` folder in VS Code.

## 2. Install
Open **Terminal > New Terminal** and run ONLY:

```bash
npm install
```

Do not paste JavaScript/React code into the terminal.

## 3. Run
```bash
npm run dev
```

Then open:
http://localhost:5173

## Demo accounts

Admin:
- Username: `admin`
- Password: `admin123`

Institute:
- Username: `sigma`
- Password: `1234`

Student:
Create a student from Institute > Students, then use the created username/password.

## Logo
Put your Sigma logo at:
`public/sigma-logo.png`

React path:
`/sigma-logo.png`

## Included features

- Admin / Institute / Student login
- Sigma logo
- Admin dashboard
- Institute creation
- 1/3/6 month and 1 year subscriptions
- Automatic expire date
- Automatic Active / Expired status
- Exam package selection:
  - 10 Set UBT
  - 20 Set UBT
  - 30 Set UBT
  - 50 Set UBT
  - 80 Set UBT
  - 100 Set UBT
  - 150 Set UBT
  - 200 Set UBT
  - 30 Set Chapter UBT
  - 60 Set Chapter Final Set UBT
  - Full Set UBT
- Student management
- Question management
- Reading/listening question type
- Student exam screen
- Question navigation
- Timer
- Answer selection
- Submit confirmation
- Automatic result calculation
- Responsive mobile/tablet/desktop UI

## Important future upgrade

This version is a working front-end/demo using browser localStorage. For real multi-institute use over the internet, replace localStorage with a backend database/API and authentication. Recommended next backend modules:
- Node.js + Express API
- PostgreSQL/MySQL
- Secure password hashing
- JWT/session authentication
- Institute/package expiry validation on server
- Image/audio upload
- Question bank and exam-set database
- Result database
- Admin audit logs
