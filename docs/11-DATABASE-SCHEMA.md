# Database Schema

## Database

PostgreSQL (Supabase)

---

# Standard Column

Semua tabel menggunakan standar berikut:

- id (UUID Primary Key)
- created_at
- updated_at
- deleted_at (Soft Delete)

---

# Table List

## profiles

Deskripsi:
Menyimpan data profil user.

Kolom:

- id
- email
- full_name
- username
- avatar_url
- bio
- created_at
- updated_at
- deleted_at

---

## workspaces

Deskripsi:

Workspace milik user.

Kolom:

- id
- owner_id
- name
- slug
- logo_url
- description
- created_at
- updated_at
- deleted_at

---

## workspace_members

Deskripsi:

Relasi user dengan workspace.

Kolom:

- id
- workspace_id
- profile_id
- role
- joined_at

Role:

- owner
- admin
- member

---

## boards

Kolom:

- id
- workspace_id
- title
- description
- created_by
- created_at
- updated_at
- deleted_at

---

## columns

Kolom:

- id
- board_id
- title
- position
- color
- created_at
- updated_at

---

## tasks

Kolom:

- id
- column_id
- title
- description
- priority
- status
- due_date
- start_date
- position
- estimated_hours
- created_by
- created_at
- updated_at
- deleted_at

Priority:

- low
- medium
- high
- urgent

---

## labels

Kolom:

- id
- workspace_id
- name
- color

---

## task_labels

Kolom:

- task_id
- label_id

---

## task_assignees

Kolom:

- task_id
- profile_id

---

## task_comments

Kolom:

- id
- task_id
- profile_id
- content
- created_at

---

## task_attachments

Kolom:

- id
- task_id
- profile_id
- file_name
- file_url
- file_size
- mime_type
- created_at

---

## activities

Kolom:

- id
- workspace_id
- task_id
- profile_id
- action
- metadata
- created_at

---

## notifications

Kolom:

- id
- profile_id
- title
- message
- is_read
- created_at

---

## ai_conversations

Kolom:

- id
- workspace_id
- profile_id
- title
- created_at

---

## ai_messages

Kolom:

- id
- conversation_id
- role
- content
- token_usage
- created_at

Role:

- user
- assistant

---

# Database Rules

Semua Primary Key menggunakan UUID.

Semua Foreign Key menggunakan ON DELETE CASCADE.

Semua tabel menggunakan Timestamp.

Semua tabel mendukung Soft Delete jika diperlukan.

Semua query akan menggunakan Index.

Semua tabel akan memiliki Row Level Security (RLS).