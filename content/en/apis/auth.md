# Authentication

Authenticating an API request allows you to access resources and perform actions using a Wikimedia account. Wikimedia APIs require authentication for write requests.

**Choose a type of authentication**:

:::navigation-card-grid
::navigation-card{url="#authenticate-with-a-user-account" description="An app that allows users to log in with their Wikimedia account"}
::

::navigation-card{url="#authenticate-with-a-bot-account" description="An service or bot that acts as itself"}
::

::navigation-card{url="#authenticate-with-your-account" description="An local script or prototype that uses your Wikimedia account"}
::
:::

## Manage API credentials

You can create and manage API credentials using Wikimedia Meta-Wiki. [Manage API credentials on Meta-Wiki.](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/list)

::highlight
If you're new to Wikimedia, create an account to be able to create and manage API credentials. [Create a Wikimedia account on Meta-Wiki.](https://auth.wikimedia.org/metawiki/w/index.php?title=Special:CreateAccount)
::

## Authenticate with a user account

Use this authentication method to integrate your app with users' Wikimedia accounts. Users can log in and authorize your app to access resources or perform actions using their account. Use this type of authentication to create specialized experiences for Wikimedia contributors.

::highlight
**Protocol**: OAuth 2.0 authorization code flow<br>
**Supports**: server-side apps, client-side apps, and installed apps
::

### 1. Register an app

Log in to Wikimedia Meta-Wiki, and complete the form to register an OAuth app. [Create credentials.](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2)

After registering the app, the confirmation shows the client ID and secret. Make sure to store these credentials securely before exiting the dialog.

#### Choosing a redirect URI

To use the authorization code flow, choose a redirect URI for your app. Following successful authorization, the authorization server redirects users to your app via this path. For mobile apps, read about [best practices for redirect URLs](https://www.oauth.com/oauth2-servers/redirect-uris/redirect-uris-native-apps/).

### 2. Request authorization

The first step in the workflow is to exchange user approval for an authorization code. To request authorization, ask your users to click on a link containing the Wikimedia API authentication server URL, your client ID, and the response type (`code`). This links takes the user to a page on Meta-Wiki where they can log in with their Wikimedia account and approve the request.

:::code-block{label="URL format for authorization requests"}
```http
https://meta.wikimedia.org/w/rest.php/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code
```
:::

::callout
For mobile apps, desktop apps, Javascript apps, or other types of apps that publish client secrets in user-accessible code, include a [PKCE code challenge](#using-pkce-in-authorization-requests) in your authorization request.
::

If the user approves the request, they are redirected to your app's redirect URI with a query parameter (`code`) that contains the authorization code. Next, you will use this code to get an access token.

### 3. Get access token

Now that you have an authorization code, you can use it to get an access token from the authentication server. To request an access token, submit a POST request using your authorization code, client ID, and client secret.

:::code-block{label="Request an access token using an authorization code"}
```bash
curl -X POST -d 'grant_type=authorization_code' \
-d 'code=YOUR_AUTHORIZATION_CODE' \
-d 'client_id=YOUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```
:::

The response contains an `access_token` and a `refresh_token`.

### 4. Get information about the user

You can use the access token to get information about the user's login profile to include in your app's UI.

:::code-block{label="Get information about a user"}
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://meta.wikimedia.org/w/rest.php/resource/profile
```
:::

### 5. Authenticate requests

To authenticate an API request, include the access token in the Authorization request header using the Bearer authentication scheme. Your access token is valid for the permissions enabled in your OAuth credentials.

:::code-block{label="Fetch the Earth article from English Wikipedia"}
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```
:::

### 6. Refresh token

Access tokens expire after four hours. To get a new access token, submit a POST request using your refresh token, client ID, and client secret. Refresh tokens are valid for 365 days.

:::code-block{label="Request an access token using a refresh token"}
```bash
curl -X POST -d 'grant_type=refresh_token' \
-d 'refresh_token=YOUR_REFRESH_TOKEN' \
-d 'client_id=OUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```
:::

### Using PKCE in authorization requests

A Proof Key for Code Exchange (PKCE) is required for mobile, desktop, and client-side apps as part of the OAuth 2.0 authorization code flow. [Learn more about PKCE.](https://www.oauth.com/oauth2-servers/pkce/authorization-request/)

## Authenticate with a bot account

Established bots and other automated services typically have their own Wikimedia account and set of permissions. This authentication method lets you authenticate API requests using a bot's account. Each Wikimedia project has its own policy for testing and approving bots, so see your local wiki to learn more before creating a bot account.

::highlight
**Protocol**: OAuth 2.0 client credentials  flow<br>
**Supports**: server-side apps
::

### 1. Create credentials

Log in to Wikimedia Meta-Wiki with the bot's account, and complete the form to register a service. [Create credentials.](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2)

After registering the service, the confirmation shows the client ID and secret. Make sure to store these credentials securely before exiting the dialog.

### 2. Get an access token

To start the authentication process, request an access token from Meta-Wiki using your client ID and secret. The response contains an `access_token`.


:::code-block{label="Request an access token using a client ID and secret"}
```bash
curl -X POST -d 'grant_type=client_credentials' \
-d 'client_id=YOUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```
:::

### 3. Authenticate your request

To authenticate an API request, include the access token in the Authorization request header using the Bearer authentication scheme.

:::code-block{label="Get the Earth article from English Wikipedia"}
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```
:::

### 4. Refresh the access token

Access tokens have limited validity and expire after four hours. To get a new access token, re-submit the POST request in step 2.

## Authenticate with your account

Personal API tokens let you authenticate API requests on behalf of your Wikimedia account. You can use personal API tokens for testing and evaluation, running scripts locally, and prototyping apps.

::callout{type="warning"}
Personal API tokens are tied to the account that created them and must be stored securely. Do not share or publish your personal API token.
::

### 1. Create token

Log in to Wikimedia Meta-Wiki with the bot's account, and complete the form to register a service. Remember to store your access token in a secure place, like a password manager. [Create a token.](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2)

### 2. Authenticate request

To authenticate an API request, include your access token in the Authorization request header using the Bearer authentication scheme. Personal access tokens are valid indefinitely and do not expire.

:::code-block{label="Get the Earth article from English Wikipedia"}
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```
:::

## Authenticate in the API explorer

The API explorer allows you to make live API requests, including write operations. To use an access token in the API explorer, add a header with key `Authorization` and value `Bearer YOUR_TOKEN`.

::callout{type="warning"}
Write requests that you make in the API explorer modify live data on public wikis. To experiment safely, set the request URL to test.wikipedia.org.
::

## Authenticate using CSRF tokens

For new apps, we recommend an authentication method that uses OAuth. If your app already uses cross-site request forgery (CSRF) tokens for API authentication, you can use CSRF tokens with Wikimedia API write operations that support the `token` parameter. [Learn more about CSRF tokens.](https://www.mediawiki.org/wiki/API:Tokens)
