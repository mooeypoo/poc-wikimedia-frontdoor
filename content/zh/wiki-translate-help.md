---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/zh
sourceWiki: www.mediawiki.org
sourceRevision: "8176468"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

[:](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)的帮助文档

**翻譯人員** (**[主要說明頁面](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [如何翻譯](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [最佳實踐](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [统计与报告](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [品質保證](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [訊息組狀態](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [離線翻譯](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [词汇表](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**翻译管理员**

- [如何为页面做好翻译准备](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [管理翻譯頁面](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [未结构化元素的翻译](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [组管理](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [移动可翻译页面](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [通过CSV导入翻译](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [使用消息包](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**系統管理員與開發人員**

- [安裝](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [设置](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [开发入门](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [开发人员指引](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [翻译的延伸](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [验证](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [插入式](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [群組设置](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [群组设置的示例](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [翻译记忆库](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [翻译辅助工具](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [启用消息包](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP函数钩](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[翻譯此模板](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

扩展的主要特殊页面“[Special:Translate](https://www.mediawiki.org/wiki/Special:Translate)”主要任务是“查看所有未翻译的消息”

[翻譯擴充功能](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)为使用MediaWiki进行翻译工作提供了必要的特性增强。 它可以用于翻译页面内容、wiki界面、甚至其他软件产品，类似于它在[translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki)中的用途。 翻譯擴充功能简单易用的翻译界面，并拥有可以从文本内容中分离出需要翻译的内容，透過将内容分割为可管理的单元，仅显示可翻译文本给翻译者。 每个单元会自动更新变化，翻译者透過特殊页面或wiki，可以立刻看到需要更新的位置。

翻譯擴充功能在translatewiki.net上用于翻译 MediaWiki 的用户界面和其他软件项目，每月有数千译者参与其中。 在[userbase.kde.org](http://userbase.kde.org)上，它用于翻译近千頁的用户文档内容页面。 翻譯擴充功能易于上手，不只如此还同時擴大規模、提供了方便的高级报表、评审、和工作流特性。

## 功能

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

翻译编辑器：提示消息（图片中不可见）和两种辅助语言的翻译建议

**界面：**&#x7FFB;譯擴充功能的主要特性是简单实用的翻译界面。 除了类似消息定义和文档这些必要的信息外，你还可以查看其他语言的翻译。 如果定义改变，你会看到该更改。 擴充功能包含一些内置检查，可以帮助发现常见错误，比如括号不成对、变量丢失。 根据设置，它还可以根据翻译记忆或机器翻译服务提供翻译建议，比如Google翻译、微软的Bing翻译器和Apertium。

透過JavaScript和AJAX增强了翻译界面的可用性。 后端提供的WebAPI可用于移动终端或为特殊内容定制的界面。 还可以导出消息以便在其他接受[Gettext po](https://en.wikipedia.org/wiki/Gettext)文件格式的在线/离线工具中进行翻译。

**消息组和任务：**&#x5F88;多特性都是围绕着消息组和任务这两个基本概念建立的。

消息组表示消息的集合。一个内容页面则是一个消息组，它出现在极简的表格中，而每个段落为其中的一条消息。在 translatewiki.net 上，每个 MediaWiki 擴充功能的所有消息构成一个消息组；一些太大的擴充功能拥有多个消息组。你也可以创建消息组的集合，比&#x5982;_&#x6240;有新闻简讯_、_所有翻譯擴充功能的消息_。很多统计和任务都以消息组为基础。

任务，或称为消息组中不同的消息列表，适用于不同的情况。译者一般要在消息组中选择未翻译的消息列表，不过还有其他任务，如校对消息或只是查看所有消息的完整列表（包括已译和未译的）。

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

该特殊页面报告每个消息组的翻译状态

**报告和统计：**&#x672C;扩展提供的[报告功能](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)，显示根据译者活跃程度排序在指定语言中所有消息组里未译消息状况。

**内容翻译：** 如果你曾经试图不使用任何工具来翻译 MediaWiki 中的内容，你知道它没什么灵活性。 当翻译完的版本变得过时、需要更新时，无法跟踪原始页面的变更，因此有很多半成品和过时了的翻译作品，无法直观的把握整体状况。 因为无法对部分文本进行可管理的翻译工作，译者经常会感到沮丧。 译者无法找到要翻译什么、以及哪些需要更新。 用户也会因为这些过时的信息而感到困惑。

透過翻譯擴充功能及其页面翻译功能，这些都解决了。它给需要翻译的页面增加了一些额外开销，但好处远远大于开销。本质上，你仅仅需要标记页面上需要翻译的部分。擴充功能会将其分割为段落大小的单位，并为他们创建消息组。之后，译者可以使用适用上面介绍的所有功能。另外，你可以使用`<languages />`标签，简单的添加语言栏；或者透過使用\[\[Special:MyLanguage/Pagename]]，在指定语言的版本存在的时候，使链接自动使用该语言的版本。

更多内容参见教程[如何设置页面内容用于翻译](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)和[页面翻译功能进阶文档](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)。

**开发者：**&#x64F4;充功能内建了对许多常见翻译檔案格式的支持，比如 Java 属性檔案、Gettext po檔案。并包含一组工具，通过 wiki 或命令行来高效的导入导出翻译内容。

**搜索：**&#x5982;果没有搜索功能，对翻译者来说找到他们需要翻译的消息会困难。寻找项目中的所有翻译或字符串效率不高，而且，翻译者通常想要检查一个特定的项是如何在一个工程中翻译为某一个特定语言的。

特殊页面[Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations)解决了这个问题。翻译者可以找到含有任何语言的特定的项的消息，并根据准则过滤：这是默认的。搜寻之后，他们可以从结果中找到需要翻译的内容，比如从特定的项中找到存在的、丢失的、过时的翻译。

## 用例

使用翻譯擴充功能，你几乎可以翻译任何东西。当然，有特殊工具用于翻译某些类型的内容，比如视频字幕。使用这些工具可以做的更好，不过单就一般的**翻译**来说，对于任何可以拆分成从一个字到一大段消息的文本，翻譯擴充功能都有很好的表现。较长的消息变得不太好翻译，也只是费些功夫而已。

翻譯擴充功能支援的三种主要用途为 **内容翻译**、**本地界面翻译**和**软件翻译**。下面章节记述了相关内容，并附带了有助于找到那些有教程、参考文档和深入讨论内容的链接。三种用途中，界面翻译利用的最少。

### 内容翻译

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

翻译已经过时：过时的部分会替换为源文本，译者只需单击一下即可打开消息来更新它

大多数wiki都有需要提供多语言的内容。不管只有几页还是有上百页，这不是问题。为了防止浪费译者的时间，只将已经一定程度上稳定的页面标记为翻译对象。之后的每个更改都会影响几十上百翻译，更新过来需要的时间加起来很可观。特别对于翻译志愿者，你应该注意这个方面，尊重他们花费在翻译及更新上的时间，避免不必要的工作。如果你使用翻譯擴充功能来翻译页面，你就已经准备好了可以以最有效的方式利用翻译者时间的方法。

翻譯擴充功能将页面分割成段落大小的单位，没有为译者留下太多的改变内容的自由度。这通常是有益的，对于跨语言保持内容的连续性和一致性来说是理想的。它可以使用，但原则上，以该方法进行翻译不具有普遍适用性。比如，对于维基百科文章，通常是彼此完全独立的。即使它们最初来自于其他语言的翻译，他们也开始了有别于原始版本的“生活”。对&#x4E8E;_&#x7FFB;译_，原始版本始终是主要版本，新内容不能从翻译版开始添加。

记住这些限制会发现仍有大量情况适合于该功能的使用。即使不是所有也是大部分用户文档及编写后一般不会修改的新闻类的内容也属于该情况。如果您安装了翻譯擴充功能并配置好存取权限，请尝试创建页面并把整段文本放在 `<languages />...` 中并点击链接，或参照该指南[如何标记页面以备翻译](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)。

页面组可以在[Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups)页面进一步聚合在一起。

### 多语言wiki中的本地界面翻译

几乎每个wiki都会定制的一部分是[侧栏](https://www.mediawiki.org/wiki/Manual:Interface/Sidebar/zh)。为自定义侧栏消息创建消息组是可行的，这也适用于其他本地定制化界面。

一种有趣的延伸是内置 {{int:}} 魔術字的多語言页面或模板。 [translatewiki.net](https://translatewiki.net/wiki/) 主页和一些维基共享资源模板就是很好的例子。 魔法单词 {{int:}} 是内容翻译功能的另一种选择，它更适合标记大型页面，就像 translatewiki.net 的主页一样。 另一个很好的功能是这种页面的语言会自动跟随用户界面语言，因此不需要语言栏，不过相应的需要界面语言选择功能。

目前建立这个比起内容翻译要复杂些，且需要配置软件，不过在[如何创建界面消息组](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)教程中涵盖了所有这些内容。

### 软件翻译

该翻譯擴充功能很适合用于翻译软件界面消息。 它在translatewiki.net上用来翻译十多个软件产品，包括游戏和网络程序。 它在读取和更新译文时支持 web 开发中的常见格式，包括 [Java 属性](https://en.wikipedia.org/wiki/.properties)、[Gettext](https://en.wikipedia.org/wiki/Gettext) 和 [YAML](https://en.wikipedia.org/wiki/YAML) 檔案。

跟踪修订也能用于外部跟踪文件，因为在内部该扩展使用本地化文件的缓存衍生版，其中包含了原文和译文，并不直接使用原来的格式。翻译管理员在更新时可以使用 web 界面或命令行借口检查消息定义和“模糊”译文（需更新）。不论底层的文件格式或版本控制系统（如果有）是什么，这样做都是可行的。

通过简单的命令行工具，翻译管理员可以轻松导入大量现有译文，还能通过一个命令导出格式和目录结构正确的所有译文。您可以直接检出到 [VCS](https://en.wikipedia.org/wiki/en:Version%20control%20system) 版本库，这样您可以方便的提交更改和新文件。

## 进一步阅读和教程

### 译者与翻译管理员

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Wikimania17上有关如何使用[Extension:Translate（翻译）](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)的研讨会的幻灯片。

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

幻灯片的英文视频讲解。

- [如何翻译](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[教程]
- [翻译的最佳实践](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [统计与报表](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [质量保证](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [消息组状态](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[进行中] [搜索](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [脱机翻译](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[进行中] [词汇表](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### 翻译管理员

- [如何为页面做好翻译准备](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[教程]
- [页面翻译管理](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [界面消息组（本地化侧栏，主页和模板）](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[教程]
- \[进行中] [消息组管理](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML设置格式](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [如何为基于文件的消息组设置 YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[教程]

### 开发人员参考文档

- [安裝](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)和​[配置](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - 大多数情况下[MediaWiki语言扩展包](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle)已足够使用。

- [翻译历史](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [开发人员指引](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[进行中] [给开发人员的翻译说明](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [函数钩](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[进行中] [消息组](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[进行中] [檔案格式支援](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [翻译目标](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[未撰写] [action API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [插入式](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [命令行脚本](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [MediaWiki作業中的流程](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - 描述當頁面被標記為翻譯或部分被翻譯時所涉及的工作
  - [翻譯記憶庫架構](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### 相关项

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror与翻译扩展程序的集成脚本
- [Extension:翻译通知](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – 给开发者的本地化教程，用于编程马拉松（hackathon）与练习
- [萬用语言选择器](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – 提供网页字体和输入法
- [m:可翻译性](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – 在多语言wiki上创建页面或过程时需要考虑的事
- [m:技术/翻译者/列表](https://meta.wikimedia.org/wiki/Tech/Translators/List) – 将您添加到目前活跃的技术翻译者列表中

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/zh" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8176468"}
::
