---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/hi
sourceWiki: www.mediawiki.org
sourceRevision: "8016710"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

[Extension:अनुवाद](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) के लिए प्रलेखन

**अनुवादक** (**[मुख्य सहायता पृष्ठ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [अनुवाद कैसे करें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [सर्वोत्तम प्रथाएँ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [सांख्यिकी और रिपोर्टिंग](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [गुणवत्ता आश्वासन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [संदेश समूह स्थिति](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [ऑफ़लाइन अनुवाद](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [शब्दावली](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**अनुवाद प्रबंधक**

- [अनुवाद के लिए पृष्ठ कैसे तैयार करें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [पृष्ठ अनुवाद प्रबंधन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [असंरचित तत्वों का अनुवाद](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [समूह प्रबंधन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [अनुवाद-योग्य पृष्ठ को स्थानांतरित करना](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [CSV के ज़रिए अनुवाद आयात करें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**सिस्टम प्रबंधक और डेवलपर्स**

- [स्थापना](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [कॉन्फ़िगरेशन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [विकास से शुरुआत करना](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [विकासक गाइड](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [अनुवाद का विस्तार](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [वैलिडेटर्स](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [इंसर्टेबल्स](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [समूह का कॉन्फ़िगरेशन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [समूह के कॉन्फ़िगरेशन का उदाहरण](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [अनुवाद स्मृतियाँ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [अनुवाद सहायक](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP हुक्स](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[इस साँचे को अनुवादित करें](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

एक्सटेंशन का मुख्य विशेष पृष्ठ "[Special:Translate](https://www.mediawiki.org/wiki/Special:Translate)", जिसमें यह अपना सबसे प्रसिद्ध कार्य "सभी अनानुवादित संदेश देखें", कर रहा है

[अनुवाद एक्सटेंशन](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) अनुवाद करने के लिए कुछ आवश्यक सुविधाएँ जोड़कर मीडियाविकि की वृद्धि करता है। इसकी मदद से सामग्री के पृष्ठों, विकि के इंटरफ़ेस और यहाँ तक कि दूसरे सॉफ्टवेयर उत्पादों को भी अनुवादित किया जा सकता है, क्योंकि इसका इस्तेमाल [translatewiki.net](https://www.mediawiki.org/wiki/$twn?action=edit\&redlink=1) पर किया जाता है। अनुवाद एक्सटेंशन के साथ एक उपयोग-में-आसान अनुवाद इंटरफ़ेस आता है, और यह सामग्री की संरचना को अनुवादित करने के लिए रखे टेक्स्ट से अलग कर सकता है, जिससे अनुवादकों को सिर्फ अनुवाद करने के लिए टेक्स्ट दिखता है, और सामग्री को प्रबंधित करने योग्य इकाइयों में बाँट दिया जाता है। हर इकाई पर बदलावों को ट्रैक किया जाता है, और अनुवादक तुरंत जान पाएँगे कि विकि पर या किसी विशिष्ट पृष्ठ पर किस चीज़ को अनुवाद की ज़रूरत है।

हर महीने सैकड़ों अनुवादक मीडियाविकि और दूसरे सॉफ्टवेयर परियोजनाओं को अनुवादित करने के लिए translatewiki.net पर अनुवाद एक्सटेंशन का इस्तेमाल करते हैं। [userbase.kde.org](http://userbase.kde.org) पर इसका इस्तेमाल सदस्यों के प्रलेखनों वाले हज़ारों पृष्ठों को अनुवादित करने के लिए किया जाता है। अनुवाद एक्सटेंशन का इस्तेमाल करना आसान है, और साथ-ही-साथ यह रिपोर्टिंग, निरीक्षण और कार्यप्रवाह जैसी आधुनिक सुविधाएँ भी प्रदान करता है।

## सुविधाएँ

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

अनुवाद एडिटर: टिप्पणी वाला एक संदेश (चित्र में नहीं दिख रहा) और दो सहायक भाषाओं से सुझाव

**इंटरफ़ेस:** अनुवाद एक्सटेंशन की मुख्य सुविधा है इसका साधारण मगर उपयोगी अनुवाद इंटरफ़ेस। संदेशों की परिभाषा और प्रलेखन जैसी आवश्यक जानकारी के साथ आप दूसरी भाषाओं में अनुवादों को भी देख सकते हैं। अगर कोई परिभाषा बदली है, आपको बदलाव दिख जाएँगे। इस एक्सटेंशन में कुछ चीज़ों को अपने आप जाँचा जाता है, जिनसे साधारण गलतियों का हल होता है, जैसे असंतुलति कोष्ठक और अनुपयुक्त वेरिएबल। कॉन्फ़िगरेशन पर निर्भर होकर, अनुवाद स्मृति तथा Google अनुवाद, माइक्रोसॉफ्ट के Bing अनुवादक और Apertium जैसे मशीन अनुवाद सेवाओं से भी सुझाव प्रदान किए जाते हैं।

अनुवाद इंटरफ़ेस पर जावास्क्रिप्ट और AJAX की मदद से अधिक सुविधाएँ जोड़ी जा सकती हैं। बैक-एंड पर WebAPI प्रदान की जाती हैं जिनका इस्तेमाल मोबाइल इंटरफ़ेसों पर किया जा सकता है फिर विशिष्ट प्रकार की सामग्री को दर्शाने के लिए भी। [Gettext po](https://en.wikipedia.org/wiki/Gettext) प्रारूप को समर्थित करने वाले ऑफ़लाइन और ऑनलाइन उपकरणों पर अनुवाद करने के लिए संदेशों को निर्यात भी किया जा सकता है।

**संदेश समूह और कार्य:** कई सुविधाएँ दो बुनियादी बातों पर बनी हैं: संदेश समूह और कार्य।

एक संदेश समूह कई संदेशों का समारोह होता है। सामग्री का हर पृष्ठ एक संदेश समूह है, जहाँ अपने सबसे बुनियादी रूप में, हर अनुच्छेद एक संदेश होगा। हर मीडियाविकि एक्सटेंशन पर उपयुक्त संदेश मिलकर translatewiki.net पर एक समूह बनाते हैं – कुछ बड़े एक्सटेंशनों के पास कई समूह हैं। आप समूहों के भी समूह बना सकते हैं, जैसे 'सभी समाचार पत्रिकाएँ' या 'अनुवाद एक्सटेंशन के सभी संदेश'। कई आँकड़ें और कार्य संदेश समूहों के आधार पर काम करते हैं।

किसी संदेश समूह में विशिष्ट संदेशों की सूची, यानी कार्यों, की मदद उपयोग के अलग-अलग मामले बनते हैं। आम तौर पर अनुवादक को निर्धारित संदेश समूह में सभी अनानुवादित संदेश दिखते हैं, मगर कुछ कार्य हैं जहाँ पर आप संदेशों को निरीक्षित कर सकते हैं और सभी संदेशों की सूची पा सकते हैं, चाहे वे अनुवादित हो या न हो।

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

यह विशेष पृष्ठ हर संदेश समूह के अनुवाद की स्थिति की रिपोर्ट बनाता है

**रिपोर्टिंग और सांख्यिकी:** इस एक्सटेंशन में [सांख्यिकी के लिए कई सुविधाएँ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) हैं जिनकी मदद से सभी संदेश समूहों पर अनानुवादित संदेशों से शुरू होकर हर भाषा के अनुवादकों को उनकी सक्रियता की मात्रा के साथ देखा जा सकता है।

**सामग्री का अनुवाद:** अगर आपने कभी मीडियाविकि पर बिना किसी उपकरण के सामग्री को अनुवादित करने की कोशिश की है, आपको पता होगा कि यह काम नहीं करता है। अनुवादित संस्करण कालग्रस्त हो जाते हैं और मास्टर पृष्ठ के साथ बदलावों को जाँचने का कोई तरीका नहीं है, तो कई सारे अधूरे और कालग्रस्त अनुवाद रह जाते हैं जिनकी स्थिति का भी किसी को कोई पता नहीं होता। अनुवादकों को अकसर निराशा होती है जब वे छोटे, प्रबंधित करने योग्य टेक्स्ट को भी ठीक से अनुवादित नहीं कर पाते। अनुवादकों को पता नहीं चल पाता कि किस पर काम करना है या किस चीज़ को अपडेट करने की ज़रूरत है। सदस्यों को कालग्रस्त सामग्री से काफ़ी परेशानी भी हो सकती है।

इन सब समस्याओं को अनुवाद एक्सटेंशन सुलझाता है। यह अनुवाद की आवश्यकता वाले पृष्ठों पर एक सूचना जोड़ देता है, मगर इसके गुणों की कमी नहीं। बस आपको पृष्ठ के उन हिस्सों को चिह्नित करना है जिन्हें अनुवाद की ज़रूरत है। फिर एक्सटेंशन इन हिस्सों को अनुच्छेदों के आकार के इकाइयों में बाँट देता है और उनके लिए एक संदेश समूह बना देता है। इसके बाद अनुवादक ऊपर वर्णित सभी सुविधाओं का इस्तेमाल कर पाएँगे। साथ ही, आप `<languages />` टैग की मदद से आसानी से भाषाओं का एक टेबल जोड़ सकते हैं या फिर (सिर्फ) अगर सदस्य की वरीयताओं की भाषा में पृष्ठ का संस्करण मौजूद हो तो उस पर \[\[Special:MyLanguage/Pagename]] प्रारूप की कड़ियों की मदद से जा सकते हैं।

अधिक जानकारी के लिए '[सामग्री पृष्ठ को अनुवाद के लिए कैसे सेटअप करें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)' और '[पृष्ठ अनुवाद सुविधा का विस्तृत प्रलेखन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)' ट्यूटोरियल देखें।

**विकासक:** इस एक्सटेंशन में कई प्रसिद्ध अनुवाद फ़ाइल प्रारूपों के लिए समर्थन है, जैसे जावा गुणधर्म और gettext po फ़ाइलें। इसमें अनुवादों को आसानी से आयात और निर्यात करने के लिए विकि और कमांड पंक्ति, दोनों पर कई सारे उपकरण हैं।

**खोज:** खोज सुविधा के साथ अनुवादक किसी विशिष्ट संदेश को ढूँढ़ सकते हैं जिसे वे अनुवादित करना चाहते हो। परियोजना के हर स्ट्रिंग को बारी-बारी से छानने में काफ़ी समय लग जाता है। साथ ही, अनुवादक शायद यह भी देखना चाहे कि किसी शब्द को किसी भाषा में परियोजना पर किस तरह से अनुवादित किया गया है।

इसे सुलझाता है विशेष [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations) पृष्ठ। अनुवादक किसी भी भाषा में विशिष्ट शब्दों वाले संदेशों को ढूँढ़ सकते हैं और कई स्थितियों पर उन्हें छाँट सकते हैं: यह डिफ़ॉल्ट है। खोजेन के बाद वे निर्धारित संदेशों के अनुवादों पर जाकर किसी शब्द का मौजूदा, लापता, या कालग्रस्त अनुवाद ढूँढ़ सकते हैं।

## उपयोग के मामले

आप अनुवाद एक्सटेंशन की मदद से करीब हर चीज़ को अनुवादित कर सकते हैं। वीडियो के उपशीर्षकों की तरह विशेष सामग्री को अनुवादित करने के लिए विशेष उपकरण मौजूद हैं, और उन्हें उन्हीं की मदद से अनुवादित किया जाए तो बेहतर है, मगर आम तौर पर कहे तो 'अनुवाद' की मदद से ऐसे किसी भी टेक्स्ट को आसानी से अनुवादित किया जा सकता है, जिसे एक शब्द से लेकर एक बड़े अनुच्छेद के आकार के संदेशों में बाँटा जा सकता है। लंबे संदेशों को अनुवादित करने में लोगों की दिक्कत आ सकती है, और उन्हें अनुवादित करना आम तौर पर ही कठिन माना जाता है।

अनुवाद एक्सटेंशन के तीन सबसे प्रसिद्ध उपयोग के मामले हैं **सामग्री का अनुवाद**, **लोकल इंटरफ़ेस का अनुवाद** और **सॉफ़्टवेयर का अनुवाद**। इनमें से सभी को निम्न अनुभागों में वर्णित किया गया है, जहाँ ट्यूटोरियलों और सन्दर्भ प्रलेखों की कड़ियाँ हैं जहाँ विस्तृत सहायता उपलब्ध है। तीन उपयोग के मामलों में इंटरफ़ेस के अनुवाद का इस्तेमाल सबसे कम होता है।

### पृष्ठ अनुवाद

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

अनुवाद पुरानी हो चुकी है: कालग्रस्त भागों को स्रोत के टेक्स्ट से बदल दिया जाता है, और अनुवादक एक ही क्लिक से संदशों को अपडेट करने के लिए उन पर जा सकते हैं।

ज़्यादातर विकियों पर ऐसी सामग्री है जिसे वे कई भाषाओं में उपलब्ध कराना चाहेंगे। चाहे वह बस कुछ ही पृष्ठ हो या फिर सौ-सो पृष्ठ, इससे फर्क नहीं पड़ता। अनुवादक के समय को बर्बाद न करने के लिए, पृष्ठों को सिर्फ तभी अनुवाद के लिए चिह्नित किया जाना चाहिए जब वे यथोचित स्थिर हो। इसके बाद हर बदलाव सैकड़ों पुराने अनुवादों को प्रभावित कर सकता है, और उसके साथ बढ़ती है उन्हें अनुवादित करने के लिए आवश्यक समय। स्वयंसेवक अनुवादकों के होने पर आपको इस बात की पहचान होनी चाहिए, और आपको उस समय का सम्मान करना चाहिए जो वे अनुवाद और अपडेट्स करते हुए बिताते हैं, जिससे बेकार के काम में घटाव होता है। अगर आप पृष्ठों को अनुवादित करने के लिए अनुवाद एक्सटेंशन का इस्तेमाल करते हैं, आप पहले से ही अनुवादक के समय का सबसे कुशल इस्तेमाल कर रहे हैं।

जिस तरह से अनुवाद एक्सटेंशन पृष्ठ को अनुच्छेद के आकार के हिस्सों में बाँटता है, अनुवादकों के पास उतनी स्वतंत्रता नहीं बचती जिससे वे सामग्री को बदल पाए। यह आम तौर पर एक अच्छी बात होती है, जहाँ सभी भाषाओं में संगतता की आशा की जाती हो। इससे बचने के लिए पतली गली है, मगर अनुवाद का यह तरीका विकिपीडिया के लेखों को अनुवादित करने के लिए सही नहीं होगा। हालाँकि वे किसी दूसरे भाषा से अनुवाद शुरू करे, वे धीरे-धीरे स्रोत भाषा से अलग होने लगते हैं। 'अनुवाद' के साथ, स्रोत पृष्ठ हमेशा मुख्य संस्करण रहता है, और नई सामग्री को अनुवादित संस्करणों पर नहीं जोड़ा जा सकता।

इन सीमाओं को याद रखते हुए ऐसे कई और मामले हैं जहाँ यह सुविधा सबसे ज़्यादा काम आती है। ज़्यादातर सदस्य प्रलेखन इसी श्रेणी में आती है, और साथ में समाचार जैसी सामग्री भी, जिसे एक बार लिखे जाने पर बदला नहीं जा सकता। अगर आपके पास अनुवाद एक्सटेंशन पहले से स्थापित है और आपने सदस्य अधिकारों को ठीक से कॉन्फ़िगर किया हुआ है, एक पृष्ठ बनाएँ और पूरे टेक्स्ट को `<languages />...` में लपेटें, उसके बाद इन कड़ियों या फिर '[पृष्ठ को अनुवाद के लिए कैसे तैयार करें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)' ट्यूटोरियल पर जाएँ।

पृष्ठों के समूहों को [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups) पृष्ठ की मदद से साथ में जोड़ा जा सकता है।

### बहुभाषी विकियों में लोकल इंटरफ़ेस का अनुवाद

ज़्यादातर विकियों पर कम-से-कम एक चीज़ अनुकूलित होती है, वह है [साइडबार](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar)। साइडबार पर अनुकूलित संदेशों और लोकल इंटरफ़ेस पर दूसरे अनुकूलनों के लिए अनुकूलित संदेश समूह बनाना संभव है।

एक दिलचस्प सुविधा है {{int:}} जादुई शब्द की मदद से बने बहुभाषी पृष्ठ या साँचें। [translatewiki.net](https://translatewiki.net/wiki/) का मुख्य पृष्ठ और विकिमीडिया कॉमन्स पर कुछ साँचें इस बात के अच्छे उदाहरण हैं। जादुई शब्द {{int:}} सामग्री के अनुवाद की सुविधा का एक विकल्प है और इससे translatewiki.net के मुख्य पृष्ठ की तरह भारी मार्कअप वाले पृष्ठों को अनुवाद में आसान बनाया जा सकता है। एक और काम की सुविधा यह है कि पृष्ठ अपने आप सदस्य के वरीयताओं की भाषा पर चलता है, तो किसी भाषा के टेबल की ज़रूरत नहीं, जिसके बजाय शायद आप एक इंटरफ़ेस भाषा सिलेक्टर रखें।

इसे सेटअप करना वर्तमान में सामग्री के अनुवाद से थोड़ा ज़्यादा कठिन है और इसमें सॉफ़्टवेयर के कॉन्फ़िगरेशन की ज़रूरत है, मगर इसे '[एक इंटरफ़ेस संदेश समूह कैसे बनाएँ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)' ट्यूटोरियल में दर्शाया गया है।

### सॉफ्टवेयर का अनुवाद

अनुवाद एक्सटेंशन से सॉफ़्टवेयर के इंटरफ़ेस के संदेशों को आसानी से अनुवादित किया जा सकता है। translatewiki.net पर इसकी मदद से दर्जनों सॉफ़्टवेयर उत्पादों को अनुवादित किया जाता है, चाहे वह कोई खेल हो या फिर वेब ऐप्लिकेशन। अनुवाद एक्सटेंशन पर वेब विकास में उपयुक्त साधारण प्रारूपों में पठन और अनुवाद के समर्थन हैं, जैसे [जावा गुणधर्म](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) और [YAML](https://en.wikipedia.org/wiki/YAML) फ़ाइलें। At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

आंतरिक रूप से ट्रैक किए गए फ़ाइलों पर बदलावों का ट्रैकिंग भी उपलब्ध है, क्योंकि आंतरिक रूप से यह एक्सटेंशन स्रोत के टेक्स्ट और इसके अनुवादों के मूल रूप में उनका इस्तेमाल करने की जगह स्थानीयकरण फ़ाइलों के एक कैश किए गए संस्करण का इस्तेमाल करता है, जहाँ स्रोत के टेक्स्ट और इसके अनुवादों को रखा जाता है। अनुवाद प्रबंधक नए संदेश परिभाषाओं और "फ़ज़ी" (अपडेट के लिए अनुरोधित) किए गए गए अनुवादों को जाँचने के लिए वेब इंटरफ़ेस या फिर कमांड पंक्ति का इस्तेमाल कर सकते हैं। यह कभी भी काम कर जाएगा, फर्क नहीं पड़ता कि फ़ाइल प्रारूप या संस्करण नियंत्रण प्रणाली (अगर है तो) क्या हैं।

साधारण कमांड पंक्ति उपकरणों की मदद से अनुवाद प्रबंधक आसानी से एक ही कमांड से बड़े से बड़े अनुवादों के सेट्स को आयात कर सकते हैं, और वे सही प्रारूप और डिरेक्ट्री संरचना में उन्हें निर्यात भी कर सकते हैं। आप सीधे अपने [VCS](https://en.wikipedia.org/wiki/Version%20control%20system) रिपॉज़िटरी मद पर निर्यात कर सकते हैं, जहाँ आप आसानी से बदलावों और नई फ़ाइलों को कमिट कर सकते हैं।

## आगे पढ़ने के लिए ट्यूटोरियल

### अनुवादकों और अनुवाद प्रबंधकों के लिए

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

विकिमेनिया 2017 में [Extension:अनुवाद](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) के उपयोग के बारे में एक कार्यशाला के स्लाइड्स।

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [अनुवाद कैसे करें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[ट्यूटोरियल]
- [अनुवाद की सर्वोत्तम प्रथाएँ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [सांख्यिकी और रिपोर्टिंग](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [गुणवत्ता आश्वासन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [संदेश समूह स्थिति](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[प्रगति में] [खोज](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [ऑफ़लाइन अनुवाद](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[प्रगति में] [शब्दकोष](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### अनुवाद प्रबंधकों के लिए

- [अनुवाद के लिए पृष्ठ कैसे तैयार करें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[ट्यूटोरियल]
- [पृष्ठ अनुवाद प्रबंधन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [इंटरफ़ेस के संदेश समूह (स्थानीयकृत साइडबार, मुख्य पृष्ठ और साँचें)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[ट्यूटोरियल]
- \[प्रगति में] [संदेश समूह प्रबंधन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML कॉन्फ़िगरेशन प्रारूप](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [फ़ाइल पर आधारित संदेश समूहों के लिए YAML कॉन्फ़िगरेशन कैसे लिखें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[ट्यूटोरियल]

### विकासकों के लिए सन्दर्भ के दस्तावेज़

- [स्थापना](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) और [कॉन्फ़िगरेशन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Language Extension Bundle](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) ज़्यादातर मामलों में काफ़ी होना चाहिए।

- [अनुवाद स्मृतियाँ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [विकासक गाइड](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[प्रगति में] [विकासकों के लिए अनुवाद के वर्णन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [हुक](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[प्रगति में] [संदेश समूह](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[प्रगति में] [फ़ाइल स्वरूप का समर्थन](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [अनुवाद सहायताएँ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[लिखा नहीं] [प्रतिक्रिया API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [इंसर्टेबल्स](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [कमांड पंक्ति स्क्रिप्टें](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [मीडियाविकि के कार्यों पर कार्यप्रवाह](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - वर्णित करता है कि पृष्ठ के अनुवाद के लिए चिह्नित किए जाने पर या किसी अनुभाग के अनुवादित किए जाने पर क्या-क्या काम होते हैं
  - [अनुवाद स्मृति की संरचना](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### संबंधित

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – विकासकों के लिए हैकथॉन और प्रशिक्षणों में उपयुक्त साधारण स्थानीयकरण ट्यूटोरियल
- [वैश्विक भाषा चयनकर्ता](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – वेब फॉण्ट्स और इनपुट के माध्यम प्रदान करता है
- [मेटा:अनुवादनीयता](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – बहुभाषी विकियों पर पृष्ठ या प्रक्रियाएँ बनाते समय कुछ बातों जो याद रखनी चाहिए
- [मेटा:टेक/अनुवादक/सूची](https://meta.wikimedia.org/wiki/Tech/Translators/List) – अपने आपको वर्तमान में सक्रिय टेक अनुवादों की सूची में जोड़ें

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/hi" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016710"}
::
