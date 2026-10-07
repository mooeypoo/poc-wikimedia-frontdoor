# Client identification

Wikimedia APIs require an HTTP [User-Agent header](https://en.wikipedia.org/wiki/User-Agent_header) for all requests. This helps identify your app and ensures that system administrators can contact you if a problem arises. Clients making requests without a User-Agent header may be blocked without notice.

The User-Agent header can include a link to a user page on a Wikimedia wiki, a URL for a relevant external website, or an email address.

Here is the preferred format for User-Agent headers:

```
<client name>/<version> (<contact information>) <library/framework name>/<version>
```

If you are calling the API from browser-based JavaScript, you may not be able to influence the User-Agent header, depending on the browser. To work around this, use the `Api-User-Agent` header.
