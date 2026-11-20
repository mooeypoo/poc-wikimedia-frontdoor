# Personal API tokens

Personal API tokens let you authenticate API requests on behalf of your Wikimedia account.

## 1. Create token

To use the authorization code flow, you must select the "This consumer is for use only by YourUsername" option in the [OAuth 2.0 app registration form](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2).

## 2. Authenticate request

To authenticate an API request, include your access token in the Authorization request header using the Bearer authentication scheme.

:::code-block
```bash
# Get the Earth article from English Wikipedia
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```
:::

## 3. Implement cookies

To receive a higher [rate limit](/wiki/Special:MyLanguage/Wikimedia_APIs/Rate_limits), clients that use prsonal API tokens must implement support for [returning cookies to the server](https://en.wikipedia.org/wiki/HTTP_cookie). For examples, see [OAuth/Owner-only consumers](/wiki/OAuth/Owner-only_consumers).
