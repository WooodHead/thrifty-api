export enum Role {
    USER = "user",
    ADMIN = "admin"
};

export interface IRefreshToken {
    token: string;
    expiresBy: Date;
};

export interface IResetPassword {
    code: string;
    expiresBy: Date;
};