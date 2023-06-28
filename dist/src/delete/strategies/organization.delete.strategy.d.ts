import { DeleteStrategy, RestInput } from "../../types";
import { GitHub } from "@actions/github/lib/utils";
export default class OrganizationDeleteStrategy implements DeleteStrategy {
    private readonly octokit;
    constructor(octokit: InstanceType<typeof GitHub>);
    deletePackageVersion(input: RestInput, name: string, id: string): Promise<void>;
}
