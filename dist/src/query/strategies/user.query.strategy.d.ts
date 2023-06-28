import { Package, QueryStrategy, RestInput } from '../../types';
import { GitHub } from '@actions/github/lib/utils';
export default class UserQueryStrategy implements QueryStrategy {
    private readonly octokit;
    constructor(octokit: InstanceType<typeof GitHub>);
    queryPackages(input: RestInput): Promise<Package[]>;
    private queryPackage;
}
