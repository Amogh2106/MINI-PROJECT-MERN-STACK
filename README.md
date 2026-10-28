# CRM MVP (MERN Stack)

A clean, minimal, professional CRM web application tailored for small sales teams. Built with the MERN stack (MongoDB, Express, React 18 with Vite, Node.js) in a clean monorepo architecture.

---

## 🚀 Features

- **Authentication & Roles**:
  - Registration, Login, Logout, and Session checking (`/api/v1/auth/me`).
  - Secure JWT authentication stored in an `httpOnly` cookie.
  - Role-based authorization (`admin` vs `sales`). Sales users can only edit or delete records they own, while admins can manage all records.
- **Contacts**:
  - Full CRUD operations.
  - Server-side search by name, email, or phone.
  - Filter by status (`lead`, `active`, `inactive`) and owner.
  - Server-side pagination (`items`, `page`, `limit`, `total`, `totalPages`).
- **Companies**:
  - Full CRUD operations with industry, domain, phone, and address.
  - Detail page displaying all associated contacts.
- **Deals & Pipeline**:
  - Full CRUD operations with stages (`lead`, `qualified`, `proposal`, `won`, `lost`), deal value, and expected close date.
  - Opportunity linkages to contacts and companies.
  - **Table View** and **Static Board View** grouped by stage columns.
  - Instant stage changes via card dropdown (no drag-and-drop or decorative animations).
- **Tasks & Follow-ups**:
  - Full CRUD operations with due date and completion status (`open` / `done`).
  - Linked to a contact or deal.
  - **"My Tasks"** and **"Due Today"** quick filters.
- **Activity Timeline & Notes**:
  - Polymorphic notes attached to contacts or deals (`entityType` + `entityId`).
  - Reverse chronological activity timeline with author attribution.
- **Dashboard**:
  - Metrics snapshot: Total Contacts, Open Deals, Total Pipeline Value ($), and Tasks Due Today.
  - Recent activity feed (notes posted) and recent opportunities snapshot.

---

## 🛠️ Tech Stack

- **Backend**: Node.js (ES Modules), Express, Mongoose, JWT (`httpOnly` cookie), bcrypt, Zod validation, cookie-parser, cors, helmet, morgan.
- **Frontend**: React 18, Vite, React Router v6, TanStack Query v5, Axios (`withCredentials: true`), Tailwind CSS, react-hook-form + `@hookform/resolvers/zod`.
- **Database**: MongoDB (with zero-configuration automatic in-memory fallback for local development if MongoDB service is not started).

---

## 📁 Project Structure

```text
MERN STACK PROJECT/
├── package.json                    # Root scripts: "dev" (concurrently), "seed"
├── .gitignore
├── README.md                       # Setup, documentation, and API reference
│
├── server/
│   ├── .env.example
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── server.js               # Express application entry & middleware
│       ├── config/
│       │   └── db.js               # Mongoose connection & in-memory dev fallback
│       ├── models/
│       │   ├── User.js             # User model (admin, sales)
│       │   ├── Company.js          # Company model
│       │   ├── Contact.js          # Contact model (lead, active, inactive)
│       │   ├── Deal.js             # Deal model (lead, qualified, proposal, won, lost)
│       │   ├── Task.js             # Task model (open, done)
│       │   └── Note.js             # Polymorphic note model (contact, deal)
│       ├── routes/
│       │   ├── index.js            # Base /api/v1 router
│       │   ├── authRoutes.js
│       │   ├── contactRoutes.js
│       │   ├── companyRoutes.js
│       │   ├── dealRoutes.js
│       │   ├── taskRoutes.js
│       │   ├── noteRoutes.js
│       │   └── dashboardRoutes.js
│       ├── controllers/            # Controller layer
│       ├── services/               # Business logic & database operations
│       ├── middleware/             # Auth, role check, validation, central error
│       ├── validators/             # Zod validation schemas
│       ├── utils/                  # Token signing & standardized response helpers
│       └── seed/
│           └── seed.js             # 1 admin, 1 sales, 10 companies, 30 contacts, 15 deals, 20 tasks
│
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css               # Clean neutral palette, static rules (no animations)
        ├── api/                    # Axios client & resource services
        ├── context/                # AuthContext (user, login, logout, register)
        ├── hooks/                  # useAuth hook
        ├── routes/                 # ProtectedRoute & AppRoutes
        ├── layouts/                # AppLayout, Sidebar (responsive), Topbar
        ├── components/
        │   ├── ui/                 # Button, Input, Select, Modal, Table, Badge, Pagination, EmptyState, ConfirmDialog
        │   └── common/             # StatCard, NotesSection
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Contacts/           # ContactList, ContactDetail, ContactFormModal
        │   ├── Companies/          # CompanyList, CompanyDetail, CompanyFormModal
        │   ├── Deals/              # DealList (Table + Board view), DealDetail, DealFormModal
        │   └── Tasks/              # TaskList (My Tasks & Due Today filters), TaskFormModal
        └── utils/                  # Formatters & constants
```

---

## ⚙️ Environment Variables

Located in `server/.env` (reproducible from `server/.env.example`):

```ini
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/crm_mvp
JWT_SECRET=crm_super_secret_jwt_key_development_only_123456789
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Note**: If a local MongoDB instance is not running on port 27017, the server automatically starts an embedded in-memory MongoDB instance during development so you can run and evaluate the application with zero extra setup.

---

## 🚀 Installation & Running

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or `npm install` in root, `npm install` in `/server`, and `npm install` in `/client`)*

### 2. Seed Demo Data
To populate the database with 2 users, 10 companies, 30 contacts, 15 deals, and 20 tasks:
```bash
npm run seed
```

### 3. Start Development Servers
Runs both the Express API (port 5000) and the Vite frontend (port 5173) concurrently:
```bash
npm run dev
```

Visit the application at: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@crm.local` | `password123` | Full access to view, edit, and delete all records across all users |
| **Sales Representative** | `sales@crm.local` | `password123` | Can view all records; can only edit or delete records they own |

---

## 📮 Postman-Friendly API Route Reference

Base URL: `http://localhost:5000/api/v1`

### 1. Authentication (`/api/v1/auth`)

| Method | Endpoint | Auth | Description / Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | `{ "name": "string", "email": "string", "password": "min 6 chars", "role": "sales" \| "admin" }` |
| `POST` | `/auth/login` | Public | `{ "email": "string", "password": "string" }` |
| `POST` | `/auth/logout` | Public | Clears `httpOnly` token cookie |
| `GET` | `/auth/me` | JWT Cookie | Returns currently authenticated user profile |

### 2. Contacts (`/api/v1/contacts`)

| Method | Endpoint | Auth | Description / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/contacts` | User | Query params: `?page=1&limit=10&search=term&status=lead\|active\|inactive&owner=id` |
| `GET` | `/contacts/:id` | User | Returns single contact with populated company & owner |
| `POST` | `/contacts` | User | `{ "name": "Jane Doe", "email": "jane@acme.com", "phone": "...", "company": "id", "status": "lead" }` |
| `PUT` | `/contacts/:id` | Owner / Admin | Updates contact fields |
| `DELETE`| `/contacts/:id` | Owner / Admin | Deletes contact |

### 3. Companies (`/api/v1/companies`)

| Method | Endpoint | Auth | Description / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/companies` | User | Query params: `?page=1&limit=10&search=term&owner=id` |
| `GET` | `/companies/:id` | User | Returns company and lists all linked contacts |
| `POST` | `/companies` | User | `{ "name": "Acme Inc", "domain": "acme.com", "industry": "Tech", "phone": "...", "address": "..." }` |
| `PUT` | `/companies/:id` | Owner / Admin | Updates company details |
| `DELETE`| `/companies/:id` | Owner / Admin | Deletes company and unlinks contacts |

### 4. Deals (`/api/v1/deals`)

| Method | Endpoint | Auth | Description / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/deals` | User | Query params: `?page=1&limit=20&stage=lead\|qualified\|proposal\|won\|lost&search=term` |
| `GET` | `/deals/:id` | User | Returns deal with contact, company, owner |
| `POST` | `/deals` | User | `{ "title": "...", "value": 50000, "stage": "lead", "contact": "id", "company": "id", "expectedCloseDate": "YYYY-MM-DD" }` |
| `PUT` | `/deals/:id` | Owner / Admin | Updates deal fields |
| `PATCH`| `/deals/:id/stage`| Owner / Admin | `{ "stage": "qualified" }` |
| `DELETE`| `/deals/:id` | Owner / Admin | Deletes deal |

### 5. Tasks (`/api/v1/tasks`)

| Method | Endpoint | Auth | Description / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/tasks` | User | Query params: `?status=open\|done&dueToday=true\|false&myTasks=true\|false` |
| `GET` | `/tasks/:id` | User | Returns task details |
| `POST` | `/tasks` | User | `{ "title": "Follow up call", "dueDate": "YYYY-MM-DD", "status": "open", "contact": "id", "deal": "id" }` |
| `PUT` | `/tasks/:id` | Owner / Admin | Updates task fields or toggles status |
| `DELETE`| `/tasks/:id` | Owner / Admin | Deletes task |

### 6. Activity Notes (`/api/v1/notes`)

| Method | Endpoint | Auth | Description / Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/notes/:entityType/:entityId` | User | `:entityType` = `contact` or `deal`. Returns notes ordered by timestamp desc |
| `POST` | `/notes` | User | `{ "content": "Meeting summary...", "entityType": "contact", "entityId": "id" }` |
| `DELETE`| `/notes/:id` | Author / Admin | Deletes note |

### 7. Dashboard (`/api/v1/dashboard`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard` | User | Returns `{ totalContacts, openDeals, totalPipelineValue, tasksDueToday }`, recent notes & recent deals |
