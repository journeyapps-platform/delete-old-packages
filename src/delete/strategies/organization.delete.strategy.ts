import { DeleteStrategy, PackageVersion, RestInput } from '../../types';
import { GitHub } from '@actions/github/lib/utils';

export default class OrganizationDeleteStrategy implements DeleteStrategy {
  constructor(private readonly octokit: InstanceType<typeof GitHub>) {}

  async deletePackageVersion(input: RestInput, name: string, version: PackageVersion): Promise<void> {
    const { id, names } = version;
    try {
      await this.octokit.rest.packages.deletePackageVersionForOrg({
        package_name: name,
        package_version_id: Number(id),
        package_type: input.type,
        org: input.organization
      });
    } catch (e) {
      throw new Error(`Failed to delete version ${names.join(', ')} of package ${name},: ${e}`);
    }
  }
}
