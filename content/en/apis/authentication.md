---
status: mockup
---

# Authentication

Wikimedia APIs are free to use without an account, but following identification and authentication best practices offers higher rate limits and secure methods for write access.

## Client identification

Wikimedia APIs require an HTTP [User-Agent header](https://en.wikipedia.org/wiki/User-Agent_header) for all requests. This helps identify your app and ensures that system administrators can contact you if a problem arises. Clients making requests without a User-Agent header may be blocked without notice. See the Wikimedia Foundation's [User-Agent policy](https://foundation.wikimedia.org/wiki/Special:MyLanguage/Policy:User-Agent_policy) for more information.

The User-Agent header can include a link to a user page on a Wikimedia wiki, a URL for a relevant external website, or an email address.

## OAuth authorization code flow

### 1. Register an app

To use the authorization code flow, you must select the "Authorization code" and "Refresh token" options in the "Allowed OAuth2 grant types" of the [OAuth 2.0 app registration form](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2). After registering the app, you'll be shown a client ID and secret. Make sure to store these credentials securely before exiting the dialog.

#### Choosing a redirect URI

To use the authorization code flow, you'll need to choose a redirect URI for your app. Following successful authorization, the authorization server redirects users to your app via this path. For mobile apps, read about [best practices for redirect URLs](https://www.oauth.com/oauth2-servers/redirect-uris/redirect-uris-native-apps/).

### 2. Request authorization

The first step in the workflow is to exchange user approval for an authorization code. To request authorization, ask your users to click on a link containing the Wikimedia API authentication server URL, your client ID, and response type. This takes the user to a page on meta.wikimedia.org where they can log in with their Wikimedia account and approve the request.

```bash
# URL format for authorization requests
https://meta.wikimedia.org/w/rest.php/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code
```

::callout
For mobile apps, desktop apps, Javascript apps, or other types of apps that publish client secrets in user-accessible code, include a [PKCE code challenge](#using-pkce-in-authorization-requests) in your authorization request.
::

If the user approves the request, they are redirected to your app's redirect URI with a query parameter (`code`) that contains the authorization code. Next, you will use this code to get an access token.

### 3. Get access token

Now that you have an authorization code, you can use it to get an access token from the authentication server. To request an access token, submit a POST request using your authorization code, client ID, and client secret.

```bash
# Request an access token using an authorization code
curl -X POST -d 'grant_type=authorization_code' \
-d 'code=YOUR_AUTHORIZATION_CODE' \
-d 'client_id=YOUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```

The response contains an `access_token` and a `refresh_token`.

### 4. Authenticate request

To authenticate an API request, include the access token in the Authorization request header using the Bearer authentication scheme.

```bash
# Get the Earth article from English Wikipedia
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```

### 5. Refresh token

Access tokens have limited validity and expire after four hours. To get a new access token, submit a POST request using your refresh token, client ID, and client secret. Refresh tokens are valid for 365 days.[^1]

```bash
# Request an access token using a refresh token
curl -X POST -d 'grant_type=refresh_token' \
-d 'refresh_token=YOUR_REFRESH_TOKEN' \
-d 'client_id=OUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```

## Owner-only consumers

::callout
Support for owner-only consumers is currently a work in progress.
::

Owner-only consumers let you authenticate API requests on behalf of your Wikimedia account.

### 1. Create token

To use the authorization code flow, you must select the "This consumer is for use only by YourUsername" option in the [OAuth 2.0 app registration form](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2).

### 2. Authenticate request

To authenticate an API request, include your access token in the Authorization request header using the Bearer authentication scheme.

```bash
# Get the Earth article from English Wikipedia
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```

### 3. Implement cookies

To receive a higher [rate limit](/wiki/Special:MyLanguage/Wikimedia_APIs/Rate_limits), clients that use owner-only tokens must implement support for [returning cookies to the server](https://en.wikipedia.org/wiki/HTTP_cookie). For examples, see [OAuth/Owner-only consumers](/wiki/OAuth/Owner-only_consumers).

## Client credentials flow

The [OAuth 2.0 client credentials flow](https://oauth.net/2/grant-types/client-credentials/) uses a client ID and client secret to fetch an access token.

### 1. Create credentials

To use the client credentials flow, you must select the "Client credentials" option in the "Allowed OAuth2 grant types" of the [OAuth 2.0 app registration form](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2). After creating the consumer, you'll be shown a client ID and secret. Make sure to store these credentials securely before exiting the dialog.

### 2. Get an access token

To start the authentication process, use your client credentials to request an access token from the authentication server. The Wikimedia API uses meta.wikimedia.org as the authentication server. To request an access token, submit a POST request using your client ID and secret.

```bash
# Request an access token using a client ID and secret
curl -X POST -d 'grant_type=client_credentials' \
-d 'client_id=YOUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```

The response contains an `access_token`.

### 3. Authenticate your request

To authenticate an API request, include the access token in the Authorization request header using the Bearer authentication scheme.

```bash
# Get the Earth article from English Wikipedia
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```

### 4. Refresh the access token

Access tokens have limited validity and expire after four hours[^2]. To get a new access token, re-submit the POST request in [step 2](#2-get-an-access-token).

## Security best practices

OAuth is designed to keep secrets confidential during authentication and authorization. However, there are additional best practices that you can take to improve the security of your app.

### Storing client credentials

API tokens and client secrets must be kept confidential and not submitted to public source control or exposed in user-accessible code.

### Using PKCE in authorization requests

A Proof Key for Code Exchange (PKCE) is required for mobile, desktop, and single-page apps as part of the OAuth 2.0 authorization code flow. Visit the [OAuth documentation](https://www.oauth.com/oauth2-servers/pkce/authorization-request/) for information about using PKCE in authorization requests.