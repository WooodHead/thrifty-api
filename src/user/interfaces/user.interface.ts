export enum Role {
    ADMIN = 'ADMIN',
    GUEST = 'GUEST',
    SUPER_ADMIN = 'SUPER_ADMIN',
    SYSTEM_ADMIN = 'SYSTEM_ADMIN',
    USER = 'USER',
};

export interface IResetPassword {
    code: string;
    expiresBy: Date;
};