# Notes: Smart Scoring Software

## Findings

### Requirements

- **Device Support:** Reviewers (Leaders/Dept Heads) will use Mobile/Tablets (likely web-based).
- **Core Logic:**
  - Different weight coefficients for Leaders vs Dept Heads.
  - Conflict of Interest: Dept Heads cannot score their own department's projects.
  - Input: Project Management Dept uploads project list.
  - Output: Quick calculation and unified display.
  - Authentication: Select name from list + simple passcode.

### Decisions

- **Client:** Mobile-first web app (likely).
- **Auth:** Low friction (List selection).
- **Display:** Progress view during scoring -> Reveal button -> Final Ranking. avoid bias.

### Tech Constraints (To Verify)

- Deployment environment?
- Preferred language?
