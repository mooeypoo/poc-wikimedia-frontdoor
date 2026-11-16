# Quick start

Get started fetching and reusing Wikimedia content.

## Fetch an article from Wikipedia
For your first request, fetch the Solar System article from English Wikipedia. 

| Project: English Wikipedia | API: Content API v2 |
| --- | ---|

| Endpoint: Get page | `en.wikipedia.org/api/page/{title}` |
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

When using Wikimedia APIs, include a user agent to identify your request. This identifying information gives you a higher rate limit and helps us contact you in case of any issues. [Learn more about rate limits.]()


## Add attribution
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
