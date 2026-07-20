---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/tr
sourceWiki: www.mediawiki.org
sourceRevision: "8046093"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

$1 için belgelendirme

**Çevirmenler** (**[Kullanım yardım sayfası](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Nasıl çevirilir](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [En iyi uygulamalar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [İstatistik ve raporlama](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kalite güvencesi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Mesaj grubu dereceleri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Çevrimdışı çeviri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Sözlük](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Çeviri hizmetlileri**

- [Bir sayfa çeviri için nasıl hazırlanır](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Sayfa çeviri yönetimi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Yapılandırılmamış öğe çevirisi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Proje yönetimi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Çevrilebilir sayfa](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import translations via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Sistem hizmetliler ve geliştiriciler**

- [Kurulum](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Yapılandırma](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [JQuery ile Başlarken](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Geliştirici kılavuzu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Çeviri Genişletme](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [doğrulayıcı](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Takılabilirler](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [URL yönlendirme yapılandırması](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [URL yönlendirme yapılandırması](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Çeviri bellekleri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Çeviri yardımcıları](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Bu şablonu çevir](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Uzantının ana özel sayfası olan [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), en yaygın görevi olan "çevrilmemiş tüm mesajları görüntüle"

[Translate uzantısı](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate), MediaWiki'yi çeviri işi yapmak için gereken temel özelliklerle geliştirir. [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki) sitesinde kullanıldığı gibi içerik sayfalarını, viki arayüzünü ve hatta diğer yazılım ürünlerini çevirmek için kullanılabilir. Translate uzantısı, kullanımı kolay bir çeviri arayüzü ile birlikte gelir ve içerik yapısını çevrilmesi gereken metin içeriğinden ayırabilir, içeriği yönetilebilir birimlere bölerek çevirmenlere yalnızca çevrilebilir metni gösterir. Her birim, değişiklikler için otomatik olarak izlenir ve çevirmenler, belirli bir sayfada veya viki boyunca neyin güncellenmesi gerektiğini hemen görür.

Translate uzantısı, her ay yüzlerce çevirmen tarafından translatewiki.net sitesinde MediaWiki ve diğer yazılım projelerinin kullanıcı arayüzlerini çevirmek için kullanılıyor. [userbase.kde.org](http://userbase.kde.org) sayfasında, neredeyse bin içerik sayfasını kullanıcı belgeleriyle çevirmek için kullanılır. Translate uzantısını kullanmaya başlamak kolaydır, ancak aynı zamanda ölçeklenir ve gelişmiş raporlama, inceleme ve iş akışı özellikleri sağlar.

## Özellikler

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Çeviri düzenleyici: ipucu içeren bir mesaj (resimde görünmüyor) ve iki yardımcı dilden öneriler

**Arayüz:** Translate uzantısının ana özelliği, basit ancak işlevsel bir çeviri arayüzüdür. Mesaj tanımı ve belgelendirme gibi temel bilgilerin yanı sıra diğer dillerdeki çevirileri de görüntüleyebilirsiniz. Bir tanım değiştiyse, değişiklikleri göreceksiniz. Uzantı, dengesiz parantezler ve kullanılmayan değişkenler gibi yaygın hatalara yardımcı olabilecek bazı yerleşik kontrollerle birlikte gelir. Yapılandırmaya bağlı olarak, Google Çeviri, Microsoft'un Bing Translator ve Apertium gibi çeviri belleği ve makine çevirisi hizmetlerinden de öneriler vardır.

Çeviri arayüzünün kullanılabilirliği JavaScript ve AJAX ile geliştirilmiştir. Arka uç, mobil arabirimlerde veya belirli içerik türlerine göre uyarlanmış arabirimlerde kullanılabilen WebAPI'ler sağlar. [Gettext po](https://tr.wikipedia.org/wiki/Gettext) dosya biçimini kabul eden diğer çevrimdışı ve çevrimiçi araçlarda çeviri için mesajları dışa aktarmak da mümkündür.

**Mesaj grupları ve görevler:** Özelliklerin çoğu iki temel kavram etrafında oluşturulmuştur: mesaj grupları ve görevler.

Bir mesaj grubu, bir mesaj koleksiyonunu temsil eder. Bir içerik sayfası bir mesaj grubu olacaktır ve en basit biçimde her paragraf o gruptaki bir mesaj olacaktır. Her MediaWiki uzantısında kullanılan mesajlar translatewiki.net'te bir mesaj grubu oluşturur. En büyük uzantılardan birkaçının birden fazla grubu vardır. Ayrıca, _Tüm bültenler_ veya _Tüm Translate uzantılı iletiler_ gibi bir grup grup da oluşturabilirsiniz. İstatistiklerin ve görevlerin çoğu, mesaj grubu bazında çalışır.

Bir mesaj grubundaki görevler veya diğer bir deyişle farklı mesaj listeleri, farklı kullanım durumlarını kolaylaştırır. Normalde bir çevirmen, seçilen bir mesaj grubundaki tüm çevrilmemiş mesajların bir listesini alır, ancak mesajları gözden geçirebileceğiniz veya çevrilmiş olsun ya da olmasın tüm mesajların bir listesini alabileceğiniz görevler vardır.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Bu özel sayfa, her mesaj grubunun çeviri durumunu bildirir

**Bildirme ve istatistikler:** Uzantı, belirli bir dildeki tüm mesaj gruplarındaki çevrilmemiş mesajların görünümünden, etkinlik düzeylerine göre dil başına çevirmen listelerine kadar kapsamlı [bildirme özellikleri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) içerir.

**İçerik çevirisi:** Eğer MediaWiki'deki içeriği herhangi bir araç kullanmadan çevirmeyi denediyseniz, ölçüye gelmediğini bilirsiniz. Çevrilmiş sürümler güncelliğini yitirir ve ana sayfadaki değişiklikleri izlemenin bir yolu yoktur, bu nedenle genel duruma net bir genel bakış olmadan birçok yarı çevrilmiş ve güncelliğini yitirmiş çeviriler vardır. Çevirmenler, yönetilebilir küçük metin parçalarıyla çalışamadıklarında genellikle cesaretlerinin kırıldığını hissederler. Çevirmenler neyin üzerinde çalışacaklarını veya neyin güncellenmesi gerektiğini bulamıyorlar. Kullanıcılar ayrıca güncel olmayan bilgilerle karıştırılmaktadır.

Tüm bunlar Translate uzantısı ve sayfa çeviri özelliği ile çözüldü. Çeviri gerektiren sayfalara biraz ek yük ekler, ancak faydaları bundan çok daha ağır basar. Esasen sayfanın yalnızca çevrilmesi gereken kısımlarını işaretlemeniz gerekir. Uzantı daha sonra bu parçaları paragraf boyutundaki birimlere böler ve onlar için bir mesaj grubu oluşturur. Bundan sonra tercümanlar yukarıda açıklanan tüm özellikleri kullanabilirler. Ek olarak, `<languages />` etiketiyle kolayca bir dil çubuğu ekleyebilir veya bağlantıların otomatik olarak kullanıcının tercih ettiği dil sürümüne (yalnızca) mevcut olduğunda, \[\[Special:MyLanguage/Pagename]] biçimindeki bağlantıları kullanarak gitmesini sağlayabilirsiniz.

Daha fazla bilgi için [Çeviri için içerik sayfası nasıl kurulur](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) eğiticisine ve [sayfa çevirisi özelliğinin ayrıntılı belgelendirmesine](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration) bakın.

**Geliştiriciler:** Uzantı, Java özellikleri ve Gettext po dosyaları gibi birçok yaygın çeviri dosyası biçimi için yerleşik destekle birlikte gelir. Çevirileri verimli bir şekilde içe ve dışa aktarmak için hem vikide hem de komut satırında kapsamlı bir araç setine sahiptir.

**Arama:** Arama özelliği olmadan çevirmenlerin çevirmek istedikleri belirli mesajları bulmaları zordur. Projenin tüm çevirilerini veya dizelerini geçmek verimsizdir. Ayrıca, çevirmenler genellikle proje genelinde belirli bir terimin belirli bir dile nasıl çevrildiğini kontrol etmek isterler.

Bu, [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations) özel sayfasıyla çözülür. Çevirmenler herhangi bir dilde belirli terimleri içeren mesajları bulabilir ve çeşitli kriterlere göre filtreleyebilir: bu varsayılandır. Arama yaptıktan sonra, örneğin belirli bir terimin mevcut, eksik veya güncel olmayan çevirilerini bulmak için sonuçları söz konusu mesajların çevirilerine çevirebilirler.

## Kullanım durumları

Translate uzantısıyla hemen hemen her şeyi çevirebilirsiniz. Doğal olarak, video altyazıları gibi belirli türdeki içeriklerin çevirisi için bu araçlarla daha iyi yapılan özel araçlar vardır, ancak genel olarak _Çevir_, uzunlukları arasında değişen mesajlara bölünebilen her tür metinle çok iyi performans gösterir. Daha uzun mesajların çevrilmesi hantal hâle gelir ve üzerinde çalışmak daha zordur.

Translate uzantısının desteklediği üç temel kullanım durumu **içerik çevirisi**, **yerel arayüz çevirisi** ve **yazılım çevirisidir**. Tümü, öğreticilere bağlantılar ve varsa belgelere veya derinlemesine topikal yardıma bağlantılar ile birlikte aşağıdaki bölümlerde ele alınmıştır. Üç kullanım durumundan en az arayüz çevirisi kullanılmıştır.

### İçerik çevirisi

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Çeviri güncel değil: güncel olmayan kısımlar yeni kaynak metinle değiştiriliyor ve çevirmenler güncellemek için mesajlara tek tıkla ulaşabiliyor

Çoğu viki, birden çok dilde sunulmasını istedikleri içeriğe sahiptir. İster birkaç ister yüzlerce sayfa olsun, farketmez. Çevirmenin zamanını boşa harcamamak için sayfalar, yalnızca makûl ölçüde kararlı olduklarında çeviri için işaretlenmelidir. Daha sonra yapılan her değişiklik, onlarca, yüzlerce eski çeviriyi etkileyebilir ve bunları güncellemek için gereken süre artar. Özellikle gönüllü çevirmenlerle bu hususun farkında olmalı, çeviri ve güncelleme yapmak için harcadıkları zamana saygı duyarak gereksiz işlerden kaçınmalısınız. Sayfaları çevirmek için Translate uzantısını kullanırsanız, mevcut çevirmen zamanını en etkili ve verimli şekilde kullanma yolundasınız demektir.

Translate uzantısının bir sayfayı paragraf boyutunda birimlere ayırma şekli, çevirmenlerin içeriği değiştirmesi için çok fazla özgürlük bırakmaz. Bu genellikle iyi bir şeydir ve diller arasında içeriğin sürekliliği ve tutarlılığının istendiği durumlarda idealdir. Bu bir çözüm olabilir, ancak prensipte bu çeviri yapma şekli, örneğin genellikle birbirinden tamamen bağımsız olan Vikipedi maddeleri için genellikle uygun değildir. Orijinal olarak farklı bir dilden çeviri olarak başlasalar bile, genellikle orijinal versiyondan kendi bağımsız hayatlarını yaşamaya başlarlar. _Çevir_ ile orijinal sayfa her zaman ana sürümdür ve çevrilmiş sürümlerde yeni içerik geliştirilemez.

Bu sınırlamalar göz önünde bulundurulduğunda, bu özelliğin mükemmel bir eşleşme olduğu hala birçok durum vardır. Hepsi olmasa da çoğu kullanıcı belgeleri ve yazıldıktan sonra değişmeyen haber benzeri içerikler bu kategoriye girer. Translate uzantısı zaten kuruluysa ve erişim hakları yapılandırılmışsa, bir sayfa oluşturmayı ve tüm metni `<languages />...` içine sarmayı ve bağlantıları izlemeyi deneyin veya öğreticiyi [Çeviri için bir sayfa nasıl hazırlanır](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) sayfasını izleyin.

Sayfa grupları, [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups) sayfasıyla daha fazla birleştirilebilir.

### Çok dilli vikilerde yerel arayüz çevirisi

Hemen hemen her vikinin özelleştirdiği bir şey [kenar çubuğudur](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Özel kenar çubuğu mesajları ve ayrıca diğer yerel arayüz özelleştirmeleri için bir mesaj grubu oluşturmak mümkündür.

İlginç bir genişletme, {{int:}} sihirli kelimesiyle oluşturulmuş çok dilli sayfalar veya şablonlardır. [translatewiki.net](https://translatewiki.net/wiki/) ana sayfası ve bazı Wikimedia Commons şablonları buna iyi örneklerdir. Sihirli kelime {{int:}}, içerik çeviri özelliğine bir alternatiftir ve tıpkı translatewiki.net ana sayfası gibi ağır sayfaları işaretlemek için daha uygundur. Bir başka güzel özellik de, sayfanın dilinin otomatik olarak kullanıcı arayüzü dilini takip etmesidir, bu nedenle bir dil çubuğuna gerek yoktur, ancak bunun yerine bir arayüz dili seçiciye sahip olmak isteyebilirsiniz.

Bunu ayarlamak şu anda içerik çevirisinden biraz daha karmaşıktır ve yazılım yapılandırması gerektirir, ancak bunların tümü [Arayüz mesaj grubu nasıl yapılır](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) öğreticisinde ele alınmıştır.

### Yazılım çevirisi

Translate uzantısı, yazılım arayüzü mesajlarını çevirmek için iyi bir seçimdir. At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

Değişiklik izleme, harici olarak izlenen dosyalar için de mevcuttur, çünkü dahili olarak uzantı, doğrudan orijinal biçimlerinde kullanmak yerine kaynak metnin ve çevirilerinin depolandığı yerelleştirme dosyalarının önbelleğe alınmış bir türev sürümünü kullanır. Çeviri hizmetlileri, güncellemeye ihtiyaç duyduklarında yeni mesaj tanımlarını ve "fuzzy" (güncelleme isteği) çevirileri kontrol etmek için web arayüzünü veya bir komut satırı arayüzünü kullanabilirler. Bu, temel alınan dosya biçiminden veya sürüm kontrol sisteminden (varsa) bağımsız olarak çalışır.

Basit komut satırı araçlarıyla, çeviri yöneticileri çok sayıda mevcut çeviriyi bile kolayca içe aktarabilir ve tek bir komutla tüm çevirileri doğru biçimde ve doğru dizin yapısında dışa aktarabilir. Doğrudan [VCS](https://tr.wikipedia.org/wiki/Sürüm%20kontrol%20sistemi) depo çıkışınıza aktarabilirsiniz, burada değişiklikleri ve yeni dosyaları kolayca gerçekleştirebilirsiniz.

## Ek okumalar and eğiticiler

### Çevirmenler ve çeviri hizmetlileri için

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Wikimania17'de [Extension:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) nasıl kullanılacağına dair bir atölyenin slaytları.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [Nasıl çevrilir](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Eğitici]
- [Çeviri en iyi uygulamaları](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [İstatistik ve raporlama](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Kalite güvencesi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Mesaj grubu dereceleri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[Devam etmekte] [Arama](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Çevrimdışı çeviri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[Devam etmekte] [Sözlük](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Çeviri hizmetlere için

- [Bir sayfa çeviri için nasıl hazırlanır](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Eğitici]
- [Sayfa çeviri yönetimi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Arayüz mesaj grupları (yerelleştirilmiş kenar çubuğu, ana sayfa ve şablonlar)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Eğitici]
- \[Devam etmekte] [Mesaj grubu yönetimi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML yapılandırma biçimi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Dosya tabanlı mesaj grupları için YAML yapılandırması nasıl yazılır](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Eğitici]

### Geliştiriciler için kaynak belgeler

- [Kurulum](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) ve [Yapılandırma](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Dil Uzantı Paketi](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) çoğu durumda yeterli olacaktır.

- [Çeviri bellekleri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Geliştirici kılavuzu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[Devam etmekte] [Geliştiriciler için açıklamalı çeviri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Kancalar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[Devam etmekte] [Mesaj grupları](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[Devam etmekte] [Dosya biçimi desteği](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Çeviri yardımcıları](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Yazılmamış] [eylem API'si](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Takılabilirler](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Komut satırı betikleri](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [MediaWiki işlerinde süreç akışı](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Bir sayfa çeviri için işaretlendiğinde veya bir bölüm çevrildiğinde hangi işlerin dahil olduğunu açıklar
  - [Çeviri belleği mimarisi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### İlgili

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extension:TranslationNotifications](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Hackathon'larda ve eğitimlerde kullanılmak üzere geliştiriciler için genel yerelleştirme eğitimi
- [Universal Language Selector](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Web yazı tipleri ve giriş yöntemleri sağlar
- [m:Çevirebilirlik](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – çok dilli vikilerde sayfalar veya işlemler oluştururken düşünülmesi gerekenler
- [m:Teknik/Çevirmenler/Liste](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Kendinizi şu anda aktif olan teknoloji çevirmenleri listesine ekleyin

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/tr" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8046093"}
::
