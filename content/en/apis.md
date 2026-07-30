---
status: 0 draft
---

# APIs

::highlight
Wikimedia’s APIs provide access to projects’ content and data. To learn more, [**go to the Quick start →**](/get-started/quick-start)
::

## Wikimedia APIs

Discover our curated selection of production-ready APIs, designed to help you build, integrate, and scale with Wikimedia's open knowledge ecosystem.

:::navigation-card-grid
::navigation-card{url="/explorer" title="MediaWiki REST API" description="Provides access to wiki content and functionality, supporting operations like searching, getting and transforming wiki pages, and accessing page history."}
::

::navigation-card{url="/explorer" title="Attribution API" description="Returns attribution signals for wiki pages to ensure fair reuse of Wikimedia content."}
::

::navigation-card{url="/explorer" title="Lift Wing API" description="A machine-learning model-serving platform that returns predictions about Wikimedia pages and edits, such as article or edit-quality score."}
::

::navigation-card{url="/explorer" title="GrowthExperiments API" description="Experimental editing suggestions and editor feedback regarding such suggestions"}
::

::navigation-card{url="/explorer" title="ReadingLists API" description="Store and retrieve private lists of pages, such as bookmarks or read-it-later feature."}
::

::navigation-card{url="/explorer" title="CampaignEvents API" description="REST API for the CampaignEvents extension. Create and manage campaign events, invite and track participants, and associate wiki contributions with events."}
::

::navigation-card{url="/explorer" title="Commons analytics API" description="Provides data about the usage of categories and media files on Wikimedia Commons. This data is focused on categories associated with contributions from galleries, libraries, archives, and museums (GLAM)."}
::

::navigation-card{url="/explorer" title="Devices analytics API" description="Provides data about the number of unique devices that access Wikimedia projects. This endpoint only returns data for projects that have at least 1,000 unique devices for the requested time period."}
::

::navigation-card{url="/explorer" title="Edit analytics API" description="Edit analytics provides data about the number of edits and edited pages on Wikimedia projects."}
::

::navigation-card{url="/explorer" title="Editors analytics API" description="Editor analytics provides data about the number of editors and newly registered users of Wikimedia projects. Data returned by these endpoints includes edits on redirects."}
::

::navigation-card{url="/explorer" title="Media files analytics API" description="Media file analytics provides data about requests for media files on Wikimedia projects."}
::

::navigation-card{url="/explorer" title="Page views analytics API" description="Page view analytics provides data about page views for Wikimedia projects."}
::

::navigation-card{url="https://www.mediawiki.org/wiki/Wikifunctions_API" title="Wikifunctions API" description="Search, fetch, and call functions hosted on Wikifunctions (Abstract Wikipedia). Create, edit, and orchestrate function objects." supporting-text="Read more on mediawiki.org"}
::

::navigation-card{url="https://www.wikidata.org/wiki/Wikidata:Wikibase_GraphQL" title="Wikibase GraphQL API" description="A GraphQL API for Wikidata optimised for developer experience. Handles common read use cases in a single request, reducing load vs SPARQL. Beta, actively developed." supporting-text="Read more on Wikidata"}
::

::navigation-card{url="https://doc.wikimedia.org/Wikibase/master/js/rest-api/" title="Wikibase REST API" description="A modern, OpenAPI-documented REST interface for reading and writing Wikidata entities, statements, labels, aliases, and sitelinks." supporting-text="Read the docs"}
::
:::

## Wikimedia Enterprise APIs

Wikimedia Enterprise offers reliable, high-volume access to Wikimedia data through structured APIs and data feeds, enabling organizations to seamlessly integrate trusted, up-to-date knowledge from Wikipedia and other Wikimedia projects into their products and services at scale. To learn more, [**visit the Wikimedia Enterprise portal**](https://enterprise.wikimedia.com)

:::navigation-card-grid
::navigation-card{url="https://enterprise.wikimedia.com/docs/snapshot/" title="Snapshot API" description="The Enterprise Snapshot API allows users to retrieve entire Wikimedia projects as a database dump file." supporting-text="Read the docs"}
::

::navigation-card{url="https://enterprise.wikimedia.com/docs/on-demand/" title="On-demand API" description="The Wikimedia Enterprise On-demand API allows users to retrieve single articles from any supported Wikimedia project at anytime." supporting-text="Read the docs"}
::

::navigation-card{url="https://enterprise.wikimedia.com/api/structured-contents/" title="Structured contents" description="Extracts infoboxes, sections, tables, references, and more from raw wikitext and HTML and delivers them as structured, machine-readable JSON." supporting-text="Read the docs"}
::
:::

## Classic APIs

Still supported and powerful, but not recommended for most new integrations.

:::navigation-card-grid
::navigation-card{url="https://www.mediawiki.org/wiki/Special:MyLanguage/API:Main_page" title="MediaWiki Action API" description="The original and most comprehensive Wikimedia API. 100+ action modules covering page reads, edits, user management, file uploads, search, patrol and more." supporting-text="Read more on mediawiki.org"}
::

::navigation-card{url="https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:Data_access" title="Wikibase Action API" description="Extension to the MediaWiki Action API adding Wikidata-specific operations: wbgetentities, wbsetclaim, wbsearchentities, etc." supporting-text="Read more on Wikidata"}
::

::navigation-card{url="https://query.wikidata.org/" title="SPARQL/Wikidata Query Service" description="A SPARQL 1.1 endpoint over the full Wikidata knowledge graph. Supports federated queries, GeoSPARQL, and MWAPI service calls from within a query." supporting-text="Try the Query Service"}
::
:::

## API best practices

Before you build, understand how Wikimedia APIs work and what's expected of developers.

::highlight
[**Attribution →**](/apis/attribution)

Understand how to fairly credit Wikimedia projects and enrich reused content with credibility metadata
::

::highlight
[**Authentication →**](/apis/authentication)

Learn how to request and manage API tokens, OAuth 1.0a, and OAuth 2.0 credentials.
::

::highlight
[**Rate limits →**](/apis/rate-limits)

Learn how rate limit tiers work and how to avoid unexpected throttling.
::
