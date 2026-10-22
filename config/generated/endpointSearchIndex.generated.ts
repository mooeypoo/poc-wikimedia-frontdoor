/**
 * GENERATED FILE — DO NOT EDIT BY HAND.
 *
 * Keyword search index over the Wikimedia REST API endpoints, one record per
 * operation, derived from the committed OpenAPI specs in ./module-specs/.
 *
 * Each record carries a `deepLink` into the community API Explorer. The
 * operation hash is produced by Scalar's own navigation-id builders, so it is
 * only valid for the Scalar version pinned in `scalarApiReferenceVersion`
 * below — an upgrade that changes the format will change this file.
 *
 * Regenerate with:
 *   npm run generate-module-source-of-truth
 * (or just this phase: `-- --index-only`), then review the git diff.
 * See docs/adr-explorer-deep-linking.md §10.
 */

/** Opt-in gate that hides an endpoint's module in the explorer until enabled. */
export type GeneratedEndpointGate = 'beta' | 'internal'

export interface GeneratedEndpointSearchRecord {
	/** Full discovery module name (e.g. `site/v1`). */
	module: string
	/** Human-readable module title (e.g. `Site API`). */
	moduleTitle: string
	/** Instance id the deep link loads (shared quick-link policy). */
	instance: string
	/** Upper-case HTTP method (e.g. `GET`). */
	method: string
	/** OpenAPI path template (e.g. `/v1/page/{title}`). */
	path: string
	/** Operation summary, when the spec provides one. */
	summary?: string
	/** Plain-text excerpt of the operation description, when present. */
	description?: string
	/** OpenAPI `operationId`, when present. */
	operationId?: string
	/** OpenAPI tags, when present. */
	tags?: string[]
	/** Present and true when the spec marks the operation deprecated. */
	isDeprecated?: true
	/** Present when the endpoint's module is hidden behind an opt-in checkbox. */
	gate?: GeneratedEndpointGate
	/** Explorer deep link: `/explorer/direct/<instance>/<module>#<scalar-hash>`. */
	deepLink: string
}

export interface GeneratedEndpointSearchIndexMeta {
	generatedAt: string
	/** Scalar document slug the operation hashes were built against. */
	scalarDocumentSlug: string
	/** @scalar/api-reference version whose hash format these deep links match. */
	scalarApiReferenceVersion: string
	moduleCount: number
	endpointCount: number
	/** Modules with no captured spec — they contribute no records (not "no endpoints"). */
	modulesWithoutSpec: string[]
}

export const GENERATED_ENDPOINT_SEARCH_INDEX_META: GeneratedEndpointSearchIndexMeta = {
	"generatedAt": "2026-09-03T03:24:51.311Z",
	"scalarDocumentSlug": "front-door-api-explorer",
	"scalarApiReferenceVersion": "1.67.0",
	"moduleCount": 22,
	"endpointCount": 352,
	"modulesWithoutSpec": [
		"lift-wing/v1"
	]
}

export const GENERATED_ENDPOINT_SEARCH_INDEX: GeneratedEndpointSearchRecord[] = [
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/confirmedit/v0/hcaptcha/blocktoken",
		"operationId": "postConfirmeditV0HcaptchaBlocktoken",
		"deepLink": "/explorer/direct/enwiki/-#POST/confirmedit/v0/hcaptcha/blocktoken"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/eventbus/v0/internal/job/execute",
		"operationId": "postEventbusV0InternalJobExecute",
		"deepLink": "/explorer/direct/enwiki/-#POST/eventbus/v0/internal/job/execute"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/ipinfo/v0/archivedrevision/{id}",
		"operationId": "postIpinfoV0ArchivedrevisionById",
		"deepLink": "/explorer/direct/enwiki/-#POST/ipinfo/v0/archivedrevision/{id}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/ipinfo/v0/log/{id}",
		"operationId": "postIpinfoV0LogById",
		"deepLink": "/explorer/direct/enwiki/-#POST/ipinfo/v0/log/{id}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/ipinfo/v0/norevision/{username}",
		"operationId": "postIpinfoV0NorevisionByUsername",
		"deepLink": "/explorer/direct/enwiki/-#POST/ipinfo/v0/norevision/{username}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/ipinfo/v0/revision/{id}",
		"operationId": "postIpinfoV0RevisionById",
		"deepLink": "/explorer/direct/enwiki/-#POST/ipinfo/v0/revision/{id}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/math/v0/popup/html/{qid}",
		"operationId": "getMathV0PopupHtmlByQid",
		"deepLink": "/explorer/direct/enwiki/-#GET/math/v0/popup/html/{qid}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/oauth2/access_token",
		"summary": "Get an OAuth 2.0 access token",
		"description": "The OAuth 2.0 token endpoint. Exchanges an authorization code, refresh token or client credentials for an access token.",
		"operationId": "postGetAnOauth20AccessToken",
		"deepLink": "/explorer/direct/enwiki/-#POST/oauth2/access_token"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/oauth2/authorize",
		"summary": "Authorize an OAuth 2.0 client",
		"description": "The OAuth 2.0 authorization endpoint. Displays the OAuth 2.0 authorization page, where users can grant or deny access to a client. Also processes the authorization decision when the form is submitted.",
		"operationId": "getAuthorizeAnOauth20Client",
		"deepLink": "/explorer/direct/enwiki/-#GET/oauth2/authorize"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/oauth2/client",
		"summary": "List current user's OAuth clients",
		"description": "Returns information about the OAuth 1.0 or 2.0 clients registered by the current user.",
		"operationId": "getListCurrentUserSOauthClients",
		"deepLink": "/explorer/direct/enwiki/-#GET/oauth2/client"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/oauth2/client",
		"summary": "Register a new OAuth 2.0 client",
		"description": "Registers a new OAuth 2.0 client application. The API equivalent of Special:OAuthConsumerRegistration/propose/oauth2 .",
		"operationId": "postRegisterANewOauth20Client",
		"deepLink": "/explorer/direct/enwiki/-#POST/oauth2/client"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/oauth2/client/{client_key}/reset_secret",
		"summary": "Reset an OAuth 2.0 client secret",
		"description": "Resets the client secret for an OAuth 2.0 application.",
		"operationId": "postResetAnOauth20ClientSecret",
		"deepLink": "/explorer/direct/enwiki/-#POST/oauth2/client/{client_key}/reset_secret"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/oauth2/resource/{type}",
		"summary": "Get OAuth 2.0 resource information",
		"description": "With type=profile , acts as the OIDC userinfo endpoint. With type=scope , enumerates the scopes the client has.",
		"operationId": "getGetOauth20ResourceInformation",
		"deepLink": "/explorer/direct/enwiki/-#GET/oauth2/resource/{type}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/securepoll/set_translation/{entityid}/{language}",
		"operationId": "postSecurepollSetTranslationByEntityidByLanguage",
		"deepLink": "/explorer/direct/enwiki/-#POST/securepoll/set_translation/{entityid}/{language}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/file/{title}",
		"summary": "Get file",
		"description": "Returns information about a file, including links to download the file in thumbnail, preview, and original formats.",
		"operationId": "getGetFile",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/file/{title}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/file/{title}/thumbnails",
		"summary": "Get file thumbnails",
		"description": "Returns the standard thumbnail derivatives available for a file.",
		"operationId": "getGetFileThumbnails",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/file/{title}/thumbnails"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/page",
		"summary": "Create page",
		"description": "Creates a page.",
		"operationId": "postCreatePage",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/page"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}",
		"summary": "Get page source",
		"description": "Returns information about a page, including the page source, usually in wikitext.",
		"operationId": "getGetPageSource",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/v1/page/{title}",
		"summary": "Update page",
		"description": "Edits a page based on the page's latest revision identifier, or creates a page if no revision identifier is given. If there is a merge conflict, the API attempts to resolve the conflict",
		"operationId": "putUpdatePage",
		"deepLink": "/explorer/direct/enwiki/-#PUT/v1/page/{title}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}/bare",
		"summary": "Get page",
		"description": "Returns information about a page.",
		"operationId": "getGetPage",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}/bare"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}/history",
		"summary": "Get page history",
		"description": "Returns information about the latest revisions to a page, in segments of 20 revisions, starting with the latest revision. The response includes URLs to get the next oldest, next newest, and latest",
		"operationId": "getGetPageHistory",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}/history"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}/history/counts/{type}",
		"summary": "Get page history counts",
		"description": "Returns data about a page's history, such as the number of edits made by different types of users. For more data about how readers and editors interact with Wikimedia projects, see the Analytics API.",
		"operationId": "getGetPageHistoryCounts",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}/history/counts/{type}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}/html",
		"summary": "Get HTML",
		"description": "Returns the content of a page in HTML.",
		"operationId": "getGetHtml",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}/html"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}/links/language",
		"summary": "Get languages",
		"description": "Lists pages with the same topic in different languages.",
		"operationId": "getGetLanguages",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}/links/language"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}/links/media",
		"summary": "Get files on page",
		"description": "Lists media files used on a page, up to 100 files.",
		"operationId": "getGetFilesOnPage",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}/links/media"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}/lint",
		"summary": "Get page lint errors",
		"description": "Returns the lint errors for a page.",
		"operationId": "getGetPageLintErrors",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}/lint"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/page/{title}/with_html",
		"summary": "Get page with HTML",
		"description": "Returns information about a page, including the page content in HTML.",
		"operationId": "getGetPageWithHtml",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/page/{title}/with_html"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/revision/{from}/compare/{to}",
		"summary": "Compare revisions",
		"description": "Returns information that lets you display a line-by-line comparison of two revisions. Only text-based wiki pages can be compared.",
		"operationId": "getCompareRevisions",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/revision/{from}/compare/{to}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/revision/{id}",
		"summary": "Get revision source",
		"description": "Returns information about a revision, including the revision source, usually in wikitext.",
		"operationId": "getGetRevisionSource",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/revision/{id}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/revision/{id}/bare",
		"summary": "Get revision",
		"description": "Returns information about a revision.",
		"operationId": "getGetRevision",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/revision/{id}/bare"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/revision/{id}/html",
		"summary": "Get revision HTML",
		"description": "Returns the content of a revision in HTML.",
		"operationId": "getGetRevisionHtml",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/revision/{id}/html"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/revision/{id}/lint",
		"summary": "Get revision lint errors",
		"description": "Returns the lint errors for a revision.",
		"operationId": "getGetRevisionLintErrors",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/revision/{id}/lint"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/revision/{id}/with_html",
		"summary": "Get revision information with HTML",
		"description": "Returns information about a revision, including the revision content in HTML.",
		"operationId": "getGetRevisionInformationWithHtml",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/revision/{id}/with_html"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/search",
		"summary": "Get OpenSearch description document",
		"description": "Returns an OpenSearch description document.",
		"operationId": "getGetOpensearchDescriptionDocument",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/search"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/search/page",
		"summary": "List pages by search query",
		"description": "Lists pages matching the given search terms.",
		"operationId": "getListPagesBySearchQuery",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/search/page"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/v1/search/title",
		"summary": "List pages by title query",
		"description": "Lists pages with titles that begin with the given search terms. You can use this endpoint as an autocomplete search that suggests relevant pages by title.",
		"operationId": "getListPagesByTitleQuery",
		"deepLink": "/explorer/direct/enwiki/-#GET/v1/search/title"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/html/to/wikitext",
		"summary": "Convert HTML to Wikitext",
		"description": "Converts HTML provided in the request body into wikitext.",
		"operationId": "postConvertHtmlToWikitext2",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/html/to/wikitext"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/html/to/wikitext/{title}",
		"summary": "Convert HTML to Wikitext",
		"description": "Converts HTML into wikitext. The html request body parameter must be provided, but can be empty to receive the full page. The response body contains the wikitext of the page.",
		"operationId": "postConvertHtmlToWikitext3",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/html/to/wikitext/{title}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/html/to/wikitext/{title}/{revision}",
		"summary": "Convert HTML to Wikitext",
		"description": "Converts the HTML of a given revision to wikitext. The html request body parameter must be provided, but can be left empty to receive the full revision. The response body contains the Wikitext of the",
		"operationId": "postConvertHtmlToWikitext",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/html/to/wikitext/{title}/{revision}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/wikitext/to/html",
		"summary": "Convert Wikitext to HTML",
		"description": "Converts wikitext provided in the request body to HTML.",
		"operationId": "postConvertWikitextToHtml2",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/wikitext/to/html"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/wikitext/to/html/{title}",
		"summary": "Convert Wikitext to HTML",
		"description": "Converts wikitext into HTML. The wikitext request body parameter must be provided, but can be left empty to receive the full page. The response body contains the rendered HTML of the page.",
		"operationId": "postConvertWikitextToHtml3",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/wikitext/to/html/{title}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/wikitext/to/html/{title}/{revision}",
		"summary": "Convert Wikitext to HTML",
		"description": "Converts the wikitext of a given revision to HTML. The wikitext request body parameter must be provided, but can be left empty to receive the full revision. The response body contains the rendered",
		"operationId": "postConvertWikitextToHtml",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/wikitext/to/html/{title}/{revision}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/wikitext/to/lint",
		"summary": "Return lint errors for wikitext",
		"description": "Returns lint errors for wikitext",
		"operationId": "postReturnLintErrorsForWikitext2",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/wikitext/to/lint"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/wikitext/to/lint/{title}",
		"summary": "Return lint errors for wikitext",
		"description": "Returns lint errors for wikitext",
		"operationId": "postReturnLintErrorsForWikitext3",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/wikitext/to/lint/{title}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/v1/transform/wikitext/to/lint/{title}/{revision}",
		"summary": "Return lint errors for wikitext",
		"description": "Returns lint errors for wikitext",
		"operationId": "postReturnLintErrorsForWikitext",
		"deepLink": "/explorer/direct/enwiki/-#POST/v1/transform/wikitext/to/lint/{title}/{revision}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/wikimediaantiabuse/v0/mark/revision/{revision}/{tag}/{verdict}",
		"description": "Records a review verdict on a revision. The false-positive verdict removes the reviewable tag and adds its false positive version, so the mw-private-personal-info tag becomes the",
		"operationId": "postWikimediaantiabuseV0MarkRevisionByRevisionByTagByVerdict",
		"deepLink": "/explorer/direct/enwiki/-#POST/wikimediaantiabuse/v0/mark/revision/{revision}/{tag}/{verdict}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/wikimediaantiabuse/v0/unmark/revision/{revision}/{tag}/{verdict}",
		"description": "Removes a review verdict from a revision. Removing the false-positive verdict restores the reviewable tag in place of its false positive version. Removing the no-further-action verdict removes the no",
		"operationId": "postWikimediaantiabuseV0UnmarkRevisionByRevisionByTagByVerdict",
		"deepLink": "/explorer/direct/enwiki/-#POST/wikimediaantiabuse/v0/unmark/revision/{revision}/{tag}/{verdict}"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/wikimediacampaignevents/v0/event_registration/{id}/grant_id",
		"operationId": "deleteWikimediacampaigneventsV0EventRegistrationByIdGrantId",
		"deepLink": "/explorer/direct/enwiki/-#DELETE/wikimediacampaignevents/v0/event_registration/{id}/grant_id"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/wikimediacampaignevents/v0/event_registration/{id}/grant_id",
		"operationId": "getWikimediacampaigneventsV0EventRegistrationByIdGrantId",
		"deepLink": "/explorer/direct/enwiki/-#GET/wikimediacampaignevents/v0/event_registration/{id}/grant_id"
	},
	{
		"module": "-",
		"moduleTitle": "MediaWiki REST API",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/wikimediacampaignevents/v0/event_registration/{id}/grant_id",
		"operationId": "putWikimediacampaigneventsV0EventRegistrationByIdGrantId",
		"deepLink": "/explorer/direct/enwiki/-#PUT/wikimediacampaignevents/v0/event_registration/{id}/grant_id"
	},
	{
		"module": "attribution/v0-beta",
		"moduleTitle": "Attribution API (Beta)",
		"instance": "enwiki",
		"method": "GET",
		"path": "/pages/{title}/signals",
		"summary": "Get attribution information for a page.",
		"description": "Attribution signals are the individual elements that keep Wikimedia projects visible when their content is surfaced in external contexts. Signals provide direct acknowledgment and access to sources,",
		"operationId": "getGetAttributionInformationForAPage",
		"gate": "beta",
		"deepLink": "/explorer/direct/enwiki/attribution/v0-beta#GET/pages/{title}/signals"
	},
	{
		"module": "attribution/v0-beta",
		"moduleTitle": "Attribution API (Beta)",
		"instance": "enwiki",
		"method": "GET",
		"path": "/site/signals",
		"summary": "Get attribution information for a site.",
		"description": "Attribution signals are the individual elements that keep Wikimedia projects visible when their content is surfaced in external contexts. Signals provide direct acknowledgment and access to sources,",
		"operationId": "getGetAttributionInformationForASite",
		"gate": "beta",
		"deepLink": "/explorer/direct/enwiki/attribution/v0-beta#GET/site/signals"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/event_contributions/{id}",
		"summary": "Delete an event contribution record",
		"description": "Removes a specific event contribution record by its ID. The authenticated user must have permission to delete contributions for the associated event.",
		"operationId": "deleteDeleteAnEventContributionRecord",
		"tags": [
			"Contributions"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/contributions/DELETE/event_contributions/{id}"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/event_registration/{id}/edits/{wiki}/{revid}",
		"summary": "Associate a revision with an event",
		"description": "Associates a specific wiki revision with the given event for contribution tracking purposes. The revision is identified by its wiki ID and revision ID. This schedules a background job to validate and",
		"operationId": "putAssociateARevisionWithAnEvent",
		"tags": [
			"Contributions"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/contributions/PUT/event_registration/{id}/edits/{wiki}/{revid}"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/event_discovery/discoverable_events",
		"summary": "List discoverable events for a page",
		"description": "Returns the open events whose worklist contains the given page and for which the authenticated user (a non-participant who has not opted out) should be shown the event discovery dialog, recording the",
		"operationId": "getListDiscoverableEventsForAPage",
		"tags": [
			"Worklists"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/worklists/GET/event_discovery/discoverable_events"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "PATCH",
		"path": "/worklist/{title}/pages",
		"summary": "Add or remove worklist pages",
		"description": "Applies a delta to a worklist's page list: pages to add and/or remove, grouped by wiki. The worklist is identified by its page title.",
		"operationId": "patchAddOrRemoveWorklistPages",
		"tags": [
			"Worklists"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/worklists/PATCH/worklist/{title}/pages"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/event_registration",
		"summary": "Create an event registration",
		"description": "Creates a new campaign event registration. The authenticated user must have permission to enable event registrations. Returns the ID of the newly created event.",
		"operationId": "postCreateAnEventRegistration",
		"tags": [
			"Events"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/events/POST/event_registration"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/event_registration/{id}",
		"summary": "Delete an event registration",
		"description": "Permanently deletes an event registration. The authenticated user must have permission to delete the event. This action cannot be undone.",
		"operationId": "deleteDeleteAnEventRegistration",
		"tags": [
			"Events"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/events/DELETE/event_registration/{id}"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/event_registration/{id}",
		"summary": "Get an event registration",
		"description": "Returns full details of a single event registration identified by its numeric ID. Sensitive fields such as meeting URLs are only returned to organizers and participants with the appropriate",
		"operationId": "getGetAnEventRegistration",
		"tags": [
			"Events"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/events/GET/event_registration/{id}"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/event_registration/{id}",
		"summary": "Update an event registration",
		"description": "Updates an existing event registration. The authenticated user must be an organizer of the event or have the appropriate permissions. All required fields must be included in the request body.",
		"operationId": "putUpdateAnEventRegistration",
		"tags": [
			"Events"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/events/PUT/event_registration/{id}"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/event_registration/{id}/email",
		"summary": "Send an email to event participants",
		"description": "Sends an email to participants of the specified event. The authenticated user must have permission to email participants. Specify userids to target particular participants, or use invertusers to",
		"operationId": "postSendAnEmailToEventParticipants",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/POST/event_registration/{id}/email"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/event_registration/{id}/participants",
		"summary": "Remove participants from an event",
		"description": "Removes one or more participants from the specified event. The authenticated user must have permission to manage participants. Specify userids to remove particular users, or use invertusers to remove",
		"operationId": "deleteRemoveParticipantsFromAnEvent",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/DELETE/event_registration/{id}/participants"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/event_registration/{id}/participants",
		"summary": "List participants of an event",
		"description": "Returns a paginated list of participants for the specified event. Private participants are only visible to organizers and users with the appropriate permissions. Use lastparticipantid for pagination",
		"operationId": "getListParticipantsOfAnEvent",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/GET/event_registration/{id}/participants"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/event_registration/{id}/participants/self",
		"summary": "Cancel the current user's event registration",
		"description": "Cancels the currently authenticated user's participation in the specified event.",
		"operationId": "deleteCancelTheCurrentUserSEventRegistration",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/DELETE/event_registration/{id}/participants/self"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/event_registration/{id}/participants/self",
		"summary": "Get the current user's registration info",
		"description": "Returns registration details for the currently authenticated user in the specified event, including privacy setting and any answers submitted to participant questions.",
		"operationId": "getGetTheCurrentUserSRegistrationInfo",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/GET/event_registration/{id}/participants/self"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/event_registration/{id}/participants/self",
		"summary": "Register the current user for an event",
		"description": "Registers the currently authenticated user as a participant in the specified event. The registration can be public or private. Answers to participant questions may also be submitted. The event must",
		"operationId": "putRegisterTheCurrentUserForAnEvent",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/PUT/event_registration/{id}/participants/self"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/participant_questions",
		"summary": "Get available participant questions",
		"description": "Returns the set of questions that can be presented to participants when they register for an event. Optionally filtered to a specific set of question IDs via the questionids query parameter.",
		"operationId": "getGetAvailableParticipantQuestions",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/GET/participant_questions"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/participant/{userid}/event_registrations",
		"summary": "List events a user participates in",
		"description": "Returns a list of event registrations in which the specified central user is a participant. The userid path parameter is the user's global central user ID.",
		"operationId": "getListEventsAUserParticipatesIn",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/GET/participant/{userid}/event_registrations"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/participant/self/events_for_edit",
		"summary": "List events available for contribution association",
		"description": "Returns a list of events in which the currently authenticated user is a participant and that are eligible for contribution association. Used internally to populate the post-edit contribution prompt.",
		"operationId": "getListEventsAvailableForContributionAssociation",
		"tags": [
			"Participants"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/participants/GET/participant/self/events_for_edit"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/event_registration/{id}/organizers",
		"summary": "List organizers of an event",
		"description": "Returns a paginated list of organizers for the specified event. Each entry includes the organizer's user ID, username, roles, and user page path. Use the lastorganizerid parameter for pagination.",
		"operationId": "getListOrganizersOfAnEvent",
		"tags": [
			"Organizers"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/organizers/GET/event_registration/{id}/organizers"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/event_registration/{id}/organizers",
		"summary": "Set the organizers of an event",
		"description": "Replaces the organizer list for the specified event with the provided list of usernames. The authenticated user must have permission to edit the event. The event must be hosted on the local wiki.",
		"operationId": "putSetTheOrganizersOfAnEvent",
		"tags": [
			"Organizers"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/organizers/PUT/event_registration/{id}/organizers"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/organizer/{userid}/event_registrations",
		"summary": "List events organized by a user",
		"description": "Returns a list of event registrations for which the specified central user is an organizer. The userid path parameter is the user's global central user ID.",
		"operationId": "getListEventsOrganizedByAUser",
		"tags": [
			"Organizers"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/organizers/GET/organizer/{userid}/event_registrations"
	},
	{
		"module": "campaignevents/v0",
		"moduleTitle": "CampaignEvents API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/formatted_time/{languageCode}/{start}/{end}",
		"summary": "Get localised time strings for a date range",
		"description": "Returns localised time, date, and datetime strings for the given start and end timestamps in the specified language. Intended for internal use by the CampaignEvents front-end to render event times",
		"operationId": "getGetLocalisedTimeStringsForADateRange",
		"tags": [
			"Utilities"
		],
		"deepLink": "/explorer/direct/enwiki/campaignevents/v0#tag/utilities/GET/formatted_time/{languageCode}/{start}/{end}"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/batch-temporaryaccount",
		"summary": "Get IP addresses for temporary account batch",
		"description": "Returns IP addresses mapped to a list of temporary user names, and log/abuse log IDs.",
		"operationId": "postGetIpAddressesForTemporaryAccountBatch",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#POST/batch-temporaryaccount"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/connectedtemporaryaccounts/{name}",
		"summary": "Get connected temporary accounts",
		"description": "Returns other temporary accounts that have edited from the same IPs as a given temporary account.",
		"operationId": "postGetConnectedTemporaryAccounts",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#POST/connectedtemporaryaccounts/{name}"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/suggestedinvestigations/case/{caseId}/update",
		"summary": "Update suggested investigation case status and reason",
		"description": "Updates the status and reason of a suggested investigation case.",
		"operationId": "postUpdateSuggestedInvestigationCaseStatusAndReason",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#POST/suggestedinvestigations/case/{caseId}/update"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/suggestedinvestigationsusersummary/{name}",
		"summary": "Retrieve a summary of the user's association with suggested investigation cases",
		"description": "Return how many accounts and cases a user is related to in suggested investigations",
		"operationId": "postRetrieveASummaryOfTheUserSAssociationWithSuggestedInvestigationCases",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#POST/suggestedinvestigationsusersummary/{name}"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/temporaryaccount/{name}",
		"summary": "Get IP addresses for temporary account",
		"description": "Returns IP addresses associated with a temporary account name.",
		"operationId": "postGetIpAddressesForTemporaryAccount",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#POST/temporaryaccount/{name}"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/temporaryaccount/ip/{ip}",
		"summary": "Get temporary accounts for IP address",
		"description": "Returns temporary accounts that have edited from a given IP address.",
		"operationId": "postGetTemporaryAccountsForIpAddress",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#POST/temporaryaccount/ip/{ip}"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/useragent-clienthints/{type}/{id}",
		"summary": "Create user agent client hints",
		"description": "Creates user agent client hints data for a given revision or log event.",
		"operationId": "postCreateUserAgentClientHints",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#POST/useragent-clienthints/{type}/{id}"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/userinfo",
		"summary": "Get user information for UserInfoCard",
		"description": "Returns information about public and restricted user activity.",
		"operationId": "postGetUserInformationForUserinfocard",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#POST/userinfo"
	},
	{
		"module": "checkuser/v0",
		"moduleTitle": "CheckUser API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/userinfo/blocked/{name}",
		"summary": "Get user block status",
		"description": "Returns local and global block and lock status of a user.",
		"operationId": "getGetUserBlockStatus",
		"deepLink": "/explorer/direct/enwiki/checkuser/v0#GET/userinfo/blocked/{name}"
	},
	{
		"module": "discord/v0-internal",
		"moduleTitle": "Discord Preview API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/discord-preview",
		"operationId": "getDiscordPreview",
		"gate": "internal",
		"deepLink": "/explorer/direct/enwiki/discord/v0-internal#GET/discord-preview"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/mentees",
		"summary": "Get mentees",
		"description": "Returns info about the mentees being mentored by a given user.",
		"operationId": "getGetMentees",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#GET/mentees"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/mentees/prefixsearch/{prefix}",
		"summary": "Get mentees based on name prefix",
		"description": "Returns info about the mentees being mentored by a given user, filtered by mentee name prefix.",
		"operationId": "getGetMenteesBasedOnNamePrefix",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#GET/mentees/prefixsearch/{prefix}"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/newcomertask/complete",
		"summary": "Complete editing suggestions",
		"description": "Records completion of editing suggestions by the current user.",
		"operationId": "postCompleteEditingSuggestions",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#POST/newcomertask/complete"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/quickstarttips/{skin}/{editor}/{tasktypeid}/{uselang}",
		"summary": "Get tips",
		"description": "Returns tips, relevant to the given user, that help new users engage with editing content.",
		"operationId": "getGetTips",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#GET/quickstarttips/{skin}/{editor}/{tasktypeid}/{uselang}"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/suggestions/addimage/feedback/{title}",
		"summary": "Provide feedback for page image suggestions",
		"description": "Records feedback, by the current user, on image suggestions for page content.",
		"operationId": "putProvideFeedbackForPageImageSuggestions",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#PUT/suggestions/addimage/feedback/{title}"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/suggestions/addlink/{title}",
		"summary": "Get link suggestions for a page",
		"description": "Provides link suggestions for page content.",
		"operationId": "getGetLinkSuggestionsForAPage",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#GET/suggestions/addlink/{title}"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/suggestions/info",
		"summary": "Get suggestion information",
		"description": "Shows information useful for monitoring link and image suggestions, broken down by topic.",
		"operationId": "getGetSuggestionInformation",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#GET/suggestions/info"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/user-impact/{user}",
		"summary": "Get user impact",
		"description": "Returns data about the impact of a user on the wiki.",
		"operationId": "getGetUserImpact",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#GET/user-impact/{user}"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/user-impact/{user}",
		"summary": "Get user impact",
		"description": "Returns data about the impact of a user on the wiki.",
		"operationId": "postGetUserImpact",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#POST/user-impact/{user}"
	},
	{
		"module": "growthexperiments/v0",
		"moduleTitle": "Growth experiments API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/welcomesurvey/skip",
		"summary": "Skip editing suggestions",
		"description": "Prevents newcomer editing suggestions for the current user.",
		"operationId": "postSkipEditingSuggestions",
		"deepLink": "/explorer/direct/enwiki/growthexperiments/v0#POST/welcomesurvey/skip"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "POST",
		"path": "/deployment/patch",
		"description": "Make changes to the deployed set of package versions.",
		"operationId": "postDeploymentPatch",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#POST/deployment/patch"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "POST",
		"path": "/deployment/validate",
		"description": "Validate a proposed new set of package versions.",
		"operationId": "postDeploymentValidate",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#POST/deployment/validate"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "GET",
		"path": "/deployments/recent",
		"description": "Get a list of recent deployments, including the active deployment if any.",
		"operationId": "getDeploymentsRecent",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#GET/deployments/recent"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "POST",
		"path": "/gitlab/tag",
		"description": "A GitLab webhook handler for the tag event. See the GitLab documentation.",
		"operationId": "postGitlabTag",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#POST/gitlab/tag"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "GET",
		"path": "/packages/all/",
		"description": "The index to a list of all fetched package versions.",
		"operationId": "getPackagesAll",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#GET/packages/all/"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "GET",
		"path": "/packages/all/{partition}",
		"description": "A list of fetched package versions within a partition.",
		"operationId": "getPackagesAllByPartition",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#GET/packages/all/{partition}"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "GET",
		"path": "/sandbox",
		"description": "List the sandboxes for the current user.",
		"operationId": "getSandbox",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#GET/sandbox"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "DELETE",
		"path": "/sandbox/{id}",
		"description": "Delete a sandbox from the current user session.",
		"operationId": "deleteSandboxById",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#DELETE/sandbox/{id}"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "POST",
		"path": "/sandbox/{id}",
		"description": "Create or modify a sandbox in the current user session.",
		"operationId": "postSandboxById",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#POST/sandbox/{id}"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "POST",
		"path": "/sandbox/{id}/activate",
		"description": "Activate a sandbox in the session context so that its packages will be used on preview.",
		"operationId": "postSandboxByIdActivate",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#POST/sandbox/{id}/activate"
	},
	{
		"module": "produnto/v1",
		"moduleTitle": "Produnto API",
		"instance": "testwiki",
		"method": "POST",
		"path": "/sandbox/{id}/deactivate",
		"description": "Deactivate a sandbox so that its packages will no longer be used on preview.",
		"operationId": "postSandboxByIdDeactivate",
		"deepLink": "/explorer/direct/testwiki/produnto/v1#POST/sandbox/{id}/deactivate"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/lists",
		"summary": "Get reading lists",
		"operationId": "getGetReadingLists",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#GET/lists"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/lists",
		"summary": "Create reading list",
		"operationId": "postCreateReadingList",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#POST/lists"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/lists/",
		"summary": "Get reading lists",
		"operationId": "getGetReadingLists2",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#GET/lists/"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/lists/",
		"summary": "Create reading list",
		"operationId": "postCreateReadingList2",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#POST/lists/"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/lists/{id}",
		"summary": "Delete reading list",
		"operationId": "deleteDeleteReadingList",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#DELETE/lists/{id}"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/lists/{id}",
		"summary": "Get reading list",
		"operationId": "getGetReadingList",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#GET/lists/{id}"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/lists/{id}",
		"summary": "Update reading list",
		"operationId": "putUpdateReadingList",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#PUT/lists/{id}"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/lists/{id}/entries",
		"summary": "Get reading list entries",
		"operationId": "getGetReadingListEntries",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#GET/lists/{id}/entries"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/lists/{id}/entries",
		"summary": "Create reading list entry",
		"operationId": "postCreateReadingListEntry",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#POST/lists/{id}/entries"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/lists/{id}/entries/",
		"summary": "Get reading list entries",
		"operationId": "getGetReadingListEntries2",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#GET/lists/{id}/entries/"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/lists/{id}/entries/",
		"summary": "Create reading list entry",
		"operationId": "postCreateReadingListEntry2",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#POST/lists/{id}/entries/"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/lists/{id}/entries/{entry_id}",
		"summary": "Delete reading list entry",
		"operationId": "deleteDeleteReadingListEntry",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#DELETE/lists/{id}/entries/{entry_id}"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/lists/{id}/entries/batch",
		"summary": "Create multiple reading list entries",
		"operationId": "postCreateMultipleReadingListEntries",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#POST/lists/{id}/entries/batch"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/lists/batch",
		"summary": "Create multiple reading lists",
		"operationId": "postCreateMultipleReadingLists",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#POST/lists/batch"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/lists/changes/since/{date}",
		"summary": "Get reading lists and entries changed since date",
		"operationId": "getGetReadingListsAndEntriesChangedSinceDate",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#GET/lists/changes/since/{date}"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/lists/pages/{project}/{title}",
		"summary": "Get reading lists containing a page",
		"operationId": "getGetReadingListsContainingAPage",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#GET/lists/pages/{project}/{title}"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/lists/setup",
		"summary": "Enable reading lists",
		"description": "Enables reading lists and creates a default list for the current user.",
		"operationId": "postEnableReadingLists",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#POST/lists/setup"
	},
	{
		"module": "readinglists/v0",
		"moduleTitle": "ReadingLists REST API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/lists/teardown",
		"summary": "Remove all reading list data",
		"description": "Soft-deletes all reading lists for the current user. Deleted lists and their entries are permanently purged after the configured retention period, which defaults to 30 days.",
		"operationId": "postRemoveAllReadingListData",
		"deepLink": "/explorer/direct/enwiki/readinglists/v0#POST/lists/teardown"
	},
	{
		"module": "site/v1",
		"moduleTitle": "Site API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/sitemap/{indexId}",
		"summary": "Get a list of sitemap pages",
		"description": "Returns an XML list of available pages within the sitemap. The index default is 0; the presence of additional indices will be listed in robots.txt. Up to 10,000 pages are associated with each index.",
		"operationId": "getGetAListOfSitemapPages",
		"tags": [
			"Sitemaps"
		],
		"deepLink": "/explorer/direct/enwiki/site/v1#tag/sitemaps/GET/sitemap/{indexId}"
	},
	{
		"module": "site/v1",
		"moduleTitle": "Site API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/sitemap/{indexId}/page/{pageId}",
		"summary": "Get a list of article locations per page",
		"description": "Returns an XML list of articles present on the site. Each entry contains a URL to the page and the last modified date. Each page contains up to 10,000 URL entries.",
		"operationId": "getGetAListOfArticleLocationsPerPage",
		"tags": [
			"Sitemaps"
		],
		"deepLink": "/explorer/direct/enwiki/site/v1#tag/sitemaps/GET/sitemap/{indexId}/page/{pageId}"
	},
	{
		"module": "specs/v0",
		"moduleTitle": "Specs API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/discovery",
		"summary": "Get available REST API modules",
		"operationId": "getGetAvailableRestApiModules",
		"tags": [
			"Discovery"
		],
		"deepLink": "/explorer/direct/enwiki/specs/v0#tag/discovery/GET/discovery"
	},
	{
		"module": "specs/v0",
		"moduleTitle": "Specs API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/module/{module}",
		"summary": "Get spec for a module",
		"operationId": "getGetSpecForAModule",
		"tags": [
			"Modules"
		],
		"deepLink": "/explorer/direct/enwiki/specs/v0#tag/modules/GET/module/{module}"
	},
	{
		"module": "specs/v0",
		"moduleTitle": "Specs API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/module/{module}/{version}",
		"summary": "Get spec for a module and version",
		"operationId": "getGetSpecForAModuleAndVersion",
		"tags": [
			"Modules"
		],
		"deepLink": "/explorer/direct/enwiki/specs/v0#tag/modules/GET/module/{module}/{version}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/openapi.json",
		"summary": "Retrieve the OpenAPI document",
		"operationId": "getOpenApiDoc",
		"tags": [
			"OpenAPI document"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/openapi-document/GET/v1/openapi.json"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/v1/entities/items",
		"summary": "Create a Wikibase Item",
		"operationId": "addItem",
		"tags": [
			"items"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/items/POST/v1/entities/items"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}",
		"summary": "Retrieve a single Wikibase Item by ID",
		"operationId": "getItem",
		"tags": [
			"items"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/items/GET/v1/entities/items/{item_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/items/{item_id}",
		"summary": "Change a single Wikibase Item by ID",
		"operationId": "patchItem",
		"tags": [
			"items"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/items/PATCH/v1/entities/items/{item_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/sitelinks",
		"summary": "Retrieve an Item's Sitelinks",
		"operationId": "getSitelinks",
		"tags": [
			"sitelinks"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/sitelinks/GET/v1/entities/items/{item_id}/sitelinks"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/items/{item_id}/sitelinks",
		"summary": "Change an Item's Sitelinks",
		"operationId": "patchSitelinks",
		"tags": [
			"sitelinks"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/sitelinks/PATCH/v1/entities/items/{item_id}/sitelinks"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/v1/entities/items/{item_id}/sitelinks/{site_id}",
		"summary": "Delete an Item's Sitelink",
		"operationId": "deleteSitelink",
		"tags": [
			"sitelinks"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/sitelinks/DELETE/v1/entities/items/{item_id}/sitelinks/{site_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/sitelinks/{site_id}",
		"summary": "Retrieve an Item's Sitelink",
		"operationId": "getSitelink",
		"tags": [
			"sitelinks"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/sitelinks/GET/v1/entities/items/{item_id}/sitelinks/{site_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/v1/entities/items/{item_id}/sitelinks/{site_id}",
		"summary": "Add / Replace an Item's Sitelink",
		"operationId": "setSitelink",
		"tags": [
			"sitelinks"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/sitelinks/PUT/v1/entities/items/{item_id}/sitelinks/{site_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/v1/entities/properties",
		"summary": "Create a Wikibase Property",
		"operationId": "addProperty",
		"tags": [
			"properties"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/properties/POST/v1/entities/properties"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}",
		"summary": "Retrieve a single Wikibase Property by ID",
		"operationId": "getProperty",
		"tags": [
			"properties"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/properties/GET/v1/entities/properties/{property_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/properties/{property_id}",
		"summary": "Change a single Wikibase Property by ID",
		"operationId": "patchProperty",
		"tags": [
			"properties"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/properties/PATCH/v1/entities/properties/{property_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/labels",
		"summary": "Retrieve an Item's labels",
		"operationId": "getItemLabels",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/GET/v1/entities/items/{item_id}/labels"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/items/{item_id}/labels",
		"summary": "Change an Item's Labels",
		"operationId": "patchItemLabels",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/PATCH/v1/entities/items/{item_id}/labels"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/labels_with_language_fallback/{language_code}",
		"summary": "Retrieve an Item's label in a specific language, with language fallback",
		"description": "If a label is defined in the requested language, the API responds with a 200 status code and includes the label in the response payload. If a label only exists in a fallback language, the API returns",
		"operationId": "getItemLabelWithFallback",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/GET/v1/entities/items/{item_id}/labels_with_language_fallback/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/v1/entities/items/{item_id}/labels/{language_code}",
		"summary": "Delete an Item's label in a specific language",
		"operationId": "deleteItemLabel",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/DELETE/v1/entities/items/{item_id}/labels/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/labels/{language_code}",
		"summary": "Retrieve an Item's label in a specific language",
		"operationId": "getItemLabel",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/GET/v1/entities/items/{item_id}/labels/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/v1/entities/items/{item_id}/labels/{language_code}",
		"summary": "Add / Replace an Item's label in a specific language",
		"operationId": "replaceItemLabel",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/PUT/v1/entities/items/{item_id}/labels/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/labels",
		"summary": "Retrieve a Property's labels",
		"operationId": "getPropertyLabels",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/GET/v1/entities/properties/{property_id}/labels"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/properties/{property_id}/labels",
		"summary": "Change a Property's Labels",
		"operationId": "patchPropertyLabels",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/PATCH/v1/entities/properties/{property_id}/labels"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/labels_with_language_fallback/{language_code}",
		"summary": "Retrieve a Property's label in a specific language, with language fallback",
		"description": "If a label is defined in the requested language, the API responds with a 200 status code and includes the label in the response payload. If a label only exists in a fallback language, the API returns",
		"operationId": "getPropertyLabelWithFallback",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/GET/v1/entities/properties/{property_id}/labels_with_language_fallback/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/v1/entities/properties/{property_id}/labels/{language_code}",
		"summary": "Delete a Property's label in a specific language",
		"operationId": "deletePropertyLabel",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/DELETE/v1/entities/properties/{property_id}/labels/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/labels/{language_code}",
		"summary": "Retrieve a Property's label in a specific language",
		"operationId": "getPropertyLabel",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/GET/v1/entities/properties/{property_id}/labels/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/v1/entities/properties/{property_id}/labels/{language_code}",
		"summary": "Add / Replace a Property's label in a specific language",
		"operationId": "replacePropertyLabel",
		"tags": [
			"labels"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/labels/PUT/v1/entities/properties/{property_id}/labels/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/descriptions",
		"summary": "Retrieve an Item's descriptions",
		"operationId": "getItemDescriptions",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/GET/v1/entities/items/{item_id}/descriptions"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/items/{item_id}/descriptions",
		"summary": "Change an Item's descriptions",
		"operationId": "patchItemDescriptions",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/PATCH/v1/entities/items/{item_id}/descriptions"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/descriptions_with_language_fallback/{language_code}",
		"summary": "Retrieve an Item's description in a specific language, with language fallback",
		"description": "If a description is defined in the requested language, the API responds with a 200 status code and includes the description in the response payload. If a description only exists in a fallback",
		"operationId": "getItemDescriptionWithFallback",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/GET/v1/entities/items/{item_id}/descriptions_with_language_fallback/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/v1/entities/items/{item_id}/descriptions/{language_code}",
		"summary": "Delete an Item's description in a specific language",
		"operationId": "deleteItemDescription",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/DELETE/v1/entities/items/{item_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/descriptions/{language_code}",
		"summary": "Retrieve an Item's description in a specific language",
		"operationId": "getItemDescription",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/GET/v1/entities/items/{item_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/v1/entities/items/{item_id}/descriptions/{language_code}",
		"summary": "Add / Replace an Item's description in a specific language",
		"operationId": "replaceItemDescription",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/PUT/v1/entities/items/{item_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/descriptions",
		"summary": "Retrieve a Property's descriptions",
		"operationId": "getPropertyDescriptions",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/GET/v1/entities/properties/{property_id}/descriptions"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/properties/{property_id}/descriptions",
		"summary": "Change a Property's descriptions",
		"operationId": "patchPropertyDescriptions",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/PATCH/v1/entities/properties/{property_id}/descriptions"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/descriptions_with_language_fallback/{language_code}",
		"summary": "Retrieve a Property's description in a specific language, with language fallback",
		"description": "If a description is defined in the requested language, the API responds with a 200 status code and includes the description in the response payload. If a description only exists in a fallback",
		"operationId": "getPropertyDescriptionWithFallback",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/GET/v1/entities/properties/{property_id}/descriptions_with_language_fallback/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/v1/entities/properties/{property_id}/descriptions/{language_code}",
		"summary": "Delete a Property's description in a specific language",
		"operationId": "deletePropertyDescription",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/DELETE/v1/entities/properties/{property_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/descriptions/{language_code}",
		"summary": "Retrieve a Property's description in a specific language",
		"operationId": "getPropertyDescription",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/GET/v1/entities/properties/{property_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/v1/entities/properties/{property_id}/descriptions/{language_code}",
		"summary": "Add / Replace a Property's description in a specific language",
		"operationId": "setPropertyDescription",
		"tags": [
			"descriptions"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/descriptions/PUT/v1/entities/properties/{property_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/aliases",
		"summary": "Retrieve an Item's aliases",
		"operationId": "getItemAliases",
		"tags": [
			"aliases"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/aliases/GET/v1/entities/items/{item_id}/aliases"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/items/{item_id}/aliases",
		"summary": "Change an Item's aliases",
		"operationId": "patchItemAliases",
		"tags": [
			"aliases"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/aliases/PATCH/v1/entities/items/{item_id}/aliases"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/aliases/{language_code}",
		"summary": "Retrieve an Item's aliases in a specific language",
		"operationId": "getItemAliasesInLanguage",
		"tags": [
			"aliases"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/aliases/GET/v1/entities/items/{item_id}/aliases/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/v1/entities/items/{item_id}/aliases/{language_code}",
		"summary": "Create / Add an Item's aliases in a specific language",
		"operationId": "addItemAliasesInLanguage",
		"tags": [
			"aliases"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/aliases/POST/v1/entities/items/{item_id}/aliases/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/aliases",
		"summary": "Retrieve a Property's aliases",
		"operationId": "getPropertyAliases",
		"tags": [
			"aliases"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/aliases/GET/v1/entities/properties/{property_id}/aliases"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/properties/{property_id}/aliases",
		"summary": "Change a Property's aliases",
		"operationId": "patchPropertyAliases",
		"tags": [
			"aliases"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/aliases/PATCH/v1/entities/properties/{property_id}/aliases"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/aliases/{language_code}",
		"summary": "Retrieve a Property's aliases in a specific language",
		"operationId": "getPropertyAliasesInLanguage",
		"tags": [
			"aliases"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/aliases/GET/v1/entities/properties/{property_id}/aliases/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/v1/entities/properties/{property_id}/aliases/{language_code}",
		"summary": "Create / Add a Property's aliases in a specific language",
		"operationId": "addPropertyAliasesInLanguage",
		"tags": [
			"aliases"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/aliases/POST/v1/entities/properties/{property_id}/aliases/{language_code}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/statements",
		"summary": "Retrieve Statements from an Item",
		"operationId": "getItemStatements",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/GET/v1/entities/items/{item_id}/statements"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/v1/entities/items/{item_id}/statements",
		"summary": "Add a new Statement to an Item",
		"operationId": "addItemStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/POST/v1/entities/items/{item_id}/statements"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/v1/entities/items/{item_id}/statements/{statement_id}",
		"summary": "Delete a single Statement from an Item",
		"description": "This endpoint is also accessible through /statements/{statementid}",
		"operationId": "deleteItemStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/DELETE/v1/entities/items/{item_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/items/{item_id}/statements/{statement_id}",
		"summary": "Retrieve a single Statement from an Item",
		"description": "This endpoint is also accessible through /statements/{statementid}",
		"operationId": "getItemStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/GET/v1/entities/items/{item_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/items/{item_id}/statements/{statement_id}",
		"summary": "Change elements of a single Statement of an Item",
		"description": "This endpoint is also accessible through /statements/{statementid}.",
		"operationId": "patchItemStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/PATCH/v1/entities/items/{item_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/v1/entities/items/{item_id}/statements/{statement_id}",
		"summary": "Replace a single Statement of an Item",
		"description": "This endpoint is also accessible through /statements/{statementid}",
		"operationId": "replaceItemStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/PUT/v1/entities/items/{item_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/statements",
		"summary": "Retrieve Statements from a Property",
		"operationId": "getPropertyStatements",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/GET/v1/entities/properties/{property_id}/statements"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/v1/entities/properties/{property_id}/statements",
		"summary": "Add a new Statement to a Property",
		"operationId": "addPropertyStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/POST/v1/entities/properties/{property_id}/statements"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/v1/entities/properties/{property_id}/statements/{statement_id}",
		"summary": "Delete a single Statement from a Property",
		"description": "This endpoint is also accessible through /statements/{statementid}.",
		"operationId": "deletePropertyStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/DELETE/v1/entities/properties/{property_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/entities/properties/{property_id}/statements/{statement_id}",
		"summary": "Retrieve a single Statement from a Property",
		"description": "This endpoint is also accessible through /statements/{statementid}",
		"operationId": "getPropertyStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/GET/v1/entities/properties/{property_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/entities/properties/{property_id}/statements/{statement_id}",
		"summary": "Change elements of a single Statement of a Property",
		"description": "This endpoint is also accessible through /statements/{statementid}.",
		"operationId": "patchPropertyStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/PATCH/v1/entities/properties/{property_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/v1/entities/properties/{property_id}/statements/{statement_id}",
		"summary": "Replace a single Statement of a Property",
		"description": "This endpoint is also accessible through /statements/{statementid}",
		"operationId": "replacePropertyStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/PUT/v1/entities/properties/{property_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/v1/statements/{statement_id}",
		"summary": "Delete a single Statement",
		"description": "This endpoint is also accessible through /entities/items/{itemid}/statements/{statementid} and /entities/properties/{propertyid}/statements/{statementid}",
		"operationId": "deleteStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/DELETE/v1/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/statements/{statement_id}",
		"summary": "Retrieve a single Statement",
		"description": "This endpoint is also accessible through /entities/items/{itemid}/statements/{statementid} and /entities/properties/{propertyid}/statements/{statementid}",
		"operationId": "getStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/GET/v1/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/v1/statements/{statement_id}",
		"summary": "Change elements of a single Statement",
		"description": "This endpoint is also accessible through /entities/items/{itemid}/statements/{statementid} and /entities/properties/{propertyid}/statements/{statementid}",
		"operationId": "patchStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/PATCH/v1/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/v1/statements/{statement_id}",
		"summary": "Replace a single Statement",
		"description": "This endpoint is also accessible through /entities/items/{itemid}/statements/{statementid} and /entities/properties/{propertyid}/statements/{statementid}",
		"operationId": "replaceStatement",
		"tags": [
			"statements"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/statements/PUT/v1/statements/{statement_id}"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/property-data-types",
		"summary": "Retrieve the map of Property data types to value types",
		"operationId": "getPropertyDataTypes",
		"tags": [
			"Property data types"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/property-data-types/GET/v1/property-data-types"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/search/items",
		"summary": "Simple Item search by label and aliases",
		"operationId": "simpleItemSearch",
		"tags": [
			"item search"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/item-search/GET/v1/search/items"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/suggest/items",
		"summary": "Simple Item search by prefix, for labels and aliases",
		"operationId": "suggestItems",
		"tags": [
			"item search"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/item-search/GET/v1/suggest/items"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/search/properties",
		"summary": "Simple Property search by label and aliases",
		"operationId": "simplePropertySearch",
		"tags": [
			"property search"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/property-search/GET/v1/search/properties"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v1/suggest/properties",
		"summary": "Simple Property search by prefix, for labels and aliases",
		"operationId": "suggestProperties",
		"tags": [
			"property search"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/property-search/GET/v1/suggest/properties"
	},
	{
		"module": "wikibase-rest/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/v0/entities/lexemes/{lexeme_id}",
		"summary": "Retrieve a single Lexeme by ID",
		"operationId": "getLexeme",
		"tags": [
			"lexemes"
		],
		"deepLink": "/explorer/direct/wikidatawiki/wikibase-rest/v1#tag/lexemes/GET/v0/entities/lexemes/{lexeme_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/entities/items",
		"summary": "Create a Wikibase Item",
		"description": "Create a Wikibase Item.",
		"operationId": "postCreateAWikibaseItem",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#POST/entities/items"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}",
		"summary": "Retrieve a single Wikibase Item by ID",
		"description": "Retrieve a single Wikibase Item by ID.",
		"operationId": "getRetrieveASingleWikibaseItemById",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/items/{item_id}",
		"summary": "Change a single Wikibase Item by ID",
		"description": "Change a single Wikibase Item by ID.",
		"operationId": "patchChangeASingleWikibaseItemById",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/items/{item_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/aliases",
		"summary": "Retrieve an Item's aliases",
		"description": "Retrieve an Item's aliases.",
		"operationId": "getRetrieveAnItemSAliases",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/aliases"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/items/{item_id}/aliases",
		"summary": "Change an Item's aliases",
		"description": "Change an Item's aliases.",
		"operationId": "patchChangeAnItemSAliases",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/items/{item_id}/aliases"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/aliases/{language_code}",
		"summary": "Retrieve an Item's aliases in a specific language",
		"description": "Retrieve an Item's aliases in a specific language.",
		"operationId": "getRetrieveAnItemSAliasesInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/aliases/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/entities/items/{item_id}/aliases/{language_code}",
		"summary": "Create / Add an Item's aliases in a specific language",
		"description": "Create / Add an Item's aliases in a specific language.",
		"operationId": "postCreateAddAnItemSAliasesInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#POST/entities/items/{item_id}/aliases/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/descriptions",
		"summary": "Retrieve an Item's descriptions",
		"description": "Retrieve an Item's descriptions",
		"operationId": "getRetrieveAnItemSDescriptions",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/descriptions"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/items/{item_id}/descriptions",
		"summary": "Change an Item's descriptions",
		"description": "Change an Item's descriptions.",
		"operationId": "patchChangeAnItemSDescriptions",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/items/{item_id}/descriptions"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/descriptions_with_language_fallback/{language_code}",
		"summary": "Retrieve an Item's description in a specific language, with language fallback",
		"description": "Retrieve an Item's description in a specific language, with language fallback.",
		"operationId": "getRetrieveAnItemSDescriptionInASpecificLanguageWithLanguageFallback",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/descriptions_with_language_fallback/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/entities/items/{item_id}/descriptions/{language_code}",
		"summary": "Delete an Item's description in a specific language",
		"description": "Delete an Item's description in a specific language.",
		"operationId": "deleteDeleteAnItemSDescriptionInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#DELETE/entities/items/{item_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/descriptions/{language_code}",
		"summary": "Retrieve an Item's description in a specific language",
		"description": "Retrieve an Item's description in a specific language.",
		"operationId": "getRetrieveAnItemSDescriptionInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/entities/items/{item_id}/descriptions/{language_code}",
		"summary": "Add / Replace an Item's description in a specific language",
		"description": "Add / Replace an Item's description in a specific language.",
		"operationId": "putAddReplaceAnItemSDescriptionInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PUT/entities/items/{item_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/labels",
		"summary": "Retrieve an Item's labels",
		"description": "Retrieve an Item's labels.",
		"operationId": "getRetrieveAnItemSLabels",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/labels"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/items/{item_id}/labels",
		"summary": "Change an Item's Labels",
		"description": "Change an Item's Labels.",
		"operationId": "patchChangeAnItemSLabels",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/items/{item_id}/labels"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/labels_with_language_fallback/{language_code}",
		"summary": "Retrieve an Item's label in a specific language, with language fallback",
		"description": "Retrieve an Item's label in a specific language, with language fallback.",
		"operationId": "getRetrieveAnItemSLabelInASpecificLanguageWithLanguageFallback",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/labels_with_language_fallback/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/entities/items/{item_id}/labels/{language_code}",
		"summary": "Delete an Item's label in a specific language",
		"description": "Delete an Item's label in a specific language.",
		"operationId": "deleteDeleteAnItemSLabelInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#DELETE/entities/items/{item_id}/labels/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/labels/{language_code}",
		"summary": "Retrieve an Item's label in a specific language",
		"description": "Retrieve an Item's label in a specific language.",
		"operationId": "getRetrieveAnItemSLabelInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/labels/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/entities/items/{item_id}/labels/{language_code}",
		"summary": "Add / Replace an Item's label in a specific language",
		"description": "Add / Replace an Item's label in a specific language.",
		"operationId": "putAddReplaceAnItemSLabelInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PUT/entities/items/{item_id}/labels/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/sitelinks",
		"summary": "Retrieve an Item's Sitelinks",
		"description": "Retrieve an Item's Sitelinks.",
		"operationId": "getRetrieveAnItemSSitelinks",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/sitelinks"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/items/{item_id}/sitelinks",
		"summary": "Change an Item's Sitelinks",
		"description": "Change an Item's Sitelinks.",
		"operationId": "patchChangeAnItemSSitelinks",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/items/{item_id}/sitelinks"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/entities/items/{item_id}/sitelinks/{site_id}",
		"summary": "Delete an Item's Sitelink",
		"description": "Delete an Item's Sitelink.",
		"operationId": "deleteDeleteAnItemSSitelink",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#DELETE/entities/items/{item_id}/sitelinks/{site_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/sitelinks/{site_id}",
		"summary": "Retrieve an Item's Sitelink",
		"description": "Retrieve an Item's Sitelink.",
		"operationId": "getRetrieveAnItemSSitelink",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/sitelinks/{site_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/entities/items/{item_id}/sitelinks/{site_id}",
		"summary": "Add / Replace an Item's Sitelink",
		"description": "Add / Replace an Item's Sitelink.",
		"operationId": "putAddReplaceAnItemSSitelink",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PUT/entities/items/{item_id}/sitelinks/{site_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/statements",
		"summary": "Retrieve Statements from an Item",
		"description": "Retrieve Statements from an Item.",
		"operationId": "getRetrieveStatementsFromAnItem",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/statements"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/entities/items/{item_id}/statements",
		"summary": "Add a new Statement to an Item",
		"description": "Add a new Statement to an Item.",
		"operationId": "postAddANewStatementToAnItem",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#POST/entities/items/{item_id}/statements"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/entities/items/{item_id}/statements/{statement_id}",
		"summary": "Delete a single Statement from an Item",
		"description": "Delete a single Statement from an Item.",
		"operationId": "deleteDeleteASingleStatementFromAnItem",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#DELETE/entities/items/{item_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/items/{item_id}/statements/{statement_id}",
		"summary": "Retrieve a single Statement from an Item",
		"description": "Retrieve a single Statement from an Item.",
		"operationId": "getRetrieveASingleStatementFromAnItem",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/items/{item_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/items/{item_id}/statements/{statement_id}",
		"summary": "Change elements of a single Statement of an Item",
		"description": "Change elements of a single Statement of an Item.",
		"operationId": "patchChangeElementsOfASingleStatementOfAnItem",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/items/{item_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/entities/items/{item_id}/statements/{statement_id}",
		"summary": "Replace a single Statement of an Item",
		"description": "Replace a single Statement of an Item.",
		"operationId": "putReplaceASingleStatementOfAnItem",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PUT/entities/items/{item_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/entities/properties",
		"summary": "Create a Wikibase Property",
		"description": "Create a Wikibase Property.",
		"operationId": "postCreateAWikibaseProperty",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#POST/entities/properties"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}",
		"summary": "Retrieve a single Wikibase Property by ID",
		"description": "Retrieve a single Wikibase Property by ID.",
		"operationId": "getRetrieveASingleWikibasePropertyById",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/properties/{property_id}",
		"summary": "Change a single Wikibase Property by ID",
		"description": "Change a single Wikibase Property by ID.",
		"operationId": "patchChangeASingleWikibasePropertyById",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/properties/{property_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/aliases",
		"summary": "Retrieve a Property's aliases",
		"description": "Retrieve a Property's aliases.",
		"operationId": "getRetrieveAPropertySAliases",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/aliases"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/properties/{property_id}/aliases",
		"summary": "Change a Property's aliases",
		"description": "Change a Property's aliases.",
		"operationId": "patchChangeAPropertySAliases",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/properties/{property_id}/aliases"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/aliases/{language_code}",
		"summary": "Retrieve a Property's aliases in a specific language",
		"description": "Retrieve a Property's aliases in a specific language.",
		"operationId": "getRetrieveAPropertySAliasesInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/aliases/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/entities/properties/{property_id}/aliases/{language_code}",
		"summary": "Retrieve a Property's aliases in a specific language",
		"description": "Retrieve a Property's aliases in a specific language.",
		"operationId": "postRetrieveAPropertySAliasesInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#POST/entities/properties/{property_id}/aliases/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/descriptions",
		"summary": "Retrieve a Property's descriptions",
		"description": "Retrieve a Property's descriptions.",
		"operationId": "getRetrieveAPropertySDescriptions",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/descriptions"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/properties/{property_id}/descriptions",
		"summary": "Change a Property's descriptions",
		"description": "Change a Property's descriptions.",
		"operationId": "patchChangeAPropertySDescriptions",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/properties/{property_id}/descriptions"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/descriptions_with_language_fallback/{language_code}",
		"summary": "Retrieve a Property's description in a specific language, with language fallback",
		"description": "Retrieve a Property's description in a specific language, with language fallback.",
		"operationId": "getRetrieveAPropertySDescriptionInASpecificLanguageWithLanguageFallback",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/descriptions_with_language_fallback/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/entities/properties/{property_id}/descriptions/{language_code}",
		"summary": "Delete a Property's description in a specific language",
		"description": "Delete a Property's description in a specific language.",
		"operationId": "deleteDeleteAPropertySDescriptionInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#DELETE/entities/properties/{property_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/descriptions/{language_code}",
		"summary": "Retrieve a Property's description in a specific language",
		"description": "Retrieve a Property's description in a specific language.",
		"operationId": "getRetrieveAPropertySDescriptionInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/entities/properties/{property_id}/descriptions/{language_code}",
		"summary": "Add / Replace a Property's description in a specific language",
		"description": "Add / Replace a Property's description in a specific language.",
		"operationId": "putAddReplaceAPropertySDescriptionInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PUT/entities/properties/{property_id}/descriptions/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/labels",
		"summary": "Retrieve a Property's labels",
		"description": "Retrieve a Property's labels.",
		"operationId": "getRetrieveAPropertySLabels",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/labels"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/properties/{property_id}/labels",
		"summary": "Change a Property's Labels",
		"description": "Change a Property's Labels.",
		"operationId": "patchChangeAPropertySLabels",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/properties/{property_id}/labels"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/labels_with_language_fallback/{language_code}",
		"summary": "Retrieve a Property's label in a specific language, with language fallback",
		"description": "Retrieve a Property's label in a specific language, with language fallback.",
		"operationId": "getRetrieveAPropertySLabelInASpecificLanguageWithLanguageFallback",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/labels_with_language_fallback/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/entities/properties/{property_id}/labels/{language_code}",
		"summary": "Delete a Property's label in a specific language",
		"description": "Delete a Property's label in a specific language.",
		"operationId": "deleteDeleteAPropertySLabelInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#DELETE/entities/properties/{property_id}/labels/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/labels/{language_code}",
		"summary": "Retrieve a Property's label in a specific language",
		"description": "Retrieve a Property's label in a specific language.",
		"operationId": "getRetrieveAPropertySLabelInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/labels/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/entities/properties/{property_id}/labels/{language_code}",
		"summary": "Add / Replace a Property's label in a specific language",
		"description": "Add / Replace a Property's label in a specific language.",
		"operationId": "putAddReplaceAPropertySLabelInASpecificLanguage",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PUT/entities/properties/{property_id}/labels/{language_code}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/statements",
		"summary": "Retrieve Statements from a Property",
		"description": "Retrieve Statements from a Property.",
		"operationId": "getRetrieveStatementsFromAProperty",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/statements"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "POST",
		"path": "/entities/properties/{property_id}/statements",
		"summary": "Add a new Statement to a Property",
		"description": "Add a new Statement to a Property.",
		"operationId": "postAddANewStatementToAProperty",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#POST/entities/properties/{property_id}/statements"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/entities/properties/{property_id}/statements/{statement_id}",
		"summary": "Delete a single Statement from a Property",
		"description": "Delete a single Statement from a Property.",
		"operationId": "deleteDeleteASingleStatementFromAProperty",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#DELETE/entities/properties/{property_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/entities/properties/{property_id}/statements/{statement_id}",
		"summary": "Retrieve a single Statement from a Property",
		"description": "Retrieve a single Statement from a Property.",
		"operationId": "getRetrieveASingleStatementFromAProperty",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/entities/properties/{property_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/entities/properties/{property_id}/statements/{statement_id}",
		"summary": "Change elements of a single Statement of a Property",
		"description": "Change elements of a single Statement of a Property.",
		"operationId": "patchChangeElementsOfASingleStatementOfAProperty",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/entities/properties/{property_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/entities/properties/{property_id}/statements/{statement_id}",
		"summary": "Replace a single Statement of a Property",
		"description": "Replace a single Statement of a Property.",
		"operationId": "putReplaceASingleStatementOfAProperty",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PUT/entities/properties/{property_id}/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/openapi.json",
		"summary": "Retrieve the module OpenAPI document",
		"description": "Retrieve the module OpenAPI document.",
		"operationId": "getRetrieveTheModuleOpenapiDocument",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/openapi.json"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/property-data-types",
		"summary": "Retrieve the map of Property data types to value types",
		"description": "Retrieve the map of Property data types to value types.",
		"operationId": "getRetrieveTheMapOfPropertyDataTypesToValueTypes",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/property-data-types"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/search/items",
		"summary": "Simple Item search by label and aliases",
		"description": "Simple Item search by label and aliases.",
		"operationId": "getSimpleItemSearchByLabelAndAliases",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/search/items"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/search/properties",
		"summary": "Simple Property search by label and aliases",
		"description": "Simple Property search by label and aliases.",
		"operationId": "getSimplePropertySearchByLabelAndAliases",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/search/properties"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "DELETE",
		"path": "/statements/{statement_id}",
		"summary": "Delete a single Statement",
		"description": "Delete a single Statement.",
		"operationId": "deleteDeleteASingleStatement",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#DELETE/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/statements/{statement_id}",
		"summary": "Retrieve a single Statement",
		"description": "Retrieve a single Statement.",
		"operationId": "getRetrieveASingleStatement",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PATCH",
		"path": "/statements/{statement_id}",
		"summary": "Change elements of a single Statement",
		"description": "Change elements of a single Statement.",
		"operationId": "patchChangeElementsOfASingleStatement",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PATCH/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "PUT",
		"path": "/statements/{statement_id}",
		"summary": "Replace a single Statement",
		"description": "Replace a single Statement.",
		"operationId": "putReplaceASingleStatement",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#PUT/statements/{statement_id}"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/suggest/items",
		"summary": "Simple Item search by prefix, for labels and aliases",
		"description": "Simple Item search by prefix, for labels and aliases.",
		"operationId": "getSimpleItemSearchByPrefixForLabelsAndAliases",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/suggest/items"
	},
	{
		"module": "wikibase/v1",
		"moduleTitle": "Wikibase REST API",
		"instance": "wikidatawiki",
		"method": "GET",
		"path": "/suggest/properties",
		"summary": "Simple Property search by prefix, for labels and aliases",
		"description": "Simple Property search by prefix, for labels and aliases.",
		"operationId": "getSimplePropertySearchByPrefixForLabelsAndAliases",
		"deepLink": "/explorer/direct/wikidatawiki/wikibase/v1#GET/suggest/properties"
	},
	{
		"module": "wikifunctions/v0",
		"moduleTitle": "Wikifunctions API",
		"instance": "abstractwiki",
		"method": "GET",
		"path": "/call/{zid}/{arguments}",
		"description": "Call a function",
		"operationId": "getCallByZidByArguments",
		"deepLink": "/explorer/direct/abstractwiki/wikifunctions/v0#GET/call/{zid}/{arguments}"
	},
	{
		"module": "wikifunctions/v0",
		"moduleTitle": "Wikifunctions API",
		"instance": "abstractwiki",
		"method": "GET",
		"path": "/call/{zid}/{arguments}/{parselang}/{renderlang}",
		"description": "Call a function, with custom parse and render languages",
		"operationId": "getCallByZidByArgumentsByParselangByRenderlang",
		"deepLink": "/explorer/direct/abstractwiki/wikifunctions/v0#GET/call/{zid}/{arguments}/{parselang}/{renderlang}"
	},
	{
		"module": "wikifunctions/v0",
		"moduleTitle": "Wikifunctions API",
		"instance": "abstractwiki",
		"method": "GET",
		"path": "/fetch/{zids}",
		"description": "Fetch ZObjects",
		"operationId": "getFetchByZids",
		"deepLink": "/explorer/direct/abstractwiki/wikifunctions/v0#GET/fetch/{zids}"
	},
	{
		"module": "wikifunctions/v0",
		"moduleTitle": "Wikifunctions API",
		"instance": "abstractwiki",
		"method": "GET",
		"path": "/fetch/{zids}/{revisions}",
		"description": "Fetch historic versions of ZObjects",
		"operationId": "getFetchByZidsByRevisions",
		"deepLink": "/explorer/direct/abstractwiki/wikifunctions/v0#GET/fetch/{zids}/{revisions}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/category-metrics-snapshot/{category}/{start}/{end}",
		"summary": "Get time series of category metrics",
		"description": "Returns a time series with metrics about the given Commons category and category tree, including media file counts and leverage counts.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/category-metrics-snapshot/{category}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/edits-per-category-monthly/{category}/{category-scope}/{edit-type}/{start}/{end}",
		"summary": "Get time series of edit counts for a given category",
		"description": "Returns a time series of the number of edits to Commons media files associated to the given category or category tree.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/edits-per-category-monthly/{category}/{category-scope}/{edit-type}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/edits-per-user-monthly/{user-name}/{edit-type}/{start}/{end}",
		"summary": "Get time series of edit counts for a given user",
		"description": "Returns a time series of the number of edits to Commons media files performed by the given user.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/edits-per-user-monthly/{user-name}/{edit-type}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/media-file-metrics-snapshot/{media-file}/{start}/{end}",
		"summary": "Get time series of media file metrics",
		"description": "Returns a time series with metrics about the given Commons media file, including wiki and page leverage counts.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/media-file-metrics-snapshot/{media-file}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/pageviews-per-category-monthly/{category}/{category-scope}/{wiki}/{start}/{end}",
		"summary": "Get time series of pageview counts for a given category",
		"description": "Returns a time series of the number of pageviews to Commons media files associated to the given category or category tree.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/pageviews-per-category-monthly/{category}/{category-scope}/{wiki}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/pageviews-per-media-file-monthly/{media-file}/{wiki}/{start}/{end}",
		"summary": "Get time series of pageview counts for a given media file",
		"description": "Returns a time series of the number of pageviews to the given Commons media file.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/pageviews-per-media-file-monthly/{media-file}/{wiki}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/top-edited-categories-monthly/{category-scope}/{edit-type}/{year}/{month}",
		"summary": "Get ranking of most edited categories",
		"description": "Returns the ranking of the Commons categories or category trees with most edits to their associated media files.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/top-edited-categories-monthly/{category-scope}/{edit-type}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/top-editors-monthly/{category}/{category-scope}/{edit-type}/{year}/{month}",
		"summary": "Get ranking of users with most edits to a given category",
		"description": "Returns the ranking of users with most edits to Commons media files associated to the given category or category tree.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/top-editors-monthly/{category}/{category-scope}/{edit-type}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/top-pages-per-category-monthly/{category}/{category-scope}/{wiki}/{year}/{month}",
		"summary": "Get ranking of pages with most pageviews for a given category",
		"description": "Returns the ranking of the most visited wiki pages containing Commons media files associated to the given category or category tree.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/top-pages-per-category-monthly/{category}/{category-scope}/{wiki}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/top-pages-per-media-file-monthly/{media-file}/{wiki}/{year}/{month}",
		"summary": "Get ranking of pages with most pageviews for a given media file",
		"description": "Returns the ranking of the most visited wiki pages containing the given media file.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/top-pages-per-media-file-monthly/{media-file}/{wiki}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/top-viewed-categories-monthly/{category-scope}/{wiki}/{year}/{month}",
		"summary": "Get ranking of categories with most pageviews",
		"description": "Returns the ranking of Commons categories or category trees whose associated media files appear in the wiki pages with most pageviews.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/top-viewed-categories-monthly/{category-scope}/{wiki}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/top-viewed-media-files-monthly/{category}/{category-scope}/{wiki}/{year}/{month}",
		"summary": "Get ranking of media files with most pageviews",
		"description": "Returns the ranking of Commons media files appearing in the wiki pages with most pageviews.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/top-viewed-media-files-monthly/{category}/{category-scope}/{wiki}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/top-wikis-per-category-monthly/{category}/{category-scope}/{year}/{month}",
		"summary": "Get ranking of wikis with most pageviews for a given category",
		"description": "Returns the ranking of wikis with the most viewed pages containing media files from the given Commons category or category tree.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/top-wikis-per-category-monthly/{category}/{category-scope}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-commons/v1",
		"moduleTitle": "Wikimedia Commons Impact Metrics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/commons-analytics/top-wikis-per-media-file-monthly/{media-file}/{year}/{month}",
		"summary": "Get ranking of wikis with most pageviews for a given media file",
		"description": "Returns the ranking of wikis with the most viewed pages containing the given Commons media file.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-commons/v1#GET/commons-analytics/top-wikis-per-media-file-monthly/{media-file}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-editors-by-country/v1",
		"moduleTitle": "Wikimedia Geo Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/editors/by-country/{project}/{activity-level}/{year}/{month}",
		"summary": "Get number of editors by country",
		"description": "Returns the approximate number of editors of a Wikimedia project, split by country of origin.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-editors-by-country/v1#GET/editors/by-country/{project}/{activity-level}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-editors/v1",
		"moduleTitle": "Wikimedia Editor Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/editors/aggregate/{project}/{editor-type}/{page-type}/{activity-level}/{granularity}/{start}/{end}",
		"summary": "Get number of editors",
		"description": "Returns a time series of numbers of editors on a Wikimedia project.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-editors/v1#GET/editors/aggregate/{project}/{editor-type}/{page-type}/{activity-level}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-editors/v1",
		"moduleTitle": "Wikimedia Editor Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/editors/top-by-absolute-bytes-difference/{project}/{editor-type}/{page-type}/{year}/{month}/{day}",
		"summary": "List most-active editors by number of bytes changed",
		"description": "Lists the 100 most-active editors on a Wikimedia project, ordered by the absolute change in page length introduced by their edits, in bytes. For example, if an editor adds 5 bytes and removes 10",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-editors/v1#GET/editors/top-by-absolute-bytes-difference/{project}/{editor-type}/{page-type}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-editors/v1",
		"moduleTitle": "Wikimedia Editor Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/editors/top-by-edits/{project}/{editor-type}/{page-type}/{year}/{month}/{day}",
		"summary": "List most-active editors by number of edits",
		"description": "Lists the 100 most-active editors on a Wikimedia project, ordered by number of edits.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-editors/v1#GET/editors/top-by-edits/{project}/{editor-type}/{page-type}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-editors/v1",
		"moduleTitle": "Wikimedia Editor Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/editors/top-by-net-bytes-difference/{project}/{editor-type}/{page-type}/{year}/{month}/{day}",
		"summary": "List most-active editors by net difference in bytes",
		"description": "Lists the 100 most-active editors on a Wikimedia project, ordered by the net change in page length introduced by their edits, in bytes. For example, if an editor adds 5 bytes and removes 10 bytes,",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-editors/v1#GET/editors/top-by-net-bytes-difference/{project}/{editor-type}/{page-type}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-editors/v1",
		"moduleTitle": "Wikimedia Editor Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/registered-users/new/{project}/{granularity}/{start}/{end}",
		"summary": "Get number of new users",
		"description": "Returns a time series of numbers of newly registered users on a Wikimedia project.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-editors/v1#GET/registered-users/new/{project}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/bytes-difference/absolute/aggregate/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}",
		"summary": "Get absolute change, in bytes",
		"description": "Returns a time series of numbers of bytes changed on a Wikimedia project, calculated as the absolute change in page length. For example, if an edit adds 5 bytes and another edit removes 10 bytes, the",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/bytes-difference/absolute/aggregate/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/bytes-difference/absolute/per-page/{project}/{page-title}/{editor-type}/{granularity}/{start}/{end}",
		"summary": "Get absolute change for a page, in bytes",
		"description": "Returns a time series of numbers of bytes changed on a wiki page, calculated as the absolute change in bytes. For example, if a page has an edit that adds 5 bytes and an edit that removes 10 bytes,",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/bytes-difference/absolute/per-page/{project}/{page-title}/{editor-type}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/bytes-difference/net/aggregate/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}",
		"summary": "Get net change, in bytes",
		"description": "Returns a time series of numbers of bytes changed on a Wikimedia project, calculated as the net change in page length. For example, if an edit adds 5 bytes and another edit removes 10 bytes, the net",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/bytes-difference/net/aggregate/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/bytes-difference/net/per-page/{project}/{page-title}/{editor-type}/{granularity}/{start}/{end}",
		"summary": "Get net change for a page, in bytes",
		"description": "Returns a time series of numbers of bytes changed on a wiki page, calculated as the net change in bytes. For example, if a page has an edit that adds 5 bytes and an edit that removes 10 bytes, the",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/bytes-difference/net/per-page/{project}/{page-title}/{editor-type}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/edited-pages/aggregate/{project}/{editor-type}/{page-type}/{activity-level}/{granularity}/{start}/{end}",
		"summary": "Get number of edited pages",
		"description": "Returns a time series of numbers of edited pages on a Wikimedia project.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/edited-pages/aggregate/{project}/{editor-type}/{page-type}/{activity-level}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/edited-pages/new/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}",
		"summary": "Get number of new pages",
		"description": "Returns a time series of numbers of new pages on a Wikimedia project.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/edited-pages/new/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/edited-pages/top-by-absolute-bytes-difference/{project}/{editor-type}/{page-type}/{year}/{month}/{day}",
		"summary": "List most-edited pages by number of bytes changed",
		"description": "Lists the 100 most-edited pages on a Wikimedia project, ordered by the absolute change in bytes. For example, if a page has an edit that adds 5 bytes and an edit that removes 10 bytes, the absolute",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/edited-pages/top-by-absolute-bytes-difference/{project}/{editor-type}/{page-type}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/edited-pages/top-by-edits/{project}/{editor-type}/{page-type}/{year}/{month}/{day}",
		"summary": "List most-edited pages by number of edits",
		"description": "Lists the 100 most-edited pages on a Wikimedia project, ordered by number of edits.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/edited-pages/top-by-edits/{project}/{editor-type}/{page-type}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/edited-pages/top-by-net-bytes-difference/{project}/{editor-type}/{page-type}/{year}/{month}/{day}",
		"summary": "List most-edited pages by net difference in bytes",
		"description": "Lists the 100 most-edited pages on a Wikimedia project, ordered by the net change in bytes. For example, if a page has an edit that adds 5 bytes and an edit that removes 10 bytes, the net change is",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/edited-pages/top-by-net-bytes-difference/{project}/{editor-type}/{page-type}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/edits/aggregate/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}",
		"summary": "Get number of edits",
		"description": "Returns a time series of numbers of edits to a Wikimedia project.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/edits/aggregate/{project}/{editor-type}/{page-type}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/edits/per-page/{project}/{page-title}/{editor-type}/{granularity}/{start}/{end}",
		"summary": "Get number of edits to a page",
		"description": "Returns a time series of numbers of edits to a wiki page.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/edits/per-page/{project}/{page-title}/{editor-type}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-edits/v1",
		"moduleTitle": "Wikimedia Edit Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/edits/v3/per_editor/{user_central_id}/{page_type}/{granularity}/{start}/{end}",
		"summary": "Get number of edits across all wikis by a user.",
		"description": "Returns a time series of the with edit counts per user central id. Please note that this endpoint is Analytics API v3, and may not match exactly with Analytics API v1. E.g. all params and response",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-edits/v1#GET/edits/v3/per_editor/{user_central_id}/{page_type}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-media-requests/v1",
		"moduleTitle": "Wikimedia Media Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/mediarequests/aggregate/{referer}/{media-type}/{agent}/{granularity}/{start}/{end}",
		"summary": "Get number of media requests",
		"description": "Returns a time series of numbers of media requests to upload.wikimedia.org.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-media-requests/v1#GET/mediarequests/aggregate/{referer}/{media-type}/{agent}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-media-requests/v1",
		"moduleTitle": "Wikimedia Media Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/mediarequests/per-file/{referer}/{agent}/{file-path}/{granularity}/{start}/{end}",
		"summary": "Get number of media requests for a file",
		"description": "Returns a time series of numbers of requests for a media file on upload.wikimedia.org.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-media-requests/v1#GET/mediarequests/per-file/{referer}/{agent}/{file-path}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-media-requests/v1",
		"moduleTitle": "Wikimedia Media Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/mediarequests/top/{referer}/{media-type}/{year}/{month}/{day}",
		"summary": "List most-requested files",
		"description": "Lists the 1000 most-requested media files on upload.wikimedia.org.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-media-requests/v1#GET/mediarequests/top/{referer}/{media-type}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-media-requests/v1",
		"moduleTitle": "Wikimedia Media Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/video_plays/v3/aggregate/{referer}/{agent}/{granularity}/{start}/{end}",
		"summary": "Get aggregate video play counts",
		"description": "Returns a time series of video play counts aggregated across all files. This is an Analytics API v3 endpoint: all params and response keys use snakecase, end date parameters are exclusive, and",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-media-requests/v1#GET/video_plays/v3/aggregate/{referer}/{agent}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-media-requests/v1",
		"moduleTitle": "Wikimedia Media Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/video_plays/v3/per_file/{referer}/{agent}/{file_path}/{granularity}/{start}/{end}",
		"summary": "Get video play counts for a specific file",
		"description": "Returns a time series of video play counts for a specific media file on upload.wikimedia.org. This is an Analytics API v3 endpoint: all params and response keys use snakecase, end date parameters are",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-media-requests/v1#GET/video_plays/v3/per_file/{referer}/{agent}/{file_path}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-media-requests/v1",
		"moduleTitle": "Wikimedia Media Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/video_plays/v3/top/{referer}/{year}/{month}/{day}",
		"summary": "List top video files by play count",
		"description": "Lists the top 1000 most-played video files on upload.wikimedia.org. This is an Analytics API v3 endpoint: response format has a context object and items array.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-media-requests/v1#GET/video_plays/v3/top/{referer}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-page-views/v1",
		"moduleTitle": "Wikimedia Page Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/legacy/pagecounts/aggregate/{project}/{access-site}/{granularity}/{start}/{end}",
		"summary": "Get number of page views (legacy)",
		"description": "Returns a time series of numbers of page views for a Wikimedia project, including page views from both users and bots. This endpoint provides data from January 2008 to July 2016.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-page-views/v1#GET/legacy/pagecounts/aggregate/{project}/{access-site}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-page-views/v1",
		"moduleTitle": "Wikimedia Page Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/pageviews/aggregate/{project}/{access}/{agent}/{granularity}/{start}/{end}",
		"summary": "Get number of page views",
		"description": "Returns a time series of numbers of page views for a Wikimedia project.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-page-views/v1#GET/pageviews/aggregate/{project}/{access}/{agent}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-page-views/v1",
		"moduleTitle": "Wikimedia Page Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/pageviews/per-article/{project}/{access}/{agent}/{article}/{granularity}/{start}/{end}",
		"summary": "Get number of page views for a page",
		"description": "Returns a time series of numbers of page views for a wiki page.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-page-views/v1#GET/pageviews/per-article/{project}/{access}/{agent}/{article}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-page-views/v1",
		"moduleTitle": "Wikimedia Page Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/pageviews/top-by-country/{project}/{access}/{year}/{month}",
		"summary": "Get number of page views by country",
		"description": "Returns the approximate number of page views for a Wikimedia project, split by country of origin. To protect the privacy of readers, this endpoint only returns data for countries with more than 100",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-page-views/v1#GET/pageviews/top-by-country/{project}/{access}/{year}/{month}"
	},
	{
		"module": "wmf-analytics-page-views/v1",
		"moduleTitle": "Wikimedia Page Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/pageviews/top-per-country/{country}/{access}/{year}/{month}/{day}",
		"summary": "List most-viewed pages for a country",
		"description": "Lists the 1000 most-viewed pages for a given country, across all Wikimedia projects, excluding page views from bots and web crawlers. To protect the privacy of readers, this endpoint omits countries",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-page-views/v1#GET/pageviews/top-per-country/{country}/{access}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-page-views/v1",
		"moduleTitle": "Wikimedia Page Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/pageviews/top/{project}/{access}/{year}/{month}/{day}",
		"summary": "List most-viewed pages",
		"description": "Lists the 1000 most-viewed pages on a Wikimedia project.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-page-views/v1#GET/pageviews/top/{project}/{access}/{year}/{month}/{day}"
	},
	{
		"module": "wmf-analytics-page-views/v1",
		"moduleTitle": "Wikimedia Page Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/pageviews/v3/per_editor/{user_central_id}/{granularity}/{start}/{end}",
		"summary": "Returns a timeseries of pageview counts that an editor's edited pages have received.",
		"description": "Returns a timeseries of pageview counts that an editor's edited pages have received. The list of pages for which pageview counts are summed is the list of pages ever edited by the user on the",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-page-views/v1#GET/pageviews/v3/per_editor/{user_central_id}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-page-views/v1",
		"moduleTitle": "Wikimedia Page Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/pageviews/v3/top_pages_per_editor/{user_central_id}/{granularity}/{start}/{end}",
		"summary": "Returns a timeseries of rankings, each data point shows the editor's top edited pages with most pageviews.",
		"description": "Returns a timeseries of rankings, each data point shows the editor's top edited pages with most pageview counts in that time period. The list of pages for which pageview counts are summed is the list",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-page-views/v1#GET/pageviews/v3/top_pages_per_editor/{user_central_id}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-analytics-unique-devices/v1",
		"moduleTitle": "Wikimedia Device Analytics API",
		"instance": "mediawikiwiki",
		"method": "GET",
		"path": "/unique-devices/{project}/{access-site}/{granularity}/{start}/{end}",
		"summary": "Get number of unique devices",
		"description": "Returns a time series of numbers of unique devices that accessed a Wikimedia project.",
		"deepLink": "/explorer/direct/mediawikiwiki/wmf-analytics-unique-devices/v1#GET/unique-devices/{project}/{access-site}/{granularity}/{start}/{end}"
	},
	{
		"module": "wmf-math/v1",
		"moduleTitle": "Math API",
		"instance": "enwiki",
		"method": "POST",
		"path": "/media/math/check/{type}",
		"summary": "Check and normalize a TeX formula.",
		"description": "Checks the supplied TeX formula for correctness and returns the normalised formula representation as well as information about identifiers. Available types are tex and inline-tex. The response",
		"tags": [
			"Math"
		],
		"isDeprecated": true,
		"deepLink": "/explorer/direct/enwiki/wmf-math/v1#tag/math/POST/media/math/check/{type}"
	},
	{
		"module": "wmf-math/v1",
		"moduleTitle": "Math API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/media/math/formula/{hash}",
		"summary": "Get a previously-stored formula",
		"description": "Returns the previously-stored formula via /media/math/check/{type} for the given hash. NOTE: this endpoint is will be removed in the near future. Consider using client-side MathJax rendering",
		"tags": [
			"Math"
		],
		"isDeprecated": true,
		"deepLink": "/explorer/direct/enwiki/wmf-math/v1#tag/math/GET/media/math/formula/{hash}"
	},
	{
		"module": "wmf-math/v1",
		"moduleTitle": "Math API",
		"instance": "enwiki",
		"method": "GET",
		"path": "/media/math/render/{format}/{hash}",
		"summary": "Get rendered formula in the given format.",
		"description": "Given a request hash, renders a TeX formula into its mathematic representation in the given format. When a request is issued to the /media/math/check/{format} POST endpoint, the response contains the",
		"tags": [
			"Math"
		],
		"isDeprecated": true,
		"deepLink": "/explorer/direct/enwiki/wmf-math/v1#tag/math/GET/media/math/render/{format}/{hash}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/page/",
		"summary": "List page-related API entry points.",
		"description": "Stability: stable",
		"tags": [
			"Page content"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/page-content/GET/page/"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/page/html/{title}",
		"summary": "Get latest HTML for a title.",
		"description": "Stability: stable",
		"tags": [
			"Page content"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/page-content/GET/page/html/{title}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/page/html/{title}/{revision}",
		"summary": "Get HTML for a specific title/revision & optionally timeuuid.",
		"description": "Stability: stable",
		"operationId": "getFormatRevision",
		"tags": [
			"Page content"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/page-content/GET/page/html/{title}/{revision}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/page/lint/{title}",
		"summary": "Get the linter errors for a specific title/revision.",
		"description": "Stability: experimental",
		"tags": [
			"Page content"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/page-content/GET/page/lint/{title}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/page/lint/{title}/{revision}",
		"summary": "Get the linter errors for a specific title/revision.",
		"description": "Stability: experimental",
		"tags": [
			"Page content"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/page-content/GET/page/lint/{title}/{revision}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/page/summary/{title}",
		"summary": "Get basic metadata and simplified article introduction.",
		"description": "The summary response includes an extract of the first paragraph of the page in plain text and HTML as well as the type of page. This is useful for page previews (fka. Hovercards, aka. Popups) on the",
		"tags": [
			"Page content"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/page-content/GET/page/summary/{title}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/page/title/{title}",
		"summary": "Get revision metadata for a title.",
		"description": "Returns the revision metadata for the given title. If a revision ID is provided, metadata for that revision is returned, otherwise the latest revision ID is assumed. Stability: stable.",
		"tags": [
			"Page content"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/page-content/GET/page/title/{title}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/page/title/{title}/{revision}",
		"summary": "Get revision metadata for a title.",
		"description": "Returns the revision metadata for the given title. If a revision ID is provided, metadata for that revision is returned, otherwise the latest revision ID is assumed. Stability: stable.",
		"tags": [
			"Page content"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/page-content/GET/page/title/{title}/{revision}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/html/to/wikitext",
		"summary": "Transform HTML to Wikitext",
		"description": "Transform Parsoid HTML to Wikitext. When converting pre-existing (possibly modified) content, you should pass in the title, revision, and If-Match header. This lets Parsoid preserve small syntactic",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/html/to/wikitext"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/html/to/wikitext/{title}",
		"summary": "Transform HTML to Wikitext",
		"description": "Transform Parsoid HTML to Wikitext. When converting pre-existing (possibly modified) content, you should pass in the title, revision, and If-Match header. This lets Parsoid preserve small syntactic",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/html/to/wikitext/{title}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/html/to/wikitext/{title}/{revision}",
		"summary": "Transform HTML to Wikitext",
		"description": "Transform Parsoid HTML to Wikitext. When converting pre-existing (possibly modified) content, you should pass in the title, revision, and If-Match header. This lets Parsoid preserve small syntactic",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/html/to/wikitext/{title}/{revision}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/wikitext/to/html",
		"summary": "Transform Wikitext to HTML",
		"description": "Transform wikitext to HTML. Note that if you set stash: true, you also need to supply the title. Stability: stable Rate limit: 25 req/s (5 req/s when stash: true)",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/wikitext/to/html"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/wikitext/to/html/{title}",
		"summary": "Transform Wikitext to HTML",
		"description": "Transform wikitext to HTML. Note that if you set stash: true, you also need to supply the title. Stability: stable Rate limit: 25 req/s (5 req/s when stash: true)",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/wikitext/to/html/{title}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/wikitext/to/html/{title}/{revision}",
		"summary": "Transform Wikitext to HTML",
		"description": "Transform wikitext to HTML. Note that if you set stash: true, you also need to supply the title. Stability: stable Rate limit: 25 req/s (5 req/s when stash: true)",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/wikitext/to/html/{title}/{revision}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/wikitext/to/lint",
		"summary": "Check Wikitext for lint errors",
		"description": "Parse the supplied wikitext and check it for lint errors. Stability: experimental Rate limit: 25 req/s",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/wikitext/to/lint"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/wikitext/to/lint/{title}",
		"summary": "Check Wikitext for lint errors",
		"description": "Parse the supplied wikitext and check it for lint errors. Stability: experimental Rate limit: 25 req/s",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/wikitext/to/lint/{title}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/transform/wikitext/to/lint/{title}/{revision}",
		"summary": "Check Wikitext for lint errors",
		"description": "Parse the supplied wikitext and check it for lint errors. Stability: experimental Rate limit: 25 req/s",
		"tags": [
			"Transforms"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/transforms/POST/transform/wikitext/to/lint/{title}/{revision}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/media/math/check/{type}",
		"summary": "Check and normalize a TeX formula.",
		"description": "Checks the supplied TeX formula for correctness and returns the normalised formula representation as well as information about identifiers. Available types are tex and inline-tex. The response",
		"tags": [
			"Math"
		],
		"isDeprecated": true,
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/math/POST/media/math/check/{type}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/media/math/formula/{hash}",
		"summary": "Get a previously-stored formula",
		"description": "Returns the previously-stored formula via /media/math/check/{type} for the given hash. NOTE: the use of this endpoint is strongly discouraged. Instead, use the identical endpoint of the (canonical)",
		"tags": [
			"Math"
		],
		"isDeprecated": true,
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/math/GET/media/math/formula/{hash}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/media/math/render/{format}/{hash}",
		"summary": "Get rendered formula in the given format.",
		"description": "Given a request hash, renders a TeX formula into its mathematic representation in the given format. When a request is issued to the /media/math/check/{format} POST endpoint, the response contains the",
		"tags": [
			"Math"
		],
		"isDeprecated": true,
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/math/GET/media/math/render/{format}/{hash}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/citation/{format}/{query}",
		"summary": "Get citation data given an article identifier.",
		"description": "Generates citation data given a URL, DOI, PMID, or PMCID. Automated requests can be made at a rate of 1 request per second (rps). See more at Citoid service documentation The citation data can be",
		"operationId": "getCitation",
		"tags": [
			"Citation"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/citation/GET/data/citation/{format}/{query}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/lists/",
		"summary": "Get all lists of the current user.",
		"description": "Returns metadata describing the lists of the current user. Might be truncated and include a continuation token. Request must be authenticated with a MediaWiki session cookie. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/GET/data/lists/"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/data/lists/",
		"summary": "Create a new list for the current user.",
		"description": "Creates a new empty list. On name conflict, does nothing and returns the data of an existing list. Request must be authenticated with a MediaWiki session cookie. Stability: unstable This endpoint is",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/POST/data/lists/"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/data/lists/{id}",
		"summary": "Delete a list.",
		"description": "List must belong to current user and request must be authenticated with a MediaWiki session cookie. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/DELETE/data/lists/{id}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "PUT",
		"path": "/data/lists/{id}",
		"summary": "Update a list.",
		"description": "List must belong to current user and request must be authenticated with a MediaWiki session cookie. If the name is changed, the new name must not be in use. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/PUT/data/lists/{id}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/lists/{id}/entries/",
		"summary": "Get all entries of a given list.",
		"description": "Returns pages contained by the given list. Might be truncated and include a continuation token. List must belong to current user and request must be authenticated with a MediaWiki session cookie.",
		"operationId": "getListEntries",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/GET/data/lists/{id}/entries/"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/data/lists/{id}/entries/",
		"summary": "Create a new list entry.",
		"description": "Creates a new list entry in the given list. On conflict, does nothing and returns the data of an existing list. The list must belong to the current user and the request must be authenticated with a",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/POST/data/lists/{id}/entries/"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "DELETE",
		"path": "/data/lists/{id}/entries/{entry_id}",
		"summary": "Delete a list entry.",
		"description": "Deletes a given list entry. The list must belong to the current user and the request must be authenticated with a MediaWiki session cookie. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/DELETE/data/lists/{id}/entries/{entry_id}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/data/lists/{id}/entries/batch",
		"summary": "Create multiple new list entries.",
		"description": "See POST /lists/{id}/entries/. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/POST/data/lists/{id}/entries/batch"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/data/lists/batch",
		"summary": "Create multiple new lists for the current user.",
		"description": "See POST /lists/. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/POST/data/lists/batch"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/lists/changes/since/{date}",
		"summary": "Get recent changes to the lists",
		"description": "Returns metadata describing lists and entries which have changed. Might be truncated and include a continuation token. Request must be authenticated with a MediaWiki session cookie. For safe",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/GET/data/lists/changes/since/{date}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/lists/pages/{project}/{title}",
		"summary": "Get lists of the current user which contain a given page.",
		"description": "Request must be authenticated with a MediaWiki session cookie. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/GET/data/lists/pages/{project}/{title}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/data/lists/setup",
		"summary": "Opt in to use reading lists.",
		"description": "Must precede other list operations. Request must be authenticated with a MediaWiki session cookie. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/POST/data/lists/setup"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "POST",
		"path": "/data/lists/teardown",
		"summary": "Opt out from using reading lists.",
		"description": "Deletes all data. User needs to opt in again before being able to do anything. Request must be authenticated with a MediaWiki session cookie. Stability: unstable",
		"tags": [
			"Reading lists"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/reading-lists/POST/data/lists/teardown"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/recommendation/article/creation/morelike/{seed_article}",
		"summary": "Recommend missing articles",
		"description": "Recommends articles similar to the seed article but are missing from the domain language Wikipedia. Stability: unstable",
		"tags": [
			"Recommendation"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/recommendation/GET/data/recommendation/article/creation/morelike/{seed_article}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/recommendation/article/creation/translation/{from_lang}",
		"summary": "Recommend articles for translation.",
		"description": "Recommends articles to be translated from the source to the domain language. See more at Recommendation API documentation Stability: unstable",
		"tags": [
			"Recommendation"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/recommendation/GET/data/recommendation/article/creation/translation/{from_lang}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/recommendation/article/creation/translation/{from_lang}/{seed_article}",
		"summary": "Recommend articles for translation.",
		"description": "Recommends articles to be translated from the source to the domain language. See more at Recommendation API documentation Stability: unstable",
		"tags": [
			"Recommendation"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/recommendation/GET/data/recommendation/article/creation/translation/{from_lang}/{seed_article}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/css/mobile/{type}",
		"summary": "Get CSS for mobile apps.",
		"description": "Gets common CSS mobile apps need to properly display pages using Page Content Service. In most cases all of the types are needed (preferably in this order): base (Common mobile CSS from",
		"tags": [
			"Mobile"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/mobile/GET/data/css/mobile/{type}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/i18n/{type}",
		"summary": "Get internationalization info",
		"description": "Gets internationalization information for the given site. Currently the only supported type is pcs for the Page Content Service. Stability: experimental",
		"tags": [
			"Mobile"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/mobile/GET/data/i18n/{type}"
	},
	{
		"module": "wmf-rest/v1",
		"moduleTitle": "Wikimedia REST APIs",
		"instance": "enwiki",
		"method": "GET",
		"path": "/data/javascript/mobile/{type}",
		"summary": "Get JavaScript for mobileapps",
		"description": "Gets the JavaScript bundle so that clients can have convenient access to that for consuming the page HTML. Amongst other things, it allows to detect the platform and through that enable platform",
		"tags": [
			"Mobile"
		],
		"deepLink": "/explorer/direct/enwiki/wmf-rest/v1#tag/mobile/GET/data/javascript/mobile/{type}"
	}
]
