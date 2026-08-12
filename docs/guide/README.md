# Developer guide

The curated, in-repository guide for developers working directly on the Front
Door codebase. These documents are written as guidance and principles – the
*why* alongside the *what* – rather than exhaustive API reference. They are kept
deliberately separate from the loose material one level up in
[../](..), which holds older ADRs and working notes not written for this
audience.

## Contents

- [source-of-truth-scripts.md](source-of-truth-scripts.md) – the standalone
  scripts that feed the portal from Wikimedia: the source-of-truth generators
  (language catalog, wiki fleet, REST API modules), the content importer and its
  HTML-to-Markdown converter, and supporting tools (dark-mode tokens). What each
  does, what to use directly, and what to treat as reference.

More guides will land here as the set grows. When a document leans on a decision
recorded in an ADR, it links out to the relevant file in [../](..) rather than
restating it.
