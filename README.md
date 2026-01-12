Private Notes Vault

A secure, minimal notes application where each user can create and manage their own private notes.
Built with vanilla HTML, CSS, and JavaScript using Supabase Authentication and Database.

This project demonstrates core full-stack concepts with a strong emphasis on authentication, data ownership, and clean user experience.

Objective

The goal of this project is to build a private, authenticated notes web app with a simple and intentional feature set.

The focus is on:

Secure authentication

Strict data ownership

Clean, distraction-free UI

Correct full-stack flow

Advanced features are intentionally limited to maintain clarity and simplicity.

Core Concept

Notes are private by default and strictly tied to the authenticated user.

There is:

No sharing

No public notes

No tags or folders

Only:

Login

Write

Read

Delete

The application behaves like a personal scratchpad, not a productivity platform.

Features
Authentication

Email & password authentication

Google OAuth login

Session handling with automatic redirects

Unauthenticated users cannot access notes

Notes Management

Create notes (title + content)

View a list of personal notes (newest first)

View individual notes

Delete notes

Each note includes:

Title

Content

Created timestamp

Security

Supabase Row Level Security (RLS) enabled

Notes are accessible only by their owner

Authorization enforced at the database level

No client-side ownership filtering

Safe use of Supabase anon key (client-approved)

User Experience

Minimal, distraction-free interface

Calm visual design

Smooth transitions

Fully responsive and mobile-friendly

Touch-optimized buttons for mobile devices

Tech Stack

Frontend: HTML, CSS, JavaScript (ES Modules)

Backend: Supabase (Authentication + PostgreSQL)

Hosting: Netlify

Build Tools: None (runs directly in the browser)

Project Structure
private-notes-vault/
│
├── index.html        # Login page
├── notes.html        # Notes interface
│
├── css/
│   └── style.css     # Minimal, responsive styling
│
├── js/
│   ├── supabase.js   # Supabase client initialization
│   ├── auth.js       # Authentication logic
│   └── notes.js      # Notes CRUD operations
│
├── .gitignore
└── README.md

Database Design
Notes Table
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  content text,
  created_at timestamptz not null default now()
);

Row Level Security (RLS)

Ownership is enforced using Supabase RLS policies:

Users can only read their own notes

Users can only insert notes tied to their user ID

Users can only update or delete their own notes

All authorization is handled at the database layer, not in JavaScript.

Architecture Overview

Frontend runs entirely in the browser using ES modules

Supabase provides:

Authentication

Database

Authorization via RLS

No custom backend server required

Security does not rely on client-side logic

This architecture minimizes complexity while maintaining strong security guarantees.

Running Locally

A local server is required (ES modules do not work with file://).

Option 1: VS Code Live Server

Open the project folder

Start Live Server

Open index.html

Option 2: Python
cd private-notes-vault
python -m http.server 5500


Open:

http://localhost:5500/index.html

Deployment

Repository:
https://github.com/Rithik-Sharon-A/Private-Notes

Deployed using Netlify

No build command

Publish directory: .

Supabase OAuth redirect URLs are configured for both local and production environments.

Evaluation Criteria Alignment
Area	Coverage
Authentication & Data Security	Supabase Auth + RLS
Notes Flow	Create, view, delete notes
UI Simplicity	Minimal, focused design
Code Quality	Modular, readable JavaScript
Optional Enhancements Implemented

Edit notes

Auto-save while typing (debounced)

Smooth UI transitions

Mobile-first responsive layout

These features were added without compromising simplicity.

Security Notes

Supabase anon key is safe for browser usage

Service role key is never exposed

No business logic depends on client-side user IDs

All data access is protected by RLS

License

MIT-style usage for learning, demos, and internship evaluation.
Not intended for commercial redistribution.