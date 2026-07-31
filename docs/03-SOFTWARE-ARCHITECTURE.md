# 🏗️ Software Architecture Document (SAD)

## Project Information

| Item | Value |
|------|-------|
| Project | Kanban AI |
| Version | 1.0 |
| Status | Draft |
| Architecture | Feature-Based Architecture |
| Framework | Next.js 15 App Router |
| Language | TypeScript |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| AI | OpenAI (Vercel AI SDK) |

---

# 1. Overview

Kanban AI adalah aplikasi Project Management modern berbasis Kanban yang mengintegrasikan Artificial Intelligence untuk membantu pengguna mengelola proyek, tugas, dan kolaborasi tim.

Arsitektur sistem dirancang agar:

- Modular
- Mudah dikembangkan
- Mudah diuji
- Mudah dipelihara
- Production Ready

---

# 2. Architecture Style

Project menggunakan:

- Feature-Based Architecture
- Repository Pattern
- Service Layer
- Server Actions
- Component-Based UI

Tujuan:

- Memisahkan Business Logic
- Mengurangi Coupling
- Memudahkan Maintenance
- Memudahkan Testing

---

# 3. High Level Architecture

```text
Browser
    │
    ▼
Next.js App Router
    │
    ▼
Server Actions
    │
    ▼
Services
    │
    ▼
Repositories
    │
    ▼
Supabase
```

---

# 4. AI Architecture

```text
User

↓

AI Component

↓

AI Action

↓

AI Service

↓

Prompt

↓

OpenAI

↓

Response
```

---

# 5. Folder Structure

```text
src/

app/

components/

features/

hooks/

lib/

providers/

types/

utils/

config/

constants/
```

---

# 6. Feature Structure

Semua feature WAJIB mengikuti struktur berikut.

```text
feature-name/

actions/

components/

hooks/

repository/

services/

validation/

types.ts

constants.ts

index.ts
```

Contoh

```text
features/

task/

actions/

components/

hooks/

repository/

services/

validation/

types.ts

index.ts
```

---

# 7. Layer Responsibility

## UI Layer

Berisi:

- Page
- Component
- Layout

Tidak boleh memiliki business logic.

---

## Action Layer

Berisi:

Server Actions.

Tugas:

- Validasi Session
- Memanggil Service

Tidak boleh berisi Query Database.

---

## Service Layer

Berisi seluruh Business Logic.

Contoh:

- Create Task
- Move Task
- Calculate Progress
- AI Summary

Service tidak boleh mengetahui UI.

---

## Repository Layer

Berisi komunikasi dengan Supabase.

Contoh:

- Insert
- Update
- Delete
- Select

Tidak boleh berisi Business Logic.

---

# 8. Data Flow

Semua data mengikuti alur berikut.

```text
UI

↓

Server Action

↓

Service

↓

Repository

↓

Supabase

↓

Repository

↓

Service

↓

UI
```

---

# 9. Authentication Flow

```text
Login

↓

Supabase Auth

↓

Session

↓

Middleware

↓

Dashboard
```

Semua Route Dashboard wajib melalui Middleware.

---

# 10. State Management

Menggunakan:

- TanStack Query
- React Context

React Context digunakan hanya untuk:

- Theme
- Sidebar
- Session ringan

Data Server menggunakan TanStack Query.

---

# 11. Form Validation

Semua form menggunakan:

- React Hook Form
- Zod

Tidak boleh menggunakan validasi manual.

---

# 12. Error Handling

Setiap halaman wajib memiliki:

- Loading State
- Error State
- Empty State
- Success State

---

# 13. Security

Standar keamanan:

- HTTPS
- Supabase Auth
- Row Level Security (RLS)
- Environment Variables
- Server Actions
- Input Validation
- SQL Injection Protection

---

# 14. AI Module

AI memiliki beberapa layanan:

- Generate Task
- Summarize Board
- Analyze Task
- Estimate Complexity
- Detect Deadline Risk
- AI Chat

Semua AI dipisahkan dalam Feature AI.

---

# 15. Database

Database menggunakan:

Supabase PostgreSQL

Storage menggunakan:

Supabase Storage

Realtime menggunakan:

Supabase Realtime

---

# 16. Coding Principles

Project mengikuti prinsip:

- SOLID
- DRY
- KISS
- Clean Code
- Single Responsibility

---

# 17. Naming Convention

## File

Gunakan:

```text
task.service.ts

task.repository.ts

task.schema.ts

task.actions.ts
```

---

## Component

PascalCase

```text
TaskCard.tsx

KanbanBoard.tsx
```

---

## Hooks

camelCase

```text
useTask.ts

useBoard.ts
```

---

## Constant

UPPER_CASE

```ts
export const TASK_STATUS = {}
```

---

# 18. Dependency Rules

UI

↓

Action

↓

Service

↓

Repository

↓

Supabase

Rule:

- UI tidak boleh mengakses Supabase.
- Component tidak boleh mengakses Database.
- Service tidak boleh menggunakan JSX.
- Repository tidak boleh mengetahui UI.

---

# 19. Performance Strategy

Menggunakan:

- Lazy Loading
- Server Components
- Dynamic Import
- Image Optimization
- Query Cache
- Pagination

---

# 20. Logging

Aktivitas yang dicatat:

- Login
- Logout
- Create Task
- Delete Task
- Update Task
- Move Task
- Invite Member

---

# 21. Future Scalability

Project dirancang agar mendukung:

- Multi Workspace
- Multi Board
- Multi Team
- Multi Role
- AI Assistant
- Notification
- Mobile App
- API Public

---

# 22. Technology Stack

| Layer | Technology |
|--------|------------|
| Frontend | Next.js 15 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui |
| Icons | Lucide React |
| Database | PostgreSQL |
| Backend | Supabase |
| Authentication | Supabase Auth |
| Validation | Zod |
| Form | React Hook Form |
| AI | OpenAI + Vercel AI SDK |
| Drag & Drop | dnd-kit |
| State | TanStack Query |
| Storage | Supabase Storage |
| Deployment | Vercel |

---

# 23. Architecture Decisions

Keputusan utama proyek:

- Menggunakan Feature-Based Architecture.
- Menggunakan Server Actions.
- Menggunakan Repository Pattern.
- Menggunakan Service Layer.
- Menggunakan Supabase sebagai Backend.
- Menggunakan AI terpisah dalam Feature AI.
- Menggunakan TypeScript Strict Mode.
- Menggunakan TanStack Query untuk Server State.
- Menggunakan React Context hanya untuk UI State.

Semua keputusan arsitektur harus mendapat persetujuan Tech Lead sebelum diimplementasikan.

---

# 24. Definition of Done

Sebuah fitur dianggap selesai jika:

- Berhasil Build
- Tidak ada Error TypeScript
- Tidak ada Error ESLint
- Sudah direview
- Sudah diuji
- Mengikuti Coding Standards
- Dokumentasi diperbarui