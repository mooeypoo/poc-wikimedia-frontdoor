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
Each section below exercises a specific feature from the requirements list.

---

## Header Anchors

Each heading on this page has a unique anchor ID generated automatically (e.g. `#header-anchors`).
Clicking a heading should reveal a shareable link icon. That icon is not yet rendered — it
requires overriding the `ProseH2.vue` / `ProseH3.vue` components in `app/components/content/`.

### Sub-section Example

This H3 also gets an anchor. Deep-linking to `#sub-section-example` should work.

---

## External Link Icons

Links pointing outside the site should display a small icon indicating they are external.
This is **not yet implemented** — it requires a custom `ProseA.vue` component.

- [Wikimedia REST API documentation](https://api.wikimedia.org/wiki/Documentation) — external link
- [MDN: Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) — external link
- [Learn](/learn) — internal link (no icon expected)
- [API Explorer](/explorer) — internal link (no icon expected)

---

## Callouts

Callouts are **not yet implemented**. The MDC syntax below will render raw until
`app/components/content/Callout.vue` is created. Expected behaviour shown as comments.

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

Code tabs are **not yet implemented**. The MDC syntax below requires
`app/components/content/CodeTabs.vue` and `app/components/content/CodeTab.vue`.
All tab contents remain in the DOM for Ctrl+F findability.

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

The following block should be replaced by the contents of `_partials/api-note.md`.
This is **not yet verified** — needs testing against the MDC `::include` directive.

::include{file="./_partials/api-note.md"}

---

## Expandable Sections

Native HTML `<details>` / `<summary>` works today in markdown without any configuration.

<details>
<summary>Advanced: Configuring a custom User-Agent header</summary>

The Wikimedia API requires a descriptive `User-Agent` header for all requests.
Format: `AppName/version (contact@example.org)`.

Recommended values to include:
- Application name and version
- A contact email or URL for the maintainer
- The hosting platform if relevant (e.g. `Toolforge`, `PAWS`)

Example: `MyResearchTool/1.0 (research@university.edu)`

</details>

<details>
<summary>Advanced: Handling redirects and page moves</summary>

Wikipedia articles are often redirected when pages are moved or merged.
The REST API returns a `301` or `308` for redirect titles. Follow the
`Location` header or use the `redirect=true` query parameter to resolve
redirects automatically.

</details>

---

## Buttons

Buttons are **not yet implemented** as an MDC component. The MDC syntax below requires
`app/components/content/AppButton.vue`. As a fallback, raw HTML links work today.

::app-button{href="/explorer" label="Open API Explorer"}

::app-button{href="https://api.wikimedia.org" label="Wikimedia API" external="true"}

**Fallback (raw HTML, works today):**

<a href="/explorer">Open API Explorer</a>

---

## Syntax Highlighting

Standard syntax highlighting works today via Shiki.

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
        params = {}  # continuation URLs already include params
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
  "content_model": "wikitext",
  "license": {
    "url": "https://creativecommons.org/licenses/by-sa/4.0/",
    "title": "Creative Commons Attribution-Share Alike 4.0"
  }
}
```

---

## Code with Line Numbers

Line numbers require a Shiki transformer configuration in `nuxt.config.ts`.
**Not yet configured** — the `:line-numbers` meta flag will be ignored until added.

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

Line highlighting requires `transformerMetaHighlight` from `@shikijs/transformers` in `nuxt.config.ts`.
**Not yet configured** — `{3-5}` in the meta will be ignored until added.

```javascript {3-5}
async function authenticate( clientId, clientSecret ) {
	const tokenEndpoint = 'https://meta.wikimedia.org/w/rest.php/oauth2/access_token';
	// Lines 3-5 are highlighted: these are the credentials being exchanged
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

Diff annotations require `transformerNotationDiff` from `@shikijs/transformers` in `nuxt.config.ts`.
**Not yet configured** — `[!code ++]` / `[!code --]` markers will render as text until added.

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

The frontmatter at the top of this file includes `prev` and `next` fields. Those are
**not yet rendered** — `[...slug].vue` needs to read `page.prev` / `page.next` and display
navigation links. Expected output: a "← Home" link and an "API Explorer →" link at the
bottom of this page.
