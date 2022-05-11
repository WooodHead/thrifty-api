export enum Role {
    GUEST = 'guest',
    USER = 'user',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
};

export interface IResetPassword {
    code: string;
    expiresBy: Date;
};