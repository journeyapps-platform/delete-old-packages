import { Input, Package, PackageVersion } from "../types";
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";
type RestResponse = RestEndpointMethodTypes["packages"]["getAllPackageVersionsForPackageOwnedByOrg"]["response"] | RestEndpointMethodTypes["packages"]["getAllPackageVersionsForPackageOwnedByUser"]["response"];
export declare function processPackages(input: Input, packages: Package[]): Package[];
export declare function findVersionsToDelete(input: Input, versions: PackageVersion[]): PackageVersion[];
export declare function processResponse(name: string, response: RestResponse): Package;
export {};
