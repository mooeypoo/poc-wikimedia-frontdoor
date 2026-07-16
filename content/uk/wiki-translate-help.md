---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/uk
sourceWiki: www.mediawiki.org
sourceRevision: "8016740"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Документація до [Розширення:Переклад](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Перекладачам** (**[головна довідкова сторінка](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Як перекладати](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Кращий досвід](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Статистика та звіти](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Забезпечення якості](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Стан груп повідомлень](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Офлайн переклад](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Глосарій](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Адміністраторам перекладу**

- [Як підготувати сторінку до перекладу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Адміністрування перекладу сторінок](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Переклад неструктурованих елементів](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Керування групами](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Переміщення сторінки, що перекладається](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import translations via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Сисадміни та розробники**

- [Встановлення](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Налаштування](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Початок роботи з розробкою](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Посібник розробника](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Розширення до Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Валідатори](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Вставні](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Конфігурації групи](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Group configuration example](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Translation memories](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Translation aids](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Перекласти цей шаблон](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Головна спеціальна сторінка розширення, «[Special:Translate](https://www.mediawiki.org/wiki/Special:Translate)», і її найбільш вживане застосування, «переглянути всі неперекладені повідомлення»

[Розширення Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) покращує MediaWiki функціями, необхідними для здійснення перекладу. Воно може використовуватись для перекладу вмісту сторінок, інтерфейсу вікі та навіть інших продуктів програмного забезпечення, як наприклад на [translatewiki.net](https://www.mediawiki.org/wiki/$twn?action=edit\&redlink=1). Розширення Translate має легкий у використанні інтерфейс і дозволяє відділити структуру вмісту від мови перекладу, показуючи перекладачам лише той текст, який має бути перекладеним, поділяючи його на невеликі блоки. Зміни у кожному блоці автоматично відслідковуються, і перекладачі одразу бачать, що потребує оновлення на спеціальній сторінці або в самій вікі.

Розширення Translate використовується для перекладу користувацького інтерфейсу MediaWiki та інших продуктів ПЗ на translatewiki.net сотнями перекладачів щомісяця. На [userbase.kde.org](http://userbase.kde.org) воно використовується для перекладу близько тисячі сторінок контенту з користувацькою документацією. Розширення Translate легко почати використовувати, і водночас воно покращує і дає ширші можливості звітності, аналізу і гнучких засобів.

## Характеристики

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Редактор перекладу: повідомлення з описом (не видно на зображенні) і підказкою з двох допоміжних мов

**Інтерфейс**: Основною рисою розширення Translate є простий і функціональний перекладацький інтерфейс. Окрім необхідної інформації у вигляді самого повідомлення і документації, Ви можете також переглянути переклади іншими мовами. Якщо повідомлення змінювалось, Ви побачите зміни. Розширення містить деяку автоматичну перевірку, яка допомагає виправити поширені помилки: незакриті дужки чи невикористані змінні. Залежно від налаштувань, також відображаються підказки з пам'яті перекладів і сервісів машинного перекладу, наприклад, Google Translate, Microsoft's Bing Translator, Apertium, Yandex.

Зручність і простота перекладацького інтерфейсу розширена JavaScript і AJAX. Бек-енд надає WebAPI, що можуть бути використані у мобільних інтерфейсах чи таких, що прив'язані до певного виду контенту. Також можна експортувати повідомлення для перекладу в інші офлайн та онлайн засоби, які підтримують формат файлів [Gettext po](https://uk.wikipedia.org/wiki/Gettext).

**Групи повідомлень і завдання:** Багато характеристик пов'язані з двома основними принципами: наявністю груп повідомлень і завдань.

Група повідомлень містить певний набір повідомлень. Одна сторінка вікі буде однією групою повідомлень, де, у найпростішому випадку, кожен абзац буде одним повідомленням у групі. Повідомлення, що використовуються у кожному розширенні MediaWiki, формують групу повідомлень на translatewiki.net — деякі з найбільших розширень мають декілька груп. Ви також можете створити групу груп, наприклад _All newsletters_ або _All Translate extension messages_. Багато статистики і завдання ґрунтуються на групах повідомлень.

Завдання, іншими словами — різноманітні списки повідомлень у групі повідомлень, корисні у різних випадках. Зазвичай, перекладач отримує список усіх неперекладених повідомлень із обраної групи повідомлень, але є завдання, де можна вичитувати повідомлення, або просто переглянути список повідомлень, і перекладених, і ні.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Спеціальна сторінка відображає статут перекладу кожної групи повідомлень

**Звітність і статистика:** Розширення має додаткові [можливості звітності](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) починаючи з перегляду неперекладених повідомлень усіх груп повідомлень даною мовою до списків перекладачів за мовою з їхнім рівнем активності.

**Переклад вмісту:** Якщо Ви колись пробували перекладати вміст MediaWiki без будь-яких засобів, то знаєте, що це не воно. Перекладені версії потребують оновлення, але немає ніякої можливості відслідковувати зміни вихідної сторінки, тому залишається багато незакінчених і застарілих перекладів без чіткої вказівки на загальний статус. Перекладачі часто почуваються подавленими, коли не можуть працювати з малими порціями тексту. Перекладачі не можуть знайти з чим працювати і що потребує оновлення. Користувачі також розгублені, коли стикаються із застарілою інформацією.

Усе це можна вирішити з допомогою розширення Translate і його можливостей перекладу сторінок. Воно додає свою розмітку у сторінки до перекладу, але виграш це переважує. Власне кажучи, Вам треба просто позначити частини сторінки, які потребують перекладу. Потім розширення поділить такі частини на блоки завбільшки з абзац і створить з них нову групу повідомлень. Після цього перекладачі можуть користуватись усіма можливостями, описаними вище. На додачу, Ви можете легко додати мовну панель з допомогою тегу `<languages />` або дозволити посиланням автоматично перенаправляти на версію мовою, що зазначена у налаштуваннях користувача, (тільки) якщо вона існує, використовуючи посилання зі сторінки \[\[Special:MyLanguage/Pagename]].

Для детальнішої інформації див. посібник [Як позначити сторінку для перекладу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) та [глибшу документацію можливостей перекладу сторінок](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Розробникам:** У розширенні є вбудована підтримка багатьох поширених форматів файлів перекладу, наприклад Java properties і Gettext po files. Воно має додатковий набір засобів, як у вікі, так і командного рядка, для продуктивного імпорту та експорту перекладів.

**Пошук:** Без функції пошуку перекладачам важко знайти конкретні повідомлення, які вони хочуть перекласти. Обхід усіх перекладів або рядків проєкту неефективний. Крім того, перекладачі часто хочуть перевірити, як певний термін був перекладений певною мовою в рамках проєкту.

Це вирішує спеціальна сторінка [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Перекладачі можуть знаходити повідомлення, що містять певні терміни, будь-якою мовою та фільтрувати за різними критеріями: це за замовчуванням. Після пошуку вони можуть переключити результати на переклади зазначених повідомлень, наприклад, щоб знайти наявні, відсутні або застарілі переклади певного терміна.

## Випадки використання

Розширенням Translate Ви можете перекладати фактично все. Звичайно, є спеціальні засоби для перекладу певних типів текстів, таких як субтитри до відео, які краще перекладати ними, але загалом _Translate_ досить добре справляється з будь-яким типом тексту, який можна поділити на повідомлення з довжиною, що коливається від одного слова до одного великого абзацу. Довші повідомлення стають громіздкими для перекладу і з ними просто важче працювати.

Розширення Translate підтримує три основні випадки перекладів: **переклад вмісту**, **переклад локального інтерфейсу** та **переклад програмного забезпечення**. Усі вони описані у наступних пунктах, з посиланнями на посібники та документацію або глибоку довідку, де це можливо. З трьох випадків переклад інтерфейсу використовується найрідше.

### Переклад вмісту

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Цей переклад застарів: застарілі частини замінені на новий вихідний текст і перекладачі можуть одним кліком дістатись до повідомлень, які треба оновити

На більшості вікі розміщено вміст, до якого добре було б мати доступ кількома мовами. Немає різниці, кілька сторінок чи кілька сотень. Щоб уберегти перекладачів від марної трати часу, сторінки мають бути позначені для перекладу, тільки якщо вони достатньо стабільні. Кожна зміна, зроблена після цього, може вплинути на десятки і сотні старіших перекладів і кількість часу, необхідного для оновлення, зростає. Особливо це стосується добровільних перекладачів; Ви маєте пам'ятати про цей аспект і поважати час, який вони витрачають на переклади і оновлення, та не додавати їм зайвої роботи. Якщо Ви користуєтесь розширенням Translate для перекладу сторінко, то Ви вже на шляху до найбільш ефективного і продуктивного використання вільного часу перекладачів.

Спосіб, у який розширення Translate поділяє сторінку на блоки завбільшки за абзац, не залишають перекладачам багато можливостей змінювати вміст. Це зазвичай добре, і взагалі ідеально, якщо бажано дотриматись неперервності і постійності вмісту усіма мовами. Можна і обійти, але загалом такий спосіб перекладів не надто прийнятний, наприклад, для статей Вікіпедії, які зазвичай узагалі повністю незалежні одна від одної. Навіть якщо вони спочатку започатковуються як переклади з іншої мови, потім вони здебільшого починають жити своїм незалежним життям. Із _Translate_ оригінальна версія завжди є головною, а у перекладені версії не можна дописувати новий вміст.

Навіть із врахуванням цих обмежень залишається багато випадків, у яких це розширення — ідеальне рішення. До цієї категорії потрапляє більшість, якщо не всі, сторінки документації, а ще новини, які, одного разу написані, уже не змінюються. Якщо Ви вже встановили розширення Translate і налаштували права доступу, спробуйте створити сторінку помістити увесь текст у теги `<languages />...` і слідувати за підказками або почитати посібник [Як підготувати сторінку до перекладу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Групи сторінок можна додатково об’єднати разом зі сторінкою [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups).

### Локалізація інтерфейсу у багатомовних вікі

Є одна річ, яка налаштовується майже у кожній вікі — [бічна панель](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Можна створити окрему групу для повідомлень бічної панелі і також для інших елементів локалізації інтерфейсу.

Корисною є побудова багатомовних сторінок чи шаблонів з використанням магічного слова {{int:}}. Головна сторінка [translatewiki.net](https://translatewiki.net/wiki/) і деякі шаблони Вікісховища — хороші цьому приклади. Магічне слово {{int:}} є альтернативою можливості перекладу вмісту і так зручніше позначати громіздкі сторінки, як-то головна translatewiki.net. Іншою корисною характеристикою є те, що мова сторінки автоматично вибирається та, що вказана у налаштуваннях користувача, тому необхідності у панелі мов фактично немає, хоча Ви можете натомість помістити перемикач мов інтерфейсу.

Встановлення цього зараз трохи складніше, ніж переклад вмісту, і потребує налаштування ПЗ, але це все роз'яснено у посібнику [Як зробити групу повідомлень інтерфейсу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)

### Переклад програмного забезпечення

Розширення Translate гарне для перекладу інтерфейсу програмного забезпечення. На translatewiki.net воно використовується для десятків програм від ігор до веб-додатків. Розширення Translate підтримує читання та оновлення перекладів усіх загальновживаних форматів, що використовуються у веб-розробці, включаючи [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) і [Yaml](https://en.wikipedia.org/wiki/uk:YAML) файли. At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

Спостереження за змінами також доступне для зовнішньо відстежуваних файлів, бо внутрішньо розширення використовує кешовану вторинну версію файлів локалізації, де зберігається вихідний текст і його переклад, замість того, щоб використовувати їх напряму в оригінальному форматі. Адміністратори перекладу можуть або використовувати веб-інтерфейс, або інтерфейс командної стрічки, щоб перевіряти нові повідомлення і «fuzzy» (позначені застарілими), коли вони потребують оновлення. Це працює не залежно від основного формату файлів або версії системи контролю (якщо вона є).

З допомогою простих засобів командної стрічки адміністратори перекладу можуть легко імпортувати навіть великі обсяги існуючих перекладів у всього однією командою вони можуть експортувати усі переклади у коректному формати і з правильною структурою директорій. Ви можете експортувати прямо до Вашого сховища перевірки [VCS](https://en.wikipedia.org/wiki/en:Version%20control%20system), де можна легко додавати зміни і нові файли.

## Додаткова література та інструкції

### Для перекладачів та адміністраторів перекладу

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Слайди семінару про те, як використовувати [Розширення:Переклад](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) на Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [Як перекладати](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Посібник]
- [Кращі практики перекладу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Статистика та звіти](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Забезпечення якості](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Стани груп повідомлень](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[У процесі] [Знайти](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Офлайн переклад](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[У процесі] [Глосарій](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Для адміністраторів перекладу

- [Як підготувати сторінку до перекладу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Посібник]
- [Адміністрування перекладу сторінок](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Групи повідомлень інтерфейсу (локалізована бічна панель, головна сторінка і шаблони)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Посібник]
- \[У процесі] [Керування групами повідомлень](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Формат налаштування YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Як створити налаштування YAML для основних груп повідомлень](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Посібник]

### Документація для розробників

- [Встановлення](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) та [Налаштування](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Language Extension Bundle](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) у більшості випадків має бути достатньо.

- [Пам'ять перекладів](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Посібник розробника](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[У процесі] [Пояснення Translate для розробників](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Інструменти](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[У процесі] [Групи повідомлень](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[У процесі] [Підтримка форматів файлів](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Підказки перекладів](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Не написано] [action API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Вставні](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Скрипти командного рядка](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Потік процесу в завданнях MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Описує, які завдання використовуються, коли сторінка позначена для перекладу або розділ.
  - [Архітектура пам'яті перекладів](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Див. також

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – загальний посібник з локалізації для розробників, для використання на хакатонах і тренінгах
- [Універсальний мовний селектор](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – вибір веб-шрифтів та методів вводу
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – про що потрібно думати під час створення сторінок або процесів на багатомовних вікі
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Додайте себе до списку наразі активних технічних перекладачів

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/uk" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016740"}
::
