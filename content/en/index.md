---
sidebar: false
status: mockup
---

# Build with Wikimedia

The technology behind [Wikipedia](https://www.wikipedia.org/) and [other Wikimedia projects](https://wikimediafoundation.org/our-work/wikimedia-projects/), powering thousands of apps, tools, and bots. Explore live APIs, and connect with a global community of contributors.

::app-button{href="/get-started" label="Get started →"}
::

---

## What would you like to do?

:::navigation-card-grid
::navigation-card{url="/get-started/build-for-communities" title="Build for Wikimedia communities" description="Fetch wiki content, automate edits, and detect vandalism. Learn about hosting tool and bots using Wikimedia infrastructure." supporting-text="Learn about building tools →"}
::

::navigation-card{url="/get-started/data-for-research" title="Work with Wikimedia datasets for research" description="Power research and create visualizations using APIs and bulk downloads of Wikimedia projects' data." supporting-text="Learn about bulk data sources →"}
::

::navigation-card{url="/get-started/wikimedia-enterprise" title="Use Wikimedia content for commercial use cases" description="Get high-volume access to Wikimedia content through APIs designed for search results, AI training, knowledge panels, and enriched experiences at scale." supporting-text="Learn about Wikimedia Enterprise →"}
::
:::

---

## Build and learn with Wikimedia APIs

Wikimedia APIs power thousands of apps, tools, and bots. Query analytics, articles, media, pages' history, search, user data, and more across languages. Send requests and inspect responses right in your browser.

### List of most viewed English Wikipedia articles

```sh
curl -X GET "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/2026/07/09" \
-H "accept: application/json"
```

:::navigation-card-grid
::navigation-card{title="Bonnie Tyler" description="Gaynor Sullivan (née Hopkins; 8 June 1951 – 8 July 2026), known professionally as Bonnie Tyler, was..."}
::

::navigation-card{title="Erling Haaland" description="Erling Braut Haaland (born 21 July 2000) is a Norwegian professional footballer who plays as..."}
::

::navigation-card{title="2026 FIFA World Cup" description="The 2026 FIFA World Cup was the 23rd FIFA World Cup, the quadrennial international men's soccer..."}
::
:::

[**Explore Wikimedia APIs →**](/explorer)

---

## Discover community-built apps

Tools, bots, and application highlights built by the Wikimedia technical community to support and enhance the projects that power free knowledge.

:::navigation-card-grid
::navigation-card{url="http://lexica-tool.toolforge.org/" title="Lexica" description="Simple and accessible editing of lexicographical data on Wikidata for everyone, everywhere."}
::

::navigation-card{url="https://paulina.toolforge.org/" title="Paulina - Data for the Public Domain" description="A global, multilingual search interface for works and authors in the public domain using Wikidata and Python."}
::

::navigation-card{url="https://listen.hatnote.com/" title="Listen to Wikipedia" description="Multimedia visualizer which translates recent Wikipedia edits into a display of visuals and sounds."}
::
:::

[**Discover more apps on Toolhub →**](https://toolhub.wikimedia.org/)

---

## Join the Wikimedia community

:::navigation-card-grid
::navigation-card{url="/contribute" title="Contribute to Wikimedia open source" description="Help build the Wikimedia ecosystem with open source software." supporting-text="Start coding →"}
::

::navigation-card{url="/community" title="Connect with the Wikimedia developer community" description="Explore hackathons and events, and find opportunities for support and learning." supporting-text="Get involved →"}
::
:::
