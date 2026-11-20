# Quick start

Get started with Wikimedia APIs by fetching an article from Wikipedia.

## 1. Choose a project

Wikimedia APIs are organized by project (such as English Wikipedia) and API (such as the Content API). This guide uses English Wikipedia, but you can also use one of over 300 other Wikipedias written in their own language. You can explore available projects and APIs using the API explorer. [Try the explorer.]()

API calls to English Wikipedia use the wiki's URL as the base URL: `https://en.wikipedia.org`. Other URL components can vary depending on the API.

## 2. Identify your requests

Wikimedia APIs are free to use without an account, but we ask that you include contact information in your requests using an HTTP User-Agent header. This information ensures that administrators can contact you if there's a problem. [Learn more about identifying requests.](/apis/overview)

Before you start, set up a User-Agent header with your contact information, such as a link to a user page on a Wikimedia wiki, a URL for a relevant external website, or an email address.

:::code-block{label="User-Agent header example"}
```http
User-Agent: Developer Portal sample code (https://www.mediawiki.org/wiki/Talk:Developer_Portal)
```
:::

## 3. Search for articles on Wikipedia

Most Wikimedia APIs fetch content based on page titles. To find a Wikipedia article title, use a search endpoint to search by article title or article content. This guide uses the search content endpoint to find the article about the planet Mercury. [Try it out.]()

::::code-tabs
:::code-tab{label="curl"}
```bash
curl -H 'User-Agent: Developer Portal sample code (https://www.mediawiki.org/wiki/Talk:Developer_Portal)' 'https://en.wikipedia.org/w/rest.php/v1/search/page?q=planet%20mercury&limit=1'
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

Now that you have the article title, fetch the content of the article in HTML using a page endpoint. This guide uses the get page with HTML endpoint from the Content API. [Try it out.]()

To format the title to use in the request, URL-encode the `key` from the search response. For example, use `Mercury_%28planet%29` for `Mercury (planet)`.

::::code-tabs
:::code-tab{label="curl"}
```bash
curl -H 'User-Agent: Developer Portal sample code (https://www.mediawiki.org/wiki/Talk:Developer_Portal)' 'https://en.wikipedia.org/w/rest.php/v1/page/Mercury_%28planet%29/with_html'
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

Wikimedia content is free to use in your projects and apps as long as you follow the licensing requirements. To use unmodified text from English Wikipedia, you must credit Wikipedia by including the name of the project, the name of the article, a link to the article, and a link to the license. [Learn more about reusing free content.](/apis/reuse)


The Attribution API provides all the information you need to credit Wikipedia through a single endpoint, including visual and sound logos. [Try it out.]()

::::code-tabs
:::code-tab{label="curl"}
```bash
curl -H 'User-Agent: Developer Portal sample code (https://www.mediawiki.org/wiki/Talk:Developer_Portal)' 'https://en.wikipedia.org/w/rest.php/attribution/v0-beta/pages/Mercury%20%28planet%29/signals'
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

:::code-block{label="Response" collapse-after-line="7"}
```json
{
  "essential": {
    "link": "https://en.wikipedia.org/w/index.php?title=Mercury_(planet)&wprov=afsw1",
    "default_brand_marks": [
      {
        "name": "Default logo",
        "url": "https://en.wikipedia.org/static/images/project-logos/enwiki-25.png",
        "type": "logo"
      },
      {
        "name": "Site icon",
        "url": "https://en.wikipedia.org/static/images/icons/enwiki-25.svg",
        "type": "icon"
      },
      {
        "name": "Sound logo",
        "url": "https://upload.wikimedia.org/wikipedia/commons/9/91/Wikimedia_Sonic_Logo_-_4-seconds.wav",
        "type": "audio"
      }
    ],
    "source_wiki": {
      "site_name": "English Wikipedia",
      "project_family": "wikipedia",
      "site_id": "enwiki",
      "site_language": "en",
      "page_language": "en"
    },
    "title": "Mercury (planet)",
    "license": {
      "title": "Creative Commons Attribution-Share Alike 4.0",
      "short": "CC BY-SA 4.0",
      "url": "https://creativecommons.org/licenses/by-sa/4.0/deed.en"
    }
  }
}
```
:::

## Next steps

### [Review API policies](/apis/policies)

Wikimedia's content and infrastructure policies are an important part of how free knowledge works. By being aware of the terms and conditions, you help support making Wikimedia APIs free to use.

### [Set up authentication](/apis/auth)

Integrate your app with Wikimedia accounts to make write requests and access user features.

### [Learn with tutorials](/get-started/tutorials)

Follow step-by-step guides to learn the basics of building with Wikimedia.

### [Connect with the community](/community)

Get involved with the Wikimedia technical community, and find opportunities for support and learning.
