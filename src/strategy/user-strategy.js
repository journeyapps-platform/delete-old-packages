const Input = require("./strategy")
const { getOctokit } = require("@actions/github")

const getMultipleVersionsQuery = `
  query getVersions($user: String!, $names: [String!]!) {
    user(login: $user) {
      packages(first: 20, names: $names) {
        nodes {
          name
          versions(last: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
            nodes {
              id
              version
            }
          }
        }
      }
    }
  }
`

const getSingleVersionQuery = `
  query getVersion($user: String!, $names: [String!]!, $version: String!) {
    user(login: $user) {
      packages(first: 20, names: $names) {
        nodes {
          name
          version(version: $version) {
            id
            version
          }
        }
      }
    }
  }
`

module.exports = class UserStrategy extends Input {
  constructor(user, names, version, versionPattern, keep, token) {
    super(names, version, versionPattern, keep, token)

    if (!user || user === "") {
      throw new Error("user cannot be empty")
    }

    this.user = user
  }

  async queryPackages() {
    const query = this.version ? getSingleVersionQuery : getMultipleVersionsQuery

    const result = await getOctokit(this.token).graphql(query, {
      user: this.user,
      names: this.names,
      headers: {
        Accept: "application/vnd.github.package-deletes-preview+json",
      },
    })

    // Normalize results of each query so that we get a `versions` array for each package in either case.
    if (this.version) {
      return result.user.packages.nodes.map((it) => ({ ...it, versions: [it.version] }))
    } else {
      return result.user.packages.nodes.map((it) => ({ ...it, versions: it.versions.nodes }))
    }
  }
}