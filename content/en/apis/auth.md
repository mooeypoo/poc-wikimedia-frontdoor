---
status: mockup
---

# Authentication

Wikimedia APIs are free to use without an account, but following identification and authentication best practices offers higher rate limits and secure methods for write access.

TBD

## Security best practices

OAuth is designed to keep secrets confidential during authentication and authorization. However, there are additional best practices that you can take to improve the security of your app.

### Storing client credentials

API tokens and client secrets must be kept confidential and not submitted to public source control or exposed in user-accessible code.

### Using PKCE in authorization requests

A Proof Key for Code Exchange (PKCE) is required for mobile, desktop, and single-page apps as part of the OAuth 2.0 authorization code flow. Visit the [OAuth documentation](https://www.oauth.com/oauth2-servers/pkce/authorization-request/) for information about using PKCE in authorization requests.