# PRD: Migrate Frontend from CSR to SSR

## Problem
Our React SPA currently takes 8.4s to first meaningful paint on 3G networks. SEO performance is poor — our blog posts rank on page 4-5 for target keywords. Core Web Vitals are in the red.

## Objective
Migrate the customer-facing web application from Client-Side Rendering (CSR) to Server-Side Rendering (SSR) using Next.js to improve SEO rankings and page load performance.

## Success Metrics
| Metric | Current (P75) | Target (P75) | Measurement Tool |
|--------|--------------|--------------|------------------|
| First Contentful Paint | 3.2s | ≤1.5s | Lighthouse CI |
| Largest Contentful Paint | 8.4s | ≤2.5s | Lighthouse CI |
| Cumulative Layout Shift | 0.35 | ≤0.1 | Lighthouse CI |
| Organic search traffic | 12K/month | 25K/month (6mo post-launch) | Google Search Console |
| Bounce rate (mobile) | 68% | ≤50% | Google Analytics |

## Scope

### In Scope
- Customer-facing pages: Home, Product Listing, Product Detail, Blog
- Internal dashboard pages: stay as CSR (no SEO benefit)
- API layer: introduce new BFF (Backend for Frontend) pattern
- Auth: migrate session handling for SSR compatibility

### Out of Scope
- Mobile app (separate codebase)
- Checkout flow (already being reworked in parallel — will migrate after launch)
- Admin panel

## Technical Requirements
1. Use Next.js App Router with React Server Components
2. Incremental Static Regeneration for blog pages (revalidate every 15min)
3. Streaming SSR for product listing pages
4. API routes proxy to existing backend
5. Shared auth cookie domain for SSR session handling
6. Feature flag system to roll back to CSR if SSR has issues

## Migration Strategy
1. Set up Next.js alongside existing React app (proxy pattern)
2. Migrate page by page: Blog → Home → Product Listing → Product Detail
3. Each page goes through: shadow test → 10% traffic → 50% → 100%
4. Rollback plan: feature flag switches back to CSR within 60 seconds

## Timeline
- Week 1-2: Next.js setup + build tooling + CI/CD pipeline
- Week 3-4: Blog migration (lowest risk, highest SEO impact)
- Week 5-6: Home page + Product Listing
- Week 7-8: Product Detail + long-tail pages
- Week 9: Performance optimization + final QA
- Week 10: Full rollout

## Team & Resources
- 3 frontend engineers (2 dedicated, 1 shared with platform team)
- 1 backend engineer (API changes)
- 1 SRE (0.5 FTE, deployment pipeline)
- Estimated: 10 weeks, $180K engineering cost ($90/hr blended rate)

## Risks
- SSR increases server costs (estimate: 3x current infra cost)
- SEO ranking dip during migration (mitigation: noindex nofollow until full migration)
- Developer velocity slowdown during transition period

## Open Questions
- Should we adopt React Server Components fully, or use client components selectively?
- What's the caching strategy for product data that updates frequently?