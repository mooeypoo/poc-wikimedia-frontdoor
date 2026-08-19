---
# Definitions-only source. The leading underscore in `_shared/` means this file
# emits no page (ADR §2); it exists so that strings repeated across several
# message-driven pages are translated once.
#
# Keys here MUST be fully qualified (start with `content-`), because they are
# referenced from other base files. See docs/adr-translatable-prose-content.md §6.
#
# Definitions in a `:::messages` block never render in place, so they carry no
# parameter values — `p1`…`pN` belong on the references that use them (ADR §4).
---

:::messages
:message[Read more on {{BIDI:$1}}]{#content-shared-read-more-on qqq="Supporting text on a navigation card pointing off-platform. $1 is the name of the destination site, for example Meta-Wiki or Wikidata. Keep the BIDI wrapper: the site name is usually Latin script and needs directional isolation inside a right-to-left sentence."}

:message[Read the tutorial]{#content-shared-read-the-tutorial qqq="Supporting text on a navigation card whose destination is a step-by-step tutorial."}
:::
