---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/lt
sourceWiki: www.mediawiki.org
sourceRevision: "8133184"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Dokumentacija skirta [Plėtinys:Versti](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Vertėjams** (**[pagrindinis pagalbos puslapis](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Kaip versti](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Praktiniai patarimai](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistika ir ataskaitos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kokybės užtikrinimas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Pranešimų grupės būsena](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Vertimas neprisijungus](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Terminų žodynas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Vertimo administratoriams**

- [Kaip paruošti puslapį vertimui](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Puslapio vertimo kontrolė](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Nestruktūrinis elementų vertimas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Grupės valdymas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Move translatable page](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import translations via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Sysadminams ir plėtotojams**

- [Įdiegimas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Konfigūracija](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Getting started with development](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Developer guide](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Išplėstas vertimas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validators](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Įterpiniai](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Group configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Group configuration example](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Translation memories](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Translation aids](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Išversti šį šabloną](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Plėtinio "[Special:Versti](https://www.mediawiki.org/wiki/Special:Versti?action=edit\&redlink=1)" pagrindinio specialiojo puslapio dažniausiai naudojamas režimas, "žiūrėk visus neišverstus pranešimus".

[Vertimo plėtinys](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) papildo "MediaWiki" esminėmis funkcijomis, reikalingomis vertimo darbui atlikti. Jį galima naudoti turiniui, "vikio" sąsajai ir net kitai programinei įrangai, kaip tai daroma svetainėje [translatewiki.net](https://www.mediawiki.org/wiki/$twn?action=edit\&redlink=1), versti. Plėtinys "Versti" turi lengvai naudojamą vertimo sąsają ir gali atskirti puslapio struktūrą nuo paties turinio, kurį reikia išversti, rodydamas vertėjams tik verčiamą tekstą, ir suskirstydamas turinį į lengvai valdomus vienetus. Kiekvienas teksto vienetas stebimas dėl pakeitimų, ir vertėjai iš karto mato ką reikia atnaujinti tiek atskirame puslapyje, tiek visame "vikyje".

Kiekvieną mėnesį šimtai vertėjų naudoja plėtinį "Versti" "MediaWiki" naudotojo sąsajai bei kitiems programinės įrangos projektams svetainėje translatewiki.net, versti. Svetainėje [userbase.kde.org](http://userbase.kde.org) jis naudojamas beveik tūkstančio puslapių tūriniui, kartu su naudotojo dokumentacija, išversti. Pradėti naudoti plėtinį "Versti" yra lengva, bet jis taip pat yra tobulinamas ir turi pažangias ataskaitų teikimo, patikrinimo ir darbo eigos funkcijas.

## Ypatumai

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Vertimo redaktorius: verčiamas pranešimas su patarimu (jo paveikslėlyje nesimato) ir pasiūlymais iš dviejų pagalbinių kalbų

**Sąsaja:** Pagrindinis plėtinio "Versti" ypatumas - paprasta, tačiau funkcionali vertimo sąsaja. Be tokios svarbios informacijos kaip verčiamo pranešimo apibrėžimai ir dokumentacija, taip pat galima peržiūrėti vertimus į kitas kalbas. Jei apibrėžimai pasikeičia, jūs tuos pakeitimus matysite. Į plėtinį integruotos patikros padės ištaisyti dažniausiai pasitaikančias klaidas, tokias kaip skliaustelių nesubalansavimas arba nenaudojami kintamieji. Priklausomai nuo konfigūracijos, taip pat gali būti pasiūlymų iš jau išversto teksto ("translation memory") bei mašininio vertimo sistemų, tokių kaip Google Translate, Microsoft's Bing Translator ir Apertium.

Vertimo sąsajos patogumą naudotis pagerina "JavaScript" ir AJAX. Vidinė sąsaja ("backend") pateikia WebAPI (Aplikacijų programavimo sąsąjas), kurios gali būti naudojamos mobiliuosiose arba tam tikram turiniui skirtose sąsajose. Taip pat įmanoma eksportuoti pranešimus vertimui į kitus atjungties ("off-line") bei prijungties ("on-line") režimu veikiančius įrankius, kurie priima [Gettext po](https://en.wikipedia.org/wiki/Gettext) failo formatą.

**Pranešimų grupės ir užduotys:** Daugelis ypatumų pagrįsti dviem pagrindinėmis sąvokomis: pranešimų grupės ir užduotys.

Pranešimų grupė yra pranešimų rinkinys. Vieno puslapio turinys būtų viena pranešimų grupė, kur paprasčiausiu atveju, kiekviena pastraipa būtų vienas pranešimas toje grupėje. Kiekviename "MediaViki" plėtinyje naudojami pranešimai sudaro svetainės translatedwiki.net pranešimų grupes, o keli ypač stambūs plėtiniai turi kelias grupes. Taip pat galite sukurti grupių grupę, kaip pvz., _Visi naujienlaiškai_ arba _Visi vertimo plėtinių pranešimai_. Daugelis statistinių duomenų ir užduočių veikia pranešimų grupių pagrindu.

Užduotys, arba kitaip tariant, skirtingi grupės pranešimų sąrašai, palengvina įvairius darbo atlikimo scenarijus. Paprastai, vertėjas gauna visų grupėje neišverstų pranešimų sąrašą, bet būna užduočių, kur pranešimus galima peržiūrėti arba gauti visų, tiek išverstų tiek neišverstų, pranešimų sąrašą.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Šiame puslapyje pranešama apie kiekvienos pranešimų grupės vertimo būseną

**Ataskaitos ir statistika:** Plėtinys turi platų [ataskaitos funkcijų](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) sąrašą, pradedant neišverstų pranešimų parodymu tam tikrai kalbai visose pranešimų grupėse, ir baigiant vertėjų sąrašu kiekvienai kalbai, kartu su jų aktyvumo lygio parodymu.

**Turinio vertimas:** Jei kada nors mėginote versti medžiagą iš "MediaWiki" be jokių įrankių, jūs suprantate problemos mastą. Išverstos versijos pasensta ir nėra galimybės sekti pakeitimus pagrindiniame puslapyje, todėl atsiranda daug pusiau išverstos ir pasenusios medžiagos, neturint galimybės sužinoti jos tikslią būseną. Vertėjai dažani būna nusiminę, kai negali dirbti su mažesnėmis teksto atkarpomis, kurias lengva valdyti. Jiems sunkiau rasti ką dirbti ir ką reikia atnaujinti. Naudotojai taip pat pasimeta tarp pasenusios informacijos.

Visa tai išsprendžiama plėtinio "Versti" ir jo puslapių vertimo funkcijų pagalba. Tai kiek padidina puslapio, kurį reikia išversti apkrovą, tačiau nauda visą tai nusveria. Iš esmės, reikia tik pažymėti tas puslapio dalis, kurias reikia išversti. Toliau, plėtinys suskirstys jas į pastraipos didžio segmentus ir sukurs jiems pranešimų grupę. Tada vertėjai galės pasinaudoti visomis pirmiau paminėtomis funkcijomis. Be to, lengvai galima pridėti kalbos juostą su žyma `<languages />` arba padaryti, kad nuorodos automatiškai nukreiptų į naudotojo pageidaujamą kalbos versiją (tik), jei tokia yra, naudojant \[\[Special:MyLanguage/Pagename]] formos nuorodas.

Daugiau informacijos rasite vadovėliuose ["Kaip paruoši puslapį vertimui"](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) ir ["Išsami puslapio vertimo funkcijos dokumentacija"](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Programuotojai:** Į plėtinį integruotas daugelio įprastų vertimo failų formatų, pavyzdžiui, Java savybių ir Gettext po, palaikymas. Plėtinys turi platų įrankių rinkinį, tiek pačiame "Vikyje" tiek komandų eilutėje ("command line"), kad būtų galima sėkmingai importuoti ir eksportuoti vertimus.

**Paieška:** Be paieškos funkcijos vertėjams būtų sunku rasti tam tikrus pranešimus, kuriuos jie norėtų išversti. Visų vertimų arba projekto eilučių peržiūra nėra efektyvi. Be to, vertėjai dažnai nori patikrinti, kaip tam tikras terminas išverstas į tam tikrą kalbą tame projekte.

Šis uždavinys išsprendžiamas specialiojo [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations) puslapio pabalba. Vertėjai gali surasti pranešimus, kuriuose yra tam tirkų terminų bet kuria kalba ir filtruoti juos pagal įvairius kriterijus: tai numatytoji reikšmė. Po paieškos, jie gali perjungti rezultatus į minėtų pranešimų vertimus, pavyzdžiui, surasti tam tikro termino esamus, nesamus ar pasenusius vertimus.

## Naudojimo pavyzdžiai

Plėtinio "Versti" pagalba galima išversti beveik viską. Žinoma, yra specializuotų įrankių, skirtų tam tikram turiniui, tokiam kaip vaizdo įrašų subtitrai, versti, ir tai geriausia padaryti naudojant tuos įrankus, bet apskritai, plėtinys gerai apdoroja bet kokį tekstą, kurį galima suskirstyti į vieno žodžio arba vienos didelės pastraipos didžio pranešimus. Ilgesni pranešimai per daug gremėzdiški vertimui ir su jais sunkiau dirbti.

Trys pagrindiniai plėtinio "Versti" naudojimo vairantai yra **turinio vertimas**, **sąsajos lokalizacija** ir **programinės įrangos vertimas**. Visi jie aptariami tolesniuose skyriuose su nuorodomis (kur tai prieinama) į mokomąją bei informacinę medžiagą, taip pat išsamią teminę pagalbą. Iš trijų naudojimo variantų, "sąsajos lokalizacija" yra mažiausiai naudojama.

### Turinio vertimas

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Šis vertimas paseno: pasenusios dalys pakeistos nauju pirminiu tekstu ir vertėjai vienu spustelėjimu gali pasiekti pranešimus, kuriuos reikia atnaujinti.

Dauguma "vikių" turi turinio, kuris, kaip jie norėtų, būtų pasiekiamas keliomis kalbomis. Nesvarbu, ar tai tik keli ar šimtai puslapių. Tam, kad nebūtų gaištamas vertėjų laikas, puslapiai turi būti pažymėti vertimui tik tuomet, kai jie yra pakankamai stabilūs. Dėl kiekvieno vėliau padaryto pakeitimo dešimtys ar šimtai vertimų taps pasenusiais, ir jiems atnaujinti reikalingas laikas padidės. Reikia turėti tai omenyje, ypač jei vertėjai - savanoriai, branginti laiką, kurį jie skiria vertimui ir atnaujinimui, ir vengti bereikalingo darbo. Jei puslapių vertimui naudojate plėtinį "Versti", esate teisingame kelyje į veiksmingiausią ir efektyviausią vertėjų turimo laiko panaudojimą.

Dėl to, kad plėtinys "Versti" suskirsto puslapį į pastraipos didžio segmentus, vertėjai neturi per daug laisvės keisti turinį. Paprastai, tai gerai ir idealiai tinka, kai pageidaujamas turinio tęstinumas ir nuoseklumas visomis kalbomis. Galima tai apeiti, bet iš esmės toks vertimo būdas ne visada tinka, pavyzdžiui, "Vikipedijos" straipsniams, kurie paprastai yra visiškai nepriklausomi vieni nuo kitų. Net jei iš pradžių jie prasideda kaip vertimo iš kitos kalbos variantas, paprastai toliau jie pradeda gyventi savo, nuo originalo kalbos nepriklausomą gyvenimą. Naudojant gi plėtinį "Versti", originalus puslapis visada yra pagrindinė versija, ir išverstoje puslapio versijoje negali atsirasti naujas turinys.

Turint omenyje šiuos apribojimus, vis dar yra daugybė atvejų, kai ši funkcija puikiai tinka. Į šią kategoriją patenka dauguma, jei ne visi, naudotojo dokumentai, taip pat į naujienas panašus turinys, kuris po parašymo nesikeičia. Jei jau turite įdiegtą plėtinį "Versti" ir sukonfigūruotas prieigos teises, pabandykite sukurti puslapį ir visą tekstą suvynioti į `<languages />...` ir vadovaukitės nuorodomis arba vadovaukitės vadovėliu ["Kaip paruošti puslapį vertimui"](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Puslapių grupės gali būti tolaiu grupuojamos kartu puslapio [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups) pagalba.

### Sąsajos lokalizacija daugiakalbiuose "vikių" projektuose

Beveik kiekviename "vikyje" pritaikoma [šoninė juosta](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Galima sukurti pranešimų grupę šoninės juostos bei kitų sąsajos nustatymų lokalizacijai.

Vienas įdomių išplėtimų - daugiakalbiai puslapiai arba šablonai, sukurti naudojant stebuklaingąjį žodį {{int:}}. Geri to pavyzdžiai yra [translatewiki.net](https://translatewiki.net/wiki/) pagrindinis puslapis ir kai kurie "Wikimedia Commons" šablonai. Stebuklingasis žodis {{int:}} yra turinio vertimo funkcijos alternatyva, ir labiau tinka sunkių puslapių, tokių kaip translatewiki.net pagrindinis puslapis, žymėjimui. Kitas patrauklus ypatumas yra tas, kad puslapio kalba automatiškai nusistato pagal naudotojo sąsajos kalba, dėl to nėra būtinybės turėti kalbų parinkimo juostą, nors jūs, vietoj to, galbūt norėtumėte turėti galimybę pačiam pasirnkti sąsajos kalbą.

Šiuo metu šis būdas yra kiek sudetingesnis nei turinio vertimas, ir reikalauja programinės įrangos konfigūravimo, tačiau visa tai aprašoma pamokoje ["Kaip sukurti sąsajos pranešimų grupę](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Programos vertimas

Plėtinys "Versti" puikiai tinka programinės įrangos sąsajos pranešimams versti. Puslapyje translatewiki.net jis naudojamas dišimtims programinės įrangos produktų, nuo žaidimų iki žiniatinklio programų, versti. Plėtinys palaiko vertimų skaitymą ir atnaujinimą iš ir į įprastus formatus, naudojamus kuriant žiniatinklio svetaines, įskaitant [Java savybių](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) ir [Yaml](https://en.wikipedia.org/wiki/YAML) failus. At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

Pakeitimų sekimas galimas ir išoriškai sekamiems failams, nes plėtinio viduje naudojama lokalizacijos failų išsaugotą išvestinę versiją, kurioje saugomi pirminis tekstas ir jo vertimai, vietoje jų panaudojimo tiesiogiai originaliu formatu. Vertimo administratoriai gali naudoti tiek žiniatinklio tiek komandinės eilutės sąsają naujų pranešimų apibrėžtims arba pasenusių ("fuzzy") prenešimų tikrinimui, kai pastariesiems reikia atnaujinimo. Tai veikia nepriklausomai nuo pagrindinio failo formato ar versijų valdymo sistemos (jei tokia yra).

Naudodami paprastus komandinės eilutės įrankius, vertimo administratoriai gali lengvai importuoti net ir didelį esamų vertimų rinkinį ir tik viena komanda eksportuoti visus vertimus tinkamu formatu ir į tinkamą katalogų struktūrą. Eksportuoti galima tiesiai į [VCS](https://en.wikipedia.org/wiki/Version%20control%20system) saugyklos kontrolės punktą, kur galima lengvai padaryti pakeitimus ir sukurti naujus failus.

## Tolimesnis skaitymas ir pamokos

### Vertėjams ir vertimo administratoriams

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Pratybų, kaip panaudoti [Plėtinys:Versti](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) svetainėje "Wikimania17", skaidrės.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [Kaip versti](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Pamoka]
- [Geriausi vertimo praktiniai patarimai](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistika ir ataskaitos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kokybės užtikrinimas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Pranešimų grupės būsena](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[Vykdoma] [Paieška](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Vertimas neprisijungus ("off-line")](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[Vykdoma] [Žodynas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

## Vertimo administratoriams

- [Kaip paruošti puslapį vertimui](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Pamoka]
- [Puslapio vertimo administracija](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Sąsajos pranešimų grupės (lokalizuoti šoninė juosta, pagrindinis puslapis ir šablonai)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Pamoka]
- \[Vykdoma] [Pranešimų grupės valdymas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML konfigūravimo formatas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Kaip nustatyti YAML konfigūraciją failų pagrindų veikiančioms pranešimų grupėms.](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Pamoka]

### Kūrėjams skirti informaciniai dokumentai

- [Įdiegimas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) ir [Konfigūracija](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - Daugeliu atvejų turėtų pakakti [MediaWiki Language Extension Bundle](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle).

- [Vertimo atminties įrankiai](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Kūrėjo vadovas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[Vykdoma] [Vertimo procesas - paaiškinimai kūrėjams](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Kabliukai (hooks)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[Vykdoma] [Pranešimų grupės](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[Vykdoma] [Failų formatų palaikymas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Pagalbinės vertimo priemonės](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Dar neparašyta] [veiksmų API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Įterpimai](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Komandinės eilutės scenarijai](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - ["MediaViki" užduočių procesų eiga](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Aprašo, kokios užduotis atliekamos, kai puslapis pažymimas vertimui arba yra verčiamas skyrius.
  - [Vertimo atminties architektūra](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Susijusi medžiaga

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Bendroji lokalizacijos pamoka kūrėjams, skirta naudoti "hakatonuose" (renginiai, skirti IT specialistams sukūrti tam tikrą IT projektą) ir mokymuose.
- [Universal Language Selector](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Pateikia žiniatinklio šriftus ir įvesties metodus
- [m:Verčiamumas](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – apie ką reikia pagalvoti kuriant puslapius ar procesus daugiakalbiuose "vikiuose"
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Įtraukite save į šiuo metu aktyvių techninių vertėjų sąrašą

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/lt" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8133184"}
::
