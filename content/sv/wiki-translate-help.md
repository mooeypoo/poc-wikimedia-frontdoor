---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/sv
sourceWiki: www.mediawiki.org
sourceRevision: "8016735"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Dokumentation för [Tillägg:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Översättare** (**[huvudhjälpsida](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Hur man översätter](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [God praxis](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistik och rapportering](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kvalitetssäkring](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Statistik för meddelandegrupper](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Översättning offline](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Ordlista](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Översättningsadministratörer**

- [Hur man förbereder en sida för översättning](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Administration för sidöversättning](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Översättning av ostrukturerade element](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Grupphantering](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Flytta översättbar sida](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import translations via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Systemadministratörer och utvecklare**

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Konfiguration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Kom igång med att utveckling](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Utvecklarguide](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Utöka Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validatorer](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Infogningar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Group configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Group configuration example](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Translation memories](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Translation aids](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Översätt denna mall](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Huvudsidan för tillägget, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), med sin vanligaste uppgift, "visa alla oöversatta meddelanden"

[Tillägget Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) utökar MediaWiki med viktiga funktioner som behövs för att översätta. Den kan användas för att översätta innehållssidor, gränssnittet för wikin och även andra programvaror, eftersom det används på [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). Translate-tillägget kommer med ett lättanvänt översättningsgränssnitt och kan skilja innehållsstruktur från textinnehåll som måste översättas, och visar endast översättbar text till översättarna genom att dela upp innehållet i hanterbara delar. Varje enhet spårar automatiskt ändringar och översättarna ser genast vad som behöver uppdateras på en specifik sida eller på hela wikin.

Translate-tillägget används för att översätta användargränssnittet för MediaWiki och andra mjukvaruprojekt på translatewiki.net av hundratals översättare varje månad. Vid [userbase.kde.org](http://userbase.kde.org) används det för att översätta nära tusen innehållssidor med användardokumentation. Det är lätt att börja använda Translate-tillägget, men samtidigt skalar den upp och ger avancerad rapportering, granskning och arbetsflödesfunktioner.

## Funktioner

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Översättningsredigeraren: Ett meddelande med ett tips (visas inte i bilden) och förslag från två assistansspråk

**Gränssnitt:** Huvudfunktionen i Translate-tillägget är ett enkelt men ändå funktionellt översättningsgränssnitt. Förutom den väsentliga informationen som definition och dokumentation av meddelanden kan du också se översättningar på andra språk. Om en definition har ändrats kommer du se ändringarna. Tillägget kommer med några inbyggda kontroller, som kan hjälpa till med vanliga misstag som obalanserade parenteser och oanvända variabler. Beroende på konfigurationen finns det också förslag från översättningsminne och maskinöversättningstjänster som Google Translate, Microsofts Bing Translator och Apertium.

Användbarheten för översättningsgränssnittet förbättras med JavaScript och AJAX. Sistnämnda inkluderar WebAPI som kan användas i mobila gränssnitt eller gränssnitt anpassade till särskilda innehållsslag. Det går även att exportera meddelanden för översättning i andra offline-och on-line verktyg som accepterar filformatet [Gettext portable object](https://en.wikipedia.org/wiki/Gettext#translate).

**Meddelandegrupper och uppgifter:** Många funktioner är uppbyggda runt två grundläggande koncept: meddelandegrupper och uppgifter.

En meddelandegrupp representerar en samling av meddelanden. En innehållssida är en meddelandegrupp, där varje stycke i enklaste form är ett meddelande i den gruppen. Meddelanden som används i varje MediaWiki-tillägg formar en meddelandegrupp på translatewiki.net - några av de största tilläggen har flera grupper. Du kan också skapa en grupp grupper, som _Alla nyhetsbrev_ eller _Alla Translate-tilläggsmeddelanden_. Mycket av statistiken och uppgifterna fungerar på meddelandegruppsbasis.

Uppgifterna, eller med andra ord olika listor av meddelanden i en meddelandegrupp, underlättar olika användningsfall. Normalt får en översättare en lista över alla oöversatta meddelanden i en vald meddelandegrupp, men det finns uppgifter där du kan granska meddelanden eller bara få en lista över alla meddelanden, översatta eller inte.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Denna specialsida visar översättningsstatusen för varje meddelandegrupp

**Rapporter och statistik:** Tillägget har omfattande [rapportfunktioner](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) som sträcker sig från en vy över översatta meddelanden över alla meddelandegrupper i ett visst språk till listor över översättare per språk med aktivitetsnivå.

**Innehållsöversättning:** Om du någonsin har försökt översätta innehåll i MediaWiki utan några verktyg, vet du att det inte skalar. De översatta versionerna föråldras och det finns inget sätt att spåra ändringar på mastersidan, så det finns många halvöversatta och föråldrade översättningar utan tydlig översikt av den övergripande statusen. Översättare blir ofta avskräckta när de inte kan arbeta med små hanterbara bitar av text. Översättare hittar inte vad de ska arbeta med eller vad som behöver uppdateras. Användarna blir också förvirrade av föråldrad information.

Det här löses alla med översättningstillägget och dess sidöversättningsfunktion. Det lägger till lite overhead på de sidor som behöver översättning, men fördelarna överväger detta. I huvudsak behöver du bara markera de delar av sidan som behöver översättning. Tillägget splittrar sedan dessa siddelar i paragrafenheter och skapar en meddelandegrupp för dem. Därefter kan översättarna använda alla funktioner som beskrivs ovan. Dessutom kan du enkelt lägga till en språkfält med `<languages />`-taggen eller koppla automatiskt till användarens föredragna språkversion (endast) när den finns, genom att använda länkar i formuläret \[\[Special:MyLanguage/Pagename]].

Mer information finns i handledningen [Så här ställer du in en innehållssida för översättning](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) och [Fördjupad dokumentation av sidoversättningsfunktionen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Utvecklare:** Tillägget levereras med inbyggt stöd för många vanliga översättningsfilformat, som Java-egenskaper och Gettext po-filer. Den har en omfattande uppsättning verktyg, både i wikin och på kommandoraden, för att effektivt importera och exportera översättningar.

**Sökning:** Utan sökfunktion är det svårt för översättare att hitta specifika meddelanden som de vill översätta. Att kryssa mellan alla översättningar eller strängar i projektet är ineffektivt. Dessutom vill översättare ofta kontrollera hur en viss term översattes på ett visst språk över hela projektet.

Detta löses av den specialsidan [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Översättare kan hitta meddelanden som innehåller vissa termer i något språk och filtrera enligt olika kriterier: detta är standardvärdet. Efter sökning kan de växla resultatet till översättningar av nämnda meddelanden, till exempel för att hitta befintliga, saknade eller föråldrade översättningar av en viss term.

## Användningsfall

Du kan översätta nästan vad som helst med översättningstilläget. Naturligtvis finns det specialverktyg som är bättre för översättning av vissa typer av innehåll som video-undertexter, men i allmänhet fungerar "Translate" mycket bra med text som kan delas in i meddelanden med längd från ett ord upp till ett stort stycke. Längre meddelanden är besvärliga att översätta och gör översättningsarbetet tungrott.

De tre primära användningsfallen som Translate-tillägget stöder är **innehållsöversättning**, **lokalgränssnittets översättning** och **mjukvaruöversättning**. Alla omfattas i följande avsnitt, med länkar till handledning och referensdokumentation eller fördjupande hjälp där det är tillgängligt. Av de tre användningsfallen har gränsnittsöversättningen utnyttjats minst.

### Innehållsöversättning

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Översättningen är föråldrad: Föråldrade delar ersätts med ny källkod och översättare kan nå meddelandena med ett enda klicka

De flesta wikier har innehåll som de skulle vilja vara tillgängligt på flera språk. Det spelar ingen roll om det är ett fåtal eller hundratals sidor. För att inte slösa med översättarens tid, bör sidor endast markeras för översättning när de är relativt stabila. Varje ändring som görs efteråt kan påverka tiotals eller hundratals gamla översättningar, och den tid som behövs för att uppdatera dem blir större och större. Speciellt med frivilliga översättare bör du vara medveten om denna aspekt och respektera den tid de spenderar på att göra översättningar och uppdateringar, vilket undviker onödigt arbete. Om du använder översättningstillägget för att översätta sidor, är du redan väl på väg att använda den tillgängliga översättartiden på det mest effektiva och verkfulla sättet.

Det sätt på vilket Translate-tillägget delar upp en sida i paragrafer ger inte mycket frihet för översättare att ändra innehållet. Detta är vanligtvis av godo och är idealiskt där kontinuitet och konsistens av innehåll på olika språk önskas. Det kan arbeta runt, men i princip är det här sättet att göra översättningar ofta olämpligt, till exempel för Wikipedia-artiklar, som vanligtvis är helt oberoende av varandra. Även om de ursprungligen börjar som en översättning från ett annat språk börjar de vanligtvis att leva sitt eget oberoende liv från den ursprungliga versionen. Med _Translate_ är den ursprungliga sidan alltid huvudversionen, och det nya innehållet kan inte utvecklas i översatta versioner.

Med dessa begränsningar i åtanke finns det fortfarande många fall där denna funktion är en perfekt match. De flesta, om inte alla, användardokumentation faller in i denna kategori samt nyhetsinnehåll som inte ändras efter det skrivits. Om du redan installerat Translate-tillägget och konfigurerat åtkomsträttigheter, försök att skapa en sida och packa hela texten inuti `<languages />...` och följ länkarna, eller följ handledningen [Så här förbereder du en sida för översättning](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Grupper av sidor kan aggregeras ytterligare tillsammans med [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups)-sidan.

### Lokal gränssnittsöversättning i flerspråkiga wikis

En sak som nästan varje wiki har anpassat är [sidofält](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Det är möjligt att skapa en meddelandegrupp för anpassade sidofältmeddelanden och även för andra lokala gränssnittsanpassningar.

Ett intressant tillägg är flerspråkiga sidor eller mallar som byggts med det magiska ordet {{int:}}. [translatewiki.net](https://translatewiki.net/wiki/) huvudsidan och några av Wikimedia Commons-mallarna är bra exempel på detta. Det magiska ordet {{int:}} är ett alternativ till innehållsöversättningsfunktionen och det är mer lämpligt för att markera tunga sidor, precis som på huvudsidan till translatewiki.net. En annan bra funktion är att språket på sidan automatiskt följer användargränssnittet, så det finns inget behov av ett språksidofält, även om du kanske vill ha en språkväljare för gränssnitt istället.

Att ställa in detta är för närvarande lite mer komplicerat än innehållsöversättning och behöver programkonfiguration, men allt täcks i handledningen [Så här skapar du en gränssnittsmeddelandegrupp](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Programvaruöversättning

Translate-tillägget passar bra till att översätta programvarugränssnittsmeddelanden. På translatewiki.net används det för att översätta dussintals programvaruprodukter från spel till webbapplikationer. Tillägget Translate stödjer läsning och uppdatering av översättningar från och till vanliga format som används i webbutveckling, inklusive [Java Properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) och [Yaml](https://en.wikipedia.org/wiki/YAML)-filer.

Spårning av ändringar är också tillgängligt för externa filer, eftersom utökningen internt använder en cachad derivat-version av lokaliseringsfilerna där källtexten och dess översättningar lagras istället för att använda dem direkt i sitt ursprungliga format. Översättningsadministratörer kan antingen använda webbgränssnittet eller ett kommandoradsgränssnitt för att kontrollera nya meddelandedefinitioner och "fuzzy" (begäran om uppdatering av) översättningar när de behöver uppdateras. Detta fungerar oberoende av det underliggande filformatet eller versionsstyrsystemet (om det finns några).

Med enkla kommandoradsverktyg kan översättningsadministratörer enkelt importera även en stor uppsättning befintliga översättningar och med bara ett kommando kan de exportera alla översättningar i rätt format och i rätt katalogstruktur. Du kan exportera direkt till kassakontot [VCS](https://en.wikipedia.org/wiki/en:Version%20Control%20System), där du enkelt kan begå ändringar och nya filer.

## Mer läsning och guider

### För översättare och översättningsadministratörer

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Bildspel i en workshop om hur man använder [Tillägg:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) på Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [Hur man översätter](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Guide]
- [God översättningspraxis](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistik och rapportering](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kvalitetssäkring](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Statistik för meddelandegrupper](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[Pågående] [Sök](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Översättning offline](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[Pågående] [Ordlista](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### För översättningsadministratörer

- [Hur man förbereder en sida för översättning](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Guide]
- [Sidöversättningsadministration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Meddelandegrupper för gränssnittet (lokaliserade sidofält, huvudsida och mallar)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Guide]
- \[Pågående] [Hantering av meddelandegrupper](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML-format för konfigurering](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Hur man skriver YAML-konfigurering för filbaserade meddelandegrupper](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Guide]

### Referensdokumentation för utvecklare

- [Installation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) och [Konfiguration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - Det räcker oftast med [MediaWikis språktilläggspaket](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle).

- [Översättningsminnen](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Utvecklarguide](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[Pågående] [Översättning förklarat för utvecklare](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Hooks (verktyg)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[Pågående] [Meddelandegrupper](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[Pågående] [Stöd för filformat](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Översättningshjälp](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Inte skriven] [action-API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Införingsbara](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Kommandoradsskript](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Processflöde i MediaWiki-jobb](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Beskriver vilka jobb som är inblandade när en sida markeras för översättning eller när ett avsnitt översätts
  - [Översättningsminnesarkitektur](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Relaterade

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Allmän lokaliseringshandledning för utvecklare, för användning vid hackaton och träning
- [Universell språkväljare](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Ger webbfonter och inmatningsmetoder
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – saker att tänka på när du skapar sidor eller processer på flerspråkiga wikis
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Lägg till dig själv på listan över aktiva tekniska översättare

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/sv" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016735"}
::
