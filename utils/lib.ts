import { CookieOptions, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const cookieOptions: CookieOptions = {
    domain: 'polldevs.com',
    path: '/api/auth/refresh_token',
    httpOnly: true,
    maxAge: 604800000,
    signed: true,
    sameSite: 'strict',
    secure: true,
};

export const sendTokens = (res: Response, refresh_token: string, msg_txt: string, token: string) => {
    return res
        .cookie('jit', refresh_token, cookieOptions)
        .json({ message: msg_txt, authToken: token });
};

export const formatGroupMembers = (req: Request, res: Response, next: NextFunction): void => {
    switch (true) {
        case !req.body.groupMembers:
            req.body.groupMembers = []
            break;
        case !(req.body.groupMembers instanceof Array):
            req.body.groupMembers = new Array(req.body.groupMembers);
            break;
    }
    next();
};

export const handleValidationErrors = (req: Request, res: Response) => {
    const errors = validationResult(req);
    return !errors.isEmpty() && res.status(422).json({ errors: errors.array() });
};