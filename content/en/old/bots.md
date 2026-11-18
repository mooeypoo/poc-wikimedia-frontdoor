# Bot passwords

## Client credentials flow

The [OAuth 2.0 client credentials flow](https://oauth.net/2/grant-types/client-credentials/) uses a client ID and client secret to fetch an access token.

### 1. Create credentials

To use the client credentials flow, you must select the "Client credentials" option in the "Allowed OAuth2 grant types" of the [OAuth 2.0 app registration form](https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth2). After creating the consumer, you'll be shown a client ID and secret. Make sure to store these credentials securely before exiting the dialog.

### 2. Get an access token

To start the authentication process, use your client credentials to request an access token from the authentication server. The Wikimedia API uses meta.wikimedia.org as the authentication server. To request an access token, submit a POST request using your client ID and secret.

:::code-block
```bash
# Request an access token using a client ID and secret
curl -X POST -d 'grant_type=client_credentials' \
-d 'client_id=YOUR_CLIENT_ID' \
-d 'client_secret=YOUR_CLIENT_SECRET' \
https://meta.wikimedia.org/w/rest.php/oauth2/access_token
```
:::

The response contains an `access_token`.

### 3. Authenticate your request

To authenticate an API request, include the access token in the Authorization request header using the Bearer authentication scheme.

:::code-block
```bash
# Get the Earth article from English Wikipedia
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
https://en.wikipedia.org/w/rest.php/v1/page/Earth/bare
```
:::

### 4. Refresh the access token

Access tokens have limited validity and expire after four hours[^2]. To get a new access token, re-submit the POST request in [step 2](#2-get-an-access-token).