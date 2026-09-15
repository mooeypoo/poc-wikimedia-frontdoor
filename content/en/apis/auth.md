---
status: mockup
---

# Authentication

Authenticating an API request allows you to access resources and take actions on behalf of a Wikimedia account.

## Authenticate with your Wikimedia account

Make API request on behalf of your Wikimedia account. The same permissions you have on wiki apply to API request you make, and actions you take are attributed to you, the same way as if you made them on wiki. Bots with a dedicated bot account should also use this type of authentication.

[Read more about personal authentication]()

## Authenticate with a user's Wikimedia account

Allow users to authorize your app to make API request on their behalf. This type of authenticate uses the OAuth authorization code flow.

[Read more about user authentication]()

## Use Wikimedia as an identity provider



## Security best practices

OAuth is designed to keep secrets confidential during authentication and authorization. However, there are additional best practices that you can take to improve the security of your app.

### Storing client credentials

API tokens and client secrets must be kept confidential and not submitted to public source control or exposed in user-accessible code.

### Using PKCE in authorization requests

A Proof Key for Code Exchange (PKCE) is required for mobile, desktop, and single-page apps as part of the OAuth 2.0 authorization code flow. Visit the [OAuth documentation](https://www.oauth.com/oauth2-servers/pkce/authorization-request/) for information about using PKCE in authorization requests.