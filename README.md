# Private Notes Vault

A minimal, secure notes app built with **vanilla HTML/CSS/JS** + **Supabase Auth/DB**. Each user can create, view, edit, and delete *their own* notes, with **Row Level Security (RLS)** enforcing ownership.

## 🚀 Live Demo

**[https://private-notes-vault1.netlify.app/](https://private-notes-vault1.netlify.app/)**

Try it now! Sign in with email/password or Google OAuth.

## ✨ Features

### Authentication
- Email/password sign in (with automatic sign up fallback)
- Google OAuth sign in
- Session management with automatic redirect handling
- User profile display (User ID and email) on notes page

### Email Verification & SMTP
- Supabase Auth handles email/password authentication
- Email verification is enabled for new user accounts
- Custom SMTP is configured to improve email delivery reliability
- Avoids free-tier rate limits and ensures consistent verification emails

### Notes Management
- Create notes with title and content
- View all notes (sorted by newest first)
- **Edit notes** with inline form population
- **Auto-save while typing** (700ms debounce during edit mode)
- Delete notes with confirmation
- Real-time list refresh after all operations

### Security
- Row Level Security (RLS) enforced at database level
- Users can only access their own notes
- No unauthenticated access
- Environment variables support for credentials

### User Experience
- Calm, distraction-free styling
- **Smooth CSS transitions** on interactive elements
- **Fully mobile-responsive** design (600px breakpoint)
- Touch-friendly buttons (44px+ minimum height on mobile)
- Clean, professional interface

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (ES Modules)
- **Backend**: Supabase (Authentication + PostgreSQL)
- **Build Tool**: Vite (optional, for .env support)

## Project Structure

```
private-notes-vault/
├── index.html          # Login page
├── notes.html          # Notes management page
├── css/
│   └── style.css       # Styling with transitions
├── js/
│   ├── supabase.js     # Supabase client initialization
│   ├── auth.js         # Authentication logic
│   └── notes.js        # Notes CRUD + auto-save
├── .gitignore          # Git ignore rules
├── .env.example        # Environment variables template
└── README.md           # This file
```

## Setup (Supabase)

### 1) Create a Supabase project

- Enable **Email** auth.
- Enable **Google** auth (optional but supported).

### 2) Configure your client keys

#### Option A: Using Environment Variables (Recommended)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

> **Note**: The `.env` file is ignored by git. Never commit your actual credentials.

#### Option B: Direct Configuration (No build tool)

If not using Vite, edit `js/supabase.js` directly:
```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

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

## Run Locally

You must serve the folder with a local web server (ES modules don't work via `file://`).

### Option A: Using Vite (if using .env)

```bash
cd private-notes-vault
npm install       # First time only
npm run dev       # Start dev server
```

Then open: `http://localhost:5173`

### Option B: VS Code Live Server (no build tool)

- Open the `private-notes-vault/` folder
- Start **Live Server**
- Open `index.html`

### Option C: Python (no Node required)

```bash
cd private-notes-vault
python -m http.server 5500
```

Then open: `http://localhost:5500/index.html`

## Usage

1. **Login**: Use email/password or click "Continue with Google"
2. **Create notes**: Fill in title and content, click "Save"
3. **Edit notes**: 
   - Click "Edit" button on any note
   - Form populates with note data
   - Changes **auto-save** 700ms after you stop typing
   - Click "Update" to manually save and exit edit mode
4. **Delete notes**: Click "Delete" button (instant deletion)
5. **Logout**: Click "Logout" at the bottom of the page

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com) and sign in
3. Click **"Add new site"** → **"Import an existing project"**
4. Connect to GitHub and select `Rithik-Sharon-A/Private-Notes`
5. Configure build settings:
   - **Build command**: `npm run build` (if using Vite) or leave empty
   - **Publish directory**: `dist` (if using Vite) or `.` (vanilla JS)
6. Add environment variables (if using Vite):
   - Go to **Site settings** → **Environment variables**
   - Add `VITE_SUPABASE_URL` with your Supabase URL
   - Add `VITE_SUPABASE_ANON_KEY` with your anon key
7. Click **"Deploy"**

### Important for OAuth
After deployment, add your Netlify URL to Supabase:
- **Supabase Dashboard** → **Authentication** → **URL Configuration**
- Add: `https://your-app-name.netlify.app`

## Troubleshooting

- **Google OAuth returns but notes page redirects back**
  - Ensure redirect URLs are configured in Supabase (both localhost and production URL)
  - Ensure you are serving via `http://localhost:...` (not `file://`)
- **Auth works but notes don't load**
  - Confirm RLS policies exist and table columns match
  - Check browser console for errors
- **Auto-save not working**
  - Auto-save only works when editing existing notes
  - Click "Edit" button first, then type
  - Check browser console for Supabase errors
- **Environment variables not working**
  - If using `import.meta.env`, you need Vite
  - Run `npm install` and `npm run dev`
  - For vanilla JS, hardcode values in `js/supabase.js`

## Environment Variables Setup

This project uses environment variables to store Supabase credentials securely.

### Using .env with Vite

1. Create a `.env` file in the project root (already in `.gitignore`):
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

2. The app reads these via `import.meta.env.VITE_*` in `js/supabase.js`

3. For production (Netlify/Vercel):
   - Add environment variables in the platform's dashboard
   - Use the same variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Without Vite (Vanilla JS)

If you're not using a build tool:
- Replace `import.meta.env.*` with actual string values in `js/supabase.js`
- Example:
  ```javascript
  const SUPABASE_URL = 'https://your-project.supabase.co';
  const SUPABASE_ANON_KEY = 'your_anon_key_here';
  ```

## Browser Compatibility

- ✅ Chrome/Edge: Fully supported
- ✅ Firefox: Fully supported
- ✅ Safari: Fully supported
- ✅ Mobile browsers: Optimized for touch

## License

Educational / internship evaluation project.

---

**Repository**: [github.com/Rithik-Sharon-A/Private-Notes](https://github.com/Rithik-Sharon-A/Private-Notes)