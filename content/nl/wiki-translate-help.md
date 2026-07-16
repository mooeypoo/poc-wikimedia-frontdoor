---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/nl
sourceWiki: www.mediawiki.org
sourceRevision: "8016725"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Documentatie voor [Extension:Translate/nl](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Vertalers** (**[Hoofdpagina help](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Hoe te vertalen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Beste manieren](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistieken en rapportage](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kwaliteitscontrole](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Berichtengroep statussen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Offline vertalen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Woordenlijst](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Vertalingenbeheerders**

- [Een pagina voorbereiden voor vertaling](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Paginavertaling beheren](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Vertaling van ongestructureerde elementen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Groepenbeheer](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Vertaalbare pagina verplaatsen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Vertalingen uit CSV importeren](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Met berichtenbundels werken](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Systeembeheerders en ontwikkelaars**

- [Installatie](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Instellingen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Beginnen met ontwikkelen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Gids voor ontwikkelaars](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Vertaling uitbreiden](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validatoren](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Invoegbare onderdelen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Configuratie groep](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Voorbeeld configuratie groep](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Vertaalgeheugen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Hulpmiddelen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Berichtenbundels inschakelen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Vertaal dit sjabloon](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

De belangrijkste speciale pagina van de uitbreiding, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), in de meest voorkomende taak, "alle onvertaalde berichten bekijken"

De extensie [Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) verrijkt MediaWiki met essentiële functies voor het vertalen. Het kan worden gebruikt om inhoudspagina's te vertalen, de interface van de wiki en zelfs andere software producten, als het wordt gebruikt op [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). De extensie Translate heeft een eenvoudig te gebruiken interface en kan de structuur van de inhoud scheiden van de te vertalen tekst, het toont alleen de te vertalen tekst aan de vertalers door die teksten per keer in een te verwerken eenheid aan te bieden. Elke eenheid wordt automatisch gevolgd voor wijzigingen, de vertalers zien dan automatisch welke eenheden van een bepaalde pagina op de wiki vertaald of beoordeeld moeten worden.

De extensie wordt elke maand door honderden vertalers gebruikt voor het vertalen van de gebruikersinterface van de MediaWiki en andere software projecten op translatewiki.net. Op [userbase.kde.org](http://userbase.kde.org) wordt het gebruikt om zo'n duizend pagina's met gebruikersdocumentatie te vertalen. Het is gemakkelijk om met deze extensie te gaan werken, maar u krijgt er wel geavanceerde rapportage, beoordelingen en workflow functies bij.

## Functionaliteit

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

De tekstverwerker voor vertalingen: een bericht met een tip (niet zichtbaar in de afbeelding) en een suggesties van twee hulptalen

**Interface:** De belangrijkste functie van de extensie Translate is een eenvoudig maar functionele vertaalinterface. Naast essentiële informatie als definitie van de tekst en documentatie, kunt u ook vertalingen in ander talen bekijken. Als er een definitie is gewijzigd, dan ziet u de wijziging. De extensie voert standaard enkele controles uit, dat zorgt dat er enkele veel gemaakt fouten niet worden gemaakt, zoals fouten met de vierkante haakjes of het weglaten van variabelen. Afhankelijk van de configuratie zijn er ook suggesties uit het vertaalgeheugen en services voor machine vertaling zoals Google Translate, Microsoft's Bing Translator en Apertium.

Het gebruik van de vertaalinterface is verrijkt door gebruik van JavaScript en AJAX. Het backend heeft WebAPI's die in mobiele interfaces of maatwerk interfaces gebruikt kunnen worden voor specifieke inhoud. Het is ook mogelijk om teksten te exporteren voor vertaling in elk hulpmiddel dat het [Gettext po](https://en.wikipedia.org/wiki/Gettext) bestandsformaat accepteert.

**Berichten groepen en taken:** Een groot deel van de functionaliteit zijn ontworpen rond twee basisconcepten: berichtgroepen en taken.

Een berichtengroep staat voor een verzameling berichten. Een pagina kan een berichtengroep zijn, elke alinea zou eventueel een bericht kunnen zijn in de groep. Berichten in een extensie zijn zelf een berichtengroep op translatewiki.net, een grote extensie kan meerdere berichtengroepen hebben. Een groep kan uit groepen bestaan, bijvoorbeeld _All newsletters_ of _All Translate extension messages_. Veel statistieken en taken werken op basis van een berichtengroep.

De taken, ook wel de verschillende lijsten met berichten in een berichtengroep, faciliteren verschillende 'use-cases'. Normaal krijgt een vertaler een lijst onvertaalde berichten in een gekozen berichtengroep, maar er zijn taken waar u berichten kunt beoordelen of alleen maar bekijken op de status van het bericht (alle, vertaald, onvertaald, verouderd).

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Op deze speciale pagina wordt gerapporteerd over de vertaalstatus van iedere berichtengroep

**Rapportage en statistieken:** De extensie het uitgebreide [functies voor rapportage](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) gaande van een overzicht van onvertaalde berichten in alle berichtengroepen in een bepaalde taal tot lijsten van vertalers per taal en de mate van hun activiteit.

**Inhoud vertaling:** Als u ooit heeft geprobeerd om inhoud te vertalen in de MediaWiki zonder hulpmiddel dan weet u dat het niet schaalbaar is. De vertalingen verouderen en er is geen manier op de wijzigingen aan de originele Engelse pagina te volgen. Dan krijgt men dus half vertaalde en verouderde vertalingen zonder een helder overzicht van de status in het algemeen. Vertalers worden vaak ontmoedigd wanneer zij niet met kleine beheersbare stukjes tekst kunnen werken. Vertalers zien niet wat er nog te vertalen is of welke vertaling verouderd is. Ook de lezers/gebruikers moeten maar zien welke vertaalde informatie nog actueel is.

Dit wordt allemaal opgelost met de extensie Translate en de functie om pagina's te vertalen. Er hoeft alleen aan te geven welk deel van de pagina vertaling nodig heeft. De extensie splitst dit dan per alinea op in een berichtengroep. Daarna is het aan de vertalers. Als toevoeging kan er er een taalbalk worden toegevoegd met de tag `<languages />` tag of links hebben die automatisch naar de versie met de voorkeurstaal van de gebruiker gaan, als die bestaat, door gebruik van links met met vorm \[\[Special:MyLanguage/Pagename]].

Meer informatie staat in de tutorial [Hoe een pagina klaar maken voor vertaling](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) en de [detail documentatie van de functie voor paginavertaling](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Ontwikkelaars:** De extensie bevat interne ondersteuning voor veel gebruikelijke bestandsformaten voor het vertalen, zoals Java properties en Gettext po-bestanden. Het bevat veel hulpmiddelen, zowel in wiki als op de commando-regel om efficiënt vertalingen te importeren en te exporteren.

**Zoeken:** Zonder een functie zoeken is het voor vertalers moeilijk om bepaalde berichten te vinden die ze willen vertalen. Het scannen van alle vertalingen of berichten van een project is niet efficiënt. Ook wilt u als vertaler graag zien hoe een bepaalde term in die taal eerder is vertaald binnen dat project.

Hiervoor is een speciale pagina [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Vertalers kunnen een bericht vinden met een bepaalde term in elke taal en daarbij verschillende filters gebruiken. Na het zoeken kunnen ze switchen naar de resultaten van de vertalingen van de berichten in kwestie, bijvoorbeeld om de bestaande, ontbrekende of verouderde vertalingen te vinden van een bepaalde term.

## Gebruiksmogelijkheden

Zowat alles kan met deze extensie worden vertaald. Er zijn natuurlijk speciale hulpmiddelen voor vertaling van bepaalde inhoud zoals ondertiteling van video's, die kunnen beter door dat hulpmiddel gedaan worden. Maar in het algemeen werkt _Translate_ goed met elke tekst die in delen gesplitst kan worden naar berichten die dan een enkel woord kunnen zijn of een hele alinea. Een bericht moet niet te lang worden, dan wordt het moeilijk vertaalbaar.

De drie primaire 'use cases' die de extensie Translate ondersteund zijn **vertaling inhoud**, **vertaling lokale interface** en **vertaling software**. Deze drie worden in de volgende secties behandeld, met links naar tutorials, documentatie of detail help (indien beschikbaar).

### Vertalen van pagina's

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

De vertaling is verouderd: verouderde delen worden vervangen door nieuwe brontekst en vertalers kunnen de te vernieuwen boodschappen met een enkele klik bereiken

De meeste wiki's hebben inhoud die ze beschikbaar willen stellen in meerdere talen. Of het nu over slechts enkele of honderden pagina's gaat, maakt daarbij niet uit. Om te voorkomen dat vertalers tijd verspillen, zouden pagina's slechts gemarkeerd mogen worden voor vertaling wanneer ze redelijk stabiel zijn. Elke wijziging die nadien gebeurt, kan tientallen of honderden vertalingen beïnvloeden en de tijd om die te vernieuwen, loopt snel op. U moet zich hiervan bewust zijn en onnodig werk vermijden, omdat vrijwillige vertalers tijd besteden aan het vertalen en updaten. Wanneer u de Translate-extensie gebruikt om pagina's te vertalen, bent u al op de goede weg om de vertaaltijd op een efficiënte en effectieve manier te benutten.

De manier van opsplitsen van een pagina in alinea's laat maar weinig vrijheid voor de vertalers om de inhoud aan te passen. Dat zorgt voor continuïteit en consistentie van de inhoud over de talen. Er kan wel langsheen gewerkt worden, deze manier van werken is in het algemeen niet gepast voor vertalingen omdat Wikipedia artikelen meestal onafhankelijk van elkaar zijn. Ook al starten ze als een vertaling, daarna gaan ze een eigen leven leiden en kan het dus geen vertaling meer genoemd worden. Met _Translate_ is de originele pagina altijd de hoofdversie en kan er geen nieuwe inhoud worden aangemaakt in de vertalingen.

Ook met deze beperkingen in gedachten zijn er nog genoeg 'cases' waar deze functie een perfect is. Nagenoeg alle gebruikersdocumentaties valt in deze categorie als ook nieuwsberichten die na het publiceren niet meer gewijzigd worden. Als de extensie al geïnstalleerd is en de toegangsrechten zijn geconfigureerd, probeer dan om een pagina aan te maken en de hele tekst in `<languages />...` te zetten en volg de links of de tutorial [Hoe een pagina gereed te maken voor vertaling](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Groepen van pagina's kunnen verder worden samengevoegd met de pagina [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups).

### Lokale interfacevertaling in meertalige wiki's

Op bijna elke wiki is de [zijbalk](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar) aangepast. Het is mogelijk om een berichtengroep aan te maken voor de berichten in de aangepaste zijbalk en ook voor andere lokale interface aanpassingen.

Een interessante uitbreiding van meertalig pagina's en sjablonen gemaakt met het magische woord {{int:}}. Enkele voorbeelden zijn de [translatewiki.net](https://translatewiki.net/wiki/) hoofdpagina en enkele Wikimedia Commons sjablonen. Het magische woord {{int:}} is een alternatief voor de functie ContentTranslation en is meer geschikt om grote pagina's te markeren zoals de translatewiki.net hoofdpagina. Een ander mooie functie is dat de taal van de pagina automatisch de taal van de gebruikersinterface van de gebruiker volgt, er is dus geen behoefte aan een taalbalk, al wilt u dan wel een selectie kunnen doen voor de taal van de interface.

Dit instellen is nu meer gecompliceerd dan de vertaling van de inhoud en behoeft software configuratie, maar dat wordt behandeld in de tutorial [Hoe maakt u een interface berichtengroep](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Vertalen van software

De extensie is een prima hulpmiddel voor het vertalen van software interface berichten.

```
Op translatewiki.net wordt het gebruikt voor dozijnen software producten van spellen tot webapplicaties.
```

De extensie Translate ondersteunt lezen en wijzigen van vertalingen van en naar gebruikelijke formaten in de webontwikkeling waaronder [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) en [Yaml](https://en.wikipedia.org/wiki/YAML) bestanden.

Het volgen van wijzigingen is ook beschikbaar externe bestanden, omdat intern de extensie een gecachte afgeleide versie van de lokalisatie gebruikt waar de brontekst en de vertaling zijn opgeslagen, in plaats van ze direct in hun originele formaat te gebruiken. Beheerders van vertalingen kunnen de webinterface of de commandoregel interface gebruiken om te controleren op nieuwe definities van berichten en "fuzzy" (verzoek tot controleren/aanpassen) vertalingen. Dit ongeacht het betreffende bestandsformaat of versie beheer systeem.

Met eenvoudige commandoregel hulpmiddelen kunnen beheerders van vertalingen eenvoudig veel vertalingen importeren en ook exporteren in het gewenste formaat en in de goede bestandsstructuur. U kunt direct exporteren naar uw [VCS](https://en.wikipedia.org/wiki/Version%20control%20system) repository checkout, waar u eenvoudig de wijzigingen en nieuwe bestanden kunt committeren.

## Meer informatie en leerprogramma's

### Voor vertalers en beheerders van vertalingen

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Dia's van een workshop over hoe [Extension:Translate/nl](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) te gebruiken op Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

Een videocast met dia's in het Engels.

- [Hoe te vertalen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Tutorial]
- [Beste voorbeelden vertaling](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistieken en rapportage](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kwaliteitscontrole](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Berichtengroep statussen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[In behandeling] [Zoeken](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Offline vertalen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[In behandeling] [Woordenlijst](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Voor beheerders van vertalingen

- [Een pagina voorbereiden voor vertaling](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Tutorial]
- [Paginavertaalbeheer](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Interface berichtengroepen (vertaalde zijbalk, hoofdpagina en sjablonen)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Tutorial]
- \[In behandeling] [Berichtengroep beheer](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML configuratie formaat](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Hoe YAML configuratie te schrijven voor bestandsgeoriënteerde berichtengroepen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Tutorial]

### Referentiedocumentatie voor ontwikkelaars

- [Installatie](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) en [Instellingen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Language Extension Bundle/nl](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) zou in de meeste gevallen genoeg moeten zijn.

- [Vertaalgeheugen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Gids voor ontwikkelaars](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[In behandeling] [Uitleg vertalen voor ontwikkelaars](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Hooks](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[In behandeling] [Berichtgroepen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[In behandeling] [Ondersteuning bestandsformaten](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Hulpmiddelen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Ongeschreven] [Action API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Invoegbare onderdelen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Commando-regel scripts](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Procesverloop in MediaWiki jobs](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Beschrijft welke jobs betrokken zijn bij het markeren van een pagina voor vertaling of een sectie is vertaald
  - [Vertaalgeheugen architectuur](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Gerelateerd

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integratiescript voor extensie Translate
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Algemene lokalisatie tutorial voor ontwikkelaars, voor gebruik bij hackathons en trainingen
- [Universal Language Selector/nl](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Zorgt voor webfonts en invoermethodes
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – aandachtspunten bij aanmaken pagina's of processen op meertalige wiki's
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Voeg uzelf toe aan de lijst actieve vertalers

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/nl" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016725"}
::
