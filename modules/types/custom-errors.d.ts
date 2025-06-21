export interface CustomError extends Error {
    statusCode?: number;
    path?: string;
    details?: any;
}