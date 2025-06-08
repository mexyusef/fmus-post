interface Collection {
    name: string;
    description?: string;
    requests: Request[];
    variables?: Record<string, string>;
}
interface Request {
    name: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    body?: any;
    tests?: Test[];
}
interface Test {
    name: string;
    type: 'status' | 'header' | 'body' | 'responseTime';
    assertion: 'equals' | 'contains' | 'exists' | 'matches' | 'lessThan' | 'greaterThan';
    path?: string;
    value?: any;
}
interface Environment {
    name: string;
    variables: Record<string, string>;
}
export declare function loadCollection(filePath: string): Collection;
export declare function loadEnvironment(filePath: string): Environment;
export declare function runCollection(collectionPath: string, environmentPath?: string): Promise<void>;
export {};
