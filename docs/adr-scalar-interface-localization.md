# ADR: Localizing the API explorer's own interface

**Status:** Decided and implemented as an experiment. The mechanism is in place: `config/scalarLocalization.ts` (policy), `scripts/generate-scalar-localization.mjs` (map + English catalogue + drift check), `scripts/seed-scalar-localization.mjs` (upstream seeding), `app/scalar/scalarLocalization.ts` (injection). 114 of Scalar's 188 interface strings are translated, across all seven locales Scalar itself ships (`ar`, `de`, `es`, `fr`, `pt`, `ru`, `zh-cn`), each seeded from Scalar's own MIT-licensed translation and **not** reviewed by a Wikimedia translator. `he` and `fa` have no catalogue yet and render English (§7). Not verified against a running app — see §7.
**Scope:** The interface strings that Scalar renders inside the API explorer — button labels, section headings, sidebar chrome, search UI. Not the API documentation itself.

**Related:**
- `docs/guide/language-and-internationalization.md` — the two-system split. This ADR removes the exception recorded there.
- `ARCHITECTURE.md` → "Explorer internal strings: accepted exception" — superseded by this document.
- `docs/adr-translatable-prose-content.md` — the precedent for a second banana message namespace with a structural boundary.
- `AGENTS.md` → Absolute rules 1 (banana owns interface strings), 2 (BiDi isolation), 6 (config lives in `config/`), 7 (direction is declared, never inferred).

---

## Summary

The API explorer embeds Scalar, a third-party API reference component. Roughly a hundred of the words a visitor reads on that page — *Test Request*, *Responses*, *Show more*, *Authentication* — are produced by Scalar, not by us, and have never been translated. Until recently they could not be.

Scalar now accepts a translation table through its configuration. This ADR proposes routing that table through banana-i18n, so those strings are authored, documented and translated exactly like every other interface string in the portal, and update live when a visitor changes language.

The mechanism is small: a generated key map, a catalogue of banana messages, and one function that assembles them into the shape Scalar expects. There is no build step and no plugin. The interesting parts of this document are the boundaries — what this **cannot** reach (§2), and what has to be true for it to survive a dependency upgrade (§6).

---

## 1. Why this reverses a documented decision

The portal has, until now, treated Scalar's internal strings as an accepted exception to the rule that banana-i18n produces every interface string. The reasoning was recorded in two places and was sound at the time: these are third-party developer-tooling strings, rendered outside our component tree, with no supported way to replace them.

Two things changed.

**Scalar shipped a localization API.** Version 1.65.1 (the version currently installed) accepts a `localization` object on its configuration: a locale code, a text direction, and a partial table of translations that is merged over its built-in English. It is a supported, schema-validated entry point, not a hack.

**The exception became visible.** The explorer is the portal's most-used surface. A visitor reading Hebrew chrome everywhere else meets an English panel the moment they open an endpoint. The exception was defensible when it was unavoidable; it is harder to defend as a preference.

The rule in `AGENTS.md` is unchanged and unweakened: banana-i18n remains the only system producing interface strings. This ADR brings a surface *into* that rule rather than carving anything out of it.

---

## 2. What this cannot translate

This is the most important section, and it is deliberately placed before the mechanism.

**The Test Request modal stays English.** Scalar's request-testing panel is a separate package (`@scalar/api-client`) that contains no localization support whatsoever — its strings are hardcoded. Nothing in this design reaches them.

This produces a genuinely awkward result, and it should be stated plainly rather than discovered later: a Hebrew-reading visitor will open Test Request and find English Scalar chrome wrapped around the Hebrew warnings the portal already injects there. **We are accepting that mixed surface for the experiment.** It is the single strongest argument for waiting, and it should be surfaced to anyone reviewing the work.

**API documentation content stays in whatever language the wiki wrote it.** Endpoint descriptions, parameter names, schema fields, example values — all of that comes from the OpenAPI document, not from Scalar's interface layer. It is out of scope here and remains a separate known gap (see `ARCHITECTURE.md` → "Known gap: Scalar spec content").

**Strings Scalar has not exposed stay English.** The translation table covers what Scalar chose to make translatable. Anything outside it renders in English and there is no supported way to reach it.

**One string is deliberately never translated.** Scalar's Models section label is not display-only — it is fed through `slugify()` to build the section's canonical URL. Translating it would make that URL locale-dependent, which is a routing change wearing a translation's clothes. It is pinned to English in every locale.

Note that pinning is stronger than merely leaving it out, and the difference is not obvious: omitting the string lets Scalar's *own* built-in Spanish and French supply one, so the behaviour we were avoiding happens anyway through a different layer. Only writing English explicitly prevents it. This was found by running the assembled table through Scalar's real resolver rather than by reading the code, which is a reasonable argument for doing that on any future change here.

The practical shape of the result: a translated explorer *page*, an untranslated request *modal*, and API content in its source language. Three layers, two of them outside our control.

---

## 3. How it works

Four steps, once per language change.

```
i18n/explorer-scalar/<locale>.json     banana messages, translator-owned
        │  banana-i18n resolves each key for the active locale
        ▼
   flat kebab-case strings
        │  generated key map: banana key → Scalar dot-path
        │  parameter conversion: $1 → {name}
        │  BiDi isolation applied
        ▼
   nested translations object
        │  assigned onto the live Scalar configuration
        ▼
   Scalar re-renders in place — no reload, no remount
```

**Keys.** Scalar names its strings as nested dot-paths in camelCase (`operation.testRequest`). banana uses flat kebab-case keys. The conversion in that direction is mechanical and, verified against all 188 of Scalar's current strings, collision-free — so the map is **generated from Scalar's own English defaults and committed**, not hand-maintained. `operation.testRequest` becomes `explorer-scalar-ui-operation-test-request`. The prefix keeps our keys unique and self-describing regardless of how terse Scalar's own names are, and the generator hard-fails if a future Scalar version ever introduces two paths that collapse to the same key.

**Parameters.** Eight of the reachable strings interpolate a value — "Show all *{name}* endpoints", where `{name}` is a tag or schema name from the API document. Scalar expects its own `{name}` syntax; banana uses `$1`. Our catalogue stores the banana form, and the injection layer converts. Translators therefore work with `$1`, the convention they already know, and never encounter a foreign placeholder token they must preserve byte-for-byte.

**Direction is pinned to left-to-right, deliberately.** Scalar can set text direction on its own root element and by default infers it from the locale — which would flip the entire explorer to RTL for Hebrew and Persian. It must not be allowed to. Scalar's stylesheet contains no right-to-left rules and is overwhelmingly written in physical (`left`/`right`) rather than logical properties, so flipping the direction flag mirrors the text while leaving the layout unmirrored: a half-broken page. We pass `ltr` explicitly. This also satisfies the standing rule that direction is declared rather than inferred.

**BiDi isolation is applied at injection, not in the catalogue.** With the explorer pinned LTR, a Hebrew or Persian label is right-to-left text inside a left-to-right container — exactly the case that requires isolation. Since we cannot wrap Scalar's text nodes in `<bdi>` markup, the injection layer wraps each finished string, and each interpolated parameter, in Unicode isolation characters. Doing this in code rather than in the message files keeps the translator-facing JSON clean and applies the rule uniformly without anyone having to remember it.

**banana always wins.** Scalar resolves a string from three layers: its built-in English, then its built-in translation for the locale, then whatever we supply. Ours is last, so a banana message always overrides Scalar's own — that ordering is upstream behaviour and has been verified directly, not assumed.

The layer below ours is where care is needed. Scalar translates eight locales of its own, and for any of those we left uncovered it would serve its strings directly: never routed through banana, never BiDi-isolated, never checked against Wikimedia terminology. A visitor can select any of them, because the language picker offers the whole catalog. So we do not leave them uncovered — **every locale Scalar translates has a banana catalogue of ours**, seeded from Scalar's own MIT-licensed translation and owned by us from that point (§4.2).

The rule that falls out of this is worth stating plainly, because it is the thing to preserve when Scalar next adds a locale:

> Scalar's translation layer is a fallback of last resort, not a supplier. The only strings it is left to serve are those for a locale nobody has translated at all — and for those it resolves to English, which is the same English our own catalogue holds.

**Everything is live.** Scalar reads its translation table through a reactive binding, so updating the configuration in place — the same pattern the explorer already uses for dark mode — re-renders the interface without reloading the page or refetching the API document.

---

## 4. What an implementer does

1. **Generate the key map and English seed.** A command reads Scalar's built-in English table at the installed version and writes three committed artifacts: the banana-key ↔ Scalar-path map, an English message catalogue, and a `qqq` documentation skeleton pre-filled with each string's Scalar path and default value. The human work is adding a sentence of translator context per key; the mechanical work is not repeated by hand.

2. **Seed every locale Scalar translates.** Scalar ships community translations for `ar`, `de`, `es`, `fr`, `pt`, `ru` and `zh-CN` under the MIT licence. All seven are copied into our catalogues — not only the locales the portal already had interface messages for. Copying is legally clean with attribution, gives seven real locales immediately, and is what makes the rule in §3 hold: a locale we skipped would be a locale Scalar supplied directly.

   Seeded strings have not been reviewed by a Wikimedia translator and are marked as such in each file's `@metadata`. They are a starting point to revise, not finished work.

   Hebrew and Persian have no upstream source and need hand-authored catalogues — worth noting, because they are the two locales the experiment most needs to prove and the portal's two right-to-left interface locales.

3. **Build the translations object.** A composable resolves each mapped key through the banana instance the rest of the app already uses, converts parameters, applies isolation, and nests the result. It must use the plugin's cached banana instance rather than the standalone helper in `app/utils/resolveInterfaceMessage.ts`, which constructs a fresh instance per call and would do so a hundred-odd times per language change.

4. **Attach it to the configuration.** Add `localization` to the reactive Scalar configuration and update it in place when the interface locale changes, mirroring the existing dark-mode watcher.

5. **Wire the drift check into review.** See §6.

Code locations for anyone going deeper: the Scalar configuration is assembled in `app/composables/useScalarConfig.ts` and its defaults live in `config/scalar.ts`; the component is mounted in `app/components/explorer/ExplorerScalarReference.client.vue`; the active interface locale is the shared `interfaceLocale` state provided by `app/plugins/banana-i18n.ts`. Upstream, Scalar's resolution logic is in `@scalar/api-reference/dist/features/localization/`.

---

## 5. Where the messages live, and why not with the others

Scalar's strings go in a **separate namespace**, `i18n/explorer-scalar/`, not into the main `i18n/*.json` files.

The reason is a bundle boundary, and it follows the precedent set by translatable prose content. The banana plugin imports every interface locale file eagerly, for every visitor, on every page. Adding roughly a hundred Scalar strings across five languages would add tens of kilobytes to the payload of every page on the site — including the many pages that never load Scalar at all. A separate directory, imported only from the explorer's client-only code, keeps that weight on the one route that uses it.

As with prose content, the boundary is structural rather than conventional: it is an import boundary, enforced by which file imports what, not a naming rule someone has to remember.

Generated files (the English catalogue, the `qqq` skeleton, the key map) are overwritten wholesale and carry the project's standard *do not edit by hand* header. Translator-owned files are **never** written by any tool we ship.

---

## 6. Running this in production

**Guard against upstream drift.** The set of translatable strings belongs to Scalar, not to us. A Scalar upgrade can add strings (harmless — they render in English), remove strings (harmless — our translation is ignored), or *rename* a string. That last case is silent: our translation simply stops applying, with no error anywhere.

The mitigation is a check that regenerates the key map against the installed Scalar version and reports the difference. It should run in review, and a Scalar version bump should be treated as a change that requires looking at that diff. Worth noting that the declared dependency range currently permits a wide span of versions, and the installed tree is already well ahead of the pinned floor — this drift exists today, before any of this work.

**Audit which strings are actually reachable.** Of Scalar's 188 strings, around 54 belong to features the portal disables outright — developer tools, the AI agent, MCP. Sending those to translators is wasted effort. The recommendation is to generate the map for everything, so drift detection stays complete, but to emit translator-facing catalogues only for the reachable subset, with the excluded groups listed in configuration alongside the reason.

**Understand the new fragility.** The explorer relies in a few places on matching Scalar's rendered text to find elements in the page — a documented compromise where Scalar offers no stable hook. Those matches currently target the Test Request modal, which this change does not translate, so nothing breaks today. But the general point now holds: **once Scalar's chrome is translated, any text-matching against it becomes locale-dependent.** Future work of that kind must key off structure, not words.

**Translator delivery is unsolved.** These messages have no path to translators, for the same reason the prose-content messages do not: there is no TranslateWiki message group for either namespace. Until there is, translations are hand-added and the feature's value is only partly realised. This is the largest gap between the experiment and a production feature.

---

## 7. Open questions

- **Is a partly-translated explorer better than an English one?** The Test Request modal stays English (§2). Reasonable people will disagree about whether the mixed result is an improvement. This deserves a look at the built experiment rather than an argument in advance.
- **Hebrew and Persian have no catalogue.** They are the two locales this work most needs to prove — Scalar covers neither, and both are right-to-left — and they are the two with nothing to copy from. They currently render Scalar's English. Whether to hand-author fixtures (fast, unreviewed, and the precedent set by the prose experiment) or to wait for real translation work is an open call.
- **Should a locale Scalar covers and we do not ever be left to Scalar?** No — see §3, "banana always wins". Resolved by owning every locale Scalar translates. Worth re-asking whenever Scalar adds a locale: the answer is to seed it, not to let it through.
- **Should the explorer ever go right-to-left?** Pinning LTR is correct given Scalar's stylesheet, but it means Hebrew and Persian labels sit in a left-to-right layout. Changing that needs upstream work; an issue with Scalar would be the first step.
- **Whose vocabulary wins?** The portal and Scalar may translate the same concept differently in the same language. Owning the strings lets us be consistent with Wikimedia terminology — but only if someone reviews for that, which is translation work, not engineering work.
- **Nothing here has been run in the app.** `nuxt prepare`, `nuxt build` and `nuxt dev` all fail with `EACCES` on `~/.nuxtrc` in the current sandbox, so the work was verified offline instead: the generator and its drift check, the seeding script and its overwrite guard, a standalone typecheck of the new modules, and the assembled translation table fed through Scalar's own `resolveLocalization` for five locales. What that does **not** cover is the app building, the interface actually re-rendering on a language change, and the question below. Treat those as outstanding.
- **Does a language change ever disturb the loaded API document?** Scalar watches its configuration for changes and can refetch. Reading the code, a locale-only change should not trigger that, because the refetch path keys off the document URL. This has not been observed running and must be confirmed against a dev server before the work is called done.
- **The generator reaches into Scalar's package internals.** Scalar publishes no export path for its locale tables, so the generator resolves the file by path from the package entry. It fails loudly with an explanatory message if an upgrade moves it, which is the best available answer, but it is a maintenance cost the drift check cannot remove.
- **How much of this is worth it for Spanish and French,** where Scalar already had a translation and we are choosing to own it instead? The clearest value is Hebrew and Persian, where nothing existed.

---

## Rejected alternatives

**Use Scalar's built-in translations directly.** Setting the locale and shipping no strings of our own would translate seven locales for one line of configuration. Rejected as a policy: it splits ownership of interface language across two systems, bypasses BiDi isolation and Wikimedia terminology for every string it supplies, and still leaves Hebrew and Persian — the locales that actually need help — untranslated. Scalar's translations are used, but as *seed content* we then own (§4.2), never as a live runtime source.

**Seed only the locales the portal already had interface messages for.** The narrower version of the above, and the more tempting one: seed `es` and `fr`, leave Scalar to serve `ar`, `de`, `pt`, `ru` and `zh-CN` since it translates them anyway. Rejected for the reason in §3 — those strings would reach visitors without ever passing through banana, and Arabic would reach them without isolation. Free coverage from a layer we do not control is not the same as coverage.

**A pre-build script that bakes the translation table into a build artifact.** Rejected because it buys nothing. The transformation is cheap, everything it needs exists at runtime, and freezing it into a build output would discard the live language switching that comes for free.

**A Scalar plugin.** Scalar's plugin API injects Vue components at defined slots; it has no access to built-in string rendering. It is the wrong tool, not a harder one.

**Hand-maintaining the key map.** Rejected once the generated mapping was verified collision-free across all 188 upstream strings. A hand-written table would be a hundred lines of transcription that drifts silently on every upgrade — the exact failure the generated map is there to catch.

**Merging Scalar's strings into the main `i18n/` files.** Rejected on bundle weight and on boundary integrity, for the same two reasons recorded in the translatable-prose ADR (§5).
