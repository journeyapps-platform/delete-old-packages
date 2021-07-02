# Delete old packages

Github action for deleting old versions of packages in the Github package registry.

### Inputs

| Name              | Description                                                | Required           | Default       |
| ----------------- | ---------------------------------------------------------- | ------------------ | ------------- |
| `owner`           | Owner of the repo containing the package(s)                | no                 | Set by Github |
| `repo`            | Repo containing the package(s)                             | no                 | Set by Github |
| `package-pattern` | Regex pattern of the packages                              | yes                | N\A           |
| `version-pattern` | Regex pattern of the versions                              | yes                | N\A           |
| `keep`            | Number of versions to exclude from deletions               | no                 | 50            |
| `github-token`    | Token with the necessary scopes to delete package versions | no                 | Set by Github |
| `dry-run`         | If the action should only print what it would do.          | no                 | `false`       |

### Example usage

> Delete old versions of the packages "package-1" and "package-2" for the current repository.

```yaml
uses: journeyapps-platform/delete-old-packages@v1.0.0
with:
  package-pattern: "package-(1|2)"
  version-pattern: ".*"
```
