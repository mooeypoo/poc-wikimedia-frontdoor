# Plan: Dependency refresh to the production target

**Status:** Phases 0, 1 and 2 done. Phase 3 **Batch A complete and green** (all in-range bumps, browser-verified). Remaining: Phase 3 Batch B (five majors, each a separate decision), the Node 24 move (§7.9), Phase 4 doc reconciliation, and Phase 5 security re-run.
**Goal:** Move the whole dependency tree to current-latest so that `npm audit`, the security audit, and manual verification describe **what the production site will actually run**, not what the prototype happens to have installed.
**Scope:** Every runtime and dev dependency in `package.json`, with particular care around the Scalar integration, which is coupled to upstream internals in three places of very different risk.

**Related:**
- `docs/adr-scalar-interface-localization.md` — §6 ("Running this in production") is the origin of the drift check this plan leans on. §7 lists what was never verified against a running app.
- `ARCHITECTURE.md` → lines flagged `FRAGILITY:` — the pre-existing inventory of Scalar internal coupling.
- `docs/guide/generation-and-maintenance-scripts.md` — the `--check` convention these gates use.
- `AGENTS.md` → Absolute rules 1 (banana owns interface strings), 2 (BiDi isolation), 3 (`@scalar/nuxt` is not used), 7 (direction is declared, never inferred).

---

## 1. Why this is not a routine bump

The portal is a prototype whose dependency tree was assembled incrementally over several months. The production site will be built fresh, and a fresh build resolves every caret range to whatever is latest on that day. That means **the prototype's audit surface is not the production site's audit surface**, and any security work done against the current tree is describing a configuration that will never ship.

The purpose of this refresh is to make the two match, so that:

- `npm audit` reports vulnerabilities that will actually exist in production.
- A security audit reviews the code paths production will actually execute.
- Manual verification exercises the Scalar version production will actually embed.

The secondary purpose is to pay down coupling debt that a fresh install will expose anyway. Two items in §3 are already stale against the *installed* tree, before any version changes.

---

## 2. What this session established empirically

Everything in this section was run, not read. The commands are recorded so they can be re-run as gates later.

### 2.1 The Scalar localization drift check already fails

```
npm run generate-scalar-localization -- --check
```

Fails on `main` at `@scalar/api-reference@1.67.0`. Commit `c494ee4` ("Upgrade @scalar/api-reference library and update package.json", 2026-08-31) bumped the library without regenerating the committed artifacts.

The drift itself is **benign**: exactly one added string, 188 → 189.

```
+ { bananaKey: 'explorer-scalar-ui-common-copy-pattern', scalarPath: 'common.copyPattern' }
+ "explorer-scalar-ui-common-copy-pattern": "Copy pattern"
```

Nothing was renamed and nothing was removed, so no translation silently stopped applying. The detection mechanism worked exactly as designed. **The process around it did not** — see §2.2.

### 2.2 There is no automation enforcing any gate

There is no `.github/workflows/` directory. `netlify.toml` runs only `npm run build:netlify`. `package.json` has no root `test` script, so `tests/*.test.mjs` is hand-run only.

`docs/adr-scalar-interface-localization.md` §6 says the drift check "should run in review". Nothing enforces that, which is precisely how the last Scalar bump landed drifted. **A refresh that does not close this gap will drift again on the next bump.**

### 2.3 The root test suite is not green

```
node --test "tests/**/*.test.mjs"
# 36 tests, 35 pass, 1 fail
```

`tests/contentSidebarRouting.test.mjs` fails with `ERR_MODULE_NOT_FOUND` because `app/utils/contentRoute.ts:1` imports `'../../config/mainNavigation'` without a file extension. Vite resolves that; Node's ESM resolver does not. Pre-existing and unrelated to any dependency — but it means **new breakage cannot currently be distinguished from old**, which is disqualifying for an upgrade baseline.

### 2.4 Build and typecheck are verifiable in-sandbox after all

The sandbox denies reading `~/.nuxtrc`, which aborts `nuxt prepare` / `build` / `dev` with `EACCES`. Pointing `HOME` at an empty scratch directory sidesteps it, because rc9 then finds no user nuxtrc to read:

```
mkdir -p "$SCRATCH/fakehome"
HOME="$SCRATCH/fakehome" XDG_CONFIG_HOME="$SCRATCH/fakehome/.config" npx nuxt prepare
HOME="$SCRATCH/fakehome" XDG_CONFIG_HOME="$SCRATCH/fakehome/.config" npx nuxt build
```

Both verified working at Nuxt 4.4.6 on 2026-09-03. `nuxt build` completes and prerenders (16.6 MB total, 4.38 MB gzip).

This matters for the plan's shape: **typecheck and build gates do not need a relaunch or a human.** What still does is registry access (§4.1) and browser verification (§4.2).

---

## 3. The Scalar coupling, by layer

The Scalar integration is not one dependency, it is three couplings with different failure modes, different detectability, and *very* different blast radius. Treating them as one thing is the main way this upgrade could go wrong.

### Layer A — supported configuration API

**Risk: low. Detection: partial (TypeScript).**

`config/scalar.ts` uses documented, schema-validated options. A rename shows up as a type error against `@scalar/types`.

The exception worth naming: `agent: { disabled: true }` and `mcp: { disabled: true }` exist because **both features auto-enable on localhost**, and would enable anywhere a key were ever set. If an upgrade renames or re-scopes those keys, the failure mode is not a broken page — it is an AI chat surface quietly appearing in the explorer. TypeScript catches a rename. Nothing catches a semantic change to what `disabled` means.

**Gate:** typecheck, plus an explicit visual confirmation that Ask AI, the MCP button, and developer tools are all absent.

### Layer B — the generated localization map

**Risk: medium. Detection: good — this is the only layer with a real detector.**

Failure modes, by severity:

| Upstream change | Effect | Detected by |
|---|---|---|
| String added | Renders English. Harmless. | `--check` (as a diff) |
| String removed | Our translation ignored. Harmless. | `--check` (as a diff) |
| String **renamed** | **Silent.** Translation stops applying, no error anywhere. | `--check` only |
| Two paths collapsing to one banana key | Generator hard-fails. | Generator (guarded) |
| Locale table file moves | Generator hard-fails with an explanatory message. | Generator (guarded) |

The generator reaches into package internals — `dist/features/localization/locales/en.js`, resolved from the package entry rather than an assumed `node_modules` layout — because Scalar publishes no export path for its locale tables. That reach-in is deliberate and fails loudly by design (`loadScalarEnglishTranslations()`); it is a maintenance cost the drift check cannot remove.

**Three things in this layer are not guarded, and should be:**

1. **A new upstream locale.** Per ADR §3, the standing rule is *seed it, do not let it through*: a locale Scalar translates but we have not seeded bypasses banana entirely — no BiDi isolation, no Wikimedia terminology — and the language picker offers the whole catalog, so it is reachable. Nothing detects a new `locales/*.js`. This is the most valuable guard to add and is roughly ten lines in the generator.
2. **`models.label` pinning.** Pinned because Scalar feeds it through `slugify()` to build the Models canonical URL, so translating it is a routing change wearing a translation's clothes. If upstream stops slugifying it, the pin becomes dead weight. If upstream adds *another* slugified label, a new pin is needed — and nothing tells anyone.
3. **`localization.direction`.** If the config shape changes, the `ltr` pin stops applying and the embed flips for `he` / `fa` — mirrored text over unmirrored layout, since Scalar's stylesheet has no `[dir=rtl]` rules. This is Absolute rule 7 territory.

**Verdict:** the i18n layer is the *least* dangerous part of this upgrade. It is the one place a detector was built, and it degrades gracefully in every direction except rename, which the detector covers.

### Layer C — internal DOM and CSS coupling

**Risk: high. Detection: none. This is where an upgrade actually hurts.**

Roughly 2,000 lines of composables and utilities, plus a large CSS override file, keyed to Scalar's *internal* class names:

| Module | Lines |
|---|---|
| `app/composables/useScalarClientModalBackgroundScrollLock.ts` | 625 |
| `app/composables/useScalarClientWriteEndpointWarnings.ts` | 601 |
| `app/utils/scalarOperationNavigation.ts` | 273 |
| `app/composables/useHideScalarClientAuthSection.ts` | 166 |
| `app/composables/useExplorerScalarSidebarScroll.ts` | 145 |

Depending on `.scalar-client[role="dialog"]`, `.scalar-address-bar`, `.scalar-container`, `.scalar-app-layout`, `.scalar-app-exit`, `.app-exit-button`, `.scalar.scalar-app`, Tailwind height utilities, and a hardcoded `order: 10000` that must beat Scalar's `order-last` (9999) below its `lg` breakpoint.

All of those class names were confirmed still present at `@scalar/api-reference@1.67.0` / `@scalar/api-client@3.17.0`, so Layer C is intact **today**.

**The structural risk to watch:** `@scalar/api-client@3.17.0` ships a `dist/v2/blocks/…` tree, and `.scalar-address-bar` now lives in `v2/blocks/operation-block/components/Header.vue`. A version that flips the modal to v2 markup wholesale breaks the warning injection, the scroll lock, the auth-section hiding, and the modal chrome CSS **simultaneously**. None of it is type-checked. None of it is testable without a browser.

---

## 4. What requires a human, and exactly what output is needed

### 4.1 Registry access — blocks Phases 2, 3, 5

`registry.npmjs.org` is not in the nono allowlist. Every registry operation 403s:

```
npm error 403 Forbidden: host registry.npmjs.org is not in the allowlist
```

So version discovery, installation, and `npm audit` cannot happen in-session. Either allowlist the registry for this work, or run these manually and paste the output.

**Commands to run, and why each output is needed:**

```bash
# (a) What "latest" actually is. Drives every version target in Phase 3.
#     DONE 2026-09-03 — results in Phase 2.
npm outdated --long

# (b) Deprecation and peer warnings are the early signal for breaking majors.
#     Capture stderr; the warnings matter more than the success line.
npm install 2>&1 | tee /tmp/install-log.txt
```

For (a) the full `--long` output is wanted, not a summary — the "Depended by" and "Package Type" columns distinguish a direct dep needing a decision from a transitive one that will resolve itself.

### 4.1.1 The audit endpoint stalls, and it takes `install` / `update` down with it

Observed: `npm audit` stalls, **and so does `npm update`**, while `npm outdated` completes normally.

One cause explains all three. `npm audit` POSTs the whole dependency tree to the registry's bulk-advisory endpoint (`/-/npm/v1/security/advisories/bulk`), which stalls here — the lockfile is ~693 KB. **npm v7+ runs that same audit implicitly at the end of every `install` and `update`**, after the tree is already written. With `fetch-timeout=300000` and `fetch-retries=2`, that is up to ~15 minutes of apparent hang on a command that has actually finished its real work. `npm outdated` fetches only metadata and never audits, which is why it is unaffected.

**The fix is to opt out of the implicit audit:**

```bash
npm update --no-audit --no-fund
# or persistently, since audit now runs in CI anyway:
npm config set audit false
```

Turning it off locally costs nothing, because auditing moved to CI (below) where the network is clean.

**If a command still stalls after `--no-audit`,** the next suspect is a native install hook reaching a host other than the registry. The tree has four:

| Package | Install hook | Fetches from |
|---|---|---|
| `better-sqlite3` | `prebuild-install \|\| node-gyp rebuild` | GitHub releases, else `nodejs.org` headers |
| `sqlite3` | `prebuild-install -r napi \|\| node-gyp rebuild` | GitHub releases, else `nodejs.org` headers |
| `esbuild` | `node install.js` | registry (platform binary package) |
| `@parcel/watcher` | `build-from-source.js` | `nodejs.org` headers |

(`vue-demi`'s postinstall is local and wrapped in try/catch — no network.)

Diagnose with `npm update --no-audit --loglevel=verbose 2>&1 | tail -40` and read the last URL attempted. Isolate with `--ignore-scripts`, then `npm rebuild <pkg>` the native ones separately.

This matters for batching: **`better-sqlite3` is the only Batch A package with an install hook at all.** Every other in-range bump — `nuxt`, `@nuxt/content`, `@nuxtjs/i18n`, both Codex packages, `vue-router`, `rolldown`, `markdown-it`, `@netlify/functions` — is pure JavaScript with no install script, so a Batch A that omits `better-sqlite3` cannot hit a native-build stall.

### 4.1.2 `edgesOut` — orphaned optional shims in `node_modules`

After `--no-audit`, `npm update` failed differently:

```
npm error Cannot read properties of null (reading 'edgesOut')
```

**Nothing was damaged** — `package-lock.json` was untouched and no installed version had moved, so the failed runs left no partial state.

The cause was five packages installed but unreferenced:

```
@emnapi/core  @emnapi/runtime  @emnapi/wasi-threads
@napi-rs/wasm-runtime  @tybys/wasm-util
```

`npm ls --depth=0` reported all five `extraneous`. They are the runtime dependencies of the `*-binding-wasm32-wasi` packages belonging to `oxc-parser`, `oxc-transform`, `oxc-minify` and `rolldown`. On `linux-x64-gnu` the **native** bindings install instead and no wasm binding is installed at all — but npm had installed the wasm bindings' *dependencies* anyway. That leaves nodes in the actual tree with no parent edge, and arborist dereferences null while diffing against the ideal tree.

Verified before removing anything:

- No `binding-wasm32-wasi` directory exists anywhere in the tree.
- All four `binding-linux-x64-gnu` natives are installed and in use.
- The only other mentions of the shims are in the **devDependencies** of published packages, which npm never installs transitively.
- The lockfile is well-formed — `lockfileVersion: 3`, with `os`/`cpu` constraints on 232 optional entries — so this is not lockfile corruption.

Removing the three scope directories cleared it: `npm ls` reports no extraneous packages, `nuxt build` succeeds, and all 110 tests pass.

**`npm prune` is the wrong tool here.** Its `--dry-run` proposes *adding* dozens of cross-platform binaries (Windows, macOS, Android, FreeBSD rollup/rolldown bindings) — ideal-tree output before platform filtering — so running it would attempt downloads rather than a local cleanup. Delete the orphans directly instead:

```bash
rm -rf node_modules/@emnapi node_modules/@napi-rs node_modules/@tybys
npm ls --depth=0    # expect no "extraneous" lines
```

This is safe to redo: a fresh install restores whatever is genuinely needed. Expect it to recur after any install that resolves these optional bindings again — `npm ls --depth=0 | grep extraneous` is the one-line diagnostic when arborist next fails inexplicably.

### 4.1.3 `edgesOut` again — an npm bug on an optional wildcard peer

Clearing the orphans (§4.1.2) held — the tree stayed clean and the shims did not return — but `npm update` then failed with the *same message* from a *different place*:

```
TypeError: Cannot read properties of null (reading 'edgesOut')
    at #loadPeerSet (build-ideal-tree.js:1289:38)
...
silly unfinished npm timer idealTree:node_modules/nuxt
```

`#loadPeerSet`, not the tree diff. The peer set being loaded when it crashed was `oxc-parser@*`, `vue@^3.5.40`, `webpack@>=5.0.0`, `@vitejs/devtools@*`, `@vitejs/devtools-{oxc,rolldown,vite}@^0.7.1`, `postcss@^8.5.26`.

The culprit:

```jsonc
// node_modules/@nuxt/devtools/package.json  (3.2.4, a dependency of nuxt)
"peerDependencies":     { "@vitejs/devtools": "*", "vite": ">=6.0" },
"peerDependenciesMeta": { "@vitejs/devtools": { "optional": true } }
```

`@vitejs/devtools` is declared **optional**, is correctly **not installed**, and appears in `package-lock.json` only as a peer reference — never as an entry. Arborist tries to load a peer set for it anyway and dereferences null. **This is an npm defect** (10.9.8), not a misconfiguration in this repo: an optional peer with a `*` range is exactly the shape that triggers it.

It does **not** affect deploys. `npm ci` reifies straight from the lockfile and never builds an ideal tree, so Netlify and CI are unaffected. The bug blocks *updating*, not *installing what is already resolved*.

Two ways through, in order of preference:

```bash
# 1. Preferred — fixes the bug and matches modern build environments.
npm install -g npm@latest
npm update --no-audit --no-fund <packages>

# 2. Quick unblock — skips peer resolution entirely.
npm update --no-audit --no-fund --legacy-peer-deps <packages>
```

Prefer (1). `--legacy-peer-deps` changes how the *whole* tree resolves peers, so the lockfile it produces is not necessarily the one a fresh production install would produce — which cuts against this plan's entire premise (§1). For Batch A, all in-range minors, the practical difference is likely nil; it is still a deviation worth recording in the commit message if used.

### 4.1.4 The npm version is part of the lockfile's contract

First CI run after pushing Batch A: all three jobs failed identically.

```
npm error `npm ci` can only install packages when your package.json and
npm error package-lock.json are in sync.
npm error Missing: oxc-parser@0.148.0 from lock file
npm error Missing: esbuild@0.28.2 from lock file
…
```

The lockfile is **not** corrupt — it and `node_modules` agree exactly. The disagreement is between npm majors:

| Environment | npm |
|---|---|
| Local (after `npm install -g npm@latest`) | **12.0.2** |
| CI (`setup-node` → `.nvmrc` → Node 22) | **10.x** |
| Netlify (`NODE_VERSION = "22"`) | **10.x** |

Several transitive dependencies use open ranges:

```
unimport   requires oxc-parser "*"
unplugin   requires esbuild    "*"
unctx      requires oxc-parser ">=0.140.0"
```

npm 12 satisfies those by reusing versions already present in the tree. npm 10 resolves `*` to actual-latest — `oxc-parser@0.148.0`, `esbuild@0.28.2` — computes a different ideal tree, and `npm ci` refuses the lockfile as out of sync. Note the irony: `oxc-parser@0.148.0` is the Batch B major this plan deliberately deferred, arriving via a `*` range.

**`package-lock.json` is only reproducible under the npm major that wrote it.** That is the real finding, and it is the same class of gap as §1: a lockfile generated by a toolchain production does not run describes a tree production will not build.

Fixed in `.github/workflows/ci.yml` by pinning `npm install -g npm@$NPM_VERSION` before every `npm ci`, with `NPM_VERSION` set once at workflow level.

**Open, and it touches the deploy path:** Netlify also runs `npm ci` under npm 10 and should fail the same way. Two directions, and they are not equivalent:

1. **Pin npm 12 everywhere**, including Netlify. Consistent with the committed lockfile. Requires Netlify to honour an npm version override (`NPM_VERSION`), which is **unverified** — Netlify installs dependencies before the build command runs, so it cannot be fixed from `build:netlify`.
2. **Regenerate the lockfile under npm 10**, matching what production actually runs. More faithful to §1's premise, but npm 10.9.8 is the version with the `#loadPeerSet` arborist bug (§4.1.3) — it may not be able to resolve this tree at all, which is why npm was upgraded in the first place.

Direction 2 is more principled; direction 1 may be the only one that works. Settle it by checking whether the Netlify preview failed, then whether Netlify can run npm 12.

Whichever is chosen, **pin it in all three places** rather than leaving npm implicit. Leaving it unpinned means this recurs whenever a contributor's local npm differs from CI's.

### 4.1.5 Auditing runs in CI

The `audit` job in `.github/workflows/ci.yml` runs `npm audit` on a GitHub runner and uploads `npm-audit.json` as a build artifact. The job is `continue-on-error` on purpose: a new upstream advisory should not turn every unrelated PR red before the advisory list has been triaged to a known baseline.

This also gives Phase 5 its baseline for free — the artifact from a pre-Batch-A run *is* the "before" snapshot, with no local command needed. If a local run is wanted anyway, `npm audit --omit=dev` sends a smaller payload and sometimes completes where the full run does not.

Worth considering alongside: this repo has no `dependabot.yml`. GitHub's dependency alerts would give ongoing advisory coverage without a CI run, which matters more once the tree is at latest and the interesting question becomes "what became vulnerable since".

### 4.2 Browser verification — blocks the Phase 3 Scalar gate

Layer C cannot be verified any other way. The build succeeds regardless of whether the write-endpoint warning still lands in the right place, because that is runtime DOM injection into a third-party component.

Two options:

- **Preferred:** relaunch with `bin/claude --chrome` and run `bin/launch-test-chrome` in a second terminal, then the Layer C checklist (§6) can be driven directly.
- **Otherwise:** run the §6 checklist by hand and report pass/fail per line.

Note that serving the built output in-sandbox is separately blocked — `node .output/server/index.mjs` dies with `EACCES` on `listen` for any port — so a dev or preview server needs `--local-web` as well.

### 4.3 Where to pause

| Pause point | Waiting on | Status |
|---|---|---|
| End of Phase 0 | Nothing — review only | **Cleared.** Landed green |
| Phase 1 decision | A human call on `mapConfigPlugins` (§5) | **Cleared.** Deleted per Option 1 |
| Start of Phase 2 | §4.1 output (a) | **Cleared.** Inventory recorded in Phase 2 |
| **End of Phase 1** | §4.2 browser verification | **Open.** A green build cannot verify Layer C. This is the only outstanding gate on work already written |
| **Start of Phase 3** | `npm install` (registry) | **Open.** Version ranges can be edited without the registry; resolving them cannot |
| Start of Phase 5 | Phases 3–4 complete | Open. An audit of a half-upgraded tree describes nothing real |

---

## 5. The `mapConfigPlugins` override — RESOLVED (deleted)

**Decision: Option 1 — deleted.** Carried out in Phase 1; see §8 for what was removed and what remains to verify. This section is kept as the record of why, because `ARCHITECTURE.md` points at it and because the same reasoning applies if a future Scalar version reintroduces view-component forwarding.


`app/scalar/explorerMapConfigPlugins.client.ts` is an inlined copy of a Scalar internal, substituted for upstream's module through **three** separate mechanisms in `nuxt.config.ts`: a Vite `resolveId` plugin, a `resolve.alias` entry, and an `optimizeDeps.esbuildOptions` plugin. (All three because `resolve.alias` alone is not reliably applied when `@scalar/api-reference` is pre-bundled.)

It was written against `@scalar/api-reference@^1.46.4` (commit `ff6b20d`, June 2026). Upstream has moved:

| | Our copy | Upstream 1.67.0 |
|---|---|---|
| Signature | `(configuration)` | `(config, environment)` |
| Hooks built | `beforeRequest`, `responseReceived` | + `requestBuilt` |
| `beforeRequest` contract | Receives raw `payload`; return value replaces it | Calls `buildRequest()`, passes `{ request, requestBuilder, envVariables }`, **ignores** the return |

`ApiReference.vue.script.js:745` calls it with two arguments. We silently drop `environment`.

**This is currently inert.** Nothing in the app sets `onBeforeRequest`, `onRequestBuilt`, or `onRequestSent`, so every hook resolves to `undefined` and the behaviour coincidentally matches upstream.

**It is also a loaded trap.** The one feature that would use `onBeforeRequest` is OAuth bearer injection. Whoever implements that gets the 1.46 payload contract — a `payload` shaped differently from what upstream now passes, and a return value upstream now ignores — with no error and no type complaint, because our module *is* the type authority once aliased.

Unlike Layer B, **there is no drift check for this file.**

**It also appears vestigial.** Its stated purpose (`ARCHITECTURE.md` line 979) was to stop Scalar forwarding ClientPlugin *view* components into the modal, because Scalar's response slot renders under Response Headers and the write warning must not appear there. Upstream 1.67.0's `mapConfigPlugins` builds only `{ hooks: {} }` — there are no view components left to forward.

**The two defensible options:**

1. **Delete it** — the override, the Vite plugin, the alias, and the esbuild plugin — after confirming in a browser that modal behaviour is unchanged. Removes the single most fragile piece of the integration and three layers of build-time patching.
2. **Keep it and guard it** — add a `--check`-style comparison against upstream's file that fails on divergence, in the same spirit as the localization drift check.

Either is better than the status quo, which is a silently stale patch with no detector. **Option 1 is recommended**, contingent on the §6 browser checklist passing with the override removed.

---

## 6. Layer C verification checklist

Run against a browser, at the target Scalar version. This is the gate that a green build cannot substitute for. Each line maps to a coupling in §3 Layer C.

**Write-request production warning** — the highest-stakes item. This is the safety feature that warns before a write request reaches a production wiki.

- [ ] Open a write endpoint (`POST` / `PUT` / `DELETE`) → Test Request. Warning appears **under the address bar**, not under Response Headers.
- [ ] Warning renders below Scalar's `lg` breakpoint (narrow viewport) *above* nothing and *below* the URL row — the `order: 10000` case.
- [ ] Warning aligns with the URL input (the `--fd-scalar-address-bar-inline-align-offset` measurement).
- [ ] Select-copy variant appears when a non-production host is selectable; caution variant otherwise.
- [ ] Warning hides when the active address-bar server is a test wiki.
- [ ] Open a read endpoint (`GET`) → no warning.
- [ ] Send a request → warning does **not** duplicate under Response Headers.

**Modal chrome and scroll**

- [ ] Modal opens, closes, and the close control sits inset from the shell corner.
- [ ] Background scroll lock: reference scroll freezes on open, restores on close; page body scroll is not locked.
- [ ] Focus trap works; Escape closes.
- [ ] Auth section hiding still applies (`useHideScalarClientAuthSection`).

**Navigation and layout**

- [ ] Deep link to an operation (`/explorer/direct/…`, `/explorer/q/…`) focuses the right operation.
- [ ] Sidebar scroll sync follows the active entry.
- [ ] Dark mode: shell toggle drives Scalar; Scalar's own toggle stays hidden.

**Layer A confirmations**

- [ ] No Ask AI button (sidebar or per-operation), no chat drawer.
- [ ] No MCP button.
- [ ] No developer tools.

**Vite 8 dev-server behaviour** (added after Batch A1 — see Phase 3)

- [ ] `npm run dev`, then navigate into `/explorer` from another route: no 500 "Failed to fetch dynamically imported module" for `pages/explorer/[...view].vue`. This is what `vite.optimizeDeps.include` exists to prevent, and it has never been exercised against Vite 8.
- [ ] Same navigation after a cold start with `.nuxt` removed, which is when runtime dep discovery is most likely to fire.

**Layer B confirmations**

- [ ] Switch interface language → Scalar chrome re-renders translated, **without** the page reloading.
- [ ] Switch interface language → the loaded OpenAPI document is **not** refetched. (ADR §7 lists this as never having been observed running. Watch the network panel.)
- [ ] `he` / `fa`: explorer stays LTR, labels are BiDi-isolated, no mirrored-text-over-unmirrored-layout.
- [ ] Models section canonical URL stays English-slugged in a non-English locale.

---

## 7. Behaviour changes and ambiguities to carry into review

These are the things most likely to be missed, listed so a reviewer can check them deliberately.

1. **The write-endpoint warning fails silently.** If injection stops working after an upgrade, a visitor gets **no warning before a production write**. That is a safety regression, not a cosmetic one. `removeStrayWriteWarningHosts()` cleans up stray hosts, but nothing reports "the mount point could not be found at all". Worth adding a loud failure — a console error at minimum — as part of this work, independent of which version lands.

2. **ADR §6's text-matching warning is now live.** Now that Scalar's chrome *is* translated, any text-matching against it is locale-dependent. Current matches are in `app/utils/scalarClientModalHttpMethod.ts`, on HTTP method badges. Verified safe: method names are **not** in Scalar's translation table — only the label `"HTTP Method"` is. This must stay true; the match site deserves a comment saying why it is safe.

3. **If `@scalar/api-client` gains localization**, ADR §2's "awkward mixed surface" (translated page, English modal) closes — an opportunity. It also means previously-English modal chrome starts translating, which is exactly when text-matching against the modal would begin to break.

4. **`zh-cn` versus `zh-CN`.** Our catalogue key and `config/languages.generated.ts` both use lowercase `zh-cn`; Scalar ships `zh-CN`. We pass `locale: 'zh-cn'` straight through, so Scalar's own Chinese layer likely never matches. Consistent with the "banana always wins" policy — but it means a key missing from our `zh-cn` catalogue falls through to **English**, not to Scalar's Chinese. Fine as policy; worth knowing before someone "fixes" the casing.

5. **`sqliteConnector` is deliberately dev/prod-split.** `nuxt.config.ts` uses `sqlite3` in dev (native-binding double-load issue with `better-sqlite3` in Nuxt's dev pipeline) and `better-sqlite3` in build/prod (avoids noisy locked-table warnings from the async connector). These are two *separate* upstream bugs. A `@nuxt/content` upgrade may fix one and not the other, so keep both dependencies until each is independently re-verified, and test dev and build separately.

6. **Netlify is a distinct verification target.** `nodeBundler: "none"` with ESM `server.mjs`, and `netlify.toml` pins `NODE_VERSION = "22"`. A Nuxt or Nitro major can change preset output and break function bundling in a way plain `nuxt build` will not reveal. `netlify.toml` carries an explicit warning against setting `node_bundler = "esbuild"` — do not let a migration guide talk anyone into it.

7. **Vue is the pinch point for majors.** `@wikimedia/codex@2.5.1` peers `vue ^3.5.13`. `@scalar/api-reference` declares **no** peer dependencies at all, so it will not warn on an incompatible Vue — it will just break at runtime. `vue-router@5` and `pinia@3` are already on current majors.

8. **`@nuxtjs/i18n` must not start supplying interface strings.** It is used only for locale-prefixed routing; banana-i18n owns every interface string (Absolute rule 1). Confirm an upgrade does not change locale-code casing or begin resolving messages.

9. **Node version — recommend moving to 24, as its own change.** `.nvmrc` says `22`, `netlify.toml` pins `NODE_VERSION = "22"`, local is 22.22.3 (`NODE_MODULE_VERSION` 127).

   What the tree permits, from installed `engines` fields:

   | Package | `engines.node` |
   |---|---|
   | `nuxt` 4.5.2 | `^22.19.0 \|\| ^24.11.0 \|\| >=26.0.0` |
   | `better-sqlite3` | `20.x \|\| 22.x \|\| 23.x \|\| 24.x \|\| 25.x \|\| 26.x` |
   | `@scalar/api-reference` | `>=22` |
   | `rolldown` / `oxc-parser` | `^20.19.0 \|\| >=22.12.0` |

   **Nothing in the tree caps the Node version** — a full scan found no upper bound anywhere. Nuxt's range is the binding constraint, and note what it excludes: odd-numbered releases, and `24.0`–`24.10`. A move to 24 means **24.11.0 or later**, not "24".

   The argument for moving: Node 22 is in **maintenance** (security fixes only) and goes EOL around April 2027. A site launching in late 2026 would begin life on a runtime with roughly six months of support left. Node 24 is Active LTS with a materially longer runway. Node 26 exists — nuxt's range acknowledges it — but is not the right target for a production commitment until it reaches LTS.

   The argument for not doing it *inside* this refresh:

   - It changes the native ABI (127 → 137), invalidating **both** compiled modules — including `sqlite3`, which currently works. Every native binary must be rebuilt, so a failure has two candidate causes instead of one.
   - `netlify.toml` must change in lockstep, which makes it a deploy-path change and not merely a dependency change.
   - Doing it while `better-sqlite3` is already broken (Batch A2) would mean debugging two variables at once.

   **Sequence:** finish Batch A green on Node 22 → land it → then Node 24 as a standalone change (`.nvmrc`, `netlify.toml`, rebuild both native modules, full gate set including `build:netlify`) → then Batch B. Rebuilding `better-sqlite3` twice costs one command and is not worth optimising away.

---

## 8. Phases

Each phase has a gate the previous phase established. Phases 0 and 1 change no versions and are independently reviewable.

### Phase 0 — make the baseline trustworthy — **DONE**

No dependency changes. Should land as **two** commits (see §8.1).

- **Test resolution fixed at the runner, not in app code.** The blocker in §2.3 turned out to be a class, not a line: `app/` and `config/` contain ~135 extensionless relative imports, all idiomatic for Vite. `scripts/lib/nodeTestResolveAppExtensions.mjs` registers a Node resolution hook that appends `.ts` / `/index.ts` to a *relative* specifier Node has already failed to resolve, and rethrows the original error otherwise. App code stays idiomatic and any future test can import any app module. Registered via `--import` in the `test` script, which propagates to the per-file child processes `node --test` spawns.
- **A stale assertion was unmasked.** With the file finally loading, `tests/contentSidebarRouting.test.mjs` failed a real assertion: it expected `/use-content-and-data` → `'use-content-and-data'`, but that entry was dropped from `MAIN_NAVIGATION_ITEMS` when the primary nav was renamed (commit `83ce9da`). The page still exists as authored content and as the `/learn` redirect target, so `null` is correct. The assertion was replaced with two nav ids that do exist, plus a new case locking in that a content page outside the primary nav resolves to no id.
- **Scripts added:** `test`, `typecheck`, and `check` (tests + banana-content workspace suite + Scalar drift check).
- **CI added** at `.github/workflows/ci.yml` — a `check` job and a `build:netlify` job. This is the enforcement §2.2 found missing.
- **Drift cleared.** Artifacts regenerated; `--check` now reports 189 upstream strings current.

**Gate result:** 110 tests pass (44 root + 66 banana-content), `--check` exits 0, `nuxt build` completes.

**Two caveats carried forward:**

1. **`typecheck` will not run yet** — `vue-tsc` is not installed and cannot be added while the registry is blocked (§4.1). The script is correct; add `vue-tsc` as a devDependency in Phase 3 and then add `npm run typecheck` to the `check` script and to CI.
2. **`generate-module-source-of-truth` is deliberately absent from `check`** — it has no `--check` mode and it reaches the Wikimedia API, so it is not a gate. Giving it one would be a genuine improvement but is out of scope here.

#### 8.1 Suggested commit split

The Scalar regeneration must not be buried in the tooling change — the whole point of the drift check is that its diff gets read.

```
1. build: Add test runner, check gate, and CI
   scripts/lib/nodeTestResolveAppExtensions.mjs, package.json,
   tests/contentSidebarRouting.test.mjs, .github/workflows/ci.yml,
   docs/upgrade-plan-dependency-refresh.md

2. explorer: Regenerate Scalar localization artifacts for 1.67.0
   config/generated/scalarLocalization.generated.ts,
   i18n/explorer-scalar/en.json, i18n/explorer-scalar/qqq.json
```

Commit 2's diff is the reviewable record that the only upstream change was one added string.

### Phase 1 — resolve the `mapConfigPlugins` override — **CODE DONE, BROWSER VERIFICATION PENDING**

Option 1 from §5 was chosen: the override is deleted. Removed in full —

- `app/scalar/explorerMapConfigPlugins.client.ts` (the diverged copy)
- `app/scalar/scalarMapConfigPluginsResolvePlugin.ts` (the Vite `resolveId` plugin)
- the `vite.resolve.alias` entry in `nuxt.config.ts`
- the `optimizeDeps.esbuildOptions` esbuild plugin
- `projectRootDirectory` and the `node:url` / `node:path` imports, which existed only to serve the above

`optimizeDeps.include` was **kept** — it fixes an unrelated dev-navigation bug (runtime dep discovery invalidating `/_nuxt/pages/…` mid-navigation) and has nothing to do with the override.

**Verified without a browser:** `nuxt build` succeeds, and upstream's real implementation is now genuinely bundled — the built client chunks contain `onRequestBuilt`, `buildSafeBodyRequest` and `allowMissingRequestServerBase`, all of which exist only in Scalar's version and never in the local copy. The swap is real, not merely a deleted file.

**Also updated:** `ARCHITECTURE.md` lines 979 and 1614 referenced the deleted module. Line 979 now records why the override existed, that upstream forwards no view components, and that **a future Scalar version which starts forwarding ClientPlugin view components again would make the write warning render under Response Headers** — the failure this override was originally built to prevent.

**Gate outstanding:** the §6 browser checklist, specifically the write-request warning group. Nothing about the modal's DOM should have changed, but this removed a build-time patch that touched the modal's plugin chain, and that claim is not verifiable from a build artifact.

### Phase 2 — inventory the production target — **DONE**

`npm outdated --long` on 2026-09-03. **The result substantially reduces the risk in this plan.**

**Already at latest — no action:** `@scalar/api-reference` (1.67.0), `vue` (3.5.42), `banana-i18n` (2.4.0), `sqlite3` (6.0.1), `yaml` (2.9.0).

Two consequences worth stating plainly:

- **There is no Scalar upgrade to perform.** The entire Layer B/C risk analysis in §3 describes a *future* upgrade, not this one. The drift cleared in Phase 0 was the whole of the outstanding Scalar impact. §3 and §6 remain the standing procedure for whenever Scalar does move.
- **There is no Vue major.** §7.7 named Vue the riskiest coupling in the tree because `@scalar/api-reference` declares no peer dependencies and so would not warn on an incompatible Vue. That risk does not materialise here.

**In-range (a fresh `npm install` takes these whether or not we choose them):**

| Package | Current | Wanted |
|---|---|---|
| `nuxt` | 4.4.6 | 4.5.2 |
| `@nuxt/content` | 3.14.0 | 3.16.0 |
| `@nuxtjs/i18n` | 10.4.0 | 10.6.0 |
| `@wikimedia/codex` | 2.5.1 | 2.6.0 |
| `@wikimedia/codex-design-tokens` | 2.5.1 | 2.6.0 |
| `vue-router` | 5.0.7 | 5.3.1 |
| `rolldown` | 1.0.2 | 1.2.7 |
| `better-sqlite3` | 12.10.0 | 12.11.1 |
| `markdown-it` | 14.2.0 | 14.3.1 |
| `@netlify/functions` | 5.2.2 | 5.3.0 |

**Out of range — each is a deliberate decision:**

| Package | Current | Latest | Note |
|---|---|---|---|
| `pinia` | 3.0.4 | 4.0.3 | Must move with `@pinia/nuxt` |
| `@pinia/nuxt` | 0.11.3 | 1.0.2 | Peers `pinia ^3.0.4` today |
| `better-sqlite3` | 12.10.0 | 13.0.3 | Native module; `@nuxt/content` peers `^12.5.0` |
| `markdown-it` | 14.2.0 | 15.0.1 | Used by `ExplorerEnterpriseCustom` |
| `@netlify/functions` | 5.2.2 | 6.0.0 | Deploy path — see §7.6 |
| `oxc-parser` | 0.131.0 | 0.148.0 | devDependency; `0.x`, so a minor is out of range |

**The in-range/out-of-range split is the plan's real structure**, and it is more important than the risk ordering originally sketched here. Production resolves carets on a fresh install, so the "Wanted" column is **not optional** — it is what production will run. Only the majors are a choice.

### Phase 3 — upgrade in two batches

Reordered around the Phase 2 finding. Each batch is its own commit.

**Batch A — take the in-range bumps (not optional).** Refresh the lockfile to what a fresh production install resolves. `nuxt`, `@nuxt/content` and Codex all move together here; they are in-range minors, not the peer-coupled major migration §7.7 was worried about.

Split in two so a native-build stall cannot block the pure-JS work (§4.1.1):

```bash
# A1 — no install hooks in this set, so nothing can reach GitHub or nodejs.org.
npm update --no-audit --no-fund \
  nuxt @nuxt/content @nuxtjs/i18n @wikimedia/codex @wikimedia/codex-design-tokens \
  vue-router rolldown markdown-it @netlify/functions

# A2 — the one native package. Run separately so its failure is isolated.
npm update --no-audit --no-fund better-sqlite3
```

A1 carries all the behavioural risk (Nuxt, Content, Codex); A2 carries all the toolchain risk and none of the behavioural risk — 12.10.0 → 12.11.1 is a patch bump. If A2 stalls, it is safe to leave for later; nothing else in the plan depends on it.

*Gate:* `npm run check`, `nuxt build`, `build:netlify`, and — because `@nuxt/content` moves — the dev and prod sqlite connectors verified **separately** (§7.5). Also re-confirm the Layer A items in §6: Codex and Nuxt minors should not touch Scalar's config surface, but an AI or MCP surface re-enabling is a security regression, not a cosmetic one.

#### Batch A1 result — **DONE 2026-09-03**

All nine targets landed exactly as planned:

| Package | From | To |
|---|---|---|
| `nuxt` | 4.4.6 | 4.5.2 |
| `@nuxt/content` | 3.14.0 | 3.16.0 |
| `@nuxtjs/i18n` | 10.4.0 | 10.6.0 |
| `@wikimedia/codex` | 2.5.1 | 2.6.0 |
| `@wikimedia/codex-design-tokens` | 2.5.1 | 2.6.0 |
| `vue-router` | 5.0.7 | 5.3.1 |
| `rolldown` | 1.0.2 | 1.2.7 |
| `markdown-it` | 14.2.0 | 14.3.1 |
| `@netlify/functions` | 5.2.2 | 5.3.0 |

`added 75, removed 70, changed 235`. Gates: 110 tests pass, drift check clean, `nuxt build` and `NITRO_PRESET=netlify nuxt build` both succeed, and both sqlite connectors load (`sqlite3` 6.0.1 for dev, `better-sqlite3` 12.10.0 for prod) with `.data/content` wiped first to force a fresh content database.

**Vite 7.3.3 → 8.2.2 — a major, delivered transitively by an in-range minor.**

This is the headline result and it was not predicted anywhere above. `vite` disappeared from the lockfile root and reappears nested at `node_modules/nuxt/node_modules/vite` and `node_modules/@nuxt/vite-builder/node_modules/vite`, both at **8.2.2**. `@nuxt/devtools` likewise moved from a hoisted 3.2.4 to a nested 3.4.2.

§7.7 named Vue as the pinch point for majors. That was the wrong package to worry about: **Vue did not move, and Vite jumped a major inside a bump we correctly classified as "not optional".** The general lesson is worth carrying: for a framework package, an in-range minor can carry a major of a core transitive dependency, and `npm outdated` shows none of it because it only reports direct dependencies. **Diff the lockfile, not just the outdated table.**

Two consequences:

- The `vite.optimizeDeps.include` block in `nuxt.config.ts` is now running against Vite 8. It exists to stop Vite discovering deps at runtime and invalidating `/_nuxt/pages/…` mid-navigation, which surfaced as a 500 on `pages/explorer/[...view].vue`. Whether it is still necessary, still sufficient, or now counterproductive **cannot be checked from a build** — it is a dev-server behaviour. Added to the §6 checklist.
- Phase 1's timing was lucky. The deleted Vite `resolveId` plugin and `optimizeDeps.esbuildOptions` plugin were plugin-API surface that Vite 8 could have broken. Removing them before this bump avoided debugging a stale patch against a new major.

**Not a regression, but worth knowing: the Netlify preset resolves to `netlify-legacy`.**

`.netlify/functions-internal/nitro.json` reports `preset: netlify-legacy`. The output is `server.mjs` (a handler re-export) plus `server.json` carrying `{"config":{"nodeModuleFormat":"esm"}}` — **not** the modern preset's `server.mjs` with `nodeBundler: "none"` and a `main.mjs` re-export, which is what `netlify.toml`'s comment describes.

Cause: `nuxt.config.ts` sets `compatibilityDate: '2024-05-07'`, exactly the modern `netlify` preset's own `compatibilityDate`, and `netlify-legacy` declares `aliases: ["netlify"]` — so the alias wins at the boundary. **`nitropack` is unchanged at 2.13.4 across this upgrade**, so this is pre-existing behaviour, not something Batch A introduced. It is recorded because the comment in `netlify.toml` does not describe what the build actually emits, which will mislead the next person to read it. Advancing `compatibilityDate` past 2024-05-07 would switch presets — a deploy-path change that should be made deliberately and verified against a real Netlify deploy, not folded into a dependency refresh.

**npm 11 blocks install scripts by default.** The upgrade to npm latest introduced an `allowScripts` gate; nine scripts were blocked, including `better-sqlite3`, `sqlite3` and `esbuild`. This turned out to be harmless here — `vue-demi`'s postinstall is a no-op wrapped in try/catch, neither sqlite package was updated so their existing `.node` binaries survived, and esbuild's binary ships via its platform `optionalDependency` rather than the postinstall. **It will not be harmless in Batch B**, where `better-sqlite3` 13 genuinely needs a rebuild: use `npm install-scripts approve better-sqlite3` (or `npm rebuild better-sqlite3`) and verify `build/Release/better_sqlite3.node` is newer than the install.

#### Batch A2 result — **RESOLVED. Batch A complete and green.**

`better-sqlite3` 12.10.0 → 12.11.1. It broke the build first; the failure and its shape are recorded below because the shape is the lesson.

Resolved with `npm install-scripts approve better-sqlite3 && npm rebuild better-sqlite3`. `prebuild-install` fetched a prebuilt binary (no local compile). Verified loading and executing a query.

**The approval is a committed artifact.** `npm install-scripts approve` wrote a new top-level field into `package.json`:

```jsonc
"allowScripts": {
  "better-sqlite3@12.11.1": true
}
```

Two consequences:

- **Good:** this travels with the repo, so if CI or Netlify ever move to npm 11 the native install still runs. The concern raised below — that the approval might live only in one developer's local npm state — does not apply.
- **Watch:** the key is **pinned to the exact version**. The next `better-sqlite3` bump produces `better-sqlite3@12.12.0`, which the existing entry does not cover, and the build breaks again in exactly the same way. Re-approval is part of upgrading this package from now on. The same will apply to `sqlite3` and `esbuild` whenever they are first approved.

**Full Batch A gate, all green:**

| Gate | Result |
|---|---|
| `npm run check` | 110 pass (44 root + 66 banana-content), drift check clean |
| `nuxt build` | Build complete, exit 0 |
| `NITRO_PRESET=netlify nuxt build` | Build complete, exit 0 |
| `better-sqlite3` (prod connector) | Loads, executes queries |
| `sqlite3` (dev connector) | Loads |
| Browser check | Verified informally by the engineer — explorer and Test Request behaving |

Both builds ran with `.data/content` deleted first, so the content database was rebuilt from scratch through the production connector rather than reusing a cached one.

---

#### How it broke (kept for the pattern)

`npm update --no-audit --no-fund better-sqlite3` moved 12.10.0 → 12.11.1 and **broke the production build**.

npm 11's `allowScripts` gate blocked the `install` script (`prebuild-install || node-gyp rebuild --release`). npm replaced the package directory with 12.11.1, which ships no binary, and the 12.10.0 binary that had been sitting in `build/Release/` went with the old directory. Nothing rebuilt it.

```
ERROR  Could not locate the bindings file. Tried:
 → node_modules/better-sqlite3/build/Release/better_sqlite3.node
 …
```

**Blast radius:**

- `nuxt build` / `build:netlify` — **fail**. `nuxt.config.ts` selects `better-sqlite3` as the `sqliteConnector` whenever `NODE_ENV === 'production'`.
- `npm run dev` — **unaffected.** Dev uses the `sqlite3` connector, whose binary is intact.
- `npm run check` — **unaffected.** Nothing in the test path touches the content database.

That combination is worth naming, because it is the dangerous shape: **the failure is invisible to the dev server and to the test suite, and only appears at build time.** A contributor could work all day without noticing.

**Fix (needs network — `prebuild-install` fetches from GitHub releases, `node-gyp` from `nodejs.org`):**

```bash
npm install-scripts approve better-sqlite3
npm rebuild better-sqlite3
node -e "new (require('better-sqlite3'))(':memory:'); console.log('ok')"
```

Approving an install script is a genuine trust decision — it is arbitrary code execution at install time, which is exactly why npm 11 started gating it. `better-sqlite3`, `sqlite3` and `esbuild` are all long-standing dependencies already relied on here, so approving them is reasonable; approving them *knowingly* is the point.

**Not a deploy risk today.** CI (`actions/setup-node` with `node-version-file: .nvmrc`) and Netlify (`NODE_VERSION = "22"`) both get the npm bundled with Node 22, which is 10.x and has no `allowScripts` gate. Native installs run normally there. When either environment moves to npm 11 the `allowScripts` entry in `package.json` covers it — see the Batch A2 result above.

**Batch B — decide the majors, one at a time.** Recommended order, easiest first, each its own commit and gate:

1. `oxc-parser` — devDependency, no runtime surface.
2. `markdown-it` 15 — check the v15 changelog against `ExplorerEnterpriseCustom` and `mdc.config.ts`.
3. `pinia` 4 + `@pinia/nuxt` 1 — must move together; verify `stores/prototypeDeveloperTokens.ts` and the OAuth session path.
4. `better-sqlite3` 13 — native rebuild; **check `@nuxt/content`'s peer range first**, it wants `^12.5.0` and may not accept 13.
5. `@netlify/functions` 6 — last, because it is the deploy path. Verify against `netlify.toml`'s `nodeBundler: "none"` warning (§7.6). This is the one most likely to need a real deploy preview rather than a local build.

*Gate per item:* `npm run check` + `nuxt build`; plus `build:netlify` for items 4 and 5.

**Deferred by decision:** Nuxt/Vue majors, per §9 — moot for now, since neither has one pending.

### Phase 4 — reconcile the documentation

`docs/adr-scalar-interface-localization.md` still says "Version 1.65.1 (the version currently installed)" and "188 strings"; it is 1.67.0 and 189, and will be something else again. Update the ADR, the `FRAGILITY:` notes in `ARCHITECTURE.md`, and `docs/TECH_DECISIONS.md` with the versions actually verified.

### Phase 5 — re-run the security work against the real target

Now meaningful, because the tree matches production:

- `npm audit`, diffed against the Phase 2 baseline — separating "the refresh fixed this" from "the refresh introduced this".
- The security audit over the upgraded tree.
- Re-check the Layer A confirmations (§6): an AI or MCP surface silently re-enabling is a security-relevant regression, not a cosmetic one.

---

## 9. Open questions

- **Do Nuxt or Vue majors ride along, or wait?** **Resolved, and it turned out to be a non-question.** Phase 2 found no Vue major pending (3.5.42 is latest) and Nuxt only a minor (4.4.6 → 4.5.2, in range). Decision recorded: majors are a deliberate second step, but none of the deferred majors are Nuxt or Vue — they are `pinia`, `better-sqlite3`, `markdown-it`, `@netlify/functions` and `oxc-parser` (Phase 3 Batch B). Re-ask when a Vue or Nuxt major actually appears; §7.7 is the standing reason to take it seriously when it does.
- **Is `sqlite3` still needed at all?** It exists solely to dodge a dev-pipeline bug (§7.5). If a `@nuxt/content` upgrade fixes it, dropping a native dependency is a real audit-surface win.
- **Should Layer C get any automated coverage?** Today it has none, and it is the highest-risk layer. Even a thin browser smoke test asserting the warning mount exists would convert the worst silent failure in the system into a loud one.
- **All 115 translator-facing `qqq` entries are still `TODO`.** The generator pre-fills the mechanical half (upstream path, English default, parameter notes) and marks the half needing a human. None of those sentences were ever written — this predates the refresh and is unchanged by it. It compounds ADR §6's "translator delivery is unsolved": even once a TranslateWiki message group exists, translators would receive 115 keys with no context. Writing them is translation-adjacent product work, not engineering, and wants an owner.
- **Does the production build pin or float?** If production resolves carets fresh on every deploy, the tree drifts continuously and this exercise recurs indefinitely. A committed lockfile in the deploy path is the alternative. Out of scope here, but this refresh is the moment to ask.
