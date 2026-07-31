# 🔌 API Specification

## Project Information

| Item | Value |
|------|-------|
| Project | Kanban AI |
| Version | 1.0 |
| Framework | Next.js 15 |
| Pattern | Server Actions |
| Backend | Supabase |

---

# Overview

Project tidak menggunakan REST API tradisional.

Semua komunikasi mengikuti pola:

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
```

---

# Authentication Module

## Login

Action

login()

Input

```ts
{
  email: string
  password: string
}
```

Output

```ts
{
  success: boolean
  user: User
}
```

---

## Register

Action

register()

Input

```ts
{
  fullName: string
  email: string
  password: string
}
```

Output

```ts
{
  success: boolean
}
```

---

## Logout

Action

logout()

Output

```ts
{
  success: true
}
```

---

# Workspace Module

## Create Workspace

Action

createWorkspace()

Input

```ts
{
  name: string
  description?: string
}
```

Output

Workspace

---

## Update Workspace

Action

updateWorkspace()

---

## Delete Workspace

Action

deleteWorkspace()

---

## Invite Member

Action

inviteMember()

---

# Board Module

## Create Board

Input

```ts
{
  workspaceId: string
  name: string
}
```

---

## Update Board

---

## Delete Board

---

## Favorite Board

---

# Column Module

## Create Column

Input

```ts
{
  boardId: string
  name: string
}
```

---

## Update Column

---

## Delete Column

---

## Reorder Column

---

# Task Module

## Create Task

Input

```ts
{
  columnId: string
  title: string
}
```

---

## Update Task

---

## Delete Task

---

## Move Task

---

## Archive Task

---

## Restore Task

---

# Checklist Module

Create

Update

Delete

Complete

---

# Comment Module

Create

Update

Delete

---

# Attachment Module

Upload

Delete

Preview

---

# Notification Module

Create

Read

Delete

Mark As Read

---

# AI Module

## Generate Task

Input

```ts
{
  prompt: string
}
```

Output

```ts
Task[]
```

---

## AI Summary

Input

Board

Output

Summary

---

## AI Priority

Output

Priority

---

## AI Risk

Output

Risk

---

## AI Complexity

Output

Easy

Medium

Hard

---

# Authorization

Role

Owner

Admin

Member

Viewer

Permission

Owner

- Full Access

Admin

- Workspace Management

Member

- Task CRUD

Viewer

- Read Only

---

# Error Response

Semua Action menggunakan format:

```ts
{
  success: false,
  message: string
}
```

---

# Success Response

```ts
{
  success: true,
  data: {}
}
```

---

# Validation

Semua Input menggunakan:

- Zod

---

# Repository Rule

UI

❌ Tidak boleh Query Database

Service

❌ Tidak boleh JSX

Repository

✅ Query Database

---

# API Version

Current Version

v1.0

---

# Future APIs

Public API

Webhook

Mobile API

AI API

GraphQL (Optional)