---
title: Translate extension (from mediawiki.org)
sourceUrl: https://www.mediawiki.org/wiki/Help:Extension:Translate/es
sourceWiki: www.mediawiki.org
sourceRevision: "8016702"
license: CC BY-SA 4.0
remoteImport: true
sourceId: demo-wiki-translated
---

Documentación de [Extensión:Traducir](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate)

**Traductores** (**[Página principal de ayuda](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate)**)

- [Cómo traducir](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example)
- [Mejores prácticas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Estadísticas e informes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Control de calidad](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Estados de grupos de mensajes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- [Traducción sin conexión](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- [Glosario](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

**Administradores de traducción**

- [Cómo preparar una página para traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example)
- [Administración de traducción de páginas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Traducción de elementos no estructurados](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation)
- [Administración de grupos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Trasladar página traducible](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Move_translatable_page)
- [Importar traducciones mediante CSV](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Import_Translations_via_CSV)
- [Trabajar con paquetes de mensajes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles)

**Administradores de sistemas y desarrolladores**

- [Instalación](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation)
- [Configuración](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration)
- [Primeros pasos en el desarrollo](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Getting_started_with_development)
- [Guía del desarrollador](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)
- [Extender Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)
- [Validadores](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Validators)
- [Insertables](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
- [Configuración avanzada](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Ejemplo de configuración de grupo](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example)
- [Memorias de traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)
- [Asistentes de traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
- [Habilitar paquetes de mensajes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_Bundles#Enabling_message_bundle_integration)
- [Ganchos de PHP](https://doc.wikimedia.org/Translate/master/php/classMediaWiki_1_1Extension_1_1Translate_1_1HookRunner.html)

[Traducir esta plantilla](https://www.mediawiki.org/w/index.php?title=Special:Translate\&group=page-Template%3AExtension-Translate\&language=\&action=page\&filter=)

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Translate_manual_-_Translate_example_-_04._Untranslated.png/330px-Translate_manual_-_Translate_example_-_04._Untranslated.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_04._Untranslated.png)

La página especial principal de la extensión, [Special:Translate](https://www.mediawiki.org/wiki/Special:Translate), en su tarea más común, "ver todos los mensajes sin traducir"

La [extensión Translate](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) mejora MediaWiki con características esenciales para la traducción. Se puede usar para traducir páginas de contenido, la interfaz del wiki e incluso otros productos de software, como se usa en [translatewiki.net](https://www.mediawiki.org/wiki/Special:MyLanguage/translatewiki). La extensión Translate viene con una interfaz de traducción fácil de usar y permite separar la estructura del contenido del contenido de texto que se va a traducir, mostrando solo el texto que los traductores pueden traducir separando el contenido en unidades independientes. En cada unidad se comprueba automáticamente los cambios y los traductores ven inmediatamente lo que necesite actualización en una página específica o en el wiki.

La extensión _Translate_ se usa para traducir la interfaz de usuario de MediaWiki y otros proyectos de software en translatewiki.net por centenares de traductores cada mes. En [userbase.kde.org](http://userbase.kde.org) se usa para traducir casi un millar de páginas de contenido con documentación de usuario. Es fácil empezar a usar la extensión Translate, pero al mismo tiempo puede escalar y proporcionar características de reporte avanzado, revisión y flujo de trabajo.

## Características

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Translate_manual_-_Translate_example_-_07._Editor_assistant.png/330px-Translate_manual_-_Translate_example_-_07._Editor_assistant.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_07._Editor_assistant.png)

El editor de traducción: un mensaje con una pista (no visible en la imagen) y sugerencias de dos asistentes de traducción

**Interfaz:** La principal característica de la extensión Translate es una interfaz de traducción simple y a la vez funcional. Además de información esencial como la definición y documentación del mensaje, puedes ver traducciones en otros idiomas. Si una definición ha cambiado, podrás ver los cambios. La extensión viene con algunas comprobaciones incluidas, que pueden ayudar a detectar algunos errores comunes, como paréntesis sin pareja y variables sin uso. Dependiendo de la configuración, pueden haber también sugerencias de la memoria de traducción y de servicios de traducción automáticos como los del Traductor de Google, Bing Translator de Microsoft y Apertium.

La usabilidad de la interfaz de traducción se ha mejorado con JavaScript y AJAX. El sistema proporciona WebAPIs que pueden usarse en interfaces móviles o interfaces adaptadas a un contenido específico. También es posible exportar mensajes para la traducción en otras herramientas con y sin conexión que acepten el formato [Gettext po](https://es.wikipedia.org/wiki/Gettext).

**Grupos de mensajes y tareas:** Muchas de las características se han construido en torno a dos conceptos básicos: grupos de mensajes y tareas.

Un grupo de mensajes representa una colección de mensajes. Una página de contenido sería un grupo de mensajes, donde, en su forma más básica, cada párrafo será un mensaje del grupo. Los mensajes usados en cada extensión de MediaWiki forman un grupo de mensajes en translatewiki.net (algunas de las extensiones más grandes tienen múltiples grupos). Puedes crear grupos de grupos, como por ejemplo _Todos los boletínes de noticias_ o _Todos los mensajes de la extensión Translate_. Muchas de las estadísticas y las tareas trabajan en base a grupos de mensajes.

Las tareas o, en otras palabras, diferentes listados de mensajes de un grupo de mensajes, facilitan diferentes formas de trabajo. Normalmente, un traductor usará la lista de todos los mensajes pendientes de traducir en un grupo de mensajes, pero hay otras tareas donde puedes revisar mensajes o solo obtener la lista de todos los mensajes, hayan sido traducidos o no.

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Translate_manual_-_Translate_example_-_01._LanguageStats_long.png/330px-Translate_manual_-_Translate_example_-_01._LanguageStats_long.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_01._LanguageStats_long.png)

Esta página especial reporta el estado de la traducción de cada grupo de mensajes.

**Reportes y estadísticas:** La extensión tiene amplias [características de reporte](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting) que van desde una vista con los mensajes pendientes de traducir entre todos los grupos de mensajes de un idioma concreto hasta listas de traductores por idioma con su nivel de actividad.

**Traducción de contenido:**

```
Si alguna vez has intentado traducir contenido en MediaWiki sin usar ninguna herramienta, sabrás que no ofrece escalabilidad.
```

Las versiones traducidas quedan obsoletas y no hay forma de seguir los cambios de la página principal, por lo que quedan muchas traducciones a medias u obsoletas sin una clara visión del estado de la traducción del conjunto. Los traductores a menudo se desaniman cuando no pueden trabajar con pequeñas piezas de texto manejables. Los traductores no encuentran en qué trabajar o qué necesita actualizarse. Los usuarios también quedan confundidos por información obsoleta.

Esto se soluciona con la extensión Translate y sus características de traducción de páginas. Añade un poco de complejidad a las páginas que necesitan traducción, pero los beneficios que se obtienen compensan de sobra. Esencialmente, solo se necesita marcar las partes de la página que necesitan traducción. La extensión divide estas partes en unidades delimitadas en párrafos y crea grupos de mensajes para estos. Una vez hecho esto, los traductores pueden usar todas las características descritas anteriormente. Además, se puede agregar fácilmente una barra de idioma con la etiqueta `<languages />`, o hacer que los enlaces automáticamente apunten a la versión traducida en el idioma de preferencia del usuario (solo) cuando esta traducción exista, usando enlaces de la forma \[\[Special:MyLanguage/Pagename]].

Para más información, mira el tutorial [Cómo preparar una página de contenido para la traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) y la [documentación a fondo de las características de traducción de páginas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration).

**Desarrolladores:** La extensión viene con soporte incorporado para muchos formatos comunes de archivos de traducción, como propiedades Java y archivos Gettext po. Tiene un extenso conjunto de herramientas, tanto wiki como en línea de comandos, para importar y exportar eficientemente las traducciones.

**Búsquedas:** sin una funcionalidad de búsqueda, a los traductores se les dificulta encontrar mensajes específicos que quieran traducir. Es ineficiente recorrer todas las traducciones o cadenas de un proyecto. Además, a veces los traductores quieren verificar cómo se tradujo un término particular en cierto idioma en todo el proyecto.

Esta se soluciona con la página especial [Special:SearchTranslations](https://www.mediawiki.org/wiki/Special:SearchTranslations). Los traductores pueden encontrar los mensajes que contengan ciertos términos en cualquier idioma y filtrar por varios criterios: esto está predeterminado. Luego de buscar, theypueden intercambiar los resultados a las traducciones de aquellos mensajes; por ejemplo, para encontrar las traducciones existentes, faltantes o desactualizadas de cierto término.

## Casos de uso

Puedes traducir prácticamente cualquier cosa con la extensión Translate. Naturalmente, hay herramientas especializadas para traducir determinados textos como subtítulos de vídeos, que se pueden hacer mejor con otras herramientas, pero por lo general _Translate_ funciona muy bien con cualquier tipo de texto que puede dividirse en mensajes con longitudes que van desde una palabra hasta un párrafo largo. Los mensajes más largos se convierten en engorrosos a la hora de traducir y es más difícil trabajar con ellos.

Los tres principales casos de uso que soporta la extensión Translate son **traducción de contenido**, **traducción de interfaz local** y **traducción de software**. Todos están cubiertos en las siguientes secciones, con enlaces a tutoriales y documentación de referencia o extensiva ayuda sobre el tema cuando esté disponible. De los tres casos de uso, la traducción de interfaz es la menos utilizada.

### Traducción de contenido

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Translate_manual_-_Translate_example_-_10._Outdated_clicking.png/330px-Translate_manual_-_Translate_example_-_10._Outdated_clicking.png?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:Translate_manual_-_Translate_example_-_10._Outdated_clicking.png)

La traducción está obsoleta: Las partes obsoletas se reemplazan con nuevo texto fuente y los traductores pueden acceder a los mensajes a actualizar en un solo clic.

Muchos wikis tienen contenido que les gustaría que estuviese disponible en varios idiomas. No importa que sean unas pocas o cientos de páginas. Para evitar hacer perder el tiempo a los traductores, las páginas deberían marcarse para traducción solo cuando sean razonablemente estables. Cada cambio que se haga a partir de entonces puede afectar decenas o centenares de traducciones antiguas, y el tiempo necesario para actualizarlas se suma. Especialmente con traducciones voluntarias, debe ser consciente de ello y respetar el tiempo que se gasta en realizar traducciones y actualizaciones, evitando el trabajo innecesario. Si usas la extensión Translate para traducir páginas, ya vas bien encaminado para usar el tiempo disponible de los traductores de la forma más eficaz y eficiente.

La forma en la que la extensión Translate divide una página en unidades del tamaño de párrafos no deja mucha libertad a los traductores para cambiar su contenido. Esto suele ser bueno y es ideal donde se busca la continuidad y consistencia del contenido entre idiomas. Aunque se puede solucionar, en principio esta forma de realizar las traducciones no es adecuado por ejemplo en artículos de Wikipedia, que suelen ser totalmente independientes. Incluso si originalmente empiezan siendo una traducción de otro idioma, suelen seguir su camino independiente de la versión original. Con _Translate_, la página original siempre es la versión principal, y no se puede añadir nuevo contenido en las versiones traducidas.

Teniendo en cuenta estas limitaciones, aun hay multitud de situaciones donde esta característica es idónea. La mayor parte de la documentación de usuario (si no toda) entra en esta categoría, igual que contenido con formato similar a noticias que no cambia una vez escrito. Si ya has instalado la extensión Translate y has configurado los permisos de acceso, prueba crear una página y colocar todo el contenido dentro de `<languages />...`, y sigue los enlaces, o el tutorial [Cómo preparar una página para su traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example).

Groups of pages can be further aggregated together with the [Special:AggregateGroups](https://www.mediawiki.org/wiki/Special:AggregateGroups) page.

### Traducción de interfaz local en wikis multilingües

Algo que casi Toda wiki ha personalizado es la [barra lateral](https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Interface/Sidebar). Es posible crear un grupo de mensajes para la barra lateral personalizada y también para otras interfaces personalizadas locales.

Una expansión interesante son las páginas o plantillas multilingües construidas con la palabra mágica {{int:}}. La página principal de [translatewiki.net](https://translatewiki.net/wiki/) y algunas plantillas de Wikimedia Commons son buenos ejemplos de ello. La palabra mágica {{int:}} es una alternativa a la característica de traducción de contenido y es más adecuada para dar formato a páginas grandes como la página principal de translatewiki.net. Otra gran característica es que el idioma de la página coincide automáticamente con el del idioma de la interfaz de usuario, por lo que no es necesario una barra de idioma, aunque puede que quieras tener en su lugar un selector del idioma de la interfaz en su lugar.

Realizar esto es por ahora algo más complicado que realizar una traducción de contenido, y necesita configuración de software, pero todo está explicado en el tutorial [Cómo crear un grupo de mensajes de la interfaz](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation).

### Traducción de software

La extensión Translate encaja muy bien para traducir mensajes de interfaz de software. En translatewiki.net se usa para traducir decenas de productos de software, desde juegos hasta aplicaciones web. La extensión _Translate_ soporta la lectura y actualización de traducciones desde y hacia formatos usados comúnmente en el desarrollo web, incluyendo [propiedades Java](https://en.wikipedia.org/wiki/.properties), [Gettext](https://en.wikipedia.org/wiki/es:Gettext) y archivos [Yaml](https://en.wikipedia.org/wiki/es:YAML).

El control de cambios también está disponible para archivos que se mantienen externamente, porque internamente la extensión usa una versión almacenada en caché derivada de la versión de los archivos de localización donde el texto fuente del código y sus traducciones están guardadas, en vez de usarlas directamente en su formato original. Los administradores de traducción pueden usar tanto la interfaz web como una interfaz de línea de comandos para comprobar nuevas definiciones de mensajes, y traducciones "fuzzy" (petición de actualización) cuando necesiten ser actualizadas. Esto funciona independientemente del formato subyacente del archivo o del sistema de control de versiones (en caso de que exista).

Con herramientas simples de línea de comandos, los administradores de traducción pueden importar fácilmente incluso un gran conjunto de traducciones existentes y con un solo comando pueden exportar todas las traducciones en el formato correcto y en la estructura de directorios correcta. Puedes incluso exportar directamente a su [sistema de control de versiones](https://en.wikipedia.org/wiki/es:Control%20de%20versiones), donde puedes subir fácilmente cambios y nuevos archivos.

## Lectura adicional y tutoriales

### Para traductores y administradores de traducción

[![](https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf/page1-250px-How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser\&utm_content=thumbnail)](https://www.mediawiki.org/wiki/File:How_to_use_ExtensionTranslate_-_Wikimania_2017.pdf)

Diapositivas de un taller sobre cómo utilizar [Extensión:Traducir](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Translate) en Wikimania17.

[![](//upload.wikimedia.org/wikipedia/commons/thumb/0/04/How_to_use_the_translate_extension.webm/250px--How_to_use_the_translate_extension.webm.jpg?utm_source=www.mediawiki.org\&utm_campaign=parser)](//upload.wikimedia.org/wikipedia/commons/0/04/How_to_use_the_translate_extension.webm?utm_source=www.mediawiki.org\&utm_campaign=job\&utm_content=original)

Un _videocast_ en inglés de las diapositivas.

- [Cómo traducir](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_example) \[Tutorial]
- [Mejores prácticas de traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_best_practices)
- [Estadísticas y reportes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Statistics_and_reporting)
- [Control de calidad](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Quality_assurance)
- [Estados de grupos de mensajes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_group_states)
- \[En curso] [Buscar](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Search)
- [Traducción sin conexión](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Off-line_translation)
- \[En curso] [Glosario](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Glossary)

### Para los administradores de traducción

- [Cómo preparar una página para traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_example) \[Tutorial]
- [Administración de traducción de páginas](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Page_translation_administration)
- [Grupos de mensajes de la interfaz (barra lateral localizada, página principal y plantillas)](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Unstructured_element_translation) \[Tutorial]
- \[En curso] [Administración de grupos de mensajes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_management)
- [Formato de configuración YAML](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration)
- [Cómo escribir configuración YAML para grupos de mensajes basados en archivos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Group_configuration_example) \[Tutorial]

### Documentos de referencia para los desarrolladores

- [Instalación](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Installation) y [Configuración](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Configuration) - [MediaWiki Language Extension Bundle](https://www.mediawiki.org/wiki/Special:MyLanguage/MediaWiki_Language_Extension_Bundle) tendría que ser bastante en más casos.

- [Memorias de traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memories)

- [Developer guide](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Developer_guide)

- \[En curso] [Translate explicado para los desarrolladores](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Components)

  - [Ganchos](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Hooks)
  - \[En curso] [Grupos de mensajes](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Message_groups)
  - \[En curso] [Formatos de archivo soportados](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/File_format_support)
  - [Asistentes de traducción](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_aids)
  - \[No redactado] [API web](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/API)
  - [Insertables](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Insertables)
  - [Command line scripts](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Command_line_scripts)
  - [Process flow in MediaWiki jobs](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Process_flow_in_MediaWiki_jobs) - Describes what jobs are involved when a page is marked for translation or a section is translated
  - [Translation memory architecture](https://www.mediawiki.org/wiki/Special:MyLanguage/Help:Extension:Translate/Translation_memory_architecture)

### Relacionado

- [User:Iniquity/translateEditor.js](https://www.mediawiki.org/wiki/User:Iniquity/translateEditor.js) - WikiEditor/CodeMirror integration script for Translate extension
- [Extensión:TranslationNotifications](https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:TranslationNotifications#Special_pages)
- [Localisation/Tutorial](https://www.mediawiki.org/wiki/Special:MyLanguage/Localisation/Tutorial) – Tutorial general de localización para desarrolladores, para el uso en hackathons y formaciones.
- [Selector de Idioma Universal](https://www.mediawiki.org/wiki/Special:MyLanguage/Universal_Language_Selector) – Proporciona fuentes web y métodos de entrada
- [m:Translatability](https://meta.wikimedia.org/wiki/Special:MyLanguage/Translatability) – things to think about when creating pages or processes on multilingual wikis
- [m:Tech/Translators/List](https://meta.wikimedia.org/wiki/Tech/Translators/List) – Agrégate en la lista actual de traductores técnicos activos

::attribution{source-url="https://www.mediawiki.org/wiki/Help:Extension:Translate/es" source-title="Translate extension (from mediawiki.org)" source-wiki="www.mediawiki.org" license="CC BY-SA 4.0" revision="8016702"}
::
