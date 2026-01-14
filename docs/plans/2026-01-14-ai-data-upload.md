# AI Data Upload Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Allow users to upload a project list file (Excel/Word), use AI to extract structured data (Project Name, Department, Presenter, Description), preview/edit the results, and batch create projects.

**Architecture:**
1. **Frontend:** React component with file upload, data preview table (editable), and "Import" action.
2. **Backend:** Next.js Route Handler to process file upload, parse content (xlsx/docx), and send to LLM for extraction.
3. **AI:** Use OpenAI API (or compatible) to convert unstructured text/table data into specific JSON schema.

**Tech Stack:** Next.js, OpenAI SDK, `xlsx` (Excel), `mammoth` (Word), Tailwind CSS.

---

### Task 0: Fix Missing Project API (Critical Pre-requisite)

**Context:** The `ProjectEditor` component uses `PATCH /api/projects/:id` and `DELETE /api/projects/:id`, but this route does not exist.

**Files:**
- Create: `app/api/projects/[id]/route.ts`

**Step 1: Write the failing test**
(Skipping strict TDD for this fix as it's a standard CRUD route, but will verify with curl)

**Step 2: Implement the route**
Create the route handler with `PATCH` and `DELETE` methods using Prisma.
- `PATCH`: Update name, department, presenter, description.
- `DELETE`: Delete project (cascade delete scores).

**Step 3: Verify**
Run a curl command to update a dummy project and verify it changes.

---

### Task 1: Dependencies and Environment Setup

**Files:**
- Modify: `package.json`
- Modify: `.env.local`

**Step 1: Install dependencies**
```bash
npm install openai xlsx mammoth
```

**Step 2: Configure Environment**
Add `OPENAI_API_KEY` and `OPENAI_BASE_URL` to `.env.local` (User needs to provide these).

---

### Task 2: File Parsing Service

**Files:**
- Create: `lib/file-parser.ts`
- Test: `tests/file-parser.test.ts` (if testing env exists, otherwise manual verification script)

**Step 1: Implement Excel Parser**
Function `parseExcel(buffer: Buffer): string` that converts rows to CSV-like string.

**Step 2: Implement Word Parser**
Function `parseWord(buffer: Buffer): Promise<string>` using `mammoth.extractRawText`.

**Step 3: Main Entry Point**
Function `parseFile(file: File): Promise<string>` that determines type and calls appropriate parser.

---

### Task 3: AI Extraction Service

**Files:**
- Create: `lib/ai-extractor.ts`

**Step 1: Define Schema**
Define the expected JSON output format:
```json
{
  "projects": [
    { "name": "...", "department": "...", "presenter": "...", "description": "..." }
  ]
}
```

**Step 2: Implement Extraction Logic**
Function `extractProjectData(text: string): Promise<ProjectData[]>`
- System Prompt: "You are a data extraction assistant. Extract project information from the provided text into JSON..."
- User Prompt: The parsed file content.
- Response handling: Parse JSON from LLM response.

---

### Task 4: Upload API Route

**Files:**
- Create: `app/api/admin/ai-parse/route.ts`

**Step 1: Implement POST handler**
- Receive `FormData` with `file`.
- Call `parseFile` to get text.
- Call `extractProjectData` to get JSON.
- Return JSON to client.

---

### Task 5: Frontend - Upload & Preview UI

**Files:**
- Modify: `components/admin/DataUpload.tsx`

**Step 1: Add File Input**
Add a drag-and-drop or file input area designated for "AI Upload".

**Step 2: Handle Upload**
On file selection, POST to `/api/admin/ai-parse`. Show loading state.

**Step 3: Implement Preview Table**
Display returned projects in a table.
- Allow editing cells (Name, Dept, Presenter, Desc).
- Allow deleting rows.
- "Add Row" button.

**Step 4: Save Integration**
Use the existing `handleUpload` logic (or adapt it) to send the final JSON to `/api/admin/upload`.

---

### Task 6: Testing & Refinement

**Step 1: Test End-to-End**
- Upload a sample Excel file.
- Verify AI extraction.
- Edit a field in the preview.
- Save.
- Verify data in database.

**Step 2: Error Handling**
- Handle invalid files.
- Handle AI errors/timeouts.
- Handle empty results.
