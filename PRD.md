1. Informasi Produk
Nama Produk

Kanban AI

Versi

v1.0 (MVP)

Status

Draft 1.0

Product Owner

Anda

Tech Lead

ChatGPT

Developer

MiMo Code AI

2. Latar Belakang

Banyak aplikasi manajemen proyek seperti Trello, Jira, dan Asana berfokus pada pencatatan tugas, namun belum memanfaatkan AI secara mendalam untuk membantu pengguna mengambil keputusan.

Kanban AI bertujuan menjadi platform manajemen proyek modern yang tidak hanya mengelola tugas, tetapi juga memberikan analisis, rekomendasi, dan otomatisasi berbasis AI untuk meningkatkan produktivitas individu maupun tim.

3. Visi Produk

Membangun aplikasi manajemen proyek berbasis Kanban yang memanfaatkan Artificial Intelligence untuk membantu pengguna merencanakan, mengelola, dan menyelesaikan pekerjaan secara lebih efisien.

4. Tujuan Produk
Tujuan Bisnis
Membuat aplikasi SaaS modern.
Menjadi portofolio profesional Full Stack + AI.
Siap dikembangkan menjadi produk komersial.
Tujuan Pengguna
Mengelola proyek dengan mudah.
Mengatur prioritas pekerjaan.
Memantau progres proyek.
Mendapat rekomendasi dari AI.
Mengurangi pekerjaan administratif.
5. Target Pengguna
Primary User
Mahasiswa
Freelancer
Software Developer
Startup
Project Manager
Secondary User
Digital Agency
UMKM
Tim Internal Perusahaan
6. Scope MVP
Authentication
Register
Login
Logout
Forgot Password
Reset Password
Workspace
Create Workspace
Edit Workspace
Delete Workspace
Board
Create Board
Update Board
Delete Board
Column

Default:

Todo
In Progress
Done

Custom:

Add Column
Delete Column
Reorder Column
Task
Create Task
Edit Task
Delete Task
Due Date
Priority
Label
Description
Assignee
Checklist
Drag & Drop
Drag Task
Move Column
Reorder Task
Dashboard
Statistik
Total Task
Completed
Progress
Activity
AI Features (MVP)
AI Summary

Contoh

Ringkas progres proyek minggu ini.

AI Priority

AI memberi prioritas otomatis.

AI Complexity

AI menilai tingkat kesulitan.

AI Deadline Risk

AI memberi peringatan jika kemungkinan terlambat.

AI Task Generator

Contoh

Buat task untuk membuat website company profile.

AI akan menghasilkan daftar task.

7. Out of Scope (Versi Berikutnya)

Tidak masuk MVP:

Video Call
Chat Internal
Calendar Sync
Gantt Chart
Time Tracking
Invoice
Billing
Marketplace
Mobile App
8. User Roles
Admin
Mengelola Workspace
Mengelola Member
Menghapus Board
Member
CRUD Task
Komentar
Upload Lampiran
Viewer
Hanya melihat Board
9. Functional Requirements
Authentication

Pengguna dapat:

Register
Login
Logout
Reset Password
Workspace

Pengguna dapat:

Membuat Workspace
Mengundang Member
Menghapus Workspace
Board

Pengguna dapat:

Membuat Board
Mengubah Board
Menghapus Board
Task

Task memiliki:

Title
Description
Priority
Status
Due Date
Labels
Assignee
Attachment
Checklist
AI

AI mampu:

Merangkum Board
Menghasilkan Task
Memberi Prioritas
Memberi Estimasi
Memberi Analisis Risiko
10. Non Functional Requirements
Performance
Initial Load < 3 detik
Drag & Drop responsif
AI Response < 10 detik
Security
Supabase Auth
Row Level Security
HTTPS
Server Action
Environment Variable
Scalability

Mendukung:

Multi Workspace
Ribuan Task
Banyak Board
Maintainability
Feature-Based Architecture
TypeScript Strict
ESLint
Prettier
11. Tech Stack
Layer	Teknologi
Framework	Next.js 15
Language	TypeScript
Backend	Supabase
Database	PostgreSQL
Auth	Supabase Auth
Styling	Tailwind CSS
UI	shadcn/ui
Icons	Lucide React
DnD	dnd-kit
Forms	React Hook Form
Validation	Zod
AI	Vercel AI SDK + OpenAI
State	TanStack Query + React Context
Storage	Supabase Storage
Notification	Sonner
Deployment	Vercel
12. Success Metrics

MVP dianggap berhasil jika:

Pengguna dapat membuat Workspace, Board, Column, dan Task.
Drag & Drop berjalan lancar.
AI dapat menghasilkan ringkasan dan daftar tugas.
Sistem mendukung kolaborasi multi-user dengan aman.
Deployment berhasil di Vercel dengan performa yang baik.