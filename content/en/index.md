---
sidebar: false
status: mockup
---

:::landing-hero
# Build with Wikimedia

The technology behind [Wikipedia](https://www.wikipedia.org/) and [other Wikimedia projects](https://wikimediafoundation.org/our-work/wikimedia-projects/), powering thousands of apps, tools and services. Explore live APIs, and connect with a global community of contributors.

::app-button{href="/get-started" label="Get started" size="large" icon-end="arrowNext"}
::
:::

::::landing-section
## What would you like to do?

:::navigation-card-grid
::navigation-card{url="/get-started/build-for-communities" title="Build for Wikimedia communities" description="Fetch wiki content, automate edits, and detect vandalism. Learn about hosting tool and bots using Wikimedia infrastructure." supporting-text="Learn about building tools →" leading-icon="userGroup"}
::

::navigation-card{url="/get-started/data-for-research" title="Work with Wikimedia datasets for research" description="Power research and create visualizations using APIs and bulk downloads of Wikimedia projects' data." supporting-text="Learn about bulk data sources →" leading-icon="labFlask"}
::

::navigation-card{url="/get-started/wikimedia-enterprise" title="Use Wikimedia content for commercial use cases" description="Get high-volume access to Wikimedia content through APIs designed for search results, AI training, knowledge panels, and enriched experiences at scale." supporting-text="Learn about Wikimedia Enterprise →" title-logo="wikimediaEnterprise"}
::
:::
::::

:::::landing-band{variant="apis"}
## Build and learn with Wikimedia APIs

::::landing-api-demo{explore-href="/explorer" explore-label="Explore Wikimedia APIs"}
Wikimedia APIs power thousands of apps, tools, and bots. Query analytics, articles, media, pages' history, search, user data, and more across languages. Send requests and inspect responses right in your browser.

### List of most viewed English Wikipedia articles

:::code-block
```bash
curl -X GET "https://wikimedia.org/api/rest_v1/metrics/
pageviews/top/en.wikipedia.org/all-access/2026/07/09" \
  -H "accept: application/json"
```
:::
::::
:::::

::::landing-band{variant="apps"}
## Discover community-built apps

Tools, bots, and application highlights built by the Wikimedia technical community to support and enhance the projects that power free knowledge.

:::navigation-card-grid
::navigation-card{url="https://lexica-tool.toolforge.org/" title="Lexica" description="Simple and accessible editing of lexicographical data on Wikidata for everyone, everywhere." media="/images/landing/app-lexica.png" chips="award:Coolest Tool Award 2026" hide-external-icon}
::

::navigation-card{url="https://paulina.toolforge.org/" title="Paulina" description="A global, multilingual search interface for works and authors in the public domain using Wikidata and Python." media="/images/landing/app-paulina.png" chips="award:Coolest Tool Award 2025" hide-external-icon}
::

::navigation-card{url="https://listen.hatnote.com/" title="Listen to Wikipedia" description="Multimedia visualizer which translates recent Wikipedia edits into a display of visuals and sounds." media="/images/landing/app-listen.png" hide-external-icon}
::
:::

::landing-section-cta{href="https://toolhub.wikimedia.org/" label="Discover more apps on Toolhub"}
::
::::

::::landing-band{variant="join"}
## Join the Wikimedia community

:::navigation-card-grid{columns="2"}
::navigation-card{url="/contribute" title="Contribute to Wikimedia open source" description="Help build the Wikimedia ecosystem with open source software." supporting-text="Start coding →" leading-icon="code"}
::

::navigation-card{url="/community" title="Connect with the Wikimedia developer community" description="Explore hackathons and events, and find opportunities for support and learning." supporting-text="Get involved →" leading-icon="userTalk"}
::
:::
::::
