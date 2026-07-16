---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/de
sourceWiki: www.mediawiki.org
sourceRevision: "8016697"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Dokumentation für [Erweiterung:Übersetzen](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Übersetzer** (**[Haupthilfeseite](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Anleitung zum Übersetzen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Beste Praktiken](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistiken und Berichte](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Qualitätssicherung](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Nachrichtengruppenstatus](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Offlineübersetzung](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Glossar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Übersetzungsadministratoren**

- [Eine Seite zur Übersetzung vorbereiten](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Seitenübersetzungsadministrator](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Unstrukturierte Elementübersetzung](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Gruppenverwaltung](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Übersetzbare Seite verschieben](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import translations via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Systemadministratoren & Entwickler**

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Konfiguration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Fange mit der Entwicklung an](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Anleitung für Entwickler](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Übersetzung erweitern](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validatoren](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Einfügbare](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Gruppenkonfiguration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Gruppenkonfigurationsbeispiel](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Übersetzungsspeicher](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Übersetzungshilfen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Dieses Banner übersetzen.](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Die Hauptspezialseite der Erweiterung, „[Special:Translate](https://www.mediawiki.org/wiki/Special:Translate)“, bei ihrer häufigsten Aufgabe: „alle nicht übersetzten Nachrichten anzeigen“

Die [Übersetzungserweiterung](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) verbessert MediaWiki durch wesentliche Funktionen, die für die Übersetzungsarbeit benötigt werden. Sie kann benutzt werden, um die Inhaltsseiten, die Benutzeroberfläche des Wikis und auch andere Software-Produkte zu übersetzen, so wie sie bei [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki) verwendet wird. Die Übersetzungserweiterung enthält eine einfach zu benutzende Übersetzungsoberfläche und erlaubt es, die inhaltliche Struktur von der zu übersetzenden Sprache zu trennen, indem es den Übersetzern nur den übersetzbaren Text anzeigt und dabei die Inhalte in überschaubare Einheiten aufteilt. Bei jeder Einheit werden automatisch die Änderungen verfolgt. Übersetzer sehen somit sofort, was auf einer bestimmten Seite oder im gesamten Wiki eine Aktualisierung benötigt.

Die Übersetzungserweiterung wird genutzt, damit mit ihr jeden Monat Hunderte von Übersetzern die Benutzeroberfläche von MediaWiki und anderen Softwareprojekten bei translatewiki.net übersetzen können. Bei [userbase.kde.org](http://userbase.kde.org) wird sie verwendet, um fast tausend Inhaltsseiten mit Benutzerdokumentation zu übersetzen. Es ist leicht, mit der Verwendung der Übersetzungserweiterung anzufangen, sie bietet darüber hinaus jedoch gleichzeitig erweiterte Berichterstattung, Überprüfung und Funktionen für den Arbeitsablauf.

## Funktionen

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Der Übersetzungseditor: eine Nachricht mit einem Hinweis (nicht im Bild sichtbar) und Vorschlägen in zwei Unterstützungssprachen

**Schnittstelle:** Die Hauptfunktion der Übersetzungserweiterung ist eine einfache, aber funktionale Übersetzungsoberfläche. Neben den wesentlichen Informationen wie Nachrichtendefinition und -dokumentation kannst du dir auch Übersetzungen in anderen Sprachen ansehen. Wenn eine Definition geändert wurde, siehst du die Änderungen. Die Erweiterung enthält einige eingebaute Kontrollen, die bei häufigen Fehlern wie unausgeglichen gesetzten Klammern und unbenutzten Variablen helfen können. Abhängig von der Konfiguration gibt es auch Vorschläge aus dem Übersetzungsspeicher und maschinelle Übersetzungsdienstleistungen wie diejenigen vom Google-Übersetzer, Microsofts Bing-Übersetzer und von Apertium.

Die Benutzerfreundlichkeit der Übersetzungsoberfläche wird durch JavaScript und AJAX verbessert. Das Backend stellt WebAPIs bereit, welche in mobilen und andere Schnittstellen für bestimmte Inhalte verwendet werden können. Es ist auch möglich, Nachrichten für Übersetzungen in andere Offline- oder Online-Tools zu exportieren, die das [GetText-po](https://de.wikipedia.org/wiki/Gettext)-Dateiformat unterstützen.

**Nachrichtengruppen und Aufgaben:** Viele der Funktionen wurden um zwei Basiskonzepte herum aufgebaut: Nachrichtengruppen und Aufgaben.

Eine Nachrichtengruppe stellt eine Sammlung an Nachrichten dar. Eine Inhaltsseite würde eine Nachrichtengruppe sein, wobei in der einfachsten Zustandsform, jeder Absatz eine Nachricht in dieser Gruppe wäre. Nachrichten in jeder MediaWiki-Erweiterung bilden eine Nachrichtengruppe auf translatewwiki.net\&nsp;– einige der größten Erweiterungen haben mehrere Nachrichtengruppen. Du kannst auch eine Gruppe aus Gruppen erstellen, wie _Alle Rundbriefe_ oder _Alle Übersetzungs-Erweiterung-Nachrichten_. Grundlegend bauen viele der Statistiken und Aufgaben auf den Nahrichtengruppen auf.

Die Aufgaben, d. h. unterschiedliche Auflistungen von Nachrichten in einer Nachrichtengruppe, erleichtern unterschiedliche Anwendungsfälle. Normalerweise erhält ein Übersetzer eine Liste aller nicht übersetzten Nachrichten in einer ausgewählten Nachrichtengruppe, aber es gibt Aufgaben, bei denen Du Nachrichten überprüfen oder nur eine Liste aller übersetzten oder nicht übersetzten Nachrichten erhalten kannst.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Diese Spezialseite zeigt den Übersetzungsstatus jeder Nachrichtengruppe an.

**Auswertung und Statistiken:** Die Erweiterung hat umfangreiche [Berichtsfunktionen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting), die von einer Anzeige nicht übersetzter Nachrichten aus allen Nachrichtengruppen einer vorgegebenen Sprache bis zu einer Liste von Übersetzern pro Sprache mit deren Aktivitätsgrad reichen.

**Inhaltsübersetzung:** Wenn du jemals versucht hast Inhalt in MediaWiki ohne Werkzeuge zu übersetzen, weißt du, dass es nicht gut klappt. Die übersetzten Versionen können überholt sein und es gibt keine Möglichkeiten Änderungen der Ursprungsseite zu verfolgen, so dass viele halbübersetzte und veraltete Übersetzungen ohne eine Übersicht über den allgemeinen Status gibt. Übersetzer fühlen sich oft überfordert, wenn sie nicht mit kleinen verdaulichen Textstückchen arbeiten können. Die Übersetzer finden sonst auch nicht woran sie arbeiten sollen oder was einer Überholung bedarf. Und der Benutzer wird durch veraltete Informationen verwirrt.

Dies alles wird von der Übersetzungserweiterung und ihrer Seitenübersetzungsfunktion gelöst. Sie fügt ein bisschen Overhead zu den Seiten hinzu, die einer Übersetzung bedürfen, aber ihre Vorteile gleichen dies aus. Eigentlich brauchst du nur die Seitenteile zu markieren, die eine Übersetzung benötigen. Die Erweiterung teilt sie in absatzgroße Einheiten und erstellt eine Nachrichtengruppe für sie. Danach können Übersetzer all die oben erwähnten Funktionen nutzen. Zusätzlich kannst du leicht eine Sprachleiste mit dem `<languages />`-Tag hinzufügen oder Links anlegen, die automatisch zu der vom Benutzer bevorzugten Sprachversion verlinken (nur) wenn sie existiert, indem du Links der Form \[\[Special:MyLanguage/Pagename]] einfügst.

Weitere Informationen findest Du in dem Tutorial [Wie man eine Inhaltsseite für Übersetzungen einrichtet](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) und in der [detaillierten Dokumentation der Seitenübersetzungsfunktion](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Entwickler:** Die Erweiterung ist erhältlich mit eingebauter Unterstützung für viele übliche Übersetzungsdateiformate wie [Java-Properties-Dateien](https://en.wikipedia.org/wiki/de:Java-Properties-Datei) und [Gettext-po-Dateien](https://en.wikipedia.org/wiki/de:GNU%20gettext). Sie hat ein umfangreiches Instrumentarium, sowohl im Wiki als auch auf der Kommandozeile, um damit effizient Übersetzungen zu im- und exportieren.

"Suche:" Ohne eine Suchfunktion ist es für Übersetzer schwierig spezifische Nachrichten zu finden, die sie übersetzen möchten. Das durchsuchen aller Übersetzungen nach Zeichenfolgen ist nicht sehr effizient. Des Weiteren schauen Übersetzer oft nach wie bestimmte Wörter in anderen Sprachen übersetzt wurden im ganzen Projekt.

Dies wird durch die spezielle Seite [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations) gelöst. Übersetzer können die Nachrichten mit bestimmten Begriffen in einer beliebigen Sprache finden und nach verschiedenen Kriterien filtern: Dies ist die Standardeinstellung. Nach der Suche können sie die Ergebnisse auf die Übersetzungen dieser Nachrichten umstellen, um beispielsweise die vorhandenen, fehlenden oder veralteten Übersetzungen eines bestimmten Begriffs zu finden.

## Anwendungsfälle

Mit der Erweiterung "Translate" kannst Du fast alles übersetzen. Natürlich gibt es spezielle Werkzeuge für die Übersetzung bestimmter Arten von Inhalten, wie z. B. Video-Untertitel, die mit diesen Werkzeugen besser erstellt werden können. Im Allgemeinen funktioniert "Übersetzen" jedoch sehr gut mit jeder Art von Text, der in Nachrichten mit einer Länge von einem Wort bis zu einem großen Absatz aufgeteilt werden kann. Zu lange Textabschnitte sind schwer zu übersetzen und schwerer zu bearbeiten.

Die drei Hauptanwendungsfälle, die die Translate-Erweiterung unterstützt, sind die **Übersetzung von Inhalten**, die **Übersetzung von lokalen Schnittstellen** und die **Übersetzung von Software**. Alle diese Themen werden in den folgenden Abschnitten behandelt. Sie enthalten Links zu Lernprogrammen und Verweisen auf Dokumentationen oder ausführliche Tutorials, sofern verfügbar. Von den drei Anwendungsfällen wurde die Schnittstellenübersetzung am wenigsten genutzt.

### Übersetzung von Inhalt

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Die Übersetzung ist veraltet: Veraltete Teile werden durch neuen Quelltext ersetzt und Übersetzer können die zu aktualisierenden Nachrichten mit einem einzigen Klick erreichen.

Die meisten Wikis haben Inhalte, die sie in anderen Sprachen zur Verfügung stellen wollen. Ob es nur einige hundert Seiten sind spielt keine Rolle. Um die Zeit von Übersetzern nicht zu verschwenden, sollten nur ausreichend stabile Seiten zum übersetzen markiert werden. Jede Änderung die nachträglich gemacht wurde kann zehn oder hunderte von alten Übersetzungen betreffen und die Zeit zum aktualisieren summiert sich. Besonders bei freiwilligen Übersetzern, solltest du dir dieses Aspekts bewusst sein und die Zeit respektieren, die sie dazu verwenden Übersetzungen und Aktualisierungen zu machen, damit unnötige Arbeit vermieden werden kann. Wenn du die Übersetzungserweiterung verwendest um Seiten zu übersetzen, bist du bereits auf bestem Wege die Übersetzerzeit auf die effektivste und effizienteste Art zu nutzen.

Die Art und Weise, wie die Erweiterung "Übersetzen" eine Seite in Einheiten von Absatzgröße aufteilt, lässt den Übersetzern nicht zu viel Freiheit, den Inhalt zu ändern. Dies ist normalerweise eine gute Sache und ideal, wenn Kontinuität und Konsistenz des Inhalts über mehrere Sprachen hinweg gewünscht werden. Es kann umgangen werden, aber im Prinzip ist diese Art der Übersetzung nicht generell geeignet, zum Beispiel für Wikipedia-Artikel, die normalerweise völlig unabhängig voneinander sind. Auch wenn sie ursprünglich aus einer anderen Sprache übersetzt wurden, beginnen sie normalerweise, ein von der Originalversion unabhängiges Leben zu führen. Mit _Übersetzen_ ist die Originalseite immer die Hauptversion, und neue Inhalte können in übersetzten Versionen nicht entwickelt werden.

Angesichts dieser Einschränkungen gibt es immer noch viele Fälle, bei denen diese Funktion perfekt anwendbar ist. Die meisten, wenn nicht alle Benutzerdokumentationen fallen in diese Kategorie, ebenso wie newsähnliche Inhalte, die sich nach dem Schreiben nicht ändern. Wenn Du die Erweiterung Translate bereits installiert und die Zugriffsrechte konfiguriert hast, versuche eine Seite zu erstellen und den gesamten Text in `<languages />...` zu setzen, und folge den Links, oder folge dem Tutorial ["So bereitest Du eine Seite für die Übersetzung vor"](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Gruppen von Seiten können zusammen mit der [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups) -Seite weiter aggregiert werden.

### lokale Übersetzung der Benutzeroberfläche in mehrsprachigen Wikis

Eine Sache, die fast jedes Wiki angepasst hat, ist die [Seitenleiste](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Es ist möglich, eine Nachrichtengruppe für die benutzerdefinierten Nachrichten in der Seitenleiste sowie für andere Anpassungen der lokalen Benutzeroberfläche zu erstellen.

Eine interessante Erweiterung sind die mehrsprachigen Seiten oder Vorlagen, die mit dem Zauberwort {{int:}} erstellt wurden. Die [translatewiki.net](https://translatewiki.net/wiki/)-Hauptseite und einige Wikimedia Commons-Vorlagen sind gute Beispiele dafür. Das Zauberwort {{int:}} ist eine Alternative zur Inhaltsübersetzung und besser geeignet, um komplizierte Seiten wie die translatewiki.net-Hauptseite mit mark-ups zu versehen. Ein weiteres nützliches Feature ist, dass die Sprache der Seite automatisch der Sprache der Benutzeroberfläche folgt, sodass keine Sprachleiste erforderlich ist. Möglicherweise möchtest Du stattdessen eine Sprachauswahl für die jeweilige Benutzeroberfläche.

Das Einrichten ist derzeit etwas komplizierter als das Übersetzen von Inhalten und erfordert eine Softwarekonfiguration. Alles wird jedoch im Tutorial [So erstellst Du eine Schnittstellen-Nachrichtengruppe](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) behandelt.

### Software-Übersetzung

Die Erweiterung "Übersetzen" eignet sich gut zum Übersetzen von Software-Schnittstellennachrichten. Bei translatewiki.net wird sie verwendet, um Dutzende von Softwareprodukten angefangen von Spielen bis zu Webanwendungen zu übersetzen. Die Übersetzungserweiterung unterstützt das Lesen und Aktualisieren von Übersetzungen aus und in gängige Formate, die in der Webentwicklung verwendet werden, einschließlich [Java Properties](https://en.wikipedia.org/wiki/.properties)-, [Gettext](https://en.wikipedia.org/wiki/Gettext)- und [Yaml](https://en.wikipedia.org/wiki/YAML)-Dateien.

Eine Änderungsnachverfolgung ist auch für extern nachverfolgte Dateien verfügbar, da die Erweiterung intern eine zwischengespeicherte, abgeleitete Version der lokalen Dateien verwendet, in der der Quelltext und seine Übersetzungen gespeichert werden, anstatt sie direkt im Originalformat zu verwenden. Übersetzungsadministratoren können entweder die Webschnittstelle oder eine Befehlszeilenschnittstelle verwenden, um neue Nachrichtendefinitionen und "Fuzzy" -Übersetzungen (die eine Aktualisierung erfordern) zu überprüfen, wenn sie aktualisiert werden müssen. Dies funktioniert unabhängig vom zugrunde liegenden Dateiformat oder Versionskontrollsystem (falls vorhanden).

Mit einfachen Befehlszeilentools können Übersetzungsadministratoren problemlos sogar ein großes Paket vorhandener Übersetzungen importieren und mit nur einem Befehl alle Übersetzungen im richtigen Format und in die richtige Verzeichnisstruktur exportieren. Du kannst direkt in Dein [VCS](https://en.wikipedia.org/wiki/en:Version%20control%20system)-Repository exportieren, um Änderungen und neue Dateien leicht einzutragen.

## weiterführende Lektüre und Anleitungen

### für Übersetzer und Übersetzungsadministratoren

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Folien eines Workshops zur Verwendung von [Erweiterung:Übersetzen](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) bei Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [Anleitung zum Übersetzen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Übung]
- [optimale Vorgehensweisen bei der Übersetzung](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistiken und Berichte](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Qualitätssicherung](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Nachrichtengruppenstatus](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[In Bearbeitung] [Suche](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Offline-Übersetzung](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[In Vorbereitung] [Glossar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### für Übersetzungsadministratoren

- [Eine Seite zur Übersetzung vorbereiten](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Anleitung]
- [Übersetzungsadministration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Oberflächennachrichtengruppen (lokalisierte Seitenleiste, Hauptseite und Vorlagen)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Anleitung]
- \[In Vorbereitung] [Nachrichtengruppenmanagement](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML-Konfigurationsformat](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [eine YAML-Konfiguration für dateibasierte Nachrichtengruppen schreiben](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Anleitung]

### Referenzdokumente für Entwickler

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) und [Konfiguration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki-Sprachenerweiterungspaket](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) sollte in den meisten Fällen genügen.

- [Übersetzungsspeicher](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Anleitung für Entwickler](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[In Vorbereitung] [Erläuterung der Übersetzungserweiterung für Entwickler](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Hooks](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[In Vorbereitung] [Nachrichtengruppen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[In Vorbereitung] [Dateiformatunterstützung](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Übersetzungshilfen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[noch nicht geschrieben] [action API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Insertables](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Kommandozeilenwerkzeuge](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Arbeitsabläufe in MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Beschreibt, welche Arbeitsschritte nötig sind, um eine Seite zur Übersetzung zu markieren oder einen Abschnitt zu übersetzen
  - [Funktionsweise des Übersetzungsspeichers](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Ähnliches

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Erweiterung: Übersetzungsbenachrichtigungen](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Allgemeines Lokalisierungstutorial für Entwickler, zur Verwendung bei Hackathons und Trainings
- [Universelle Sprachauswahl (ULS)](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Bietet Web-Schriftarten und Eingabemethoden
- [m:Translatability Übersetzbarkeit](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – Dinge, über die Du nachdenken solltest, wenn Du Seiten oder Prozesse in mehrsprachigen Wikis erstellst
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Füge Dich der Liste der derzeit aktiven technischen Übersetzer hinzu

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/de" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016697"}
::
