---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/ar
sourceWiki: www.mediawiki.org
sourceRevision: "8016689"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

توثيق [امتداد:ترجم](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**مترجمون** (**[صفحة المساعدة الرئيسية](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [كيف تترجم](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [أفضل الممارسات](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [الإحصاءات ورفع التقارير](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [ضمان الجودة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [إحصاءات مجموعات الرسائل](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [ترجمة دون اتصال بالويب](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [مسرد المصطلحات](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**إداريو الترجمة**

- [كيف تحضر صفحة للترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [إدارة ترجمة الصفحة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [ترجمة عناصر غير منظمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [التحكم بالمجموعة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [نقل صفحة قابلة للترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [استيراد الترجمات من ملف بصيغة قيم مفصولة بفواصل «CSV»](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [العمل مع حزم الرسائل](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**إداريو النظام والمطورون**

- [التنصيب](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [ضبط](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [الشروع في التطوير](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [دليل المطورين](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [تمديد الترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [المحققون](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [أشياء يمكن إدراجها](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [ضبط جماعي](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [مثال على ضبط جماعي](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [ذاكرات الترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [مساعدات الترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [تمكين حزم الرسائل](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [خطاطيف بي إتش بي](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[ترجم هذا القالب](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

الصفحة الخاصة والرئيسية للامتداد، [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate)، ضمن إطار مهمتها الأبرز، "اعرض كل الرسائل غير المترجمة"

[امتداد الترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) يعزز برمجية ميدياويكي بميزات أساسية لازمة للقيام بأعمال الترجمة. يمكن استخدامه لترجمة صفحات المحتوى، واجهة الويكي، وحتى بعض البرمجيات الأخرى كما في [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). امتداد الترجمة يأتي مزودًا بواجهة ترجمة سهلة، ويمكنه فصل هيكل المحتوى عن نصه الذي يحتاج ترجمة، عارضًا فقط النصوص التي تحتاج ترجمة للمترجمين عن طريق فصل المحتوى لوحداتٍ أيسر إدارةً. تُتَتَبّع تغييرات كل وحدة منها، ويرى المترجمون على الفور ما يحتاج لتحديث في صفحة ما أو في الويكي كلها.

يُستخدم امتداد الترجمة لترجمة واجهة مستخدم ميدياويكي ومشاريع لبرمجيات أخرى على موقع translatewiki.net بواسطة مئات المترجمين كل شهر. في [userbase.kde.org](http://userbase.kde.org) يتم استخدامه لترجمة ما يقرب من ألف صفحة محتوى مع وثائق المستخدم. من السهل البدء في استخدام ملحق الترجمة، ولكنه في الوقت نفسه يتوسع أيضًا ويوفر ميزات متقدمة لإعداد التقارير والمراجعة وسير العمل.

## الميزات

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

محرر الترجمة: رسالة بها نصيحة (غير مرئية في الصورة) واقتراحات من لغتين مساعدتين

**الواجهة:** الميزة الرئيسية لامتداد الترجمة هي واجهة ترجمة بسيطة وعملية. إلى جانب المعلومات الأساسية مثل تعريف الرسالة والوثائق، يمكنك أيضًا عرض الترجمات بلغات أخرى. إذا تغير التعريف، فسترى التغييرات. يأتي الامتداد مزودًا ببعض عمليات الفحص المضمنة، والتي يمكن أن تساعد في حل الأخطاء الشائعة مثل الأقواس غير المتوازنة والمتغيرات غير المستخدمة. اعتمادًا على التكوين، هناك أيضًا اقتراحات من ذاكرة الترجمة وخدمات الترجمة الآلية مثل Google Translate وBing Translator من Microsoft وApertium.

تم تحسين سهولة استخدام واجهة الترجمة باستخدام JavaScript وAJAX. توفر الواجهة الخلفية واجهات WebAPI التي يمكن استخدامها في واجهات الهاتف المحمول أو الواجهات المخصصة لنوع معين من المحتوى. من الممكن أيضًا تصدير الرسائل لترجمتها في أدوات أخرى متصلة بالإنترنت وغير متصلة بالإنترنت والتي تقبل تنسيق الملف [Gettext po](https://en.wikipedia.org/wiki/Gettext).

**مجموعات الرسائل والمهام:** تتمحور العديد من الميزات حول مفهومين أساسيين: مجموعات الرسائل والمهام.

تمثل مجموعة الرسائل مجموعة من الرسائل. ستكون صفحة المحتوى الواحدة عبارة عن مجموعة رسائل واحدة، حيث، في أبسط صورة، ستكون كل فقرة بمثابة رسالة واحدة في تلك المجموعة. تشكل الرسائل المستخدمة في كل امتداد ميدياويكي مجموعة رسائل على Translatewiki.net - عدد قليل من أكبر الامتدادات لديها مجموعات متعددة. يمكنك أيضًا إنشاء مجموعة من المجموعات، مثل "جميع الرسائل الإخبارية" أو "جميع رسائل ملحق الترجمة". تعمل العديد من الإحصائيات والمهام على أساس مجموعة الرسائل.

المهام، أو بكلمات أخرى، قائمة مختلفة من الرسائل في مجموعة الرسائل، تسهل حالات الاستخدام المختلفة. عادة ما يحصل مترجم على قائمة بجميع الرسائل غير المترجمة في مجموعة الرسائل المختارة، ولكن هناك مهام يمكنك فيها مراجعة الرسائل أو الحصول على قائمة بكل الرسائل، المترجمّة أو غيرها.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

هذه الصفحة الخاصة تقرير حالة ترجمة كل مجموعة رسائل

**التقارير والإحصائيات:** يحتوي الامتداد على [ميزات إعداد التقارير](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) بدءًا من عرض الرسائل غير المترجمة عبر جميع مجموعات الرسائل في لغة معينة إلى قوائم المترجمين لكل لغة مع مستوى نشاطهم.

**ترجمة المحتوى:** إذا سبق لك أن حاولت ترجمة محتوى في MediaWiki بدون أي أدوات، فأنت تعلم أنه لا يمكن توسيع نطاقه. تصبح الإصدارات المترجمة قديمة ولا توجد طريقة لتتبع التغييرات في الصفحة الرئيسية، لذلك هناك العديد من الترجمات نصف المترجمة والقديمة دون نظرة عامة واضحة على الحالة العامة. غالبًا ما يشعر المترجمون بالإحباط عندما لا يستطيعون العمل مع أجزاء صغيرة من النص يمكن التحكم فيها. لا يجد المترجمون ما يجب العمل عليه أو ما يحتاج إلى تحديث. يشعر المستخدمون أيضًا بالارتباك بسبب المعلومات القديمة.

يتم حل كل هذا باستخدام ملحق الترجمة وميزة ترجمة الصفحة الخاصة به. فهو يضيف القليل من الحمل إلى الصفحات التي تحتاج إلى ترجمة، ولكن الفوائد تفوق ذلك بكثير. في الأساس، ما عليك سوى تحديد أجزاء الصفحة التي تحتاج إلى الترجمة. يقوم الامتداد بعد ذلك بتقسيم هذه الأجزاء إلى وحدات بحجم الفقرة وإنشاء مجموعة رسائل لها. بعد ذلك، يمكن للمترجمين استخدام جميع الميزات الموضحة أعلاه. بالإضافة إلى ذلك، يمكنك بسهولة إضافة شريط لغة باستخدام علامة `<languages />` أو جعل الروابط تنتقل تلقائيًا إلى إصدار اللغة المفضلة للمستخدم (فقط) عندما تكون موجودة، وذلك باستخدام روابط النموذج \[\[Special:MyLanguage/Pagename]].

لمزيد من المعلومات، راجع البرنامج التعليمي [كيفية إعداد صفحة محتوى للترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) و[الوثائق المتعمقة لميزة ترجمة الصفحة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**المطورون:** يأتي الامتداد مع دعم مدمج للعديد من تنسيقات ملفات الترجمة الشائعة، مثل خصائص Java وملفات Gettext po. يحتوي على مجموعة واسعة من الأدوات، سواء داخل الويكي أو عبر سطر الأوامر، لاستيراد الترجمات وتصديرها بكفاءة.

**البحث:** بدون ميزة البحث، سيكون من الصعب على المترجمين العثور على رسائل محددة يريدون ترجمتها. إن اجتياز جميع الترجمات أو سلاسل المشروع غير فعال. وأيضًا، غالبًا ما يرغب المترجمون في التحقق من كيفية ترجمة مصطلح معين إلى لغة معينة عبر المشروع.

يتم حل هذه المشكلة عن طريق الصفحة الخاصة [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). يمكن للمترجمين العثور على الرسائل التي تحتوي على مصطلحات معينة بأي لغة وتصفيتها حسب معايير مختلفة: هذا هو الإعداد الافتراضي. وبعد البحث، يمكنهم تحويل النتائج إلى ترجمات الرسائل المذكورة، على سبيل المثال للعثور على الترجمات الحالية أو المفقودة أو القديمة لمصطلح معين.

## حالات الاستخدام

يمكنك ترجمة أي شيء تقريبًا باستخدام ملحق الترجمة. من الطبيعي أن توجد أدوات متخصصة لترجمة نوع معين من المحتوى مثل ترجمات الفيديو، والتي من الأفضل القيام بها باستخدام تلك الأدوات، ولكن بشكل عام تعمل ميزة "الترجمة" بشكل جيد للغاية مع أي نوع من النصوص التي يمكن تقسيمها إلى رسائل يتراوح طولها من كلمة واحدة تصل إلى فقرة واحدة كبيرة. تصبح الرسائل الأطول غير عملية للترجمة ويصعب التعامل معها.

حالات الاستخدام الأساسية الثلاثة التي يدعمها امتداد الترجمة هي **ترجمة المحتوى**، **ترجمة الواجهة المحلية** و**ترجمة البرمجية**. يتم تناول كل هذه الأمور في الأقسام التالية، مع روابط إلى البرامج التعليمية والوثائق المرجعية أو المساعدة الموضعية المتعمقة حيثما كان ذلك متاحًا. من بين حالات الاستخدام الثلاثة، كانت ترجمة الواجهة هي الأقل استخدامًا.

### ترجمة المحتوى

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

الترجمة قديمة: يتم استبدال الأجزاء القديمة بنص مصدر جديد ويمكن للمترجمين الوصول إلى الرسائل لتحديثها بنقرة واحدة

تحتوي معظم مواقع الويكي على محتوى ترغب في إتاحته بلغات متعددة. سواء كان مجرد عدد قليل أو مئات الصفحات، لا يهم. من أجل منع إضاعة وقت المترجم، يجب وضع علامة على الصفحات للترجمة فقط عندما تكون مستقرة بشكل معقول. كل تغيير يتم إجراؤه بعد ذلك يمكن أن يؤثر على عشرات أو مئات الترجمات القديمة، ويزداد الوقت اللازم لتحديثها. خاصة مع المترجمين المتطوعين، يجب أن تكون على دراية بهذا الجانب، وأن تحترم الوقت الذي يقضونه في إجراء الترجمات والتحديثات، وتجنب العمل غير الضروري. إذا كنت تستخدم ملحق الترجمة لترجمة الصفحات، فأنت بالفعل في طريقك لاستخدام وقت المترجم المتاح بالطريقة الأكثر فعالية وكفاءة.

إن الطريقة التي يقوم بها ملحق الترجمة بتقسيم الصفحة إلى وحدات بحجم الفقرة لا تترك حرية كبيرة للمترجمين في تغيير المحتوى. يعد هذا عادةً أمرًا جيدًا ومثاليًا عندما يكون من المرغوب فيه استمرارية المحتوى واتساقه عبر اللغات. يمكن حل هذه المشكلة، ولكن من حيث المبدأ، فإن طريقة إجراء الترجمات هذه ليست مناسبة بشكل عام، على سبيل المثال، لمقالات ويكيبيديا، والتي عادةً ما تكون مستقلة تمامًا عن بعضها البعض. حتى لو بدأوا في الأصل كترجمة من لغة مختلفة، فإنهم عادةً ما يبدأون في عيش حياتهم المستقلة عن النسخة الأصلية. مع _الترجمة_، تكون الصفحة الأصلية دائمًا هي النسخة الرئيسية، ولا يمكن تطوير المحتوى الجديد في الإصدارات المترجمة.

مع أخذ هذه القيود في الاعتبار، لا يزال هناك الكثير من الحالات التي تكون فيها هذه الميزة متوافقة تمامًا. تندرج معظم وثائق المستخدم، إن لم يكن كلها، ضمن هذه الفئة بالإضافة إلى المحتوى الشبيه بالأخبار الذي لا يتغير بمجرد كتابته. إذا كان لديك ملحق الترجمة مثبتًا بالفعل وتم تكوين حقوق الوصول، فحاول إنشاء صفحة وتغليف النص بالكامل داخل `<languages />...` واتبع الروابط، أو اتبع البرنامج التعليمي [كيفية إعداد صفحة للترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

يمكن تجميع مجموعات الصفحات بشكل أكبر مع $الصفحة\_المجمعة.

### ترجمة الواجهة المحلية في مواقع الويكي متعددة اللغات

هناك شيء واحد تقريبًا قامت كل مواقع الويكي بتخصيصه وهو [الشريط الجانبي](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). من الممكن إنشاء مجموعة رسائل لرسائل الشريط الجانبي المخصصة وأيضًا لتخصيصات الواجهة المحلية الأخرى.

أحد التوسعات المثيرة للاهتمام هو الصفحات أو القوالب متعددة اللغات التي تم إنشاؤها باستخدام الكلمة السحرية {{int:}}. تعتبر الصفحة الرئيسية [translatewiki.net](https://translatewiki.net/wiki/) وبعض قوالب ويكيميديا ​​كومنز أمثلة جيدة على ذلك. تعد الكلمة السحرية {{int:}} بديلاً لميزة ترجمة المحتوى وهي أكثر ملاءمة لترميز الصفحات الثقيلة تمامًا مثل صفحة translatewiki.net الرئيسية. ميزة أخرى لطيفة هي أن لغة الصفحة تتبع لغة واجهة المستخدم تلقائيًا، لذلك ليست هناك حاجة لشريط اللغة، على الرغم من أنك قد ترغب في الحصول على محدد لغة الواجهة بدلاً من ذلك.

يعد إعداد هذا حاليًا أكثر تعقيدًا بعض الشيء من ترجمة المحتوى ويحتاج إلى تكوين برنامج، ولكن يتم تناول كل ذلك في البرنامج التعليمي [كيفية إنشاء مجموعة رسائل واجهة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### ترجمة البرمجيات

يعد امتداد الترجمة مناسبًا لترجمة رسائل واجهة البرمجية. في موقع translatewiki.net، يُستخدم لترجمة العشرات من المنتجات البرمجية من الألعاب إلى تطبيقات الويب. يدعم امتداد الترجمة قراءة وتحديث الترجمات من وإلى التنسيقات الشائعة المستخدمة في تطوير الويب بما في ذلك ملفات [Java properties](https://en.wikipedia.org/wiki/.properties)، [Gettext](https://en.wikipedia.org/wiki/Gettext) و[YAML](https://en.wikipedia.org/wiki/YAML)

يتوفر أيضًا تتبع التغيير للملفات التي يتم تتبعها خارجيًا، لأن الامتداد داخليًا يستخدم نسخة مشتقة مخبأة من ملفات الترجمة حيث يتم تخزين النص المصدر وترجماته، بدلاً من استخدامها مباشرة بتنسيقها الأصلي. يمكن لمسؤولي الترجمة إما استخدام واجهة الويب أو واجهة سطر الأوامر للتحقق من تعريفات الرسائل الجديدة والترجمات "الغامضة" (طلب تحديث) عندما يحتاجون إلى التحديث. يعمل هذا بغض النظر عن تنسيق الملف الأساسي أو نظام التحكم في الإصدار (إن وجد).

باستخدام أدوات سطر الأوامر البسيطة، يمكن لمسؤولي الترجمة بسهولة استيراد حتى مجموعة كبيرة من الترجمات الموجودة، وباستخدام أمر واحد فقط يمكنهم تصدير جميع الترجمات بالتنسيق الصحيح وفي بنية الدليل الصحيحة. يمكنك التصدير مباشرة إلى مستودع [VCS](https://en.wikipedia.org/wiki/Version%20control%20system) الخاص بك، حيث يمكنك تنفيذ التغييرات والملفات الجديدة بسهولة.

## مزيد من القراءة والبرامج التعليمية

### للمترجمين ومسؤولي الترجمة

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

شرائح من ورشة عمل حول كيفية استخدام [امتداد:ترجم](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) في ويكيمانيا17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

مقطع بث فيديو للشرائح باللغة الإنجليزية.

- [كيف تترجم](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[درس تعليمي]
- [أفضل ممارسات الترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [الإحصاءات والإبلاغ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [ضمان الجودة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [بيانات مجموعة الرسائل](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[في تَقَدم] [البحث](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [ترجمة دون اتصال بالويب](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[في تَقَدم] [قاموس المصطلحات](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### إداريو الترجمة

- [كيف تحضر صفحة للترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[برنامج تعليمي]
- [إدارة ترجمة الصفحة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [مجموعات رسائل الواجهة (الشريط الجانبي المترجم والصفحة الرئيسية والقوالب)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[برنامج تعليمي]
- \[في تَقَدم] [إحصاءات مجموعات الرسائل](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [شكل تكوين YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [كيفية كتابة تكوين YAML لمجموعات الرسائل المستندة إلى الملف](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[برنامج تعليمي]

### المستندات المرجعية للمطورين

- [تثبيت](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) و [إعدادات](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [حزمة امتدادات لغات ميدياويكي](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) ينبغي أن يكون كافيًا في معظم الحالات.

- [ذاكرات الترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [دليل المطور](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[في تَقَدم] [ترجمة شرح للمطورين](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [الوصلات](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[في تَقَدم] [إحصاءات مجموعات الرسائل](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[في تَقَدم] [دعم تنسيق الملف](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [مساعدات الترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[غير مكتوب] [واجهة برمجة تطبيقات العمل](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [المواد القابلة للإدراج](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [البرامج النصية لسطر الأوامر](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [تدفق العملية في وظائف ميدياويكي](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - يصف المهام المتضمنة عند وضع علامة على صفحة للترجمة أو ترجمة قسم
  - [بنية ذاكرة الترجمة](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### ذات صلة

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - سكربت تكامل WikiEditor/CodeMirror لامتداد الترجمة.
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – برنامج تعليمي عام عن الترجمة للمطورين، لاستخدامه في فعاليات الهاكاثون والدورات التدريبية
- [محدد لغة عالمي](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – يوفر خطوط الويب وطرق الإدخال
- [قابلية الترجمة](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – أشياء يجب أن تفكر فيها عند إنشاء صفحات أو عمليات على ويكيز متعددة اللغات
- [m: التقنية/المترجمين/اللائحة](https://meta.wikimedia.org/wiki/Tech/Translators/List) – أضف نفسك إلى قائمة المترجمين التقنيين النشطين حاليًا

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/ar" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016689"}
::
