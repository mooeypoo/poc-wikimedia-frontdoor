---
status: mockup
---

# Rate limits

Requests to Wikimedia APIs are subject to rate limiting to protect Wikimedia infrastructure from overloading and to ensure fair access to resources for all clients.

## Best practices

To avoid being rate limited, clients should follow these best practices and the rules in the [robot policy](https://wikitech.wikimedia.org/wiki/Robot_policy). In particular, clients should:

- Include a meaningful User-Agent header that includes contact information such as an email or full URL. For example: `CoolBot/0.0 (https://example.org/coolbot/; coolbot@example.org) generic-library/0.0`. For more information, see the [User-Agent policy](https://foundation.wikimedia.org/wiki/Policy:Wikimedia_Foundation_User-Agent_Policy).
- Implement cookie support when using [bot passwords](/wiki/Manual:Bot_passwords) or [OAuth](/wiki/OAuth/For_Developers) to authenticate. However, multi-user OAuth 2 apps should not send cookies.
- Limit the number of concurrent requests to 3 or fewer.
- Follow API-specific guidelines, such as [Action API etiquette](/wiki/API:Etiquette).
- Respect the Retry-After header provided with a 429 Too Many Requests status code.

Community members that need a higher rate of access should:

- Request the [bot flag](/wiki/Manual:Bots) from your local wiki community. Community-approved bots get higher rate limits.
- Where appropriate, consider running your bot in Toolforge or another [Wikimedia Cloud Services](https://wikitech.wikimedia.org/wiki/Help:Cloud_Services_introduction) offering.

If you require high-volume, commercial access:

- [Wikimedia Enterprise](https://enterprise.wikimedia.com/) APIs are available with free access for all users up to certain speed and volume limits.
- [Commercial rates](https://enterprise.wikimedia.com/pricing/) are offered for those who require higher speed, volumes, or SLA requirements.

## Limits

Rate limits take into account the client's identity and level of access. Below is an overview of rate limits grouped by the type of client ([caveats](#caveats) apply). They are enforced per-minute to help smooth out API traffic and minimize the impact on any user that inadvertently hits a rate limit. Limits have been set at a level that is high enough to still allow for short bursts of requests.

| Group | Description | Limit (req/min) |
|---|---|---|
| Unidentified | Requests with no identifying characteristics other than IP address | 10 |
| Unidentified | Requests made from a web browser by an unauthenticated user | 200 |
| User-Agent only | Unauthenticated bot requests with a compliant User-Agent header | 200 |
| User-Agent only | Requests from third-party MediaWiki wikis (for example via InstantCommons) | 200 |
| Authenticated | Authenticated requests from users who are new or have few edits | 200 |
| Authenticated | Authenticated requests from users who are established editors | 2000 |
| Authenticated | Authenticated requests from users with extended global rights (e.g. stewards) | Exempt¹ |
| Authenticated | Authenticated requests from bot accounts with a bot flag on any wiki | Exempt¹ |
| Wikimedia Cloud Services (WMCS) | Server-side requests from WMCS with a compliant User-Agent | Exempt¹ |
| Known client | Requests from clients granted an exemption by the Wikimedia Foundation | Exempt¹ |

¹ Clients that are exempt from API rate limiting are still subject to [operational rate limits](https://wikitech.wikimedia.org/wiki/Requestctl) and the [Robot policy](https://wikitech.wikimedia.org/wiki/Robot_policy).

### Action-based rate limits

In addition to limits based on client identity, actions (such as editing pages, moving pages, and uploading files) are rate limited to prevent vandalism and other harmful behaviors. Action-based limits depend on the status of the user account and on the policy of the individual wiki. For example, most Wikimedia projects limit logged-out users to eight edits per minute. To learn more about actions and specific limits, see [Manual:Rate limits](/wiki/Manual:Rate_limits).

## Errors

When a client exceeds its rate limit, the gateway responds with HTTP status code [429 (Too Many Requests)](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes#429). Other components involved in handling the request may also respond with status 429 when per-client limits are exceeded, or with status 503 (Service Unavailable) when a backend system such as a database server is overloaded.

Responses with status code 429 or 503 typically also have the Retry-After header set, indicating how long the client should wait until it retries the request. If no such header is present, clients should wait at least five seconds, or implement [exponential back-off](https://en.wikipedia.org/wiki/Exponential_backoff).

## Caveats

Operators of API clients should be aware of the following edge cases and pitfalls:

- The limits described above do not apply to the [Lift Wing API](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API). To learn about rate limits for the Lift Wing API, see the [documentation on Wikitech](https://wikitech.wikimedia.org/wiki/Machine_Learning/LiftWing/API/External_usage#Rate_limits_for_external_usage).
- [OAuth 1](/wiki/OAuth/For_Developers#OAuth_1.0a) access tokens are not supported on their own by the rate limit infrastructure. Requests using OAuth 1 tokens will be treated as unauthenticated with respect to rate limiting, unless you also send cookies with the request.
- Elevated rate limits embedded directly in some older [owner-only](/wiki/OAuth/Owner-only_consumers) tokens are ignored by the new rate limiting infrastructure (but are still used for endpoints on api.wikimedia.org, see [T409305](https://phabricator.wikimedia.org/T409305)). Going forward, rate limits will be determined by a user's current privileges, not limits assigned at the time of token creation.
- Generally, a *refresh-token flow* or *client-credentials flow* would be preferred over direct use of owner-only tokens for OAuth 2.0, but support for that is still limited (see [T407987](https://phabricator.wikimedia.org/T407987) and [T412214](https://phabricator.wikimedia.org/T412214)). For now, clients should support session cookies to be used along with OAuth tokens. This allows the correct rate limit class to be applied.

## Get help

Bot operators who are unsure how to get the access they need can contact the Wikimedia Foundation at bot-traffic@wikimedia.org.
