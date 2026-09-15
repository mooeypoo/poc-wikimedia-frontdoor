---
status: vnext mockup
---
# Use wiki content

Access articles from Wikipedia, media files, structured data, and more with public APIs and downloads.

## Fetch pages and media files

Wikimedia APIs allow you to fetch content by page. [Explore all Wikimedia APIs in the API catalog.](/apis)

:::navigation-card-grid
::navigation-card{url="/explorer/direct/enwiki/-#GET/v1/search/page" title="Search API" description="Search for pages by title or using full-text search."}
::

::navigation-card{url="/explorer/direct/enwiki/-#GET/v1/page/{title}/bare" title="Page API" description="Fetch wiki pages in HTML or source format, explore page history, and get citations."}
::

::navigation-card{url="/explorer/direct/enwiki/-#GET/v1/file/{title}" title="Media API" description="Get information about photos, video, and other media files used on Wikimedia projects."}
::

::navigation-card{url="/explorer/direct/enwiki/attribution/v0-beta" title="Attribution API" description="Get the data you need to provide attribution when reusing Wikimedia content."}
::
:::

## Download content in bulk

Wikimedia content is also available to download in bulk, giving you access to all pages from a given project.

:::navigation-card-grid
::navigation-card{url="https://enterprise.wikimedia.com/docs/snapshot/" title="Download content in HTML" description="Bulk downloads of pages as they appear to users are available though Wikimedia Enterprise using a free account or a Wikimedia developer account."}
::

::navigation-card{url="https://dumps.wikimedia.org/other/mediawiki_content_history/readme.html" title="Download content in source format" description="Get bulk downloads of content in their editable format, wikitext."}
::
:::

## Commercial and high-volume access

Wikimedia Enterprise offers APIs to download bulk snapshots of Wikimedia content at scale. Try the free tier for Wikimedia communities. [Learn more about Wikimedia Enterprise.](https://meta.wikimedia.org/wiki/Special:MyLanguage/Data_dumps)
