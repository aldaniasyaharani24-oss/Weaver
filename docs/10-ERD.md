# Entity Relationship Diagram (ERD)

## Tujuan

Dokumen ini menjelaskan struktur database utama untuk aplikasi Kanban AI.

Database dirancang menggunakan PostgreSQL (Supabase) dengan pendekatan production-ready yang mendukung:

- Multi Workspace
- Multi User
- Role & Permission
- Kanban Board
- AI Assistant
- Activity Log
- Notification
- Realtime Collaboration

---

# Entity

## Authentication

Supabase Auth

↓

profiles

---

## Workspace

workspaces

↓

workspace_members

---

## Kanban

boards

↓

columns

↓

tasks

---

## Task

tasks

↓

task_labels

↓

labels

---

tasks

↓

task_assignees

↓

profiles

---

tasks

↓

task_comments

↓

profiles

---

tasks

↓

task_attachments

---

tasks

↓

activities

---

## AI

ai_conversations

↓

ai_messages

---

## Notification

notifications

---

# Entity List

1. profiles

2. workspaces

3. workspace_members

4. boards

5. columns

6. tasks

7. labels

8. task_labels

9. task_assignees

10. task_comments

11. task_attachments

12. activities

13. notifications

14. ai_conversations

15. ai_messages

---

# Relationship

profiles

1 ---- N workspace_members

workspaces

1 ---- N boards

boards

1 ---- N columns

columns

1 ---- N tasks

tasks

1 ---- N comments

tasks

1 ---- N attachments

tasks

N ---- N labels

tasks

N ---- N assignees

profiles

1 ---- N notifications

profiles

1 ---- N ai_conversations

ai_conversations

1 ---- N ai_messages

---

# Design Principles

- UUID Primary Key
- Soft Delete
- Timestamp
- Audit Trail
- Row Level Security
- Foreign Key Constraint
- Cascade Delete
- Production Ready