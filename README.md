# Private Notes Vault

A minimal, secure notes app built with **vanilla HTML/CSS/JS** + **Supabase Auth/DB**. Each user can create, view, edit, and delete *their own* notes, with **Row Level Security (RLS)** enforcing ownership.

## Features

- **Authentication**
  - Email/password sign in (with sign up fallback)
  - Google OAuth sign in
- **Notes**
  - Create notes (title + content)
  - List notes (newest first)
  - Edit notes
  - Delete notes
- **Security**
  - RLS policies restrict access to the authenticated user’s rows
- **UI**
  - Calm, distraction-free styling
  - Mobile-friendly layout (single breakpoint)

## Tech stack

- **Frontend**: HTML, CSS, JavaScript (ES Modules)
- **Backend**: Supabase (Auth + Postgres)

## Project structure

```
private-notes-vault/
  index.html
  notes.html
  css/style.css
  js/
    supabase.js
    auth.js
    notes.js
```

## Setup (Supabase)

### 1) Create a Supabase project

- Enable **Email** auth.
- Enable **Google** auth (optional but supported).

### 2) Configure your client keys

Edit `js/supabase.js` and set:
- `SUPABASE_URL`: your project URL (looks like `https://xxxxx.supabase.co`)
- `SUPABASE_ANON_KEY`: your **anon/public** key (a long JWT starting with `eyJ...`)

> The anon key is designed to be used in the browser. Do **not** use the `service_role` key on the client.

### 3) Create the `notes` table

Run this in **Supabase SQL Editor**:

```sql
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  content text,
  created_at timestamptz not null default now()
);

alter table public.notes enable row level security;
```

### 4) Add RLS policies (ownership enforced)

```sql
create policy "notes_select_own"
on public.notes
for select
to authenticated
using (auth.uid() = user_id);

create policy "notes_insert_own"
on public.notes
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "notes_update_own"
on public.notes
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "notes_delete_own"
on public.notes
for delete
to authenticated
using (auth.uid() = user_id);
```

> With RLS enabled, **do not** filter by `user_id` in JavaScript. The database policies enforce ownership.

### 5) Configure OAuth redirect URLs (Google)

In Supabase: **Authentication → URL Configuration**

- Add your local/dev URL (example):
  - `http://localhost:5500`
  - `http://127.0.0.1:5500`
- Add your production URL when deployed.

## Run locally

You must serve the folder with a local web server (ES modules don’t work via `file://`).

### Option A: VS Code Live Server

- Open the `private-notes-vault/` folder
- Start **Live Server**
- Open `index.html`

### Option B: Python (no Node required)

```bash
cd private-notes-vault
python -m http.server 5500
```

Then open:

- `http://localhost:5500/index.html`

## Usage

- **Login**: Email/password or Google OAuth
- **Notes page**: Create notes, click **Edit** to update, or **Delete**

## Troubleshooting

- **Google OAuth returns but notes page redirects back**
  - Ensure redirect URLs are configured in Supabase
  - Ensure you are serving via `http://localhost:...` (not `file://`)
- **Auth works but notes don’t load**
  - Confirm RLS policies exist and table columns match

## License

Educational / internship evaluation project.