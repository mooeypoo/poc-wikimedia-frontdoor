---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/ja
sourceWiki: www.mediawiki.org
sourceRevision: "8186843"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

[Extension:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) の説明文書

**翻訳者** (**[メインヘルプページ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [翻訳方法](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [最善慣行](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [統計と報告](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [品質の保証](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [メッセージ群の状態](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [オフライン翻訳](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [用語集](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**翻訳管理者**

- [翻訳するページの準備方法](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [ページ翻訳の管理](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [構造化されていない要素の翻訳](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [メッセージ群の管理](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [翻訳対象ページの移動](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [翻訳をCSV経由でインポート](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [メッセージ群を処理](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**システム管理者と開発者**

- [インストール](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [設定の構成](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [開発を始める](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [開発者向けガイド](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [翻訳の拡張](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [検証ソフト](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [挿入要素](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [メッセージ群の設定](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [メッセージ群の設定の例](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [翻訳メモリ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [翻訳補助](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [メッセージ群を有効化](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [PHP フック](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[このテンプレートを翻訳](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

この拡張機能のメインページ [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate) で、最も使用されるタスク「未翻訳メッセージをすべて表示」させた状態

[Translate 拡張機能](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)は、翻訳作業を行うのに必要不可欠な機能で MediaWiki を強化します。 コンテンツ ページやウィキのインターフェイスの翻訳に使用でき、さらに [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki) で使用されているように、その他のソフトウェア製品の翻訳にも使用できます。 Translate 拡張機能は、使いやすい翻訳インターフェイスを備えています。また、コンテンツを扱いやすい単位に分割して、翻訳者に翻訳できるテキストのみを表示することで、翻訳が必要なテキスト コンテンツからコンテンツ構造を分離できます。 それぞれの単位の変更内容は自動的に追跡されるため、特定のページについて、あるいはウィキ全体について、翻訳者が何を更新する必要があるかを瞬時に把握できます。

Translate 拡張機能は、translatewiki.net で、MediaWiki やその他のプロジェクトのユーザー インターフェイスを翻訳するために使用されています。 translatewiki.net では毎月、何百人もの人たちが翻訳をしています。[userbase.kde.org](http://userbase.kde.org) では、何千もの説明文書ページ本文を翻訳するために使用されています。 Translate 拡張機能は簡単に使用できますが、大規模なプロジェクトにも適用でき、高度な報告、査読、ワークフローの各機能も提供します。

## 特徴

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

翻訳エディター: ヒント (画像では表示されていません) と 2 つの補助言語からの提案があるメッセージ

**インターフェース:** Translate 拡張機能の中心的な機能は、シンプルながらも機能的な翻訳インターフェースです。 メッセージの定義や付随資料のような必要不可欠な情報とともに、他の言語での翻訳を見ることができます。 もし定義が変更されれば、その変更が表示されるでしょう。 組み込みで検査を備え、括弧の不均衡や変数の未使用といったよくあるミスの防止を支援します。 設定により、Google 翻訳、Microsoft の Bing 翻訳、Apertium といった翻訳メモリや機械翻訳サービスからの提案を受けることもできます。

翻訳インターフェースの使い勝手は JavaScript と Ajax によって強化されています。 バックエンドは、モバイル用あるいは特定の種類のコンテンツ用に特化したインターフェースで使用できる WebAPI を提供します。 また翻訳対象のメッセージは、[Gettext po](https://ja.wikipedia.org/wiki/gettext) ファイル形式に対応する他のオフライン及びオンラインのツールへ出力することも可能です。

**メッセージ群とタスク:** 機能の大部分は、メッセージ群とタスクという2つの基本的な概念に基づいています。

メッセージ群はメッセージの集合を表します。ひとつのコンテンツページは、おそらくひとつのメッセージ群になるでしょう。その群において、最も単純な構造の場合、各段落はひとつのメッセージになるでしょう。各 MediaWiki 拡張機能で使われるメッセージは translatewiki.net 上でのメッセージ群を形成します。少数の巨大な拡張機能は複数の群を有しています。「すべてのニュースレター」や「Translate 拡張機能のすべてのメッセージ」のような、群の群を作成することもできます。統計やタスクの大部分はメッセージ群ベースで行われます。

タスク、言い換えればメッセージ群内のメッセージの一覧が異なると、それぞれ異なる使い方ができます。通常、翻訳者は選択したメッセージ群内のすべての未翻訳メッセージを列挙するタスクを使用しますが、メッセージを査読できるタスクもあれば、翻訳・未翻訳にかかわらずすべてのメッセージを列挙するタスクもあります。

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

この特別ページは、各メッセージ群の翻訳の状態を列挙します。

**レポートと統計：**&#x3053;の拡張機能には多彩な[レポート機能](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)があり、特定の言語のすべてのメッセージ群から未訳のものを表示することから、言語単位で翻訳者と各人の活動レベルをまとめることまでこなします。

**コンテンツ翻訳：** MediaWiki でツールを使わずに翻訳しようとすると要領が悪いものです。 翻訳したバージョンが古くなってもツールがないとマスター版へさかのぼって変化をたどることは不可能で、そのせいで全体像が見渡せず、そのせいで途中で止まったままだったり現状に適さない翻訳がたくさんあるのです。 これなら翻訳しやすいと思った原文なのにうまく訳せないと、翻訳者はやる気を失いがちです。 あるいは未翻訳のメッセージを探したり、更新が必要な訳文を探すのもツールがなければ難しいのです。 利用者の場合、現状に合わない翻訳に混乱させられます。

翻訳拡張機能及びそのページ翻訳機能を使うとこういう問題は解決します。プログラムとしては翻訳対象ページの作業に直接は関係ない処理（オーバーヘッド）が少し発生するものの、利点はそれを大きく上回ります。基本として、操作はページ上の翻訳必要な部分をマークするだけです。拡張機能はその箇所を単文単位に切り分け、メッセージ群を付けます。その後、翻訳者は上記の機能をすべて使うことができます。さらに、言語バーの表示には `<languages />` タグを書くだけでよく、また \[\[Special:MyLanguage/Pagename]] 形式のリンクを使用するだけで、利用者が個人設定で設定している言語版のページが存在する場合 (のみ)、その言語のページに自動的に遷移します。

詳しくは[翻訳ページの立ち上げ方](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)や[ページ翻訳機能の詳細な説明文書](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)を参照のこと。

**開発者:** この拡張機能は、よく使用される多くの翻訳ファイル形式への対応機能を内蔵しています。Java プロパティ形式や Gettext po ファイルなどです。翻訳を効率的に取り込み/書き出しするための、ウィキ内とコマンド ラインの両方で使用できるツール群も含んでいます。

**検索:** もし検索機能がなかったら、翻訳しようとする特定のメッセージを探し出すのに翻訳者はたいへん苦労します。すべての翻訳文やプロジェクトの文字列を横断して探すのも能率的ではありません。また翻訳者は特定の用語がどう訳されているか、プロジェクト全体を見回そうとすることがよくあります。

これは特別ページ[Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations)で解決済みで、既定の機能になりました。どの使用言語でも特定の用語を含むメッセージの検索と、分野別の絞りこみができる機能です。特定のメッセージの検索結果から、それに対応する翻訳作業に切り替えることができ、具体的には特定の用語にすでに対訳があるか、未訳か、更新が必要かなどがわかります。

## 使用事例

Translate 拡張機能を使用すれば、ほとんどすべてのものを翻訳できます。もちろん映画の字幕のような特定の種類のコンテンツの翻訳に特化したツールはありますが（そのような翻訳は、それらのツールを使うことでよりうまく行えます）、「_Translate_」は一般的に言って文章の種類に関わらず、さまざまな長さのメッセージに分割できるものであればとてもよく機能します。メッセージの長さは単語ひとつでも大きな1段落でも構いません。メッセージが長くなるにつれ翻訳しにくくなり、作業は実に難しくなります。

Translate 拡張機能が支援する3件の基本的な使用事例とは、**コンテンツ翻訳**と**ローカルのインタフェース翻訳**、**ソフトウェア翻訳**です。下記の節でそれぞれを説明して、チュートリアルや関連文書あるいはまた提供できるときにはトピックを掘り下げたヘルプにリンクします。使用事例3件のうち、最も使用頻度が低いのはインタフェース翻訳です。

### コンテンツの翻訳

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

翻訳が古くなった場合。古くなった部分は翻訳原語の新しいテキストに置換される。翻訳者は要修正のメッセージのページに 1 クリックで到達できる。

ほとんどのウィキに多言語で提供したいコンテンツがあります。数ページでも数百ページでもよいのです。翻訳者の時間を無駄にしないように、ページが十分に安定版になってから翻訳指定するべきです。後から修正するとそれまでの数十、数百の翻訳に影響してしまい、修正にも時間がかかります。この点はボランティアで翻訳や修正に時間を使う人たちのことを念頭に置き、不要な手間をかけさせないでください。ページ翻訳に Translate 拡張機能を使う時点で、既に翻訳者の時間を最も効果的で効率よく使わせてもらう状態に、もうすぐ手の届くところまで来ているのですから。

翻訳拡張機能によって1ページ分の文章をほぼ文単位に切り分けられると、翻訳者が原文の内容を自由に変更できる余地はほとんどありません。これは平均的には良い傾向であり、複数の言語版で内容の継続性と統一が求められる場合は理想的とも言えます。ただし、例えばウィキペディアの記事などは通常は言語版に依存関係がないため、原則から外れた使い方はあるものの、原則としてこの翻訳手法には適さないのです。もちろん他の言語版の翻訳から記事が生まれることはあり、成長につれ、やがて翻訳元の記事から離れた独自の生命を得ていきます。その点、_翻訳拡張機能_ においては翻訳元の記事が常にメインバージョンであって、翻訳版で独自のコンテンツを作ったり展開することはできません。

前述のような制約はあるものの、この機能が最適な事例は少なくありません。利用者向けの説明文書は全てと言ずとも大部分がこの範囲に当てはまり、また公開後に書き直しがほぼない速報性のあるコンテンツも該当します。翻訳拡張機能をインストール済みでアクセス権限が確定した皆さんは、ぜひ1ページ作成してみましょう。テキスト部分全文を`<languages />...`で挟んでリンクを開くか、あらかじめ[翻訳するページの準備方法](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)を参照してはいかがでしょうか。

[Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups)を使うと複数ページのまとまりをさらに集約できます。

### 多言語ウィキでのローカルインターフェイスの翻訳

ほぼすべてのウィキで固有の設定にしてあるものといえば、[サイドバー](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar)です。特化したサイドバーを含む、ローカル仕様にしたインターフェースに対応するメッセージ集を作成することができます。

ひとつ興味をひかれるとすれば、{{int:}} マジック ワードを使って多言語設定にしてあるページ群です。 [translatewiki.net](https://translatewiki.net/wiki/) メイン ページやウィキメディア・コモンズの中にもサンプルに適したページがあります。 {{int:}} というマジック ワードは一見するとコンテンツ翻訳機能の代替に見えますが、translatewiki.net のメイン ページなどマークアップが非常に多い場合には、こちらのほうが適しています。 また自動で UI 言語に従ってページを表示する点も便利であり、言語バーが不要な代わりにインターフェイス言語のセレクターがほしいと感じるかもしれません。

これを設定するにはソフトウェアの設定が必要なため、現時点ではコンテンツ翻訳機能よりも少し複雑ですが、[インターフェイスのメッセージ群を作成する方法](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)というチュートリアルですべて説明しています。

### ソフトウェアの翻訳

ソフトウェアのシステムメッセージを訳すのに、翻訳拡張機能は適しています。 実際に translatewiki.net ではゲームからウェブアプリまで、何十件ものソフトウェア製品の翻訳に使われています。 またウェブ開発で一般的な書式との互換性として[Java properties](https://en.wikipedia.org/wiki/.properties)と[Gettext](https://ja.wikipedia.org/wiki/Gettext)及び[YAML](https://ja.wikipedia.org/wiki/YAML)他のファイルに対応、閲覧と翻訳の更新ができます。

また拡張機能は基本的に原文とその翻訳を本来の書式で使用せず、内部的に原文と訳文を保存した地域化ファイルの二次キャッシュを利用しているため、外部にトラックするファイルのリンク変更も可能です。翻訳管理者はメッセージの新しい対訳の監視あるいは翻訳の「ファジー指定」（要更新の指定）に使うインターフェイスをウェブ版でもコマンドラインからでも選べます。ファイル形式やバージョン管理システムの壁（があるとすれば）に関わらず、有効です。

コマンドラインの簡略なツールを使うと、翻訳管理者が既存の訳文を大きくまとめて読み込むのも楽で、また訳文をすべて正しい書式で正しいディレクトリ構造に書き出すこともコマンド1つで実行できます。使用している[en:Version control system](https://en.wikipedia.org/wiki/Version%20control%20system)（[バージョン管理システム](https://ja.wikipedia.org/wiki/バージョン管理システム)）のリポジトリに書き出すと直接チェックアウトでき、修正や新規ファイルのコミットが簡単です。

## 詳細な文書や個別の質問

### 翻訳者と翻訳管理者向け

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

[Extension:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) の使用法を教えるワークショップ (ウィキマニア 2017 の記録より)

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

本スライドに関するビデオキャスト（英語）

- [翻訳方法](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[チュートリアル]
- [翻訳の最善手法](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [統計と報告](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [品質保証](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [メッセージ群の状態](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[進行中] [検索](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [オフライン翻訳](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[進行中] [用語集](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### 翻訳管理者向け

- [翻訳するページの準備方法](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[チュートリアル]
- [ページ翻訳の管理](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [インターフェイスのメッセージ群 (地域化されたサイドバー、メインページ、テンプレート)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[チュートリアル]
- \[進行中] [メッセージ群の保守](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [YAML 設定形式](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [ファイル ベースのメッセージ群用に YAML 設定を書く方法](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[チュートリアル]

### 開発者向けの参考文献

- [インストール](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) および [設定の構成](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - 多くの場合、[MediaWiki 言語拡張機能バンドル](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) で充分のはずです。

- [翻訳メモリ](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [開発者向けガイド](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[進行中] [開発者向けの翻訳の説明](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [フック](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[進行中] [メッセージ群](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[進行中] [ファイル形式対応](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [翻訳支援](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[未執筆] [操作 API](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [挿入要素](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [コマンドラインスクリプト](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [MediaWikiの機能のプロセスフロー](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - ページに翻訳マークが付けられたり、節が翻訳されたりした際に、どのような機能が関与しているかを説明します。
  - [翻訳メモリーの構成](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### 関連項目

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - Translate拡張機能用のWikiEditor/CodeMirror統合スクリプト
- [Extension:TranslationNotifications/翻訳通知](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – 開発者向けの地域化全般のチュートリアル、ハッカソンやトレーニングで使用
- [ユニバーサル言語選択](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Web フォントや入力メソッドを追加します
- [m:翻訳可能性](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – 多言語版ウィキでぺージやプロセスを作成するときの留意点
- [m:Tech/翻訳者/一覧](https://meta.wikimedia.org/wiki/Tech/Translators/List) – 現在、活動中の翻訳者一覧にご自分の名前を追加しませんか

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/ja" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8186843"}
::
