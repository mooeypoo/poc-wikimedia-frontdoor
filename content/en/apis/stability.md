---
status: mockup
---

# Stability

This page describes the stability and versioning policy for Wikimedia APIs.

## Versions

### v1+

Wikimedia APIs are versioned using a version number in the path (for example: `/v1/`). Following the principles of [semantic versioning](https://semver.org/), the version number is incremented when an endpoint is changed in a backwards-incompatible way, such as removing a response property or adding a required parameter. Within a major version, the API may change in backwards-compatible ways, such as adding a response property or optional request parameter.

### v0

APIs with `/v0/` in the path are unstable and may change in backwards incompatible ways without notice.

## Module audiences

As part of REST API module creation, we are also introducing the concept of API audiences. Audiences indicate which developers the API is intended for, and makes associated stability assumptions. API audience designations are included as part of the API module definition and will appear as version suffixes within endpoint URLs were appropriate.

### Public

Example route: `rest.php/mymodule/v1/example-endpoint`

Public APIs enable external tools and bots to run on top of Wikimedia projects and enable content reuse for external systems. Public endpoints are guaranteed to be stable, meaning breaking changes will not be introduced without incrementing the API's major version. External tool developers and content reusers are encouraged to use public APIs and can be sure that the basic interface will continue to work as documented.

### Beta

Example route: `rest.php/mymodule/v1-beta/example-endpoint`

Beta APIs are exploratory, subject to change, and intentionally short-lived. They are intended to provide a functional endpoint to collect user feedback and support iterative API development. The version in the beta route most commonly correlates to the version being tested — for example, if v1 is the current major version, v2-beta may be introduced to test changes ahead of the next major version release. All beta modules will either be elevated to official vX endpoints or will be removed entirely once the beta phase is over.

### Internal

Example route: `rest.php/mymodule/v1-internal/example-endpoint`

Internal APIs are only intended for use by Wikimedia Foundation staff and services. Although publicly published and technically available to call, stability is not guaranteed and usage outside of Wikimedia Foundation use cases is discouraged. In some cases, internal APIs may be reused or repackaged as a sister public API. In cases where an internal API is used by multiple teams, major versions are expected in parallel with the internal indicator, but appropriate versioning may not be strictly enforced due to internal needs.

### Restricted

Example route: `rest.php/mymodule/v1-restricted/example-endpoint`

Restricted APIs are access controlled beyond the standard API requirements. These APIs may require elevated user permissions, allow-list membership, or specific verifiable JWTs for access. In most cases, these APIs handle sensitive information (such as personally identifiable information) or perform operationally expensive or high-risk operations. These APIs are not intended for public use and therefore may have neither publicly discoverable documentation nor OpenAPI descriptions available, even if they are used to power specific Wikimedia features.

## Updates

To be notified about important updates, subscribe to the [api-announce list](mailto:mediawiki-api-announce).
