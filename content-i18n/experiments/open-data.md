---
status: mockup
sidebar: false
---

# :message[Access open data]{#title qqq="Page heading and page title. Short imperative phrase."}

:message[Explore public data that you can use in research and machine learning.]{#intro qqq="Single-sentence intro paragraph directly under the H1."}

:::messages
:message[Introduction to Wikimedia open data]{#card-intro-title qqq="Navigation card title. Destination is the Research:Data page on Meta-Wiki."}
:message[Access publicly-available, open-licensed data about Wikimedia projects, including bulk downloads, streams of recent changes, and page statistics.]{#card-intro-description qqq="Navigation card description for the Research:Data card."}

:message[Explore structured data with Wikidata]{#card-wikidata-title qqq="Navigation card title. Destination is the Wikidata:Data access page."}
:message[Wikidata is a free and open knowledge base that can be read and edited by both humans and machines. Learn how to access data from Wikidata, and follow best practices for reusing it.]{#card-wikidata-description qqq="Navigation card description for the Wikidata data-access card."}

:message[Download content in bulk]{#card-dumps-title qqq="Navigation card title. Destination is the Data dumps page on Meta-Wiki."}
:message[Access free downloads of wiki content and data that you can use in research, offline reading, bot editing, and other projects.]{#card-dumps-description qqq="Navigation card description for the data-dumps card. Reused verbatim by the “Bulk data downloads” card lower on the page."}
:::

:::navigation-card-grid
::navigation-card{url="https://meta.wikimedia.org/wiki/Special:MyLanguage/Research:Data" title=":message{#card-intro-title}" description=":message{#card-intro-description}" supporting-text=":message{#content-shared-read-more-on p1='Meta-Wiki'}"}
::

::navigation-card{url="https://www.wikidata.org/wiki/Special:MyLanguage/Wikidata:Data_access" title=":message{#card-wikidata-title}" description=":message{#card-wikidata-description}" supporting-text=":message{#content-shared-read-more-on p1='Wikidata'}"}
::

::navigation-card{url="https://meta.wikimedia.org/wiki/Special:MyLanguage/Data_dumps" title=":message{#card-dumps-title}" description=":message{#card-dumps-description}" supporting-text=":message{#content-shared-read-more-on p1='Meta-Wiki'}"}
::
:::

## :message[Before you start]{#heading-before-you-start qqq="H2 introducing general guidance that applies to every data source on the page."}

::message{#before-you-start-intro qqq="Two-paragraph introduction under the Before you start heading. The second paragraph contains an inline link to the User-Agent policy on Meta-Wiki; keep the link and place it where the target language requires."}
All of the data linked from this page is publicly available and openly licensed.

You do not need an account or an API key to read it, though Wikimedia asks that every client identify itself with a descriptive [User-Agent header](https://meta.wikimedia.org/wiki/Special:MyLanguage/User-Agent_policy).
::

- :message[Identify your client with a descriptive User-Agent header.]{#practice-user-agent qqq="Bulleted best-practice item. Imperative sentence."}
- :message[Check the license of each dataset before you redistribute it.]{#practice-license qqq="Bulleted best-practice item. Imperative sentence."}
- :message[Prefer bulk downloads over crawling when you need data at scale.]{#practice-bulk qqq="Bulleted best-practice item. Imperative sentence."}

| :message[Data source]{#table-header-source qqq="Table column header. The name of a way to obtain Wikimedia data."} | :message[Format]{#table-header-format qqq="Table column header. The file or wire format the data arrives in."} | :message[Best for]{#table-header-best-for qqq="Table column header. The use case each data source suits."} |
| --- | --- | --- |
| :message[Dumps]{#table-dumps-source qqq="Table cell. Short name of the periodic bulk export of a project's content."} | :message[XML \| SQL]{#table-dumps-format qqq="Table cell. Format names; do not translate the format names themselves."} | :message[Bulk analysis of a project's full history]{#table-dumps-best-for qqq="Table cell. What dumps are best suited to."} |
| :message[Streams]{#table-streams-source qqq="Table cell. Short name of the real-time change feed. Refers to the \"EventStreams\" service; the service name itself is not translated."} | :message[JSON]{#table-streams-format qqq="Table cell. Format name; do not translate."} | :message[Reacting to changes as they happen]{#table-streams-best-for qqq="Table cell. What streams are best suited to."} |

## :message[Explore APIs]{#heading-explore-apis qqq="H2 above a grid of cards linking to API surfaces."}

:::navigation-card-grid
::navigation-card{url="/explorer" title=":message[Lift Wing API]{#card-liftwing-title qqq='Navigation card title. Proper name of the machine-learning inference API; not translated.'}" description=":message[Get predictions from Wikimedia machine learning models]{#card-liftwing-description qqq='Navigation card description for the Lift Wing card. No trailing period in the source.'}"}
::
:::

## :message[High-volume and commercial access]{#heading-commercial qqq="H2 above cards for paid and high-volume data access options."}

:::messages
:message[Wikimedia Enterprise APIs]{#card-enterprise-title qqq="Navigation card title. Proper product name; not translated."}
:message[Wikimedia Enterprise provides a suite of APIs and services designed for high-volume, commercial access to Wikimedia content and data.]{#card-enterprise-description qqq="Navigation card description for the Wikimedia Enterprise card."}

:message[Bulk data downloads]{#card-bulk-title qqq="Navigation card title. Second card on the page pointing at data dumps, from the commercial-access angle."}
:::

:::navigation-card-grid
::navigation-card{url="/get-started/wikimedia-enterprise" title=":message{#card-enterprise-title}" description=":message{#card-enterprise-description}"}
::

::navigation-card{url="https://meta.wikimedia.org/wiki/Special:MyLanguage/Data_dumps" title=":message{#card-bulk-title}" description=":message{#card-dumps-description}" supporting-text=":message{#content-shared-read-more-on p1='Meta-Wiki'}"}
::
:::

## :message[Learn with tutorials]{#heading-tutorials qqq="H2 above cards linking to step-by-step tutorials."}

:::messages
:message[Compare page metrics]{#card-metrics-title qqq="Navigation card title. Destination is a tutorial about page-view and edit metrics."}
:message[Analyze page viewership and edit data from Wikipedia.]{#card-metrics-description qqq="Navigation card description for the page-metrics tutorial card."}

:message[Browse all tutorials]{#card-all-tutorials-title qqq="Navigation card title. Destination is the on-platform tutorial index."}
:message[Browse featured tutorials.]{#card-all-tutorials-description qqq="Navigation card description for the tutorial-index card."}
:::

:::navigation-card-grid
::navigation-card{url="https://doc.wikimedia.org/generated-data-platform/aqs/analytics-api/tutorials/compare-page-metrics.html" title=":message{#card-metrics-title}" description=":message{#card-metrics-description}" supporting-text=":message{#content-shared-read-the-tutorial}"}
::

::navigation-card{url="/get-started/tutorials" title=":message{#card-all-tutorials-title}" description=":message{#card-all-tutorials-description}"}
::
:::
