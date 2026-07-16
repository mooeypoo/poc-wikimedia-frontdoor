---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/en
sourceWiki: www.mediawiki.org
sourceRevision: "8016700"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Documentation for [Extension:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Translators** (**[main help page](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [How to translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Best practices](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistics and reporting](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Quality assurance](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Message group states](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Offline translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Glossary](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Translation administrators**

- [How to prepare a page for translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Page translation administration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Unstructured element translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Group management](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Move translatable page](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import translations via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Sysadmins and developers**

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Getting started with development](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Developer guide](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Extending Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validators](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Insertables](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Group configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Group configuration example](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Translation memories](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Translation aids](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Translate this template](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

The main special page of the extension, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), in its most common task, "view all untranslated messages"

The [Translate extension](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) enhances MediaWiki with essential features needed to do translation work. It can be used to translate the content pages, the interface of the wiki and even other software products, as it is used at [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). The Translate extension comes with an easy to use translation interface and can separate the content structure from the text content that needs to be translated, showing only the translatable text to translators by splitting the content into manageable units. Each unit is automatically tracked for changes, and translators immediately see what needs updating on a specific page or throughout the wiki.

The Translate extension is used to translate the user interface of MediaWiki and other software projects at translatewiki.net by hundreds of translators every month. At [userbase.kde.org](http://userbase.kde.org) it is used to translate almost a thousand content pages with user documentation. It is easy to start using the Translate extension, but at the same time it also scales up and provides advanced reporting, reviewing and workflow features.

## Features

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

The translation editor: a message with a tip (not visible in image) and suggestions from two assistant languages

**Interface:** The main feature of the Translate extension is a simple yet functional translation interface. Besides the essential information like message definition and documentation, you can also view translations in other languages. If a definition has changed, you will see the changes. The extension comes with some built-in checks, that can help with common mistakes like unbalanced brackets and unused variables. Depending on the configuration, there are also suggestions from translation memory and machine translation services like those of Google Translate, Microsoft's Bing Translator and Apertium.

The usability of the translation interface is enhanced with JavaScript and AJAX. The backend provides WebAPIs that can be used in mobile interfaces or interfaces tailored to specific kind of content. It is also possible to export messages for translation in other off-line and on-line tools that accept the [Gettext po](https://en.wikipedia.org/wiki/Gettext) file format.

**Message groups and tasks:** Many of the features are built around two basic concepts: message groups and tasks.

A message group represents a collection of messages. One content page would be one message group, where, in the simplest form, each paragraph would be one message in that group. Messages used in each MediaWiki extension form a message group on translatewiki.net – a few of the largest extensions have multiple groups. You can also make a group of groups, like _All newsletters_ or _All Translate extension messages_. Many of the statistics and the tasks work on the message group basis.

The tasks, or in other words different listings of messages in a message group, facilitate different use cases. Normally a translator gets a list of all untranslated messages in a chosen message group, but there are tasks where you can review messages or just get a list of all messages, translated or not.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

This special page reports the translation status of each message group

**Reporting and statistics:** The extension has extensive [reporting features](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) ranging from a view of untranslated messages across all message groups in a given language to lists of translators per language with their activity level.

**Content translation:** If you have ever tried to translate content in MediaWiki without any tools, you know it does not scale. The translated versions get out of date and there is no way to track changes to the master page, so there are many half-translated and outdated translations without a clear overview of the overall status. Translators often feel discouraged when they cannot work with small manageable pieces of text. Translators don't find what to work on or what needs updating. The users also get confused by outdated information.

This is all solved with the Translate extension and its page translation feature. It adds a bit of overhead to the pages that need translation, but the benefits far outweigh this. Essentially you only need to mark the parts of the page that need translation. The extension then splits such parts into paragraph sized units and creates a message group for them. After that translators can use all the features described above. In addition you can easily add a language bar with the `<languages />` tag or have links automatically go to the user's preferred language version (only) when it exists, by using links of the form \[\[Special:MyLanguage/Pagename]].

For more information see the tutorial [How to set up a content page for translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) and the [in-depth documentation of the page translation feature](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Developers:** The extension comes with built-in support for many common translation file formats, like Java properties and Gettext po files. It has an extensive set of tools, both in-wiki and on the command line, to efficiently import and export translations.

**Searching:** Without a search feature, it is difficult for translators to find specific messages they want to translate. Traversing all the translations or strings of the project is inefficient. Also, translators often want to check how a specific term was translated in a certain language across the project.

This is solved by the special page [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Translators can find the messages containing certain terms in any language and filter by various criteria: this is the default. After searching, they can switch the results to the translations of said messages, for instance to find the existing, missing or outdated translations of a certain term.

## Use cases

You can translate almost anything with the Translate extension. Naturally there are specialized tools for translation of certain kind of content like video subtitles, that are better done with those tools, but in general _Translate_ performs very well with any kind of text that can be split into messages with length ranging from one word up to one large paragraph. Longer messages become unwieldy to translate and are just harder to work with.

The three primary use cases that the Translate extension supports are **content translation**, **local interface translation** and **software translation**. All of them are covered in the following sections, with links to tutorials and to reference documentation or in-depth topical help where available. Of the three use cases the interface translation has been utilized the least.

### Content translation

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

The translation is outdated: outdated parts are replaced with new source text and translators can reach the messages to update in a single click

Most wikis have content they would like to be available in multiple languages. Whether just a few or hundreds of pages, it doesn't matter. In order to prevent wasting translator's time, pages should be marked for translation only when they are reasonably stable. Each change that is made afterwards can affect tens or hundreds of old translations, and the time needed to update them adds up. Especially with volunteer translators, you should be aware of this aspect, and respect the time they spend making translations and updates, avoiding unnecessary work. If you use the Translate extension to translate pages, you are already well on your way to using the translator time available in the most effective and efficient way.

The way the Translate extension splits up a page into paragraph sized units does not leave too much freedom for translators to change the content. This is usually a good thing and is ideal where continuity and consistency of content across languages is desired. It can be worked around, but in principle this way of doing translations is not generally suitable, for example, for Wikipedia articles, which usually are totally independent of each other. Even if they originally start as a translation from a different language, they usually begin living their own independent life from the original version. With _Translate_, the original page is always the main version, and new content cannot be developed in translated versions.

With these limitations in mind there are still plenty of cases where this feature is a perfect match. Most, if not all, user documentation falls into this category as well as news-like content that does not change once written. If you have the Translate extension already installed and access rights configured, try creating a page and wrapping the whole text inside `<languages />...` and follow the links, or follow the tutorial [How to prepare a page for translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Groups of pages can be further aggregated together with the [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups) page.

### Local interface translation in multilingual wikis

One thing almost every wiki has customized is the [sidebar](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). It is possible to create a message group for the custom sidebar messages and also for other local interface customisations.

One interesting expansion is the multilingual pages or templates built with the {{int:}} magic word. The [translatewiki.net](https://translatewiki.net/wiki/) main page and some Wikimedia Commons templates are good examples of this. The magic word {{int:}} is an alternative to the content translation feature and it is more suitable to mark-up heavy pages just like the translatewiki.net main page. Another nice feature is that the language of the page automatically follows the user interface language, so there is no need for a language bar, although you might want to have an interface language selector instead.

Setting this up is currently a bit more complicated than content translation and needs software configuration, but it is all covered in the tutorial [How to make an interface message group](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Software translation

The Translate extension is a good fit for translating software interface messages. At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

Change tracking is also available for externally tracked files, because internally the extension uses a cached derivative version of the localisation files where the source text and its translations are stored, instead of using them directly in their original format. Translation administrators can either use the web interface or a command line interface to check new message definitions and "fuzzy" (request update of) translations when they need updating. This works regardless of the underlying file format or version control system (if any).

With simple command line tools, translation administrators can easily import even a large set of existing translations and with just one command they can export all translations in the correct format and in the correct directory structure. You can export directly to your [VCS](https://en.wikipedia.org/wiki/Version%20control%20system) repository checkout, where you can easily commit changes and new files.

## Further reading and tutorials

### For translators and translation administrators

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Slides of a workshop about how to use [Extension:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) at Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [How to translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Tutorial]
- [Translation best practices](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistics and reporting](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Quality assurance](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Message group states](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[In progress] [Search](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Off-line translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[In progress] [Glossary](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### For translation administrators

- [How to prepare a page for translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Tutorial]
- [Page translation administration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Interface message groups (localised sidebar, main page and templates)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Tutorial]
- \[In progress] [Message group management](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML configuration format](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [How to write YAML configuration for file based message groups](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Tutorial]

### Reference documents for developers

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) and [Configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Language Extension Bundle](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) should be enough in most cases.

- [Translation memories](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Developer guide](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[In progress] [Translate explained for developers](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Hooks](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[In progress] [Message groups](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[In progress] [File format support](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Translation aids](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Unwritten] [action API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Insertables](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Command line scripts](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Process flow in MediaWiki jobs](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Describes what jobs are involved when a page is marked for translation or a section is translated
  - [Translation memory architecture](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Related

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extension:TranslationNotifications](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – General localisation tutorial for developers, for use at hackathons & trainings
- [Universal Language Selector](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Provides web fonts and input methods
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – things to think about when creating pages or processes on multilingual wikis
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Add yourself to the list of currently active tech translators

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/en" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016700"}
::
