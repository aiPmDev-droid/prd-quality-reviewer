# PRD: One-Click Checkout for Mobile Web

## Problem
Users on mobile web abandon the checkout flow at a 72% rate. The current 5-step checkout process (cart → shipping → payment → review → confirm) is too cumbersome on mobile devices.

## Goal
Reduce mobile checkout abandonment by 30% within 3 months of launch by introducing a one-click checkout option for returning users.

## Success Metrics
- Primary: Checkout completion rate on mobile web improves from 28% → 58%
- Secondary: Average checkout time drops from 3:45 to under 1:00
- Counter-metric: Chargeback rate does not increase by more than 0.1%

## Target Users
- Returning users who have completed at least one purchase
- Mobile web traffic (iOS Safari + Android Chrome)
- Users with saved payment methods

## Requirements

1. Save payment profile after first purchase (tokenized card + shipping address)
2. Add "One-Click Buy" button on product pages and cart page for eligible users
3. One-click flow: tap → 3-second confirmation → order placed → tracking email
4. Biometric confirmation required (Face ID / fingerprint) for security
5. Fallback to full checkout if biometric fails or user is ineligible

## Timeline
- Week 1-2: Backend API for payment profile management
- Week 3-4: Frontend implementation (web team)
- Week 5: QA + load testing
- Week 6: Staged rollout (5% → 25% → 50% → 100%)
- Launch: End of Week 6

## Open Questions
- Should we offer one-click for guest users with email-based verification?
- What's the fraud liability difference between 3DS and biometric-only auth?