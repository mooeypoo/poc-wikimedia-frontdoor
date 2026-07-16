---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/pt-br
sourceWiki: www.mediawiki.org
sourceRevision: "8016731"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Documentação para a extensão [Extensão:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Tradutores** (**[página de ajuda principal](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Como traduzir](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Melhores práticas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Estatísticas e relatórios](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Garantia de qualidade](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Estados de grupo de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Tradução _off-line_](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Glossário](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Administradores de tradução**

- [Como preparar uma página para tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Administração da tradução de páginas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Tradução de elementos não estruturados](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Gerenciamento de grupo](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Mover página traduzível](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Importar traduções via CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Trabalhando com pacotes de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Administradores e desenvolvedores**

- [Instalação](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Configuração](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Introdução ao desenvolvimento](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Guia do desenvolvedor](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Ampliação da extensão](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validadores](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Inseríveis](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Configuração do grupo](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Exemplo de configuração de grupo](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Memórias de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Auxílios à tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Ativação de pacotes de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [Ganchos PHP](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Traduzir esta predefinição](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

A principal página especial da extensão, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), em sua tarefa mais comum, “visualizar todas as mensagens não traduzidas”.

A [extensão Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) melhora o MediaWiki com recursos essenciais para o trabalho com traduções. Ela pode ser usada para traduzir as páginas de conteúdo, a interface da wiki e até mesmo outros produtos de _software_, como é utilizado na [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). A extensão Translate vem com uma interface de tradução fácil de usar e é capaz de separar a estrutura de conteúdo do conteúdo do texto que precisa ser traduzido, mostrando apenas o texto traduzível para os tradutores, dividindo o conteúdo em unidades manejáveis. Cada unidade está automaticamente sob controle de mudanças, assim os tradutores podem ver imediatamente o que precisa de atualização em uma página específica ou em toda a wiki.

A extensão Translate é usada para traduzir a interface de usuário do MediaWiki e outros projetos de _software_ na translatewiki.net por centenas de tradutores todos os meses. No [userbase.kde.org](http://userbase.kde.org), a extensão é usada para traduzir cerca de mil páginas de conteúdo de documentação de usuário. É fácil começar a usar a extensão Translate, e ao mesmo tempo expandir e fornecer recursos de relatórios avançados, revisões e fluxos de trabalho.

## Recursos

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

O editor de tradução: uma mensagem com uma dica (não visível na imagem) e sugestões de duas línguas auxiliares

**Interface:** A principal característica da extensão Translate é uma interface de tradução simples, mas funcional. Além das informações essenciais, como a definição de mensagens e documentação, você também pode ver as traduções em outras línguas. Se uma definição mudou, você vai ver as mudanças. A extensão vem com algumas verificações internas que podem ajudar em erros comuns, como parênteses faltando e variáveis não usadas. Dependendo da configuração, há também sugestões de memória de tradução e serviços de tradução automática como do Google Tradutor, Microsoft Bing Tradutor e Apertium.

A usabilidade da interface de tradução é reforçada por JavaScript e AJAX. O _backend_ fornece WebAPIs que podem ser usadas em interfaces móveis ou interfaces adaptadas para determinado tipo de conteúdo. Também é possível exportar mensagens para traduzir em ferramentas off-line e on-line que aceitem o formato de arquivo [Gettext po](https://en.wikipedia.org/wiki/Gettext).

**Grupos de mensagens e tarefas:** Muitas dos recursos são desenvolvidos a partir de dois conceitos básicos: grupos de mensagens e tarefas.

Um grupo de mensagem representa uma coleção de mensagens. Uma página de conteúdo seria um grupo de mensagens, onde, na forma mais simples, cada parágrafo seria uma mensagem nesse grupo. As mensagens usadas em cada extensão MediaWiki formam um grupo de mensagens na translatewiki.net — algumas das maiores extensões têm vários grupos. Você também pode fazer um grupo de grupos, como _Todas as notícias_ ou _Todas as mensagens da extensão Translate_. Muitas das estatísticas e tarefas funciona com base no grupo de mensagens.

As tarefas, ou as diferentes mensagens em um grupo de mensagens, facilitam diferentes casos. Normalmente o tradutor vê uma lista de mensagens não traduzidas no grupo de mensagens escolhido, mas há tarefas onde você pode revisar mensagens ou obter uma lista de todas as mensagens, traduzidas ou não.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Essa página especial mostra o estado de tradução de cada grupo de mensagem

**Relatórios e estatísticas:** A extensão tem diversas [funções de relatório](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting), desde uma visualização de mensagens não traduzidas em todos os grupos de mensagens em um idioma específico, até listas de tradutores por idioma, incluindo seu nível de atividade.

**Tradução de conteúdo:** Se você já tentou traduzir conteúdo no MediaWiki sem qualquer ferramenta, você sabe que essa não será escalada. As versões traduzidas ficam desatualizadas e não há uma maneira de rastrear as mudanças na página original, então há diversas traduções feitas pela metade ou desatualizadas sem uma visão do estado geral. Os tradutores são desmotivados quando não conseguem trabalhar com pequenos pedaços de texto. Eles também não acham trabalho para fazer ou que precise de atualização. Os usuários também ficam confusos com informações desatualizadas.

Isso tudo é resolvido com a extensão Translate e seu recurso de tradução de página. Ele adiciona um pouco de sobrecarga às páginas que precisam de tradução, mas os benefícios superam isso. Essencialmente, você só precisa marcar as partes da página que precisam de tradução. A extensão então divide tais partes em unidades de tamanho de parágrafo e cria um grupo de mensagens para elas. Depois disso, os tradutores podem usar todos os recursos descritos acima. Além disso, você pode facilmente adicionar uma barra de idioma com a marcação `<languages />` ou ter ligações que vão automaticamente para a versão do idioma preferido do usuário (apenas) quando existe, usando ligações no formato \[\[Special:MyLanguage/Pagename]].

Para mais informações, veja o tutorial [Como enviar uma página de conteúdo para tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) e a [documentação aprofundada da função de tradução de página](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Desenvolvedores:** A extensão tem suporte para muitos formatos de arquivos de tradução comum, como propriedades Java e arquivos Gettext po. Tem um extensivo conjunto de ferramentas, tanto na interface da wiki como na linha de comando, para importar e exportar traduções eficientemente.

**Pesquisa:** Sem um recurso de pesquisa, é difícil para os tradutores para encontrar mensagens específicas que desejam traduzir. Percorrendo todas as traduções ou cadeias de caracteres do projeto é ineficiente. Além disso, os tradutores muitas vezes querem verificar como um termo específico foi traduzido em uma determinada língua naquele projeto.

Isso é resolvido pela página especial [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Os tradutores podem encontrar as mensagens que contenham certos termos em qualquer idioma e filtrar por vários critérios: este é o padrão. Depois de pesquisar, eles podem mudar os resultados para as traduções das referidas mensagens, por exemplo, para encontrar as traduções existentes, em falta ou desatualizadas de um determinado termo.

## Casos de uso

Você pode traduzir quase tudo com a extensão Translate. Naturalmente, há ferramentas especializadas para a tradução de certos tipos de conteúdo, como legendas de vídeos, que são melhores feitas com essas ferramentas, mas, no geral, _Translate_ é muito boa para qualquer tipo de texto que possa ser dividido em mensagens do comprimento de uma palavra até um parágrafo extenso. Mensagens mais longas se tornam difíceis de traduzir e são simplesmente mais difíceis de se trabalhar.

Os três casos de uso básicos que a extensão Translate suporta são **tradução de conteúdo**, **tradução de interface local** e **tradução de _software_**_. Todas essas são explicadas nas seções seguintes, com ligações para tutoriais e documentação de referência ou tópicos aprofundados de ajuda, quando disponíveis. Dos três casos de uso, a tradução de interface tem sido a menos usada._

### Tradução de conteúdo

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

A tradução está desatualizada: partes antigas são substituídas por um novo texto-fonte e os tradutores podem alcançar as mensagens para atualizar com um único clique

A maioria das wikis têm conteúdo que gostariam de ser disponibilizado em vários idiomas. Seja apenas algumas ou centenas de páginas, não importa. Para evitar o desperdício de tempo do tradutor, as páginas devem ser marcadas para a tradução somente quando estão razoavelmente estáveis. Cada mudança feita depois pode afetar dezenas ou centenas de traduções antigas e o tempo necessário para atualizá-las se soma. Especialmente com tradutores voluntários, você deve estar ciente desse aspecto e respeitar o tempo que eles dedicam ao fazer traduções e atualizações, evitando trabalho desnecessário. Se você usar a extensão Translate para traduzir páginas, você já está indo no caminho certo para usar o tempo disponível do tradutor da forma mais eficaz e eficiente.

A forma como a extensão Translate divide a página em parágrafos não deixa muita liberdade para os tradutores alterarem o conteúdo. Isso geralmente é uma coisa boa e é ideal onde a continuidade e consistência de conteúdo entre idioma é desejável. Isso pode ser contornado, mas, em princípio, esta maneira de fazer as traduções não é geralmente adequada, por exemplo, para artigos de Wikipedia, que geralmente são totalmente independentes uns dos outros. Mesmo que inicialmente os artigos comecem a partir de um artigo de idioma diferente, eles geralmente passam a ter vida própria e independente da versão original. Com a Translate, a página original é sempre a versão principal e novos conteúdos não podem ser desenvolvidos nas versões traduzidas.

Com essas limitações em mente, há ainda muitos casos onde essa função é muito adequada. A maioria das, se não todas as, documentações de usuário entram nessa categoria assim como o conteúdo de notícia que não se modifica depois de escrito. Se você já tem a extensão Translate instalada e as permissões de acesso configuradas, tente criar uma página e envolver o texto inteiro dentro de `<languages />...` e seguir as ligações, ou o tutorial [Como preparar uma página para tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Grupos de páginas podem ser ainda mais agregados juntos com a página [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups).

### Tradução da interface local em wikis multilingue

Uma coisa que quase todas as wikis têm personalizado é a [barra lateral](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). É possível criar um grupo de mensagens para as mensagens personalizadas da barra lateral e também para outras personalizações da interface local.

Uma expansão interessante são as páginas/predefinições multilíngues construídas com a palavra mágica {{int:}}. A página principal do [translatewiki.net](https://translatewiki.net/wiki/) e alguns modelos do Wikimedia Commons são bons exemplos disso. A palavra mágica {{int:}} é uma alternativa ao recurso de tradução de conteúdo e é mais adequada para marcar páginas pesadas, como a página principal de translatewiki.net. Outro recurso interessante é que o idioma da página segue automaticamente o idioma da interface do usuário, portanto, não há necessidade de uma barra de idiomas, embora você possa querer ter um seletor de idioma da interface.

Configurar isso atualmente é um pouco mais complicado do que a tradução de conteúdo e necessita de configuração do _software_, mas tudo isso é coberto no tutorial [Como criar uma interface de grupo de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Tradução de _software_

A extensão Translate é uma boa opção para traduzir as mensagens de interface de um _software_. Na translatewiki.net, é usada para traduzir dezenas de produtos de _software_, desde jogos até aplicativos da _web_. A extensão Translate é compatível com a leitura e atualização de traduções de e para formatos comuns usados no desenvolvimento _web_, incluindo e arquivos e .

O controle de mudanças também está disponível para arquivos controlados externamente, porque internamente a extensão usa uma versão derivada em _cache_ dos arquivos de tradução onde o texto de origem e suas traduções são armazenadas, em vez de usá-las diretamente no seu formato original. Administradores de traduções podem usar a interface _web_ ou uma interface de linha de comando para verificar novas definições de mensagens e traduções “fuzzy” quando precisam de atualização. Isso funciona independentemente do formato de arquivo subjacente ou sistema de controle de versão (se houver).

Com ferramentas simples de linha de comando, os administradores de traduções podem facilmente importar um conjunto grande de traduções existentes e com apenas um comando exportá-las no formato e estrutura de diretório corretos. Você pode exportar diretamente para o seu repositório de verificação do [sistema de controle de versão](https://en.wikipedia.org/wiki/pt:Sistema%20de%20controle%20de%20versão), onde pode confirmar mudanças e novos arquivos.

## Leitura adicional e tutoriais

### Para tradutores e administradores de traduções

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Slides de uma oficina sobre como usar a [Extensão:Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) no Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

Um videocast em inglês dos slides.

- [Como traduzir](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Tutorial]
- [Boas práticas de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Estatísticas e relatórios](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Garantia de qualidade](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Estados de grupo de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[Em andamento] [Pesquisar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Tradução _off-line_](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[Em andamento] [Glossário](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Para administradores de tradução

- [Como preparar uma página para tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Tutorial]
- [Administração da tradução de páginas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Grupos de mensagens de interface (barra lateral, página principal e predefinições traduzidas)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Tutorial]
- \[Em andamento] [Gerenciamento de grupo de mensagens](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Formato de configuração YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Como escrever configuração YAML para grupos de mensagens baseados em arquivos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Tutorial]

### Documentação de referência para desenvolvedores

- [Instalação](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) e [Configuração](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - O [Pacote da Extensão de Línguas da MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) deve ser suficiente na maioria dos casos.

- [Memórias de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Guia do desenvolvedor](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[Em andamento] [Tradução explicada para desenvolvedores](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Ganchos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[Em andamento] [Grupos de mensagem](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[Em andamento] [Compatibilidade com formatos de arquivo](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Auxílios à tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[Não escrito] [API de ação](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Inseríveis](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - ["Scripts" da linha de comandos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Fluxo de processo em tarefas do MediaWiki](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Descreve quais tarefas estão envolvidas quando uma página é marcada para tradução ou quando uma seção é traduzida
  - [Arquitetura de memória de tradução](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Relacionados

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - Script de integração do WikiEditor/CodeMirror para a extensão Translate
- [Extensão:TranslationNotifications](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Tutorial de tradução geral para desenvolvedores, para uso em _hackathons_ e treinamentos
- [Seletor de Idiomas Universal](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Fornece fontes da _web_ e métodos de entrada
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – coisas em que pensar ao criar páginas ou processos em wikis multilíngues
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Adicione-se à lista de tradutores de tecnologia atualmente ativos

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/pt-br" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016731"}
::
