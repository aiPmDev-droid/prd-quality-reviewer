# PRD Quality Reviewer

An AI-powered tool that scores Product Requirements Documents against the **SMART framework** — Specific, Measurable, Achievable, Relevant, and Time-bound.

Built with Next.js 16, Google Gemini 2.0 Flash, and Tailwind CSS.

## Features

- **Paste & Review:** Paste any PRD and get scored in seconds
- **SMART Breakdown:** Per-criterion scores with reasoning and improvement suggestions
- **Overall Score:** 0-100 rating with color-coded feedback
- **Section-Level Feedback:** Understand *why* each dimension scored the way it did

## Quick Start (Local Dev)

```bash
# 1. Install dependencies
npm install

# 2. Set up your Gemini API key
cp .env.example .env.local
# Edit .env.local and add your key: GEMINI_API_KEY=your_key_here
# Get a key: https://aistudio.google.com/apikey

# 3. Start the dev server
npm run dev

# 4. Open http://localhost:3000
```

## Docker (Local Production Build)

```bash
# Build and run with Docker
docker compose up --build

# Or manually:
export DOCKER_BUILD=true
npm run build
docker build -t prd-reviewer .
docker run -p 3000:3000 -e GEMINI_API_KEY=your_key_here prd-reviewer
```

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init && git add . && git commit -m "Initial commit"
gh repo create prd-quality-reviewer --public --push

# 2. Import to Vercel
# Go to https://vercel.com/import and select your repo

# 3. Add environment variable
# In Vercel dashboard → Settings → Environment Variables
# Add: GEMINI_API_KEY = your_key_here
```

## Testing

```bash
# Start the dev server in one terminal
npm run dev

# In another terminal, run the API tests
python tests/test_api.py
```

The test suite validates all 5 sample PRDs against the API and checks response structure.

## Sample PRDs

The `sample_prds/` directory contains 5 PRDs of varying quality:

| File | Quality | Description |
|------|---------|-------------|
| `prd_01_ecommerce_checkout.md` | Good | Well-structured with clear metrics and timeline |
| `prd_02_dashboard_analytics.md` | Poor | Vague goals, no metrics, no timeline |
| `prd_03_fraud_detection.md` | Excellent | Comprehensive with risk analysis and staged rollout |
| `prd_04_ssr_migration.md` | Good | Strong metrics but open implementation questions |
| `prd_05_notification_service.md` | Mixed | Good problem statement but weak timeline |

## Project Structure

```
prd-quality-reviewer/
├── src/
│   ├── app/
│   │   ├── api/review/route.ts   # API endpoint
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Main UI
│   │   └── globals.css           # Tailwind styles
│   └── lib/
│       ├── gemini.ts             # Gemini API client
│       └── types.ts              # TypeScript types
├── sample_prds/                  # 5 test PRDs
├── tests/
│   └── test_api.py               # API integration tests
├── docs/
│   └── case-study.md             # Portfolio case study
├── Dockerfile                    # Docker build
├── docker-compose.yml            # Docker Compose
├── vercel.json                   # Vercel config
└── next.config.ts                # Next.js config
```

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI:** Google Gemini 2.0 Flash
- **Local:** Docker
- **Production:** Vercel