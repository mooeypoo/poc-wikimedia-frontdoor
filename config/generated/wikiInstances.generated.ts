/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * The public, open Wikimedia wiki fleet, keyed by instance id (dbname).
 *
 * Regenerate with:
 *   npm run generate-module-source-of-truth
 * then review the git diff. See docs/adr-module-source-of-truth.md.
 */

export interface GeneratedWikiInstance {
	/** Instance id — the wiki's dbname (e.g. `enwiki`). */
	id: string
	/** Human-readable name (e.g. `English Wikipedia`). */
	displayName: string
	/** Base URL (e.g. `https://en.wikipedia.org`). */
	baseUrl: string
	/** Text direction of the wiki's content language. */
	dir: 'ltr' | 'rtl'
	/** Content language code. */
	language: string
	/** Project family / site type (e.g. `wiki`, `wiktionary`, `commons`). */
	family: string
}

export interface GeneratedWikiInstancesMeta {
	generatedAt: string
	source: string
	instanceCount: number
	limited: boolean
}

export const GENERATED_WIKI_INSTANCES_META: GeneratedWikiInstancesMeta = {
	"generatedAt": "2026-07-20T16:19:37.884Z",
	"source": "https://meta.wikimedia.org/w/api.php",
	"instanceCount": 841,
	"limited": false
}

export const GENERATED_WIKI_INSTANCES: GeneratedWikiInstance[] = [
	{
		"id": "abstractwiki",
		"displayName": "Abstract Wikipedia",
		"baseUrl": "https://abstract.wikipedia.org",
		"dir": "ltr",
		"language": "en",
		"family": "abstract"
	},
	{
		"id": "abwiki",
		"displayName": "Abkhazian Авикипедиа",
		"baseUrl": "https://ab.wikipedia.org",
		"dir": "ltr",
		"language": "ab",
		"family": "wiki"
	},
	{
		"id": "acewiki",
		"displayName": "Acehnese Wikipedia",
		"baseUrl": "https://ace.wikipedia.org",
		"dir": "ltr",
		"language": "ace",
		"family": "wiki"
	},
	{
		"id": "adywiki",
		"displayName": "Adyghe Википедие",
		"baseUrl": "https://ady.wikipedia.org",
		"dir": "ltr",
		"language": "ady",
		"family": "wiki"
	},
	{
		"id": "afwiki",
		"displayName": "Afrikaans Wikipedia",
		"baseUrl": "https://af.wikipedia.org",
		"dir": "ltr",
		"language": "af",
		"family": "wiki"
	},
	{
		"id": "afwikibooks",
		"displayName": "Afrikaans Wikibooks",
		"baseUrl": "https://af.wikibooks.org",
		"dir": "ltr",
		"language": "af",
		"family": "wikibooks"
	},
	{
		"id": "afwikiquote",
		"displayName": "Afrikaans Wikiquote",
		"baseUrl": "https://af.wikiquote.org",
		"dir": "ltr",
		"language": "af",
		"family": "wikiquote"
	},
	{
		"id": "afwiktionary",
		"displayName": "Afrikaans Wiktionary",
		"baseUrl": "https://af.wiktionary.org",
		"dir": "ltr",
		"language": "af",
		"family": "wiktionary"
	},
	{
		"id": "alswiki",
		"displayName": "Alemannic Wikipedia",
		"baseUrl": "https://als.wikipedia.org",
		"dir": "ltr",
		"language": "gsw",
		"family": "wiki"
	},
	{
		"id": "altwiki",
		"displayName": "Southern Altai Википедия",
		"baseUrl": "https://alt.wikipedia.org",
		"dir": "ltr",
		"language": "alt",
		"family": "wiki"
	},
	{
		"id": "amiwiki",
		"displayName": "Amis Wikipedia",
		"baseUrl": "https://ami.wikipedia.org",
		"dir": "ltr",
		"language": "ami",
		"family": "wiki"
	},
	{
		"id": "amwiki",
		"displayName": "Amharic ውክፔዲያ",
		"baseUrl": "https://am.wikipedia.org",
		"dir": "ltr",
		"language": "am",
		"family": "wiki"
	},
	{
		"id": "amwiktionary",
		"displayName": "Amharic Wiktionary",
		"baseUrl": "https://am.wiktionary.org",
		"dir": "ltr",
		"language": "am",
		"family": "wiktionary"
	},
	{
		"id": "angwiki",
		"displayName": "Old English Wikipǣdia",
		"baseUrl": "https://ang.wikipedia.org",
		"dir": "ltr",
		"language": "ang",
		"family": "wiki"
	},
	{
		"id": "angwiktionary",
		"displayName": "Old English Wikiwordbōc",
		"baseUrl": "https://ang.wiktionary.org",
		"dir": "ltr",
		"language": "ang",
		"family": "wiktionary"
	},
	{
		"id": "annwiki",
		"displayName": "Obolo Wìkìpedia",
		"baseUrl": "https://ann.wikipedia.org",
		"dir": "ltr",
		"language": "ann",
		"family": "wiki"
	},
	{
		"id": "anpwiki",
		"displayName": "Angika विकिपीडिया",
		"baseUrl": "https://anp.wikipedia.org",
		"dir": "ltr",
		"language": "anp",
		"family": "wiki"
	},
	{
		"id": "anwiki",
		"displayName": "Aragonese Wikipedia",
		"baseUrl": "https://an.wikipedia.org",
		"dir": "ltr",
		"language": "an",
		"family": "wiki"
	},
	{
		"id": "anwiktionary",
		"displayName": "Aragonese Wiktionary",
		"baseUrl": "https://an.wiktionary.org",
		"dir": "ltr",
		"language": "an",
		"family": "wiktionary"
	},
	{
		"id": "arcwiki",
		"displayName": "Aramaic ܘܝܩܝܦܕܝܐ",
		"baseUrl": "https://arc.wikipedia.org",
		"dir": "rtl",
		"language": "arc",
		"family": "wiki"
	},
	{
		"id": "arwiki",
		"displayName": "Arabic ويكيبيديا",
		"baseUrl": "https://ar.wikipedia.org",
		"dir": "rtl",
		"language": "ar",
		"family": "wiki"
	},
	{
		"id": "arwikibooks",
		"displayName": "Arabic ويكي كتب",
		"baseUrl": "https://ar.wikibooks.org",
		"dir": "rtl",
		"language": "ar",
		"family": "wikibooks"
	},
	{
		"id": "arwikimedia",
		"displayName": "Wikimedia Argentina",
		"baseUrl": "https://ar.wikimedia.org",
		"dir": "ltr",
		"language": "es",
		"family": "arwikimedia"
	},
	{
		"id": "arwikiquote",
		"displayName": "Arabic ويكي الاقتباس",
		"baseUrl": "https://ar.wikiquote.org",
		"dir": "rtl",
		"language": "ar",
		"family": "wikiquote"
	},
	{
		"id": "arwikisource",
		"displayName": "Arabic ويكي مصدر",
		"baseUrl": "https://ar.wikisource.org",
		"dir": "rtl",
		"language": "ar",
		"family": "wikisource"
	},
	{
		"id": "arwikiversity",
		"displayName": "Arabic ويكي الجامعة",
		"baseUrl": "https://ar.wikiversity.org",
		"dir": "rtl",
		"language": "ar",
		"family": "wikiversity"
	},
	{
		"id": "arwiktionary",
		"displayName": "Arabic ويكاموس",
		"baseUrl": "https://ar.wiktionary.org",
		"dir": "rtl",
		"language": "ar",
		"family": "wiktionary"
	},
	{
		"id": "arywiki",
		"displayName": "Moroccan Arabic ويكيپيديا",
		"baseUrl": "https://ary.wikipedia.org",
		"dir": "rtl",
		"language": "ary",
		"family": "wiki"
	},
	{
		"id": "arzwiki",
		"displayName": "Egyptian Arabic ويكيبيديا",
		"baseUrl": "https://arz.wikipedia.org",
		"dir": "rtl",
		"language": "arz",
		"family": "wiki"
	},
	{
		"id": "astwiki",
		"displayName": "Asturian Wikipedia",
		"baseUrl": "https://ast.wikipedia.org",
		"dir": "ltr",
		"language": "ast",
		"family": "wiki"
	},
	{
		"id": "astwiktionary",
		"displayName": "Asturian Wikcionariu",
		"baseUrl": "https://ast.wiktionary.org",
		"dir": "ltr",
		"language": "ast",
		"family": "wiktionary"
	},
	{
		"id": "aswiki",
		"displayName": "Assamese অসমীয়া ৱিকিপিডিয়া",
		"baseUrl": "https://as.wikipedia.org",
		"dir": "ltr",
		"language": "as",
		"family": "wiki"
	},
	{
		"id": "aswikiquote",
		"displayName": "Assamese ৱিকিউদ্ধৃতি",
		"baseUrl": "https://as.wikiquote.org",
		"dir": "ltr",
		"language": "as",
		"family": "wikiquote"
	},
	{
		"id": "aswikisource",
		"displayName": "Assamese ৱিকিউৎস",
		"baseUrl": "https://as.wikisource.org",
		"dir": "ltr",
		"language": "as",
		"family": "wikisource"
	},
	{
		"id": "atjwiki",
		"displayName": "Atikamekw Wikipetcia",
		"baseUrl": "https://atj.wikipedia.org",
		"dir": "ltr",
		"language": "atj",
		"family": "wiki"
	},
	{
		"id": "avkwiki",
		"displayName": "Kotava Wikipedia",
		"baseUrl": "https://avk.wikipedia.org",
		"dir": "ltr",
		"language": "avk",
		"family": "wiki"
	},
	{
		"id": "avwiki",
		"displayName": "Avaric Wikipedia",
		"baseUrl": "https://av.wikipedia.org",
		"dir": "ltr",
		"language": "av",
		"family": "wiki"
	},
	{
		"id": "awawiki",
		"displayName": "Awadhi विकिपीडिया",
		"baseUrl": "https://awa.wikipedia.org",
		"dir": "ltr",
		"language": "awa",
		"family": "wiki"
	},
	{
		"id": "aywiki",
		"displayName": "Aymara Wikipedia",
		"baseUrl": "https://ay.wikipedia.org",
		"dir": "ltr",
		"language": "ay",
		"family": "wiki"
	},
	{
		"id": "aywiktionary",
		"displayName": "Aymara Wiktionary",
		"baseUrl": "https://ay.wiktionary.org",
		"dir": "ltr",
		"language": "ay",
		"family": "wiktionary"
	},
	{
		"id": "azbwiki",
		"displayName": "South Azerbaijani ویکی‌پدیا",
		"baseUrl": "https://azb.wikipedia.org",
		"dir": "rtl",
		"language": "azb",
		"family": "wiki"
	},
	{
		"id": "azwiki",
		"displayName": "Azerbaijani Vikipediya",
		"baseUrl": "https://az.wikipedia.org",
		"dir": "ltr",
		"language": "az",
		"family": "wiki"
	},
	{
		"id": "azwikibooks",
		"displayName": "Azerbaijani Vikikitab",
		"baseUrl": "https://az.wikibooks.org",
		"dir": "ltr",
		"language": "az",
		"family": "wikibooks"
	},
	{
		"id": "azwikiquote",
		"displayName": "Azerbaijani Vikisitat",
		"baseUrl": "https://az.wikiquote.org",
		"dir": "ltr",
		"language": "az",
		"family": "wikiquote"
	},
	{
		"id": "azwikisource",
		"displayName": "Azerbaijani Vikimənbə",
		"baseUrl": "https://az.wikisource.org",
		"dir": "ltr",
		"language": "az",
		"family": "wikisource"
	},
	{
		"id": "azwiktionary",
		"displayName": "Azerbaijani Vikilüğət",
		"baseUrl": "https://az.wiktionary.org",
		"dir": "ltr",
		"language": "az",
		"family": "wiktionary"
	},
	{
		"id": "banwiki",
		"displayName": "Balinese Wikipédia",
		"baseUrl": "https://ban.wikipedia.org",
		"dir": "ltr",
		"language": "ban",
		"family": "wiki"
	},
	{
		"id": "banwikisource",
		"displayName": "Balinese Wikisource",
		"baseUrl": "https://ban.wikisource.org",
		"dir": "ltr",
		"language": "ban",
		"family": "wikisource"
	},
	{
		"id": "barwiki",
		"displayName": "Bavarian Wikipedia",
		"baseUrl": "https://bar.wikipedia.org",
		"dir": "ltr",
		"language": "bar",
		"family": "wiki"
	},
	{
		"id": "bat_smgwiki",
		"displayName": "Samogitian Wikipedia",
		"baseUrl": "https://bat-smg.wikipedia.org",
		"dir": "ltr",
		"language": "sgs",
		"family": "wiki"
	},
	{
		"id": "bawiki",
		"displayName": "Bashkir Википедия",
		"baseUrl": "https://ba.wikipedia.org",
		"dir": "ltr",
		"language": "ba",
		"family": "wiki"
	},
	{
		"id": "bawikibooks",
		"displayName": "Bashkir Викидәреслек",
		"baseUrl": "https://ba.wikibooks.org",
		"dir": "ltr",
		"language": "ba",
		"family": "wikibooks"
	},
	{
		"id": "bbcwiki",
		"displayName": "Batak Toba Wikipedia",
		"baseUrl": "https://bbc.wikipedia.org",
		"dir": "ltr",
		"language": "bbc",
		"family": "wiki"
	},
	{
		"id": "bclwiki",
		"displayName": "Central Bikol Wikipedia",
		"baseUrl": "https://bcl.wikipedia.org",
		"dir": "ltr",
		"language": "bcl",
		"family": "wiki"
	},
	{
		"id": "bclwikiquote",
		"displayName": "Central Bikol Wikiquote",
		"baseUrl": "https://bcl.wikiquote.org",
		"dir": "ltr",
		"language": "bcl",
		"family": "wikiquote"
	},
	{
		"id": "bclwikisource",
		"displayName": "Central Bikol Wikisource",
		"baseUrl": "https://bcl.wikisource.org",
		"dir": "ltr",
		"language": "bcl",
		"family": "wikisource"
	},
	{
		"id": "bclwiktionary",
		"displayName": "Central Bikol Wiksyunaryo",
		"baseUrl": "https://bcl.wiktionary.org",
		"dir": "ltr",
		"language": "bcl",
		"family": "wiktionary"
	},
	{
		"id": "bdrwiki",
		"displayName": "West Coast Bajau Wikipidia",
		"baseUrl": "https://bdr.wikipedia.org",
		"dir": "ltr",
		"language": "bdr",
		"family": "wiki"
	},
	{
		"id": "bdwikimedia",
		"displayName": "উইকিমিডিয়া বাংলাদেশ",
		"baseUrl": "https://bd.wikimedia.org",
		"dir": "ltr",
		"language": "bn",
		"family": "bdwikimedia"
	},
	{
		"id": "be_x_oldwiki",
		"displayName": "Belarusian (Taraškievica orthography) Вікіпэдыя",
		"baseUrl": "https://be-tarask.wikipedia.org",
		"dir": "ltr",
		"language": "be-tarask",
		"family": "wiki"
	},
	{
		"id": "betawikiversity",
		"displayName": "Wikiversity",
		"baseUrl": "https://beta.wikiversity.org",
		"dir": "ltr",
		"language": "en",
		"family": "betawikiversity"
	},
	{
		"id": "bewiki",
		"displayName": "Belarusian Вікіпедыя",
		"baseUrl": "https://be.wikipedia.org",
		"dir": "ltr",
		"language": "be",
		"family": "wiki"
	},
	{
		"id": "bewikibooks",
		"displayName": "Belarusian Вікікнігі",
		"baseUrl": "https://be.wikibooks.org",
		"dir": "ltr",
		"language": "be",
		"family": "wikibooks"
	},
	{
		"id": "bewikimedia",
		"displayName": "Wikimedia Belgium",
		"baseUrl": "https://be.wikimedia.org",
		"dir": "ltr",
		"language": "en",
		"family": "bewikimedia"
	},
	{
		"id": "bewikiquote",
		"displayName": "Belarusian Wikiquote",
		"baseUrl": "https://be.wikiquote.org",
		"dir": "ltr",
		"language": "be",
		"family": "wikiquote"
	},
	{
		"id": "bewikisource",
		"displayName": "Belarusian Вікікрыніцы",
		"baseUrl": "https://be.wikisource.org",
		"dir": "ltr",
		"language": "be",
		"family": "wikisource"
	},
	{
		"id": "bewiktionary",
		"displayName": "Belarusian Вікіслоўнік",
		"baseUrl": "https://be.wiktionary.org",
		"dir": "ltr",
		"language": "be",
		"family": "wiktionary"
	},
	{
		"id": "bewwiki",
		"displayName": "Betawi Wikipédi",
		"baseUrl": "https://bew.wikipedia.org",
		"dir": "ltr",
		"language": "bew",
		"family": "wiki"
	},
	{
		"id": "bewwiktionary",
		"displayName": "Betawi Wikikamus",
		"baseUrl": "https://bew.wiktionary.org",
		"dir": "ltr",
		"language": "bew",
		"family": "wiktionary"
	},
	{
		"id": "bgwiki",
		"displayName": "Bulgarian Уикипедия",
		"baseUrl": "https://bg.wikipedia.org",
		"dir": "ltr",
		"language": "bg",
		"family": "wiki"
	},
	{
		"id": "bgwikibooks",
		"displayName": "Bulgarian Уикикниги",
		"baseUrl": "https://bg.wikibooks.org",
		"dir": "ltr",
		"language": "bg",
		"family": "wikibooks"
	},
	{
		"id": "bgwikiquote",
		"displayName": "Bulgarian Уикицитат",
		"baseUrl": "https://bg.wikiquote.org",
		"dir": "ltr",
		"language": "bg",
		"family": "wikiquote"
	},
	{
		"id": "bgwikisource",
		"displayName": "Bulgarian Уикиизточник",
		"baseUrl": "https://bg.wikisource.org",
		"dir": "ltr",
		"language": "bg",
		"family": "wikisource"
	},
	{
		"id": "bgwiktionary",
		"displayName": "Bulgarian Уикиречник",
		"baseUrl": "https://bg.wiktionary.org",
		"dir": "ltr",
		"language": "bg",
		"family": "wiktionary"
	},
	{
		"id": "bhwiki",
		"displayName": "Bhojpuri विकिपीडिया",
		"baseUrl": "https://bh.wikipedia.org",
		"dir": "ltr",
		"language": "bh",
		"family": "wiki"
	},
	{
		"id": "biwiki",
		"displayName": "Bislama Wikipedia",
		"baseUrl": "https://bi.wikipedia.org",
		"dir": "ltr",
		"language": "bi",
		"family": "wiki"
	},
	{
		"id": "bjnwiki",
		"displayName": "Banjar Wikipidia",
		"baseUrl": "https://bjn.wikipedia.org",
		"dir": "ltr",
		"language": "bjn",
		"family": "wiki"
	},
	{
		"id": "bjnwikiquote",
		"displayName": "Banjar Wikipapadah",
		"baseUrl": "https://bjn.wikiquote.org",
		"dir": "ltr",
		"language": "bjn",
		"family": "wikiquote"
	},
	{
		"id": "bjnwiktionary",
		"displayName": "Banjar Wiktionary",
		"baseUrl": "https://bjn.wiktionary.org",
		"dir": "ltr",
		"language": "bjn",
		"family": "wiktionary"
	},
	{
		"id": "blkwiki",
		"displayName": "Pa'O ဝီခီပီးဒီးယား",
		"baseUrl": "https://blk.wikipedia.org",
		"dir": "ltr",
		"language": "blk",
		"family": "wiki"
	},
	{
		"id": "blkwiktionary",
		"displayName": "Pa'O ဝိစ်သိဉ်နရီ",
		"baseUrl": "https://blk.wiktionary.org",
		"dir": "ltr",
		"language": "blk",
		"family": "wiktionary"
	},
	{
		"id": "bmwiki",
		"displayName": "Bambara Wikipedia",
		"baseUrl": "https://bm.wikipedia.org",
		"dir": "ltr",
		"language": "bm",
		"family": "wiki"
	},
	{
		"id": "bnwiki",
		"displayName": "Bangla উইকিপিডিয়া",
		"baseUrl": "https://bn.wikipedia.org",
		"dir": "ltr",
		"language": "bn",
		"family": "wiki"
	},
	{
		"id": "bnwikibooks",
		"displayName": "Bangla উইকিবই",
		"baseUrl": "https://bn.wikibooks.org",
		"dir": "ltr",
		"language": "bn",
		"family": "wikibooks"
	},
	{
		"id": "bnwikiquote",
		"displayName": "Bangla উইকিউক্তি",
		"baseUrl": "https://bn.wikiquote.org",
		"dir": "ltr",
		"language": "bn",
		"family": "wikiquote"
	},
	{
		"id": "bnwikisource",
		"displayName": "Bangla উইকিসংকলন",
		"baseUrl": "https://bn.wikisource.org",
		"dir": "ltr",
		"language": "bn",
		"family": "wikisource"
	},
	{
		"id": "bnwikivoyage",
		"displayName": "Bangla উইকিভ্রমণ",
		"baseUrl": "https://bn.wikivoyage.org",
		"dir": "ltr",
		"language": "bn",
		"family": "wikivoyage"
	},
	{
		"id": "bnwiktionary",
		"displayName": "Bangla উইকিঅভিধান",
		"baseUrl": "https://bn.wiktionary.org",
		"dir": "ltr",
		"language": "bn",
		"family": "wiktionary"
	},
	{
		"id": "bowiki",
		"displayName": "Tibetan Wikipedia",
		"baseUrl": "https://bo.wikipedia.org",
		"dir": "ltr",
		"language": "bo",
		"family": "wiki"
	},
	{
		"id": "bpywiki",
		"displayName": "Bishnupriya উইকিপিডিয়া",
		"baseUrl": "https://bpy.wikipedia.org",
		"dir": "ltr",
		"language": "bpy",
		"family": "wiki"
	},
	{
		"id": "brwiki",
		"displayName": "Breton Wikipedia",
		"baseUrl": "https://br.wikipedia.org",
		"dir": "ltr",
		"language": "br",
		"family": "wiki"
	},
	{
		"id": "brwikimedia",
		"displayName": "Wikimedia Brasil",
		"baseUrl": "https://br.wikimedia.org",
		"dir": "ltr",
		"language": "pt-BR",
		"family": "brwikimedia"
	},
	{
		"id": "brwikiquote",
		"displayName": "Breton Wikiarroud",
		"baseUrl": "https://br.wikiquote.org",
		"dir": "ltr",
		"language": "br",
		"family": "wikiquote"
	},
	{
		"id": "brwikisource",
		"displayName": "Breton Wikimammenn",
		"baseUrl": "https://br.wikisource.org",
		"dir": "ltr",
		"language": "br",
		"family": "wikisource"
	},
	{
		"id": "brwiktionary",
		"displayName": "Breton Wikeriadur",
		"baseUrl": "https://br.wiktionary.org",
		"dir": "ltr",
		"language": "br",
		"family": "wiktionary"
	},
	{
		"id": "bswiki",
		"displayName": "Bosnian Wikipedia",
		"baseUrl": "https://bs.wikipedia.org",
		"dir": "ltr",
		"language": "bs",
		"family": "wiki"
	},
	{
		"id": "bswikibooks",
		"displayName": "Bosnian Wikiknjige",
		"baseUrl": "https://bs.wikibooks.org",
		"dir": "ltr",
		"language": "bs",
		"family": "wikibooks"
	},
	{
		"id": "bswikiquote",
		"displayName": "Bosnian Wikicitati",
		"baseUrl": "https://bs.wikiquote.org",
		"dir": "ltr",
		"language": "bs",
		"family": "wikiquote"
	},
	{
		"id": "bswikisource",
		"displayName": "Bosnian Wikizvor",
		"baseUrl": "https://bs.wikisource.org",
		"dir": "ltr",
		"language": "bs",
		"family": "wikisource"
	},
	{
		"id": "bswiktionary",
		"displayName": "Bosnian Wikirječnik",
		"baseUrl": "https://bs.wiktionary.org",
		"dir": "ltr",
		"language": "bs",
		"family": "wiktionary"
	},
	{
		"id": "btmwiki",
		"displayName": "Batak Mandailing Wikipedia",
		"baseUrl": "https://btm.wikipedia.org",
		"dir": "ltr",
		"language": "btm",
		"family": "wiki"
	},
	{
		"id": "btmwiktionary",
		"displayName": "Batak Mandailing Wikikamus",
		"baseUrl": "https://btm.wiktionary.org",
		"dir": "ltr",
		"language": "btm",
		"family": "wiktionary"
	},
	{
		"id": "bugwiki",
		"displayName": "Buginese Wikipedia",
		"baseUrl": "https://bug.wikipedia.org",
		"dir": "ltr",
		"language": "bug",
		"family": "wiki"
	},
	{
		"id": "bxrwiki",
		"displayName": "Russia Buriat Wikipedia",
		"baseUrl": "https://bxr.wikipedia.org",
		"dir": "ltr",
		"language": "bxr",
		"family": "wiki"
	},
	{
		"id": "cawiki",
		"displayName": "Catalan Viquipèdia",
		"baseUrl": "https://ca.wikipedia.org",
		"dir": "ltr",
		"language": "ca",
		"family": "wiki"
	},
	{
		"id": "cawikibooks",
		"displayName": "Catalan Viquillibres",
		"baseUrl": "https://ca.wikibooks.org",
		"dir": "ltr",
		"language": "ca",
		"family": "wikibooks"
	},
	{
		"id": "cawikimedia",
		"displayName": "Wikimedia Canada",
		"baseUrl": "https://ca.wikimedia.org",
		"dir": "ltr",
		"language": "en",
		"family": "cawikimedia"
	},
	{
		"id": "cawikiquote",
		"displayName": "Catalan Viquidites",
		"baseUrl": "https://ca.wikiquote.org",
		"dir": "ltr",
		"language": "ca",
		"family": "wikiquote"
	},
	{
		"id": "cawikisource",
		"displayName": "Catalan Viquitexts",
		"baseUrl": "https://ca.wikisource.org",
		"dir": "ltr",
		"language": "ca",
		"family": "wikisource"
	},
	{
		"id": "cawiktionary",
		"displayName": "Catalan Viccionari",
		"baseUrl": "https://ca.wiktionary.org",
		"dir": "ltr",
		"language": "ca",
		"family": "wiktionary"
	},
	{
		"id": "cbk_zamwiki",
		"displayName": "Chavacano Wikipedia",
		"baseUrl": "https://cbk-zam.wikipedia.org",
		"dir": "ltr",
		"language": "cbk-zam",
		"family": "wiki"
	},
	{
		"id": "cdowiki",
		"displayName": "Mindong Wikipedia",
		"baseUrl": "https://cdo.wikipedia.org",
		"dir": "ltr",
		"language": "cdo",
		"family": "wiki"
	},
	{
		"id": "cebwiki",
		"displayName": "Cebuano Wikipedia",
		"baseUrl": "https://ceb.wikipedia.org",
		"dir": "ltr",
		"language": "ceb",
		"family": "wiki"
	},
	{
		"id": "cewiki",
		"displayName": "Chechen Википеди",
		"baseUrl": "https://ce.wikipedia.org",
		"dir": "ltr",
		"language": "ce",
		"family": "wiki"
	},
	{
		"id": "chrwiki",
		"displayName": "Cherokee Wikipedia",
		"baseUrl": "https://chr.wikipedia.org",
		"dir": "ltr",
		"language": "chr",
		"family": "wiki"
	},
	{
		"id": "chrwiktionary",
		"displayName": "Cherokee Wiktionary",
		"baseUrl": "https://chr.wiktionary.org",
		"dir": "ltr",
		"language": "chr",
		"family": "wiktionary"
	},
	{
		"id": "chwiki",
		"displayName": "Chamorro Wikipedia",
		"baseUrl": "https://ch.wikipedia.org",
		"dir": "ltr",
		"language": "ch",
		"family": "wiki"
	},
	{
		"id": "chywiki",
		"displayName": "Cheyenne Tsétsêhéstâhese Wikipedia",
		"baseUrl": "https://chy.wikipedia.org",
		"dir": "ltr",
		"language": "chy",
		"family": "wiki"
	},
	{
		"id": "ckbwiki",
		"displayName": "Central Kurdish ویکیپیدیا",
		"baseUrl": "https://ckb.wikipedia.org",
		"dir": "rtl",
		"language": "ckb",
		"family": "wiki"
	},
	{
		"id": "ckbwiktionary",
		"displayName": "Central Kurdish ویکیفەرھەنگ",
		"baseUrl": "https://ckb.wiktionary.org",
		"dir": "rtl",
		"language": "ckb",
		"family": "wiktionary"
	},
	{
		"id": "commonswiki",
		"displayName": "Wikimedia Commons",
		"baseUrl": "https://commons.wikimedia.org",
		"dir": "ltr",
		"language": "commons",
		"family": "commons"
	},
	{
		"id": "cowiki",
		"displayName": "Corsican Wikipedia",
		"baseUrl": "https://co.wikipedia.org",
		"dir": "ltr",
		"language": "co",
		"family": "wiki"
	},
	{
		"id": "cowikimedia",
		"displayName": "Wikimedia Colombia",
		"baseUrl": "https://co.wikimedia.org",
		"dir": "ltr",
		"language": "es",
		"family": "cowikimedia"
	},
	{
		"id": "cowiktionary",
		"displayName": "Corsican Wiktionary",
		"baseUrl": "https://co.wiktionary.org",
		"dir": "ltr",
		"language": "co",
		"family": "wiktionary"
	},
	{
		"id": "crhwiki",
		"displayName": "Crimean Tatar Vikipediya",
		"baseUrl": "https://crh.wikipedia.org",
		"dir": "ltr",
		"language": "crh",
		"family": "wiki"
	},
	{
		"id": "csbwiki",
		"displayName": "Kashubian Wikipedia",
		"baseUrl": "https://csb.wikipedia.org",
		"dir": "ltr",
		"language": "csb",
		"family": "wiki"
	},
	{
		"id": "csbwiktionary",
		"displayName": "Kashubian Wiktionary",
		"baseUrl": "https://csb.wiktionary.org",
		"dir": "ltr",
		"language": "csb",
		"family": "wiktionary"
	},
	{
		"id": "cswiki",
		"displayName": "Czech Wikipedie",
		"baseUrl": "https://cs.wikipedia.org",
		"dir": "ltr",
		"language": "cs",
		"family": "wiki"
	},
	{
		"id": "cswikibooks",
		"displayName": "Czech Wikiknihy",
		"baseUrl": "https://cs.wikibooks.org",
		"dir": "ltr",
		"language": "cs",
		"family": "wikibooks"
	},
	{
		"id": "cswikiquote",
		"displayName": "Czech Wikicitáty",
		"baseUrl": "https://cs.wikiquote.org",
		"dir": "ltr",
		"language": "cs",
		"family": "wikiquote"
	},
	{
		"id": "cswikisource",
		"displayName": "Czech Wikizdroje",
		"baseUrl": "https://cs.wikisource.org",
		"dir": "ltr",
		"language": "cs",
		"family": "wikisource"
	},
	{
		"id": "cswikiversity",
		"displayName": "Czech Wikiverzita",
		"baseUrl": "https://cs.wikiversity.org",
		"dir": "ltr",
		"language": "cs",
		"family": "wikiversity"
	},
	{
		"id": "cswikivoyage",
		"displayName": "Czech Wikicesty",
		"baseUrl": "https://cs.wikivoyage.org",
		"dir": "ltr",
		"language": "cs",
		"family": "wikivoyage"
	},
	{
		"id": "cswiktionary",
		"displayName": "Czech Wikislovník",
		"baseUrl": "https://cs.wiktionary.org",
		"dir": "ltr",
		"language": "cs",
		"family": "wiktionary"
	},
	{
		"id": "cuwiki",
		"displayName": "Church Slavic Википєдїꙗ",
		"baseUrl": "https://cu.wikipedia.org",
		"dir": "ltr",
		"language": "cu",
		"family": "wiki"
	},
	{
		"id": "cvwiki",
		"displayName": "Chuvash Википеди",
		"baseUrl": "https://cv.wikipedia.org",
		"dir": "ltr",
		"language": "cv",
		"family": "wiki"
	},
	{
		"id": "cvwikibooks",
		"displayName": "Chuvash Wikibooks",
		"baseUrl": "https://cv.wikibooks.org",
		"dir": "ltr",
		"language": "cv",
		"family": "wikibooks"
	},
	{
		"id": "cywiki",
		"displayName": "Welsh Wicipedia",
		"baseUrl": "https://cy.wikipedia.org",
		"dir": "ltr",
		"language": "cy",
		"family": "wiki"
	},
	{
		"id": "cywikibooks",
		"displayName": "Welsh Wicilyfrau",
		"baseUrl": "https://cy.wikibooks.org",
		"dir": "ltr",
		"language": "cy",
		"family": "wikibooks"
	},
	{
		"id": "cywikiquote",
		"displayName": "Welsh Wikiquote",
		"baseUrl": "https://cy.wikiquote.org",
		"dir": "ltr",
		"language": "cy",
		"family": "wikiquote"
	},
	{
		"id": "cywikisource",
		"displayName": "Welsh Wicidestun",
		"baseUrl": "https://cy.wikisource.org",
		"dir": "ltr",
		"language": "cy",
		"family": "wikisource"
	},
	{
		"id": "cywiktionary",
		"displayName": "Welsh Wiciadur",
		"baseUrl": "https://cy.wiktionary.org",
		"dir": "ltr",
		"language": "cy",
		"family": "wiktionary"
	},
	{
		"id": "dagwiki",
		"displayName": "Dagbani Dagbani Wikipedia",
		"baseUrl": "https://dag.wikipedia.org",
		"dir": "ltr",
		"language": "dag",
		"family": "wiki"
	},
	{
		"id": "dawiki",
		"displayName": "Danish Wikipedia",
		"baseUrl": "https://da.wikipedia.org",
		"dir": "ltr",
		"language": "da",
		"family": "wiki"
	},
	{
		"id": "dawikibooks",
		"displayName": "Danish Wikibooks",
		"baseUrl": "https://da.wikibooks.org",
		"dir": "ltr",
		"language": "da",
		"family": "wikibooks"
	},
	{
		"id": "dawikiquote",
		"displayName": "Danish Wikiquote",
		"baseUrl": "https://da.wikiquote.org",
		"dir": "ltr",
		"language": "da",
		"family": "wikiquote"
	},
	{
		"id": "dawikisource",
		"displayName": "Danish Wikisource",
		"baseUrl": "https://da.wikisource.org",
		"dir": "ltr",
		"language": "da",
		"family": "wikisource"
	},
	{
		"id": "dawiktionary",
		"displayName": "Danish Wiktionary",
		"baseUrl": "https://da.wiktionary.org",
		"dir": "ltr",
		"language": "da",
		"family": "wiktionary"
	},
	{
		"id": "dewiki",
		"displayName": "German Wikipedia",
		"baseUrl": "https://de.wikipedia.org",
		"dir": "ltr",
		"language": "de",
		"family": "wiki"
	},
	{
		"id": "dewikibooks",
		"displayName": "German Wikibooks",
		"baseUrl": "https://de.wikibooks.org",
		"dir": "ltr",
		"language": "de",
		"family": "wikibooks"
	},
	{
		"id": "dewikiquote",
		"displayName": "German Wikiquote",
		"baseUrl": "https://de.wikiquote.org",
		"dir": "ltr",
		"language": "de",
		"family": "wikiquote"
	},
	{
		"id": "dewikisource",
		"displayName": "German Wikisource",
		"baseUrl": "https://de.wikisource.org",
		"dir": "ltr",
		"language": "de",
		"family": "wikisource"
	},
	{
		"id": "dewikiversity",
		"displayName": "German Wikiversity",
		"baseUrl": "https://de.wikiversity.org",
		"dir": "ltr",
		"language": "de",
		"family": "wikiversity"
	},
	{
		"id": "dewikivoyage",
		"displayName": "German Wikivoyage",
		"baseUrl": "https://de.wikivoyage.org",
		"dir": "ltr",
		"language": "de",
		"family": "wikivoyage"
	},
	{
		"id": "dewiktionary",
		"displayName": "German Wiktionary",
		"baseUrl": "https://de.wiktionary.org",
		"dir": "ltr",
		"language": "de",
		"family": "wiktionary"
	},
	{
		"id": "dgawiki",
		"displayName": "Southern Dagaare Wikipiideɛ",
		"baseUrl": "https://dga.wikipedia.org",
		"dir": "ltr",
		"language": "dga",
		"family": "wiki"
	},
	{
		"id": "dinwiki",
		"displayName": "Dinka Wikipedia",
		"baseUrl": "https://din.wikipedia.org",
		"dir": "ltr",
		"language": "din",
		"family": "wiki"
	},
	{
		"id": "diqwiki",
		"displayName": "Dimli Wikipedia",
		"baseUrl": "https://diq.wikipedia.org",
		"dir": "ltr",
		"language": "diq",
		"family": "wiki"
	},
	{
		"id": "diqwiktionary",
		"displayName": "Dimli Wikiqısebend",
		"baseUrl": "https://diq.wiktionary.org",
		"dir": "ltr",
		"language": "diq",
		"family": "wiktionary"
	},
	{
		"id": "dkwikimedia",
		"displayName": "Wikimedia Danmark",
		"baseUrl": "https://dk.wikimedia.org",
		"dir": "ltr",
		"language": "da",
		"family": "dkwikimedia"
	},
	{
		"id": "dsbwiki",
		"displayName": "Lower Sorbian Wikipedija",
		"baseUrl": "https://dsb.wikipedia.org",
		"dir": "ltr",
		"language": "dsb",
		"family": "wiki"
	},
	{
		"id": "dtpwiki",
		"displayName": "Central Dusun Wikipedia",
		"baseUrl": "https://dtp.wikipedia.org",
		"dir": "ltr",
		"language": "dtp",
		"family": "wiki"
	},
	{
		"id": "dtywiki",
		"displayName": "Doteli विकिपिडिया",
		"baseUrl": "https://dty.wikipedia.org",
		"dir": "ltr",
		"language": "dty",
		"family": "wiki"
	},
	{
		"id": "dvwiki",
		"displayName": "Divehi ވިކިޕީޑިއާ",
		"baseUrl": "https://dv.wikipedia.org",
		"dir": "rtl",
		"language": "dv",
		"family": "wiki"
	},
	{
		"id": "dvwiktionary",
		"displayName": "Divehi ވިކިރަދީފު",
		"baseUrl": "https://dv.wiktionary.org",
		"dir": "rtl",
		"language": "dv",
		"family": "wiktionary"
	},
	{
		"id": "dzwiki",
		"displayName": "Dzongkha Wikipedia",
		"baseUrl": "https://dz.wikipedia.org",
		"dir": "ltr",
		"language": "dz",
		"family": "wiki"
	},
	{
		"id": "eewiki",
		"displayName": "Ewe Wikipedia",
		"baseUrl": "https://ee.wikipedia.org",
		"dir": "ltr",
		"language": "ee",
		"family": "wiki"
	},
	{
		"id": "elwiki",
		"displayName": "Greek Βικιπαίδεια",
		"baseUrl": "https://el.wikipedia.org",
		"dir": "ltr",
		"language": "el",
		"family": "wiki"
	},
	{
		"id": "elwikibooks",
		"displayName": "Greek Βικιβιβλία",
		"baseUrl": "https://el.wikibooks.org",
		"dir": "ltr",
		"language": "el",
		"family": "wikibooks"
	},
	{
		"id": "elwikiquote",
		"displayName": "Greek Βικιφθέγματα",
		"baseUrl": "https://el.wikiquote.org",
		"dir": "ltr",
		"language": "el",
		"family": "wikiquote"
	},
	{
		"id": "elwikisource",
		"displayName": "Greek Βικιθήκη",
		"baseUrl": "https://el.wikisource.org",
		"dir": "ltr",
		"language": "el",
		"family": "wikisource"
	},
	{
		"id": "elwikiversity",
		"displayName": "Greek Βικιεπιστήμιο",
		"baseUrl": "https://el.wikiversity.org",
		"dir": "ltr",
		"language": "el",
		"family": "wikiversity"
	},
	{
		"id": "elwikivoyage",
		"displayName": "Greek Βικιταξίδια",
		"baseUrl": "https://el.wikivoyage.org",
		"dir": "ltr",
		"language": "el",
		"family": "wikivoyage"
	},
	{
		"id": "elwiktionary",
		"displayName": "Greek Βικιλεξικό",
		"baseUrl": "https://el.wiktionary.org",
		"dir": "ltr",
		"language": "el",
		"family": "wiktionary"
	},
	{
		"id": "emlwiki",
		"displayName": "Emiliano-Romagnolo Wikipedia",
		"baseUrl": "https://eml.wikipedia.org",
		"dir": "ltr",
		"language": "eml",
		"family": "wiki"
	},
	{
		"id": "enwiki",
		"displayName": "English Wikipedia",
		"baseUrl": "https://en.wikipedia.org",
		"dir": "ltr",
		"language": "en",
		"family": "wiki"
	},
	{
		"id": "enwikibooks",
		"displayName": "English Wikibooks",
		"baseUrl": "https://en.wikibooks.org",
		"dir": "ltr",
		"language": "en",
		"family": "wikibooks"
	},
	{
		"id": "enwikiquote",
		"displayName": "English Wikiquote",
		"baseUrl": "https://en.wikiquote.org",
		"dir": "ltr",
		"language": "en",
		"family": "wikiquote"
	},
	{
		"id": "enwikisource",
		"displayName": "English Wikisource",
		"baseUrl": "https://en.wikisource.org",
		"dir": "ltr",
		"language": "en",
		"family": "wikisource"
	},
	{
		"id": "enwikiversity",
		"displayName": "English Wikiversity",
		"baseUrl": "https://en.wikiversity.org",
		"dir": "ltr",
		"language": "en",
		"family": "wikiversity"
	},
	{
		"id": "enwikivoyage",
		"displayName": "English Wikivoyage",
		"baseUrl": "https://en.wikivoyage.org",
		"dir": "ltr",
		"language": "en",
		"family": "wikivoyage"
	},
	{
		"id": "enwiktionary",
		"displayName": "English Wiktionary",
		"baseUrl": "https://en.wiktionary.org",
		"dir": "ltr",
		"language": "en",
		"family": "wiktionary"
	},
	{
		"id": "eowiki",
		"displayName": "Esperanto Vikipedio",
		"baseUrl": "https://eo.wikipedia.org",
		"dir": "ltr",
		"language": "eo",
		"family": "wiki"
	},
	{
		"id": "eowikibooks",
		"displayName": "Esperanto Vikilibroj",
		"baseUrl": "https://eo.wikibooks.org",
		"dir": "ltr",
		"language": "eo",
		"family": "wikibooks"
	},
	{
		"id": "eowikiquote",
		"displayName": "Esperanto Vikicitaro",
		"baseUrl": "https://eo.wikiquote.org",
		"dir": "ltr",
		"language": "eo",
		"family": "wikiquote"
	},
	{
		"id": "eowikisource",
		"displayName": "Esperanto Vikifontaro",
		"baseUrl": "https://eo.wikisource.org",
		"dir": "ltr",
		"language": "eo",
		"family": "wikisource"
	},
	{
		"id": "eowikivoyage",
		"displayName": "Esperanto Vikivojaĝo",
		"baseUrl": "https://eo.wikivoyage.org",
		"dir": "ltr",
		"language": "eo",
		"family": "wikivoyage"
	},
	{
		"id": "eowiktionary",
		"displayName": "Esperanto Vikivortaro",
		"baseUrl": "https://eo.wiktionary.org",
		"dir": "ltr",
		"language": "eo",
		"family": "wiktionary"
	},
	{
		"id": "eswiki",
		"displayName": "Spanish Wikipedia",
		"baseUrl": "https://es.wikipedia.org",
		"dir": "ltr",
		"language": "es",
		"family": "wiki"
	},
	{
		"id": "eswikibooks",
		"displayName": "Spanish Wikilibros",
		"baseUrl": "https://es.wikibooks.org",
		"dir": "ltr",
		"language": "es",
		"family": "wikibooks"
	},
	{
		"id": "eswikiquote",
		"displayName": "Spanish Wikiquote",
		"baseUrl": "https://es.wikiquote.org",
		"dir": "ltr",
		"language": "es",
		"family": "wikiquote"
	},
	{
		"id": "eswikisource",
		"displayName": "Spanish Wikisource",
		"baseUrl": "https://es.wikisource.org",
		"dir": "ltr",
		"language": "es",
		"family": "wikisource"
	},
	{
		"id": "eswikiversity",
		"displayName": "Spanish Wikiversidad",
		"baseUrl": "https://es.wikiversity.org",
		"dir": "ltr",
		"language": "es",
		"family": "wikiversity"
	},
	{
		"id": "eswikivoyage",
		"displayName": "Spanish Wikiviajes",
		"baseUrl": "https://es.wikivoyage.org",
		"dir": "ltr",
		"language": "es",
		"family": "wikivoyage"
	},
	{
		"id": "eswiktionary",
		"displayName": "Spanish Wikcionario",
		"baseUrl": "https://es.wiktionary.org",
		"dir": "ltr",
		"language": "es",
		"family": "wiktionary"
	},
	{
		"id": "etwiki",
		"displayName": "Estonian Vikipeedia",
		"baseUrl": "https://et.wikipedia.org",
		"dir": "ltr",
		"language": "et",
		"family": "wiki"
	},
	{
		"id": "etwikibooks",
		"displayName": "Estonian Vikiõpikud",
		"baseUrl": "https://et.wikibooks.org",
		"dir": "ltr",
		"language": "et",
		"family": "wikibooks"
	},
	{
		"id": "etwikimedia",
		"displayName": "Wikimedia Eesti",
		"baseUrl": "https://ee.wikimedia.org",
		"dir": "ltr",
		"language": "et",
		"family": "etwikimedia"
	},
	{
		"id": "etwikiquote",
		"displayName": "Estonian Vikitsitaadid",
		"baseUrl": "https://et.wikiquote.org",
		"dir": "ltr",
		"language": "et",
		"family": "wikiquote"
	},
	{
		"id": "etwikisource",
		"displayName": "Estonian Vikitekstid",
		"baseUrl": "https://et.wikisource.org",
		"dir": "ltr",
		"language": "et",
		"family": "wikisource"
	},
	{
		"id": "etwiktionary",
		"displayName": "Estonian Vikisõnastik",
		"baseUrl": "https://et.wiktionary.org",
		"dir": "ltr",
		"language": "et",
		"family": "wiktionary"
	},
	{
		"id": "euwiki",
		"displayName": "Basque Wikipedia",
		"baseUrl": "https://eu.wikipedia.org",
		"dir": "ltr",
		"language": "eu",
		"family": "wiki"
	},
	{
		"id": "euwikibooks",
		"displayName": "Basque Wikibooks",
		"baseUrl": "https://eu.wikibooks.org",
		"dir": "ltr",
		"language": "eu",
		"family": "wikibooks"
	},
	{
		"id": "euwikiquote",
		"displayName": "Basque Wikiquote",
		"baseUrl": "https://eu.wikiquote.org",
		"dir": "ltr",
		"language": "eu",
		"family": "wikiquote"
	},
	{
		"id": "euwikisource",
		"displayName": "Basque Wikiteka",
		"baseUrl": "https://eu.wikisource.org",
		"dir": "ltr",
		"language": "eu",
		"family": "wikisource"
	},
	{
		"id": "euwiktionary",
		"displayName": "Basque Wiktionary",
		"baseUrl": "https://eu.wiktionary.org",
		"dir": "ltr",
		"language": "eu",
		"family": "wiktionary"
	},
	{
		"id": "extwiki",
		"displayName": "Extremaduran Güiquipedia",
		"baseUrl": "https://ext.wikipedia.org",
		"dir": "ltr",
		"language": "ext",
		"family": "wiki"
	},
	{
		"id": "fatwiki",
		"displayName": "Fanti Wikipedia",
		"baseUrl": "https://fat.wikipedia.org",
		"dir": "ltr",
		"language": "fat",
		"family": "wiki"
	},
	{
		"id": "fawiki",
		"displayName": "Persian ویکی‌پدیا",
		"baseUrl": "https://fa.wikipedia.org",
		"dir": "rtl",
		"language": "fa",
		"family": "wiki"
	},
	{
		"id": "fawikibooks",
		"displayName": "Persian ویکی‌کتاب",
		"baseUrl": "https://fa.wikibooks.org",
		"dir": "rtl",
		"language": "fa",
		"family": "wikibooks"
	},
	{
		"id": "fawikiquote",
		"displayName": "Persian ویکی‌گفتاورد",
		"baseUrl": "https://fa.wikiquote.org",
		"dir": "rtl",
		"language": "fa",
		"family": "wikiquote"
	},
	{
		"id": "fawikisource",
		"displayName": "Persian ویکی‌نبشته",
		"baseUrl": "https://fa.wikisource.org",
		"dir": "rtl",
		"language": "fa",
		"family": "wikisource"
	},
	{
		"id": "fawikivoyage",
		"displayName": "Persian ویکی‌سفر",
		"baseUrl": "https://fa.wikivoyage.org",
		"dir": "rtl",
		"language": "fa",
		"family": "wikivoyage"
	},
	{
		"id": "fawiktionary",
		"displayName": "Persian ویکی‌واژه",
		"baseUrl": "https://fa.wiktionary.org",
		"dir": "rtl",
		"language": "fa",
		"family": "wiktionary"
	},
	{
		"id": "ffwiki",
		"displayName": "Fula Wikipedia",
		"baseUrl": "https://ff.wikipedia.org",
		"dir": "ltr",
		"language": "ff",
		"family": "wiki"
	},
	{
		"id": "fiu_vrowiki",
		"displayName": "Võro Wikipedia",
		"baseUrl": "https://fiu-vro.wikipedia.org",
		"dir": "ltr",
		"language": "vro",
		"family": "wiki"
	},
	{
		"id": "fiwiki",
		"displayName": "Finnish Wikipedia",
		"baseUrl": "https://fi.wikipedia.org",
		"dir": "ltr",
		"language": "fi",
		"family": "wiki"
	},
	{
		"id": "fiwikibooks",
		"displayName": "Finnish Wikikirjasto",
		"baseUrl": "https://fi.wikibooks.org",
		"dir": "ltr",
		"language": "fi",
		"family": "wikibooks"
	},
	{
		"id": "fiwikimedia",
		"displayName": "Wikimedia Suomi",
		"baseUrl": "https://fi.wikimedia.org",
		"dir": "ltr",
		"language": "fi",
		"family": "fiwikimedia"
	},
	{
		"id": "fiwikiquote",
		"displayName": "Finnish Wikisitaatit",
		"baseUrl": "https://fi.wikiquote.org",
		"dir": "ltr",
		"language": "fi",
		"family": "wikiquote"
	},
	{
		"id": "fiwikisource",
		"displayName": "Finnish Wikiaineisto",
		"baseUrl": "https://fi.wikisource.org",
		"dir": "ltr",
		"language": "fi",
		"family": "wikisource"
	},
	{
		"id": "fiwikiversity",
		"displayName": "Finnish Wikiopisto",
		"baseUrl": "https://fi.wikiversity.org",
		"dir": "ltr",
		"language": "fi",
		"family": "wikiversity"
	},
	{
		"id": "fiwikivoyage",
		"displayName": "Finnish Wikimatkat",
		"baseUrl": "https://fi.wikivoyage.org",
		"dir": "ltr",
		"language": "fi",
		"family": "wikivoyage"
	},
	{
		"id": "fiwiktionary",
		"displayName": "Finnish Wikisanakirja",
		"baseUrl": "https://fi.wiktionary.org",
		"dir": "ltr",
		"language": "fi",
		"family": "wiktionary"
	},
	{
		"id": "fjwiki",
		"displayName": "Fijian Wikipedia",
		"baseUrl": "https://fj.wikipedia.org",
		"dir": "ltr",
		"language": "fj",
		"family": "wiki"
	},
	{
		"id": "fjwiktionary",
		"displayName": "Fijian Wiktionary",
		"baseUrl": "https://fj.wiktionary.org",
		"dir": "ltr",
		"language": "fj",
		"family": "wiktionary"
	},
	{
		"id": "fonwiki",
		"displayName": "Fon Wikipedya",
		"baseUrl": "https://fon.wikipedia.org",
		"dir": "ltr",
		"language": "fon",
		"family": "wiki"
	},
	{
		"id": "foundationwiki",
		"displayName": "Wikimedia Foundation Governance Wiki",
		"baseUrl": "https://foundation.wikimedia.org",
		"dir": "ltr",
		"language": "foundation",
		"family": "foundation"
	},
	{
		"id": "fowiki",
		"displayName": "Faroese Wikipedia",
		"baseUrl": "https://fo.wikipedia.org",
		"dir": "ltr",
		"language": "fo",
		"family": "wiki"
	},
	{
		"id": "fowikisource",
		"displayName": "Faroese Wikiheimild",
		"baseUrl": "https://fo.wikisource.org",
		"dir": "ltr",
		"language": "fo",
		"family": "wikisource"
	},
	{
		"id": "fowiktionary",
		"displayName": "Faroese Wiktionary",
		"baseUrl": "https://fo.wiktionary.org",
		"dir": "ltr",
		"language": "fo",
		"family": "wiktionary"
	},
	{
		"id": "frpwiki",
		"displayName": "Arpitan Vouiquipèdia",
		"baseUrl": "https://frp.wikipedia.org",
		"dir": "ltr",
		"language": "frp",
		"family": "wiki"
	},
	{
		"id": "frrwiki",
		"displayName": "Northern Frisian Wikipedia",
		"baseUrl": "https://frr.wikipedia.org",
		"dir": "ltr",
		"language": "frr",
		"family": "wiki"
	},
	{
		"id": "frwiki",
		"displayName": "French Wikipédia",
		"baseUrl": "https://fr.wikipedia.org",
		"dir": "ltr",
		"language": "fr",
		"family": "wiki"
	},
	{
		"id": "frwikibooks",
		"displayName": "French Wikilivres",
		"baseUrl": "https://fr.wikibooks.org",
		"dir": "ltr",
		"language": "fr",
		"family": "wikibooks"
	},
	{
		"id": "frwikiquote",
		"displayName": "French Wikiquote",
		"baseUrl": "https://fr.wikiquote.org",
		"dir": "ltr",
		"language": "fr",
		"family": "wikiquote"
	},
	{
		"id": "frwikisource",
		"displayName": "French Wikisource",
		"baseUrl": "https://fr.wikisource.org",
		"dir": "ltr",
		"language": "fr",
		"family": "wikisource"
	},
	{
		"id": "frwikiversity",
		"displayName": "French Wikiversité",
		"baseUrl": "https://fr.wikiversity.org",
		"dir": "ltr",
		"language": "fr",
		"family": "wikiversity"
	},
	{
		"id": "frwikivoyage",
		"displayName": "French Wikivoyage",
		"baseUrl": "https://fr.wikivoyage.org",
		"dir": "ltr",
		"language": "fr",
		"family": "wikivoyage"
	},
	{
		"id": "frwiktionary",
		"displayName": "French Wiktionnaire",
		"baseUrl": "https://fr.wiktionary.org",
		"dir": "ltr",
		"language": "fr",
		"family": "wiktionary"
	},
	{
		"id": "furwiki",
		"displayName": "Friulian Vichipedie",
		"baseUrl": "https://fur.wikipedia.org",
		"dir": "ltr",
		"language": "fur",
		"family": "wiki"
	},
	{
		"id": "fywiki",
		"displayName": "Western Frisian Wikipedy",
		"baseUrl": "https://fy.wikipedia.org",
		"dir": "ltr",
		"language": "fy",
		"family": "wiki"
	},
	{
		"id": "fywikibooks",
		"displayName": "Western Frisian Wikibooks",
		"baseUrl": "https://fy.wikibooks.org",
		"dir": "ltr",
		"language": "fy",
		"family": "wikibooks"
	},
	{
		"id": "fywiktionary",
		"displayName": "Western Frisian Wikiwurdboek",
		"baseUrl": "https://fy.wiktionary.org",
		"dir": "ltr",
		"language": "fy",
		"family": "wiktionary"
	},
	{
		"id": "gagwiki",
		"displayName": "Gagauz Vikipediya",
		"baseUrl": "https://gag.wikipedia.org",
		"dir": "ltr",
		"language": "gag",
		"family": "wiki"
	},
	{
		"id": "ganwiki",
		"displayName": "Gan 維基百科",
		"baseUrl": "https://gan.wikipedia.org",
		"dir": "ltr",
		"language": "gan",
		"family": "wiki"
	},
	{
		"id": "gawiki",
		"displayName": "Irish Vicipéid",
		"baseUrl": "https://ga.wikipedia.org",
		"dir": "ltr",
		"language": "ga",
		"family": "wiki"
	},
	{
		"id": "gawiktionary",
		"displayName": "Irish Vicífhoclóir",
		"baseUrl": "https://ga.wiktionary.org",
		"dir": "ltr",
		"language": "ga",
		"family": "wiktionary"
	},
	{
		"id": "gcrwiki",
		"displayName": "Guianan Creole Wikipédja",
		"baseUrl": "https://gcr.wikipedia.org",
		"dir": "ltr",
		"language": "gcr",
		"family": "wiki"
	},
	{
		"id": "gdwiki",
		"displayName": "Scottish Gaelic Uicipeid",
		"baseUrl": "https://gd.wikipedia.org",
		"dir": "ltr",
		"language": "gd",
		"family": "wiki"
	},
	{
		"id": "gdwiktionary",
		"displayName": "Scottish Gaelic Wiktionary",
		"baseUrl": "https://gd.wiktionary.org",
		"dir": "ltr",
		"language": "gd",
		"family": "wiktionary"
	},
	{
		"id": "glkwiki",
		"displayName": "Gilaki Wikipedia",
		"baseUrl": "https://glk.wikipedia.org",
		"dir": "rtl",
		"language": "glk",
		"family": "wiki"
	},
	{
		"id": "glwiki",
		"displayName": "Galician Wikipedia",
		"baseUrl": "https://gl.wikipedia.org",
		"dir": "ltr",
		"language": "gl",
		"family": "wiki"
	},
	{
		"id": "glwikibooks",
		"displayName": "Galician Wikibooks",
		"baseUrl": "https://gl.wikibooks.org",
		"dir": "ltr",
		"language": "gl",
		"family": "wikibooks"
	},
	{
		"id": "glwikiquote",
		"displayName": "Galician Wikiquote",
		"baseUrl": "https://gl.wikiquote.org",
		"dir": "ltr",
		"language": "gl",
		"family": "wikiquote"
	},
	{
		"id": "glwikisource",
		"displayName": "Galician Wikisource",
		"baseUrl": "https://gl.wikisource.org",
		"dir": "ltr",
		"language": "gl",
		"family": "wikisource"
	},
	{
		"id": "glwiktionary",
		"displayName": "Galician Wiktionary",
		"baseUrl": "https://gl.wiktionary.org",
		"dir": "ltr",
		"language": "gl",
		"family": "wiktionary"
	},
	{
		"id": "gnwiki",
		"displayName": "Guarani Vikipetã",
		"baseUrl": "https://gn.wikipedia.org",
		"dir": "ltr",
		"language": "gn",
		"family": "wiki"
	},
	{
		"id": "gnwiktionary",
		"displayName": "Guarani Wiktionary",
		"baseUrl": "https://gn.wiktionary.org",
		"dir": "ltr",
		"language": "gn",
		"family": "wiktionary"
	},
	{
		"id": "gomwiki",
		"displayName": "Goan Konkani विकिपीडिया",
		"baseUrl": "https://gom.wikipedia.org",
		"dir": "ltr",
		"language": "gom",
		"family": "wiki"
	},
	{
		"id": "gomwiktionary",
		"displayName": "Goan Konkani Wiktionary",
		"baseUrl": "https://gom.wiktionary.org",
		"dir": "ltr",
		"language": "gom",
		"family": "wiktionary"
	},
	{
		"id": "gorwiki",
		"displayName": "Gorontalo Wikipedia",
		"baseUrl": "https://gor.wikipedia.org",
		"dir": "ltr",
		"language": "gor",
		"family": "wiki"
	},
	{
		"id": "gorwikiquote",
		"displayName": "Gorontalo Wikilumadu",
		"baseUrl": "https://gor.wikiquote.org",
		"dir": "ltr",
		"language": "gor",
		"family": "wikiquote"
	},
	{
		"id": "gorwiktionary",
		"displayName": "Gorontalo Wikikamus",
		"baseUrl": "https://gor.wiktionary.org",
		"dir": "ltr",
		"language": "gor",
		"family": "wiktionary"
	},
	{
		"id": "gotwiki",
		"displayName": "Gothic Wikipedia",
		"baseUrl": "https://got.wikipedia.org",
		"dir": "ltr",
		"language": "got",
		"family": "wiki"
	},
	{
		"id": "gpewiki",
		"displayName": "Ghanaian Pidgin Wikipedia",
		"baseUrl": "https://gpe.wikipedia.org",
		"dir": "ltr",
		"language": "gpe",
		"family": "wiki"
	},
	{
		"id": "gucwiki",
		"displayName": "Wayuu Wikipeetia",
		"baseUrl": "https://guc.wikipedia.org",
		"dir": "ltr",
		"language": "guc",
		"family": "wiki"
	},
	{
		"id": "gurwiki",
		"displayName": "Frafra Wikipiidiya",
		"baseUrl": "https://gur.wikipedia.org",
		"dir": "ltr",
		"language": "gur",
		"family": "wiki"
	},
	{
		"id": "guwiki",
		"displayName": "Gujarati વિકિપીડિયા",
		"baseUrl": "https://gu.wikipedia.org",
		"dir": "ltr",
		"language": "gu",
		"family": "wiki"
	},
	{
		"id": "guwikiquote",
		"displayName": "Gujarati વિકિસૂક્તિ",
		"baseUrl": "https://gu.wikiquote.org",
		"dir": "ltr",
		"language": "gu",
		"family": "wikiquote"
	},
	{
		"id": "guwikisource",
		"displayName": "Gujarati વિકિસ્રોત",
		"baseUrl": "https://gu.wikisource.org",
		"dir": "ltr",
		"language": "gu",
		"family": "wikisource"
	},
	{
		"id": "guwiktionary",
		"displayName": "Gujarati વિકિકોશ",
		"baseUrl": "https://gu.wiktionary.org",
		"dir": "ltr",
		"language": "gu",
		"family": "wiktionary"
	},
	{
		"id": "guwwiki",
		"displayName": "Gun Wikipedia",
		"baseUrl": "https://guw.wikipedia.org",
		"dir": "ltr",
		"language": "guw",
		"family": "wiki"
	},
	{
		"id": "guwwikiquote",
		"displayName": "Gun Wikiquote",
		"baseUrl": "https://guw.wikiquote.org",
		"dir": "ltr",
		"language": "guw",
		"family": "wikiquote"
	},
	{
		"id": "guwwiktionary",
		"displayName": "Gun Wiktionary",
		"baseUrl": "https://guw.wiktionary.org",
		"dir": "ltr",
		"language": "guw",
		"family": "wiktionary"
	},
	{
		"id": "gvwiki",
		"displayName": "Manx Wikipedia",
		"baseUrl": "https://gv.wikipedia.org",
		"dir": "ltr",
		"language": "gv",
		"family": "wiki"
	},
	{
		"id": "gvwiktionary",
		"displayName": "Manx Wiktionary",
		"baseUrl": "https://gv.wiktionary.org",
		"dir": "ltr",
		"language": "gv",
		"family": "wiktionary"
	},
	{
		"id": "hakwiki",
		"displayName": "Hakka Chinese Wikipedia",
		"baseUrl": "https://hak.wikipedia.org",
		"dir": "ltr",
		"language": "hak",
		"family": "wiki"
	},
	{
		"id": "hawiki",
		"displayName": "Hausa Wikipedia",
		"baseUrl": "https://ha.wikipedia.org",
		"dir": "ltr",
		"language": "ha",
		"family": "wiki"
	},
	{
		"id": "hawiktionary",
		"displayName": "Hausa Wiktionary",
		"baseUrl": "https://ha.wiktionary.org",
		"dir": "ltr",
		"language": "ha",
		"family": "wiktionary"
	},
	{
		"id": "hawwiki",
		"displayName": "Hawaiian Wikipedia",
		"baseUrl": "https://haw.wikipedia.org",
		"dir": "ltr",
		"language": "haw",
		"family": "wiki"
	},
	{
		"id": "hewiki",
		"displayName": "Hebrew ויקיפדיה",
		"baseUrl": "https://he.wikipedia.org",
		"dir": "rtl",
		"language": "he",
		"family": "wiki"
	},
	{
		"id": "hewikibooks",
		"displayName": "Hebrew ויקיספר",
		"baseUrl": "https://he.wikibooks.org",
		"dir": "rtl",
		"language": "he",
		"family": "wikibooks"
	},
	{
		"id": "hewikiquote",
		"displayName": "Hebrew ויקיציטוט",
		"baseUrl": "https://he.wikiquote.org",
		"dir": "rtl",
		"language": "he",
		"family": "wikiquote"
	},
	{
		"id": "hewikisource",
		"displayName": "Hebrew ויקיטקסט",
		"baseUrl": "https://he.wikisource.org",
		"dir": "rtl",
		"language": "he",
		"family": "wikisource"
	},
	{
		"id": "hewikivoyage",
		"displayName": "Hebrew ויקימסע",
		"baseUrl": "https://he.wikivoyage.org",
		"dir": "rtl",
		"language": "he",
		"family": "wikivoyage"
	},
	{
		"id": "hewiktionary",
		"displayName": "Hebrew ויקימילון",
		"baseUrl": "https://he.wiktionary.org",
		"dir": "rtl",
		"language": "he",
		"family": "wiktionary"
	},
	{
		"id": "hifwiki",
		"displayName": "Fiji Hindi Wikipedia",
		"baseUrl": "https://hif.wikipedia.org",
		"dir": "ltr",
		"language": "hif",
		"family": "wiki"
	},
	{
		"id": "hifwiktionary",
		"displayName": "Fiji Hindi Sabdkosh",
		"baseUrl": "https://hif.wiktionary.org",
		"dir": "ltr",
		"language": "hif",
		"family": "wiktionary"
	},
	{
		"id": "hiwiki",
		"displayName": "Hindi विकिपीडिया",
		"baseUrl": "https://hi.wikipedia.org",
		"dir": "ltr",
		"language": "hi",
		"family": "wiki"
	},
	{
		"id": "hiwikibooks",
		"displayName": "Hindi विकिपुस्तक",
		"baseUrl": "https://hi.wikibooks.org",
		"dir": "ltr",
		"language": "hi",
		"family": "wikibooks"
	},
	{
		"id": "hiwikiquote",
		"displayName": "Hindi विकिसूक्ति",
		"baseUrl": "https://hi.wikiquote.org",
		"dir": "ltr",
		"language": "hi",
		"family": "wikiquote"
	},
	{
		"id": "hiwikisource",
		"displayName": "Hindi विकिस्रोत",
		"baseUrl": "https://hi.wikisource.org",
		"dir": "ltr",
		"language": "hi",
		"family": "wikisource"
	},
	{
		"id": "hiwikiversity",
		"displayName": "Hindi विकिविश्वविद्यालय",
		"baseUrl": "https://hi.wikiversity.org",
		"dir": "ltr",
		"language": "hi",
		"family": "wikiversity"
	},
	{
		"id": "hiwikivoyage",
		"displayName": "Hindi विकियात्रा",
		"baseUrl": "https://hi.wikivoyage.org",
		"dir": "ltr",
		"language": "hi",
		"family": "wikivoyage"
	},
	{
		"id": "hiwiktionary",
		"displayName": "Hindi विक्षनरी",
		"baseUrl": "https://hi.wiktionary.org",
		"dir": "ltr",
		"language": "hi",
		"family": "wiktionary"
	},
	{
		"id": "hrwiki",
		"displayName": "Croatian Wikipedija",
		"baseUrl": "https://hr.wikipedia.org",
		"dir": "ltr",
		"language": "hr",
		"family": "wiki"
	},
	{
		"id": "hrwikibooks",
		"displayName": "Croatian Wikibooks",
		"baseUrl": "https://hr.wikibooks.org",
		"dir": "ltr",
		"language": "hr",
		"family": "wikibooks"
	},
	{
		"id": "hrwikiquote",
		"displayName": "Croatian Wikicitat",
		"baseUrl": "https://hr.wikiquote.org",
		"dir": "ltr",
		"language": "hr",
		"family": "wikiquote"
	},
	{
		"id": "hrwikisource",
		"displayName": "Croatian Wikizvor",
		"baseUrl": "https://hr.wikisource.org",
		"dir": "ltr",
		"language": "hr",
		"family": "wikisource"
	},
	{
		"id": "hrwiktionary",
		"displayName": "Croatian Wiktionary",
		"baseUrl": "https://hr.wiktionary.org",
		"dir": "ltr",
		"language": "hr",
		"family": "wiktionary"
	},
	{
		"id": "hsbwiki",
		"displayName": "Upper Sorbian Wikipedija",
		"baseUrl": "https://hsb.wikipedia.org",
		"dir": "ltr",
		"language": "hsb",
		"family": "wiki"
	},
	{
		"id": "hsbwiktionary",
		"displayName": "Upper Sorbian Wikisłownik",
		"baseUrl": "https://hsb.wiktionary.org",
		"dir": "ltr",
		"language": "hsb",
		"family": "wiktionary"
	},
	{
		"id": "htwiki",
		"displayName": "Haitian Creole Wikipedya",
		"baseUrl": "https://ht.wikipedia.org",
		"dir": "ltr",
		"language": "ht",
		"family": "wiki"
	},
	{
		"id": "huwiki",
		"displayName": "Hungarian Wikipédia",
		"baseUrl": "https://hu.wikipedia.org",
		"dir": "ltr",
		"language": "hu",
		"family": "wiki"
	},
	{
		"id": "huwikibooks",
		"displayName": "Hungarian Wikikönyvek",
		"baseUrl": "https://hu.wikibooks.org",
		"dir": "ltr",
		"language": "hu",
		"family": "wikibooks"
	},
	{
		"id": "huwikiquote",
		"displayName": "Hungarian Wikidézet",
		"baseUrl": "https://hu.wikiquote.org",
		"dir": "ltr",
		"language": "hu",
		"family": "wikiquote"
	},
	{
		"id": "huwikisource",
		"displayName": "Hungarian Wikiforrás",
		"baseUrl": "https://hu.wikisource.org",
		"dir": "ltr",
		"language": "hu",
		"family": "wikisource"
	},
	{
		"id": "huwiktionary",
		"displayName": "Hungarian Wikiszótár",
		"baseUrl": "https://hu.wiktionary.org",
		"dir": "ltr",
		"language": "hu",
		"family": "wiktionary"
	},
	{
		"id": "hywiki",
		"displayName": "Armenian Վիքիպեդիա",
		"baseUrl": "https://hy.wikipedia.org",
		"dir": "ltr",
		"language": "hy",
		"family": "wiki"
	},
	{
		"id": "hywikibooks",
		"displayName": "Armenian Վիքիգրքեր",
		"baseUrl": "https://hy.wikibooks.org",
		"dir": "ltr",
		"language": "hy",
		"family": "wikibooks"
	},
	{
		"id": "hywikiquote",
		"displayName": "Armenian Վիքիքաղվածք",
		"baseUrl": "https://hy.wikiquote.org",
		"dir": "ltr",
		"language": "hy",
		"family": "wikiquote"
	},
	{
		"id": "hywikisource",
		"displayName": "Armenian Վիքիդարան",
		"baseUrl": "https://hy.wikisource.org",
		"dir": "ltr",
		"language": "hy",
		"family": "wikisource"
	},
	{
		"id": "hywiktionary",
		"displayName": "Armenian Վիքիբառարան",
		"baseUrl": "https://hy.wiktionary.org",
		"dir": "ltr",
		"language": "hy",
		"family": "wiktionary"
	},
	{
		"id": "hywwiki",
		"displayName": "Western Armenian Ուիքիփետիա",
		"baseUrl": "https://hyw.wikipedia.org",
		"dir": "ltr",
		"language": "hyw",
		"family": "wiki"
	},
	{
		"id": "iawiki",
		"displayName": "Interlingua Wikipedia",
		"baseUrl": "https://ia.wikipedia.org",
		"dir": "ltr",
		"language": "ia",
		"family": "wiki"
	},
	{
		"id": "iawikibooks",
		"displayName": "Interlingua Wikibooks",
		"baseUrl": "https://ia.wikibooks.org",
		"dir": "ltr",
		"language": "ia",
		"family": "wikibooks"
	},
	{
		"id": "iawiktionary",
		"displayName": "Interlingua Wiktionario",
		"baseUrl": "https://ia.wiktionary.org",
		"dir": "ltr",
		"language": "ia",
		"family": "wiktionary"
	},
	{
		"id": "ibawiki",
		"displayName": "Iban Wikipedia",
		"baseUrl": "https://iba.wikipedia.org",
		"dir": "ltr",
		"language": "iba",
		"family": "wiki"
	},
	{
		"id": "idwiki",
		"displayName": "Indonesian Wikipedia",
		"baseUrl": "https://id.wikipedia.org",
		"dir": "ltr",
		"language": "id",
		"family": "wiki"
	},
	{
		"id": "idwikibooks",
		"displayName": "Indonesian Wikibuku",
		"baseUrl": "https://id.wikibooks.org",
		"dir": "ltr",
		"language": "id",
		"family": "wikibooks"
	},
	{
		"id": "idwikiquote",
		"displayName": "Indonesian Wikikutip",
		"baseUrl": "https://id.wikiquote.org",
		"dir": "ltr",
		"language": "id",
		"family": "wikiquote"
	},
	{
		"id": "idwikisource",
		"displayName": "Indonesian Wikisumber",
		"baseUrl": "https://id.wikisource.org",
		"dir": "ltr",
		"language": "id",
		"family": "wikisource"
	},
	{
		"id": "idwikivoyage",
		"displayName": "Indonesian Wikiwisata",
		"baseUrl": "https://id.wikivoyage.org",
		"dir": "ltr",
		"language": "id",
		"family": "wikivoyage"
	},
	{
		"id": "idwiktionary",
		"displayName": "Indonesian Wikikamus",
		"baseUrl": "https://id.wiktionary.org",
		"dir": "ltr",
		"language": "id",
		"family": "wiktionary"
	},
	{
		"id": "iewiki",
		"displayName": "Interlingue Wikipedia",
		"baseUrl": "https://ie.wikipedia.org",
		"dir": "ltr",
		"language": "ie",
		"family": "wiki"
	},
	{
		"id": "iewiktionary",
		"displayName": "Interlingue Wiktionary",
		"baseUrl": "https://ie.wiktionary.org",
		"dir": "ltr",
		"language": "ie",
		"family": "wiktionary"
	},
	{
		"id": "iglwiki",
		"displayName": "Igala Wikipídiya",
		"baseUrl": "https://igl.wikipedia.org",
		"dir": "ltr",
		"language": "igl",
		"family": "wiki"
	},
	{
		"id": "igwiki",
		"displayName": "Igbo Wikipedia",
		"baseUrl": "https://ig.wikipedia.org",
		"dir": "ltr",
		"language": "ig",
		"family": "wiki"
	},
	{
		"id": "igwikiquote",
		"displayName": "Igbo Wikiquote",
		"baseUrl": "https://ig.wikiquote.org",
		"dir": "ltr",
		"language": "ig",
		"family": "wikiquote"
	},
	{
		"id": "igwiktionary",
		"displayName": "Igbo Wiktionary",
		"baseUrl": "https://ig.wiktionary.org",
		"dir": "ltr",
		"language": "ig",
		"family": "wiktionary"
	},
	{
		"id": "ikwiki",
		"displayName": "Inupiaq Wikipedia",
		"baseUrl": "https://ik.wikipedia.org",
		"dir": "ltr",
		"language": "ik",
		"family": "wiki"
	},
	{
		"id": "ilowiki",
		"displayName": "Iloko Wikipedia",
		"baseUrl": "https://ilo.wikipedia.org",
		"dir": "ltr",
		"language": "ilo",
		"family": "wiki"
	},
	{
		"id": "incubatorwiki",
		"displayName": "Wikimedia Incubator",
		"baseUrl": "https://incubator.wikimedia.org",
		"dir": "ltr",
		"language": "en",
		"family": "incubator"
	},
	{
		"id": "inhwiki",
		"displayName": "Ingush Википеди",
		"baseUrl": "https://inh.wikipedia.org",
		"dir": "ltr",
		"language": "inh",
		"family": "wiki"
	},
	{
		"id": "iowiki",
		"displayName": "Ido Wikipedio",
		"baseUrl": "https://io.wikipedia.org",
		"dir": "ltr",
		"language": "io",
		"family": "wiki"
	},
	{
		"id": "iowiktionary",
		"displayName": "Ido Wikivortaro",
		"baseUrl": "https://io.wiktionary.org",
		"dir": "ltr",
		"language": "io",
		"family": "wiktionary"
	},
	{
		"id": "isvwiki",
		"displayName": "Interslavic Vikipedija",
		"baseUrl": "https://isv.wikipedia.org",
		"dir": "ltr",
		"language": "isv",
		"family": "wiki"
	},
	{
		"id": "iswiki",
		"displayName": "Icelandic Wikipedia",
		"baseUrl": "https://is.wikipedia.org",
		"dir": "ltr",
		"language": "is",
		"family": "wiki"
	},
	{
		"id": "iswikibooks",
		"displayName": "Icelandic Wikibækur",
		"baseUrl": "https://is.wikibooks.org",
		"dir": "ltr",
		"language": "is",
		"family": "wikibooks"
	},
	{
		"id": "iswikiquote",
		"displayName": "Icelandic Wikivitnun",
		"baseUrl": "https://is.wikiquote.org",
		"dir": "ltr",
		"language": "is",
		"family": "wikiquote"
	},
	{
		"id": "iswikisource",
		"displayName": "Icelandic Wikiheimild",
		"baseUrl": "https://is.wikisource.org",
		"dir": "ltr",
		"language": "is",
		"family": "wikisource"
	},
	{
		"id": "iswiktionary",
		"displayName": "Icelandic Wikiorðabók",
		"baseUrl": "https://is.wiktionary.org",
		"dir": "ltr",
		"language": "is",
		"family": "wiktionary"
	},
	{
		"id": "itwiki",
		"displayName": "Italian Wikipedia",
		"baseUrl": "https://it.wikipedia.org",
		"dir": "ltr",
		"language": "it",
		"family": "wiki"
	},
	{
		"id": "itwikibooks",
		"displayName": "Italian Wikibooks",
		"baseUrl": "https://it.wikibooks.org",
		"dir": "ltr",
		"language": "it",
		"family": "wikibooks"
	},
	{
		"id": "itwikiquote",
		"displayName": "Italian Wikiquote",
		"baseUrl": "https://it.wikiquote.org",
		"dir": "ltr",
		"language": "it",
		"family": "wikiquote"
	},
	{
		"id": "itwikisource",
		"displayName": "Italian Wikisource",
		"baseUrl": "https://it.wikisource.org",
		"dir": "ltr",
		"language": "it",
		"family": "wikisource"
	},
	{
		"id": "itwikiversity",
		"displayName": "Italian Wikiversità",
		"baseUrl": "https://it.wikiversity.org",
		"dir": "ltr",
		"language": "it",
		"family": "wikiversity"
	},
	{
		"id": "itwikivoyage",
		"displayName": "Italian Wikivoyage",
		"baseUrl": "https://it.wikivoyage.org",
		"dir": "ltr",
		"language": "it",
		"family": "wikivoyage"
	},
	{
		"id": "itwiktionary",
		"displayName": "Italian Wikizionario",
		"baseUrl": "https://it.wiktionary.org",
		"dir": "ltr",
		"language": "it",
		"family": "wiktionary"
	},
	{
		"id": "iuwiki",
		"displayName": "Inuktitut ᐅᐃᑭᐱᑎᐊ",
		"baseUrl": "https://iu.wikipedia.org",
		"dir": "ltr",
		"language": "iu",
		"family": "wiki"
	},
	{
		"id": "iuwiktionary",
		"displayName": "Inuktitut Wiktionary",
		"baseUrl": "https://iu.wiktionary.org",
		"dir": "ltr",
		"language": "iu",
		"family": "wiktionary"
	},
	{
		"id": "jamwiki",
		"displayName": "Jamaican Creole English Wikipidia",
		"baseUrl": "https://jam.wikipedia.org",
		"dir": "ltr",
		"language": "jam",
		"family": "wiki"
	},
	{
		"id": "jawiki",
		"displayName": "Japanese Wikipedia",
		"baseUrl": "https://ja.wikipedia.org",
		"dir": "ltr",
		"language": "ja",
		"family": "wiki"
	},
	{
		"id": "jawikibooks",
		"displayName": "Japanese Wikibooks",
		"baseUrl": "https://ja.wikibooks.org",
		"dir": "ltr",
		"language": "ja",
		"family": "wikibooks"
	},
	{
		"id": "jawikiquote",
		"displayName": "Japanese Wikiquote",
		"baseUrl": "https://ja.wikiquote.org",
		"dir": "ltr",
		"language": "ja",
		"family": "wikiquote"
	},
	{
		"id": "jawikisource",
		"displayName": "Japanese Wikisource",
		"baseUrl": "https://ja.wikisource.org",
		"dir": "ltr",
		"language": "ja",
		"family": "wikisource"
	},
	{
		"id": "jawikiversity",
		"displayName": "Japanese ウィキバーシティ",
		"baseUrl": "https://ja.wikiversity.org",
		"dir": "ltr",
		"language": "ja",
		"family": "wikiversity"
	},
	{
		"id": "jawikivoyage",
		"displayName": "Japanese ウィキボヤージュ",
		"baseUrl": "https://ja.wikivoyage.org",
		"dir": "ltr",
		"language": "ja",
		"family": "wikivoyage"
	},
	{
		"id": "jawiktionary",
		"displayName": "Japanese Wiktionary",
		"baseUrl": "https://ja.wiktionary.org",
		"dir": "ltr",
		"language": "ja",
		"family": "wiktionary"
	},
	{
		"id": "jbowiki",
		"displayName": "Lojban Wikipedia",
		"baseUrl": "https://jbo.wikipedia.org",
		"dir": "ltr",
		"language": "jbo",
		"family": "wiki"
	},
	{
		"id": "jbowiktionary",
		"displayName": "Lojban Wiktionary",
		"baseUrl": "https://jbo.wiktionary.org",
		"dir": "ltr",
		"language": "jbo",
		"family": "wiktionary"
	},
	{
		"id": "jvwiki",
		"displayName": "Javanese Wikipédia",
		"baseUrl": "https://jv.wikipedia.org",
		"dir": "ltr",
		"language": "jv",
		"family": "wiki"
	},
	{
		"id": "jvwikisource",
		"displayName": "Javanese Wikisumber",
		"baseUrl": "https://jv.wikisource.org",
		"dir": "ltr",
		"language": "jv",
		"family": "wikisource"
	},
	{
		"id": "jvwiktionary",
		"displayName": "Javanese Wikisastra",
		"baseUrl": "https://jv.wiktionary.org",
		"dir": "ltr",
		"language": "jv",
		"family": "wiktionary"
	},
	{
		"id": "kaawiki",
		"displayName": "Kara-Kalpak Wikipedia",
		"baseUrl": "https://kaa.wikipedia.org",
		"dir": "ltr",
		"language": "kaa",
		"family": "wiki"
	},
	{
		"id": "kaawiktionary",
		"displayName": "Kara-Kalpak Wikisózlik",
		"baseUrl": "https://kaa.wiktionary.org",
		"dir": "ltr",
		"language": "kaa",
		"family": "wiktionary"
	},
	{
		"id": "kabwiki",
		"displayName": "Kabyle Wikipedia",
		"baseUrl": "https://kab.wikipedia.org",
		"dir": "ltr",
		"language": "kab",
		"family": "wiki"
	},
	{
		"id": "kaiwiki",
		"displayName": "Karekare Wikipèdiya",
		"baseUrl": "https://kai.wikipedia.org",
		"dir": "ltr",
		"language": "kai",
		"family": "wiki"
	},
	{
		"id": "kajwiki",
		"displayName": "Jju Wikipedia",
		"baseUrl": "https://kaj.wikipedia.org",
		"dir": "ltr",
		"language": "kaj",
		"family": "wiki"
	},
	{
		"id": "kawiki",
		"displayName": "Georgian ვიკიპედია",
		"baseUrl": "https://ka.wikipedia.org",
		"dir": "ltr",
		"language": "ka",
		"family": "wiki"
	},
	{
		"id": "kawikibooks",
		"displayName": "Georgian ვიკიწიგნები",
		"baseUrl": "https://ka.wikibooks.org",
		"dir": "ltr",
		"language": "ka",
		"family": "wikibooks"
	},
	{
		"id": "kawikiquote",
		"displayName": "Georgian ვიკიციტატა",
		"baseUrl": "https://ka.wikiquote.org",
		"dir": "ltr",
		"language": "ka",
		"family": "wikiquote"
	},
	{
		"id": "kawikisource",
		"displayName": "Georgian ვიკიწყარო",
		"baseUrl": "https://ka.wikisource.org",
		"dir": "ltr",
		"language": "ka",
		"family": "wikisource"
	},
	{
		"id": "kawiktionary",
		"displayName": "Georgian ვიქსიკონი",
		"baseUrl": "https://ka.wiktionary.org",
		"dir": "ltr",
		"language": "ka",
		"family": "wiktionary"
	},
	{
		"id": "kbdwiki",
		"displayName": "Kabardian Уикипедиэ",
		"baseUrl": "https://kbd.wikipedia.org",
		"dir": "ltr",
		"language": "kbd",
		"family": "wiki"
	},
	{
		"id": "kbdwiktionary",
		"displayName": "Kabardian Википсалъалъэ",
		"baseUrl": "https://kbd.wiktionary.org",
		"dir": "ltr",
		"language": "kbd",
		"family": "wiktionary"
	},
	{
		"id": "kbpwiki",
		"displayName": "Kabiye Wikipediya",
		"baseUrl": "https://kbp.wikipedia.org",
		"dir": "ltr",
		"language": "kbp",
		"family": "wiki"
	},
	{
		"id": "kcgwiki",
		"displayName": "Tyap Wikipedia",
		"baseUrl": "https://kcg.wikipedia.org",
		"dir": "ltr",
		"language": "kcg",
		"family": "wiki"
	},
	{
		"id": "kcgwiktionary",
		"displayName": "Tyap Swánga̱lyiatwuki",
		"baseUrl": "https://kcg.wiktionary.org",
		"dir": "ltr",
		"language": "kcg",
		"family": "wiktionary"
	},
	{
		"id": "kgewiki",
		"displayName": "Komering Wikipidiya",
		"baseUrl": "https://kge.wikipedia.org",
		"dir": "ltr",
		"language": "kge",
		"family": "wiki"
	},
	{
		"id": "kgwiki",
		"displayName": "Kongo Wikipedia",
		"baseUrl": "https://kg.wikipedia.org",
		"dir": "ltr",
		"language": "kg",
		"family": "wiki"
	},
	{
		"id": "kiwiki",
		"displayName": "Kikuyu Wikipedia",
		"baseUrl": "https://ki.wikipedia.org",
		"dir": "ltr",
		"language": "ki",
		"family": "wiki"
	},
	{
		"id": "kkwiki",
		"displayName": "Kazakh Уикипедия",
		"baseUrl": "https://kk.wikipedia.org",
		"dir": "ltr",
		"language": "kk",
		"family": "wiki"
	},
	{
		"id": "kkwikibooks",
		"displayName": "Kazakh Уикикітап",
		"baseUrl": "https://kk.wikibooks.org",
		"dir": "ltr",
		"language": "kk",
		"family": "wikibooks"
	},
	{
		"id": "kkwiktionary",
		"displayName": "Kazakh Уикисөздік",
		"baseUrl": "https://kk.wiktionary.org",
		"dir": "ltr",
		"language": "kk",
		"family": "wiktionary"
	},
	{
		"id": "klwiktionary",
		"displayName": "Kalaallisut Wiktionary",
		"baseUrl": "https://kl.wiktionary.org",
		"dir": "ltr",
		"language": "kl",
		"family": "wiktionary"
	},
	{
		"id": "kmwiki",
		"displayName": "Khmer វិគីភីឌា",
		"baseUrl": "https://km.wikipedia.org",
		"dir": "ltr",
		"language": "km",
		"family": "wiki"
	},
	{
		"id": "kmwikibooks",
		"displayName": "Khmer Wikibooks",
		"baseUrl": "https://km.wikibooks.org",
		"dir": "ltr",
		"language": "km",
		"family": "wikibooks"
	},
	{
		"id": "kmwiktionary",
		"displayName": "Khmer Wiktionary",
		"baseUrl": "https://km.wiktionary.org",
		"dir": "ltr",
		"language": "km",
		"family": "wiktionary"
	},
	{
		"id": "kncwiki",
		"displayName": "Central Kanuri Wikipedia",
		"baseUrl": "https://knc.wikipedia.org",
		"dir": "ltr",
		"language": "knc",
		"family": "wiki"
	},
	{
		"id": "knwiki",
		"displayName": "Kannada ವಿಕಿಪೀಡಿಯ",
		"baseUrl": "https://kn.wikipedia.org",
		"dir": "ltr",
		"language": "kn",
		"family": "wiki"
	},
	{
		"id": "knwikiquote",
		"displayName": "Kannada ವಿಕಿಕೋಟ್",
		"baseUrl": "https://kn.wikiquote.org",
		"dir": "ltr",
		"language": "kn",
		"family": "wikiquote"
	},
	{
		"id": "knwikisource",
		"displayName": "Kannada ವಿಕಿಸೋರ್ಸ್",
		"baseUrl": "https://kn.wikisource.org",
		"dir": "ltr",
		"language": "kn",
		"family": "wikisource"
	},
	{
		"id": "knwiktionary",
		"displayName": "Kannada ವಿಕ್ಷನರಿ",
		"baseUrl": "https://kn.wiktionary.org",
		"dir": "ltr",
		"language": "kn",
		"family": "wiktionary"
	},
	{
		"id": "koiwiki",
		"displayName": "Komi-Permyak Википедия",
		"baseUrl": "https://koi.wikipedia.org",
		"dir": "ltr",
		"language": "koi",
		"family": "wiki"
	},
	{
		"id": "kowiki",
		"displayName": "Korean 위키백과",
		"baseUrl": "https://ko.wikipedia.org",
		"dir": "ltr",
		"language": "ko",
		"family": "wiki"
	},
	{
		"id": "kowikibooks",
		"displayName": "Korean 위키책",
		"baseUrl": "https://ko.wikibooks.org",
		"dir": "ltr",
		"language": "ko",
		"family": "wikibooks"
	},
	{
		"id": "kowikiquote",
		"displayName": "Korean 위키인용집",
		"baseUrl": "https://ko.wikiquote.org",
		"dir": "ltr",
		"language": "ko",
		"family": "wikiquote"
	},
	{
		"id": "kowikisource",
		"displayName": "Korean 위키문헌",
		"baseUrl": "https://ko.wikisource.org",
		"dir": "ltr",
		"language": "ko",
		"family": "wikisource"
	},
	{
		"id": "kowikiversity",
		"displayName": "Korean 위키배움터",
		"baseUrl": "https://ko.wikiversity.org",
		"dir": "ltr",
		"language": "ko",
		"family": "wikiversity"
	},
	{
		"id": "kowiktionary",
		"displayName": "Korean 위키낱말사전",
		"baseUrl": "https://ko.wiktionary.org",
		"dir": "ltr",
		"language": "ko",
		"family": "wiktionary"
	},
	{
		"id": "krcwiki",
		"displayName": "Karachay-Balkar Википедия",
		"baseUrl": "https://krc.wikipedia.org",
		"dir": "ltr",
		"language": "krc",
		"family": "wiki"
	},
	{
		"id": "kshwiki",
		"displayName": "Colognian Wikipedia",
		"baseUrl": "https://ksh.wikipedia.org",
		"dir": "ltr",
		"language": "ksh",
		"family": "wiki"
	},
	{
		"id": "kswiki",
		"displayName": "Kashmiri وِکیٖپیٖڈیا",
		"baseUrl": "https://ks.wikipedia.org",
		"dir": "rtl",
		"language": "ks",
		"family": "wiki"
	},
	{
		"id": "kswiktionary",
		"displayName": "Kashmiri وِکیٖلۄغَتھ",
		"baseUrl": "https://ks.wiktionary.org",
		"dir": "rtl",
		"language": "ks",
		"family": "wiktionary"
	},
	{
		"id": "kuswiki",
		"displayName": "Kusaal Wikipiidia",
		"baseUrl": "https://kus.wikipedia.org",
		"dir": "ltr",
		"language": "kus",
		"family": "wiki"
	},
	{
		"id": "kuwiki",
		"displayName": "Kurdish Wîkîpediya",
		"baseUrl": "https://ku.wikipedia.org",
		"dir": "ltr",
		"language": "ku",
		"family": "wiki"
	},
	{
		"id": "kuwikibooks",
		"displayName": "Kurdish Wikibooks",
		"baseUrl": "https://ku.wikibooks.org",
		"dir": "ltr",
		"language": "ku",
		"family": "wikibooks"
	},
	{
		"id": "kuwikiquote",
		"displayName": "Kurdish Wikiquote",
		"baseUrl": "https://ku.wikiquote.org",
		"dir": "ltr",
		"language": "ku",
		"family": "wikiquote"
	},
	{
		"id": "kuwiktionary",
		"displayName": "Kurdish Wîkîferheng",
		"baseUrl": "https://ku.wiktionary.org",
		"dir": "ltr",
		"language": "ku",
		"family": "wiktionary"
	},
	{
		"id": "kvwiki",
		"displayName": "Komi Wikipedia",
		"baseUrl": "https://kv.wikipedia.org",
		"dir": "ltr",
		"language": "kv",
		"family": "wiki"
	},
	{
		"id": "kwwiki",
		"displayName": "Cornish Wikipedia",
		"baseUrl": "https://kw.wikipedia.org",
		"dir": "ltr",
		"language": "kw",
		"family": "wiki"
	},
	{
		"id": "kwwiktionary",
		"displayName": "Cornish Wiktionary",
		"baseUrl": "https://kw.wiktionary.org",
		"dir": "ltr",
		"language": "kw",
		"family": "wiktionary"
	},
	{
		"id": "kywiki",
		"displayName": "Kyrgyz Википедия",
		"baseUrl": "https://ky.wikipedia.org",
		"dir": "ltr",
		"language": "ky",
		"family": "wiki"
	},
	{
		"id": "kywikiquote",
		"displayName": "Kyrgyz Wikiquote",
		"baseUrl": "https://ky.wikiquote.org",
		"dir": "ltr",
		"language": "ky",
		"family": "wikiquote"
	},
	{
		"id": "kywiktionary",
		"displayName": "Kyrgyz Wiktionary",
		"baseUrl": "https://ky.wiktionary.org",
		"dir": "ltr",
		"language": "ky",
		"family": "wiktionary"
	},
	{
		"id": "labswiki",
		"displayName": "Wikipedia",
		"baseUrl": "https://wikitech.wikimedia.org",
		"dir": "ltr",
		"language": "labs",
		"family": "labs"
	},
	{
		"id": "ladwiki",
		"displayName": "Ladino Vikipedya",
		"baseUrl": "https://lad.wikipedia.org",
		"dir": "ltr",
		"language": "lad",
		"family": "wiki"
	},
	{
		"id": "lawiki",
		"displayName": "Latin Vicipaedia",
		"baseUrl": "https://la.wikipedia.org",
		"dir": "ltr",
		"language": "la",
		"family": "wiki"
	},
	{
		"id": "lawikibooks",
		"displayName": "Latin Vicilibri",
		"baseUrl": "https://la.wikibooks.org",
		"dir": "ltr",
		"language": "la",
		"family": "wikibooks"
	},
	{
		"id": "lawikiquote",
		"displayName": "Latin Vicicitatio",
		"baseUrl": "https://la.wikiquote.org",
		"dir": "ltr",
		"language": "la",
		"family": "wikiquote"
	},
	{
		"id": "lawikisource",
		"displayName": "Latin Wikisource",
		"baseUrl": "https://la.wikisource.org",
		"dir": "ltr",
		"language": "la",
		"family": "wikisource"
	},
	{
		"id": "lawiktionary",
		"displayName": "Latin Victionarium",
		"baseUrl": "https://la.wiktionary.org",
		"dir": "ltr",
		"language": "la",
		"family": "wiktionary"
	},
	{
		"id": "lbewiki",
		"displayName": "Lak Википедия",
		"baseUrl": "https://lbe.wikipedia.org",
		"dir": "ltr",
		"language": "lbe",
		"family": "wiki"
	},
	{
		"id": "lbwiki",
		"displayName": "Luxembourgish Wikipedia",
		"baseUrl": "https://lb.wikipedia.org",
		"dir": "ltr",
		"language": "lb",
		"family": "wiki"
	},
	{
		"id": "lbwiktionary",
		"displayName": "Luxembourgish Wiktionnaire",
		"baseUrl": "https://lb.wiktionary.org",
		"dir": "ltr",
		"language": "lb",
		"family": "wiktionary"
	},
	{
		"id": "lezwiki",
		"displayName": "Lezghian Википедия",
		"baseUrl": "https://lez.wikipedia.org",
		"dir": "ltr",
		"language": "lez",
		"family": "wiki"
	},
	{
		"id": "lfnwiki",
		"displayName": "Lingua Franca Nova Vicipedia",
		"baseUrl": "https://lfn.wikipedia.org",
		"dir": "ltr",
		"language": "lfn",
		"family": "wiki"
	},
	{
		"id": "lgwiki",
		"displayName": "Ganda Wikipedia",
		"baseUrl": "https://lg.wikipedia.org",
		"dir": "ltr",
		"language": "lg",
		"family": "wiki"
	},
	{
		"id": "lijwiki",
		"displayName": "Ligurian Wikipedia",
		"baseUrl": "https://lij.wikipedia.org",
		"dir": "ltr",
		"language": "lij",
		"family": "wiki"
	},
	{
		"id": "lijwikisource",
		"displayName": "Ligurian Wikivivàgna",
		"baseUrl": "https://lij.wikisource.org",
		"dir": "ltr",
		"language": "lij",
		"family": "wikisource"
	},
	{
		"id": "liwiki",
		"displayName": "Limburgish Wikipedia",
		"baseUrl": "https://li.wikipedia.org",
		"dir": "ltr",
		"language": "li",
		"family": "wiki"
	},
	{
		"id": "liwikibooks",
		"displayName": "Limburgish Wikibeuk",
		"baseUrl": "https://li.wikibooks.org",
		"dir": "ltr",
		"language": "li",
		"family": "wikibooks"
	},
	{
		"id": "liwikiquote",
		"displayName": "Limburgish Wikiquote",
		"baseUrl": "https://li.wikiquote.org",
		"dir": "ltr",
		"language": "li",
		"family": "wikiquote"
	},
	{
		"id": "liwikisource",
		"displayName": "Limburgish Wikibrónne",
		"baseUrl": "https://li.wikisource.org",
		"dir": "ltr",
		"language": "li",
		"family": "wikisource"
	},
	{
		"id": "liwiktionary",
		"displayName": "Limburgish Wiktionary",
		"baseUrl": "https://li.wiktionary.org",
		"dir": "ltr",
		"language": "li",
		"family": "wiktionary"
	},
	{
		"id": "lldwiki",
		"displayName": "Ladin Wikipedia",
		"baseUrl": "https://lld.wikipedia.org",
		"dir": "ltr",
		"language": "lld",
		"family": "wiki"
	},
	{
		"id": "lmowiki",
		"displayName": "Lombard Wikipedia",
		"baseUrl": "https://lmo.wikipedia.org",
		"dir": "ltr",
		"language": "lmo",
		"family": "wiki"
	},
	{
		"id": "lmowiktionary",
		"displayName": "Lombard Wiktionary",
		"baseUrl": "https://lmo.wiktionary.org",
		"dir": "ltr",
		"language": "lmo",
		"family": "wiktionary"
	},
	{
		"id": "lnwiki",
		"displayName": "Lingala Wikipedia",
		"baseUrl": "https://ln.wikipedia.org",
		"dir": "ltr",
		"language": "ln",
		"family": "wiki"
	},
	{
		"id": "lnwiktionary",
		"displayName": "Lingala Wiktionary",
		"baseUrl": "https://ln.wiktionary.org",
		"dir": "ltr",
		"language": "ln",
		"family": "wiktionary"
	},
	{
		"id": "loginwiki",
		"displayName": "Wikimedia Login Wiki",
		"baseUrl": "https://login.wikimedia.org",
		"dir": "ltr",
		"language": "login",
		"family": "login"
	},
	{
		"id": "lowiki",
		"displayName": "Lao ວິກິພີເດຍ",
		"baseUrl": "https://lo.wikipedia.org",
		"dir": "ltr",
		"language": "lo",
		"family": "wiki"
	},
	{
		"id": "lowiktionary",
		"displayName": "Lao Wiktionary",
		"baseUrl": "https://lo.wiktionary.org",
		"dir": "ltr",
		"language": "lo",
		"family": "wiktionary"
	},
	{
		"id": "ltgwiki",
		"displayName": "Latgalian Vikipedeja",
		"baseUrl": "https://ltg.wikipedia.org",
		"dir": "ltr",
		"language": "ltg",
		"family": "wiki"
	},
	{
		"id": "ltwiki",
		"displayName": "Lithuanian Vikipedija",
		"baseUrl": "https://lt.wikipedia.org",
		"dir": "ltr",
		"language": "lt",
		"family": "wiki"
	},
	{
		"id": "ltwikibooks",
		"displayName": "Lithuanian Wikibooks",
		"baseUrl": "https://lt.wikibooks.org",
		"dir": "ltr",
		"language": "lt",
		"family": "wikibooks"
	},
	{
		"id": "ltwikiquote",
		"displayName": "Lithuanian Wikiquote",
		"baseUrl": "https://lt.wikiquote.org",
		"dir": "ltr",
		"language": "lt",
		"family": "wikiquote"
	},
	{
		"id": "ltwikisource",
		"displayName": "Lithuanian Vikišaltiniai",
		"baseUrl": "https://lt.wikisource.org",
		"dir": "ltr",
		"language": "lt",
		"family": "wikisource"
	},
	{
		"id": "ltwiktionary",
		"displayName": "Lithuanian Vikižodynas",
		"baseUrl": "https://lt.wiktionary.org",
		"dir": "ltr",
		"language": "lt",
		"family": "wiktionary"
	},
	{
		"id": "lvwiki",
		"displayName": "Latvian Vikipēdija",
		"baseUrl": "https://lv.wikipedia.org",
		"dir": "ltr",
		"language": "lv",
		"family": "wiki"
	},
	{
		"id": "lvwiktionary",
		"displayName": "Latvian Wiktionary",
		"baseUrl": "https://lv.wiktionary.org",
		"dir": "ltr",
		"language": "lv",
		"family": "wiktionary"
	},
	{
		"id": "madwiki",
		"displayName": "Madurese Wikipedia",
		"baseUrl": "https://mad.wikipedia.org",
		"dir": "ltr",
		"language": "mad",
		"family": "wiki"
	},
	{
		"id": "madwikisource",
		"displayName": "Madurese Wikigherbhung",
		"baseUrl": "https://mad.wikisource.org",
		"dir": "ltr",
		"language": "mad",
		"family": "wikisource"
	},
	{
		"id": "madwiktionary",
		"displayName": "Madurese Wikikamus",
		"baseUrl": "https://mad.wiktionary.org",
		"dir": "ltr",
		"language": "mad",
		"family": "wiktionary"
	},
	{
		"id": "magwiki",
		"displayName": "Magahi विकिपीडिया",
		"baseUrl": "https://mag.wikipedia.org",
		"dir": "ltr",
		"language": "mag",
		"family": "wiki"
	},
	{
		"id": "maiwiki",
		"displayName": "Maithili विकिपिडिया",
		"baseUrl": "https://mai.wikipedia.org",
		"dir": "ltr",
		"language": "mai",
		"family": "wiki"
	},
	{
		"id": "map_bmswiki",
		"displayName": "Banyumasan Wikipedia",
		"baseUrl": "https://map-bms.wikipedia.org",
		"dir": "ltr",
		"language": "map-bms",
		"family": "wiki"
	},
	{
		"id": "mdfwiki",
		"displayName": "Moksha Википедиесь",
		"baseUrl": "https://mdf.wikipedia.org",
		"dir": "ltr",
		"language": "mdf",
		"family": "wiki"
	},
	{
		"id": "mediawikiwiki",
		"displayName": "MediaWiki",
		"baseUrl": "https://www.mediawiki.org",
		"dir": "ltr",
		"language": "mediawiki",
		"family": "mediawiki"
	},
	{
		"id": "metawiki",
		"displayName": "Meta-Wiki",
		"baseUrl": "https://meta.wikimedia.org",
		"dir": "ltr",
		"language": "meta",
		"family": "meta"
	},
	{
		"id": "mgwiki",
		"displayName": "Malagasy Wikipedia",
		"baseUrl": "https://mg.wikipedia.org",
		"dir": "ltr",
		"language": "mg",
		"family": "wiki"
	},
	{
		"id": "mgwikibooks",
		"displayName": "Malagasy Wikibooks",
		"baseUrl": "https://mg.wikibooks.org",
		"dir": "ltr",
		"language": "mg",
		"family": "wikibooks"
	},
	{
		"id": "mgwiktionary",
		"displayName": "Malagasy Wiktionary",
		"baseUrl": "https://mg.wiktionary.org",
		"dir": "ltr",
		"language": "mg",
		"family": "wiktionary"
	},
	{
		"id": "mhrwiki",
		"displayName": "Eastern Mari Википедий",
		"baseUrl": "https://mhr.wikipedia.org",
		"dir": "ltr",
		"language": "mhr",
		"family": "wiki"
	},
	{
		"id": "minwiki",
		"displayName": "Minangkabau Wikipedia",
		"baseUrl": "https://min.wikipedia.org",
		"dir": "ltr",
		"language": "min",
		"family": "wiki"
	},
	{
		"id": "minwikibooks",
		"displayName": "Minangkabau Wikibuku",
		"baseUrl": "https://min.wikibooks.org",
		"dir": "ltr",
		"language": "min",
		"family": "wikibooks"
	},
	{
		"id": "minwikiquote",
		"displayName": "Minangkabau Wikipituah",
		"baseUrl": "https://min.wikiquote.org",
		"dir": "ltr",
		"language": "min",
		"family": "wikiquote"
	},
	{
		"id": "minwikisource",
		"displayName": "Minangkabau Wikibasurek",
		"baseUrl": "https://min.wikisource.org",
		"dir": "ltr",
		"language": "min",
		"family": "wikisource"
	},
	{
		"id": "minwiktionary",
		"displayName": "Minangkabau Wikikato",
		"baseUrl": "https://min.wiktionary.org",
		"dir": "ltr",
		"language": "min",
		"family": "wiktionary"
	},
	{
		"id": "miwiki",
		"displayName": "Māori Wikipedia",
		"baseUrl": "https://mi.wikipedia.org",
		"dir": "ltr",
		"language": "mi",
		"family": "wiki"
	},
	{
		"id": "miwiktionary",
		"displayName": "Māori Wiktionary",
		"baseUrl": "https://mi.wiktionary.org",
		"dir": "ltr",
		"language": "mi",
		"family": "wiktionary"
	},
	{
		"id": "mkwiki",
		"displayName": "Macedonian Википедија",
		"baseUrl": "https://mk.wikipedia.org",
		"dir": "ltr",
		"language": "mk",
		"family": "wiki"
	},
	{
		"id": "mkwikibooks",
		"displayName": "Macedonian Викикниги",
		"baseUrl": "https://mk.wikibooks.org",
		"dir": "ltr",
		"language": "mk",
		"family": "wikibooks"
	},
	{
		"id": "mkwikimedia",
		"displayName": "Викимедија Македонија",
		"baseUrl": "https://mk.wikimedia.org",
		"dir": "ltr",
		"language": "mk",
		"family": "mkwikimedia"
	},
	{
		"id": "mkwikisource",
		"displayName": "Macedonian Wikisource",
		"baseUrl": "https://mk.wikisource.org",
		"dir": "ltr",
		"language": "mk",
		"family": "wikisource"
	},
	{
		"id": "mkwiktionary",
		"displayName": "Macedonian Викиречник",
		"baseUrl": "https://mk.wiktionary.org",
		"dir": "ltr",
		"language": "mk",
		"family": "wiktionary"
	},
	{
		"id": "mlwiki",
		"displayName": "Malayalam വിക്കിപീഡിയ",
		"baseUrl": "https://ml.wikipedia.org",
		"dir": "ltr",
		"language": "ml",
		"family": "wiki"
	},
	{
		"id": "mlwikibooks",
		"displayName": "Malayalam വിക്കിപാഠശാല",
		"baseUrl": "https://ml.wikibooks.org",
		"dir": "ltr",
		"language": "ml",
		"family": "wikibooks"
	},
	{
		"id": "mlwikiquote",
		"displayName": "Malayalam വിക്കിചൊല്ലുകൾ",
		"baseUrl": "https://ml.wikiquote.org",
		"dir": "ltr",
		"language": "ml",
		"family": "wikiquote"
	},
	{
		"id": "mlwikisource",
		"displayName": "Malayalam വിക്കിഗ്രന്ഥശാല",
		"baseUrl": "https://ml.wikisource.org",
		"dir": "ltr",
		"language": "ml",
		"family": "wikisource"
	},
	{
		"id": "mlwiktionary",
		"displayName": "Malayalam വിക്കിനിഘണ്ടു",
		"baseUrl": "https://ml.wiktionary.org",
		"dir": "ltr",
		"language": "ml",
		"family": "wiktionary"
	},
	{
		"id": "mniwiki",
		"displayName": "Manipuri ꯋꯤꯀꯤꯄꯦꯗꯤꯌꯥ",
		"baseUrl": "https://mni.wikipedia.org",
		"dir": "ltr",
		"language": "mni",
		"family": "wiki"
	},
	{
		"id": "mniwiktionary",
		"displayName": "Manipuri ꯋꯤꯛꯁꯟꯅꯔꯤ",
		"baseUrl": "https://mni.wiktionary.org",
		"dir": "ltr",
		"language": "mni",
		"family": "wiktionary"
	},
	{
		"id": "mnwiki",
		"displayName": "Mongolian Википедиа",
		"baseUrl": "https://mn.wikipedia.org",
		"dir": "ltr",
		"language": "mn",
		"family": "wiki"
	},
	{
		"id": "mnwiktionary",
		"displayName": "Mongolian Викитоль",
		"baseUrl": "https://mn.wiktionary.org",
		"dir": "ltr",
		"language": "mn",
		"family": "wiktionary"
	},
	{
		"id": "mnwwiki",
		"displayName": "Mon ဝဳကဳပဳဒဳယာ",
		"baseUrl": "https://mnw.wikipedia.org",
		"dir": "ltr",
		"language": "mnw",
		"family": "wiki"
	},
	{
		"id": "mnwwiktionary",
		"displayName": "Mon ဝိက်ရှေန်နရဳ",
		"baseUrl": "https://mnw.wiktionary.org",
		"dir": "ltr",
		"language": "mnw",
		"family": "wiktionary"
	},
	{
		"id": "moswiki",
		"displayName": "Mossi Wikipidiya",
		"baseUrl": "https://mos.wikipedia.org",
		"dir": "ltr",
		"language": "mos",
		"family": "wiki"
	},
	{
		"id": "mrjwiki",
		"displayName": "Western Mari Википеди",
		"baseUrl": "https://mrj.wikipedia.org",
		"dir": "ltr",
		"language": "mrj",
		"family": "wiki"
	},
	{
		"id": "mrwiki",
		"displayName": "Marathi विकिपीडिया",
		"baseUrl": "https://mr.wikipedia.org",
		"dir": "ltr",
		"language": "mr",
		"family": "wiki"
	},
	{
		"id": "mrwikibooks",
		"displayName": "Marathi विकिबुक्स",
		"baseUrl": "https://mr.wikibooks.org",
		"dir": "ltr",
		"language": "mr",
		"family": "wikibooks"
	},
	{
		"id": "mrwikiquote",
		"displayName": "Marathi Wikiquote",
		"baseUrl": "https://mr.wikiquote.org",
		"dir": "ltr",
		"language": "mr",
		"family": "wikiquote"
	},
	{
		"id": "mrwikisource",
		"displayName": "Marathi विकिस्रोत",
		"baseUrl": "https://mr.wikisource.org",
		"dir": "ltr",
		"language": "mr",
		"family": "wikisource"
	},
	{
		"id": "mrwiktionary",
		"displayName": "Marathi Wiktionary",
		"baseUrl": "https://mr.wiktionary.org",
		"dir": "ltr",
		"language": "mr",
		"family": "wiktionary"
	},
	{
		"id": "mswiki",
		"displayName": "Malay Wikipedia",
		"baseUrl": "https://ms.wikipedia.org",
		"dir": "ltr",
		"language": "ms",
		"family": "wiki"
	},
	{
		"id": "mswikibooks",
		"displayName": "Malay Wikibuku",
		"baseUrl": "https://ms.wikibooks.org",
		"dir": "ltr",
		"language": "ms",
		"family": "wikibooks"
	},
	{
		"id": "mswikiquote",
		"displayName": "Malay Wikipetik",
		"baseUrl": "https://ms.wikiquote.org",
		"dir": "ltr",
		"language": "ms",
		"family": "wikiquote"
	},
	{
		"id": "mswikisource",
		"displayName": "Malay Wikisumber",
		"baseUrl": "https://ms.wikisource.org",
		"dir": "ltr",
		"language": "ms",
		"family": "wikisource"
	},
	{
		"id": "mswiktionary",
		"displayName": "Malay Wikikamus",
		"baseUrl": "https://ms.wiktionary.org",
		"dir": "ltr",
		"language": "ms",
		"family": "wiktionary"
	},
	{
		"id": "mtwiki",
		"displayName": "Maltese Wikipedija",
		"baseUrl": "https://mt.wikipedia.org",
		"dir": "ltr",
		"language": "mt",
		"family": "wiki"
	},
	{
		"id": "mtwiktionary",
		"displayName": "Maltese Wikizzjunarju",
		"baseUrl": "https://mt.wiktionary.org",
		"dir": "ltr",
		"language": "mt",
		"family": "wiktionary"
	},
	{
		"id": "mwlwiki",
		"displayName": "Mirandese Biquipédia",
		"baseUrl": "https://mwl.wikipedia.org",
		"dir": "ltr",
		"language": "mwl",
		"family": "wiki"
	},
	{
		"id": "mxwikimedia",
		"displayName": "Wikimedia México",
		"baseUrl": "https://mx.wikimedia.org",
		"dir": "ltr",
		"language": "es",
		"family": "mxwikimedia"
	},
	{
		"id": "myvwiki",
		"displayName": "Erzya Википедиясь",
		"baseUrl": "https://myv.wikipedia.org",
		"dir": "ltr",
		"language": "myv",
		"family": "wiki"
	},
	{
		"id": "mywiki",
		"displayName": "Burmese ဝီကီပီးဒီးယား",
		"baseUrl": "https://my.wikipedia.org",
		"dir": "ltr",
		"language": "my",
		"family": "wiki"
	},
	{
		"id": "mywikisource",
		"displayName": "Burmese ဝီကီရင်းမြစ်",
		"baseUrl": "https://my.wikisource.org",
		"dir": "ltr",
		"language": "my",
		"family": "wikisource"
	},
	{
		"id": "mywiktionary",
		"displayName": "Burmese ဝစ်ရှင်နရီ",
		"baseUrl": "https://my.wiktionary.org",
		"dir": "ltr",
		"language": "my",
		"family": "wiktionary"
	},
	{
		"id": "mznwiki",
		"displayName": "Mazanderani ویکی‌پدیا",
		"baseUrl": "https://mzn.wikipedia.org",
		"dir": "rtl",
		"language": "mzn",
		"family": "wiki"
	},
	{
		"id": "nahwiki",
		"displayName": "Nahuatl Huiquipedia",
		"baseUrl": "https://nah.wikipedia.org",
		"dir": "ltr",
		"language": "nah",
		"family": "wiki"
	},
	{
		"id": "nahwiktionary",
		"displayName": "Nahuatl Wiktionary",
		"baseUrl": "https://nah.wiktionary.org",
		"dir": "ltr",
		"language": "nah",
		"family": "wiktionary"
	},
	{
		"id": "napwiki",
		"displayName": "Neapolitan Wikipedia",
		"baseUrl": "https://nap.wikipedia.org",
		"dir": "ltr",
		"language": "nap",
		"family": "wiki"
	},
	{
		"id": "napwikisource",
		"displayName": "Neapolitan Wikisource",
		"baseUrl": "https://nap.wikisource.org",
		"dir": "ltr",
		"language": "nap",
		"family": "wikisource"
	},
	{
		"id": "nawiktionary",
		"displayName": "Nauru Wiktionary",
		"baseUrl": "https://na.wiktionary.org",
		"dir": "ltr",
		"language": "na",
		"family": "wiktionary"
	},
	{
		"id": "nds_nlwiki",
		"displayName": "Low Saxon Wikipedia",
		"baseUrl": "https://nds-nl.wikipedia.org",
		"dir": "ltr",
		"language": "nds-nl",
		"family": "wiki"
	},
	{
		"id": "ndswiki",
		"displayName": "Low German Wikipedia",
		"baseUrl": "https://nds.wikipedia.org",
		"dir": "ltr",
		"language": "nds",
		"family": "wiki"
	},
	{
		"id": "ndswiktionary",
		"displayName": "Low German Wiktionary",
		"baseUrl": "https://nds.wiktionary.org",
		"dir": "ltr",
		"language": "nds",
		"family": "wiktionary"
	},
	{
		"id": "newiki",
		"displayName": "Nepali विकिपिडिया",
		"baseUrl": "https://ne.wikipedia.org",
		"dir": "ltr",
		"language": "ne",
		"family": "wiki"
	},
	{
		"id": "newikibooks",
		"displayName": "Nepali विकिपुस्तक",
		"baseUrl": "https://ne.wikibooks.org",
		"dir": "ltr",
		"language": "ne",
		"family": "wikibooks"
	},
	{
		"id": "newiktionary",
		"displayName": "Nepali Wiktionary",
		"baseUrl": "https://ne.wiktionary.org",
		"dir": "ltr",
		"language": "ne",
		"family": "wiktionary"
	},
	{
		"id": "newwiki",
		"displayName": "Newari Wikipedia",
		"baseUrl": "https://new.wikipedia.org",
		"dir": "ltr",
		"language": "new",
		"family": "wiki"
	},
	{
		"id": "niawiki",
		"displayName": "Nias Wikipedia",
		"baseUrl": "https://nia.wikipedia.org",
		"dir": "ltr",
		"language": "nia",
		"family": "wiki"
	},
	{
		"id": "niawiktionary",
		"displayName": "Nias Wikikamus",
		"baseUrl": "https://nia.wiktionary.org",
		"dir": "ltr",
		"language": "nia",
		"family": "wiktionary"
	},
	{
		"id": "nlwiki",
		"displayName": "Dutch Wikipedia",
		"baseUrl": "https://nl.wikipedia.org",
		"dir": "ltr",
		"language": "nl",
		"family": "wiki"
	},
	{
		"id": "nlwikibooks",
		"displayName": "Dutch Wikibooks",
		"baseUrl": "https://nl.wikibooks.org",
		"dir": "ltr",
		"language": "nl",
		"family": "wikibooks"
	},
	{
		"id": "nlwikimedia",
		"displayName": "Wikimedia",
		"baseUrl": "https://nl.wikimedia.org",
		"dir": "ltr",
		"language": "nl",
		"family": "nlwikimedia"
	},
	{
		"id": "nlwikiquote",
		"displayName": "Dutch Wikiquote",
		"baseUrl": "https://nl.wikiquote.org",
		"dir": "ltr",
		"language": "nl",
		"family": "wikiquote"
	},
	{
		"id": "nlwikisource",
		"displayName": "Dutch Wikisource",
		"baseUrl": "https://nl.wikisource.org",
		"dir": "ltr",
		"language": "nl",
		"family": "wikisource"
	},
	{
		"id": "nlwikivoyage",
		"displayName": "Dutch Wikivoyage",
		"baseUrl": "https://nl.wikivoyage.org",
		"dir": "ltr",
		"language": "nl",
		"family": "wikivoyage"
	},
	{
		"id": "nlwiktionary",
		"displayName": "Dutch WikiWoordenboek",
		"baseUrl": "https://nl.wiktionary.org",
		"dir": "ltr",
		"language": "nl",
		"family": "wiktionary"
	},
	{
		"id": "nnwiki",
		"displayName": "Norwegian Nynorsk Wikipedia",
		"baseUrl": "https://nn.wikipedia.org",
		"dir": "ltr",
		"language": "nn",
		"family": "wiki"
	},
	{
		"id": "nnwikiquote",
		"displayName": "Norwegian Nynorsk Wikiquote",
		"baseUrl": "https://nn.wikiquote.org",
		"dir": "ltr",
		"language": "nn",
		"family": "wikiquote"
	},
	{
		"id": "nnwiktionary",
		"displayName": "Norwegian Nynorsk Wiktionary",
		"baseUrl": "https://nn.wiktionary.org",
		"dir": "ltr",
		"language": "nn",
		"family": "wiktionary"
	},
	{
		"id": "novwiki",
		"displayName": "Novial Wikipedia",
		"baseUrl": "https://nov.wikipedia.org",
		"dir": "ltr",
		"language": "nov",
		"family": "wiki"
	},
	{
		"id": "nowiki",
		"displayName": "Norwegian Wikipedia",
		"baseUrl": "https://no.wikipedia.org",
		"dir": "ltr",
		"language": "no",
		"family": "wiki"
	},
	{
		"id": "nowikibooks",
		"displayName": "Norwegian Wikibøker",
		"baseUrl": "https://no.wikibooks.org",
		"dir": "ltr",
		"language": "no",
		"family": "wikibooks"
	},
	{
		"id": "nowikimedia",
		"displayName": "Wikimedia Norge",
		"baseUrl": "https://no.wikimedia.org",
		"dir": "ltr",
		"language": "nb",
		"family": "nowikimedia"
	},
	{
		"id": "nowikiquote",
		"displayName": "Norwegian Wikiquote",
		"baseUrl": "https://no.wikiquote.org",
		"dir": "ltr",
		"language": "no",
		"family": "wikiquote"
	},
	{
		"id": "nowikisource",
		"displayName": "Norwegian Wikikilden",
		"baseUrl": "https://no.wikisource.org",
		"dir": "ltr",
		"language": "no",
		"family": "wikisource"
	},
	{
		"id": "nowiktionary",
		"displayName": "Norwegian Wiktionary",
		"baseUrl": "https://no.wiktionary.org",
		"dir": "ltr",
		"language": "no",
		"family": "wiktionary"
	},
	{
		"id": "nqowiki",
		"displayName": "N’Ko ߥߞߌߔߘߋߞߎ",
		"baseUrl": "https://nqo.wikipedia.org",
		"dir": "rtl",
		"language": "nqo",
		"family": "wiki"
	},
	{
		"id": "nrmwiki",
		"displayName": "Norman Wikipedia",
		"baseUrl": "https://nrm.wikipedia.org",
		"dir": "ltr",
		"language": "nrm",
		"family": "wiki"
	},
	{
		"id": "nrwiki",
		"displayName": "South Ndebele Wikiphidiya",
		"baseUrl": "https://nr.wikipedia.org",
		"dir": "ltr",
		"language": "nr",
		"family": "wiki"
	},
	{
		"id": "nsowiki",
		"displayName": "Northern Sotho Wikipedia",
		"baseUrl": "https://nso.wikipedia.org",
		"dir": "ltr",
		"language": "nso",
		"family": "wiki"
	},
	{
		"id": "nupwiki",
		"displayName": "Nupe Wikipedia",
		"baseUrl": "https://nup.wikipedia.org",
		"dir": "ltr",
		"language": "nup",
		"family": "wiki"
	},
	{
		"id": "nvwiki",
		"displayName": "Navajo Wikipedia",
		"baseUrl": "https://nv.wikipedia.org",
		"dir": "ltr",
		"language": "nv",
		"family": "wiki"
	},
	{
		"id": "nycwikimedia",
		"displayName": "Wikimedia New York City",
		"baseUrl": "https://nyc.wikimedia.org",
		"dir": "ltr",
		"language": "en",
		"family": "nycwikimedia"
	},
	{
		"id": "nywiki",
		"displayName": "Nyanja Wikipedia",
		"baseUrl": "https://ny.wikipedia.org",
		"dir": "ltr",
		"language": "ny",
		"family": "wiki"
	},
	{
		"id": "ocwiki",
		"displayName": "Occitan Wikipèdia",
		"baseUrl": "https://oc.wikipedia.org",
		"dir": "ltr",
		"language": "oc",
		"family": "wiki"
	},
	{
		"id": "ocwikibooks",
		"displayName": "Occitan Wikilibres",
		"baseUrl": "https://oc.wikibooks.org",
		"dir": "ltr",
		"language": "oc",
		"family": "wikibooks"
	},
	{
		"id": "ocwiktionary",
		"displayName": "Occitan Wikiccionari",
		"baseUrl": "https://oc.wiktionary.org",
		"dir": "ltr",
		"language": "oc",
		"family": "wiktionary"
	},
	{
		"id": "olowiki",
		"displayName": "Livvi-Karelian Wikipedii",
		"baseUrl": "https://olo.wikipedia.org",
		"dir": "ltr",
		"language": "olo",
		"family": "wiki"
	},
	{
		"id": "omwiki",
		"displayName": "Oromo Wikipedia",
		"baseUrl": "https://om.wikipedia.org",
		"dir": "ltr",
		"language": "om",
		"family": "wiki"
	},
	{
		"id": "omwiktionary",
		"displayName": "Oromo Wiktionary",
		"baseUrl": "https://om.wiktionary.org",
		"dir": "ltr",
		"language": "om",
		"family": "wiktionary"
	},
	{
		"id": "orwiki",
		"displayName": "Odia ଉଇକିପିଡ଼ିଆ",
		"baseUrl": "https://or.wikipedia.org",
		"dir": "ltr",
		"language": "or",
		"family": "wiki"
	},
	{
		"id": "orwikisource",
		"displayName": "Odia ଉଇକିପାଠାଗାର",
		"baseUrl": "https://or.wikisource.org",
		"dir": "ltr",
		"language": "or",
		"family": "wikisource"
	},
	{
		"id": "orwiktionary",
		"displayName": "Odia ଉଇକିଅଭିଧାନ",
		"baseUrl": "https://or.wiktionary.org",
		"dir": "ltr",
		"language": "or",
		"family": "wiktionary"
	},
	{
		"id": "oswiki",
		"displayName": "Ossetic Википеди",
		"baseUrl": "https://os.wikipedia.org",
		"dir": "ltr",
		"language": "os",
		"family": "wiki"
	},
	{
		"id": "outreachwiki",
		"displayName": "Outreach Wiki",
		"baseUrl": "https://outreach.wikimedia.org",
		"dir": "ltr",
		"language": "outreach",
		"family": "outreach"
	},
	{
		"id": "pagwiki",
		"displayName": "Pangasinan Wikipedia",
		"baseUrl": "https://pag.wikipedia.org",
		"dir": "ltr",
		"language": "pag",
		"family": "wiki"
	},
	{
		"id": "pamwiki",
		"displayName": "Pampanga Wikipedia",
		"baseUrl": "https://pam.wikipedia.org",
		"dir": "ltr",
		"language": "pam",
		"family": "wiki"
	},
	{
		"id": "papwiki",
		"displayName": "Papiamento Wikipedia",
		"baseUrl": "https://pap.wikipedia.org",
		"dir": "ltr",
		"language": "pap",
		"family": "wiki"
	},
	{
		"id": "pawiki",
		"displayName": "Punjabi ਵਿਕੀਪੀਡੀਆ",
		"baseUrl": "https://pa.wikipedia.org",
		"dir": "ltr",
		"language": "pa",
		"family": "wiki"
	},
	{
		"id": "pawikibooks",
		"displayName": "Punjabi Wikibooks",
		"baseUrl": "https://pa.wikibooks.org",
		"dir": "ltr",
		"language": "pa",
		"family": "wikibooks"
	},
	{
		"id": "pawikisource",
		"displayName": "Punjabi ਵਿਕੀਸਰੋਤ",
		"baseUrl": "https://pa.wikisource.org",
		"dir": "ltr",
		"language": "pa",
		"family": "wikisource"
	},
	{
		"id": "pawiktionary",
		"displayName": "Punjabi Wiktionary",
		"baseUrl": "https://pa.wiktionary.org",
		"dir": "ltr",
		"language": "pa",
		"family": "wiktionary"
	},
	{
		"id": "pcdwiki",
		"displayName": "Picard Wikipedia",
		"baseUrl": "https://pcd.wikipedia.org",
		"dir": "ltr",
		"language": "pcd",
		"family": "wiki"
	},
	{
		"id": "pcmwiki",
		"displayName": "Nigerian Pidgin Wikipedia",
		"baseUrl": "https://pcm.wikipedia.org",
		"dir": "ltr",
		"language": "pcm",
		"family": "wiki"
	},
	{
		"id": "pcmwikiquote",
		"displayName": "Nigerian Pidgin Wikitok",
		"baseUrl": "https://pcm.wikiquote.org",
		"dir": "ltr",
		"language": "pcm",
		"family": "wikiquote"
	},
	{
		"id": "pdcwiki",
		"displayName": "Pennsylvania German Wikipedia",
		"baseUrl": "https://pdc.wikipedia.org",
		"dir": "ltr",
		"language": "pdc",
		"family": "wiki"
	},
	{
		"id": "pflwiki",
		"displayName": "Palatine German Wikipedia",
		"baseUrl": "https://pfl.wikipedia.org",
		"dir": "ltr",
		"language": "pfl",
		"family": "wiki"
	},
	{
		"id": "piwiki",
		"displayName": "Pali Wikipedia",
		"baseUrl": "https://pi.wikipedia.org",
		"dir": "ltr",
		"language": "pi",
		"family": "wiki"
	},
	{
		"id": "plwiki",
		"displayName": "Polish Wikipedia",
		"baseUrl": "https://pl.wikipedia.org",
		"dir": "ltr",
		"language": "pl",
		"family": "wiki"
	},
	{
		"id": "plwikibooks",
		"displayName": "Polish Wikibooks",
		"baseUrl": "https://pl.wikibooks.org",
		"dir": "ltr",
		"language": "pl",
		"family": "wikibooks"
	},
	{
		"id": "plwikimedia",
		"displayName": "Wikimedia",
		"baseUrl": "https://pl.wikimedia.org",
		"dir": "ltr",
		"language": "pl",
		"family": "plwikimedia"
	},
	{
		"id": "plwikiquote",
		"displayName": "Polish Wikicytaty",
		"baseUrl": "https://pl.wikiquote.org",
		"dir": "ltr",
		"language": "pl",
		"family": "wikiquote"
	},
	{
		"id": "plwikisource",
		"displayName": "Polish Wikiźródła",
		"baseUrl": "https://pl.wikisource.org",
		"dir": "ltr",
		"language": "pl",
		"family": "wikisource"
	},
	{
		"id": "plwikivoyage",
		"displayName": "Polish Wikipodróże",
		"baseUrl": "https://pl.wikivoyage.org",
		"dir": "ltr",
		"language": "pl",
		"family": "wikivoyage"
	},
	{
		"id": "plwiktionary",
		"displayName": "Polish Wikisłownik",
		"baseUrl": "https://pl.wiktionary.org",
		"dir": "ltr",
		"language": "pl",
		"family": "wiktionary"
	},
	{
		"id": "pmswiki",
		"displayName": "Piedmontese Wikipedia",
		"baseUrl": "https://pms.wikipedia.org",
		"dir": "ltr",
		"language": "pms",
		"family": "wiki"
	},
	{
		"id": "pmswikisource",
		"displayName": "Piedmontese Wikisource",
		"baseUrl": "https://pms.wikisource.org",
		"dir": "ltr",
		"language": "pms",
		"family": "wikisource"
	},
	{
		"id": "pnbwiki",
		"displayName": "Western Punjabi وکیپیڈیا",
		"baseUrl": "https://pnb.wikipedia.org",
		"dir": "rtl",
		"language": "pnb",
		"family": "wiki"
	},
	{
		"id": "pnbwiktionary",
		"displayName": "Western Punjabi وکشنری",
		"baseUrl": "https://pnb.wiktionary.org",
		"dir": "rtl",
		"language": "pnb",
		"family": "wiktionary"
	},
	{
		"id": "pntwiki",
		"displayName": "Pontic Βικιπαίδεια",
		"baseUrl": "https://pnt.wikipedia.org",
		"dir": "ltr",
		"language": "pnt",
		"family": "wiki"
	},
	{
		"id": "pplwiki",
		"displayName": "Nawat Wikiamachti",
		"baseUrl": "https://ppl.wikipedia.org",
		"dir": "ltr",
		"language": "ppl",
		"family": "wiki"
	},
	{
		"id": "pswiki",
		"displayName": "Pashto ويکيپېډيا",
		"baseUrl": "https://ps.wikipedia.org",
		"dir": "rtl",
		"language": "ps",
		"family": "wiki"
	},
	{
		"id": "pswikivoyage",
		"displayName": "Pashto ويکيسفر",
		"baseUrl": "https://ps.wikivoyage.org",
		"dir": "rtl",
		"language": "ps",
		"family": "wikivoyage"
	},
	{
		"id": "pswiktionary",
		"displayName": "Pashto ويکيسيند",
		"baseUrl": "https://ps.wiktionary.org",
		"dir": "rtl",
		"language": "ps",
		"family": "wiktionary"
	},
	{
		"id": "ptwiki",
		"displayName": "Portuguese Wikipédia",
		"baseUrl": "https://pt.wikipedia.org",
		"dir": "ltr",
		"language": "pt",
		"family": "wiki"
	},
	{
		"id": "ptwikibooks",
		"displayName": "Portuguese Wikilivros",
		"baseUrl": "https://pt.wikibooks.org",
		"dir": "ltr",
		"language": "pt",
		"family": "wikibooks"
	},
	{
		"id": "ptwikimedia",
		"displayName": "Wikimedia Portugal",
		"baseUrl": "https://pt.wikimedia.org",
		"dir": "ltr",
		"language": "pt",
		"family": "ptwikimedia"
	},
	{
		"id": "ptwikiquote",
		"displayName": "Portuguese Wikiquote",
		"baseUrl": "https://pt.wikiquote.org",
		"dir": "ltr",
		"language": "pt",
		"family": "wikiquote"
	},
	{
		"id": "ptwikisource",
		"displayName": "Portuguese Wikisource",
		"baseUrl": "https://pt.wikisource.org",
		"dir": "ltr",
		"language": "pt",
		"family": "wikisource"
	},
	{
		"id": "ptwikiversity",
		"displayName": "Portuguese Wikiversidade",
		"baseUrl": "https://pt.wikiversity.org",
		"dir": "ltr",
		"language": "pt",
		"family": "wikiversity"
	},
	{
		"id": "ptwikivoyage",
		"displayName": "Portuguese Wikivoyage",
		"baseUrl": "https://pt.wikivoyage.org",
		"dir": "ltr",
		"language": "pt",
		"family": "wikivoyage"
	},
	{
		"id": "ptwiktionary",
		"displayName": "Portuguese Wikcionário",
		"baseUrl": "https://pt.wiktionary.org",
		"dir": "ltr",
		"language": "pt",
		"family": "wiktionary"
	},
	{
		"id": "pwnwiki",
		"displayName": "Paiwan Wikipedia",
		"baseUrl": "https://pwn.wikipedia.org",
		"dir": "ltr",
		"language": "pwn",
		"family": "wiki"
	},
	{
		"id": "quwiki",
		"displayName": "Quechua Wikipedia",
		"baseUrl": "https://qu.wikipedia.org",
		"dir": "ltr",
		"language": "qu",
		"family": "wiki"
	},
	{
		"id": "quwiktionary",
		"displayName": "Quechua Wiktionary",
		"baseUrl": "https://qu.wiktionary.org",
		"dir": "ltr",
		"language": "qu",
		"family": "wiktionary"
	},
	{
		"id": "rkiwiki",
		"displayName": "Arakanese ဝီကီးပီးဒီးယား",
		"baseUrl": "https://rki.wikipedia.org",
		"dir": "ltr",
		"language": "rki",
		"family": "wiki"
	},
	{
		"id": "rmwiki",
		"displayName": "Romansh Wikipedia",
		"baseUrl": "https://rm.wikipedia.org",
		"dir": "ltr",
		"language": "rm",
		"family": "wiki"
	},
	{
		"id": "rmywiki",
		"displayName": "Vlax Romani Vikipidiya",
		"baseUrl": "https://rmy.wikipedia.org",
		"dir": "ltr",
		"language": "rmy",
		"family": "wiki"
	},
	{
		"id": "rnwiki",
		"displayName": "Rundi Wikipedia",
		"baseUrl": "https://rn.wikipedia.org",
		"dir": "ltr",
		"language": "rn",
		"family": "wiki"
	},
	{
		"id": "roa_rupwiki",
		"displayName": "Aromanian Wikipedia",
		"baseUrl": "https://roa-rup.wikipedia.org",
		"dir": "ltr",
		"language": "rup",
		"family": "wiki"
	},
	{
		"id": "roa_rupwiktionary",
		"displayName": "Aromanian Wiktionary",
		"baseUrl": "https://roa-rup.wiktionary.org",
		"dir": "ltr",
		"language": "rup",
		"family": "wiktionary"
	},
	{
		"id": "roa_tarawiki",
		"displayName": "Tarantino Wikipedia",
		"baseUrl": "https://roa-tara.wikipedia.org",
		"dir": "ltr",
		"language": "roa-tara",
		"family": "wiki"
	},
	{
		"id": "rowiki",
		"displayName": "Romanian Wikipedia",
		"baseUrl": "https://ro.wikipedia.org",
		"dir": "ltr",
		"language": "ro",
		"family": "wiki"
	},
	{
		"id": "rowikibooks",
		"displayName": "Romanian Wikimanuale",
		"baseUrl": "https://ro.wikibooks.org",
		"dir": "ltr",
		"language": "ro",
		"family": "wikibooks"
	},
	{
		"id": "rowikiquote",
		"displayName": "Romanian Wikicitat",
		"baseUrl": "https://ro.wikiquote.org",
		"dir": "ltr",
		"language": "ro",
		"family": "wikiquote"
	},
	{
		"id": "rowikisource",
		"displayName": "Romanian Wikisource",
		"baseUrl": "https://ro.wikisource.org",
		"dir": "ltr",
		"language": "ro",
		"family": "wikisource"
	},
	{
		"id": "rowikivoyage",
		"displayName": "Romanian Wikivoyage",
		"baseUrl": "https://ro.wikivoyage.org",
		"dir": "ltr",
		"language": "ro",
		"family": "wikivoyage"
	},
	{
		"id": "rowiktionary",
		"displayName": "Romanian Wikționar",
		"baseUrl": "https://ro.wiktionary.org",
		"dir": "ltr",
		"language": "ro",
		"family": "wiktionary"
	},
	{
		"id": "rskwiki",
		"displayName": "Pannonian Rusyn Википедия",
		"baseUrl": "https://rsk.wikipedia.org",
		"dir": "ltr",
		"language": "rsk",
		"family": "wiki"
	},
	{
		"id": "ruewiki",
		"displayName": "Rusyn Вікіпедія",
		"baseUrl": "https://rue.wikipedia.org",
		"dir": "ltr",
		"language": "rue",
		"family": "wiki"
	},
	{
		"id": "ruwiki",
		"displayName": "Russian Википедия",
		"baseUrl": "https://ru.wikipedia.org",
		"dir": "ltr",
		"language": "ru",
		"family": "wiki"
	},
	{
		"id": "ruwikibooks",
		"displayName": "Russian Викиучебник",
		"baseUrl": "https://ru.wikibooks.org",
		"dir": "ltr",
		"language": "ru",
		"family": "wikibooks"
	},
	{
		"id": "ruwikimedia",
		"displayName": "Викимедиа",
		"baseUrl": "https://ru.wikimedia.org",
		"dir": "ltr",
		"language": "ru",
		"family": "ruwikimedia"
	},
	{
		"id": "ruwikiquote",
		"displayName": "Russian Викицитатник",
		"baseUrl": "https://ru.wikiquote.org",
		"dir": "ltr",
		"language": "ru",
		"family": "wikiquote"
	},
	{
		"id": "ruwikisource",
		"displayName": "Russian Викитека",
		"baseUrl": "https://ru.wikisource.org",
		"dir": "ltr",
		"language": "ru",
		"family": "wikisource"
	},
	{
		"id": "ruwikiversity",
		"displayName": "Russian Викиверситет",
		"baseUrl": "https://ru.wikiversity.org",
		"dir": "ltr",
		"language": "ru",
		"family": "wikiversity"
	},
	{
		"id": "ruwikivoyage",
		"displayName": "Russian Wikivoyage",
		"baseUrl": "https://ru.wikivoyage.org",
		"dir": "ltr",
		"language": "ru",
		"family": "wikivoyage"
	},
	{
		"id": "ruwiktionary",
		"displayName": "Russian Викисловарь",
		"baseUrl": "https://ru.wiktionary.org",
		"dir": "ltr",
		"language": "ru",
		"family": "wiktionary"
	},
	{
		"id": "rwwiki",
		"displayName": "Kinyarwanda Wikipedia",
		"baseUrl": "https://rw.wikipedia.org",
		"dir": "ltr",
		"language": "rw",
		"family": "wiki"
	},
	{
		"id": "rwwiktionary",
		"displayName": "Kinyarwanda Wiktionary",
		"baseUrl": "https://rw.wiktionary.org",
		"dir": "ltr",
		"language": "rw",
		"family": "wiktionary"
	},
	{
		"id": "sahwiki",
		"displayName": "Yakut Бикипиэдьийэ",
		"baseUrl": "https://sah.wikipedia.org",
		"dir": "ltr",
		"language": "sah",
		"family": "wiki"
	},
	{
		"id": "sahwikiquote",
		"displayName": "Yakut Биики_Домох",
		"baseUrl": "https://sah.wikiquote.org",
		"dir": "ltr",
		"language": "sah",
		"family": "wikiquote"
	},
	{
		"id": "sahwikisource",
		"displayName": "Yakut Бикитиэкэ",
		"baseUrl": "https://sah.wikisource.org",
		"dir": "ltr",
		"language": "sah",
		"family": "wikisource"
	},
	{
		"id": "satwiki",
		"displayName": "Santali ᱣᱤᱠᱤᱯᱤᱰᱤᱭᱟ",
		"baseUrl": "https://sat.wikipedia.org",
		"dir": "ltr",
		"language": "sat",
		"family": "wiki"
	},
	{
		"id": "satwiktionary",
		"displayName": "Santali ᱣᱤᱠᱤ ᱟᱹᱲᱟᱹ ᱢᱩᱨᱟᱹᱭ",
		"baseUrl": "https://sat.wiktionary.org",
		"dir": "ltr",
		"language": "sat",
		"family": "wiktionary"
	},
	{
		"id": "sawiki",
		"displayName": "Sanskrit विकिपीडिया",
		"baseUrl": "https://sa.wikipedia.org",
		"dir": "ltr",
		"language": "sa",
		"family": "wiki"
	},
	{
		"id": "sawikibooks",
		"displayName": "Sanskrit विकिपुस्तकानि",
		"baseUrl": "https://sa.wikibooks.org",
		"dir": "ltr",
		"language": "sa",
		"family": "wikibooks"
	},
	{
		"id": "sawikiquote",
		"displayName": "Sanskrit विकिसूक्तिः",
		"baseUrl": "https://sa.wikiquote.org",
		"dir": "ltr",
		"language": "sa",
		"family": "wikiquote"
	},
	{
		"id": "sawikisource",
		"displayName": "Sanskrit विकिस्रोतः",
		"baseUrl": "https://sa.wikisource.org",
		"dir": "ltr",
		"language": "sa",
		"family": "wikisource"
	},
	{
		"id": "sawiktionary",
		"displayName": "Sanskrit विकिशब्दकोशः",
		"baseUrl": "https://sa.wiktionary.org",
		"dir": "ltr",
		"language": "sa",
		"family": "wiktionary"
	},
	{
		"id": "scnwiki",
		"displayName": "Sicilian Wikipedia",
		"baseUrl": "https://scn.wikipedia.org",
		"dir": "ltr",
		"language": "scn",
		"family": "wiki"
	},
	{
		"id": "scnwiktionary",
		"displayName": "Sicilian Wikizziunariu",
		"baseUrl": "https://scn.wiktionary.org",
		"dir": "ltr",
		"language": "scn",
		"family": "wiktionary"
	},
	{
		"id": "scowiki",
		"displayName": "Scots Wikipedia",
		"baseUrl": "https://sco.wikipedia.org",
		"dir": "ltr",
		"language": "sco",
		"family": "wiki"
	},
	{
		"id": "scwiki",
		"displayName": "Sardinian Wikipedia",
		"baseUrl": "https://sc.wikipedia.org",
		"dir": "ltr",
		"language": "sc",
		"family": "wiki"
	},
	{
		"id": "sdwiki",
		"displayName": "Sindhi وڪيپيڊيا",
		"baseUrl": "https://sd.wikipedia.org",
		"dir": "rtl",
		"language": "sd",
		"family": "wiki"
	},
	{
		"id": "sdwiktionary",
		"displayName": "Sindhi Wiktionary",
		"baseUrl": "https://sd.wiktionary.org",
		"dir": "rtl",
		"language": "sd",
		"family": "wiktionary"
	},
	{
		"id": "sewiki",
		"displayName": "Northern Sami Wikipedia",
		"baseUrl": "https://se.wikipedia.org",
		"dir": "ltr",
		"language": "se",
		"family": "wiki"
	},
	{
		"id": "sewikimedia",
		"displayName": "Wikimedia",
		"baseUrl": "https://se.wikimedia.org",
		"dir": "ltr",
		"language": "sv",
		"family": "sewikimedia"
	},
	{
		"id": "sgwiki",
		"displayName": "Sango Wikipedia",
		"baseUrl": "https://sg.wikipedia.org",
		"dir": "ltr",
		"language": "sg",
		"family": "wiki"
	},
	{
		"id": "sgwiktionary",
		"displayName": "Sango Wiktionary",
		"baseUrl": "https://sg.wiktionary.org",
		"dir": "ltr",
		"language": "sg",
		"family": "wiktionary"
	},
	{
		"id": "shiwiki",
		"displayName": "Tachelhit Wikipedia",
		"baseUrl": "https://shi.wikipedia.org",
		"dir": "ltr",
		"language": "shi",
		"family": "wiki"
	},
	{
		"id": "shnwiki",
		"displayName": "Shan ဝီႇၶီႇၽီးတီးယႃး",
		"baseUrl": "https://shn.wikipedia.org",
		"dir": "ltr",
		"language": "shn",
		"family": "wiki"
	},
	{
		"id": "shnwikibooks",
		"displayName": "Shan ဝီႇၶီႇပပ်ႉ",
		"baseUrl": "https://shn.wikibooks.org",
		"dir": "ltr",
		"language": "shn",
		"family": "wikibooks"
	},
	{
		"id": "shnwikivoyage",
		"displayName": "Shan ဝီႇၶီႇဝွႆးဢဵတ်ႇꩡ်",
		"baseUrl": "https://shn.wikivoyage.org",
		"dir": "ltr",
		"language": "shn",
		"family": "wikivoyage"
	},
	{
		"id": "shnwiktionary",
		"displayName": "Shan ဝိၵ်ႇသျိၼ်ႇၼရီႇ",
		"baseUrl": "https://shn.wiktionary.org",
		"dir": "ltr",
		"language": "shn",
		"family": "wiktionary"
	},
	{
		"id": "shwiki",
		"displayName": "Serbo-Croatian Wikipedija",
		"baseUrl": "https://sh.wikipedia.org",
		"dir": "ltr",
		"language": "sh",
		"family": "wiki"
	},
	{
		"id": "shwiktionary",
		"displayName": "Serbo-Croatian Wikirječnik",
		"baseUrl": "https://sh.wiktionary.org",
		"dir": "ltr",
		"language": "sh",
		"family": "wiktionary"
	},
	{
		"id": "shywiktionary",
		"displayName": "Shawiya Wikasegzawal",
		"baseUrl": "https://shy.wiktionary.org",
		"dir": "ltr",
		"language": "shy",
		"family": "wiktionary"
	},
	{
		"id": "simplewiki",
		"displayName": "Simple English Wikipedia",
		"baseUrl": "https://simple.wikipedia.org",
		"dir": "ltr",
		"language": "simple",
		"family": "wiki"
	},
	{
		"id": "simplewiktionary",
		"displayName": "Simple English Wiktionary",
		"baseUrl": "https://simple.wiktionary.org",
		"dir": "ltr",
		"language": "simple",
		"family": "wiktionary"
	},
	{
		"id": "siwiki",
		"displayName": "Sinhala විකිපීඩියා",
		"baseUrl": "https://si.wikipedia.org",
		"dir": "ltr",
		"language": "si",
		"family": "wiki"
	},
	{
		"id": "siwikibooks",
		"displayName": "Sinhala Wikibooks",
		"baseUrl": "https://si.wikibooks.org",
		"dir": "ltr",
		"language": "si",
		"family": "wikibooks"
	},
	{
		"id": "siwiktionary",
		"displayName": "Sinhala Wiktionary",
		"baseUrl": "https://si.wiktionary.org",
		"dir": "ltr",
		"language": "si",
		"family": "wiktionary"
	},
	{
		"id": "skrwiki",
		"displayName": "Saraiki وکیپیڈیا",
		"baseUrl": "https://skr.wikipedia.org",
		"dir": "rtl",
		"language": "skr",
		"family": "wiki"
	},
	{
		"id": "skrwiktionary",
		"displayName": "Saraiki وکشنری",
		"baseUrl": "https://skr.wiktionary.org",
		"dir": "rtl",
		"language": "skr",
		"family": "wiktionary"
	},
	{
		"id": "skwiki",
		"displayName": "Slovak Wikipédia",
		"baseUrl": "https://sk.wikipedia.org",
		"dir": "ltr",
		"language": "sk",
		"family": "wiki"
	},
	{
		"id": "skwikibooks",
		"displayName": "Slovak Wikiknihy",
		"baseUrl": "https://sk.wikibooks.org",
		"dir": "ltr",
		"language": "sk",
		"family": "wikibooks"
	},
	{
		"id": "skwikiquote",
		"displayName": "Slovak Wikicitáty",
		"baseUrl": "https://sk.wikiquote.org",
		"dir": "ltr",
		"language": "sk",
		"family": "wikiquote"
	},
	{
		"id": "skwikisource",
		"displayName": "Slovak Wikizdroje",
		"baseUrl": "https://sk.wikisource.org",
		"dir": "ltr",
		"language": "sk",
		"family": "wikisource"
	},
	{
		"id": "skwiktionary",
		"displayName": "Slovak Wikislovník",
		"baseUrl": "https://sk.wiktionary.org",
		"dir": "ltr",
		"language": "sk",
		"family": "wiktionary"
	},
	{
		"id": "slwiki",
		"displayName": "Slovenian Wikipedija",
		"baseUrl": "https://sl.wikipedia.org",
		"dir": "ltr",
		"language": "sl",
		"family": "wiki"
	},
	{
		"id": "slwikibooks",
		"displayName": "Slovenian Wikiknjige",
		"baseUrl": "https://sl.wikibooks.org",
		"dir": "ltr",
		"language": "sl",
		"family": "wikibooks"
	},
	{
		"id": "slwikiquote",
		"displayName": "Slovenian Wikinavedek",
		"baseUrl": "https://sl.wikiquote.org",
		"dir": "ltr",
		"language": "sl",
		"family": "wikiquote"
	},
	{
		"id": "slwikisource",
		"displayName": "Slovenian Wikivir",
		"baseUrl": "https://sl.wikisource.org",
		"dir": "ltr",
		"language": "sl",
		"family": "wikisource"
	},
	{
		"id": "slwikiversity",
		"displayName": "Slovenian Wikiverza",
		"baseUrl": "https://sl.wikiversity.org",
		"dir": "ltr",
		"language": "sl",
		"family": "wikiversity"
	},
	{
		"id": "slwiktionary",
		"displayName": "Slovenian Wikislovar",
		"baseUrl": "https://sl.wiktionary.org",
		"dir": "ltr",
		"language": "sl",
		"family": "wiktionary"
	},
	{
		"id": "smnwiki",
		"displayName": "Inari Sami Wikipedia",
		"baseUrl": "https://smn.wikipedia.org",
		"dir": "ltr",
		"language": "smn",
		"family": "wiki"
	},
	{
		"id": "smwiki",
		"displayName": "Samoan Wikipedia",
		"baseUrl": "https://sm.wikipedia.org",
		"dir": "ltr",
		"language": "sm",
		"family": "wiki"
	},
	{
		"id": "smwiktionary",
		"displayName": "Samoan Wiktionary",
		"baseUrl": "https://sm.wiktionary.org",
		"dir": "ltr",
		"language": "sm",
		"family": "wiktionary"
	},
	{
		"id": "snwiki",
		"displayName": "Shona Wikipedia",
		"baseUrl": "https://sn.wikipedia.org",
		"dir": "ltr",
		"language": "sn",
		"family": "wiki"
	},
	{
		"id": "sourceswiki",
		"displayName": "Wikisource",
		"baseUrl": "https://wikisource.org",
		"dir": "ltr",
		"language": "sources",
		"family": "sources"
	},
	{
		"id": "sowiki",
		"displayName": "Somali Wikipedia",
		"baseUrl": "https://so.wikipedia.org",
		"dir": "ltr",
		"language": "so",
		"family": "wiki"
	},
	{
		"id": "sowiktionary",
		"displayName": "Somali Wiktionary",
		"baseUrl": "https://so.wiktionary.org",
		"dir": "ltr",
		"language": "so",
		"family": "wiktionary"
	},
	{
		"id": "specieswiki",
		"displayName": "Wikispecies",
		"baseUrl": "https://species.wikimedia.org",
		"dir": "ltr",
		"language": "species",
		"family": "species"
	},
	{
		"id": "sqwiki",
		"displayName": "Albanian Wikipedia",
		"baseUrl": "https://sq.wikipedia.org",
		"dir": "ltr",
		"language": "sq",
		"family": "wiki"
	},
	{
		"id": "sqwikibooks",
		"displayName": "Albanian Wikibooks",
		"baseUrl": "https://sq.wikibooks.org",
		"dir": "ltr",
		"language": "sq",
		"family": "wikibooks"
	},
	{
		"id": "sqwikiquote",
		"displayName": "Albanian Wikiquote",
		"baseUrl": "https://sq.wikiquote.org",
		"dir": "ltr",
		"language": "sq",
		"family": "wikiquote"
	},
	{
		"id": "sqwiktionary",
		"displayName": "Albanian Wiktionary",
		"baseUrl": "https://sq.wiktionary.org",
		"dir": "ltr",
		"language": "sq",
		"family": "wiktionary"
	},
	{
		"id": "srnwiki",
		"displayName": "Sranan Tongo Wikipedia",
		"baseUrl": "https://srn.wikipedia.org",
		"dir": "ltr",
		"language": "srn",
		"family": "wiki"
	},
	{
		"id": "srwiki",
		"displayName": "Serbian Википедија",
		"baseUrl": "https://sr.wikipedia.org",
		"dir": "ltr",
		"language": "sr",
		"family": "wiki"
	},
	{
		"id": "srwikibooks",
		"displayName": "Serbian Викикњиге",
		"baseUrl": "https://sr.wikibooks.org",
		"dir": "ltr",
		"language": "sr",
		"family": "wikibooks"
	},
	{
		"id": "srwikiquote",
		"displayName": "Serbian Викицитат",
		"baseUrl": "https://sr.wikiquote.org",
		"dir": "ltr",
		"language": "sr",
		"family": "wikiquote"
	},
	{
		"id": "srwikisource",
		"displayName": "Serbian Викизворник",
		"baseUrl": "https://sr.wikisource.org",
		"dir": "ltr",
		"language": "sr",
		"family": "wikisource"
	},
	{
		"id": "srwiktionary",
		"displayName": "Serbian Викиречник",
		"baseUrl": "https://sr.wiktionary.org",
		"dir": "ltr",
		"language": "sr",
		"family": "wiktionary"
	},
	{
		"id": "sswiki",
		"displayName": "Swati Wikipedia",
		"baseUrl": "https://ss.wikipedia.org",
		"dir": "ltr",
		"language": "ss",
		"family": "wiki"
	},
	{
		"id": "sswiktionary",
		"displayName": "Swati Wiktionary",
		"baseUrl": "https://ss.wiktionary.org",
		"dir": "ltr",
		"language": "ss",
		"family": "wiktionary"
	},
	{
		"id": "stqwiki",
		"displayName": "Saterland Frisian Wikipedia",
		"baseUrl": "https://stq.wikipedia.org",
		"dir": "ltr",
		"language": "stq",
		"family": "wiki"
	},
	{
		"id": "stwiki",
		"displayName": "Southern Sotho Wikipedia",
		"baseUrl": "https://st.wikipedia.org",
		"dir": "ltr",
		"language": "st",
		"family": "wiki"
	},
	{
		"id": "stwiktionary",
		"displayName": "Southern Sotho Wiktionary",
		"baseUrl": "https://st.wiktionary.org",
		"dir": "ltr",
		"language": "st",
		"family": "wiktionary"
	},
	{
		"id": "suwiki",
		"displayName": "Sundanese Wikipedia",
		"baseUrl": "https://su.wikipedia.org",
		"dir": "ltr",
		"language": "su",
		"family": "wiki"
	},
	{
		"id": "suwikiquote",
		"displayName": "Sundanese Wikiquote",
		"baseUrl": "https://su.wikiquote.org",
		"dir": "ltr",
		"language": "su",
		"family": "wikiquote"
	},
	{
		"id": "suwikisource",
		"displayName": "Sundanese Wikipabukon",
		"baseUrl": "https://su.wikisource.org",
		"dir": "ltr",
		"language": "su",
		"family": "wikisource"
	},
	{
		"id": "suwiktionary",
		"displayName": "Sundanese Wiktionary",
		"baseUrl": "https://su.wiktionary.org",
		"dir": "ltr",
		"language": "su",
		"family": "wiktionary"
	},
	{
		"id": "svwiki",
		"displayName": "Swedish Wikipedia",
		"baseUrl": "https://sv.wikipedia.org",
		"dir": "ltr",
		"language": "sv",
		"family": "wiki"
	},
	{
		"id": "svwikibooks",
		"displayName": "Swedish Wikibooks",
		"baseUrl": "https://sv.wikibooks.org",
		"dir": "ltr",
		"language": "sv",
		"family": "wikibooks"
	},
	{
		"id": "svwikiquote",
		"displayName": "Swedish Wikiquote",
		"baseUrl": "https://sv.wikiquote.org",
		"dir": "ltr",
		"language": "sv",
		"family": "wikiquote"
	},
	{
		"id": "svwikisource",
		"displayName": "Swedish Wikisource",
		"baseUrl": "https://sv.wikisource.org",
		"dir": "ltr",
		"language": "sv",
		"family": "wikisource"
	},
	{
		"id": "svwikiversity",
		"displayName": "Swedish Wikiversity",
		"baseUrl": "https://sv.wikiversity.org",
		"dir": "ltr",
		"language": "sv",
		"family": "wikiversity"
	},
	{
		"id": "svwikivoyage",
		"displayName": "Swedish Wikivoyage",
		"baseUrl": "https://sv.wikivoyage.org",
		"dir": "ltr",
		"language": "sv",
		"family": "wikivoyage"
	},
	{
		"id": "svwiktionary",
		"displayName": "Swedish Wiktionary",
		"baseUrl": "https://sv.wiktionary.org",
		"dir": "ltr",
		"language": "sv",
		"family": "wiktionary"
	},
	{
		"id": "swwiki",
		"displayName": "Swahili Wikipedia",
		"baseUrl": "https://sw.wikipedia.org",
		"dir": "ltr",
		"language": "sw",
		"family": "wiki"
	},
	{
		"id": "swwiktionary",
		"displayName": "Swahili Wiktionary",
		"baseUrl": "https://sw.wiktionary.org",
		"dir": "ltr",
		"language": "sw",
		"family": "wiktionary"
	},
	{
		"id": "sylwiki",
		"displayName": "Sylheti ꠃꠁꠇꠤꠙꠤꠒꠤꠀ",
		"baseUrl": "https://syl.wikipedia.org",
		"dir": "ltr",
		"language": "syl",
		"family": "wiki"
	},
	{
		"id": "szlwiki",
		"displayName": "Silesian Wikipedia",
		"baseUrl": "https://szl.wikipedia.org",
		"dir": "ltr",
		"language": "szl",
		"family": "wiki"
	},
	{
		"id": "szywiki",
		"displayName": "Sakizaya Wikipitiya",
		"baseUrl": "https://szy.wikipedia.org",
		"dir": "ltr",
		"language": "szy",
		"family": "wiki"
	},
	{
		"id": "tawiki",
		"displayName": "Tamil விக்கிப்பீடியா",
		"baseUrl": "https://ta.wikipedia.org",
		"dir": "ltr",
		"language": "ta",
		"family": "wiki"
	},
	{
		"id": "tawikibooks",
		"displayName": "Tamil விக்கிநூல்கள்",
		"baseUrl": "https://ta.wikibooks.org",
		"dir": "ltr",
		"language": "ta",
		"family": "wikibooks"
	},
	{
		"id": "tawikiquote",
		"displayName": "Tamil விக்கிமேற்கோள்",
		"baseUrl": "https://ta.wikiquote.org",
		"dir": "ltr",
		"language": "ta",
		"family": "wikiquote"
	},
	{
		"id": "tawikisource",
		"displayName": "Tamil விக்கிமூலம்",
		"baseUrl": "https://ta.wikisource.org",
		"dir": "ltr",
		"language": "ta",
		"family": "wikisource"
	},
	{
		"id": "tawiktionary",
		"displayName": "Tamil விக்சனரி",
		"baseUrl": "https://ta.wiktionary.org",
		"dir": "ltr",
		"language": "ta",
		"family": "wiktionary"
	},
	{
		"id": "taywiki",
		"displayName": "Atayal Wikipidia",
		"baseUrl": "https://tay.wikipedia.org",
		"dir": "ltr",
		"language": "tay",
		"family": "wiki"
	},
	{
		"id": "tcywiki",
		"displayName": "Tulu ವಿಕಿಪೀಡಿಯ",
		"baseUrl": "https://tcy.wikipedia.org",
		"dir": "ltr",
		"language": "tcy",
		"family": "wiki"
	},
	{
		"id": "tcywikisource",
		"displayName": "Tulu ವಿಕಿಸೋರ್ಸ್",
		"baseUrl": "https://tcy.wikisource.org",
		"dir": "ltr",
		"language": "tcy",
		"family": "wikisource"
	},
	{
		"id": "tcywiktionary",
		"displayName": "Tulu ವಿಕ್ಷನರಿ",
		"baseUrl": "https://tcy.wiktionary.org",
		"dir": "ltr",
		"language": "tcy",
		"family": "wiktionary"
	},
	{
		"id": "tddwiki",
		"displayName": "Tai Nuea ᥝᥤᥱ ᥑᥤᥱ ᥚᥤᥱ ᥖᥤᥱ ᥕᥣᥱ",
		"baseUrl": "https://tdd.wikipedia.org",
		"dir": "ltr",
		"language": "tdd",
		"family": "wiki"
	},
	{
		"id": "test2wiki",
		"displayName": "Wikipedia",
		"baseUrl": "https://test2.wikipedia.org",
		"dir": "ltr",
		"language": "en",
		"family": "test2"
	},
	{
		"id": "testcommonswiki",
		"displayName": "Test Wikimedia Commons",
		"baseUrl": "https://test-commons.wikimedia.org",
		"dir": "ltr",
		"language": "testcommons",
		"family": "testcommons"
	},
	{
		"id": "testwiki",
		"displayName": "Wikipedia",
		"baseUrl": "https://test.wikipedia.org",
		"dir": "ltr",
		"language": "en",
		"family": "test"
	},
	{
		"id": "testwikidatawiki",
		"displayName": "Wikipedia",
		"baseUrl": "https://test.wikidata.org",
		"dir": "ltr",
		"language": "testwikidata",
		"family": "testwikidata"
	},
	{
		"id": "tetwiki",
		"displayName": "Tetum Wikipedia",
		"baseUrl": "https://tet.wikipedia.org",
		"dir": "ltr",
		"language": "tet",
		"family": "wiki"
	},
	{
		"id": "tewiki",
		"displayName": "Telugu వికీపీడియా",
		"baseUrl": "https://te.wikipedia.org",
		"dir": "ltr",
		"language": "te",
		"family": "wiki"
	},
	{
		"id": "tewikibooks",
		"displayName": "Telugu Wikibooks",
		"baseUrl": "https://te.wikibooks.org",
		"dir": "ltr",
		"language": "te",
		"family": "wikibooks"
	},
	{
		"id": "tewikiquote",
		"displayName": "Telugu వికీవ్యాఖ్య",
		"baseUrl": "https://te.wikiquote.org",
		"dir": "ltr",
		"language": "te",
		"family": "wikiquote"
	},
	{
		"id": "tewikisource",
		"displayName": "Telugu వికీసోర్స్",
		"baseUrl": "https://te.wikisource.org",
		"dir": "ltr",
		"language": "te",
		"family": "wikisource"
	},
	{
		"id": "tewiktionary",
		"displayName": "Telugu విక్షనరీ",
		"baseUrl": "https://te.wiktionary.org",
		"dir": "ltr",
		"language": "te",
		"family": "wiktionary"
	},
	{
		"id": "tgwiki",
		"displayName": "Tajik Википедиа",
		"baseUrl": "https://tg.wikipedia.org",
		"dir": "ltr",
		"language": "tg",
		"family": "wiki"
	},
	{
		"id": "tgwikibooks",
		"displayName": "Tajik Wikibooks",
		"baseUrl": "https://tg.wikibooks.org",
		"dir": "ltr",
		"language": "tg",
		"family": "wikibooks"
	},
	{
		"id": "tgwiktionary",
		"displayName": "Tajik Wiktionary",
		"baseUrl": "https://tg.wiktionary.org",
		"dir": "ltr",
		"language": "tg",
		"family": "wiktionary"
	},
	{
		"id": "thwiki",
		"displayName": "Thai วิกิพีเดีย",
		"baseUrl": "https://th.wikipedia.org",
		"dir": "ltr",
		"language": "th",
		"family": "wiki"
	},
	{
		"id": "thwikibooks",
		"displayName": "Thai วิกิตำรา",
		"baseUrl": "https://th.wikibooks.org",
		"dir": "ltr",
		"language": "th",
		"family": "wikibooks"
	},
	{
		"id": "thwikimedia",
		"displayName": "Wikimedia",
		"baseUrl": "https://th.wikimedia.org",
		"dir": "ltr",
		"language": "th",
		"family": "thwikimedia"
	},
	{
		"id": "thwikiquote",
		"displayName": "Thai วิกิคำคม",
		"baseUrl": "https://th.wikiquote.org",
		"dir": "ltr",
		"language": "th",
		"family": "wikiquote"
	},
	{
		"id": "thwikisource",
		"displayName": "Thai วิกิซอร์ซ",
		"baseUrl": "https://th.wikisource.org",
		"dir": "ltr",
		"language": "th",
		"family": "wikisource"
	},
	{
		"id": "thwiktionary",
		"displayName": "Thai Wiktionary",
		"baseUrl": "https://th.wiktionary.org",
		"dir": "ltr",
		"language": "th",
		"family": "wiktionary"
	},
	{
		"id": "tigwiki",
		"displayName": "Tigre ዊኪፒድያ",
		"baseUrl": "https://tig.wikipedia.org",
		"dir": "ltr",
		"language": "tig",
		"family": "wiki"
	},
	{
		"id": "tiwiki",
		"displayName": "Tigrinya ዊኪፔዲያ",
		"baseUrl": "https://ti.wikipedia.org",
		"dir": "ltr",
		"language": "ti",
		"family": "wiki"
	},
	{
		"id": "tiwiktionary",
		"displayName": "Tigrinya ዊኪ-መዝገበ-ቃላት",
		"baseUrl": "https://ti.wiktionary.org",
		"dir": "ltr",
		"language": "ti",
		"family": "wiktionary"
	},
	{
		"id": "tkwiki",
		"displayName": "Turkmen Wikipediýa",
		"baseUrl": "https://tk.wikipedia.org",
		"dir": "ltr",
		"language": "tk",
		"family": "wiki"
	},
	{
		"id": "tkwiktionary",
		"displayName": "Turkmen Wikisözlük",
		"baseUrl": "https://tk.wiktionary.org",
		"dir": "ltr",
		"language": "tk",
		"family": "wiktionary"
	},
	{
		"id": "tlwiki",
		"displayName": "Tagalog Wikipedia",
		"baseUrl": "https://tl.wikipedia.org",
		"dir": "ltr",
		"language": "tl",
		"family": "wiki"
	},
	{
		"id": "tlwikibooks",
		"displayName": "Tagalog Wikibooks",
		"baseUrl": "https://tl.wikibooks.org",
		"dir": "ltr",
		"language": "tl",
		"family": "wikibooks"
	},
	{
		"id": "tlwikiquote",
		"displayName": "Tagalog Wikiquote",
		"baseUrl": "https://tl.wikiquote.org",
		"dir": "ltr",
		"language": "tl",
		"family": "wikiquote"
	},
	{
		"id": "tlwikisource",
		"displayName": "Tagalog Wikisource",
		"baseUrl": "https://tl.wikisource.org",
		"dir": "ltr",
		"language": "tl",
		"family": "wikisource"
	},
	{
		"id": "tlwiktionary",
		"displayName": "Tagalog Wiksiyonaryo",
		"baseUrl": "https://tl.wiktionary.org",
		"dir": "ltr",
		"language": "tl",
		"family": "wiktionary"
	},
	{
		"id": "tlywiki",
		"displayName": "Talysh Vikipedija",
		"baseUrl": "https://tly.wikipedia.org",
		"dir": "ltr",
		"language": "tly",
		"family": "wiki"
	},
	{
		"id": "tnwiki",
		"displayName": "Tswana Wikipedia",
		"baseUrl": "https://tn.wikipedia.org",
		"dir": "ltr",
		"language": "tn",
		"family": "wiki"
	},
	{
		"id": "tnwiktionary",
		"displayName": "Tswana Wiktionary",
		"baseUrl": "https://tn.wiktionary.org",
		"dir": "ltr",
		"language": "tn",
		"family": "wiktionary"
	},
	{
		"id": "tokwiki",
		"displayName": "Toki Pona lipu Wikipesija",
		"baseUrl": "https://tok.wikipedia.org",
		"dir": "ltr",
		"language": "tok",
		"family": "wiki"
	},
	{
		"id": "towiki",
		"displayName": "Tongan Wikipedia",
		"baseUrl": "https://to.wikipedia.org",
		"dir": "ltr",
		"language": "to",
		"family": "wiki"
	},
	{
		"id": "tpiwiki",
		"displayName": "Tok Pisin Wikipedia",
		"baseUrl": "https://tpi.wikipedia.org",
		"dir": "ltr",
		"language": "tpi",
		"family": "wiki"
	},
	{
		"id": "tpiwiktionary",
		"displayName": "Tok Pisin Wiktionary",
		"baseUrl": "https://tpi.wiktionary.org",
		"dir": "ltr",
		"language": "tpi",
		"family": "wiktionary"
	},
	{
		"id": "trvwiki",
		"displayName": "Taroko Wikipidiya",
		"baseUrl": "https://trv.wikipedia.org",
		"dir": "ltr",
		"language": "trv",
		"family": "wiki"
	},
	{
		"id": "trwiki",
		"displayName": "Turkish Vikipedi",
		"baseUrl": "https://tr.wikipedia.org",
		"dir": "ltr",
		"language": "tr",
		"family": "wiki"
	},
	{
		"id": "trwikibooks",
		"displayName": "Turkish Vikikitap",
		"baseUrl": "https://tr.wikibooks.org",
		"dir": "ltr",
		"language": "tr",
		"family": "wikibooks"
	},
	{
		"id": "trwikimedia",
		"displayName": "Wikimedia Türkiye",
		"baseUrl": "https://tr.wikimedia.org",
		"dir": "ltr",
		"language": "tr",
		"family": "trwikimedia"
	},
	{
		"id": "trwikiquote",
		"displayName": "Turkish Vikisöz",
		"baseUrl": "https://tr.wikiquote.org",
		"dir": "ltr",
		"language": "tr",
		"family": "wikiquote"
	},
	{
		"id": "trwikisource",
		"displayName": "Turkish Vikikaynak",
		"baseUrl": "https://tr.wikisource.org",
		"dir": "ltr",
		"language": "tr",
		"family": "wikisource"
	},
	{
		"id": "trwikivoyage",
		"displayName": "Turkish Vikigezgin",
		"baseUrl": "https://tr.wikivoyage.org",
		"dir": "ltr",
		"language": "tr",
		"family": "wikivoyage"
	},
	{
		"id": "trwiktionary",
		"displayName": "Turkish Vikisözlük",
		"baseUrl": "https://tr.wiktionary.org",
		"dir": "ltr",
		"language": "tr",
		"family": "wiktionary"
	},
	{
		"id": "tswiki",
		"displayName": "Tsonga Wikipedia",
		"baseUrl": "https://ts.wikipedia.org",
		"dir": "ltr",
		"language": "ts",
		"family": "wiki"
	},
	{
		"id": "tswiktionary",
		"displayName": "Tsonga Wiktionary",
		"baseUrl": "https://ts.wiktionary.org",
		"dir": "ltr",
		"language": "ts",
		"family": "wiktionary"
	},
	{
		"id": "ttwiki",
		"displayName": "Tatar Wikipedia",
		"baseUrl": "https://tt.wikipedia.org",
		"dir": "ltr",
		"language": "tt",
		"family": "wiki"
	},
	{
		"id": "ttwikibooks",
		"displayName": "Tatar Wikibooks",
		"baseUrl": "https://tt.wikibooks.org",
		"dir": "ltr",
		"language": "tt",
		"family": "wikibooks"
	},
	{
		"id": "ttwiktionary",
		"displayName": "Tatar Wiktionary",
		"baseUrl": "https://tt.wiktionary.org",
		"dir": "ltr",
		"language": "tt",
		"family": "wiktionary"
	},
	{
		"id": "tumwiki",
		"displayName": "Tumbuka Wikipedia",
		"baseUrl": "https://tum.wikipedia.org",
		"dir": "ltr",
		"language": "tum",
		"family": "wiki"
	},
	{
		"id": "twwiki",
		"displayName": "Twi Wikipedia",
		"baseUrl": "https://tw.wikipedia.org",
		"dir": "ltr",
		"language": "tw",
		"family": "wiki"
	},
	{
		"id": "tyvwiki",
		"displayName": "Tuvinian Википедия",
		"baseUrl": "https://tyv.wikipedia.org",
		"dir": "ltr",
		"language": "tyv",
		"family": "wiki"
	},
	{
		"id": "tywiki",
		"displayName": "Tahitian Wikipedia",
		"baseUrl": "https://ty.wikipedia.org",
		"dir": "ltr",
		"language": "ty",
		"family": "wiki"
	},
	{
		"id": "uawikimedia",
		"displayName": "Вікімедіа Україна",
		"baseUrl": "https://ua.wikimedia.org",
		"dir": "ltr",
		"language": "uk",
		"family": "uawikimedia"
	},
	{
		"id": "udmwiki",
		"displayName": "Udmurt Википедия",
		"baseUrl": "https://udm.wikipedia.org",
		"dir": "ltr",
		"language": "udm",
		"family": "wiki"
	},
	{
		"id": "ugwiki",
		"displayName": "Uyghur Wikipedia",
		"baseUrl": "https://ug.wikipedia.org",
		"dir": "rtl",
		"language": "ug",
		"family": "wiki"
	},
	{
		"id": "ugwiktionary",
		"displayName": "Uyghur Wiktionary",
		"baseUrl": "https://ug.wiktionary.org",
		"dir": "rtl",
		"language": "ug",
		"family": "wiktionary"
	},
	{
		"id": "ukwiki",
		"displayName": "Ukrainian Вікіпедія",
		"baseUrl": "https://uk.wikipedia.org",
		"dir": "ltr",
		"language": "uk",
		"family": "wiki"
	},
	{
		"id": "ukwikibooks",
		"displayName": "Ukrainian Вікіпідручник",
		"baseUrl": "https://uk.wikibooks.org",
		"dir": "ltr",
		"language": "uk",
		"family": "wikibooks"
	},
	{
		"id": "ukwikiquote",
		"displayName": "Ukrainian Вікіцитати",
		"baseUrl": "https://uk.wikiquote.org",
		"dir": "ltr",
		"language": "uk",
		"family": "wikiquote"
	},
	{
		"id": "ukwikisource",
		"displayName": "Ukrainian Вікіджерела",
		"baseUrl": "https://uk.wikisource.org",
		"dir": "ltr",
		"language": "uk",
		"family": "wikisource"
	},
	{
		"id": "ukwikivoyage",
		"displayName": "Ukrainian Вікімандри",
		"baseUrl": "https://uk.wikivoyage.org",
		"dir": "ltr",
		"language": "uk",
		"family": "wikivoyage"
	},
	{
		"id": "ukwiktionary",
		"displayName": "Ukrainian Вікісловник",
		"baseUrl": "https://uk.wiktionary.org",
		"dir": "ltr",
		"language": "uk",
		"family": "wiktionary"
	},
	{
		"id": "urwiki",
		"displayName": "Urdu ویکیپیڈیا",
		"baseUrl": "https://ur.wikipedia.org",
		"dir": "rtl",
		"language": "ur",
		"family": "wiki"
	},
	{
		"id": "urwikibooks",
		"displayName": "Urdu ویکی کتب",
		"baseUrl": "https://ur.wikibooks.org",
		"dir": "rtl",
		"language": "ur",
		"family": "wikibooks"
	},
	{
		"id": "urwikiquote",
		"displayName": "Urdu ویکی اقتباس",
		"baseUrl": "https://ur.wikiquote.org",
		"dir": "rtl",
		"language": "ur",
		"family": "wikiquote"
	},
	{
		"id": "urwikisource",
		"displayName": "Urdu ویکی ماخذ",
		"baseUrl": "https://ur.wikisource.org",
		"dir": "rtl",
		"language": "ur",
		"family": "wikisource"
	},
	{
		"id": "urwiktionary",
		"displayName": "Urdu ویکی لغت",
		"baseUrl": "https://ur.wiktionary.org",
		"dir": "rtl",
		"language": "ur",
		"family": "wiktionary"
	},
	{
		"id": "uzwiki",
		"displayName": "Uzbek Vikipediya",
		"baseUrl": "https://uz.wikipedia.org",
		"dir": "ltr",
		"language": "uz",
		"family": "wiki"
	},
	{
		"id": "uzwikiquote",
		"displayName": "Uzbek Vikiiqtibos",
		"baseUrl": "https://uz.wikiquote.org",
		"dir": "ltr",
		"language": "uz",
		"family": "wikiquote"
	},
	{
		"id": "uzwiktionary",
		"displayName": "Uzbek Vikilugʻat",
		"baseUrl": "https://uz.wiktionary.org",
		"dir": "ltr",
		"language": "uz",
		"family": "wiktionary"
	},
	{
		"id": "vecwiki",
		"displayName": "Venetian Wikipedia",
		"baseUrl": "https://vec.wikipedia.org",
		"dir": "ltr",
		"language": "vec",
		"family": "wiki"
	},
	{
		"id": "vecwikisource",
		"displayName": "Venetian Wikisource",
		"baseUrl": "https://vec.wikisource.org",
		"dir": "ltr",
		"language": "vec",
		"family": "wikisource"
	},
	{
		"id": "vecwiktionary",
		"displayName": "Venetian Wikisionario",
		"baseUrl": "https://vec.wiktionary.org",
		"dir": "ltr",
		"language": "vec",
		"family": "wiktionary"
	},
	{
		"id": "vepwiki",
		"displayName": "Veps Vikipedii",
		"baseUrl": "https://vep.wikipedia.org",
		"dir": "ltr",
		"language": "vep",
		"family": "wiki"
	},
	{
		"id": "vewiki",
		"displayName": "Venda Wikipedia",
		"baseUrl": "https://ve.wikipedia.org",
		"dir": "ltr",
		"language": "ve",
		"family": "wiki"
	},
	{
		"id": "viwiki",
		"displayName": "Vietnamese Wikipedia",
		"baseUrl": "https://vi.wikipedia.org",
		"dir": "ltr",
		"language": "vi",
		"family": "wiki"
	},
	{
		"id": "viwikibooks",
		"displayName": "Vietnamese Wikibooks",
		"baseUrl": "https://vi.wikibooks.org",
		"dir": "ltr",
		"language": "vi",
		"family": "wikibooks"
	},
	{
		"id": "viwikiquote",
		"displayName": "Vietnamese Wikiquote",
		"baseUrl": "https://vi.wikiquote.org",
		"dir": "ltr",
		"language": "vi",
		"family": "wikiquote"
	},
	{
		"id": "viwikisource",
		"displayName": "Vietnamese Wikisource",
		"baseUrl": "https://vi.wikisource.org",
		"dir": "ltr",
		"language": "vi",
		"family": "wikisource"
	},
	{
		"id": "viwikivoyage",
		"displayName": "Vietnamese Wikivoyage",
		"baseUrl": "https://vi.wikivoyage.org",
		"dir": "ltr",
		"language": "vi",
		"family": "wikivoyage"
	},
	{
		"id": "viwiktionary",
		"displayName": "Vietnamese Wiktionary",
		"baseUrl": "https://vi.wiktionary.org",
		"dir": "ltr",
		"language": "vi",
		"family": "wiktionary"
	},
	{
		"id": "vlswiki",
		"displayName": "West Flemish Wikipedia",
		"baseUrl": "https://vls.wikipedia.org",
		"dir": "ltr",
		"language": "vls",
		"family": "wiki"
	},
	{
		"id": "vowiki",
		"displayName": "Volapük Vükiped",
		"baseUrl": "https://vo.wikipedia.org",
		"dir": "ltr",
		"language": "vo",
		"family": "wiki"
	},
	{
		"id": "vowiktionary",
		"displayName": "Volapük Vükivödabuk",
		"baseUrl": "https://vo.wiktionary.org",
		"dir": "ltr",
		"language": "vo",
		"family": "wiktionary"
	},
	{
		"id": "warwiki",
		"displayName": "Waray Wikipedia",
		"baseUrl": "https://war.wikipedia.org",
		"dir": "ltr",
		"language": "war",
		"family": "wiki"
	},
	{
		"id": "wawiki",
		"displayName": "Walloon Wikipedia",
		"baseUrl": "https://wa.wikipedia.org",
		"dir": "ltr",
		"language": "wa",
		"family": "wiki"
	},
	{
		"id": "wawikisource",
		"displayName": "Walloon Wikisource",
		"baseUrl": "https://wa.wikisource.org",
		"dir": "ltr",
		"language": "wa",
		"family": "wikisource"
	},
	{
		"id": "wawiktionary",
		"displayName": "Walloon Wiccionaire",
		"baseUrl": "https://wa.wiktionary.org",
		"dir": "ltr",
		"language": "wa",
		"family": "wiktionary"
	},
	{
		"id": "wikidatawiki",
		"displayName": "Wikipedia",
		"baseUrl": "https://www.wikidata.org",
		"dir": "ltr",
		"language": "wikidata",
		"family": "wikidata"
	},
	{
		"id": "wikifunctionswiki",
		"displayName": "Wikifunctions",
		"baseUrl": "https://www.wikifunctions.org",
		"dir": "ltr",
		"language": "en",
		"family": "wikifunctions"
	},
	{
		"id": "wikimaniawiki",
		"displayName": "Wikipedia",
		"baseUrl": "https://wikimania.wikimedia.org",
		"dir": "ltr",
		"language": "wikimania",
		"family": "wikimania"
	},
	{
		"id": "wowiki",
		"displayName": "Wolof Wikipedia",
		"baseUrl": "https://wo.wikipedia.org",
		"dir": "ltr",
		"language": "wo",
		"family": "wiki"
	},
	{
		"id": "wowiktionary",
		"displayName": "Wolof Wiktionary",
		"baseUrl": "https://wo.wiktionary.org",
		"dir": "ltr",
		"language": "wo",
		"family": "wiktionary"
	},
	{
		"id": "wuuwiki",
		"displayName": "Wu 维基百科",
		"baseUrl": "https://wuu.wikipedia.org",
		"dir": "ltr",
		"language": "wuu",
		"family": "wiki"
	},
	{
		"id": "xalwiki",
		"displayName": "Kalmyk Wikipedia",
		"baseUrl": "https://xal.wikipedia.org",
		"dir": "ltr",
		"language": "xal",
		"family": "wiki"
	},
	{
		"id": "xhwiki",
		"displayName": "Xhosa Wikipedia",
		"baseUrl": "https://xh.wikipedia.org",
		"dir": "ltr",
		"language": "xh",
		"family": "wiki"
	},
	{
		"id": "xmfwiki",
		"displayName": "Mingrelian ვიკიპედია",
		"baseUrl": "https://xmf.wikipedia.org",
		"dir": "ltr",
		"language": "xmf",
		"family": "wiki"
	},
	{
		"id": "yiwiki",
		"displayName": "Yiddish װיקיפּעדיע",
		"baseUrl": "https://yi.wikipedia.org",
		"dir": "rtl",
		"language": "yi",
		"family": "wiki"
	},
	{
		"id": "yiwikisource",
		"displayName": "Yiddish װיקיביבליאָטעק",
		"baseUrl": "https://yi.wikisource.org",
		"dir": "rtl",
		"language": "yi",
		"family": "wikisource"
	},
	{
		"id": "yiwiktionary",
		"displayName": "Yiddish װיקיװערטערבוך",
		"baseUrl": "https://yi.wiktionary.org",
		"dir": "rtl",
		"language": "yi",
		"family": "wiktionary"
	},
	{
		"id": "yowiki",
		"displayName": "Yoruba Wikipedia",
		"baseUrl": "https://yo.wikipedia.org",
		"dir": "ltr",
		"language": "yo",
		"family": "wiki"
	},
	{
		"id": "yuewiktionary",
		"displayName": "Cantonese 維基辭典",
		"baseUrl": "https://yue.wiktionary.org",
		"dir": "ltr",
		"language": "yue",
		"family": "wiktionary"
	},
	{
		"id": "zawiki",
		"displayName": "Zhuang Wikipedia",
		"baseUrl": "https://za.wikipedia.org",
		"dir": "ltr",
		"language": "za",
		"family": "wiki"
	},
	{
		"id": "zeawiki",
		"displayName": "Zeelandic Wikipedia",
		"baseUrl": "https://zea.wikipedia.org",
		"dir": "ltr",
		"language": "zea",
		"family": "wiki"
	},
	{
		"id": "zghwiki",
		"displayName": "Standard Moroccan Tamazight ⵡⵉⴽⵉⴱⵉⴷⵢⴰ",
		"baseUrl": "https://zgh.wikipedia.org",
		"dir": "ltr",
		"language": "zgh",
		"family": "wiki"
	},
	{
		"id": "zghwiktionary",
		"displayName": "Standard Moroccan Tamazight ⵡⵉⴽⵉⵎⴰⵡⴰⵍ",
		"baseUrl": "https://zgh.wiktionary.org",
		"dir": "ltr",
		"language": "zgh",
		"family": "wiktionary"
	},
	{
		"id": "zh_classicalwiki",
		"displayName": "Literary Chinese 維基大典",
		"baseUrl": "https://zh-classical.wikipedia.org",
		"dir": "ltr",
		"language": "lzh",
		"family": "wiki"
	},
	{
		"id": "zh_min_nanwiki",
		"displayName": "Minnan Wikipedia",
		"baseUrl": "https://zh-min-nan.wikipedia.org",
		"dir": "ltr",
		"language": "nan",
		"family": "wiki"
	},
	{
		"id": "zh_min_nanwikisource",
		"displayName": "Minnan Wiki Tô·-su-kóan",
		"baseUrl": "https://zh-min-nan.wikisource.org",
		"dir": "ltr",
		"language": "nan",
		"family": "wikisource"
	},
	{
		"id": "zh_min_nanwiktionary",
		"displayName": "Minnan Wiktionary",
		"baseUrl": "https://zh-min-nan.wiktionary.org",
		"dir": "ltr",
		"language": "nan",
		"family": "wiktionary"
	},
	{
		"id": "zh_yuewiki",
		"displayName": "Cantonese 維基百科",
		"baseUrl": "https://zh-yue.wikipedia.org",
		"dir": "ltr",
		"language": "yue",
		"family": "wiki"
	},
	{
		"id": "zhwiki",
		"displayName": "Chinese Wikipedia",
		"baseUrl": "https://zh.wikipedia.org",
		"dir": "ltr",
		"language": "zh",
		"family": "wiki"
	},
	{
		"id": "zhwikibooks",
		"displayName": "Chinese Wikibooks",
		"baseUrl": "https://zh.wikibooks.org",
		"dir": "ltr",
		"language": "zh",
		"family": "wikibooks"
	},
	{
		"id": "zhwikiquote",
		"displayName": "Chinese Wikiquote",
		"baseUrl": "https://zh.wikiquote.org",
		"dir": "ltr",
		"language": "zh",
		"family": "wikiquote"
	},
	{
		"id": "zhwikisource",
		"displayName": "Chinese Wikisource",
		"baseUrl": "https://zh.wikisource.org",
		"dir": "ltr",
		"language": "zh",
		"family": "wikisource"
	},
	{
		"id": "zhwikiversity",
		"displayName": "Chinese 維基學院",
		"baseUrl": "https://zh.wikiversity.org",
		"dir": "ltr",
		"language": "zh",
		"family": "wikiversity"
	},
	{
		"id": "zhwikivoyage",
		"displayName": "Chinese 维基导游",
		"baseUrl": "https://zh.wikivoyage.org",
		"dir": "ltr",
		"language": "zh",
		"family": "wikivoyage"
	},
	{
		"id": "zhwiktionary",
		"displayName": "Chinese Wiktionary",
		"baseUrl": "https://zh.wiktionary.org",
		"dir": "ltr",
		"language": "zh",
		"family": "wiktionary"
	},
	{
		"id": "zuwiki",
		"displayName": "Zulu Wikipedia",
		"baseUrl": "https://zu.wikipedia.org",
		"dir": "ltr",
		"language": "zu",
		"family": "wiki"
	},
	{
		"id": "zuwiktionary",
		"displayName": "Zulu Wiktionary",
		"baseUrl": "https://zu.wiktionary.org",
		"dir": "ltr",
		"language": "zu",
		"family": "wiktionary"
	}
]
