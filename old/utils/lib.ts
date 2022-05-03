// import { CookieOptions, Request, Response, NextFunction } from 'express';
// import { randomBytes } from 'crypto';
// import { validationResult } from 'express-validator';
// import { sign } from 'jsonwebtoken';
// import { IUser } from '@interfaces/users.interface';
// import { ITokens } from '@interfaces/auth.interface';
// import { ENV } from '@utils/validateEnv';

// export const generateRandomCode = async (length: number): Promise<string | null> => {
//     try {
//         const code = randomBytes(length).toString('hex').toUpperCase();
//         return code;
//     } catch (error) {
//         console.error(error);
//         return null;
//     }
// }

// export const tokenGenerator = async (user: IUser): Promise<ITokens> => {
//     const payload = {
//         aud: "https://pollaroid.net",
//         iss: "https://pollaroid.net",
//         sub: user._id,
//         name: user.name,
//         email: user.email,
//         avatar: user.avatar,
//         isGroupAdmin: user.isGroupAdmin,
//         isMember: user.isMember,
//         last_login: user.lastLogin,
//         token_version: user.tokenVersion
//     };
//     // Process Access token
//     const ACCESS_TOKEN_PRIVATE_KEY = Buffer.from(ENV.ACCESS_TOKEN_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
//     const token = sign(payload, { key: ACCESS_TOKEN_PRIVATE_KEY, passphrase: ENV.ACCESS_TOKEN_SECRET }, { algorithm: 'RS256', expiresIn: '15m' });

//     // Process Refresh token
//     const REFRESH_TOKEN_PRIVATE_KEY = Buffer.from(ENV.REFRESH_TOKEN_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
//     const refresh_token = sign(payload, { key: REFRESH_TOKEN_PRIVATE_KEY, passphrase: ENV.REFRESH_TOKEN_SECRET }, { algorithm: 'RS256', expiresIn: '7d' });

//     return { token, refresh_token };
// };

// export const cookieOptions: CookieOptions = {
//     domain: 'polldevs.com',
//     path: '/api/auth/refresh_token',
//     httpOnly: true,
//     maxAge: 604800000,
//     signed: true,
//     sameSite: 'strict',
//     secure: true,
// };

// export const sendTokens = (res: Response, refresh_token: string, msg_txt: string, token: string) => {
//     return res
//         .cookie('jit', refresh_token, cookieOptions)
//         .json({ message: msg_txt, authToken: token });
// };

// export const formatGroupMembers = (req: Request, res: Response, next: NextFunction): void => {
//     switch (true) {
//         case !req.body.groupMembers:
//             req.body.groupMembers = []
//             break;
//         case !(req.body.groupMembers instanceof Array):
//             req.body.groupMembers = new Array(req.body.groupMembers);
//             break;
//     }
//     next();
// };

// export const handleValidationErrors = (req: Request, res: Response) => {
//     const errors = validationResult(req);
//     return !errors.isEmpty() && res.status(422).json({ errors: errors.array() });
// };