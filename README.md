# Revenora AI

Revenora AI is an enterprise-style healthcare SaaS for pre-submission claim validation.

It is designed to sit between claim generation and the clearinghouse, helping billing teams catch documentation gaps, coding mismatches, coverage issues, and compliance problems before a claim is submitted.

## What It Does

- Reviews claims before submission
- Explains claim health and denial risk
- Highlights documentation, coding, billing, and coverage issues
- Synchronizes dashboards, notifications, timelines, and activity feeds
- Provides separate patient, billing, and administrator portal experiences
- Supports a lightweight feedback workflow for patients
- Uses a minimal backend for on-demand Groq AI review

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React
- Node.js backend for the AI reviewer endpoint

## Project Structure

- `src/pages/` portal pages and workflows
- `src/context/` shared auth and workflow state
- `src/services/` backend-facing service modules
- `server/` minimal local backend for Groq review calls

## Getting Started

1. Install dependencies:

	```bash
	npm install
	```

2. Start the backend:

	```bash
	npm run backend
	```

3. Start the frontend:

	```bash
	npm run dev
	```

4. Build for production:

	```bash
	npm run build
	```

5. Preview the production build:

	```bash
	npm run preview
	```

## Authentication

Each portal has its own demo sign-in and role guard.

- Patient Portal: `patient@revenora.ai` / `Patient123!`
- Billing Staff Portal: `billing@revenora.ai` / `Billing123!`
- Administrator Portal: `admin@revenora.ai` / `Admin123!`

## Backend and Groq

The AI Claim Reviewer is backed by a minimal local Node server that exposes `POST /api/ai-review` and only calls Groq when a user clicks the review button.

- Put the Groq key in the project root `.env` file
- Optional: set `GROQ_MODEL=llama-3.1-8b-instant`
- The frontend proxies `/api` to the backend during local development
- If the backend is not running, the reviewer shows a clear backend-unavailable message

## Notes

- The app is frontend-first and backend-ready.
- The patient feedback flow persists locally for now, but it can be moved to a database-backed API later.
- Demo mode is presentation-focused and does not continuously consume AI credits.
