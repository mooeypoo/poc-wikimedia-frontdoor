---
status: 0 draft
---

# APIs

::highlight
Wikimedia’s APIs provide access to projects’ content and data. To learn more, [**go to the Quick start →**](/get-started/quick-start)
::

::api-catalog-wikimedia-section{title="Wikimedia APIs" chip="Recommended"}
Discover our curated selection of production-ready APIs, designed to help you build, integrate, and scale with Wikimedia's open knowledge ecosystem.
::

## Wikimedia Enterprise APIs

Wikimedia Enterprise offers reliable, high-volume access to Wikimedia data through structured APIs and data feeds, enabling organizations to seamlessly integrate trusted, up-to-date knowledge from Wikipedia and other Wikimedia projects into their products and services at scale. To learn more, [**visit the Wikimedia Enterprise portal**](https://enterprise.wikimedia.com)

:::navigation-card-grid
::navigation-card{url="https://enterprise.wikimedia.com/docs/snapshot/" title="Snapshot API" description="The Enterprise Snapshot API allows users to retrieve entire Wikimedia projects as a database dump file." supporting-text="Read the docs" chips="notice:Multi-project|success:Stable"}
::

::navigation-card{url="https://enterprise.wikimedia.com/docs/on-demand/" title="On-demand API" description="The Wikimedia Enterprise On-demand API allows users to retrieve single articles from any supported Wikimedia project at anytime." supporting-text="Read the docs" chips="notice:Multi-project|success:Stable"}
::

::navigation-card{url="https://enterprise.wikimedia.com/api/structured-contents/" title="Structured contents" description="Extracts infoboxes, sections, tables, references, and more from raw wikitext and HTML and delivers them as structured, machine-readable JSON." supporting-text="Read the docs" chips="notice:Wikipedia|warning:Beta"}
::
:::

## Classic APIs

Still supported and powerful, but not recommended for most new integrations.

:::navigation-card-grid
::navigation-card{url="https://www.mediawiki.org/wiki/Special:MyLanguage/API:Main_page" title="MediaWiki Action API" description="The original and most comprehensive Wikimedia API. 100+ action modules covering page reads, edits, user management, file uploads, search, patrol and more." supporting-text="Read more on mediawiki.org" chips="notice:All projects"}
::

::navigation-card{url="https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:Data_access" title="Wikibase Action API" description="Extension to the MediaWiki Action API adding Wikidata-specific operations: wbgetentities, wbsetclaim, wbsearchentities, etc." supporting-text="Read more on Wikidata" chips="notice:Wikidata/Wikibase"}
::

::navigation-card{url="https://query.wikidata.org/" title="SPARQL/Wikidata Query Service" description="A SPARQL 1.1 endpoint over the full Wikidata knowledge graph. Supports federated queries, GeoSPARQL, and MWAPI service calls from within a query." supporting-text="Try the Query Service" chips="notice:Wikidata|success:Stable"}
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

::highlight
[**Policies →**](/apis/policies)

Review terms and conditions for using Wikimedia content and APIs.
::
