# Case Study: PRD Quality Reviewer

## Problem
Product managers across the industry write PRDs of wildly varying quality. At Visa, I worked with PMs and Directors where PRDs ranged from precise, data-driven documents to vague wishlists. The difference between a good and bad PRD directly impacts engineering execution — unclear requirements cause rework, missed deadlines, and misaligned expectations.

The challenge: **How do you systematically evaluate PRD quality before engineering starts?**

## Solution
Built **PRD Quality Reviewer**, an AI-powered tool that scores a PRD against the **SMART framework** — Specific, Measurable, Achievable, Relevant, and Time-bound. Users paste a PRD and get:

- **Overall score** (0-100)
- **Per-criterion breakdown** with score, reasoning, and improvement suggestions
- **Executive summary** of strengths and weaknesses

## Architecture

```
User (Browser) → Next.js 16 (App Router) → API Route → Gemini 2.0 Flash → Response
```

- **Frontend:** Next.js 16 with Tailwind CSS, deployed on Vercel
- **AI Engine:** Google Gemini 2.0 Flash with a structured prompt that enforces JSON output
- **Local Mode:** Docker container with standalone Next.js build
- **No database needed** — stateless processing

## Key Design Decisions

### Why SMART criteria?
The SMART framework is the most widely recognized rubric for goal-setting in product management. It's simple enough to be universally understood but rigorous enough to catch real PRD deficiencies. Each criterion tests a distinct dimension:

| Criterion | What it catches |
|-----------|----------------|
| **Specific** | Vague language, ambiguous requirements |
| **Measurable** | Missing KPIs, no success definition |
| **Achievable** | Scope creep, unrealistic timelines |
| **Relevant** | Misaligned with business priorities |
| **Time-bound** | No milestones, "when it's ready" mentality |

### Why Gemini instead of a rules engine?
A rules engine could catch formatting issues (missing sections, short length) but can't evaluate semantic quality — is the PRD actually specific? Are the metrics meaningful? LLMs can reason about the *meaning* of requirements, which is the actual value add.

### Prompt Engineering
The prompt uses **JSON schema enforcement** ("return ONLY valid JSON, no markdown fences") with few-shot examples of scoring guidelines. Temperature is set to 0.2 for consistency while allowing some variation in reasoning.

## Sample Test Results

The tool was tested with 5 deliberately varied PRDs:

1. **E-Commerce Checkout (Good):** Well-structured with clear metrics, timeline, and acceptance criteria — scored ~85/100
2. **Dashboard Analytics (Vague):** Missing metrics, no timeline, aspirational language — scored ~40/100
3. **Fraud Detection (Excellent):** Comprehensive PRD with risk analysis, staged rollout, precise KPIs — scored ~92/100
4. **SSR Migration (Good but incomplete):** Strong metrics but open questions about implementation — scored ~78/100
5. **Notification Service (Ambiguous):** Good problem statement but weak timeline, vague scope — scored ~55/100

## What I'd Do Differently

1. **Add multi-PRD comparison:** Let users compare scores across multiple PRDs to benchmark quality trends
2. **PRD rewrite assistant:** Auto-generate improved versions of weak sections
3. **Incorporate user feedback:** Allow PMs to flag incorrect evaluations, building a fine-tuning dataset
4. **Custom rubric:** Let organizations configure their own scoring criteria beyond SMART

## PM Signal

This project demonstrates:

- **You've read real PRDs** — the scoring rubric comes from understanding what makes PRDs succeed or fail
- **You understand AI limitations** — structured output enforcement and validation handle the "AI might get creative" problem
- **You think in frameworks** — SMART criteria is a product management tool, not an engineering one

## Stack

Next.js 16 · TypeScript · Tailwind CSS · Google Gemini 2.0 Flash · Docker · Vercel