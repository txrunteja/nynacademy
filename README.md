# NYN Academy — Tuition Centre Admin Dashboard

A modern, single-admin dashboard for managing a tuition centre's day-to-day operations — students, faculty, schedules, attendance, leads, and social media content — all in one sleek interface.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-cyan?logo=tailwindcss)

---

## ✨ Features

| Module         | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| **Dashboard**  | Stats overview + today's schedule with quick status actions              |
| **Students**   | Paginated table with search/filter, add/edit/delete modals              |
| **Faculty**    | Full CRUD with faculty stats via RPC                                    |
| **Schedule**   | Week strip + day list view, create form, load-based coloring            |
| **Leads**      | Filtered lead table with add/edit capabilities                          |
| **Social**     | Grid/list content cards, scheduling, mark-as-posted                     |

### Other Highlights

- 🌗 **Dark / Light mode** with smooth transitions
- 🔐 **Auth-protected routes** via Supabase email/password
- ⚡ **Route-level lazy loading** for Schedule & Social pages
- 🎨 **Premium design system** — gradients, glassmorphism, micro-animations
- 📱 **Responsive layout** with modern sidebar navigation

---

## 🛠 Tech Stack

- **Framework:** React 19 + Vite 8
- **Language:** TypeScript 6
- **Database & Auth:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS 4
- **State Management:** TanStack React Query 5
- **Routing:** React Router 7
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Drag & Drop:** dnd-kit (installed)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- A [Supabase](https://supabase.com/) project

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/NYN_academy.git
cd NYN_academy
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase project URL and anon key:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> You can find these in your [Supabase Dashboard](https://supabase.com/dashboard) → **Project Settings** → **API**.

### 4. Set up the database

Run the migration and seed files against your Supabase project:

```bash
# Apply the schema migration
# Option A: Via Supabase CLI
supabase db push

# Option B: Manually run supabase/migrations/001_init_schema.sql
#           in the Supabase SQL Editor

# (Optional) Seed sample data
# Run supabase/seed.sql in the SQL Editor
```

### 5. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📁 Project Structure

```
NYN_academy/
├── public/                  # Static assets (favicon, icons)
├── src/
│   ├── api/                 # Supabase query/mutation functions
│   ├── components/
│   │   ├── auth/            # ProtectedRoute
│   │   ├── schedule/        # TodayScheduleWidget
│   │   └── ui/              # DataTable, Modal, Pagination, EmptyState
│   ├── hooks/               # Custom hooks (debounce, theme)
│   ├── layouts/             # AdminLayout (sidebar + main)
│   ├── lib/                 # Supabase client, query client, helpers
│   ├── pages/               # Route pages (Dashboard, Students, etc.)
│   ├── router/              # Route definitions
│   ├── types/               # TypeScript types (db.ts)
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Entry point
│   └── index.css            # Design system & global styles
├── supabase/
│   ├── migrations/          # SQL schema migrations
│   └── seed.sql             # Sample data
├── .env.example             # Environment variable template
├── index.html               # HTML entry
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🗄 Database Schema

| Table              | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `students`         | Student records (name, phone, mode, subjects)  |
| `faculty`          | Faculty records (name, phone, subjects)        |
| `batches`          | Batch groupings (faculty, students, subject)   |
| `schedules`        | Class schedule entries with status tracking     |
| `attendance_logs`  | Per-schedule attendance records                 |
| `leads`            | Prospective student leads with follow-ups       |
| `social_posts`     | Social media content with scheduling            |

---

## 📜 Available Scripts

| Script            | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Start Vite dev server                  |
| `npm run build`   | Type-check + production build          |
| `npm run preview` | Preview the production build locally   |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
