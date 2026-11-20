---
sidebar: false
status: mockup
---

:::landing-hero
# Build with Wikimedia

The technology behind [Wikipedia](https://www.wikipedia.org/) and [other Wikimedia projects](https://wikimediafoundation.org/our-work/wikimedia-projects/) powers thousands of apps, tools and services. Explore APIs, and connect with a global community of contributors.

::app-button{href="/get-started" label="Get started" size="large" icon-end="arrowNext"}
::
:::

::::landing-section
## What would you like to do?

:::navigation-card-grid{columns="2"}
::navigation-card{url="/get-started/wiki-content2" title="Use free knowledge" leading-icon="book" description="Get Wikipedia articles, media files, dictionary entries, and other content to use in your projects and apps."}
::

::navigation-card{url="/get-started/open-data" title="Work with open data" leading-icon="labFlask" description="Use Wikimedia data to inform research, support machine learning, and create visualizations."}
::

::navigation-card{url="/get-started/tools" title="Build for Wikimedia communities" leading-icon="robot" description="Create tools, bots, and features that support wiki readers and contributors."}
::

::navigation-card{url="/get-started/commercial" title="Build for commercial use cases" title-logo="wikimediaEnterprise" description="Get high-volume access to Wikimedia content and data using enterprise APIs and services."}
::
:::
::::

:::::landing-band{variant="apis"}
## Build and learn with Wikimedia APIs

::::landing-api-demo{explore-href="/explorer" explore-label="Explore Wikimedia APIs"}
Query analytics, articles, media, page history, and more across languages. Send requests and inspect responses right in your browser.

### List of most viewed English Wikipedia articles

:::code-block
```bash
curl -X GET "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access/2026/07/09" \
  -H "accept: application/json"
```
:::
::::
:::::

::::landing-band{variant="apps"}
## Discover community-built apps

Tools, bots, and application highlights built by the Wikimedia technical community to support and enhance the projects that power free knowledge.

:::navigation-card-grid{columns="3"}
::navigation-card{url="https://lexica-tool.toolforge.org/" title="Lexica" description="Simple and accessible editing of lexicographical data on Wikidata for everyone, everywhere." media="/images/landing/app-lexica.png" chips="award:Coolest Tool Award 2026" hide-external-icon}
::

::navigation-card{url="https://paulina.toolforge.org/" title="Paulina" description="A global, multilingual search interface for works and authors in the public domain using Wikidata and Python." media="/images/landing/app-paulina.png" chips="award:Coolest Tool Award 2025" hide-external-icon}
::

::navigation-card{url="https://listen.hatnote.com/" title="Listen to Wikipedia" description="Multimedia visualizer which translates recent Wikipedia edits into a display of visuals and sounds." media="/images/landing/app-listen.png" chips="award:Coolest Tool Award 2020" hide-external-icon}
::
:::

::landing-section-cta{href="/get-started/featured-apps" label="Discover more featured apps"}
::
::::

::::landing-band{variant="join"}
## Join the Wikimedia community

:::navigation-card-grid{columns="2"}
::navigation-card{url="/contribute" title="Contribute to Wikimedia open source" description="Help build the Wikimedia ecosystem with open source software." leading-icon="code"}
::

::navigation-card{url="/community" title="Connect with the Wikimedia developer community" description="Explore hackathons and events, and find opportunities for support and learning." leading-icon="userTalk"}
::
:::
::::
