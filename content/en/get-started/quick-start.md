---
status: mockup
---
# Quick start

[Wikimedia projects](https://meta.wikimedia.org/wiki/Special:MyLanguage/Wikimedia_projects) are free, collaborative repositories of knowledge, written and maintained by volunteers around the world.
Each project hosts a different type of content, such as encyclopedia articles on [Wikipedia](https://www.wikipedia.org/) and dictionary entries on [Wiktionary](https://www.wiktionary.org/).
Wikimedia APIs give you open access to content and data from Wikimedia projects, including page content, attribution information, machine learning predictions, and more.

## Projects and languages

Most Wikimedia projects are created and maintained in a single language.
This means that what we think of as Wikipedia is really over 300 different Wikipedias (English Wikipedia, Cebuano Wikipedia, Swedish Wikipedia, and many more) all with original articles in their own language.
Single-language projects use the language code as the subdomain.

Some projects are maintained in English and translated into other languages (like [Commons](https://commons.wikimedia.org/wiki/Special:MyLanguage/Main_Page)), or they are created to be language neutral (like [Wikispecies](https://species.wikimedia.org/wiki/Special:MyLanguage/Main_Page)).
These multilingual projects use the project name as the subdomain instead of a language code.

For a complete list of projects and languages, visit the [site matrix on Meta-Wiki](https://meta.wikimedia.org/wiki/Special:SiteMatrix).

## API overview

API endpoints share a consistent URL structure based on the project name and language code:

```
https://[language code].[project].org/...
```

The API uses HTTP [request methods](https://en.wikipedia.org/wiki/HTTP#Request_methods) and [response status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) and returns data in [JSON](https://en.wikipedia.org/wiki/JSON) format.

## Make your first request

Get today's featured article from English Wikipedia.

```sh
curl https://...
```

## Try the sandbox

Visit the [API reference]() to try different parameters and explore other available languages and projects.

## Next steps

- Explore featured apps
- Learn with tutorials
- Connect with the community
