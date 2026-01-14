# Data Management Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement data reset functionality (clearing scores only) and project management capabilities (editing/deleting projects) in the Admin interface.

**Architecture:**
1.  **Reset Logic:** New API endpoint `/api/admin/reset` to delete all `Score` records and reset `Config` states.
2.  **Project Management:**
    *   API updates: Add PATCH/DELETE to `/api/projects/[id]` (or new dedicated admin project routes).
    *   UI updates: Add "Edit" and "Delete" buttons to project list items in `AdminControls`.
    *   Edit Dialog: Simple modal to update Name, Department, Presenter, Description.

**Tech Stack:** Next.js, Prisma, Tailwind CSS, Shadcn/UI (simulated components).

---

### Task 1: Data Reset Functionality

**Files:**
- Create: `app/api/admin/reset/route.ts`
- Modify: `components/admin/AdminControls.tsx`

**Step 1: Backend Reset API**
Create `app/api/admin/reset/route.ts`:
- POST method.
- Action:
  - `prisma.score.deleteMany()`
  - Reset `scoring_state` to 'CLOSED'.
  - Reset `current_project` to null.
- Return success.

**Step 2: Frontend Reset Button**
Update `components/admin/AdminControls.tsx`:
- Add a "Dangerous Zone" section or a clearly marked "Reset Scores" button.
- Add confirmation dialog (simple `window.confirm` is fine for MVP, or a custom modal state).
- Call API and refresh.

**Step 3: Commit**
```bash
git add .
git commit -m "feat: data reset functionality"
```

---

### Task 2: Project Management API

**Files:**
- Create: `app/api/projects/[id]/route.ts`

**Step 1: Create Dynamic Route**
Create `app/api/projects/[id]/route.ts`.
- **PATCH**: Update project details.
  - Body: `{ name, department, presenter, description }`
  - Validation: Ensure ID exists.
- **DELETE**: Remove project.
  - Validation: Check if it has scores? Or cascade delete?
  - *Decision:* Cascade delete scores if project is deleted. (Prisma handles this if relation is configured, or we delete manually). Let's use `delete` which will fail if foreign keys exist unless cascade is set. Better to `deleteMany` scores first, then project.

**Step 2: Commit**
```bash
git add .
git commit -m "feat: project management api"
```

---

### Task 3: Project Management UI

**Files:**
- Create: `components/ui/Modal.tsx` (Simple reusable modal)
- Create: `components/admin/ProjectEditor.tsx` (Form for editing)
- Modify: `components/admin/AdminControls.tsx`

**Step 1: Modal Component**
Create `components/ui/Modal.tsx`:
- Fixed overlay, centered content.
- `isOpen`, `onClose`, `title`, `children`.

**Step 2: Project Editor Form**
Create `components/admin/ProjectEditor.tsx`:
- Inputs for Name, Dept, Presenter, Description.
- "Save" and "Cancel" buttons.

**Step 3: Integration**
Update `components/admin/AdminControls.tsx`:
- In the project list, add Edit (Pencil) and Delete (Trash) icons next to each project.
- State for `editingProject`.
- On Edit click -> Open Modal with `ProjectEditor`.
- On Save -> Call PATCH API -> Refresh.
- On Delete click -> Confirm -> Call DELETE API -> Refresh.

**Step 4: Commit**
```bash
git add .
git commit -m "feat: project management ui"
```
