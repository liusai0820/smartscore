# Multi-Dimension Statistics Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the display screen to show comprehensive statistics: weighted totals, standard deviation (consistency), and sub-dimension rankings (Value, Innovation, Feasibility, Output).

**Architecture:**
1.  **Backend (`/api/scoring/stats`):** Expand the aggregation logic to calculate:
    *   Sub-dimension averages (e.g., avgValueScore, avgInnovScore).
    *   Variance/Standard Deviation for the total score (to measure consensus).
2.  **Frontend (`components/display/LiveRanking.tsx`):**
    *   Update `Result` type definition.
    *   Add a "Details View" toggle or cycle automatically.
    *   Render specific rankings for each sub-dimension.
    *   Display "Controversy Level" (Variance) - High variance = controversial.

**Tech Stack:** Next.js, Prisma, Tailwind CSS, Recharts (for charts if needed, but simple CSS bars might suffice for cleaner look).

---

### Task 1: Update Backend Statistics Logic

**Files:**
- Modify: `app/api/scoring/stats/route.ts`
- Modify: `app/api/display/stats/route.ts` (This is the one used by LiveRanking)

**Step 1: Calculate Sub-dimension Averages**
In `app/api/display/stats/route.ts`:
- For each project, besides `finalScore`, calculate:
  - `avgValueScore` (Research Value)
  - `avgInnovScore` (Innovation)
  - `avgFeasiScore` (Feasibility)
  - `avgOutputScore` (Output)
- Formula: Simple average of all scores (or weighted if we want consistent weighted view, but usually sub-dimensions are raw averages for comparison). *Decision: Let's use simple average of all valid votes for sub-dimensions to keep it understandable.*

**Step 2: Calculate Standard Deviation (Consistency)**
- Calculate the `finalScore` for *each individual vote* first.
- Then compute the standard deviation of these individual final scores.
- Higher StdDev = Lower Consistency.

**Step 3: Update Response Type**
- Return these new fields in the JSON response.

**Step 4: Commit**
```bash
git add .
git commit -m "feat: add dimension stats and consistency metrics to api"
```

---

### Task 2: Enhance Display Component (LiveRanking)

**Files:**
- Modify: `components/display/LiveRanking.tsx`

**Step 1: Update Types**
- Update `Result` interface to include `avgValueScore`, `avgInnovScore`, `avgFeasiScore`, `avgOutputScore`, `standardDeviation`.

**Step 2: Add View Switching Logic**
- State: `viewMode` ('OVERALL', 'DIMENSIONS', 'CONSISTENCY').
- Auto-cycle every 10 seconds if in `REVEALED` state.

**Step 3: Implement Dimensions View**
- Show 4 small "Top 3" lists, one for each dimension.
- Or a main table with sortable columns (if screen allows). *Decision: 4 cards showing the "Champion" of each dimension.*

**Step 4: Implement Consistency View**
- Show a scatter plot or a list sorted by "Most Controversial" (High Deviation) vs "Most Consensus" (Low Deviation).

**Step 5: Commit**
```bash
git add .
git commit -m "feat: multi-dimension display views"
```

---

### Task 3: Verify with Simulation

**Files:**
- Modify: `scripts/simulate-votes.ts` (if needed to generate varied data)

**Step 1: Run Simulation**
- Ensure enough data exists to show meaningful variance.

**Step 2: Manual Check**
- Open `/display` and verify the cycling views.

**Step 3: Commit**
```bash
git add .
git commit -m "chore: verify stats display"
```
