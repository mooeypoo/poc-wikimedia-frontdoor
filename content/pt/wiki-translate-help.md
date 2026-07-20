---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/pt
sourceWiki: www.mediawiki.org
sourceRevision: "8046251"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Documentação para [Extensão: Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Tradutores** (**[página da ajuda principal](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Como traduzir](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Melhores práticas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Estatísticas e relatórios](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Garantia de qualidade](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Estatísticas do grupo de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Tradução _off-line_](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Glossário](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Administradores de tradução**

- [Como preparar uma página para tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Administração da tradução de páginas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Tradução de elementos não estruturados](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Gestão de grupos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Mover página traduzível](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Importar traduções via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Trabalhar com conjuntos de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Administradores de sistema e programadores**

- [Instalação](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Configuração](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Iniciação ao desenvolvimento](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Guia do programador](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Estender 'Translate'](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validadores](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Inseríveis](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Configuração do grupo](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Exemplo da configuração de grupo](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Memórias de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Ajudas de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Ativar conjuntos de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [Hooks de PHP](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Traduzir este modelo](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

A página principal especial da extensão, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), na sua tarefa mais comum, "ver todas as mensagens não traduzidas"

A [extensão 'Translate'](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) melhora a MediaWiki com funcionalidades essenciais para o trabalho de tradução. Esta pode ser utilizada para traduzir o conteúdo das páginas, a interface da wiki e mesmo outros produtos de programas, porque esta é utilizada em [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). A extensão 'Translate' vem com uma interface fácil de utilizar e pode separar a estrutura do conteúdo do texto a ser traduzido, mostrando apenas o texto traduzível para os tradutores, separado o conteúdo em unidades pequenas. Cada unidade é automaticamente vigiada por alterações, e os tradutores veem imediatamente o que precisa de atualização numa página específica ou por toda a wiki.

A extensão 'Translate' é utilizada para traduzir a interface do utilizador da MediaWiki e outros projetos de programa em translatewiki.net por milhares de tradutores todos os meses. Em [userbase.kde.org](http://userbase.kde.org) é utilizada para traduzir quase mil páginas de conteúdo com documentação do utilizador. É fácil começar a utilizar a extensão 'Translate', mas ao mesmo tempo ela também permite o aumento de escala e fornece relatórios avançados e funcionalidades de revisão e de fluxo de trabalho.

## Funcionalidades

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

O editor de tradução: uma mensagem com uma dica (invisível na imagem) e sugestões de dois idiomas auxiliares

**Interface:** a funcionalidade principal da extensão 'Translate' é uma interface de tradução simples mas funcional. Além das informações essenciais como definição da mensagem e documentação, você também pode consultar traduções em outras línguas. Se uma definição foi alterada, você verá as mudanças. A extensão possui algumas verificações embutidas, que podem auxiliar em erros comuns como parênteses assimétricos e variáveis sem uso. Dependendo da configuração, também há sugestões do histórico de traduções e serviços de tradução automática como Google Translate, Microsoft Bing, e Apertium.

A usabilidade da interface de tradução é melhorada com JavaScript e AJAX. O _backend_ fornece WebAPIs que podem ser utilizadas nas interfaces móveis ou interfaces adaptadas a um tipo específico de conteúdo. Também é possível exportar mensagens para tradução em outras ferramentas _off-line_ e _on-line_ que aceitam o o formato de ficheiro [Gettext po](https://en.wikipedia.org/wiki/Gettext).

**Grupos de mensagens e tarefas:** Muitos dos recursos são feitos a partir de dois conceitos básicos: grupos de mensagens e tarefas.

Um grupo de mensagens representa uma coleção de mensagens. Uma página de conteúdo seria um grupo de mensagens onde, basicamente, cada parágrafo seria uma mensagem naquele grupo. Mensagens usadas em cada extensão MediaWiki formam um grupo de mensagens na translatewiki.net - algumas extensões maiores possuem múltiplos grupos. Você também pode criar um grupo de grupos, como "todos os boletins" ou "Todas as mensagens da extensão Traduzir". Muitas das estatísticas e das tarefas funcionam com base no grupo de mensagens.

As tarefas ou, em outras palavras, diferentes listas de mensagens em um grupo, facilitam aplicações diferentes. Normalmente um tradutor recebe a lista de todas as mensagens ainda não traduzidas de um determinado grupo, mas há tarefas onde você pode revisar mensagens ou apenas obter a lista de todas as mensagens, traduzidas ou não.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Esta página especial informa do estado de tradução da cada grupo de mensagens

**Relatórios e estatísticas:** A extensão possui extensivos [recursos de relatórios](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) desde a consulta de mensagens não traduzidas de todos os grupos de mensagens de um determinado idioma até listas de tradutores por idioma com seus níveis de atividade.

**Tradução de conteúdo:** Se você já tentou traduzir o conteúdo da MediaWiki sem utilizar ferramentas especiais, você percebeu que o trabalho não rende em larga escala. As versões traduzidas ficam desatualizadas e não há métodos para vigiar mudanças na página original, então restam muitas traduções incompletas e desatualizadas sem uma visão clara do progresso geral. Muitos tradutores se sentem desmotivados quando não conseguem trabalhar com pedaços pequenos de texto. Eles não conseguem achar onde dedicar seu trabalho nem o que precisa de atualização. Os usuários também ficam confusos com informação desatualizada.

Isso é tudo resolvido com a extensão Traduzir e o seu recurso de tradução de páginas. Ele adiciona um pouco de trabalho extra às páginas a serem traduzidas, mas os benefícios compensam muito. Essencialmente, você só precisa marcar as partes da página que necessitam tradução. A extensão então divide essas partes em unidades de um parágrafo e cria um grupo de mensagem para elas. Depois disto, os tradutores podem utilizar todos os recursos descritos aqui. Também pode-se adicionar facilmente uma barra de idiomas com a tag `<languages />` ou fazer ligações irem automaticamente para a versão na linguagem preferida do usuário (apenas) se ela existir, usando ligações no formato \[\[Special:MyLanguage/Pagename]].

Para mais informações veja o tutorial [Como configurar uma página de conteúdo para tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) e a [documentação completa do recurso de tradução de páginas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Programadores:** The extension comes with built-in support for many common translation file formats, like Java properties and Gettext po files. It has an extensive set of tools, both in-wiki and on the command line, to efficiently import and export translations.

**Pesquisa:** Without a search feature, it is difficult for translators to find specific messages they want to translate. Traversing all the translations or strings of the project is inefficient. Also, translators often want to check how a specific term was translated in a certain language across the project.

This is solved by the special page [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Translators can find the messages containing certain terms in any language and filter by various criteria: this is the default. After searching, they can switch the results to the translations of said messages, for instance to find the existing, missing or outdated translations of a certain term.

## Casos de utilização

Você pode traduzir quase tudo com a extensão Translate. Naturalmente, há ferramentas especializadas para tradução de certos tipos de textos como legendas de vídeos, que são melhores para isso, mas geralmente o _Tradutor_ é muito bom para qualquer tipo de texto que possa ser dividido em mensagens do tamanho de uma palavra até um parágrafo inteiro. Mensagens longas se tornam difíceis de traduzir e são mais difíceis ainda de se trabalhar.

Os três casos de utilização primários que a extensão 'Translate' suporta são a **tradução de conteúdo**, **tradução de interface local** e **tradução de programas**. Todas elas são explicadas nas secções seguintes, com hiperligações para tutoriais e documentação de referência ou tópicos de ajuda aprofundados, quando disponíveis. Dos três casos, a tradução da interface tem sido a menos utilizada.

### Tradução do conteúdo

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

A tradução está desatualizada: as partes desatualizadas são substituídas com novo texto fonte e os tradutores podem aceder às mensagens para atualizar com um único clique

Most wikis have content they would like to be available in multiple languages. Whether just a few or hundreds of pages, it doesn't matter. In order to prevent wasting translator's time, pages should be marked for translation only when they are reasonably stable. Each change that is made afterwards can affect tens or hundreds of old translations, and the time needed to update them adds up. Especially with volunteer translators, you should be aware of this aspect, and respect the time they spend making translations and updates, avoiding unnecessary work. If you use the Translate extension to translate pages, you are already well on your way to using the translator time available in the most effective and efficient way.

The way the Translate extension splits up a page into paragraph sized units does not leave too much freedom for translators to change the content. This is usually a good thing and is ideal where continuity and consistency of content across languages is desired. It can be worked around, but in principle this way of doing translations is not generally suitable, for example, for Wikipedia articles, which usually are totally independent of each other. Even if they originally start as a translation from a different language, they usually begin living their own independent life from the original version. With _Translate_, the original page is always the main version, and new content cannot be developed in translated versions.

With these limitations in mind there are still plenty of cases where this feature is a perfect match. Most, if not all, user documentation falls into this category as well as news-like content that does not change once written. If you have the Translate extension already installed and access rights configured, try creating a page and wrapping the whole text inside `<languages />...` and follow the links, or follow the tutorial [How to prepare a page for translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Groups of pages can be further aggregated together with the [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups) page.

### Tradução da interface local nas wikis multilíngue

One thing almost every wiki has customized is the [sidebar](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). It is possible to create a message group for the custom sidebar messages and also for other local interface customisations.

One interesting expansion is the multilingual pages or templates built with the {{int:}} magic word. The [translatewiki.net](https://translatewiki.net/wiki/) main page and some Wikimedia Commons templates are good examples of this. The magic word {{int:}} is an alternative to the content translation feature and it is more suitable to mark-up heavy pages just like the translatewiki.net main page. Another nice feature is that the language of the page automatically follows the user interface language, so there is no need for a language bar, although you might want to have an interface language selector instead.

Setting this up is currently a bit more complicated than content translation and needs software configuration, but it is all covered in the tutorial [How to make an interface message group](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Tradução de programas

The Translate extension is a good fit for translating software interface messages. At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

Change tracking is also available for externally tracked files, because internally the extension uses a cached derivative version of the localisation files where the source text and its translations are stored, instead of using them directly in their original format. Translation administrators can either use the web interface or a command line interface to check new message definitions and "fuzzy" (request update of) translations when they need updating. This works regardless of the underlying file format or version control system (if any).

With simple command line tools, translation administrators can easily import even a large set of existing translations and with just one command they can export all translations in the correct format and in the correct directory structure. You can export directly to your [VCS](https://en.wikipedia.org/wiki/Version%20control%20system) repository checkout, where you can easily commit changes and new files.

## Leitura adicional e tutoriais

### Para tradutores e administradores de tradução

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Slides de uma "workshop" sobre como utilizar [Extensão: Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) na Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

Um _videocast_ em inglês dos diapositivos.

- [Como traduzir](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Tutorial]
- [Melhores práticas de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Estatísticas e reportar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Garantia de qualidade](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Estados do grupo de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[Em progresso] [Pesquisar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Tradução _off-line_](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[Em progresso] [Glossário](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Para administradores de tradução

- [Como preparar uma página para tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Tutorial]
- [Administração da tradução de páginas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Grupos de mensagens da interface (barra lateral localizada, página principal e modelos)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Tutorial]
- \[Em progresso] [Gestão do grupo de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Formato de configuração YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Como escrever a configuração YAML para os grupos de mensagens baseadas em ficheiro](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Tutorial]

### Documentos de referência para os programadores

- [Instalação](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) e [Configuração](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki - Pacote da Extensão de Idiomas](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) deverá ser suficiente na maioria dos casos.

- [Memórias de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Guia de desenvolvimento](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[Em progresso] ["Translate" explicado para os programadores](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Hooks](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[Em progresso] [Grupos de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[Em progresso] [Suporte de formato de ficheiro](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Ajudas de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Não escrito] [API de ação](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Inseríveis](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Scripts da linha de comandos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Fluxo do processo nos trabalhos da MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Descreve quais as tarefas que estão envolvidas quando uma página é marcada para tradução ou uma secção é traduzida
  - [Arquitetura de memória de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Relacionado

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - Script de integração de WikiEditor/CodeMirror para a extensão 'Translate'
- [Extensão:Notificações de Tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Tutorial de tradução geral para programadores, para utilizar em "hackathons" e formações.
- [Seletor de Idioma Universal](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Proporciona tipos de letra da Web e métodos de entrada
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – coisas em que pensar quando criar páginas ou processos nas wikis multilingue
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Adicione-se a si mesmo na lista dos tradutores técnicos atualmente ativos.

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/pt" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8046251"}
::
