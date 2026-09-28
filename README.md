<div align="center">
  <img width="1200" height="475" alt="TAI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# T.A.I — Teacher Assisted Intelligence

A recruiter-ready showcase of an AI-assisted grading platform for educators.

## What this project demonstrates

- Product thinking: converts a real education workflow into an end-to-end usable web app.
- AI systems design: uses a multi-agent pipeline for OCR, visual understanding, and grading.
- Frontend engineering: polished React UI with role-focused screens for dashboarding, ingestion, and review.
- Practical automation: supports batch processing, confidence-based review flags, and CSV export.

## Key features

- **Course & assessment management** with custom exam categories.
- **Batch upload of student scripts** (images and PDFs).
- **AI extraction pipeline**:
  - OCR text extraction
  - Visual analysis for diagrams/charts when needed
  - Confidence/readability checks to flag submissions for manual review
- **AI-assisted grading** with rubric + policy based scoring and rationale generation.
- **Human-in-the-loop controls**:
  - policy refinement prompt
  - manual mark override with bounds checking
- **Agent configuration center** with global defaults and per-course overrides.
- **Activity feed and CSV export** for operational visibility and reporting.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Routing/UI:** React Router, Lucide icons
- **AI integration:** Google Gemini providers with mock fallbacks
- **State & persistence:** browser `localStorage` data layer

## Architecture snapshot

1. Instructor creates a course and uploads scripts.
2. `InitialCheckAgent` runs OCR + visual checks and marks low-confidence work for review.
3. `GradingAgent` grades extracted answers against rubric and grading policy.
4. Instructor reviews rationales, adjusts scores if needed, and exports marks.

## Running locally

### Prerequisites

- Node.js 18+

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` and set:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

### Build

```bash
npm run build
```

## Notes

- If no API key is provided, the app falls back to mock AI providers, which is useful for demos.
- Authentication is currently simulated on the frontend for prototype purposes.
