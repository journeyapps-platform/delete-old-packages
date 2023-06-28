import { DeleteStrategy, Input, QueryStrategy } from "./types";
export declare function executeAction(input: Input, queryStrategy: QueryStrategy, deleteStrategy: DeleteStrategy): Promise<void>;
