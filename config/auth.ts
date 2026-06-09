/**
 * Authentication-related configuration for the Front Door developer portal.
 *
 * Real Wikimedia OAuth 2.0 + PKCE integration is planned for Experiment 2
 * (`stores/oauthSession` + `useOAuthSession()` per ARCHITECTURE.md). Prototype
 * account dashboard state uses `stores/prototypeAuthSession.ts` until that work lands.
 */

/**
 * Route to the developer account dashboard (token management prototype).
 * Open directly at `/account` (locale prefix applied at runtime when required).
 */
export const ACCOUNT_PAGE_PATH = '/account'

/**
 * Default wiki username for the prototype account dashboard when `/account` is opened directly.
 */
export const PROTOTYPE_DEFAULT_WIKI_USERNAME = 'ExampleDeveloper'

/** Wikimedia Meta-Wiki base URL — central OAuth wiki for Wikimedia projects. */
export const META_WIKI_BASE_URL = 'https://meta.wikimedia.org'

/**
 * Register a new OAuth 2.0 consumer on Wikimedia's Meta-Wiki (recommended for new applications).
 *
 * @see https://www.mediawiki.org/wiki/OAuth/For_Developers#Registration
 */
export const META_OAUTH2_CONSUMER_REGISTRATION_URL =
	`${ META_WIKI_BASE_URL }/wiki/Special:OAuthConsumerRegistration/propose/oauth2`

/**
 * Public list of registered OAuth consumers on Wikimedia's Meta-Wiki.
 */
export const META_OAUTH_CONSUMER_LIST_URL =
	`${ META_WIKI_BASE_URL }/wiki/Special:OAuthListConsumers`

/**
 * Owner-only consumers — personal tokens for the registering user only.
 *
 * @see https://www.mediawiki.org/wiki/OAuth/Owner-only_consumers
 */
export const MEDIAWIKI_OWNER_ONLY_CONSUMERS_DOC_URL =
	'https://www.mediawiki.org/wiki/OAuth/Owner-only_consumers'

/**
 * OAuth developer documentation (registration, OAuth 2.0 flow, security).
 */
export const MEDIAWIKI_OAUTH_FOR_DEVELOPERS_DOC_URL =
	'https://www.mediawiki.org/wiki/OAuth/For_Developers'

/**
 * Wikimedia API authentication overview (Wikimedia's Meta-Wiki as authorization server).
 */
export const MEDIAWIKI_WIKIMEDIA_API_AUTHENTICATION_DOC_URL =
	'https://www.mediawiki.org/wiki/Wikimedia_APIs/Authentication'
