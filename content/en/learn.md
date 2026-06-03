---
title: Learn
description: Step-by-step tutorials and reference guides for working with the Wikimedia REST API.
prev:
  text: 'Home'
  link: '/'
next:
  text: 'API Explorer'
  link: '/explorer'
---

# Learn

This page is a **feature demonstration** for all required markdown rendering capabilities.
Each section exercises one feature. Inline notes explain the implementation status.

## Implementation summary

Everything below relies only on packages already installed in this project.
No new dependencies are required.

| Feature | Type | Implementation |
|---|---|---|
| Header anchors | Custom component | `ProseH2.vue`…`ProseH6.vue` override default prose headings; plain text + hover `CdxIcon` link |
| External link icons | Custom component | `ProseA.vue` overrides default prose anchor; appends `CdxIcon` for `https?://` links |
| Callouts | Custom component | `Callout.vue` wraps `CdxMessage`; `type` prop + optional `#title` named slot |
| Code tabs | Custom components | `CodeTabs.vue` + `CodeTab.vue`; custom tab UI styled with Codex tokens |
| File inclusion | Custom component | `Include.vue` resolves relative paths against current locale + route, queries content collection |
| Expandable sections | Built-in | Native `<details>` / `<summary>`; no configuration needed |
| Buttons | Custom component | `AppButton.vue`; `NuxtLink` (internal) or `<a>` (external) styled as a Codex progressive button |
| Syntax highlighting | Built-in | Shiki bundled with `@nuxt/content`; language tag on fence is enough |
| Line numbers | Configured | Custom inline Shiki transformer in `nuxt.config.ts`; CSS counters in `main.css` |
| Line highlighting | Configured | `transformerMetaHighlight()` from `@shikijs/transformers` (transitive dep), added to config |
| Code diffs | Configured | `transformerNotationDiff()` from `@shikijs/transformers` (transitive dep), added to config |
| Prev / next navigation | Custom code | `[...slug].vue` reads `prev`/`next` from frontmatter; renders `NuxtLink` with `CdxIcon` arrows |

---

## Header Anchors

**Custom component** — `ProseH2.vue`…`ProseH6.vue` override the default `@nuxtjs/mdc` prose headings,
which wrap the entire heading text in an `<a>`. The custom components render plain text with a
`CdxIcon` (`cdxIconLink`) sibling that appears on hover and links to `#the-heading-id`.

### Sub-section Example

Hover this heading to see the anchor icon appear.

---

## External Link Icons

**Custom component** — `ProseA.vue` overrides the default prose anchor. Links whose `href` starts
with `https?://` get a `CdxIcon` (`cdxIconLinkExternal`) appended after the link text. Internal
links are left unchanged.

- [Wikimedia REST API documentation](https://api.wikimedia.org/wiki/Documentation) — external
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) — external
- [Learn](/learn) — internal (no icon expected)
- [API Explorer](/explorer) — internal (no icon expected)

---

## Callouts

**Custom component** — `Callout.vue` wraps `CdxMessage`. Accepts a `type` prop (`notice`, `warning`,
`error`, `success`) and an optional `#title` named slot rendered as a bold label above the body.

::callout
#title
Note: Rate limits apply

#default
The Wikimedia REST API applies rate limits per IP address. Unauthenticated requests are
limited to 500 requests per hour. Use OAuth 2.0 to raise your quota to 5,000 requests per hour.
::

::callout{type="warning"}
#title
Warning: Breaking change in v2

#default
The `summary` endpoint was removed in API v2. Migrate to `/page/{title}/bare` before
upgrading. Responses from the old endpoint will return `410 Gone` after the deprecation date.
::

---

## Code Tabs

**Custom components** — `CodeTabs.vue` + `CodeTab.vue` implement a tab UI styled with Codex tokens.
All tab panels remain in the DOM (`v-show`), so Ctrl+F searches all tabs regardless of which is active.

::::code-tabs
:::code-tab{label="JavaScript"}
```js :line-numbers
async function fetchArticle( title ) {
	const response = await fetch(
		`https://api.wikimedia.org/core/v1/wikipedia/en/page/${ title }/bare`
	);
	if ( !response.ok ) {
		throw new Error( `HTTP ${ response.status }` );
	}
	return response.json();
}
```
:::

:::code-tab{label="Python"}
```python :line-numbers
import requests

def fetch_article(title: str) -> dict:
    url = f"https://api.wikimedia.org/core/v1/wikipedia/en/page/{title}/bare"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()
```
:::

:::code-tab{label="PHP"}
```php :line-numbers
<?php
function fetchArticle(string $title): array {
    $url = "https://api.wikimedia.org/core/v1/wikipedia/en/page/{$title}/bare";
    $response = file_get_contents($url);
    return json_decode($response, associative: true);
}
```
:::
::::

---

## File Inclusion

**Custom component** — `Include.vue` resolves a relative `./path` against the current page's locale
and route, queries the content collection, and renders the result with `ContentRenderer`. The partial
below lives in `content/en/_partials/api-note.md`.

::include{file="./_partials/api-note.md"}
::

---

## Expandable Sections

**Built-in** — native HTML `<details>` / `<summary>` work out of the box; no configuration needed.

<details>
<summary>Advanced: Configuring a custom User-Agent header</summary>

The Wikimedia API requires a descriptive `User-Agent` header on all requests.
Format: `AppName/version (contact@example.org)`.

Recommended values to include:
- Application name and version
- A contact email or URL for the maintainer
- The hosting platform if relevant (e.g. `Toolforge`, `PAWS`)

</details>

<details>
<summary>Advanced: Handling redirects and page moves</summary>

Wikipedia articles redirect when pages are moved or merged. The REST API returns
`301` or `308` for redirect titles. Follow the `Location` header or append
`?redirect=true` to resolve redirects automatically.

</details>

---

## Buttons

**Custom component** — `AppButton.vue` renders a `NuxtLink` for internal paths or an `<a>` for
external ones, styled with Codex tokens to match a progressive primary button. External links
show a `CdxIcon` (`cdxIconLinkExternal`) and get `rel="noopener noreferrer"`.

::app-button{href="/explorer" label="Open API Explorer"}
::

::app-button{href="https://www.mediawiki.org" label="Wikimedia Docs" external="true"}
::

---

## Syntax Highlighting

**Built-in** — Shiki is bundled with `@nuxt/content`; fenced code blocks with a language tag are
highlighted automatically with no extra configuration.

```javascript
async function paginatedFetch( endpoint, params = {} ) {
	const url = new URL( endpoint );
	Object.entries( params ).forEach( ( [ key, value ] ) => {
		url.searchParams.set( key, String( value ) );
	} );

	let results = [];
	let nextUrl = url.toString();

	while ( nextUrl ) {
		const response = await fetch( nextUrl );
		const data = await response.json();
		results = results.concat( data.items ?? [] );
		nextUrl = data.next ?? null;
	}

	return results;
}
```

```python
from typing import Iterator
import requests

def paginated_fetch(endpoint: str, **params) -> Iterator[dict]:
    """Yield pages of results from a paginated Wikimedia API endpoint."""
    url = endpoint
    while url:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        yield from data.get("items", [])
        url = data.get("next")
        params = {}
```

```bash
curl -s \
  -H "Authorization: Bearer $TOKEN" \
  -H "User-Agent: MyApp/1.0 (me@example.org)" \
  "https://api.wikimedia.org/core/v1/wikipedia/en/page/Earth/bare"
```

```json
{
  "id": 9228,
  "key": "Earth",
  "title": "Earth",
  "latest": {
    "id": 1234567890,
    "timestamp": "2024-01-15T12:34:56Z"
  },
  "content_model": "wikitext"
}
```

---

## Code with Line Numbers

**Configured** — a custom inline Shiki transformer in `nuxt.config.ts` adds `data-line-numbers` to
`<pre>` when `:line-numbers` appears in the code fence meta. CSS counters in `main.css` render the
numbers. (`@shikijs/transformers` has no built-in equivalent for this.)

```javascript :line-numbers
function buildAuthHeaders( token ) {
	if ( !token ) {
		throw new Error( 'OAuth token is required' );
	}
	return {
		Authorization: `Bearer ${ token }`,
		'User-Agent': 'MyApp/1.0 (me@example.org)',
		Accept: 'application/json'
	};
}
```

---

## Line Highlighting

**Configured** — `transformerMetaHighlight()` from `@shikijs/transformers` (already a transitive dep)
added to `nuxt.config.ts`. Lines 3–5 below are highlighted with `{3-5}` in the fence meta.

```javascript {3-5}
async function authenticate( clientId, clientSecret ) {
	const tokenEndpoint = 'https://meta.wikimedia.org/w/rest.php/oauth2/access_token';
	const body = new URLSearchParams( {
		grant_type: 'client_credentials',
		client_id: clientId,
		client_secret: clientSecret
	} );
	const response = await fetch( tokenEndpoint, { method: 'POST', body } );
	return response.json();
}
```

---

## Code Diffs

**Configured** — `transformerNotationDiff()` from `@shikijs/transformers` added to `nuxt.config.ts`.
Lines annotated with `// [!code --]` render red; `// [!code ++]` render green.

```javascript
async function fetchWithRetry( url, retries = 3 ) {
	const response = await fetch( url ); // [!code --]
	const response = await fetch( url, { // [!code ++]
		headers: { // [!code ++]
			Accept: 'application/json', // [!code ++]
			'User-Agent': 'MyApp/1.0 (me@example.org)' // [!code ++]
		} // [!code ++]
	} ); // [!code ++]

	if ( response.status === 429 ) {
		const retryAfter = Number( response.headers.get( 'Retry-After' ) ?? 1 );
		await new Promise( ( resolve ) => setTimeout( resolve, retryAfter * 1000 ) );
		return fetchWithRetry( url, retries - 1 ); // [!code --]
		return retries > 0 ? fetchWithRetry( url, retries - 1 ) : null; // [!code ++]
	}

	return response.json();
}
```

---

## Next / Previous Navigation

**Custom code** — `[...slug].vue` reads `prev` and `next` from the page frontmatter and renders
`NuxtLink` elements with `CdxIcon` arrows (`cdxIconArrowPrevious` / `cdxIconArrowNext`, both
`flip-for-rtl`) below the content. The links at the bottom of this page use the frontmatter declared
at the top of this file.
