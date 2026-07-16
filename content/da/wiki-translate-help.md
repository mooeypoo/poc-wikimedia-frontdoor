---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/da
sourceWiki: www.mediawiki.org
sourceRevision: "8016696"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Hjælp til [Translate](https://www.mediawiki.org/wiki/Extension:Translate)-udvidelsen

**Oversættere** (**[main help page](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Hvordan man oversætter](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Bedste oversættelses-øvelser](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistik og rapportering](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kvalitetssikring](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Meddelelsesgruppe-statistik](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Offline oversættelse](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Ordbog](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Oversættelsesadministratorer**

- [Hvordan man forbereder en side til oversættelse](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Sideoversættelses-administration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Oversættelse af ustrukturerede elementer](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Gruppe-styring](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Move translatable page](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import translations via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Systemadminer og udviklere**

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Konfiguration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Getting started with development](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Developer guide](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Komponenter](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validators](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Insertables](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Group configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Group configuration example](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Translation memories](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Translation aids](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Oversæt denne skabelon](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Den vigtigste specialside til udvidelsen, "[Special:Translate](https://www.mediawiki.org/wiki/Special:Translate)" i sin mest almindelige form, "se alle uoversatte beskeder"

[Translate-udvidelsen](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) forbedrer MediaWiki med vigtige funktioner, der kræves til at udføre oversættelsesarbejde. Den kan bruges til at oversætte indholdssider, wikiens grænseflade og endda andre computerprogrammer, efter den bruges på [translatewiki.net](https://www.mediawiki.org/wiki/$twn?action=edit\&redlink=1). Translate-udvidelsen leveres med en letanvendelig oversættelsesgrænseflade og kan skille indholdsstruktur fra det tekstindhold, som skal oversættes, og viser kun oversætterne tekst til oversættelse, som er opdelt i håndterlige enheder. Hver enhed sporer automatisk ændringer og og oversætterne ser straks, hvad der skal opdateres på en bestemt side eller på hele wikien.

Translate-udvidelsen bruges hver måned af hundredevis af oversættere til at oversætte brugergrænsefladen i MediaWiki eller andre software-projekter på translatewiki.net. På [userbase.kde.org](http://userbase.kde.org) anvendes det til at oversætte næste tusind indholdsider med brugerdokumentation. Det er let at bruge Translate-udvidelsen, men samtidig opskalerer den og giver avancerede funktionaliteter til rapportering, revision og arbejdsprocesser.

## Funktioner

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Oversættelseseditoren: en meddelelse med et tip (ikke synligt på billedet) og forslag fra to andre hjælpesprog

**Grænsesnit:** Hovedfunktionen i Translate-tillægget er et enkelt men endnu funktionellt oversættelsesgrænsesnit. Udover væsentlige oplysninger som beskeddefinering og dokumentation kan du også se oversættelser til andre sprog. Hvis en definition er ændret, vil du se ændringerne. Udvidelser leveres med nogle indbyggede kontroller, som kan hjælpe med almindelige fejl som ubalancerede parenteser og ubrugte variabler. Afhængigt af konfigurationen findes der også forslag fra oversættelses-hukommelsen og maskinoversættelsestjenester som Google Translate, Microsoft's Bing Translator og Apertium.

Anvendeligheden af oversættelsesfladen er forbedret med JavaScript og AJAX. Motoren omfatter WebAPIer som kan bruges i mobile brugergrænseflader eller grænserflader, der er skræddersyet til bestemte slags indhold. Det er også muligt at eksportere beskeder til oversættelse i andre off- line og in-line værktøjer, som accepterer filformatet [Gettext po](https://en.wikipedia.org/wiki/Gettext) .

**Meddelelsesgrupper og opgaver:** Mange af funktionerne er bygget op omkring to grundbegreber: beskedgrupper og opgaver.

En beskedgruppe repræsenterer en samling af beskeder. En indholdsside ville være en beskedgruppe, hvor hvert afsnit i den enkleste form, ville være en besked i gruppen. Beskeder, der anvendes i en MediaWiki udvidelse, danner en beskedgruppe på [translatewiki.net](https://www.mediawiki.org/wiki/Translatewiki.net/da) - nogle få af de største udvidelser har flere grupper. Du kan også lave en gruppe af grupper, som for eks. _Alle nyhedsbreve_ eller _Alle oversættelseudvidelses-beskeder_. Mange statistikker og ​​opgaver fungerer på beskedgruppe-basis.

Opgaverne, eller med andre ord forskellige lister med beskeder i en beskedgruppe, letter brugen af forskellige scenarier. Normalt får en oversætter en liste over alle uoversatte beskeder i en valgt beskedgruppe, men der er opgaver, hvor du kan gennemse beskeder eller bare få en liste over alle beskederne, oversatte eller ej.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Denne specialside rapporterer oversættelsesstatus for hver beskedgruppe

**Rapportering og statistik:** Udvidelsen har omfattende [rapporteringsfunktioner](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting), der spænder fra visning af uoversatte beskeder på tværs af alle beskedgrupper på et bestemt sprog, til lister over oversættere for hvert enkelt sprog samt deres aktivitetsniveau.

**Indholds-oversættelse:** Hvis du nogensinde har prøvet at oversætte indhold i MediaWiki uden brug af værktøj, ved du at det ikke skalerer. De oversatte versioner bliver forældede, og der er ingen måde at spore ændringer tilbage til master-siden, så der er mange halv-oversatte og forældede oversættelser uden et klart overblik over den samlede status. Oversættere føler sig ofte modløse, når de ikke kan arbejde med små overskuelige tekststykker. Oversætterne finder ikke ud af, hvad de skal arbejde med eller hvad der kræver opdatering. Brugerne bliver også forvirrede pga. af forældet information.

Dette kan alt sammen løses med Translate-udvidelsen og dens side-oversættelsesfunktion. Den tilføjer en lille linje i toppen af siderne, der har brug for oversættelse, men fordelene opvejer langt dette. Kort fortalt skal du bare markere de afsnit på siden, der behøver oversættelse. Udvidelsen deler derefter dem op i afsnits-inddelte enheder og opretter en beskedgruppe til dem. Derefter kan oversættere bruge alle de funktioner, der er beskrevet ovenfor. Desuden kan der nemt indsættes en sproglinje med `<languages />`-mærket eller links, der automatisk henviser til brugerens foretrukne sprogversion (hvis den eksisterer), når linket har formen \[\[Special:MyLanguage/Pagename]].

Find flere oplysninger i [Sådan sætter du en indholdsside op til oversættelse](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) og [dybtgående dokumentation af side-oversættelsesfunktionen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Udviklere:** Udvidelsen har en indbygget understøttelse af mange almindelige oversættelses-filformater, såsom Java egenskaber og Gettext po-filer. Den har et omfattende sæt værktøjer, både i wikien og på kommandolinjen, til effektivt at importere og eksportere oversættelser.

**Søgning:** Uden en søgedunktion er det vanskeligt for oversættere at finde de bestemte beskeder, der skal oversættes. Gennemgang af alle oversættelser eller strenge i projektet er ikke effektivt. Oversættere vil desuden ofte kontrollere, hvordan en et bestemt udtryk oversættes til et andet sprog gennem hele projektet.

Dette løses på specialsiden [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Oversættere kan finde de beskeder, der indeholder bestemte udtryk på et sprog og filtrere det efter forskellige kriterier: dette er standard. Efter søgningen kan de ændre resultaterne til oversættelse af de nævnte beskeder, fx for at finde eksisterende, manglende forældede oversættelser af et bestemt udtryk.

## Bruger-scenarier

Du kan oversætte næsten alt med Translate-udvidelsen. Naturligvis er der specialiserede værktøjer til oversættelse af visse slags tekster, såsom videoundertekster, der bedre kan gøres med disse værktøjer, men generelt fungerer _Translate_ meget godt med enhver form for tekst, der kan opdeles i meddelelser med længde spændende fra et ord op til et stort afsnit. Længere beskeder bliver besværlige at oversætte og er sværere at arbejde med.

De tre primære brugertilfælde som Translate-udvidelsen understøtter er **indholds-oversættelse**, **lokal grænseflade oversættelse** og **software oversættelse**. De er alle beskrevet i de følgende afsnit, med links til vejledninger og til reference-dokumentation eller dybtgående emne-hjælp, hvis det findes. Af de tre brugertilfælde er grænseflade-oversættelsen blevet benyttet mindst.

### Indholds-oversættelse

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Oversættelsen er forældet: forældede dele er skiftet ud med ny kildetekst og oversættere kan få opdateret beskederne med ét enkelt klik

De fleste wikier har indhold, der ønskes tilgængeligt på flere sprog. Det kan være nogle enkelte, eller hundredvis af sider. For at undgå at spilde oversætternes tid, bør siderne kun markeres til oversættelse, når de er rimeligt stabile. Enhver senere ændring kan påvirke få eller måske hundredeis af ældre oversættelser, og tiden der behøves til opdatering løber op. Især med frivillige oversættere bør du være opmærksom på dette og respektere den tid, de bruger på oversættelser og opdateringer, og undgå at pålægge dem unødvendigt arbejde. Hvis du bruger Translate-udvidelsen til oversættelse af sider, er du allerede godt på vej til at bruge den tilgængelige oversættertid på den mest effektive måde.

Den måde ,Translate-udvidelsen opdeler en side i afsnits-enheder på, levner ikke oversætterne megen frihed til at ændre indholdet. Dette er normalt en god ting, og er ideelt hvor kontinuitet og sammenhæng i indhold på tværs af sprog er ønskeligt. Det kan omgås, men principielt er denne måde at oversætte på generelt uegnet, for eksempel i Wikipedia-artikler, der normalt er helt uafhængige af hinanden. Selv hvis de oprindeligt er startet som oversættelse fra et andet sprog, begynder de normalt at leve deres eget liv uafhængigt af den oprindelige version. Med _Translate_, er den oprindelige side altid den vigtigste version, og det nyr indhold kan ikke udvikles i oversatte versioner.

Med disse begrænsninger i baghovedet er der stadig masser af tilfælde, hvor denne funktion er formålstjenlig. Brugerdokumentation tilhører næsten altid denne kategori, ligesom nyhedslignende indhold, der ikke ændrer sig, når det er skrevet. Hvis du allerede har installeret Translate-udvidelsen og konfigureret adgangsrettighederne, kan du prøve at oprette en side og pKKW hele teksten insd i `<languages />...` og følg linkene, eller følg vejledningen [Sådan forbereder du en side til oversættelse](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Grupper af sider kan samles yderligere med [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups)-siden.

### Lokal brugerflade-oversættelse i flersprogede wikier

Noget som næsten alle wikier har tilpasset, er [sidebjælken](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Det er muligt at oprette en beskedgruppe til brugerdefinerede sidebjælke-meddelelser samt andre andre lokale grænseflade-tilpasninger.

En intressant ekspansion er flerspråkiga sider eller mønstre som bygget med det magiska ordet {{int:}}. [translatewiki.net](https://translatewiki.net/wiki/) hoved siden og nogle af Wikimedia Commons-mønstrene er godt eksempel på dette. Det magiska ordet {{int:}} er et alternativ til indehold oversættelse funktionen og det er mere lämpligt for at markere tunge sider, præcis som på hoved siden til translatewiki.net. En anden godt funktion er, at sproget på siden automatisk følger brugergrænsefladen, så der intet behov findes for et sprogfelt, selvom du måske vil have en sprogvælger til grænsefladet istedet for.

At indstille dette er i øjeblikket en smule mere kompliceret end indholds-oversættelse og kræver konfiguration af softwaren, men det er alt sammen dækket i vejledningen [Hvordan laver man en grænseflade-meddelelsesgruppe](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Software oversættelse

Translate-udvidelsen er god til at oversætte softwarens brugergrænseflademeddelelser. På translatewiki.net bruges den til at oversætte dusinvis af software-produkter fra spil til web-anvendelser. Translate-udvidelsen understøtter læsning og opdatering af oversættelser fra og til almindelige formater der bruges i web-udvikling, herunder [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) og [Yaml](https://en.wikipedia.org/wiki/YAML)-filer . At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

Sporing af ændringer er også tilgængeligt for eksternt sporede filer, fordi udvidelsen internt bruger en afledt cachet version af lokaliserings-filerne, hvor kildeteksten og dens oversættelser er gemt, i stedet for at bruge dem direkte i deres oprindelige format. Oversættelses-administratorer kan bruge enten web-grænsefladen eller en kommandolinjegrænseflade til at kontrollere nye meddelelses-definitioner og ufærdige oversættelser, der behøver opdatering. Dette virker uanset underliggende filformat eller versions-kontrolsystem.

Med enkle kommandolinje-værktøjer kan oversættelses-administratorer nemt importere selv en stor samling eksisterende oversættelser og med blot én enkelt kommando eksportere alle oversættelser i det korrekte format og i den korrekte mappestruktur. Du kan eksportere direkte til dit [versions-kontrolsystem](https://en.wikipedia.org/wiki/en:Version%20control%20system)-udtjekningslager, hvor du nemt kan lave ændringer og nye filer.

## Yderligere læsning og vejledning

### For oversættere og oversættelses-administratorer

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Dias fra en workshop om at bruge [Udvidelse:Oversæt](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) på Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [Hvordan man oversætter](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Vejledning]
- [God oversættelsespraksis](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistik og rapportering](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kvalitetssikring](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Meddelelsesgruppe-statistik](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[Igang] [Søg](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Offline-oversættelse](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[Igangværende] [Ordbog](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### For oversættelses-administratorer

- [Hvordan man forbereder en side til oversættelse](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Vejledning]
- [Sideoversættelses-administration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Brugerflade-meddelelsesgrupper (sprog-bestemt sidebjælke, hovedside og skabeloner)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Vejledning]
- \[Igangværende] [Meddelelsesgruppe-styring](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML konfigurationsformat](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Hvordan YAML konfigureres til filbaserede beskedgrupper](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Vejledning]

### Reference-dokumenter for udviklere

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) og [Konfiguration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Language Extension Bundle](https://www.mediawiki.org/wiki/MediaWiki_Language_Extension_Bundle) burde være nok i de fleste tilfælde.

- [Oversættelseshukommelse](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Guide for udviklere](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[Igangværende] [Komponenter i Translate forklaret for udviklere](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Hooks (værktøj)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[Igangværende] [Beskedgrupper](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[Igangværende] [Filformat support (FFS)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Translation aids (hjælpemoduler)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Ikke skrevet] [action-API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Indsættelses-moduler](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Kommandolinje-scripts](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Arbejdsgang i MediaWiki-arbejdet](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Beskriver de omfattede opgaver, når en side markeres til oversættelse eller når et afsnit oversættes
  - [Arkitekturen i oversættelsesshukommelse](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Beslægtet

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Generel tilpasningsvejledning for udviklere til brug ved hackathons og træning
- [Universel sprogvælger](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Giver web-skrifttyper og input-metoder
- [Oversættelighed](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – ting, du skal tænke på, når du opretter sider eller funktioner på flersprogede wikier
- [m:Tech/Oversættere/Liste](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Sæt dig selv på listen over aktuelt aktive tekniske oversættere

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/da" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016696"}
::
