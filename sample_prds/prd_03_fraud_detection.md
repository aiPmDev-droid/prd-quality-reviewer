# PRD: Real-Time Fraud Detection for Payment Gateway

## Problem Statement
Our payment gateway processed $2.4B in volume last year with a 0.7% fraud rate (industry avg: 0.3%). We lost an estimated $16.8M to fraud. Current batch-processing detection (24-hour delay) is insufficient.

## Business Objectives
1. Reduce fraud rate from 0.7% to ≤0.35% within 6 months of launch
2. Maintain false positive rate below 2% (industry benchmark: 1.5-3%)
3. Keep P95 latency under 200ms for payment authorization

## Success Metrics
| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Fraud rate (% of volume) | 0.7% | ≤0.35% | Weekly dashboards |
| False positive rate | ~3% (est.) | ≤2% | Reviewed bi-weekly |
| Auth latency (P95) | 120ms | ≤200ms (new pipeline) | Datadog monitoring |
| Engineering cost | N/A | ≤$25K/month (GCP costs) | Billing review |

## Target Users
- Primary: Payments risk team (5 analysts reviewing flagged transactions)
- Secondary: End customers (should not notice the fraud check is happening)

## Feature Requirements

### F1: Real-Time Scoring Engine
- Score each transaction (0-100) at authorization time using ML ensemble
- Features: transaction velocity, device fingerprint, geolocation, amount deviation
- Rules engine override for known-good merchants (whitelist)

### F2: Decision Orchestration
- Score < 30 → auto-approve
- Score 30-70 → 3DS challenge (step-up auth)
- Score > 70 → decline with specific reason code
- Analyst can override decline within 5-minute window for VIP customers

### F3: Feedback Loop
- Analysts can mark false positives/negatives in review dashboard
- Labeled data fed back to retrain model weekly
- A/B test framework: compare model v2 vs v1 on 5% shadow traffic

## Non-Requirements
- Chargeback representment workflow (handled by existing disputes system)
- PCI-compliant data storage (separate initiative, already in progress)

## Timeline & Milestones
| Milestone | Date | Deliverable |
|-----------|------|-------------|
| Real-time scoring API | Week 6 | POC with 3 features, manually tested |
| Decision orchestration | Week 8 | Full flow: score → decision → action |
| ML model v1 training | Week 10 | Trained on 12 months historical data |
| Shadow mode testing | Weeks 11-12 | 5% traffic, no real decisions |
| Phased rollout | Weeks 13-15 | 10% → 25% → 50% → 100% over 3 weeks |
| Post-launch monitoring | Ongoing | Weekly model performance reviews |

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Latency spike due to ML inference | Medium | High | Use feature flags to fall back to rules-only mode |
| Model drift over time | High | Medium | Weekly retraining + automated drift detection |
| False positive rate higher than target | Medium | High | Analyst override + manual review queue |

## Open Questions
- Should we build or buy the ML model? (Initial analysis: build gives better control for our transaction patterns)
- What is the fallback latency SLA if the real-time service is down?