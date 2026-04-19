# ⚡ AuthApp — Full-Stack Authentication Platform

A production-ready full-stack web application with real user authentication, role-based access control, admin panel, and more.

## 🚀 Live Demo
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-api.railway.app

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | PostgreSQL (Supabase) |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Email | Nodemailer (SMTP) |
| Deployment | Vercel (frontend) + Railway (backend) |

## ✨ Features
- **Auth:** Signup, Login, Logout, JWT refresh token rotation
- **Email:** Verification email on signup, password reset via email
- **Profile:** Edit name/bio, upload avatar, view account info
- **Security:** Change password, delete account with confirmation
- **Activity Log:** Full audit trail of user actions with IP tracking
- **Admin Panel:** User management, role assignment, activate/deactivate, stats dashboard
- **Dark Mode:** Persistent dark/light mode toggle
- **Rate Limiting:** Auth endpoints protected against brute force
- **Input Validation:** Server-side validation on all endpoints

## 📁 Project Structure
```
project-root/
├── client/          # React + Vite frontend
│   └── src/
│       ├── api/         # Axios instance with interceptors
│       ├── components/  # Navbar, Button, Input, Card, ProtectedRoute
│       ├── context/     # AuthContext (global auth state)
│       ├── hooks/       # useForm
│       ├── pages/       # Login, Signup, Dashboard, Profile, Admin, etc.
│       └── utils/       # helpers (formatDate, getErrorMessage, etc.)
│
└── server/          # Express backend
    ├── config/      # JWT helpers
    ├── controllers/ # authController, userController, adminController
    ├── db/          # PostgreSQL pool + schema.sql
    ├── middleware/  # authMiddleware, rateLimiter, errorHandler, upload
    ├── routes/      # authRoutes, userRoutes, adminRoutes
    ├── utils/       # email, activityLogger
    └── validators/  # express-validator rules
```

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Database Setup
1. Create a free project on [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `server/db/schema.sql`
3. Copy your **Database URL** from Project Settings → Database

### 3. Environment Variables


### 4. Run Locally
```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Visit http://localhost:5173

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | ❌ | Register new user |
| POST | `/login` | ❌ | Login, returns JWT pair |
| POST | `/refresh` | ❌ | Rotate refresh token |
| POST | `/logout` | ✅ | Invalidate refresh token |
| GET | `/me` | ✅ | Get current user |
| GET | `/verify-email?token=` | ❌ | Verify email address |
| POST | `/forgot-password` | ❌ | Send reset email |
| POST | `/reset-password` | ❌ | Set new password |

### User (`/api/user`) — requires auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile` | Get full profile |
| PATCH | `/profile` | Update name/bio |
| POST | `/avatar` | Upload avatar image |
| PATCH | `/change-password` | Change password |
| GET | `/activity` | Get activity logs |
| DELETE | `/account` | Delete account |

### Admin (`/api/admin`) — requires admin role
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard stats + recent activity |
| GET | `/users` | List all users (paginated, searchable) |
| GET | `/users/:id` | Get single user |
| PATCH | `/users/:id/role` | Change user role |
| PATCH | `/users/:id/toggle` | Toggle active status |
| DELETE | `/users/:id` | Delete user |
| GET | `/logs` | All system activity logs |

## 🔒 Security
- Passwords hashed with bcrypt (10 rounds)
- JWT access tokens expire in 15 minutes
- Refresh token rotation on every use
- All refresh tokens invalidated on password change/reset
- Rate limiting on auth endpoints (10 req / 15 min)
- CORS restricted to frontend domain
- Helmet.js security headers
- Input validation on all endpoints
- HTTPS enforced via Vercel/Railway
