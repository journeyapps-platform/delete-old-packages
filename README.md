# Delete old packages

Github action for deleting old versions of packages in the Github package registry.

### Inputs

| Name              | Description                                                | Required           | Default       |
| ----------------- | ---------------------------------------------------------- | ------------------ | ------------- |
| `owner`           | Owner of the repo containing the package(s)                | :x:                | Set by Github |
| `repo`            | Repo containing the package(s)                             | :x:                | Set by Github |
| `package-pattern` | Regex pattern of the packages                              | :x:                | :x:           |
| `version-pattern` | Regex pattern of the versions                              | :x:                | :x:           |
| `keep`            | Number of versions to exclude from deletions               | :x:                | 50            |
| `github-token`    | Token with the necessary scopes to delete package versions | :x:                | Set by Github |
| `dry-run`         | If the action should only print what it would do.          | :x:                | `false`       |

### Example usage

> Delete old versions of the packages "package-1" and "package-2" for the current repository.

```yaml
uses: journeyapps-platform/delete-old-packages@v1.0.0
with:
  package-pattern: "package-(1|2)"
  version-pattern: ".*"
```
