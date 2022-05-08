export enum Role {
    USER = "user",
    ADMIN = "admin",
    SUPER_ADMIN = "super_admin",
};

export interface IRefreshToken {
    token: string;
    expiresBy: Date;
};

export interface IResetPassword {
    code: string;
    expiresBy: Date;
};