# Making API requests

Learn about best practices for making requests to Wikimedia APIs.

## Identifying requests with a User-Agent

Wikimedia APIs require an HTTP User-Agent header for all requests. This helps identify your app and ensures that system administrators can contact you if a problem arises. Clients making requests without a User-Agent header may be blocked without notice. [See the Wikimedia Foundation's User-Agent policy for more information.]()

The User-Agent header can include a link to a user page on a Wikimedia wiki, a URL for a relevant external website, or an email address.

:::code-block{label="Preferred format for User-Agent headers"}
```text
<client name>/<version> (<contact information>) <library/framework name>/<version>
```
:::

If you are calling the API from browser-based JavaScript, you may not be able to influence the User-Agent header, depending on the browser. To work around this, use the Api-User-Agent header.

## Optimizing with conditional requests

Wikimedia API endpoints support conditional requests using ETags. You can use ETags to optimize your API calls when accessing the same resource multiple times

To make a conditional GET request, provide the value of the `etag` response header in the If-None-Match request header. If the resource remains the same, the API returns HTTP status 304 (Not Modified). If the resource has changed, the API returns HTTP status 200 (OK) with the latest data and a new ETag.

To make a conditional write request, provide the value of the `etag` in the If-Match request header to detect whether the resource has change since it was last fetched. If the resource has changed, the API returns HTTP status 412 (Precondition Failed). If the resource remains the same, the API completes the request normally.

## Handling errors

Wikimedia APIs use HTTP status codes to indicate the success or failure of a request. A successful request returns a status code in the 200 range; a failed request returns a status code in the 400 or 500 range. [See the API reference for status codes specific to each endpoint.]()

* 200	Resource found or updated
* 201	Resource created
* 400	Invalid or missing parameter
* 403	Permission denied, or missing a User-Agent
* 404	Route not found
* 412	Invalid conditional request
* 415	Unsupported content type
* 429   Rate limit exceeded
* 500	Server error

## Authentication

Authenticating an API request allows you to access resources and perform actions using a Wikimedia account. Wikimedia APIs require authentication for write requests. [Learn more about authentication.](/apis/auth)

## Rate limits

For unauthenticated requests, rate limits are determined by the presence of a user agent and the platform making the request. For authenticated requests, rate limits depend on the status of the Wikimedia account. [Learn more about rate limits.](/apis/rate-limits)
