# Delete old packages

GitHub action for deleting old versions of packages in the GitHub package registry.

This is very similar to [actions/delete-package-versions](https://github.com/actions/delete-package-versions)
but targets a different use case.

The action works by getting at most 20 packages with at most the oldest 100 versions of each, applying the filters (see
table below) on them and then deleting the matching versions.

> If you have more than 100 versions and none of the 100 oldest versions match, no packages will be deleted!

### Inputs

| Name              | Description                                                | Required               | Default       |
|-------------------|------------------------------------------------------------|------------------------|---------------|
| `user`            | User containing the package(s)                             |                        |               |
| `organization`    | Organization containing the package(s)                     |                        |               |
| `type`            | The type of package (e.g. npm)                             | :heavy_check_mark:     |               |
| `package-pattern` | Regex pattern of the packages                              | :heavy_check_mark:     | N\A           |
| `semver-pattern`  | [Semver](https://semver.org) range of the versions         |                        |               |
| `version-pattern` | Regex pattern of the versions                              |                        | `^.+$`        |
| `keep`            | Number of versions to exclude from deletions               |                        | 2             |
| `token`           | Token with the necessary scopes to delete package versions | Depends on the package | Set by GitHub |
| `dry-run`         | If the action should only print what it would do           |                        | `false`       |
| `rate-limit`      | If rate limiting should be enabled                         |                        | `false`       |

> :warning: Certain options can not be combined with each other and will lead to errors. These are:
> - `user` and `organization`.
> - `semver-pattern` and `version-pattern`.

Supported package types as of the current version are: `npm`, `maven`, `rubygems`, `docker`, `nuget` and `container`.

A `token` might be needed, based on which package you are trying to delete. Tokens can be
generated [here](https://github.com/settings/tokens) and need to be added as a secret to the repository
(Settings -> Security -> Secrets and variables -> Actions).

### Example usage

> Delete old versions of the packages "package-1" and "package-2" for the organization "journeyapps-platform".

```yaml
uses: journeyapps-platform/delete-old-packages@v1.1.0
with:
  type: npm
  organization: journeyapps-platform
  package-pattern: "package-(1|2)"
```

> Delete old versions in the form of "1.0.0-RC1" of the package "package".

```yaml
uses: journeyapps-platform/delete-old-packages@v1.1.0
with:
  type: npm
  organization: journeyapps-platform
  version-pattern: "^\\d+\\.\\d+\\.\\d+-RC\\d+$" # The regex needs to be escaped!
  package-pattern: "package"
```

> Delete old versions with a lower semver version than 2.x of the package "package".

```yaml
uses: journeyapps-platform/delete-old-packages@v1.1.0
with:
  type: npm
  organization: journeyapps-platform
  semver-pattern: "<2.x"
  package-pattern: "package"
```

> Delete old versions of the package "package" but keep at least 5 versions.

```yaml
uses: journeyapps-platform/delete-old-packages@v1.1.0
with:
  type: npm
  organization: journeyapps-platform
  keep: 5
  package-pattern: "package"
```

> Delete old versions of the package "package" with a token named "GH_ACCESS_TOKEN".

```yaml
uses: journeyapps-platform/delete-old-packages@v1.1.0
with:
  type: npm
  token: ${{ secrets.GH_ACCESS_TOKEN }}
  organization: journeyapps-platform
  package-pattern: "package"
```

### Rate limit

When using this action with many packages and/or versions you might encounter an error like "API rate limit exceeded".
Internally, the action uses a plugin for octokit which automatically retries requests when the rate limit is exceeded.
In these cases, the rate limit `retry after` returned from the GitHub api during a request is used to wait before
retrying, up to five times. If the rate limit is exceeded more than five times, the action will fail.

```yaml
uses: journeyapps-platform/delete-old-packages@v1.1.0
with:
  type: npm
  organization: journeyapps-platform
  rate-limit: true
  keep: 5
  package-pattern: "package"
```
