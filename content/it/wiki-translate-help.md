---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/it
sourceWiki: www.mediawiki.org
sourceRevision: "8491420"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Documentazione per [Estensione:Traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Traduttori** (**[pagina di aiuto principale](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Come tradurre](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Buone pratiche](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistiche e segnalazioni](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Controllo qualità](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Stati di gruppi di messaggi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Traduzione contenuti](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Glossario](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Amministratori delle traduzioni**

- [Come preparare una pagina per la traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Page translation administration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Unstructured element translation](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Gestione dei gruppi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Spostare le pagine traduci](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Importare traduzioni tramite CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Amministratori di sistema e sviluppatori**

- [Installazione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Configurazione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Getting started with development](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Guida dello sviluppatore](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Extending Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validators](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Insertables](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Group configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Group configuration example](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Translation memories](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Translation aids](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Traduci questo template](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

La pagina speciale principale dell'estensione, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), nella sua funzione più comune, "mostrare tutti i messaggi non tradotti"

L'[estensione Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) migliora MediaWiki arricchendola di funzioni fondamentali per il lavoro di traduzione. Può essere usata per tradurre pagine di contenuti, l'interfaccia del wiki e anche altri prodotti software, come viene utilizzato in [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). L'estensione Translate possiede un'interfaccia di traduzione facile da usare e che può separare la struttura del contenuto dal contenuto del testo che deve essere tradotto, mostrando ai traduttori solo il testo traducibile suddividendo il contenuto in unità maneggevoli. Ogni unità è automaticamente monitorata in cerca di modifiche, e i traduttori vedono immediatamente quale parte di una pagina specifica o del wiki necessita di un aggiornamento.

L'estensione Translate è usata da centinaia di traduttori ogni mese per tradurre l'interfaccia utente di MediaWiki e di altri progetti software translatewiki.net. Su [userbase.kde.org](http://userbase.kde.org) viene utilizzata per tradurre quasi un migliaio di pagine di contenuti con documentazione per l'utente. È facile iniziare ad usare l'estensione Translate ma, allo stesso tempo, essa è adatta anche ai bisogni dell'utente più esperto poiché fornisce funzionalità avanzate di report, revisione e flusso di lavoro.

## Caratteristiche

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

L'editor di traduzione: un messaggio con un consiglio (non visibile nell'immagine) e suggerimenti da due assistenti di lingua

**Interfaccia:** La caratteristica principale dell'estensione Translate è l'interfaccia di traduzione semplice ma funzionale. Oltre alle informazioni essenziali quali la definizione del messaggio e la documentazione, puoi anche vedere le traduzioni in altre lingue. Se una definizione è stata modificata, vedrai i cambiamenti. L'estensione possiede alcuni controlli integrati, che possono aiutare a segnalare errori comuni come parentesi non bilanciate e variabili inutilizzate. A seconda della configurazione, possono esserci anche suggerimenti dalla memoria di traduzione e da servizi di traduzione automatici come quelli di Google Translate, Bing Translator di Microsoft e Apertium.

La fruibilità dell'interfaccia di traduzione è potenziata da JavaScript e AJAX. Il backend fornisce delle WebAPI che possono essere usate nelle interfacce per apparecchi telefonici o nelle interfacce personalizzate per tipi specifici di contenuto. È anche possibile esportare messaggi per tradurli su altri strumenti off-line ed on-line che accettano il formato di file [Gettext po](https://it.wikipedia.org/wiki/Gettext)

**Gruppi di messaggi e task:** Molte delle funzionalità sono costruite attorno a due concetti base: i gruppi di messaggi ed i task.

Un gruppo di messaggi rappresenta un insieme di messaggi. Una pagina di contenuti rappresenta un gruppo di messaggi dove, nel caso più semplice, ad ogni paragrafo corrisponde un messaggio di quel gruppo. I messaggi usati in ogni estensione MediaWiki formano un gruppo di messaggi su translatewiki.net (alcune delle maggiori estensioni posseggono più di un gruppo). Si può fare anche un gruppo di gruppi, come _Tutte le newsletter_ o _Tutti i messaggi dell'estensione Translate_. Molte delle statistiche e dei task considerano il gruppo di messaggi l'unità base su cui lavorare.

I task o, in altre parole, le diverse liste di messaggi che è possibile visualizzare all'interno di uno stesso gruppo, facilitano ognuno un compito differente. Normalmente un traduttore si trova davanti alla lista di tutti i messaggi non tradotti del gruppo di messaggi selezionato, ma ci sono task che gli danno la possibilità di revisionare i messaggi o che semplicemente gliene mostrano l'elenco completo (compresi quelli non tradotti).

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Questa pagina speciale riporta lo stato di traduzione di ogni gruppo di messaggi

**Report e statistiche:** L'estensione ha ampie [funzioni di report](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting), che spaziano dalla visualizzazione dei messaggi non tradotti all'interno di tutti i gruppi di messaggi in una data lingua fino alle liste dei traduttori per ogni lingua, con il loro livello di attività.

**Traduzione di contenuti:** Se hai mai provato a tradurre senza alcuno strumento ti sarai accorto che su larga scala non è sostenibile. Non essendoci modo di monitorare le modifiche apportate alla pagina originale, man mano che essa viene modificata le versioni tradotte diventano obsolete. In tal modo, molte traduzioni rimangono a metà oppure divengono superate senza che ci sia una visione d'insieme sullo stato complessivo della situazione. I traduttori non trovano su cosa lavorare o cosa deve essere aggiornato. Gli utenti vengono anche confusi da informazioni obsolete.

Tutto ciò viene risolto con l'estensione Translate e le sue funzioni di traduzione. Questo aggiunge un po' di overhead alle pagine da tradurre, ma i benefici sono di gran lunga maggiori. Essenzialmente, dovrai solo marcare le parti della pagina che devono essere tradotte. L'estensione poi divide tali parti in unità della grandezza di paragrafi e crea con esse un gruppo di messaggi. Dopo di ciò i traduttori possono usufruire di tutte le funzioni sopra descritte. Inoltre, puoi facilmente aggiungere una barra delle lingue con il tag `<languages />` oppure, usando link nella forma \[\[Special:MyLanguage/Pagename]], puoi decidere che i collegamenti ipertestuali portino automaticamente alla versione della pagina nella lingua preferita dell'utente, (solo) quando esiste.

Per maggiori informazioni vedere la guida su [come configurare una pagina di contenuto per la traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) e la [documentazione approfondita della funzione di traduzione di pagina](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Sviluppatori:** L'estensione supporta molti comuni formati di traduzione, come i file properties di Java e i file po di Gettext. Possiede un ampio assortimento di strumenti, sia all'interno del wiki sia su linea di comando, per importare ed esportare le traduzioni in modo efficiente.

**Ricerca:** Senza una funzionalità di ricerca, risulta difficile per i traduttori trovare degli specifici messaggi che vogliono tradurre. Scorrere tutte le traduzioni o stringhe del progetto non è molto efficiente. Oltretutto, a volte i traduttori vogliono verificare come è stato tradotto in precedenza un particolare termine in una certa lingua.

Questo problema è risolto dalla pagina speciale [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). I traduttori possono trovare i messaggi contenenti determinati vocaboli in qualsiasi lingua e filtrarli a seconda di vari criteri: questo è quello predefinito. Dopo la ricerca, possono passare alle traduzioni di tali messaggi, per esempio per trovare le traduzioni esistenti, mancanti o non aggiornate di una certa parola.

## Casi d'uso

Puoi tradurre quasi tutto con l'estensione Translate. Naturalmente ci sono degli strumenti specializzati per la traduzione di certi tipi di testi, come i sottotitoli dei video, che danno risultati migliori all'interno dei campi per cui sono pensati; ma in generale _Translate_ funziona molto bene con qualsiasi tipo di testo che puó essere suddiviso in messaggi con una lunghezza che va da una parola a un lungo paragrafo. I messaggi piú lunghi diventano poco maneggevoli da tradurre e sono dunque piú difficili da maneggiare.

I tre principali casi d'uso che l'estensione Translate supporta sono la **traduzione del contenuto**, la **traduzione dell'interfaccia locale** e la **traduzione del software**. Ognuno di essi è preso in considerazione nelle prossime sezioni, arricchito da collegamenti ipertestuali a guide e a documentazione di riferimento o, se disponibili, a pagine di aiuto che approfondiscono l'argomento. Di questi tre casi d'uso, la traduzione dell'interfaccia è il meno utilizzato.

### Traduzione del contenuto

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

La traduzione è superata: le parti non aggiornate sono rimpiazzate dal testo originale e i traduttori possono raggiungere i messaggi per aggiornarli con un solo click

La maggior parte dei wiki hanno dei contenuti che vorrebbero rendere disponibili in più lingue. Siano poche pagine o migliaia, non importa. Per non far perdere tempo ai traduttori, le pagine dovrebbero essere segnate per la traduzione solo quando sono ragionevolmente stabili. Ogni modifica fatta successivamente può avere effetto su decino o centinaia di vecchie traduzioni, ed il tempo speso dai traduttori è pari a quello necessario ad aggiornarle tutte. Bisogna tener conto di questo aspetto, in particolare per le traduzioni fatte da volontari, cercando di evitar loro lavoro inutile. Se fai uso dell'estensione Translate, se già sulla strada che porta ad utilizzare il tempo dei traduttori nel modo più efficace ed efficiente.

Il fatto che l'estensione Translate divida una pagina in unità della dimensione di paragrafi non lascia ai traduttori molta libertà di cambiare il loro contenuto. Solitamente, questo si rivela buono ed è ideale nei contesti dove viene ricercata la continuità e la consistenza del contenuto tra le lingue. Anche se si può aggirare, in teoria questo modo di realizzare le traduzioni non è adeguato, per esempio, per le voci di Wikipedia, che di solito sono completamente indipendenti l'una dall'altra. Anche nei casi in cui iniziano come traduzioni da un'altra lingua, tendono a diventare autonome dalla versione originale di un altro idioma, sogliono seguire il suo cammino indipendente della versione originale. Con _Translate_, la pagina originale rimane sempre la versione principale, e le versioni tradotte non possono aggiungere nuovo contenuto.

Tenendo a mente queste limitazioni, questa funzionalità si adatta perfettamente a moltissime situazioni. La maggior parte, se non la totalità della documentazione utente ricade in questa categoria, così come le notizie che non cambiano una volta che vengono scritte. Se l'estensione Translate è già installata e i diritti di accesso già configurati, prova a creare una pagina e a rachiudere l'intero testo dentro `<languages />...` e a seguire i link, oppure la guida su [come preparare una pagina per la traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Gruppi di pagine possono essere aggregati ulteriormente attraverso la pagina [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups).

### Traduzione dell'interfaccia nei wiki multilingui

Una cosa che praticamente ogni wiki ha personalizzato è la [barra laterale](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). È possibile creare un gruppo di messaggi per le personalizzazioni della barra laterale e, più in generale, delle interfacce delle varie lingue.

Un'espansione interessante sono le pagine o i template multilingui costruiti con la parola magica {{int:}}. La pagina principale di [translatewiki.net](https://translatewiki.net/wiki/) e alcuni template di Wikimedia Commons sono buoni esempi. La parola magica {{int:}} è un'alternativa alla funzione di traduzione di contenuto ed è più adeguata per pagine pesanti come la pagina principale di translatewiki.net. Un'altra caratteristica interessante è che la lingua della pagina segue in automatico quella dell'interfaccia utente, quindi non è necessario avere una barra delle lingue, anche se al suo posto potrebbe esserci qualcosa per selezionare la lingua dell'interfaccia.

Mettere in piedi una cosa del genere è attualmente un po' più complicato della traduzione di contenuto e richiede la configurazione del software, ma è tutto spiegato nella guida su [come fare un gruppo di messaggi per l'interfaccia](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Traduzione del software

L'estensione Translate è adatta a tradurre i messaggi dell'interfaccia di software. At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

Il controllo delle modifiche è disponibile anche per file tracciati esternamente, perché internamente l'estensione usa una versione immagazzinata in cache, derivata dai file di localizzazione, nella quale sono memorizzati il testo originale e le sue traduzioni, che quindi non sono usati direttamente nel loro formato originale. Gli amministratori di traduzione possono usare sia l'interfaccia web che l'interfaccia a riga di comando per controllare le nuove definizioni dei messaggi e le traduzioni di cui è richiesto l'aggiornamento. Il tutto funziona a prescindere dal formato dei file sottostante e dal sistema di controllo versione (nel caso in cui sia presente).

Con semplici strumenti a linea di comando, gli amministratori di traduzione possono importare facilmente anche un grande insieme di traduzioni esistenti e con un solo comando possono esportare tutte le traduzioni nel formato corretto e nella struttura di directory corretta. Puoi esportare direttamente nel checkout del repository del tuo [sistema di controllo di versione](https://en.wikipedia.org/wiki/it:controllo%20di%20versione), dove puoi facilmente fare un commit delle modifiche e dei nuovi file.

## Ulteriori guide ed approfondimenti

### Per traduttori e amministratori di traduzione

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Diapositive di un seminario a Wikimania17 su come usare [l'estensione Translate](https://www.mediawiki.org/wiki/Extension:Translate).

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=rest\&utm_content=original)

A videocast in English of the slides.

- [Come tradurre](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Guida]
- [Buone norme di traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistiche e rapporti informativi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Controllo di qualità](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Stati dei gruppi di messaggi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[In corso] [Ricerca](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Traduzione offline](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[In corso] [Glossario](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Per gli amministratori di traduzione

- [Come preparare una pagina per la traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Guida]
- [Amministrazione della traduzione delle pagine](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Gruppi di messaggi dell'interfaccia (barra laterale localizzata, pagina principale e template)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Guida]
- \[In corso] [Gestione dei gruppi di messaggi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Formato di configurazione YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Come scrivere configurazione YAML per gruppi di messaggi basati su file](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Guida]

### Documenti di riferimento per gli sviluppatori

- [Installazione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) e [Configurazione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Language Extension Bundle](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) dovrebbe essere abbastanza nella maggior parte dei casi.

- [Memorie di traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Guida dello sviluppatore](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[In corso] [Translate spiegato per gli sviluppatori](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Collegamenti](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[In corso] [Gruppi di messaggi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[In corso] [Supporto dei formati di file](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Aiuti di traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Non scritto] [Azione di API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Inseribili](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Script della riga di comando](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Flusso di processo nei compiti di MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Descrive che compiti sono coinvolti quando una pagina è segnata per essere tradotta o una sezione è stata tradotta
  - [Architettura della memoria di traduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### In relazione

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extensione:NotificaTraduzione](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Guida generale alla localizzazione per sviluppatori, da usare per hackathon e allenamenti
- [Universal Language Selector](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Fornisce web font e metodi di input
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – cose a cui pensare quando si creano pagine o processi su wiki multilingui
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Aggiungiti alla lista dei traduttori tech attualmente attivi

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/it" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8491420"}
::
