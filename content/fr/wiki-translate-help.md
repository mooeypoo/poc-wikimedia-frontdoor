---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/fr
sourceWiki: www.mediawiki.org
sourceRevision: "8016706"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Documentation pour [Extension:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Traducteurs** (**[page d'aide principale](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Comment traduire](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Les bonnes pratiques](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistiques et rapports](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Assurance qualité](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [États des groupes de messages](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Traductions hors-ligne](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Glossaire](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Administrateurs de traduction**

- [Comment préparer une page à traduire](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Administration de la traduction des pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Traduction des éléments non structurés](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Gestion de groupe](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Renommer une page traductible](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Importer des traductions via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Travailler avec les paquets de messages](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Administrateurs système et développeurs**

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Commencer par le développement](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Guide du développeur](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Enrichir Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Valideurs](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Eléments insérables](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Configurer des groupes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Exemple de configuration de groupes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Mémoires de traduction](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Aides à la traduction](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Activer les paquets de messages](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [Accroches PHP](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Traduire ce modèle](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

La page spéciale principale de l’extension, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), permet globalement de « voir tous les messages non traduits ».

L’[extension Translate ](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)étend MediaWiki avec des fonctionnalités essentielles nécessaires pour effectuer le travail de traduction. Elle peut être utilisée pour traduire les pages de contenu, l’interface du wiki ou même d’autres logiciels, comme sur [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). L’extension Translate apporte une interface de traduction facile à utiliser et permet de dissocier la structure du contenu textuel devant être traduit. Elle ne montre aux traducteurs que le texte à traduire, après découpage du contenu en petites unités plus simples à gérer. Les modifications de chaque unité sont automatiquement suivies et les traducteurs voient immédiatement ce qui doit être mis à jour sur une page spécifique ou dans le wiki.

L’extension Translate est utilisée par des centaines de traducteurs chaque mois sur translatewiki.net pour traduire l’interface utilisateur de MediaWiki ainsi que d’autres projets de logiciels. Sur [userbase.kde.org](http://userbase.kde.org), elle est utilisée pour traduire près d’un millier de pages de contenu relatives à la documentation utilisateur. Il est facile de commencer à utiliser l’extension Translate ; néanmoins elle permet aussi une utilisation poussée et fournit des fonctionnalités avancées de compte-rendu, de relecture et de flux de travail.

## Fonctionnalités

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

L’éditeur de traduction : un message avec un conseil (non visible sur l’image) et des suggestions issues de deux langues d’assistance.

**Interface :** La fonctionnalité principale de l’extension Traduction est une interface de traduction simple mais efficace. En plus des informations essentielles telles que la définition du message et sa documentation, vous pouvez également voir les traductions dans d’autres langues. Si une définition a changé, vous pourrez voir les modifications. L’extension fournit un mécanisme de vérification intégré, qui peut permettre de détecter des erreurs fréquentes, comme des parenthèses non fermées ou des variables non utilisées. Selon le paramétrage, il peut également y avoir des suggestions provenant de la mémoire de traduction ou de services de traduction automatisée comme ceux de Google Translate, Bing Translator de Microsoft ou Apertium.

La convivialité de l’interface de traduction est améliorée avec JavaScript et AJAX. Le logiciel permet aussi d’utiliser des API Web pour les interfaces mobile ou spécifiques à certains types de contenus. Il est possible également d’exporter les messages à traduire dans d’autres outils en ligne ou hors ligne qui acceptent le format de fichier [Gettext po](https://fr.wikipedia.org/wiki/Gettext).

**Groupes de messages et tâches :** La plupart des fonctionnalités sont conçues autour de deux principes fondamentaux : les groupes de messages et les tâches.

Un groupe de messages représente un ensemble de messages. Une page de contenu correspond à un groupe de messages où, dans le cas le plus simple, chaque paragraphe est un message de ce groupe. Les messages utilisés dans chaque extension MediaWiki forment un groupe de messages sur translatewiki.net ; certaines des extensions les plus importantes ont plusieurs groupes. Il est aussi possible de faire un groupe de groupes, tel que _Toutes les newsletters_ ou _Tous les messages de l’extension Translate_. Les tâches et un grand nombre de statistiques sont basés sur les groupes de messages.

Les tâches, ou en d’autres termes les différentes listes de messages dans un groupe de messages, facilitent divers scénarios d’utilisation. Normalement un traducteur obtient une liste de tous les messages non traduits dans un groupe de messages sélectionné, mais il y a aussi des tâches où vous pouvez vérifier les messages ou juste obtenir une liste de tous les messages, traduits ou non.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Cette page spéciale indique l’état de traduction de chaque groupe de messages.

**Compte-rendu et statistiques :** L’extension a plusieurs [fonctionnalités de compte-rendu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) allant d’une vue des messages non traduits dans tous les groupes de messages d’une langue donnée à des listes de traducteurs par langue avec leur niveau d’activité.

**Traduction de contenu :** Si vous avez déjà essayé de traduire du contenu dans MediaWiki sans aucun outil, vous savez que cela ne fonctionne pas. Les versions traduites deviennent obsolètes et il n'y a aucun moyen de suivre les modifications apportées à la page principale. Il y a donc de nombreuses traductions à moitié traduites et obsolètes, sans que l'on puisse avoir un aperçu clair de l'état général. Les traducteurs se sentent souvent découragés lorsqu'ils ne peuvent pas travailler avec de petits morceaux de texte gérables. Les traducteurs ne trouvent pas sur quoi travailler ou ce qui doit être mis à jour. Les utilisateurs sont également déroutés par des informations obsolètes.

Tout cela est résolu par l’extension Translate et sa fonctionnalité de traduction de page. Cela ajoute un peu de travail supplémentaire sur les pages nécessitant une traduction, mais cela est peu par rapport aux bénéfices apportés. En substance, vous devez marquer uniquement les parties de la page qui nécessitent une traduction. L’extension découpe alors ces parties en unités de la taille d’un paragraphe et crée un groupe de messages pour ceux-ci. Après cela les traducteurs peuvent utiliser toutes les fonctionnalités décrites plus haut. De plus, vous pouvez ajouter facilement une barre de langues avec la balise `<languages />` ou avoir des liens qui amènent automatiquement l’utilisateur vers sa version linguistique préférée (uniquement) lorsque celle-ci existe, en utilisant des liens de la forme \[\[Special:MyLanguage/Pagename]].

Pour plus d’informations, vous pouvez vous reporter au tutoriel [Comment mettre en place une traduction pour une page de contenu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) et à la [documentation approfondie sur la fonctionnalité de traduction de page](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Développeurs :** L’extension fournit un support pour plusieurs formats de fichiers de traduction courants, comme les propriétés Java ou les fichiers Gettext po. Elle comporte un grand nombre d’outils, tant sur l’interface wiki qu’en ligne de commande, pour importer et exporter efficacement les traductions.

**Recherches:** sans un critère de recherche, il est difficile aux traducteurs de trouver des messages spécifiques à traduire. Il n'est pas efficace de parcourir toutes les traductions ou les chaînes de caractères d'un projet. En plus, les traducteurs veulent souvent vérifier comment on traduit un terme particulier dans une langue donnée dans tout le projet.

Ceci se résout avec la page spéciale [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Les traducteurs peuvent trouver les messages contenant certains termes dans n'importe quelle langue et filtrer par divers critères : ceci est le fonctionnement par défaut. Après la recherche, ils peuvent basculer les résultats pour la traduction desdits messages; par exemple, pour trouver les traductions existantes, manquantes ou obsolètes d'un certain terme.

## Scénarios d’utilisation

Vous pouvez traduire presque tout avec l’extension Translate. Naturellement, il y a des outils spécialisés pour la traduction de certains types de contenus comme les sous-titres vidéo qui sont bien mieux réalisés avec ces outils, mais en général _Translate_ fonctionne très bien avec n’importe quelle sorte de textes qui peuvent être découpés en messages avec des longueurs allant d’un mot à un grand paragraphe. Les messages plus longs deviennent moins pratiques à traduire et il est juste plus difficile de travailler avec eux.

Les trois principaux scénarios d’utilisation prévus par l’extension Translate sont la **traduction de contenu**, la **traduction de l’interface locale** et la **traduction de logiciel**. Chacun d’eux est traité dans les sections suivantes avec des liens vers des tutoriels, une documentation de référence ou de l’aide approfondie par thème là où c’est nécessaire. Parmi les trois cas d'utilisation, la traduction d'interface a été le moins utilisé.

### Traduction de contenu

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

La traduction n’est pas à jour : les parties obsolètes sont par conséquent remplacées par le nouveau texte source et les traducteurs peuvent accéder aux messages à mettre à jour en un seul clic.

La plupart des wikis ont du contenu qu’ils aimeraient rendre disponible dans plusieurs langues. Qu’il y ait juste quelques pages ou plusieurs centaines ne change rien. De façon à éviter de faire perdre du temps aux traducteurs, les pages ne devraient être marquées pour la traduction que lorsqu’elles sont dans un état relativement stable. Chaque changement qui est fait après peut affecter des dizaines ou centaines de vieilles traductions et le temps requis pour les mettre à jour s’additionne. En particulier avec des traducteurs volontaires, vous devez être attentif à cet aspect et respecter le temps qu’ils consacrent à faire les traductions et les mises à jour en évitant le travail inutile. Si vous utilisez l’extension Translate pour traduire des pages, vous êtes sur la bonne voie pour rendre effectif et efficace le temps que les traducteurs consacrent.

La façon dont l’extension Translate découpe une page en unités de la taille d’un paragraphe ne laisse pas beaucoup de liberté aux traducteurs pour changer le contenu. Cela est généralement une bonne chose et est idéal là où la continuité et la consistance du contenu entre langues est désirée. Cela peut être contourné, mais en principe cette façon de faire les traductions n’est pas appropriée par exemple pour les articles Wikipédia, qui sont généralement totalement indépendants les uns des autres. Même s’ils commencent par une traduction depuis une autre langue, ils vivent généralement leur vie propre indépendamment de la version originelle. Avec _Translate_, la page originelle est toujours la version principale et on ne peut pas développer de nouveau contenu dans les versions traduites.

En gardant ces limitations à l’esprit, il y a de nombreux cas où cette fonctionnalité convient parfaitement. La plupart de la documentation utilisateur, sinon toute, rentre dans cette catégorie ainsi que les contenus de type actualités qui ne changent pas une fois écrits. Si vous avez déjà installé l’extension Traduire et que les droits d’accès sont configurés, essayez de créer une page et d’inclure le texte entre des balises `<languages />...` et suivez les liens, ou suivez le tutoriel [Comment préparer une page pour la traduction](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Il est possible de regrouper des pages entre-elles avec la page [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups) .

### Traduction de l’interface locale de wikis multilingues

Une chose que la plupart des wikis ont personnalisé est la [barre latérale](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Il est possible de créer un groupe de messages pour les messages personnalisés de la barre latérale ainsi que pour les autres personnalisations de l’interface locale.

Une extension intéressante à cela est pour les pages ou modèles multilingues construits sur le mot magique {{int:}}. La page d’accueil de [translatewiki.net](https://translatewiki.net/wiki/) et quelques modèles sur Wikimedia Commons en sont de bons exemples. Le mot magique {{int:}} est une alternative à la fonctionnalité de traduction de contenu et est plus adaptée à suivre des pages très demandées comme la page d’accueil de translatewiki.net. Une autre fonctionnalité intéressante est que la langue de la page s’accorde automatiquement avec celle de l’interface utilisateur; il n’y a alors pas besoin d’une barre de langues, bien que vous pourriez alors envisager d’avoir un sélecteur de la langue de l’interface.

Mettre cela en place est un peu plus compliqué que la traduction de contenu et cela requiert une configuration du logiciel, mais tout cela est traité dans le tutoriel [Comment faire un groupe de messages de l’interface](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Traduction de logiciels

L’extension Translate convient bien pour la traduction des messages d’interfaces de logiciels. À translatewiki.net, il est utilisé pour traduire des dizaines de logiciels de jeux vers des applications Web. L'extension Translate prend en charge la lecture et la mise à jour des traductions depuis et vers les formats courants utilisés dans le développement Web, notamment [propriétés Java](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) et les fichiers [Yaml](https://en.wikipedia.org/wiki/YAML).

Le suivi des changements est aussi disponible pour les fichiers gérés à l’extérieur car l’extension enregistre et utilise en interne une version dérivée des fichiers de localisation où le texte source et ses traductions sont stockées, au lieu de les utiliser directement dans leur format original. Les administrateurs de traduction peuvent utiliser au choix l’interface web ou une interface en ligne de commande pour vérifier les nouvelles définitions de messages et "invalider" (demander la mise à jour de) les traductions lorsqu’une mise à jour est nécessaire. Cela fonctionne quel que soit le format de fichier sous-jacent ou le logiciel de gestion de versions (s’il y en a un).

Avec des outils en ligne de commande simples, les administrateurs de traduction peuvent importer facilement de grands jeux de traductions existantes et une seule commande peut exporter toutes les traductions dans le format correct et dans une arborescence de dossiers spécifiée. Vous pouvez exporter directement vers votre répertoire local suivi par le logiciel de gestion de versions ([VCS](https://en.wikipedia.org/wiki/en:Version%20control%20system)) où vous pourrez soumettre facilement les changements et les nouveaux fichiers.

## Lectures complémentaires et tutoriels

### Pour les traducteurs et les administrateurs de traduction

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Supports d'une réunion de travail sur la manière d'utiliser l'[Extension:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) du Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

Vidéo en anglais du diaporama.

- [Comment traduire](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Tutoriel]
- [Bonnes pratiques de traduction](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistiques et compte-rendu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Assurance qualité](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [États de groupe de messages](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[En cours] [Rechercher](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Traduction hors-ligne](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[En cours] [Glossaire](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Pour les administrateurs de traduction

- [Comment préparer une page pour la traduction](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Tutoriel]
- [Administration de la traduction des pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Groupes de messages de l’interface (barre latérale localisée, page d’accueil et modèles)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Tutoriel]
- \[En cours] [Gestion des groupes de messages](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Format de configuration YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Comment écrire une configuration YAML pour les groupes de messages basés sur des fichiers](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Tutoriel]

### Documents de référence pour les développeurs

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) et [Configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - Le [Modules MediaWiki d'extension des langues](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) est généralement suffisant.

- [Mémoire de traduction](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Guide du dévelopeur](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[En cours] [La traduction expliquée aux développeurs](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Points d’accroche](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[En cours] [Groupes de messages](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[En cours] [Support des formats de fichiers](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Aides à la traduction](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Non écrit] [API d'action](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Éléments insérés (_insertables_)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Scripts en ligne de commande](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Flux de traitement des tâches MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Décrit les tâches impliquées lorsqu'une page ou une section sont marquées _A traduire_
  - [Architecture de la mémoire de traduction](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Pages liées

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - Script d'intégration de WikiEditor et CodeMirror pour l'extension Translate
- [Extension:TranslationNotifications](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Tutoriel général sur la localisation pour les développeurs, à utiliser lors des hackathons ou des sessions d’apprentissage
- [Sélecteur universel de langues](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Fournit des fontes web et des méthodes d’entrée
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – choses auxquelles penser quand vous créez des pages ou des processus sur des wikis multilangues
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Ajoutez-vous à la liste des traducteurs techniques actuellement actifs

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/fr" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016706"}
::
