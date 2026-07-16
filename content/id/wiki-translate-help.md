---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/id
sourceWiki: www.mediawiki.org
sourceRevision: "8072913"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Dokumentasi untuk [Pengaya:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Penerjemah** (**[halaman bantuan utama](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Cara menerjemahkan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Praktik terbaik](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistik dan pelaporan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Jaminan mutu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Keadaan kelompok pesan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Penerjemahan luring](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Daftar istilah](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Pengurus terjemahan**

- [Cara mempersiapkan sebuah halaman untuk diterjemahkan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Pengurusan penerjemahan halaman](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Penerjemahan unsur tak terstruktur](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Pengelolaan kelompok](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Memindahkan halaman yang bisa diterjemahkan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Impor terjemahan melalui CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Bekerja dengan bundel pesan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Pengembang dan pengurus sistem**

- [Pemasangan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Konfigurasi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Memulai dengan pengembangan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Panduan pengembang](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Memperluas Terjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Pengabsah](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Butir yang dapat disisipkan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Konfigurasi kelompok](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Contoh konfigurasi kelompok](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Ingatan terjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Bantuan terjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Menyalakan bundel pesan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [Pengait PHP](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[terjemahkan templat ini](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

Halaman khusus utama pengaya [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), dalam tugas yang paling umum, "lihat semua pesan yang belum diterjemahkan"

[Pengaya Terjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) menyempurnakan MediaWiki dengan fitur-fitur penting yang dibutuhkan untuk melakukan pekerjaan penerjemahan. Dapat digunakan untuk menerjemahkan halaman isi, antarmuka wiki dan bahkan produk perangkat lunak lainnya, karena digunakan pada [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). Pengaya Terjemahan hadir dengan antarmuka terjemahan yang mudah digunakan dan dapat memisahkan struktur isi dari isi teks yang perlu diterjemahkan, hanya menampilkan teks yang dapat diterjemahkan Setiap satuan secara otomatis dilacak perubahannya, dan penerjemah segera melihat apa yang perlu diperbarui pada halaman tertentu atau di seluruh wiki.

Pengaya Terjemahan digunakan untuk menerjemahkan antarmuka pengguna MediaWiki dan proyek perangkat lunak lainnya pada translatewiki.net oleh ratusan penerjemah setiap bulan. Pada [userbase.kde.org](http://userbase.kde.org), ini digunakan untuk menerjemahkan hampir seribu halaman isi dengan dokumentasi pengguna. Mudah untuk mulai menggunakan pengaya Terjemahan, tetapi pada saat yang sama ia juga dapat ditingkatkan dan menyediakan fitur pelaporan, peninjauan, dan alur kerja tingkat lanjut.

## Fitur

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

Penyunting terjemahan: pesan dengan tip (tidak terlihat dalam gambar) dan saran dari dua bahasa penolong

**Antarmuka:** Fitur utama pengaya Terjemahan adalah antarmuka penerjemahan yang sederhana namun fungsional. Selain informasi penting seperti takrif dan dokumentasi pesan, Anda juga dapat melihat terjemahan dalam bahasa lain. Jika suatu takrif telah berubah, Anda akan melihat perubahannya. Pengaya ini dilengkapi dengan beberapa pemeriksaan bawaan, yang dapat membantu mengatasi kesalahan umum seperti tanda kurung yang tidak seimbang dan pengaya yang tak digunakan. Bergantung pada konfigurasinya, ada juga saran dari memori terjemahan dan layanan terjemahan mesin seperti Google Terjemahan, Penerjemah Bing milik Microsoft, dan Apertium.

Ketergunaan antarmuka terjemahan diperbagus dengan JavaScript dan AJAX. Bagian belakang menyediakan WebAPI yang dapat digunakan dalam antarmuka seluler atau antarmuka yang disesuaikan dengan jenis isi tertentu. Anda juga dapat mengekspor pesan untuk diterjemahkan di alat daring dan luring lain yang menerima format berkas [Gettext po](https://en.wikipedia.org/wiki/Gettext).

**Kelompok pesan dan tugas:** Banyak fitur yang dibangun berdasarkan dua konsep dasar: kelompok pesan dan tugas.

Kelompok pesan mewakili kumpulan pesan. Satu halaman isi akan menjadi satu kelompok pesan, di mana, dalam bentuk paling sederhana, setiap paragraf akan menjadi satu pesan dalam kelompok tersebut. Pesan yang digunakan di setiap pengaya MediaWiki membentuk kelompok pesan di translatewiki.net – beberapa pengaya terbesar punya banyak kelompok. Anda juga dapat membuat kelompok dari kelompok, seperti _Semua buletin_ atau _Semua pesan pengaya Terjemahan_. Banyak statistik dan tugas bekerja berdasarkan kelompok pesan.

Tugas-tugas tersebut, atau dengan kata lain, daftar pesan yang berbeda dalam kelompok pesan, memfasilitasi berbagai kasus penggunaan. Biasanya, penerjemah mendapatkan daftar semua pesan yang belum diterjemahkan dalam kelompok pesan yang dipilih, tetapi ada tugas-tugas di mana Anda dapat meninjau pesan atau hanya mendapatkan daftar semua pesan, baik yang telah diterjemahkan maupun yang belum.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Halaman istimewa ini melaporkan status penerjemahan setiap kelompok pesan

**Pelaporan dan statistik:** Pengaya ini punya [fitur pelaporan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) yang luas mulai dari tampilan pesan yang belum diterjemahkan di seluruh kelompok pesan dalam bahasa tertentu hingga daftar penerjemah per bahasa dengan tingkat kegiatannya.

**Terjemahan isi:** Jika Anda pernah mencoba menerjemahkan isi di MediaWiki tanpa alat apa pun, Anda tahu itu tidak dapat diskalakan. Versi terjemahannya sudah usang dan tak ada cara untuk melacak perubahan pada halaman utama, jadi ada banyak terjemahan yang setengah diterjemahkan dan usang tanpa ikhtisar yang jelas tentang status keseluruhannya. Penerjemah sering kali merasa putus asa ketika mereka tidak dapat bekerja dengan teks-teks kecil yang mudah dikelola. Penerjemah tidak menemukan apa yang perlu dikerjakan atau apa yang perlu diperbarui. Pengguna juga menjadi bingung karena informasinya sudah usang.

Semua ini teratasi dengan pengaya Terjemahan dan fitur terjemahan halamannya. Fitur ini memang menambah beban pada halaman yang perlu diterjemahkan, tetapi manfaatnya jauh lebih besar. Intinya, Anda hanya perlu menandai bagian halaman yang perlu diterjemahkan. Pengaya ini kemudian membagi bagian-bagian tersebut menjadi satuan-satuan seukuran paragraf dan membuat kelompok pesan untuknya. Setelah itu, penerjemah dapat menggunakan semua fitur yang dijelaskan di atas. Selain itu, Anda dapat dengan mudah menambahkan bilah bahasa dengan tanda `<languages />` atau membuat tautan secara otomatis mengarah ke versi bahasa pilihan pengguna (hanya) jika ada, dengan menggunakan tautan berformat \[\[Special:MyLanguage/Pagename]].

Untuk informasi lebih lanjut, lihat tutorial [Cara menyiapkan halaman isi untuk penerjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) dan [dokumentasi mendalam tentang fitur penerjemahan halaman](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Pengembang:** Pengaya ini dilengkapi dengan dukungan bawaan untuk berbagai format berkas terjemahan umum, seperti properti Java dan berkas Gettext po. Pengaya ini punya seperangkat alat yang lengkap, baik di wiki maupun di baris perintah, untuk mengimpor dan mengekspor terjemahan secara cekatan.

**Pencarian:** Tanpa fitur pencarian, penerjemah kesulitan menemukan pesan khusus yang ingin diterjemahkan. Menelusuri semua terjemahan atau untaian kata dalam proyek tidaklah efisien. Selain itu, penerjemah sering kali ingin memeriksa bagaimana istilah tertentu diterjemahkan dalam bahasa tertentu di seluruh proyek.

Masalah ini diatasi dengan halaman istimewa [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Penerjemah dapat menemukan pesan yang mengandung istilah tertentu dalam bahasa apa pun dan menyaringnya berdasarkan berbagai kriteria: ini adalah pengaturan bawaan. Setelah mencari, mereka dapat mengubah hasil pencarian ke terjemahan pesan tersebut, misalnya untuk menemukan terjemahan istilah tertentu yang sudah ada, hilang, atau usang.

## Kasus penggunaan

Anda dapat menerjemahkan hampir semua hal dengan pengaya Terjemahan. Tentu saja, terdapat alat khusus untuk menerjemahkan jenis isi tertentu seperti takarir video, yang lebih baik dilakukan dengan alat tersebut. Namun, secara umum, "Terjemahan" bekerja sangat baik dengan semua jenis teks yang dapat dipecah menjadi pesan-pesan dengan panjang mulai dari satu kata hingga satu paragraf panjang. Pesan yang lebih panjang akan lebih sulit diterjemahkan dan lebih sulit untuk ditangani.

Tiga kasus penggunaan utama yang didukung oleh pengaya Terjemahan adalah **penerjemahan isi**, **penerjemahan antarmuka setempat**, dan **penerjemahan perangkat lunak**. Ketiganya dibahas di bagian berikut, dengan tautan ke tutorial dan dokumentasi referensi atau bantuan topik mendalam jika tersedia. Dari ketiga kasus penggunaan tersebut, penerjemahan antarmuka adalah yang paling jarang digunakan.

### Terjemahan isi

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

Terjemahan ini sudah usang: bagian yang usang diganti dengan teks sumber baru dan penerjemah dapat mengakses pesan untuk memperbarui hanya dengan satu klik.

Sebagian besar wiki punya konten yang ingin mereka sediakan dalam berbagai bahasa. Baik itu hanya beberapa halaman atau ratusan halaman, itu tidak masalah. Untuk mencegah pemborosan waktu penerjemah, halaman sebaiknya ditandai untuk diterjemahkan hanya ketika sudah cukup stabil. Setiap perubahan yang dilakukan setelahnya dapat memengaruhi puluhan atau ratusan terjemahan lama, dan waktu yang dibutuhkan untuk memperbaruinya akan bertambah. Terutama dengan penerjemah sukarelawan, Anda harus menyadari aspek ini, dan menghargai waktu yang mereka habiskan untuk membuat terjemahan dan pembaruan, menghindari pekerjaan yang tidak perlu. Jika Anda menggunakan pengaya Terjemahan untuk menerjemahkan halaman, Anda sudah berada di jalur yang tepat untuk menggunakan waktu penerjemah yang tersedia dengan cara yang paling ampuh dan cekatan.

Cara pengaya Terjemahan membagi halaman menjadi satuan-satuan seukuran paragraf tidak memberikan terlalu banyak kebebasan bagi penerjemah untuk mengubah isi. Ini biasanya hal yang baik dan ideal jika kesinambungan dan konsistensi isi di berbagai bahasa diinginkan. Hal ini dapat diatasi, tetapi pada prinsipnya cara penerjemahan ini umumnya tidak cocok, misalnya, untuk artikel Wikipedia, yang biasanya sepenuhnya mandiri satu sama lain. Bahkan jika awalnya dimulai sebagai terjemahan dari bahasa lain, biasanya artikel tersebut mulai memiliki kehidupan mandirinya sendiri dari versi aslinya. Dengan _Terjemahan_, halaman asli selalu menjadi versi utama, dan isi baru tidak dapat dikembangkan dalam versi terjemahan.

Dengan mempertimbangkan keterbatasan ini, masih banyak kasus di mana fitur ini sangat cocok. Sebagian besar, jika tidak semua, dokumentasi pengguna termasuk dalam kategori ini, begitu pula isi seperti berita yang tidak berubah setelah ditulis. Jika Anda sudah memasang pengaya Terjemahan dan mengonfigurasi hak akses, coba buat halaman dan bungkus seluruh teks di dalam `<languages />...` dan ikuti tautannya, atau ikuti tutorial [Cara mempersiapkan halaman untuk diterjemahkan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Kelompok halaman dapat digabungkan lebih lanjut bersama dengan halaman [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups).

## = Terjemahan antarmuka setempat dalam wiki multibahasa

Salah satu hal yang hampir setiap wiki ubahsuaikan adalah [bilah siai](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Dimungkinkan untuk membuat kelompok pesan untuk pesan bilah sisi ubahsuaian dan juga untuk pengubahsuaian antarmuka setempat lainnya.

Salah satu perluasan yang menarik adalah halaman atau templat multibahasa yang dibangun dengan kata ajaib {{int:}}. Halaman utama [translatewiki.net](https://translatewiki.net/wiki/) dan beberapa templat Wikimedia Commons adalah contoh bagus untuk ini. Kata ajaib {{int:}} merupakan alternatif bagi fitur penerjemahan konten dan lebih cocok untuk menandai halaman-halaman berat seperti halaman utama translatewiki.net. Fitur bagus lainnya adalah bahasa halaman secara otomatis mengikuti bahasa antarmuka pengguna, jadi tidak diperlukan bilah bahasa, meskipun Anda mungkin ingin memiliki pemilih bahasa antarmuka sebagai gantinya.

Menyiapkan ini saat ini sedikit lebih rumit daripada penerjemahan isi dan memerlukan konfigurasi perangkat lunak, tetapi semuanya tercakup dalam tutorial [Cara membuat kelompok pesan antarmuka](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Terjemahan perangkat lunak

Pengaya Terjemahan sangat cocok untuk menerjemahkan pesan antarmuka perangkat lunak. Pada translatewiki.net, ini digunakan untuk menerjemahkan lusinan produk perangkat lunak dari permainan hingga aplikasi web. Pengaya Terjemahan mendukung pembacaan dan pembaruan terjemahan dari dan ke format umum yang digunakan dalam pengembangan web termasuk berkas [Properti Java](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/Gettext) dan [Yaml](https://en.wikipedia.org/wiki/YAML).

Pelacakan perubahan juga tersedia untuk berkas yang dilacak secara luar, karena secara dalam pengaya menggunakan versi turunan yang ditembolok dari berkas pelokalan tempat teks sumber dan terjemahannya disimpan, alih-alih menggunakannya langsung dalam format aslinya. Pengurus terjemahan dapat menggunakan antarmuka web atau antarmuka baris perintah untuk memeriksa takrif pesan baru dan terjemahan "fuzzy" (meminta pembaruan) ketika perlu diperbarui. Ini berfungsi terlepas dari format berkas atau sistem kendali versi yang mendasarinya (jika ada).

Dengan alat baris perintah sederhana, pengurus terjemahan dapat dengan mudah mengimpor, bahkan sekumpulan besar terjemahan yang sudah ada, dan hanya dengan satu perintah, mereka dapat mengekspor semua terjemahan dalam format dan struktur direktori yang tepat. Anda dapat mengekspor langsung ke repositori pengecekan [VCS](https://en.wikipedia.org/wiki/Version%20control%20system) Anda, tempat Anda dapat dengan mudah melakukan perubahan dan berkas baru.

## Bacaan dan tutorial lebih lanjut

### Untuk penerjemah dan pengurus penerjemahan

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Salindia dari lokakarya tentang cara menggunakan [Pengaya:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) di Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

Siaran video beebahasa Inggris dari salindia tersebut.

- [Cara menerjemahkan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Tutorial]
- [Praktik terbaik penerjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Statistik dan pelaporan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Jaminan mutu](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Status kelompok pesan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[Sedang berlangsung] [Pencarian](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Penerjemahan luring](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[Sedang berlangsung] [Daftar istilah](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Untuk pengurus penerjemahan

- [Cara menyiapkan halaman untuk terjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Tutorial]
- [Pengurusan penerjemahan halaman](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Kelompok pesan antarmuka (bilah siai terlokalkan, halaman utama, dan templat)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Tutorial]
- \[Sedang berlangsung] [Pengelolaan kelompok pesan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Format konfigurasi YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Cara menulis konfigurasi YAML untuk kelompok pesan berbasis berkas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Tutorial]

### Dokumen acuan untuk pengembang

- [Pemasangan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) dan [Konfigurasi](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - Dalam kebanyakan kasus, [Bundel Ekstensi Bahasa MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) seharusnya sudah cukup.

- [Memori terjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Panduan pengembang](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[Sedang berlangsung] [Terjemahan dijelaskan untuk pengembang](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Pengait](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[Sedang berlangsung] [Kelompok pesan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[Sedang berlangsung] [Dukungan format berkas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Alat bantu penerjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Tak tertulis] [APi tindakan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Butir yang dapat disisip](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Skrip baris perintah](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Alur proses dalam pekerjaan MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Menjelaskan pekerjaan apa saja yang terlibat ketika suatu halaman ditandai untuk diterjemahkan atau suatu bagian diterjemahkan
  - [Arsitektur memori terjemahan](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Terkait

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - Skrip pemaduan WikiEditor/CodeMirror untuk pengaya Terjemahan
- [Extension:TranslationNotifications#Special\_pages](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Tutorial pelokalan umum untuk pengembang, untuk digunakan di acara hackathon & pelatihan.
- [Pemilih Bahasa Universal](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Menyediakan fon web dan metode masukan
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – hal-hal yang perlu dipikirkan saat membuat halaman atau proses di wiki multibahasa
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Tambahkan diri Anda ke daftar penerjemah teknologi yang aktif saat ini.

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/id" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8072913"}
::
