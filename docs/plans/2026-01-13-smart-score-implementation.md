# Smart Scoring Software Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-friendly web application for internal project scoring with real-time progress tracking and weighted result calculation.

**Architecture:** Next.js App Router application with SQLite/Prisma backend. Mobile-first design for reviewers, desktop dashboard for admins.
**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Shadcn/UI, Prisma (SQLite), React Query.

---

### Task 1: Project Initialization & Infrastructure

**Files:**
- Create: `package.json` (init)
- Create: `prisma/schema.prisma`
- Create: `lib/db.ts`
- Create: `.env`

**Step 1: Initialize Next.js Project**
Run: `npx create-next-app@latest . --typescript --tailwind --eslint --no-src-dir --import-alias "@/*" --app --use-npm`
*Note: Run in current directory or app root.*

**Step 2: Install Dependencies**
Run: `npm install @prisma/client prisma clsx tailwind-merge lucide-react class-variance-authority axios @tanstack/react-query`

**Step 3: Configure Prisma Schema**
Create `prisma/schema.prisma` with models:
- `User` (id, name, role, department, passcode)
- `Project` (id, name, department, presenter, description)
- `Score` (userId, projectId, value)
- `Config` (key, value - for system state like 'is_scoring_open', 'weights')

**Step 4: Generate Prisma Client**
Run: `npx prisma init --datasource-provider sqlite`
Run: `npx prisma generate`
Run: `npx prisma db push`

**Step 5: Create Database Helper**
Create `lib/db.ts` to export singleton PrismaClient instance.

**Step 6: Commit**
```bash
git add .
git commit -m "chore: init project and db schema"
```

---

### Task 2: Backend API - Data & Auth

**Files:**
- Create: `app/api/auth/login/route.ts`
- Create: `app/api/admin/upload/route.ts`
- Create: `lib/auth.ts` (Simple session helper)

**Step 1: Implement Login API**
Create `app/api/auth/login/route.ts`.
- Input: `{ name, passcode }`
- Logic: Find user by name. Validate passcode.
- Output: Set HttpOnly cookie with user ID (simple auth for internal use). Return user info.

**Step 2: Implement Admin Data Seeding API**
Create `app/api/admin/upload/route.ts`.
- Logic: Accept JSON/CSV data to bulk create Users and Projects.
- *Note: For MVP, we can mock this or just use a seed script, but an API endpoint is better for the admin UI.*

**Step 3: Test API with Curl**
Run: `npm run dev` in background.
Run: `curl -X POST http://localhost:3000/api/auth/login ...`

**Step 4: Commit**
```bash
git add .
git commit -m "feat: api auth and data upload"
```

---

### Task 3: Backend API - Scoring & State

**Files:**
- Create: `app/api/scoring/submit/route.ts`
- Create: `app/api/scoring/stats/route.ts`
- Create: `app/api/admin/state/route.ts`

**Step 1: Scoring Submission API**
Create `app/api/scoring/submit/route.ts`.
- Input: `{ projectId, score }`
- Logic:
  - Check if user is logged in.
  - Check if `scoring_open` is true.
  - Validate Conflict of Interest (User Dept != Project Dept).
  - Upsert Score record.

**Step 2: System State API**
Create `app/api/admin/state/route.ts`.
- Methods: GET (status), POST (update status: OPEN, CLOSED, REVEALED).

**Step 3: Stats/Results API**
Create `app/api/scoring/stats/route.ts`.
- Logic:
  - Calculate weighted scores: `(LeaderAvg * L_Weight) + (DeptAvg * D_Weight)`.
  - Return ranking list.
  - *Note: Only return full data if state is REVEALED or user is Admin.*

**Step 4: Commit**
```bash
git add .
git commit -m "feat: api scoring and system state"
```

---

### Task 4: Frontend - Reviewer Interface (Mobile)

**Files:**
- Create: `app/(reviewer)/login/page.tsx`
- Create: `app/(reviewer)/dashboard/page.tsx`
- Components: `ProjectCard.tsx`, `ScoreInput.tsx`

**Step 1: Login Page**
Implement `app/login/page.tsx`.
- Dropdown for User Names (fetched from API).
- Password input (4-6 digits).
- Submit button -> calls `/api/auth/login`.

**Step 2: Project List & Scoring**
Implement `app/dashboard/page.tsx`.
- Fetch projects and current user's scores.
- Filter/Sort options? (Default by order).
- Render `ProjectCard`:
  - Show details.
  - If Conflict of Interest: Show "Cannot Score".
  - Else: Show `ScoreInput` (Slider 0-100 or Number Input).
  - Auto-save on change or "Submit" button.

**Step 3: Commit**
```bash
git add .
git commit -m "feat: reviewer mobile interface"
```

---

### Task 5: Frontend - Admin & Display

**Files:**
- Create: `app/admin/page.tsx`
- Create: `app/display/page.tsx`
- Components: `AdminControls.tsx`, `LiveRanking.tsx`

**Step 1: Admin Dashboard**
Implement `app/admin/page.tsx`.
- Controls: "Start Scoring", "Stop Scoring", "Reveal Results".
- Reset Data button.
- Upload Data area (Text area or File input).

**Step 2: Big Screen Display**
Implement `app/display/page.tsx`.
- Poll `/api/admin/state` and `/api/scoring/stats` every 3s.
- State: SCORING -> Show Progress Bar ("10/15 Reviewers have finished").
- State: REVEALED -> Show Bar Chart of Final Scores.

**Step 3: Commit**
```bash
git add .
git commit -m "feat: admin and display pages"
```

---

### Task 6: Final Polish & Verification

**Files:**
- Modify: `app/page.tsx` (Landing redirect)
- Verify: `prisma/schema.prisma` (Indexes)

**Step 1: Root Redirect**
Update `app/page.tsx` to redirect based on role or show a landing page with links to "/login" and "/display".

**Step 2: Manual End-to-End Test**
- Create Leader and DeptHead users.
- Create Projects.
- Simulate scoring flow.
- Verify weighted calculation.

**Step 3: Commit**
```bash
git add .
git commit -m "chore: final polish"
```
