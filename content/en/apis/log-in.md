# Log in with Wikimedia

## OAuth authorization code flow

To allow your app to interact with and access content on behalf of a user, use the [OAuth 2.0 authorization code flow](https://oauth.net/2/grant-types/authorization-code/). This provides a secure process for users to log in with their Wikimedia account and authorize your app. The OAuth 2.0 authorization code workflow can be used by server-side, client-side, and installed apps.

The OAuth 2.0 authorization code workflow includes three steps: request authorization, get a token, and authenticate the request.

### 1. Register an app

To use the authorization code flow, you must select the "Authorization code" and "Refresh token" options in the "Allowed OAuth2 grant types" of the [OAuth 2.0 app registration form](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2). After registering the app, you'll be shown a client ID and secret. Make sure to store these credentials securely before exiting the dialog.

#### Choosing a redirect URI

To use the authorization code flow, you'll need to choose a redirect URI for your app. Following successful authorization, the authorization server redirects users to your app via this path. For mobile apps, read about [best practices for redirect URLs](https://www.oauth.com/oauth2-servers/redirect-uris/redirect-uris-native-apps/).

### 2. Request authorization

The first step in the workflow is to exchange user approval for an authorization code. To request authorization, ask your users to click on a link containing the Wikimedia API authentication server URL, your client ID, and response type. This takes the user to a page on meta.wikimedia.org where they can log in with their Wikimedia account and approve the request.

:::code-block
```bash
# URL format for authorization requests
https://meta.wikimedia.org/w/rest.php/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code
```
:::

::callout
For mobile apps, desktop apps, Javascript apps, or other types of apps that publish client secrets in user-accessible code, include a [PKCE code challenge](#using-pkce-in-authorization-requests) in your authorization request.
::

If the user approves the request, they are redirected to your app's redirect URI with a query parameter (`code`) that contains the authorization code. Next, you will use this code to get an access token.

### 3. Get access token

Now that you have an authorization code, you can use it to get an access token from the authentication server. To request an access token, submit a POST request using your authorization code, client ID, and client secret.

:::code-block
```bash
# Request an access token using an authorization code
curl -X POST -d 'grant_type=authorization_code' \
-d 'code=YOUR_AUTHORIZATION_CODE' \
-d 'client_id=YOUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```
:::

The response contains an `access_token` and a `refresh_token`.

### 4. Authenticate request

To authenticate an API request, include the access token in the Authorization request header using the Bearer authentication scheme.

:::code-block
```bash
# Get the Earth article from English Wikipedia
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```
:::

### 5. Refresh token

Access tokens have limited validity and expire after four hours. To get a new access token, submit a POST request using your refresh token, client ID, and client secret. Refresh tokens are valid for 365 days.[^1]

:::code-block
```bash
# Request an access token using a refresh token
curl -X POST -d 'grant_type=refresh_token' \
-d 'refresh_token=YOUR_REFRESH_TOKEN' \
-d 'client_id=OUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```
:::

