# Frontend-only and backend-dependent work

[← Product docs index](../PRODUCT.md)

## 8. Frontend-only — start now, no backend needed

1. `LOV-002` pairing entry point in-app
2. `LOV-005` route guards
3. `LOV-008` empty / loading / error components
4. `LOV-009` shorten onboarding, merge the duplicate confirmation
5. `LOV-011` gate the album screens behind `USE_SAMPLE_CONTENT`
6. `LOV-012` Timeline from existing story data
7. Reachability: nothing in `(app)` offers pairing — verified
8. Delete `module-06-memories` (empty duplicate) and resolve the `module-03`
   numbering collision

---

## 9. Needs backend coordination — raise these now

1. `LOV-001` pairing: code issuance, redemption, pair record, live status
2. `LOV-005` **route guards need a real session** — raise before the API is fixed
3. `LOV-003` image upload and storage
4. `LOV-004` update and delete endpoints, and the soft-delete decision
5. `LOV-006` persistence — the single biggest blocker in the product
6. `LOV-007` prompt scheduling, answer storage, the reveal gate
7. `LOV-010` export format, unpair semantics, data retention on unpair
8. `LOV-020` push notifications

**The one to raise first:** nothing persists and neither partner can be notified,
so *"will a couple open this daily?"* cannot be answered by the build that
exists. Every other question is downstream of that.

---
