# NYN Academy — Tuition Centre Admin Dashboard

A modern, single-admin dashboard for managing a tuition centre's day-to-day operations — students, faculty, schedules, attendance, leads, and social media content — all in one sleek interface.

Designed with premium aesthetics, a unified design system, rich animations, and an optimized single-page application structure.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-green?logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4-cyan?logo=tailwindcss)

---

## 📖 Table of Contents
1. [Core Features](#-core-features)
2. [Tech Stack & Architecture](#-tech-stack--architecture)
3. [Project Directory Structure](#-project-directory-structure)
4. [Database Schema Details](#-database-schema-details)
5. [Design System & Styling](#-design-system--styling)
6. [Getting Started](#-getting-started)
7. [Coding Standards & Context for AI Assistants](#-coding-standards--context-for-ai-assistants)
8. [Roadmap & Known Issues](#-roadmap--known-issues)

---

## ✨ Core Features

| Module | Status | Description / Capability |
| :--- | :--- | :--- |
| **Dashboard** | ✅ Complete | Summary stats, today's dynamic class schedule with fast status action buttons, and direct option to delete a schedule in place. |
| **Students** | ✅ Complete | Searchable/filterable paginated listing, assigned faculty mappings, subjects multi-select, full CRUD modals, eye-toggle phone number masking, and direct WhatsApp integration. |
| **Faculty** | ✅ Complete | CRUD capabilities, subjects expertise tracking, eye-toggle phone number masking, and summary statistics powered by a custom Supabase RPC function (`faculty_stats()`). |
| **Schedule** | ✅ Complete | Weekly agenda strip + scrollable daily lists, drag-and-drop rescheduling, color-coded class counts, and a new **Past Schedules History Log** (past 10 schedules, searchable). |
| **Leads** | ✅ Complete | Follow-up pipeline tracking, sources classification, notes, and lead generation logging. |
| **Social Media** | ✅ Complete | Content grid and list preview, scheduling calendar, platform icons mapping, and "mark-as-posted" triggers. |

### Major Enhancements
- **🇮🇳 Indian Standard Time (IST) Support**: Native timezone handling forcing all scheduling displays, creation datetimes, and queries into the `Asia/Kolkata` timezone (+05:30 offset).
- **🟢 WhatsApp Integration**: One-click direct chat links on student phone numbers (`https://wa.me/` with automatic country prefixing).
- **🙈 Phone Masking (Eye Toggle)**: Secure masking of student/faculty phone numbers, revealable dynamically via interactive eye icons.
- **🎨 Color-Coded Subject Tags**: Deterministic, hash-based pastel tag colors for subjects across students, faculty, and schedules.
- **📜 Schedule History & Search**: Archive log segment under the schedule tab to search and view the past 10 scheduled sessions.
- **🌗 Complete Dark/Light Mode**: Smooth transitions with CSS Custom Properties and a theme manager hook.
- **🔐 Auth-Protected Routes**: Automatic session routing via Supabase Auth.
- **⚡ Performance First**: Route-level lazy loading for heavier modules (Schedule & Social pages).
- **🎨 Premium Visual Polish**: High-fidelity gradients, custom scrollbars, subtle scale transitions, glassmorphic layouts, and clear validation feedback.

---

## 🛠 Tech Stack & Architecture

### Core Frontend Stack
- **Framework:** React 19 (Functional components, hooks, suspense)
- **Bundler:** Vite 8 (Ultra-fast HMR and build optimizations)
- **Language:** TypeScript 6 (Strict typing for database schemas, React queries, components)
- **Styling:** Tailwind CSS v4 (Using the new CSS-first configuration and `@tailwindcss/vite` plugin)
- **Routing:** React Router 7 (Single-page app browser routing)

### Data & State Management
- **Database & Auth:** Supabase (Postgres instance + GoTrue Auth)
- **Server State Handling:** TanStack React Query 5 (Enforces robust caching, background fetching, automatic retries, and clean mutation flows - avoids raw `useEffect` fetches)
- **Form Management:** React Hook Form + Zod (Schema validation and input binding)
- **Utilities:** `date-fns` (time parsing & formatting), `clsx` (dynamic utility classes), `@dnd-kit` (drag and drop ready)

---

## 📁 Project Directory Structure

```
NYN_academy/
├── public/                  # Static assets (favicons, icons)
├── src/
│   ├── api/                 # Supabase query & mutation functions
│   │   ├── shared.ts        # Common query logic / helpers
│   │   ├── students.ts      # Student API endpoints
│   │   ├── faculty.ts       # Faculty API endpoints
│   │   ├── schedules.ts     # Class schedules and attendance API endpoints
│   │   ├── leads.ts         # Leads CRUD logic
│   │   └── social.ts        # Social posts API logic
│   ├── components/          # Reusable React components
│   │   ├── auth/            # ProtectedRoute wrapper
│   │   ├── schedule/        # TodayScheduleWidget (dashboard display)
│   │   └── ui/              # Global UI toolkit (DataTable, Modal, Pagination, EmptyState)
│   ├── hooks/               # Custom hooks
│   │   ├── useDebouncedValue.ts
│   │   └── useTheme.ts      # Handles dark/light theme state
│   ├── layouts/             # Master pages
│   │   └── AdminLayout.tsx  # Sidebar navigation, header, theme toggle
│   ├── lib/                 # Core library initializations
│   │   ├── supabase.ts      # Supabase client singleton instance
│   │   └── queryClient.ts   # TanStack QueryClient setup
│   ├── pages/               # Page-level components (Lazy loaded in router)
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── StudentsPage.tsx
│   │   ├── FacultyPage.tsx
│   │   ├── SchedulePage.tsx
│   │   ├── LeadsPage.tsx
│   │   └── SocialPage.tsx
│   ├── router/              # Navigation Routing configurations
│   │   └── index.tsx        # React Router routes definition
│   ├── types/               # TypeScript Definitions
│   │   └── db.ts            # Generated / configured Supabase schema types
│   ├── App.tsx              # Root component wrapping Router + QueryClientProvider
│   ├── main.tsx             # DOM entry point
│   └── index.css            # Styling core, design system tokens, Tailwind components
├── supabase/                # Local Supabase configurations
│   ├── migrations/          # SQL files containing schema version history
│   │   └── 001_init_schema.sql  # Schema migration (Tables, Views, RPC, Indexes)
│   └── seed.sql             # Mock data for local/staging environment
├── .env.example             # Template for API secrets & configurations
├── tsconfig.json            # TypeScript setup
└── vite.config.ts           # Vite plugin config (React, Tailwind integration)
```

---

## 🗄 Database Schema Details

The database is built on PostgreSQL inside Supabase, featuring relational tables, indexes for lookup speed, and enum constraints.

### Entities

1. **`students`**: Personal details, subjects, and faculty assignment.
   - `id` (uuid, Primary Key)
   - `name` (text, non-nullable)
   - `phone` (text)
   - `mode` (text - `'online' | 'offline'`, default: `'offline'`)
   - `assigned_faculty_id` (uuid, Foreign Key -> `faculty.id`)
   - `subjects` (text[], array of subjects taken)
   - `created_at` (timestamp with time zone)

2. **`faculty`**: Teacher information and subjects expertise.
   - `id` (uuid, Primary Key)
   - `name` (text, non-nullable)
   - `phone` (text)
   - `subjects` (text[], array of subjects taught)
   - `created_at` (timestamp with time zone)

3. **`batches`**: Cohort definitions grouping multiple students under a teacher.
   - `id` (uuid, Primary Key)
   - `name` (text, non-nullable)
   - `faculty_id` (uuid, Foreign Key -> `faculty.id`)
   - `student_ids` (uuid[], array of Foreign Keys referencing `students.id`)
   - `subject` (text)
   - `created_at` (timestamp with time zone)

4. **`schedules`**: Individual class sessions (can be tied to a specific student or batch).
   - `id` (uuid, Primary Key)
   - `type` (text - `'individual' | 'batch'`, default: `'individual'`)
   - `student_id` (uuid, Foreign Key -> `students.id`, nullable)
   - `batch_id` (uuid, Foreign Key -> `batches.id`, nullable)
   - `faculty_id` (uuid, Foreign Key -> `faculty.id`, non-nullable)
   - `subject` (text, non-nullable)
   - `start_time` (timestamp with time zone, non-nullable)
   - `end_time` (timestamp with time zone, non-nullable)
   - `mode` (text - `'online' | 'offline'`)
   - `recurrence` (text - `'none' | 'weekly'`, default: `'none'`)
   - `status` (text - `'scheduled' | 'present' | 'absent' | 'cancelled'`, default: `'scheduled'`)
   - `notes` (text)
   - `marked_by` (uuid, references admin auth)
   - `marked_at` (timestamp with time zone)

5. **`attendance_logs`**: History tracking for session execution.
   - `id` (uuid, Primary Key)
   - `schedule_id` (uuid, Foreign Key -> `schedules.id`, Cascade Delete)
   - `date` (date)
   - `status` (text)
   - `notes` (text)
   - `created_at` (timestamp with time zone)

6. **`leads`**: CRM pipeline records.
   - `id` (uuid, Primary Key)
   - `name` (text, non-nullable)
   - `phone` (text)
   - `source` (text)
   - `status` (text - `'new' | 'contacted' | 'joined' | 'lost'`, default: `'new'`)
   - `notes` (text)
   - `follow_up_date` (date)
   - `created_at` (timestamp with time zone)

7. **`social_posts`**: Content calendar database.
   - `id` (uuid, Primary Key)
   - `platform` (text - `'instagram' | 'facebook' | 'youtube' | 'linkedin'`, non-nullable)
   - `content` (text, non-nullable)
   - `scheduled_date` (timestamp with time zone, non-nullable)
   - `status` (text - `'draft' | 'scheduled' | 'posted'`, default: `'draft'`)
   - `created_at` (timestamp with time zone)

### Custom Database Functions (RPC)
- **`faculty_stats()`**: Aggregates the database to count active student assignments and upcoming schedules assigned to each faculty member. Returns table values of:
  - `faculty_id` (uuid)
  - `student_count` (int)
  - `schedule_count` (int)

---

## 🎨 Design System & Styling

The styling architecture leverages custom utilities declared in [index.css](file:///d:/experimentation/NYN_academy/src/index.css) mapped using standard CSS Custom Properties for immediate client-side theme synchronization.

### Semantic Tokens (Light & Dark Themes)
- **Brand Identity**: `--brand` (`#2563eb` Blue) / Hover state: `--brand-hover`
- **Backgrounds**: `--bg-primary` (main body background), `--bg-card` (elevated card backgrounds)
- **Text Layers**: `--text-primary` (high-contrast title text), `--text-muted` (supporting sub-headers), `--text-lighter` (placeholders, disabled fields)
- **Borders**: `--border` (standard structural rule lines), `--border-hover` (focused input outline overrides)

### Custom Utility Class Shortcuts
To ensure complete design uniformity, always utilize these standard utility definitions:
- `.app-card`: Base container background with rounded borders, default light shadows, and soft transform animations on focus.
- `.app-input`: Form elements with consistent styling for disabled/focus states, incorporating transition rings.
- `.app-button-primary` / `.app-button-secondary`: Uniform button setups with built-in active scale and shadow effects.
- `.app-badge-[success/warning/danger/info]`: Soft pastel badges customized for dark mode compatibility.

---

## 🚀 Getting Started

### Prerequisites
- Node.js version 18 or above
- A running Supabase instance

### Setup Flow

1. **Install Packages**
   ```bash
   npm install
   ```

2. **Configure Environment variables**
   Create a `.env` file from the example template:
   ```bash
   cp .env.example .env
   ```
   Provide your specific project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-url.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
   ```

3. **Deploy Database SQL**
   You can push migrations via the Supabase CLI (`supabase db push`) or open [001_init_schema.sql](file:///d:/experimentation/NYN_academy/supabase/migrations/001_init_schema.sql) and execute it inside the Supabase SQL Editor. To load demo data, run the [seed.sql](file:///d:/experimentation/NYN_academy/supabase/seed.sql) script.

4. **Run Dev Environment**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to see your running instance.

---

## 🤝 Coding Standards & Context for AI Assistants

When analyzing, modifying, or creating components in this workspace, follow these explicit technical rules:

### 1. Data Fetching and Mutations
- **No Direct `useEffect` Fetching**: Always wrap asynchronous calls to Supabase API inside TanStack React Query (`useQuery` and `useMutation`).
- **Query Keys**: Ensure all query keys are clearly structured in `src/api/` (e.g. `['students']`, `['faculty', id]`).
- **Mutation Cache Invalidation**: Following a successful CRUD mutation (create, edit, delete), use `queryClient.invalidateQueries` to refresh the state in the background. Do not hard reload the page.
- **Error Handling**: Use `.catch()` inside API functions to surface errors, and present them in the UI states.

### 2. Styling Rules
- **Respect CSS Variables**: Refrain from using hardcoded colors (e.g., `bg-white` or `text-gray-900`) for surfaces/text. Use utility semantic classes like `bg-[var(--bg-card)]` or direct custom classes (`app-card`, `app-input`) to support Dark/Light mode properly.
- **Micro-Interactions**: Use CSS transitions (`transition-all duration-200 ease-in-out`) for hover, active, and scale animations.

### 3. Component Architecture
- **Lazy Load Routing**: Lazy-load all page route panels in the main router definition except for critical entry screens like `Dashboard` and `Login`.
- **Form Validation**: Always pair form inputs with React Hook Form, backed by Zod schemas defined at the top of the page files or in types to catch UI input issues prior to network submission.
- **Strict TypeScript**: Avoid `any` types. Make sure queries reference database definitions (`Database['public']['Tables']['...']['Row']`) present in [db.ts](file:///d:/experimentation/NYN_academy/src/types/db.ts).

---

## 🔮 Roadmap & Known Issues
- 🛠 **Toast Notification Engine**: Create a unified toast framework to display successful CRUD messages or alert handling.
- 🔐 **Supabase RLS Rules**: Enable Row Level Security (RLS) on all tables mapping rules specifically for `authenticated` roles.
- 📅 **Calendar Timeline Layout**: Add a weekly or monthly grid calendar view overlay for the Schedule page.
- 🎯 **Extended Validation**: Fully align Zod schemas to database constraints across all modal workflows.
- 📤 **Export Formats**: Add CSV/PDF export capability for Students, Faculty, and Attendance records.
