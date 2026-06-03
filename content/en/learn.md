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

**`nuxt.config.ts` — add Shiki transformers** (`@shikijs/transformers` is already a transitive dep of `@nuxt/content`):

| Feature | Transformer |
|---|---|
| Line numbers | `transformerMetaLineNumbers()` |
| Line highlighting | `transformerMetaHighlight()` |
| Diffs | `transformerNotationDiff()` |

**`app/components/content/` — new Vue components** (all use Codex, already installed):

| File | Codex widget(s) | Markdown usage |
|---|---|---|
| `ProseH2.vue` … `ProseH6.vue` | `CdxIcon` + `cdxIconLink` | Overrides default heading rendering; plain text + hover icon instead of full-text `<a>` wrap |
| `ProseA.vue` | `CdxIcon` + `cdxIconLinkExternal` | Overrides all `<a>` in prose; adds icon when href is external |
| `Callout.vue` | `CdxMessage` (`type` prop: `notice` / `warning` / `error`) | `::callout{type="warning"}` MDC block |
| `CodeTabs.vue` + `CodeTab.vue` | `CdxTabs` + `CdxTab` | `::::code-tabs` / `:::code-tab{label="…"}` MDC block |
| `AppButton.vue` | `CdxButton` | `::app-button{href="…" label="…"}` MDC inline |

**`app/pages/[...slug].vue` — read frontmatter** (no new packages):

| Feature | Change |
|---|---|
| Next / Previous | Read `page.prev` / `page.next` from frontmatter; render `CdxButton` links with `cdxIconArrowPrevious` / `cdxIconArrowNext` |

**Needs testing:**

| Feature | Status |
|---|---|
| File inclusion | MDC ships a built-in `::include` component via `@nuxtjs/mdc`; the demo below uses it — verify it resolves correctly |

---

## Header Anchors

Each heading should show plain text with a small `CdxIcon` (`cdxIconLink`) that appears on hover
and links to `#the-heading-id` for shareable deep-links — **not yet implemented**.

The default `@nuxtjs/mdc` rendering wraps the **entire heading text** inside an `<a>` tag.
The fix is `app/components/content/ProseH2.vue` … `ProseH6.vue`: each renders the heading text
as a plain `<slot>` with the icon as a sibling, toggled via CSS `:hover`.

### Sub-section Example

This H3 should get the same treatment. The anchor ID (`#sub-section-example`) already exists;
only the hover-icon rendering is missing.

---

## External Link Icons

Internal and external links mixed together. External ones should gain a `CdxIcon` rendered
by a `ProseA.vue` override — **not yet implemented**.

- [Wikimedia REST API documentation](https://api.wikimedia.org/wiki/Documentation) — external
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) — external
- [Learn](/learn) — internal (no icon expected)
- [API Explorer](/explorer) — internal (no icon expected)

---

## Callouts

Uses `CdxMessage` once `app/components/content/Callout.vue` is created — **not yet implemented**.

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

Uses `CdxTabs` + `CdxTab` once `CodeTabs.vue` and `CodeTab.vue` are created — **not yet implemented**.
All tab contents remain in the DOM so Ctrl+F finds them regardless of which tab is active.

::::code-tabs
:::code-tab{label="JavaScript"}
```js
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
```python
import requests

def fetch_article(title: str) -> dict:
    url = f"https://api.wikimedia.org/core/v1/wikipedia/en/page/{title}/bare"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()
```
:::

:::code-tab{label="PHP"}
```php
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

The block below uses the MDC `::include` directive — **needs verification** that
`@nuxtjs/mdc`'s built-in `Include` component resolves the path correctly.

::include{file="./_partials/api-note.md"}

---

## Expandable Sections

Native HTML `<details>` / `<summary>` — **works today** without any configuration.

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

Uses `CdxButton` once `app/components/content/AppButton.vue` is created — **not yet implemented**.

::app-button{href="/explorer" label="Open API Explorer"}

::app-button{href="https://api.wikimedia.org" label="Wikimedia API" external="true"}

---

## Syntax Highlighting

Shiki is bundled with `@nuxt/content` — **works today**.

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

Requires `transformerMetaLineNumbers()` in `nuxt.config.ts` — **not yet configured**.

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

Requires `transformerMetaHighlight()` in `nuxt.config.ts` — **not yet configured**.
Lines 3–5 below should be highlighted.

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

Requires `transformerNotationDiff()` in `nuxt.config.ts` — **not yet configured**.
Lines marked `[!code --]` should appear red; `[!code ++]` should appear green.

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

The frontmatter at the top of this file declares `prev` and `next` links.
Rendering them requires reading `page.prev` / `page.next` in `[...slug].vue`
and displaying `CdxButton` links with `cdxIconArrowPrevious` / `cdxIconArrowNext` —
**not yet implemented**.
