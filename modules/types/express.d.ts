interface DecodedUser {
    id: string | number;
    email: string;
    role: string;
}

declare namespace Express {
    export interface Request {
        usuario?: DecodedUser;
    }
}