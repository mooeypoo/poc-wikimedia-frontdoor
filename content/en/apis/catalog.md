# API catalog

Browse all APIs.

::highlight
**Share your feedback about beta APIs**

Beta APIs are temporary experiments designed to try out new functionality and get feedback from developers. [Learn more about beta APIs.](/apis/stability)
::

## Wikimedia APIs

::api-catalog-wikimedia-section
::

## Wikimedia Enterprise APIs

Wikimedia Enterprise offers high-volume access to Wikimedia data at scale.

:::navigation-card-grid
::navigation-card{url="/explorer" title="Snapshot API" description="The Enterprise Snapshot API allows users to retrieve entire Wikimedia projects as a database dump file." }
::

::navigation-card{url="/explorer" title="On-demand API" description="The Wikimedia Enterprise On-demand API allows users to retrieve single articles from any supported Wikimedia project at anytime." }
::

::navigation-card{url="/explorer" title="Realtime API" description="Receive real-time event updates from all supported Wikimedia projects using a streaming endpoint, or via batch file endpoints that are generated hourly."  }
::

::navigation-card{url="/explorer" title="Metadata API" description="Get reference data to use the APIs effectively."  }
::

::navigation-card{url="/explorer" title="Authentication API" description="Retrieve and manage tokens for using the APIs."  }
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
