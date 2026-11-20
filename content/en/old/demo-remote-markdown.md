---
title: Demo Remote Markdown
remoteImport: true
sourceId: wikimedia-spectral-ruleset
---

# Wikimedia Spectral Ruleset

![Tests](https://gitlab.wikimedia.org/repos/ci-tools/wikimedia-spectral-ruleset/badges/main/pipeline.svg)

Reusable OpenAPI linting rules for Wikimedia APIs, published as an npm package for Spectral.

Use this ruleset as a base, then layer your own organization rules on top.

Complete reference of linter rules defined in this package is available in [RULE_REFERENCE.md](https://gitlab.wikimedia.org/repos/ci-tools/wikimedia-spectral-ruleset/-/blob/main/RULE_REFERENCE.md).

## Install

~~~bash
npm install --save-dev @wikimedia/wikimedia-spectral-ruleset
~~~

## Quick start

Create a Spectral config file named .spectral.yaml:

~~~yaml
extends:
  - "@wikimedia/wikimedia-spectral-ruleset"
~~~

Lint your OpenAPI document:

~~~bash
npx spectral lint openapi.yaml
~~~

## Use in your own ruleset file

If you maintain a custom ruleset, extend Wikimedia rules and add local overrides.

Example file: my-org.spectral.yaml

~~~yaml
extends:
  - "@wikimedia/wikimedia-spectral-ruleset"

rules:
  # Keep Wikimedia rules, but adjust severity locally
  wikimedia-require-contact:
  severity: error

  # Add project-specific rule
  operation-operationId-kebab-case:
    description: Operation IDs must be kebab-case
    message: "operationId '{{value}}' must be kebab-case"
    given: $.paths[*][get,put,post,delete,options,head,patch,trace].operationId
    severity: warn
    then:
        function: pattern
        functionOptions:
            match: '^[a-z0-9]+(?:-[a-z0-9]+)*$'
~~~

Run with your custom file:

~~~bash
npx spectral lint openapi.yaml -r my-org.spectral.yaml
~~~

## Rule overrides

To turn off a Wikimedia rule:

~~~yaml
extends:
  - "@wikimedia/wikimedia-spectral-ruleset"

rules:
    wikimedia-require-contact:
      severity: off
~~~

To change severity:

~~~yaml
rules:
    wikimedia-require-contact:
        severity: warn
~~~

## Contributing

For contributor workflows (development, changelog maintenance, and release steps), see DEVELOPERS.md.

## License

Released under the [MIT License](LICENSE.md).
