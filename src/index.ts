import * as github from '@actions/github';
import * as core from '@actions/core';

type ListPackageVersionParams = {
  owner: string;
  repo_id: string;
  package_name: string;
};
const listPackageVersions = async (client: any, params: ListPackageVersionParams) => {
  const list_package_versions = `
    query ($owner: String!, $repo_id: ID!, $package_name: String!, $cursor: String) {
      organization(login: $owner) {
        packages(first: 1, names: [$package_name], packageType: NPM, repositoryId: $repo_id) {
          nodes {
            versions(first: 100, after: $cursor) {
              pageInfo {
                endCursor
                hasNextPage
              }
              nodes {
                id
                version
              }
            }
          }
        }
      }
    }
  `;

  type Version = {
    id: string;
    version: string;
  };
  type PackageVersionsGraphResponse = {
    organization: {
      packages: {
        nodes: {
          versions: {
            pageInfo: {
              endCursor: string;
              hasNextPage: boolean;
            };
            nodes: Version[];
          };
        }[];
      };
    };
  };

  let cursor: string | null = null;
  let more = true;

  const versions: Version[] = [];

  while (more) {
    const res = (await client.graphql(list_package_versions, {
      owner: params.owner,
      repo_id: params.repo_id,
      package_name: params.package_name,
      cursor: cursor
    })) as PackageVersionsGraphResponse;

    const [target] = res.organization.packages.nodes;
    cursor = target.versions.pageInfo.hasNextPage ? target.versions.pageInfo.endCursor : null;
    more = !!cursor;
    versions.push(...target.versions.nodes);
  }

  return versions;
};

const run = async () => {
  const owner = core.getInput('owner') || github.context.repo.owner;
  const repo = core.getInput('repo') || github.context.repo.repo;

  const github_token = core.getInput('github-token', {
    required: true
  });
  const dry_run = core.getInput('dry-run') === 'true';
  const package_pattern_raw = core.getInput('package-pattern', {
    required: true
  });
  const version_pattern_raw = core.getInput('version-pattern', {
    required: true
  });

  const package_pattern = new RegExp(package_pattern_raw);
  const version_pattern = new RegExp(version_pattern_raw);

  if (dry_run) {
    core.info('Dry run is set. No package versions will actually be deleted.');
  }

  core.info('Fetching packages');

  const client = github.getOctokit(github_token);
  const repo_metadata = await client.repos.get({
    repo: repo,
    owner: owner
  });

  const list_packages = `
    query($repo_id: ID!, $owner: String!) {
      organization(login: $owner) {
        packages(first: 100, packageType: NPM, repositoryId: $repo_id) {
          nodes {
            name
          }
        }
      }
    }
  `;

  const delete_package = `
    mutation deletePackageVersion($package_id: String!) {
      deletePackageVersion(input: { packageVersionId: $package_id }) {
        success
      }
    }
  `;

  const res = (await client.graphql(list_packages, {
    owner: owner,
    repo_id: repo_metadata.data.node_id
  })) as { organization: { packages: { nodes: { name: string }[] } } };

  const packages = res.organization.packages.nodes
    .filter((pkg) => {
      return package_pattern.test(pkg.name);
    })
    .map((pkg) => pkg.name);

  for (const package_name of packages) {
    const all_versions = await listPackageVersions(client, {
      owner: owner,
      repo_id: repo_metadata.data.node_id,
      package_name: package_name
    });

    const versions = all_versions.filter((version) => {
      return version_pattern.test(version.version);
    });

    if (dry_run) {
      core.info(`would delete in '${package_name}' the versions: ${versions.map((version) => version.version)}`);
      continue;
    }

    for (const version of versions) {
      core.info(`deleting version ${package_name}@${version.version}`);
      client.graphql(delete_package, {
        package_version: version.id,
        headers: {
          Accept: 'application/vnd.github.package-deletes-preview+json'
        }
      });
    }

    core.info(`deleted ${versions.length} versions`);
  }
};

run();
