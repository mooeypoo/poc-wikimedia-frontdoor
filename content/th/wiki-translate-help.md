---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/th
sourceWiki: www.mediawiki.org
sourceRevision: "8121598"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

เอกสารกำกับสำหรับ [ส่วนขยาย:การแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**ผู้แปล** (**[หน้าวิธีใช้หลัก](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [วิธีแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [การปฏิบัติที่ดีที่สุด](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [สถิติและการรายงาน](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [การรับรองคุณภาพ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [สถานะกลุ่มข้อความ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [การแปลออฟไลน์](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [อภิธานศัพท์](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**ผู้ดูแลระบบการแปล**

- [วิธีเตรียมหน้าสำหรับการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [การดูแลการแปลหน้า](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [การแปลองค์ประกอบที่ไม่มีโครงสร้าง](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [การบริหารจัดการกลุ่ม](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [ย้ายหน้าที่ถูกแปลแล้ว](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Import translations via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Working with message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**ผู้ดูแลระบบและผู้พัฒนา**

- [การติดตั้ง](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [การกำหนดค่า](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Getting started with development](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Developer guide](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [การแปลแบบขยาย](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [ตัวตรวจสอบความถูกต้อง](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [องค์ประกอบที่แทรกได้](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Group configuration](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Group configuration example](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Translation memories](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Translation aids](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Enabling message bundles](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP hooks](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[แปลแม่แบบนี้](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

หน้าพิเศษหลักของส่วนขยาย "[พิเศษ:แปล](https://www.mediawiki.org/wiki/%E0%B8%9E%E0%B8%B4%E0%B9%80%E0%B8%A8%E0%B8%A9:%E0%B9%81%E0%B8%9B%E0%B8%A5?action=edit\&redlink=1)" ในสภาพที่ปกติที่สุด "ดูข้อความที่ยังไม่ได้แปลทั้งหมด"

[ส่วนขยายการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) ทำให้มีเดียวิกิมีคุณลักษณะที่จำเป็นสำหรับการทำงานแปล โดยสามารถใช้แปลหน้าเนื้อหา ส่วนติดต่อในวิกิ และผลิตภัณฑ์ซอฟต์แวร์อื่น ๆ ได้ โดยส่วนขยายนี้ถูกใช้ที่ [translatewiki.net](https://www.mediawiki.org/wiki/$twn?action=edit\&redlink=1) ส่วนขยายการแปลมาพร้อมกับอินเทอร์เฟซการแปลที่ใช้งานง่าย และสามารถแยกโครงสร้างเนื้อหาออกจากเนื้อหาข้อความที่ต้องการแปล โดยแสดงเฉพาะข้อความที่แปลได้ต่อนักแปลโดยแยกเนื้อหาออกเป็นหน่วยที่จัดการได้ แต่ละหน่วยจะถูกติดตามโดยอัตโนมัติสำหรับการเปลี่ยนแปลง และผู้แปลจะเห็นได้ทันทีว่าสิ่งใดจำเป็นต้องอัปเดตในหน้าใดหน้าหนึ่งหรือทั่วทั้งวิกิ

ส่วนขยายการแปล ใช้เพื่อแปลส่วนต่อประสานผู้ใช้ของมีเดียวิกิและโครงการซอฟต์แวร์อื่น ๆ ที่ translatewiki.net โดยนักแปลหลายร้อยคนทุกเดือน ที่ [userbase.kde.org](http://userbase.kde.org) ใช้เพื่อแปลเนื้อหาเกือบพันหน้าพร้อมเอกสารประกอบสำหรับผู้ใช้ การเริ่มต้นใช้ส่วนขยายการแปลเป็นเรื่องง่าย แต่ในขณะเดียวกันก็ขยายขนาดและให้คุณลักษณะการรายงาน การตรวจสอบ และเวิร์กโฟลว์ขั้นสูง

## คุณลักษณะ

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

ตัวแก้ไขการแปล: ข้อความที่มีคำแนะนำ (ไม่ปรากฏในภาพ) และคำแนะนำจากตัวช่วยสองภาษา

**อินเตอร์เฟซ:** คุณลักษณะหลักของส่วนขยายแปล คือ อินเทอร์เฟซการแปลที่เรียบง่ายแต่ใช้งานได้จริง นอกจากข้อมูลสำคัญ เช่น คำจำกัดความของข้อความและเอกสารประกอบแล้ว คุณยังสามารถดูคำแปลในภาษาอื่น ๆ ได้อีกด้วย หากคำจำกัดความมีการเปลี่ยนแปลง คุณจะเห็นการเปลี่ยนแปลง ส่วนขยายนี้มาพร้อมกับการตรวจสอบในตัวที่สามารถช่วยเหลือข้อผิดพลาดทั่วไป เช่น วงเล็บเหลี่ยมที่ไม่สมดุลและตัวแปรที่ไม่ได้ใช้ นอกจากนี้ยังมีคำแนะนำจากหน่วยความจำการแปลและบริการแปลภาษาด้วยเครื่องมือเช่น Google Translate, Bing Translator และ Apertium ของ Microsoft ทั้งนี้ขึ้นอยู่กับการกำหนดค่า

การใช้งานอินเทอร์เฟซการแปลได้รับการปรับปรุงด้วย JavaScript และ AJAX แบ็กเอนด์จัดเตรียม WebAPI ที่สามารถใช้ในอินเทอร์เฟซมือถือหรืออินเทอร์เฟซที่ปรับให้เหมาะกับเนื้อหาประเภทใดประเภทหนึ่งโดยเฉพาะ นอกจากนี้ยังสามารถส่งออกข้อความสำหรับการแปลในเครื่องมือออฟไลน์และออนไลน์อื่น ๆ ที่ยอมรับรูปแบบไฟล์ [Gettext po](https://en.wikipedia.org/wiki/Gettext)

**กลุ่มข้อความและสิ่งที่ต้องทำ:** หลาย ๆ คุณลักษณะสร้างขึ้นโดยมีฐานจากสองแนวคิดหลัก คือกลุ่มสารและสิ่งที่ต้องทำ

กลุ่มสารคือชุดที่รวบรวมสารหลาย ๆ สารไว้ด้วยกัน ในหน้าหนึ่ง ๆ อาจมีหนึ่งกลุ่มสารและแต่ละย่อหน้านับเป็นหนึ่งสาร สารที่ใช้กันในแต่ละส่วนขยายจะมาจาก translatewiki.net ในบางส่วนขยายใหญ่ ๆ ของมีเดียวิกิมักจะมีหลายกลุ่มข้อความ ซึ่งคุณสามารถจัดกลุ่มสารของสารเหล่านี้อีกทีได้ เช่น "จดหมายข่าวทั้งหมด" หรือ "สารในส่วนขยายการแปลภาษาทั้งหมด" และทำให้ดูสถิติของแต่ละภาษาง่ายขึ้นด้วย

สิ่งอื่นที่ต้องทำจะใช้ในกรณีอื่นที่แตกต่างกันไปจากการแปลตามปกติ โดยปกติผู้แปลจะเห็นรายการของสารที่ยังไม่ได้แปลในกลุ่มสารที่เลือก สิ่งที่ต้องทำจะแสดงเป็นสารที่ถูกแปลแล้วเพื่อการปรับปรุงคุณภาพหลังการแปลแทน

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

หน้าพิเศษนี้รายงานสถานะการแปลของกลุ่มข้อความแต่ละกลุ่ม

**รายงานและสถิติ:** ส่วนขยายมีคุณลักษณะเกี่ยวกับ[การรายงานสถิติ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)มากมาย ตั้งแต่มุมมองภาพรวมของข้อความที่ยังไม่แปลจากทุกกลุ่มข้อความในภาษาที่เลือก จนถึงสถิติของผู้แปลรายภาษาตามระดับการมีส่วนร่วม เป็นต้น

**แปลเนื้อหา:** หากคุณเคยพยายามแปลเนื้อหาในมีเดียวิกิโดยไม่มีเครื่องมือใด ๆ คุณจะรู้ว่ามันไม่ได้ปรับขนาด เวอร์ชันที่แปลล้าสมัยและไม่มีวิธีติดตามการเปลี่ยนแปลงในหน้าต้นแบบ ดังนั้นจึงมีการแปลที่แปลเพียงครึ่งเดียวและล้าสมัยจำนวนมากโดยไม่มีภาพรวมที่ชัดเจนของสถานะโดยรวม นักแปลมักจะรู้สึกท้อแท้เมื่อไม่สามารถทำงานกับข้อความขนาดเล็กที่จัดการได้ นักแปลไม่พบสิ่งที่ต้องทำหรือสิ่งที่ต้องปรับปรุง ผู้ใช้ยังสับสนกับข้อมูลที่ล้าสมัยอีกด้วย

ปัญหาเหล่านีี้แก้ไขได้โดยใช้ส่วนขยายการแปล โดยส่วนขยายจะเพิ่มความสำคัญให้กับหน้าที่ต้องการคำแปลด่วน สามารถเลือกเฉพาะส่วนที่ต้องการคำแปลได้เพียงใส่ตัวทำเครื่องหมาย ส่วนขยายจะแยกแต่ละย่่อหน้าให้เป็นหนึ่งข้อความ และจัดกลุ่มข้อความให้กับข้อความแต่ละหน้า และผู้แปลก็ใช้งานทุกคุณลักษณะดังที่กล่าวด้านบนได้ทันที อาจเลือกใส่กล่องรวมหน้าในแต่ละภาษาโดยใช้ `<languages />` หรือใช้ \[\[Special:MyLanguage/Pagename]] สำหรับการเปลี่ยนทางไปยังภาษาที่ผู้ใช้ตั้งค่าโดยอัตโนมัติได้เช่นกัน

สำหรับสารสนเทศเพิ่มเติมดูที่[วิธีการเตรียมหน้าสำหรับการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)และที่[ข้อมูลเชิงลึกเกี่ยวกับคุณลักษณะการแปลหน้า](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)

**สำหรับผู้พัฒนา:** ส่วนขยายมาพร้อมกับการรองรับไฟล์สำหรับการแปลหลายรูปแบบ เช่น จาวา (Java) และ Gettext po และมีชุดเครื่องมือเช่นการนำเข้าและส่งออกอีกมากมายทั้งบนวิกิและในคอมมานด์ไลน์

**การค้นหา:** หากไม่มีเครื่องมือค้นหาในส่วนขยาย คงจะยากในการหาสิ่งที่ต้องการแปลไม่น้อย ผู้แปลสามารถค้นหาคำแปลที่ต้องการแก้ไขหรือการหาว่าแต่ละคำถูกแปลในภาษาอื่นอย่างไรได้อีกด้วย

โดยผู้แปลสามารถใช้งานได้ผ่าน [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations) ผู้แปลสามารถค้นหาข้อความที่มีคำบางคำในภาษาและตัวกรองตามเกณฑ์ต่าง ๆ โดยปริยาย ค้นหาได้ทั้งข้อความต้นฉบับและคำแปลที่แปลแล้วหรือในแต่ละภาษา

## กรณีการใช้

คุณสามารถแปลได้เกือบทุกอย่างด้วยส่วนขยายการแปล โดยปกติแล้วมีเครื่องมือพิเศษสำหรับการแปลเนื้อหาบางประเภท เช่น คำบรรยายวิดีโอ ซึ่งทำได้ดียิ่งขึ้นด้วยเครื่องมือเหล่านั้น แต่โดยทั่วไปแล้ว _การแปลภาษา_ ทำงานได้ดีมากกับข้อความทุกประเภทที่สามารถแยกเป็นข้อความที่มีความยาวตั้งแต่ หนึ่งคำถึงหนึ่งย่อหน้าใหญ่ ข้อความที่ยาวขึ้นจะไม่สะดวกในการแปลและยากต่อการทำงานด้วย

กรณีใช้งานหลักสามกรณีซึ่งส่วนขยาย Translate รองรับ ได้แก่ **การแปลเนื้อหา**, **การแปลส่วนต่อประสานภายในเครื่อง** และ **การแปลซอฟต์แวร์** เนื้อหาทั้งหมดจะกล่าวถึงในส่วนต่อไปนี้ โดยมีลิงก์ไปยังบทช่วยสอนและเอกสารอ้างอิงหรือความช่วยเหลือเชิงลึกในหัวข้อที่มี จากสามกรณีการใช้งาน การแปลอินเตอร์เฟสถูกใช้น้อยที่สุด

### การแปลเนื้อหา

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

การแปลล้าสมัยแล้ว: ส่วนที่ล้าสมัยจะถูกแทนที่ด้วยข้อความต้นฉบับใหม่ และผู้แปลสามารถเข้าถึงข้อความเพื่ออัปเดตได้ในคลิกเดียว

วิกิส่วนใหญ่มีเนื้อหาที่ต้องการให้มีหลายภาษา ไม่กี่หน้าหรือหลายร้อยหน้าก็ไม่สำคัญ เพื่อป้องกันการเสียเวลาของนักแปล ควรทำเครื่องหมายหน้าสำหรับการแปลเฉพาะเมื่อมีความเสถียรพอสมควร การเปลี่ยนแปลงแต่ละครั้งที่ทำหลังจากนั้นอาจส่งผลต่อการแปลเก่านับสิบหรือร้อยรายการ และเวลาที่ต้องใช้ในการอัปเดตก็เพิ่มขึ้น โดยเฉพาะอย่างยิ่งกับนักแปลอาสาสมัคร คุณควรตระหนักถึงแง่มุมนี้ และเคารพเวลาที่พวกเขาใช้ในการแปลและอัปเดต หลีกเลี่ยงงานที่ไม่จำเป็น หากคุณใช้ส่วนขยายการแปลเพื่อแปลหน้าเว็บ คุณก็พร้อมที่จะใช้เวลาในการแปลที่มีอยู่อย่างมีประสิทธิภาพและประสิทธิผลสูงสุดแล้ว

วิธีที่ส่วนขยายการแปล แบ่งหน้าออกเป็นหน่วยขนาดย่อหน้าไม่ได้ทำให้นักแปลมีอิสระมากเกินไปในการเปลี่ยนแปลงเนื้อหา ซึ่งมักจะเป็นสิ่งที่ดีและเหมาะอย่างยิ่งในกรณีที่ต้องการความต่อเนื่องและความสอดคล้องของเนื้อหาในภาษาต่าง ๆ สามารถแก้ไขได้ แต่โดยหลักการแล้ว วิธีการแปลแบบนี้ไม่เหมาะโดยทั่วไป ตัวอย่างเช่น สำหรับบทความในวิกิพีเดีย ซึ่งมักจะเป็นอิสระจากกันโดยสิ้นเชิง แม้ว่าต้นฉบับจะเริ่มต้นด้วยการแปลจากภาษาอื่น แต่พวกเขามักจะเริ่มใช้ชีวิตที่เป็นอิสระจากฉบับดั้งเดิม เมื่อใช้ _แปลภาษา_ หน้าต้นฉบับจะเป็นเวอร์ชันหลักเสมอ และเนื้อหาใหม่จะไม่สามารถพัฒนาในเวอร์ชันแปลได้

ด้วยข้อจำกัดเหล่านี้ มีหลายกรณีที่ฟีเจอร์นี้เข้ากันได้อย่างสมบูรณ์แบบ เอกสารผู้ใช้ส่วนใหญ่หากไม่ใช่ทั้งหมดจะจัดอยู่ในหมวดหมู่นี้ เช่นเดียวกับเนื้อหาข่าวที่ไม่เปลี่ยนแปลงเมื่อเขียนแล้ว หากคุณติดตั้งส่วนขยายการแปลแล้วและกำหนดค่าสิทธิ์การเข้าถึงแล้ว ให้ลองสร้างหน้าและรวมข้อความทั้งหมดไว้ใน `<languages />...` แล้วไปตามลิงก์ หรือทำตามบทช่วยสอน [วิธีเตรียมหน้าสำหรับการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)

กลุ่มของเพจสามารถรวมเข้าด้วยกันเพิ่มเติมด้วยเพจ [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups)

### การแปลอินเตอร์เฟสท้องถิ่นในวิกิหลายภาษา

สิ่งหนึ่งที่เกือบทุกวิกิปรับแต่ง คือ [sidebar](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar) เป็นไปได้ที่จะสร้างกลุ่มข้อความสำหรับข้อความแถบด้านข้างที่กำหนดเองและสำหรับการปรับแต่งอินเทอร์เฟซภายในเครื่องอื่น ๆ

ส่วนขยายที่น่าสนใจอย่างหนึ่ง คือ หน้าหรือแม่แบบหลายภาษาที่สร้างด้วย {{int:}} magic word หน้าหลัก [translatewiki.net](https://translatewiki.net/wiki/) และแม่แบบ Wikimedia Commons บางส่วนเป็นตัวอย่างที่ดีของสิ่งนี้ คำว่าวิเศษ {{int:}} เป็นอีกทางเลือกหนึ่งสำหรับคุณลักษณะการแปลเนื้อหา และเหมาะกว่าในการมาร์กอัปหน้าเว็บที่มีน้ำหนักมาก เช่นเดียวกับหน้าหลัก translatewiki.net ฟีเจอร์ที่ดีอีกอย่างคือภาษาของเพจจะตามหลังภาษาอินเทอร์เฟซผู้ใช้โดยอัตโนมัติ ดังนั้นจึงไม่จำเป็นต้องใช้แถบภาษา แม้ว่าคุณอาจต้องการมีตัวเลือกภาษาอินเทอร์เฟซแทน

ขณะนี้การตั้งค่านี้ซับซ้อนกว่าการแปลเนื้อหาเล็กน้อยและต้องมีการกำหนดค่าซอฟต์แวร์ แต่ทั้งหมดจะกล่าวถึงในบทช่วยสอน [วิธีสร้างกลุ่มข้อความอินเทอร์เฟซ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)

### การแปลซอฟต์แวร์

ส่วนขยาย Translate เหมาะสำหรับการแปลข้อความส่วนต่อประสานซอฟต์แวร์ ที่ translatewiki.net ใช้เพื่อแปลผลิตภัณฑ์ซอฟต์แวร์หลายสิบรายการจากเกมเป็นเว็บแอปพลิเคชัน ส่วนขยายการแปลรองรับการอ่านและอัปเดตการแปลจากและไปยังรูปแบบทั่วไปที่ใช้ในการพัฒนาเว็บ รวมถึงไฟล์ [คุณสมบัติ Java](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) และ [Yaml](https://en.wikipedia.org/wiki/YAML) . At translatewiki.net, it is used to translate dozens of software products from games to web applications. The Translate extension supports reading and updating translations from and to common formats used in web development including [Java properties](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) and [Yaml](https://en.wikipedia.org/wiki/YAML) files.

การติดตามการเปลี่ยนแปลงยังมีให้ใช้งานสำหรับไฟล์ที่ติดตามจากภายนอก เนื่องจากภายในส่วนขยายจะใช้ไฟล์การแปลเวอร์ชันอนุพันธ์ที่แคชซึ่งจัดเก็บข้อความต้นฉบับและคำแปลไว้ แทนที่จะใช้โดยตรงในรูปแบบดั้งเดิม ผู้ดูแลระบบการแปลสามารถใช้เว็บอินเทอร์เฟซหรืออินเทอร์เฟซบรรทัดคำสั่งเพื่อตรวจสอบคำจำกัดความของข้อความใหม่และ "คลุมเครือ" (ขออัปเดต) เมื่อจำเป็นต้องอัปเดต ซึ่งทำงานได้โดยไม่คำนึงถึงรูปแบบไฟล์พื้นฐานหรือระบบควบคุมเวอร์ชัน (ถ้ามี)

ด้วยเครื่องมือบรรทัดคำสั่งที่เรียบง่าย ผู้ดูแลระบบการแปลสามารถนำเข้าการแปลที่มีอยู่จำนวนมากได้อย่างง่ายดาย และด้วยคำสั่งเพียงคำสั่งเดียว พวกเขาสามารถส่งออกการแปลทั้งหมดในรูปแบบที่ถูกต้องและในโครงสร้างไดเร็กทอรีที่ถูกต้อง คุณสามารถส่งออกไปยังจุดชำระเงินที่เก็บ [VCS](https://en.wikipedia.org/wiki/Version%20control%20system) ได้โดยตรง ซึ่งคุณสามารถส่งการเปลี่ยนแปลงและไฟล์ใหม่ได้อย่างง่ายดาย

## การอ่านเพิ่มเติมและแบบฝึกหัด

### สำหรับนักแปลและผู้ดูแลการแปล

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

สไลด์เวิร์กชอปเกี่ยวกับวิธีใช้ [ส่วนขยาย:การแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) ที่ Wikimania17

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

A videocast in English of the slides.

- [วิธีในการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[แบบช่วยสอน]
- [แนวทางปฏิบัติที่ดีที่สุดในการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [สถิติและการรายงาน](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [ระบบประกันคุณภาพ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [สถานะกลุ่มข้อความ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[กำลังดำเนินการ] [ค้นหา](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [การแปลแบบออฟไลน์](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[กำลังดำเนินการ] [อภิธานศัพท์](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

#### สำหรับผู้ดูแลระบบการแปล

- [วิธีเตรียมหน้าสำหรับการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[แบบช่วยสอน]
- [การดูแลการแปลหน้า](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [กลุ่มข้อความอินเทอร์เฟซ (แถบด้านข้าง หน้าหลัก และแม่แบบที่แปลเป็นภาษาท้องถิ่น)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[แบบช่วยสอน]
- \[กำลังดำเนินการ] [การจัดการกลุ่มข้อความ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [รูปแบบการกำหนดค่า YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [วิธีเขียนการกำหนดค่า YAML สำหรับกลุ่มข้อความตามไฟล์](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[แบบช่วยสอน]

### เอกสารอ้างอิงสำหรับนักพัฒนา

- [การติดตั้ง](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) และ [การกำหนดค่า](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [ชุดส่วนขยายภาษามีเดียวิกิ](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) น่าจะเพียงพอในกรณีส่วนใหญ่

- [หารจดจำสิ่งที่ทำการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [คู่มือนักพัฒนา](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[กำลังดำเนินการ] [อธิบายการแปลสำหรับนักพัฒนา](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Hooks](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[กำลังดำเนินการ] [กลุ่มข้อความ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[กำลังดำเนินการ] [รองรับรูปแบบไฟล์](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [ช่วยแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[ไม่ได้เขียนไว้] [action API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [องค์ประกอบที่แทรกได้](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [สคริปต์บรรทัดคำสั่ง หรือ Command line script](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [ลำดับขั้นตอนในงานมีเดียวิกิ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - อธิบายว่างานใดที่เกี่ยวข้องเมื่อหน้าถูกทำเครื่องหมายสำหรับการแปลหรือส่วนที่มีการแปล
  - [การออกแบบหน่วยความจำของการแปล](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### ที่เกี่ยวข้อง

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – บทช่วยสอนการแปลทั่วไปสำหรับนักพัฒนา สำหรับใช้ในแฮ็กกาธอนและการฝึกอบรม
- [Universal Language Selector](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – ให้แบบอักษรเว็บและวิธีการป้อนข้อมูล
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – สิ่งที่ต้องคำนึงถึงเมื่อสร้างเพจหรือกระบวนการบนวิกิหลายภาษา
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – เพิ่มตัวคุณเองในรายชื่อนักแปลเทคโนโลยีที่ใช้งานอยู่ในปัจจุบัน

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/th" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8121598"}
::
