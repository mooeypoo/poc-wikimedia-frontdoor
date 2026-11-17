# Quick start

Get started with Wikimedia APIs by fetching an article from Wikipedia.

## 1. Choose a project

Wikimedia APIs are organized by project (such as English Wikipedia) and API (such as the Content API). This guide uses English Wikipedia, but you can also use one of over 300 other Wikipedias written in their own language. You can explore available projects and APIs using the API explorer. [Try the explorer]()

API calls to English Wikipedia use the wiki's URL as the base URL: `https://en.wikipedia.org`. The following URL components can vary depending on the API.

## 2. Identify your requests

Wikimedia APIs are free to use without an account, but we ask that you include contact information in your requests using an HTTP User-Agent header. This information ensures that administrators can contact you if there's a problem. [Learn more about identifying requests.](/apis/requests)

Before you start using Wikimedia APIs, set up your User-Agent header with your contact information, such as a link to a user page on a Wikimedia wiki, a URL for a relevant external website, or an email address.

:::code-block{label="User-Agent header example"}
```http
User-Agent: Developer Portal sample code (https://www.mediawiki.org/wiki/Talk:Developer_Portal)
```
:::

## 3. Search for articles

Most Wikimedia APIs fetch content based on page titles. To find a Wikipedia article title, use a search endpoint to search by article title or article content. This guide uses the search content endpoint to find the article about the planet Mercury. [Try it out]()

::::code-tabs
:::code-tab{label="curl"}
```bash
curl -H "User-Agent: Developer Portal sample code (https://www.mediawiki.org/wiki/Talk:Developer_Portal)" 'https://en.wikipedia.org/w/rest.php/v1/search/page?q=planet%20mercury&limit=1'
```
:::

:::code-tab{label="JavaScript"}
```javascript
...
```
:::

:::code-tab{label="Python"}
```python
...
```
:::

:::code-tab{label="PHP"}
```php
...
```
:::
::::

The result includes information about the article, including the title, excerpt, short description, and thumbnail image.

:::code-block{label="Response" collapse-after-line="7"}
```json
{
  "pages": [
    {
      "id": 19694,
      "key": "Mercury_(planet)",
      "title": "Mercury (planet)",
      "excerpt": "<span class=\"searchmatch\">Mercury</span> is the first <span class=\"searchmatch\">planet</span> from the Sun and the smallest in the Solar System. It is a rocky <span class=\"searchmatch\">planet</span> with a trace atmosphere and a surface gravity slightly",
      "matched_title": null,
      "anchor": null,
      "description": "First planet from the Sun",
      "thumbnail": {
        "mimetype": "image/jpeg",
        "width": 60,
        "height": 60,
        "duration": null,
        "url": "//thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/60px-Mercury_in_true_color.jpg?utm_source=en.wikipedia.org&utm_campaign=rest&utm_content=thumbnail"
      }
    }
  ]
}
```
:::

## 4. Fetch an article from Wikipedia

Now that you have the article title, fetch the content of the article in HTML using a page endpoint. This guide uses the get page source endpoint from the Content API. [Try it out]()

To format the title to use in the request, URL-encode use the `key` from the search response. For example, use `Steller%27s_jay` for `Steller's jay`.

::::code-tabs
:::code-tab{label="curl"}
```bash
curl -H "User-Agent: Developer Portal sample code (https://www.mediawiki.org/wiki/Talk:Developer_Portal)" 'https://en.wikipedia.org/w/rest.php/v1/page/Mercury_%28planet%29/bare'
```
:::

:::code-tab{label="JavaScript"}
```javascript
...
```
:::

:::code-tab{label="Python"}
```python
...
```
:::

:::code-tab{label="PHP"}
```php
...
```
:::
::::


## 5. Add attribution
To reuse this article, indicate its source and include other information that attributes it to  Wikipedia. The Attribution API makes it easy to get all attribution information in one place. [Learn more about how to attribute Wikimedia content.](https://wikimedia-attribution.toolforge.org/)

| Project: English Wikipedia | API: Attribution API v1 |
| --- | ---|

| Endpoint: Get page | `en.wikipedia.org/api/pages/{title}/signals` |
| --- | --- |

| [Try it out](/explorer) |
| --- |


::::code-tabs
:::code-tab{label="curl"}
```curl
...
```
:::

:::code-tab{label="JavaScript"}
```javascript
...
```
:::

:::code-tab{label="Python"}
```python
...
```
:::

:::code-tab{label="PHP"}
```php
...
```
:::
::::

:::code-block{label="Response"}
```json
...
```
:::

Using information from these two requests, you can generate a preview of the Solar System article that you can incorporate into your app.

## Review API policies

Before you go, we ask that you take a minute to look over the [API policies](/apis/policies). Wikimedia's content and infrastructure policies are an important part of how free knowledge works. By being aware of the terms and conditions, you help support making Wikimedia APIs free to use.

## Try the sandbox

Visit the [API explorer](/explorer) to try different parameters and explore other available languages and projects.

## Next steps

- [Explore featured apps](/get-started/featured-apps)
- [Learn with tutorials](/get-started/tutorials)
- [Connect with the community](/community)
