# Architecture Design: Smart Scoring Software

## 1. Technology Stack
- **Framework:** Next.js (React) - Handles both Frontend and Backend API.
- **Language:** TypeScript.
- **Database:** SQLite (via Prisma or simplified driver) - Portable, zero-config, sufficient for <100 users.
- **UI Library:** Tailwind CSS + Shadcn/UI (Clean, modern, responsive).
- **State Management:** React Query (for real-time-like polling) or standard hooks.

## 2. Core Modules

### A. Administrator (Project Management Dept)
- **Upload:** Upload project list (Excel/CSV) & User list.
- **Config:** Set weight coefficients (Leader vs Dept Head).
- **Control:** Reset scoring, Open/Close scoring.

### B. Reviewer (Mobile View)
- **Login:** Select Name -> Enter Passcode.
- **Scoring List:** List of projects.
  - *Logic:* If project.department == user.department, disable scoring (show "Conflict of Interest").
- **Submit:** Submit scores for all projects (or one by one).

### C. Big Screen (Display View)
- **Status Board:** "Waiting for scoring..." / "X/Y Reviewers submitted".
- **Reveal:** Admin button to "Reveal Results".
- **Ranking:** Sorted bar chart or table of final scores.

## 3. Data Model (Draft)

### User
- id
- name
- role (Leader / DeptHead)
- department_id
- passcode

### Project
- id
- name
- department_id
- presenter_name
- description

### Score
- user_id
- project_id
- score_value (0-100)

## 4. Calculation Logic
`Final Score = (Sum(Leader_Scores) / Count(Leaders)) * Leader_Weight + (Sum(DeptHead_Scores) / Count(DeptHeads)) * DeptHead_Weight`
*Note: Exclude DeptHead if they are from the same department.*

## 5. Security & Validation
- Simple session cookie or JWT upon login.
- API validation to prevent scoring own department.
