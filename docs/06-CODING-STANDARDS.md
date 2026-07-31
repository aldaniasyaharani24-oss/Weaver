# 💻 Coding Standards

## Project Information

| Item | Value |
|------|-------|
| Project | Kanban AI |
| Version | 1.0 |
| Language | TypeScript |
| Framework | Next.js 15 |
| Architecture | Feature-Based |

---

# 1. General Principles

Semua kode harus mengikuti prinsip:

- Clean Code
- SOLID
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Separation of Concerns

Business Logic tidak boleh berada di UI.

---

# 2. Language

Gunakan:

- TypeScript Strict Mode

Dilarang:

- JavaScript
- any (kecuali benar-benar diperlukan)

---

# 3. Folder Rules

Semua fitur wajib menggunakan struktur berikut.

```text
feature/

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

---

# 4. Component Rules

Gunakan:

- Functional Component
- Server Component (default)
- Client Component hanya jika diperlukan

Dilarang:

- Class Component

---

# 5. Naming Convention

## Component

PascalCase

```text
TaskCard.tsx

BoardHeader.tsx

DashboardLayout.tsx
```

---

## Hook

camelCase

```text
useTask.ts

useBoard.ts
```

---

## Service

```text
task.service.ts
```

---

## Repository

```text
task.repository.ts
```

---

## Action

```text
task.actions.ts
```

---

## Schema

```text
task.schema.ts
```

---

## Constant

```text
TASK_STATUS.ts
```

---

# 6. Import Rules

Gunakan alias:

```ts
@/components

@/features

@/lib

@/utils
```

Jangan gunakan import relatif yang panjang seperti:

```ts
../../../../components
```

---

# 7. Validation

Semua validasi wajib menggunakan:

- Zod

Tidak boleh validasi manual.

---

# 8. Form

Semua form wajib menggunakan:

- React Hook Form
- Zod Resolver

---

# 9. State Management

Gunakan:

- TanStack Query → Server State
- React Context → UI State

Jangan gunakan Redux.

---

# 10. Server Action

Semua operasi database melalui:

Server Action

↓

Service

↓

Repository

↓

Supabase

Component tidak boleh langsung memanggil database.

---

# 11. Error Handling

Semua fitur wajib memiliki:

- Loading
- Error
- Empty
- Success

---

# 12. Logging

Catat aktivitas berikut:

- Login
- Logout
- Create
- Update
- Delete
- Invite
- Move Task

---

# 13. Styling

Gunakan:

- Tailwind CSS
- shadcn/ui

Jangan membuat CSS manual kecuali benar-benar diperlukan.

---

# 14. Icons

Gunakan:

Lucide React

---

# 15. Notifications

Gunakan:

Sonner

---

# 16. Drag & Drop

Gunakan:

dnd-kit

---

# 17. AI

Gunakan:

Vercel AI SDK

Semua prompt AI berada di feature AI.

---

# 18. Database

Semua query melalui Repository.

Tidak boleh query langsung dari Component.

---

# 19. Git Convention

Branch:

```text
feature/auth

feature/task

feature/board

fix/login

hotfix/session
```

Commit:

```text
feat: add authentication

fix: resolve login issue

refactor: improve task service

docs: update roadmap

style: format code

test: add auth test
```

---

# 20. Code Review Checklist

Sebelum merge:

- Build berhasil
- TypeScript bersih
- ESLint bersih
- Tidak ada console.log
- Tidak ada TODO
- Tidak ada any
- Dokumentasi diperbarui

---

# Definition of Done

Sebuah fitur dianggap selesai jika:

- Kode sesuai standar
- Build berhasil
- TypeScript tanpa error
- ESLint tanpa error
- Direview oleh Tech Lead
- Diuji
- Dokumentasi diperbarui