# SmartScore - Internal Project Scoring System

A real-time scoring application for internal project reviews.

## Features

- **Reviewer Interface (Mobile-First):**
  - Secure login with name and passcode.
  - List of projects to score.
  - Conflict of interest detection (cannot score own department).
  - 0-100 scoring with visual feedback.

- **Admin Dashboard:**
  - Control scoring state (CLOSED -> SCORING -> REVEALED).
  - Live progress monitoring.
  - Bulk data upload (JSON).

- **Live Display:**
  - Big-screen ready view.
  - Shows real-time voting activity during SCORING.
  - Reveals weighted rankings with animations when REVEALED.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** SQLite (dev) / Prisma ORM
- **Styling:** Tailwind CSS
- **Language:** TypeScript

## Setup & Running

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Usage Guide

### 1. Seed Data (Admin)
Go to `/admin` and paste the seed JSON in the upload box.
Example format:
```json
{
  "users": [
    { "name": "Alice", "role": "LEADER", "department": "Management", "passcode": "1234" },
    { "name": "Bob", "role": "DEPT_HEAD", "department": "Tech", "passcode": "1234" }
  ],
  "projects": [
    { "name": "Project Alpha", "department": "Tech", "presenter": "Charlie" },
    { "name": "Project Beta", "department": "Sales", "presenter": "Dana" }
  ]
}
```

### 2. Start Scoring (Admin)
- On `/admin`, click **START SCORING**.

### 3. Reviewers Vote
- Reviewers go to `/login`, select their name, enter passcode.
- They submit scores for projects (except their own department).

### 4. Live Display
- Open `/display` on a shared screen. It will show voting progress.

### 5. Reveal Results
- On `/admin`, click **REVEAL RESULTS**.
- The display page will show the final ranked list with weighted scores.

## Scoring Logic
Final Score = `(LeaderAvg * 0.6) + (DeptHeadAvg * 0.4)`
