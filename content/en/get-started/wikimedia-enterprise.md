---
status: version 1
---

# About Wikimedia Enterprise

Integrate the world’s knowledge into your product experiences with Wikimedia Enterprise: a suite of APIs powered by the Wikimedia Foundation and designed specifically for [commercial use cases](/get-started/commercial-use-cases).
Backed by comprehensive services and support, SLAs, and guaranteed uptime, Wikimedia Enterprise APIs offer high-volume, on-demand access to content from Wikipedia and other Wikimedia projects.

::highlight
[**Get started with Wikimedia Enterprise**](https://enterprise.wikimedia.com)
::

Wikimedia Enterprise is designed for:

* developing commercial products using Wikimedia content
* high-volume real-time updates of Wikimedia data
* downloading Wikimedia content in bulk for research or other projects
* higher rate limits than Wikimedia community APIs

## Download content in bulk

Use Wikimedia content to train AI models, build internal knowledge bases, create offline archives, or populate large research text corpora. The Snapshot API lets you download all articles from a Wikimedia project and language with one request, updated at the frequency you need, in a variety of formats.

[Learn more about the Snapshot API](https://enterprise.wikimedia.com/docs/snapshot/)

## Fetch the latest information on demand

Add targeted knowledge to your product by looking up facts in response to user actions or by fetching data from a specific article. The On-demand API retrieves the most recent information about a topic from all Wikimedia projects in all languages.

[Learn more about the On-demand API](https://enterprise.wikimedia.com/docs/on-demand/)

## See updates in real time

Stay up to date with the latest information by reacting to breaking news and global events as they happen. The Realtime API provides a continuous stream of live edit events as well as hourly patches to catch up on recent changes. If you have an internal knowledge base you need to keep updated as the world changes, the Realtime API is the most powerful way to integrate with live knowledge from Wikimedia projects.

[Learn more about the Realtime API](https://enterprise.wikimedia.com/docs/realtime/)

## Get started

Wikimedia Enterprise offers a free access tier for the Snapshot API and On-demand API to make it easy to get started. Free accounts can support a broad set of research and other use cases.

[Learn more about pricing](https://enterprise.wikimedia.com/pricing/)

### Access for Wikimedia communities

Wikimedia Enterprise APIs are fully free to use for Wikimedia community members through Wikimedia Cloud Services.

[Learn more on Wikitech](https://wikitech.wikimedia.org/wiki/Help:Cloud_Services_introduction#Get_Exclusive_Wikimedia_Enterprise_API_Access)

## Commercial use cases

Wikimedia Enterprise APIs are designed for a variety of commercial workflows, including large language models (LLM) training and inference, search engines, knowledge graphs, and data science.

### AI and machine learning

Train LLMs, build and tune training corpora, and ground retrieval-augmented generation (RAG) systems in factual, human-verified data.

Learn more:
- [Build a RAG-based LLM application using Wikimedia Enterprise API to improve accuracy of Llama3](https://enterprise.wikimedia.com/blog/build-rag-llm-wikimedia-enterprise-api/)
- [Mistral AI partners with Wikimedia Enterprise to Leverage Open Knowledge for AI](https://enterprise.wikimedia.com/blog/mistral-ai-partners-with-wikimedia-enterprise/)

### Agentic workflows

Build harnesses that quickly retrieve the most relevant information exactly when it's needed using Wikimedia project data. Allow agents to make queries at inference time to gain more context. Use Wikimedia projects as a starting point, linking to other sources of knowledge. 

Learn more:
- [Firecrawl Replaces Wikipedia Scraping with Wikimedia Enterprise APIs](https://enterprise.wikimedia.com/blog/firecrawl-replaces-wikipedia-scraping-with-enterprise-apis/)

### Search results and knowledge panels

Enrich search engine results, agentic queries for more context at inference time, and voice assistants with up-to-date quick facts, abstracts, and images.

Learn more:
- [Build a Knowledge Panel with Structured Wikipedia API](https://enterprise.wikimedia.com/blog/build-a-knowledge-panel/)
- [Ecosia Enriches Search Results and AI Answers with Wikimedia Enterprise](https://enterprise.wikimedia.com/blog/ecosia-enriches-search-results-and-ai-answers/)

### Fact-checking and misinformation defense

Power claim verification tools and identify logical fallacies by cross-referencing claims against verifiable Wikipedia, Wikisource, and other Wikimedia project articles.

Learn more:
- [SimPPL Uses Wikimedia Enterprise to Map Online Conversations and Fact-Check Social Media](https://enterprise.wikimedia.com/blog/how-simppl-fact-checks-social-media/)
- [How CivicLens Uses Wikidata APIs to Make Civic Data More Accessible](https://enterprise.wikimedia.com/blog/how-civiclens-uses-wikidata-apis/)

### Knowledge graphs and taxonomies

Connect disparate databases and enrich datasets using Wikidata's universal identifiers and multilingual labels, or build large corpora of human-curated knowledge from textual Wikimedia projects such as Wikivoyage and Wikipedia.

Learn more:
- [How Databricks Parsed Wikipedia to Markdown with Python](https://enterprise.wikimedia.com/blog/how-databricks-parsed-wikipedia-to-markdown-with-python/)
- [Wikipedia Hugging Face Dataset using Structured Contents Snapshot](https://enterprise.wikimedia.com/blog/hugging-face-dataset/)

### Educational and linguistic tools

Develop adaptive learning platforms with Wikibooks, or create machine translation engines and spell-checkers using Wiktionary and Wikisource data.

Learn more:
- [Aligned AI is developing Ethical AI products for families, with the help of Wikimedia Enterprise](https://enterprise.wikimedia.com/blog/aligned-ai-is-developing-ethical-ai/)
- [Nomic AI's NOMAD Projection uses Enterprise Datasets to Visually Map Multilingual Wikipedia](https://enterprise.wikimedia.com/blog/nomic-ai-nomad-projection-maps-wikipedia/)

### Limitations

Depending on your use case, Wikimedia Enterprise may not be the best option. Here are a few limitations to consider when choosing Enterprise APIs:

- Wikimedia Enterprise APIs offer read-only access. For write access or other interactive access, use the Wikimedia community APIs for [building tools and bots](/get-started/tools-and-bots).
- For small experiments, [Wikimedia community APIs](/get-started/quick-start) can help you get started without creating an account.
- Wikimedia Enterprise only stores article text, templates, categories, and files from Wikimedia projects. For API access to other types of content (such as talk pages, user pages, and help pages), use community APIs for [using wiki content](/get-started/wiki-content).
