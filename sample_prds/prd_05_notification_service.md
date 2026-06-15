# PRD: Unified Notification Service

## Problem
Currently each product team at our company builds their own notification system independently. We have 5 different systems sending emails, push notifications, and SMS — all with different templates, delivery mechanisms, and failure handling. This is inefficient and creates inconsistent user experiences.

## Business Case
- $240K/year in redundant engineering effort across teams
- 15% notification delivery failure rate (no centralized retry logic)
- 3 days average to add a new notification type

## Objectives
1. Create a centralized notification service that any product team can integrate with
2. Support email, push notifications, and SMS through a single API
3. Provide template management, delivery logging, and analytics dashboard
4. Reduce notification delivery failure rate from 15% to <2%

## Requirements
- REST API with webhook support
- Template engine with variable substitution
- Priority queue (transactional > marketing > system)
- Retry with exponential backoff (max 3 retries)
- Delivery tracking and analytics dashboard
- Rate limiting per channel per customer
- Opt-out/unsubscribe management
- Multi-tenant: each product team gets API keys with scoped permissions

## Non-Requirements
- In-app notification center (separate product initiative)
- Real-time chat messaging (notifications are asynchronous)
- Advanced A/B testing for notification content (future phase)

## Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Delivery success rate | 85% | ≥98% |
| Time to add new notification type | 3 days | <2 hours |
| API uptime | No benchmark | ≥99.9% |
| P95 delivery latency | N/A | <5 min for email, <30s for push |

## Timeline
- Start: Q3
- Launch: Q4
- But could slip depending on resourcing
- We'll see how it goes

## Open Issues
- Need to figure out pricing model for cross-team usage
- Still debating whether to use AWS SES or SendGrid for email delivery
- Should we support WhatsApp as a channel? (Marketing team is asking for it)