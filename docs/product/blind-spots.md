# 12. What are we not thinking about?

[← Product docs index](../PRODUCT.md)

The section worth re-reading.

1. **The product cannot currently be tested by two people.** Everything is built
   for one device. This is not a feature gap; it means the core hypothesis is
   unfalsifiable.
2. **Memories has no way out — no edit, no delete, no export.** A permanent
   archive nobody can correct is a liability, not a feature.
3. **Nobody has designed the unhappy couple.** Every screen assumes affection.
   What does this app do when one partner has checked out? When they are
   fighting? When it is ending? Those are not edge cases; they are a large
   fraction of any real user base at any moment.
4. **The 21-screen onboarding is a bet that couples will invest before receiving
   value.** No evidence supports that; the category evidence points the other way.
5. **"Private by design" is already written in the copy and nothing backs it.**
   Promising E2EE and shipping TLS is worse than promising nothing.
6. **The archive is the only defensible asset** — chat is commoditised by
   iMessage, prompts are copyable in a sprint. Yet the archive is the module
   where creation is most broken (see [strengths and weaknesses](strengths-and-weaknesses.md) §4.1).
7. **The skip button is a trapdoor** (`LOV-002`). Somebody added it to reduce
   friction and accidentally built a state the product cannot recover from.

---
