export interface Result<T> {
    error: string;
    result: T;
    success: boolean;
    targetUrl: string;
    unAuthorizedRequest: boolean;
    __abp: boolean;
}