# 📢 Complaint Management Portal

A complete, production-style **Complaint Management System** built with **Node.js, Express.js, MongoDB**, and a **Bootstrap 5** frontend (HTML, CSS, vanilla JavaScript). Designed to be a fully working, final-year college project — every feature described below is functional, not a static mockup.

---

## ✨ Features

### User side
- User **registration** and **login** (JWT-based authentication, hashed passwords with bcrypt)
- **Submit Complaint** form: name, email, phone, category, title, description, location, priority, and optional file attachment (image/PDF/doc)
- **Automatic unique Complaint ID generation** in the format `CMP20260001` (year + sequential number)
- Instant **success screen** showing the generated Complaint ID and submitted details
- **Track Complaint** page — anyone can enter a Complaint ID to see:
  - Full complaint details
  - Current status
  - Submission date
  - Admin remarks
  - A visual **status timeline**: `Submitted → Under Review → In Progress → Resolved`
  - Full history log of every status change
- **User Dashboard** with:
  - Total complaints, pending, in-progress, and resolved counters
  - Full complaint history table with search
  - Direct links to track each complaint

### Admin side
- Separate **Admin Login** (credentials configured via `.env`)
- **Admin Dashboard** with:
  - Live stats (total / pending / in progress / resolved)
  - Full complaints table
  - **Search & filter** by Complaint ID, category, status, and priority
  - **Complaint detail modal** showing everything about a complaint, including attachments
  - **Update status** and **add admin remarks** — instantly reflected when the user tracks the same Complaint ID
  - Full change history per complaint

### Technical
- REST API built with Express.js
- MongoDB + Mongoose models (`User`, `Complaint`, `Counter`)
- JWT authentication middleware with role-based guards (`user` / `admin`)
- File uploads handled via Multer (stored in `/uploads`, served statically)
- Fully responsive, modern UI (Bootstrap 5 + Bootstrap Icons + custom CSS theme)
- No placeholders, no "TODO"s — every button and form performs a real action against the backend

---

## 🗂️ Project Structure

```
Complaint-Management-Portal/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   └── auth.js                # JWT verification & role guards
├── models/
│   ├── User.js                 # User schema (with password hashing)
│   ├── Complaint.js            # Complaint schema + status timeline
│   └── Counter.js              # Sequence generator for Complaint IDs
├── routes/
│   ├── authRoutes.js           # Register / Login (user + admin)
│   ├── complaintRoutes.js      # Submit / Track / My complaints / stats
│   └── adminRoutes.js          # Admin: list/filter/view/update complaints
├── public/                     # Frontend (served statically by Express)
│   ├── index.html              # Landing page
│   ├── register.html
│   ├── login.html
│   ├── complaint-form.html     # Submit complaint
│   ├── track.html              # Track complaint
│   ├── dashboard.html          # User dashboard
│   ├── admin-login.html
│   ├── admin-dashboard.html
│   ├── css/style.css
│   └── js/
│       ├── common.js            # Shared helpers (auth, API calls, navbar)
│       ├── complaint-form.js
│       ├── track.js
│       ├── dashboard.js
│       ├── admin-login.js
│       └── admin-dashboard.js
├── uploads/                    # Uploaded complaint attachments (created automatically)
├── server.js                    # Express app entry point
├── package.json
├── .env.example
└── README.md
```

---

## ✅ Prerequisites

Before you start, make sure you have installed:

1. **Node.js** (v16 or higher) — [Download here](https://nodejs.org/)
2. **MongoDB** — either:
   - **Local MongoDB Community Server** — [Download here](https://www.mongodb.com/try/download/community), or
   - A free **MongoDB Atlas** cluster — [Sign up here](https://www.mongodb.com/cloud/atlas/register)

Check your installations:
```bash
node -v
npm -v
mongod --version   # only if using local MongoDB
```

---

## 🚀 Installation & Setup

### 1. Extract the project
Unzip `Complaint-Management-Portal.zip` and open a terminal inside the extracted folder:
```bash
cd Complaint-Management-Portal
```

### 2. Install dependencies
```bash
npm install
```
This installs: express, mongoose, bcryptjs, jsonwebtoken, multer, cors, morgan, dotenv, and nodemon (dev).

### 3. Configure environment variables
Copy the example environment file and edit it:
```bash
cp .env.example .env
```
Open `.env` in a text editor and set your values:
```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/complaint_management_portal
JWT_SECRET=some_long_random_secret_string
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@complaintportal.com
ADMIN_PASSWORD=Admin@123
ADMIN_NAME=System Administrator
```

> If you're using **MongoDB Atlas**, replace `MONGO_URI` with your Atlas connection string, e.g.
> `mongodb+srv://<username>:<password>@cluster0.mongodb.net/complaint_management_portal`

### 4. Start MongoDB (if running locally)
```bash
mongod
```
Leave this running in its own terminal window (skip this step if you're using Atlas).

### 5. Run the server

**Development mode** (auto-restarts on file changes):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
✅ MongoDB Connected: 127.0.0.1/complaint_management_portal
🚀 Complaint Management Portal server running on http://localhost:5000
```

### 6. Open the app
Visit **http://localhost:5000** in your browser.

---

## 🧪 Testing the Complete Flow

Follow these steps to verify every feature works end-to-end:

1. **Register** → Go to `/register.html`, create a new account. You'll be logged in automatically and redirected to your dashboard.
2. **Submit a Complaint** → Click "Submit Complaint", fill in the form (try attaching a small image or PDF), and submit.
   - You should instantly see a success screen with a generated Complaint ID like `CMP20260001`.
3. **Track the Complaint** → Copy the Complaint ID, go to `/track.html`, and enter it.
   - You'll see the full details, a status timeline highlighting **Submitted**, and the history log.
4. **Check the Dashboard** → Go to `/dashboard.html` — your new complaint should appear in the stats and history table.
5. **Admin Login** → Open `/admin-login.html` and log in using the credentials from your `.env` file (default: `admin@complaintportal.com` / `Admin@123`).
6. **View & Filter in Admin Dashboard** → You should see the complaint you just submitted. Try searching by Complaint ID, or filtering by category/status/priority.
7. **Update the Complaint** → Click "View" on the complaint, change the **Status** (e.g. to "Under Review" or "In Progress"), add an **Admin Remark**, and click "Save Update".
8. **Re-track as the User** → Go back to `/track.html` (or the user dashboard) and track the same Complaint ID again.
   - The status and admin remarks should now reflect exactly what the admin just updated — confirming the full loop works.

---

## 🔌 REST API Reference

All endpoints are prefixed with `/api`.

### Auth
| Method | Endpoint              | Description                        | Auth |
|--------|-----------------------|-------------------------------------|------|
| POST   | `/auth/register`      | Register a new user                 | none |
| POST   | `/auth/login`         | Login as a user                     | none |
| GET    | `/auth/me`             | Get current logged-in user profile  | User |
| POST   | `/auth/admin/login`   | Login as admin                      | none |

### Complaints (User-facing)
| Method | Endpoint                          | Description                                  | Auth |
|--------|------------------------------------|-----------------------------------------------|------|
| POST   | `/complaints`                     | Submit a new complaint (multipart/form-data)  | User |
| GET    | `/complaints/track/:complaintId`  | Track a complaint by its Complaint ID         | none |
| GET    | `/complaints/my`                  | Get all complaints of the logged-in user      | User |
| GET    | `/complaints/my/stats`            | Get dashboard stats for the logged-in user    | User |
| GET    | `/complaints/meta/options`        | Get available categories/priorities/statuses  | none |

### Admin
| Method | Endpoint                       | Description                                        | Auth  |
|--------|----------------------------------|-----------------------------------------------------|-------|
| GET    | `/admin/complaints`             | List/search/filter all complaints                   | Admin |
| GET    | `/admin/complaints/:id`         | Get full details of one complaint                   | Admin |
| PUT    | `/admin/complaints/:id`         | Update status and/or admin remarks                  | Admin |
| DELETE | `/admin/complaints/:id`         | Delete a complaint                                  | Admin |

**Authentication**: pass the JWT returned at login as a Bearer token:
```
Authorization: Bearer <token>
```

---

## 🎨 Tech Stack

- **Frontend:** HTML5, CSS3 (custom theme), Bootstrap 5, Bootstrap Icons, vanilla JavaScript (Fetch API)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Auth:** JSON Web Tokens (JWT) + bcrypt password hashing
- **File uploads:** Multer

---

## 🛠️ Troubleshooting

- **`MongoDB connection error`** → Make sure `mongod` is running locally, or that your Atlas `MONGO_URI` and IP allowlist are correct.
- **`Invalid or expired token`** → Log out and log back in; JWTs expire after `JWT_EXPIRES_IN` (default 7 days).
- **Port already in use** → Change `PORT` in `.env`.
- **File upload fails** → Only `.jpg, .jpeg, .png, .gif, .pdf, .doc, .docx` files up to 5MB are accepted.
- **Admin login fails** → Double-check `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your `.env` file match exactly what you're typing.

---

## 📄 License

This project is provided for educational purposes (final-year college project) and may be freely used, modified, and extended.
