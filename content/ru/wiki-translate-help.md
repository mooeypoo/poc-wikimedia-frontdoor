---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/ru
sourceWiki: www.mediawiki.org
sourceRevision: "8016732"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Документация для [Расширение:Перевод](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Переводчикам** (**[главная страница справки](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Как переводить](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Практические советы](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Статистика и отчёты](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Качество переводов](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Состояния группы сообщений](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Перевод в оффлайне](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Словарь терминов](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Администраторам перевода**

- [Как подготовить страницу к переводу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Управление переводом страницы](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Перевод неструктурированных элементов](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Управление группами сообщенй](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Переместить переводимую страницу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Импорт переводов через CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Работа с пакетами сообщений](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Сисадминам и разработчикам**

- [Установка](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Настройка](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Вводное для разработчика](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Руководство разработчику](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Расширенный перевод](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Проверки](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Вставки](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Настройки группы](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Пример настройки групп](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Память переводов](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Подсказки для перевода](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Включение пакетов сообщений](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [Обработчики прерываний (хуки) PHP](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Переведите этот шаблон](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Основная служебная страница расширения, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), в наиболее распространённом режиме: «просмотр всех непереведённых сообщений»

[Расширение перевода](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) расширяет MediaWiki с помощью основных функций, необходимых для выполнения работы по переводу. Его можно использовать для перевода статей и страниц с текстами, проектного интерфейса и других программных продуктов, поскольку он используется на [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). Расширение Translate поставляется с простым в использовании интерфейсом перевода и может отделять структуру контента от текстового контента, который необходимо перевести, показывая переводчикам только переводимый текст, разделяя контент на управляемые единицы(блоки). Каждый модуль автоматически отслеживается на предмет изменений, и переводчики сразу видят, что нужно обновить на определенной странице или во всей вики.

Расширение Translate используется для перевода пользовательского интерфейса MediaWiki и других программных проектов на translatewiki.net сотнями переводчиков каждый месяц. В [userbase.kde.org](http://userbase.kde.org) он используется для перевода почти тысячи страниц с пользовательской документацией. Начать использовать расширение Translate легко, но в то же время оно также масштабируется и предоставляет расширенные функции отчетности, проверки и рабочего процесса.

## Возможности

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Форма редактирования перевода: переводимое сообщение с советом и подсказкой (не видно на иллюстрации) из перевода на вспомогательном языке

**Интерфейс:** Главной особенностью расширения перевода является простой, но вместе с тем функциональный интерфейс перевода. Кроме важной информации, такой как определения сообщения и документация, вы можете также просматривать переводы на другие языки. Когда определение изменяется, вы видите изменения. Расширение поставляется с некоторыми встроенными проверками, которые могут помочь с такими распространёнными ошибками, как несбалансированные скобки и неиспользуемые переменные. В зависимости от конфигурации, существуют также подсказки из уже переведённых сообщений и таких сервисов машинного перевода, как Google Translate, Microsoft's Bing Translator и Apertium.

Качество использования интерфейса перевода расширяется с помощью JavaScript и AJAX. Бэкенд предоставляет Web API, которые могут быть использованы в мобильных интерфейсах или интерфейсов, предназначенных для специфического содержимого. Также возможно экспортировать сообщения для перевода в другие онлайновые и оффлайновые инструменты, которые понимают формат файлов [Gettext po](https://en.wikipedia.org/wiki/Gettext).

**Группы сообщений и задачи:** Множество особенностей построено на основе двух базовых концепций: группы сообщений и задачи.

Группа сообщений представляет собой набор сообщений. Содержание одной страницы преобразуется в одну группу сообщений, где, в простейшем случае, каждый абзац представляет собой одно сообщение из этой группы. Для каждого из расширений MediaWiki на translatewiki.net существует своя группа для используемых этим расширением сообщений, а у некоторых особенно крупные расширений имеется несколько групп. Вы также можете сделать группу групп, например «Все рассылки» или «Все сообщения расширения перевода». Значительная часть статистики и задач работают на основе групп сообщений.

Задачи (или иными словами, различные выборки сообщений какой-либо группы сообщений) облегчают выполнение различных сценариев работы. Обычно переводчик получает список всех непереведённых сообщений в выбранной группе сообщений, но есть также задачи, где можно проверить переводы сообщений или получить список всех сообщений, переведённых или нет.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Эта служебная страница предоставляет отчёт о статусе перевода каждой из групп сообщений

**Отчёты и статистика**: Расширение обладает обширным списком [функций по отчётности](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting), начиная с просмотра непереведённых сообщений по всем группам сообщений в предоставленной языковой группе, и заканчивая списком переводчиков для каждого языка с отображением их уровня активности.

**Перевод содержания:** Если вы когда-либо пытались переводить материал в MediaWiki без каких-либо инструментов, вы понимаете масштаб проблемы. Переведённые версии устаревают и утрачивается возможность отслеживать изменения на исходной странице, поэтому появляется много наполовину переведённого и устаревшего материала, без возможности просмотреть его точный статус. Переводчики часто не хотят переводить, когда нет возможности работать с небольшими частями текста, которые можно изменять. Переводчики не находят, над каким материалом нужно работать и что нуждается в обновлении. Пользователи также оказываются дезориентированы устаревшей информацией.

Всё это решается при помощи расширения Translate и свойств перевода данной страницы. Это добавляет немного дополнительной нагрузки на страницы, которые нужно перевести, но преимущества значительно перевешивают. Фактически вам необходимо отмечать части текста на странице, которые необходимо перевести. Затем при помощи расширения эти части разбиваются на более мелкие части размером в параграф и создаётся группа сообщений для них. Когда это выполнено, переводчики могут использовать все описанные выше свойства. Более того, вы без проблем можете добавить языковую панель с тэгом `<languages />` или сделать автоматический переход ссылок на предпочитаемую пользователем языковую версию (только) если она существует, используя ссылки из формы \[\[Special:MyLanguage/Pagename]].

Более подробную информацию можно получить в руководстве [по подготовке вики-страниц для перевода](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example), а также в [детальной документации по функционалу перевода страниц](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Разработчики**: Расширение идёт вместе со встроенной поддержкой для многих схожих переводов форматов файлов, таких, как свойства Java и файлы .po в формате Gettext. Оно имеет обширный набор инструментов, как в вики, так и в командной строке, чтобы можно было успешно выполнять импорт и экспорт переводов.

**Поиск:** Без возможности поиска переводчикам сложно найти определённое сообщение, которое они хотели бы перевести. Просмотр всех переводов или строк проекта неэффективен. Кроме того, переводчики часто хотят проверить, как определённый термин переводится на определённый язык во всём проекте.

Эта задача решается с помощью служебной страницы [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Переводчики могут найти сообщения, содержащие определенные термины на любом языке и отфильтровать по различным критериям: это настройка по умолчанию. После получения результатов, они могут переключиться на результаты перевода этого сообщения, например для поиска существующих, отсутствующих или устаревших переводов определённого термина.

## Сценарии использования

При помощи расширения перевода вы можете переводить практически все. Конечно, есть специальные инструменты для перевода определённых материалов, таких как субтитры к видео, которые лучше переводить этими инструментами, но в целом расширение хорошо справляется с любым видом текста, который можно разбить на сообщения размером от одного слова до одного большого абзаца. Более длинные сообщения слишком громоздки для перевода и с ними тяжелее работать.

Три основных варианта использования, которые поддерживает расширение перевода — это **перевод содержания**, **локализация интерфейса** и **перевод программного обеспечения**. Все они рассмотрены в последующих разделах со ссылками (там, где возможно) на учебное руководство и справочную документацию или углублённую поддержку по теме. Среди трёх случаев использования «перевод интерфейса» был реализован последним.

### Перевод основного содержания

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Этот перевод устарел: устаревшие части заменены новой версией исходного текста и переводчики могут за один клик попасть к сообщению, требующему обновления

Многие вики-проекты имеют содержание, которое должно быть доступно на нескольких языках. Без разницы, несколько страниц или их сотни. Чтобы предотвратить бесполезную трату времени переводчиков, страницы должны быть помечены для перевода только тогда, когда они станут достаточно стабильными. Каждое изменение, которое было сделано после этого, приведёт к десяткам и сотням устаревших переводов, и необходимо время, чтобы обновить переводы. Вы должны стараться избегать этого, особенно если переводчики — добровольцы, и стараться уважать время переводчиков, которое они потратили на переводы и их обновления, и избегать бесполезной работы. Если вы используете расширение перевода для перевода страниц, вы уже на правильном пути по рациональному и эффективному использованию времени переводчиков.

Способ, которым расширение перевода разбивает страницу на части, не позволяет переводчикам достаточно свободно изменять содержание страницы. Обычно это хорошо и идеально подходит, когда желательно соблюдать продолжительность и последовательность материала на всех языках. Это можно обойти и использовать другой путь, но в принципе такой способ выполнения перевода не всегда подходит, например для статей в Википедии, которые обычно являются абсолютно независимыми друг от друга. Даже если первоначально они начинаются как вариант перевода с другого языка, в дальнейшем они обычно отличаются от оригинальной версии. Переводимая при помощи расширения перевода исходная страница всегда является основной версией и в переведённых версиях не может появляться какой-то свой материал.

С учётом указанных ограничений всё равно остаётся много случаев, где эта функциональность отлично подойдёт. В эту категорию попадает большинство (если не все) видов пользовательской документации, также как и материалы типа новостных, в которых не происходит частых изменений. Если у вас уже установлено расширение перевода и настроены права доступа, попробуйте создать страницу и обернуть весь текст в `<languages />...` и следовать по появившимся ссылкам или поступать согласно руководству [по подготовке страницы для перевода](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Группы страниц могут быть позднее сгруппированы при помощи страницы [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups).

### Локализация интерфейса в многоязычных вики-проектах

Практически каждый wiki-проект требует собственной настройки бокового меню ([sidebar](https://www.mediawiki.org/wiki/Manual:Interface/Sidebar/ru)). Можно создать группу сообщений для локализации бокового меню и других местных настроек интерфейса.

Одно из интересных расширений многоязычной страницы или шаблона — использование волшебного слова {{int:}}. Главная страница [translatewiki.net](https://translatewiki.net/wiki/) и некоторые шаблоны Wikimedia Commons являются тому хорошим примером. Волшебное слово {{int:}} является альтернативой функции перевода содержания и лучше всего подходит для разметки тяжелых страниц, таких как Заглавная страница translatewiki.net. Еще одной приятной особенностью является то, что язык страницы автоматически берётся из языка пользовательского интерфейса, так что нет никакой необходимости в языковой панели, хотя вы, возможно, хотели бы иметь возможность выбрать язык интерфейса вместо этого.

Установка этой программы в настоящее время немного сложнее, чем перевод содержания и требует настройки программного обеспечения, но всё это описано в учебнике [How to make an interface message group](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Перевод интерфейса программных продуктов

Расширение хорошо подходит для перевода сообщений программного интерфейса. На translatewiki.net с его помощью переводят десятки программных продуктов, от игр до веб-приложений. Расширение Перевод позволяет читать и обновлять переводы, сделанные во множестве популярных форматов, таких как [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) и [Yaml](https://en.wikipedia.org/wiki/YAML), а затем сохранять результат в них же.

Отслеживание изменений также доступно для файлов, отслеживаемых извне, поскольку внутри расширения используется кэшированная производная версия файлов локализации, в которой хранится исходный текст и его переводы, вместо того, чтобы использовать их непосредственно в исходном формате. Когда администраторам переводов требуется обновление, они могут использовать веб-интерфейс или интерфейс командной строки, чтобы проверять определения новых сообщений и устаревших ("fuzzy") переводов (для которых запрошено обновление). Это работает независимо от базового формата файла или системы контроля версий (если таковая имеется).

С помощью простых инструментов командной строки администраторы переводов могут легко импортировать даже большой набор существующих переводов и всего одной командой экспортировать все переводы в правильном формате и в правильной структуре каталогов. Вы можете экспортировать непосредственно в свой репозиторий [VCS](https://en.wikipedia.org/wiki/ru:Система%20управления%20версиями), где вы можете легко вносить изменения и создавать новые файлы.

## Дополнительные материалы

### Для переводчиков и администраторов перевода

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Слайды семинара Викимании'17 о том, как использовать [Расширение:Перевод](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate).

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=rest\&utm_content=original)

Видеоролик с презентацией на английском языке.

- [Как переводить](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Руководство]
- [Лучшие практики перевода](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Статистика и отчёты](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Обеспечение качества](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Состояния групп сообщений](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[В процессе] [Поиск](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Оффлайновый перевод](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[В разработке] [Глоссарий](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Для администраторов перевода

- [Как подготовить страницу к переводу](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Руководство]
- [Управление переводом страницы](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Группы сообщений интерфейса (локализация панели навигации, заглавной страницы и шаблонов)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Руководство]
- \[В разработке] [Управление группами сообщенй](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Формат настройки YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Как создать настройку YAML для основных групп сообщений](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Руководство]

### Справочные документы для разработчиков

- [Установка](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) и [Настройка](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Language Extension Bundle](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) будет достаточно в большей части случаев.

- [Инструменты памяти переводов](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Руководство разработчика](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[В разработке] [Механизм перевода — объяснение для разработчиков](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Прерывания (?)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[В разработке] [Группы сообщений](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[В разработке] [Поддержка форматов файлов](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Направления перевода](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Ещё не написано] [API для действий](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Включения](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Консольные инструменты](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Поток процессов в заданиях MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Описывает, какие задания выполняются, когда страница помечена для перевода или переводится раздел
  - [Архитектура памяти переводов](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Другие материалы по теме

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - Скрипт интеграции WikiEditor/CodeMirror для расширения перевода
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Общее руководство по локализации для разработчиков, для использования на хакатонах и тренингах
- [Универсальный переключатель языка](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Предоставляет веб-шрифты и методы ввода
- [m:Переводимость](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – мысли о создании страниц и процессах в многоязычных вики
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Добавьте себя в список активных в настоящее время технических переводчиков

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/ru" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016732"}
::
