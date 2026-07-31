# 🗄️ Database Design

## Project Information

| Item | Value |
|------|-------|
| Project | Kanban AI |
| Database | PostgreSQL |
| Backend | Supabase |
| Version | 1.0 |
| Status | Draft |

---

# 1. Database Overview

Kanban AI menggunakan PostgreSQL melalui Supabase sebagai database utama.

Database dirancang dengan prinsip:

- Relasional
- Scalable
- Secure (RLS)
- Audit Friendly
- Multi Workspace
- Multi User

---

# 2. Entity Relationship

```text
User
 │
 ├── Workspace
 │      │
 │      ├── Member
 │      │
 │      ├── Board
 │      │      │
 │      │      ├── Column
 │      │      │      │
 │      │      │      ├── Task
 │      │      │      │      ├── Checklist
 │      │      │      │      ├── Comment
 │      │      │      │      ├── Attachment
 │      │      │      │      └── Activity
```

---

# 3. Tables

## users

Data berasal dari Supabase Auth.

Additional Profile:

| Field | Type |
|------|------|
| id | uuid |
| full_name | text |
| avatar_url | text |
| created_at | timestamptz |

---

## workspaces

| Field | Type |
|------|------|
| id | uuid |
| owner_id | uuid |
| name | text |
| description | text |
| created_at | timestamptz |
| updated_at | timestamptz |

---

## workspace_members

| Field | Type |
|------|------|
| id | uuid |
| workspace_id | uuid |
| user_id | uuid |
| role | text |
| joined_at | timestamptz |

Role:

- owner
- admin
- member
- viewer

---

## boards

| Field | Type |
|------|------|
| id | uuid |
| workspace_id | uuid |
| name | text |
| description | text |
| color | text |
| created_at | timestamptz |

---

## columns

| Field | Type |
|------|------|
| id | uuid |
| board_id | uuid |
| name | text |
| position | integer |

---

## tasks

| Field | Type |
|------|------|
| id | uuid |
| column_id | uuid |
| title | text |
| description | text |
| priority | text |
| due_date | date |
| assignee_id | uuid |
| position | integer |
| status | text |
| created_at | timestamptz |
| updated_at | timestamptz |

Priority:

- Low
- Medium
- High
- Urgent

Status:

- Todo
- In Progress
- Done

---

## labels

| Field | Type |
|------|------|
| id | uuid |
| workspace_id | uuid |
| name | text |
| color | text |

---

## task_labels

Many To Many

| Field | Type |
|------|------|
| task_id | uuid |
| label_id | uuid |

---

## checklists

| Field | Type |
|------|------|
| id | uuid |
| task_id | uuid |
| title | text |
| completed | boolean |

---

## comments

| Field | Type |
|------|------|
| id | uuid |
| task_id | uuid |
| user_id | uuid |
| content | text |
| created_at | timestamptz |

---

## attachments

| Field | Type |
|------|------|
| id | uuid |
| task_id | uuid |
| file_name | text |
| file_url | text |
| file_size | bigint |
| created_at | timestamptz |

---

## notifications

| Field | Type |
|------|------|
| id | uuid |
| user_id | uuid |
| title | text |
| message | text |
| is_read | boolean |
| created_at | timestamptz |

---

## activities

Audit Log

| Field | Type |
|------|------|
| id | uuid |
| workspace_id | uuid |
| user_id | uuid |
| action | text |
| entity | text |
| entity_id | uuid |
| created_at | timestamptz |

---

# 4. Relationships

users

↓

workspaces

↓

boards

↓

columns

↓

tasks

↓

comments

↓

attachments

---

# 5. Storage Buckets

Supabase Storage

Buckets:

avatars

attachments

workspace-assets

---

# 6. Index Strategy

Index pada:

- owner_id
- workspace_id
- board_id
- column_id
- assignee_id
- due_date
- created_at

---

# 7. Row Level Security (RLS)

Semua tabel wajib mengaktifkan RLS.

Rules:

- User hanya dapat melihat workspace miliknya atau workspace tempat ia menjadi anggota.
- User hanya dapat mengubah data yang memiliki izin.
- Viewer hanya memiliki akses baca.
- Admin dapat mengelola board dan member.
- Owner memiliki akses penuh.

---

# 8. Soft Delete

Tabel berikut menggunakan soft delete:

- workspaces
- boards
- tasks

Field:

deleted_at timestamptz

---

# 9. Audit Trail

Semua perubahan penting dicatat ke tabel activities.

Contoh:

- Task Created
- Task Updated
- Task Deleted
- Task Moved
- Member Invited
- Board Created

---

# 10. Migration Strategy

Urutan migration:

1. users
2. workspaces
3. workspace_members
4. boards
5. columns
6. tasks
7. labels
8. task_labels
9. checklists
10. comments
11. attachments
12. notifications
13. activities

---

# 11. Seed Data

Workspace:

- Personal Workspace

Default Board:

- Project Board

Default Columns:

- Todo
- In Progress
- Done

---

# 12. Future Database

Database dirancang agar mendukung:

- AI History
- Time Tracking
- Calendar
- Sprint
- Gantt
- Billing
- Teams
- Public API

---

# 13. Database Principles

Semua tabel wajib:

- Primary Key UUID
- Foreign Key
- Timestamp
- RLS Enabled
- Indexed
- Audit Ready

Tidak diperbolehkan:

- Hard Delete (untuk data utama)
- Query tanpa index
- Menyimpan password
- Business Logic di Database