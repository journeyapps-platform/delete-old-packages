import { processResponse } from '../../process/process';
import { Package, QueryStrategy, RestInput } from '../../types';
import { GitHub } from '@actions/github/lib/utils';

export default class UserQueryStrategy implements QueryStrategy {
  constructor(private readonly octokit: InstanceType<typeof GitHub>) {}

  async queryPackages(input: RestInput): Promise<Package[]> {
    if (input.packagePattern == null) {
      throw new Error('package-pattern is required');
    }

    const allPackages = await this.octokit.rest.packages.listPackagesForUser({
      username: input.user,
      package_type: input.type
    });

    try {
      const filteredPackages = allPackages.data.filter((pkg) => {
        return input.packagePattern?.test(pkg.name) && pkg.repository?.name === input.repo;
      });

      return await Promise.all(
        filteredPackages.map(async ({ name }) => {
          const response = await this.queryPackage(input, name);

          return processResponse(name, response);
        })
      );
    } catch (error) {
      throw new Error(`Failed to list all packages packages: ${error}`);
    }
  }

  private async queryPackage(input: RestInput, name: string) {
    try {
      const params = {
        package_name: name,
        package_type: input.type,
        username: input.user,
        per_page: 100
      };

      return this.octokit.rest.packages.getAllPackageVersionsForPackageOwnedByUser(params);
    } catch (error) {
      throw new Error(`Failed to query package ${name}: ${error}`);
    }
  }
}
