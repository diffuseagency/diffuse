# Security Specification - DIFFUSE Firebase

## 1. Data Invariants
- `projects` must point to a valid `clientId`.
- `billing` must point to a valid `projectId`.
- Public collections (`testimonials`, `services`, `portfolio`, `settings`) are read-only for public.
- Internal collections (`clients`, `projects`, `billing`) are strictly for Admin access.
- Admins are identified by being in the `admins` collection.

## 2. The "Dirty Dozen" Payloads (Denial Expected)

1. **Identity Spoofing**: Attempt to create a document in `clients` as an anonymous user.
   ```json
   { "name": "Hack", "email": "hack@hack.com" }
   ```
2. **Resource Poisoning**: Large string in `settings` key.
3. **State Shortcutting**: Updating a `billing` status to `paid` without admin auth.
4. **Orphaned Record**: Creating a `project` with a non-existent `clientId`.
5. **Unauthorized Read**: Reading `billing` collection as a guest.
6. **Shadow field**: Adding `isAdmin: true` to a client document.
7. **Type Mismatch**: Sending a string for `amount` in `billing`.
8. **Bypassing App Logic**: Direct list query on `clients` without auth.
9. **Malicious ID**: Using `../evil` as document ID.
10. **Timestamp Fraud**: Sending a future `createdAt` from client.
11. **PII Leak**: Accessing `clients` emails via unauthenticated list.
12. **Update Gap**: Modifying `createdAt` on an existing portfolio item.

## 3. Test Runner (Draft)

```typescript
// firestore.rules.test.ts
// (Simplified test logic for AI Studio environment)
import { assertSucceeds, assertFails } from '@firebase/rules-unit-testing';

// Test implementation would follow...
```
