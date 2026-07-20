---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/cs
sourceWiki: www.mediawiki.org
sourceRevision: "8016695"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Dokumentace pro [Rozšíření:Překlady](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Pro překladatele** (**[hlavní stránka nápovědy](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Jak se překládá](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Osvědčené postupy](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistika a hlášení](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Záruka kvality](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Přehled o stavu překladu zpráv](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Offline překlad](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Slovníček](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Pro správce překladů**

- [Jak připravit stránku k překladu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Správa překladu stránky](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Překlad nestrukturovaných prvků](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Správa skupin](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Přesun překládané stránky](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import překladů přes CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Práce se svazky zpráv](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Pro systémové administrátory a vývojáře**

- [Instalace](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Konfigurace](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Než začnete s vývojem](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Průvodce pro vývojáře](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Rozšíření Překladače](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validátory (ověřovače)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Zástupné prvky](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Konfigurace skupiny](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Příklad konfigurace skupiny](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Překladové paměti](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Nápověda překladatele](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Povolení balíčků zpráv](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [Háčky PHP](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Přeložte tuto šablonu](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Hlavní speciální stránka rozšíření, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate) (v češtině ji najdete pod názvem "Překládání"), zpravidla nabízí ve výchozím stavu "nepřeložené zprávy".

Rozšíření [Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) (překlad) přidává k MediaWiki základní nástroje potřebné k práci na překladu. Lze ho využít k překladu obsahu stránek, rozhraní wiki a dalších softwarových produktů, které se používají v [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). Toto rozšíření poskytuje jednoduché překladatelské rozhraní, kde je struktura obsahu oddělena od textového obsahu, který má být přeložen. Překladatelům se zobrazuje pouze obsah určený k překladu, rozdělený do samostatně udržovaných jednotek. Změny u každé z nich se automaticky sledují a překladatelé tak okamžitě vidí, co je potřeba zaktualizovat na konkrétní stránce, nebo v celé wiki.

Rozšíření Translate používají k překladu uživatelského rozhraní MediaWiki a dalších projektů na translatewiki.net, každý měsíc stovky překladatelů. Na webu [userbase.kde.org](http://userbase.kde.org) se používají pro překlad obsahu tisícovky stránek s uživatelskou dokumentací. S rozšířením Translate je velmi snadné začít překládat, přitom nabízí i obsáhlé možnosti oznamování změn, jejich kontroly a další možnosti pracovního postupu.

## Funkce

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Editor překladu: Zpráva s tipem (na obrázku není vidět) a návrhy ze dvou pomocných jazyků

**Rozhraní:** (interface) Hlavním rysem rozšíření Translate je jednoduché, ale funkční překladové rozhraní. Kromě základních informací, jako je definice zprávy a dokumentace, si můžete také prohlížet překlady do jiných jazyků. Pokud se definice změnila, uvidíte změny. Rozšíření obsahuje určité vestavěné kontrolní mechanismy, které mohou pomoci hlídat běžné chyby, jako jsou nevyvážené závorky a nepoužívané proměnné. V závislosti na konfiguraci existují také návrhy z překladové paměti a služeb strojového překladu, jako jsou služby Google Translate, Microsoft Bing Translator a Apertium.

Použitelnost překladového rozhraní je vylepšena pomocí JavaScriptu a AJAX. Backend poskytuje rozhraní WebAPI, která lze použít v mobilních rozhraních nebo rozhraních přizpůsobených konkrétnímu druhu obsahu. Je také možné exportovat zprávy pro překlad do jiných off-line a on-line nástrojů, které přijímají formát souboru [Gettext po](https://cs.wikipedia.org/wiki/GNU%20gettext).

**Skupiny zpráv a úkoly:** Mnoho funkcí je založeno na dvou základních pojmech: Skupiny zpráv a úkoly.

Skupina zpráv představuje sbírku zpráv. Jedna obsahová stránka by byla jedna skupina zpráv, kde by v nejjednodušší formě každý odstavec představoval jednu zprávu v této skupině. Zprávy použité v každém rozšíření MediaWiki tvoří skupinu zpráv na translatewiki.net - několik největších rozšíření má více skupin. Můžete také vytvořit skupinu skupin, například _Všechny informační bulletiny_ nebo _Všechny zprávy o rozšíření Překladače_. Mnoho statistik a úkolů pracuje na základě skupiny zpráv.

Úkoly nebo jinými slovy různé výpisy zpráv ve skupině zpráv usnadňují různé případy použití. Překladatel obvykle získá seznam všech nepřekládaných zpráv ve vybrané skupině zpráv, ale existují úkoly, kde si můžete prohlížet zprávy nebo jen získat seznam všech zpráv, přeložených či nikoli.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Tato speciální stránka zobrazuje stav překladů každé skupiny zpráv

**Hlášení a statistika:** (reporting and statistics) Rozšíření má rozsáhlé [funkce hlášení](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting), od zobrazení nepřekládaných zpráv napříč všemi skupinami zpráv v daném jazyce až po seznamy překladatelů podle jazyka s úrovní jejich aktivity.

**Překlad obsahu:** Pokud jste někdy překládali obsah MediaWiki, aniž byste měli k dispozici nějaký překladatelský nástroj, pak víte, že se to nedá srovnat. Přeložené verze zastarávají a neexistuje žádný způsob, jak sledovat změny probíhající na samotné překládané stránce, takže pak ve wiki existuje mnoho částečně přeložených a zastaralých překladů, aniž by někde existoval srozumitelný přehled o jejich stavu. Pro překladatele bývá deprimující, když musí pracovat s velkým blokem textu místo kratších textů, které lze zvládnout snáz. Pro překladatele bývá v takovém případě problém najít, co může zůstat beze změn a co naopak vyžaduje aktualizaci. Uživatele tak matou informace, které již nejsou aktuální.

To vše je vyřešeno pomocí rozšíření Translate (přeložit) a funkce překladu stránky. Přidává trochu režie na stránky, které potřebují překlad, ale výhody dalece převažují. V podstatě stačí pouze označit části stránky, které vyžadují překlad. Rozšíření pak tyto části rozdělí na jednotky velikosti odstavce a vytvoří pro ně skupinu zpráv. Poté mohou překladatelé použít všechny výše popsané funkce. Kromě toho můžete snadno přidat jazykovou lištu se značkou `<languages />` nebo nechat odkazy automaticky přejít na preferovanou jazykovou verzi uživatele (pouze), pokud existuje, pomocí odkazů ve tvaru \[\[Special:MyLanguage/Pagename]].

Další informace naleznete v průvodci [Jak nastavit stránku s obsahem pro překlad](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) a v [podrobné dokumentaci funkce překladu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Vývojáři:** Rozšíření přichází s integrovanou podporou mnoha běžných formátů překladových souborů, jako jsou vlastnosti Java a soubory Gettext po. Má rozsáhlou sadu nástrojů, jak na wiki, tak na příkazovém řádku, k efektivnímu importu a exportu překladů.

**Vyhledávání:** Bez možnosti vyhledávání by pro překladatele bylo velmi obtížné najít zprávu, kterou chtějí přeložit. Procházení všech překládaných řetězců, které se vyskytují v projektu by bylo velmi zdlouhavé. Překladatelé také často chtějí zjistit, jak byl určitý termín přeložen do příslušného jazyka v jiném projektu.

To řeší speciální stránka [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Překladatelé přes ni mohou vyhledat zprávy, které obsahují hledaný termín v libovolném jazyce a výsledek podle různých kritérií dále filtrovat: Tak je tomu ve výchozím stavu. Po vyhledání pak mohou přepínat mezi překlady příslušné zprávy, aby tak mohli najít existující, chybějící nebo zastaralý překlad příslušného termínu.

## Využití

S Translate můžete přeložit cokoli. Pochopitelně existují specializované nástroje pro překlad určitého typu obsahu, jakým jsou například titulky, které budou pro tento účel vhodnější, ale v zásadě lze _Translate_ velmi dobře využít pro jakýkoliv druh textu, který lze rozdělit do zpráv od jednoho slova až po velké odstavce. I když dlouhé odstavce jsou z hlediska překladu nepraktické, protože se mnohem hůře překládají.

Tři případy primárního použití, které rozšíření Translate podporuje, jsou **překlad obsahu**, **překlad lokálního rozhraní** a **překlad softwaru**. Všechny jsou popsány v následujících částech s odkazy na návody a referenční dokumentaci nebo podrobnou aktuální nápovědu, pokud jsou k dispozici. Ze tří případů použití byl překlad rozhraní využit nejméně.

### Překlad obsahu

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Překlad je zastaralý: Zastaralé části jsou nahrazeny novým zdrojovým textem a překladatelé se mohou dostat ke zprávám a aktualizovat jediným kliknutím.

Většina wikin má obsah, který by chtěl být dostupný ve více jazycích. Ať už jen pár nebo stovky stránek, na tom nezáleží. Aby se zabránilo plýtvání času překladatele, měly by být stránky označeny k překladu, pouze pokud jsou přiměřeně stabilní. Každá následná změna může ovlivnit desítky nebo stovky starých překladů a čas potřebný k jejich aktualizaci se sčítá. Zejména u dobrovolných překladatelů byste si měli být vědomi tohoto aspektu a měli byste respektovat čas, který věnují překladům a aktualizacím, a vyhýbat se zbytečné práci. Pokud k překládání stránek používáte rozšíření Translate, již jste na dobré cestě k co nejefektivnějšímu a nejúčelnějšímu využití času překladatele.

Způsob, jakým rozšíření Translate rozdělí stránku na jednotky velikosti odstavců, nenechává překladatelům příliš velkou volnost při změně obsahu. To je obvykle dobrá věc a je ideální tam, kde je žádoucí souvislost a soudržnost obsahu napříč jazyky. Lze jej obejít, ale v zásadě není tento způsob překladů obecně vhodný například pro články na Wikipedii, které jsou obvykle na sobě zcela nezávislé. I když původně začínají jako překlad z jiného jazyka, obvykle začnou žít svůj vlastní nezávislý život z původní verze. U stránky _Translate_ je původní stránka vždy hlavní verzí a v přeložených verzích nelze vyvíjet nový obsah.

S ohledem na tato omezení stále existuje spousta případů, kdy se tato funkce dokonale hodí. Většina, ne-li všechna, uživatelská dokumentace spadá do této kategorie, stejně jako obsah podobný zprávám, který se po napsání nemění. Pokud již máte nainstalované rozšíření Translate a máte nakonfigurovaná přístupová práva, zkuste vytvořit stránku a celý text zabalit do `<languages />...` a postupujte podle odkazů nebo postupujte podle návodu [Jak připravit stránku k překladu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Skupiny stránek lze nalézt na stránce [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups).

### Překlad lokálního rozhraní ve vícejazyčných wikin

Jedna věc, kterou si téměř každá wiki přizpůsobila, je [postranní panel](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar) (sidebar). Je možné vytvořit skupinu zpráv pro vlastní zprávy na postranním panelu a také pro další přizpůsobení lokálního rozhraní.

Jedním zajímavým rozšířením jsou vícejazyčné stránky nebo šablony vytvořené pomocí magického slova {{int:}}. Hlavní stránka [translatewiki.net](https://translatewiki.net/wiki/) a některé šablony Wikimedia Commons jsou toho dobrým příkladem. Kouzelné slůvko {{int:}} je alternativou k funkci překladu obsahu a je vhodnější pro označení těžkých stránek, jako je hlavní stránka translatewiki.net. Další příjemnou funkcí je, že jazyk stránky se automaticky řídí jazykem uživatelského rozhraní, takže není potřeba jazykový panel, i když místo něj možná budete chtít mít volič jazyka rozhraní.

Toto nastavení je v současné době o něco složitější než překlad obsahu a vyžaduje konfiguraci softwaru, ale vše je obsaženo v návodu [Jak vytvořit skupinu zpráv rozhraní](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Překlad softwaru

Rozšíření Translate je vhodné pro překlad zpráv softwarového rozhraní. Na translatewiki.net se používá k překladu desítek softwarových produktů z her do webových aplikací. Rozšíření Translate podporuje čtení a aktualizaci překladů z a do běžných formátů používaných při vývoji webu, včetně souborů [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) a [Yaml](https://en.wikipedia.org/wiki/YAML).

Sledování změn je k dispozici také pro externě sledované soubory, protože interně rozšíření používá odvozenou verzi lokalizačních souborů uloženou v mezipaměti, kde je uložen zdrojový text a jeho překlady, namísto přímého použití v původním formátu. Správci překladů mohou použít webové rozhraní nebo rozhraní příkazového řádku ke kontrole nových definic zpráv a "fuzzy" (požadavek aktualizace) překladů, když potřebují aktualizaci. To funguje bez ohledu na základní formát souboru nebo systém správy verzí (pokud existuje).

Pomocí jednoduchých nástrojů příkazového řádku mohou správci překladů snadno importovat i velkou sadu existujících překladů a pomocí jediného příkazu exportovat všechny překlady ve správném formátu a ve správné adresářové struktuře. Můžete exportovat přímo do svého úložiště [VCS](https://en.wikipedia.org/wiki/Version%20control%20system), kde můžete snadno zadávat změny a nové soubory.

## Další čtení a návody

### Pro překladatele a administrátory překladů

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Snímky z workshopu o tom, jak používat [Rozšíření:Překlady](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) na Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

Videozáznam snímků v angličtině.

- [Jak překládat](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Návod]
- [Osvědčené prostupy pro překlady](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistiky a hlášení](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Záruka kvality](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Přehled stavu skupin zpráv](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[Zpracovává se] [Vyhledávání](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Offline překlad](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[Pracuje se] [Slovník pojmů](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Pro administrátory překladů

- [Jak připravit stránku k překladu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Návod]
- [Administrace překládaných stránek](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Skupiny zpráv rozhraní (lokalizovaný postranní panel, hlavní stránka a šablony)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Návod]
- \[Zpracovává se] [Správa skupin zpráv](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Konfigurační formát YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Jak psát YAML konfiguraci pro skupiny zpráv v souborech.](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Návod]

### Referenční dokumentace pro vývojáře

- [Instalace](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) a [Konfigurace](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - ve většině případů by mělo stačit [Balíček jazykových rozšíření MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle).

- [Překladové paměti](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Průvodce pro vývojáře](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[Pracuje se] [Překlad vysvětlení pro vývojáře](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Háčky](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[Zpracovává se] [Skupiny zpráv](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[Zpracovává se] [Podpora formátu souboru](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Překladatelské příručky](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Nenapsáno] [akční API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Zástupné prvky](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Skripty příkazového řádku](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Životní cyklus překladu v MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - zde je popsáno, co je spojeno s označením stránky k překladu a zpracováním překladu
  - [Architektura databáze překladů (Translation memory)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Související

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - integrační skript WikiEditor/CodeMirror pro rozšíření Translate
- [Extension:TranslationNotifications](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – obecný kurz lokalizace pro vývojáře, pro použití na hackathonech a školeních
- [Univerzální výběr jazyka](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – poskytuje webová písma a metody zadávání
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – věci, na které je třeba myslet při vytváření stránek nebo procesů na vícejazyčných wikinách
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – přidejte se do seznamu aktuálně aktivních technických překladatelů

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/cs" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016695"}
::
