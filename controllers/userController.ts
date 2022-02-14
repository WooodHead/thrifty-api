import User from '@models/User';
import { body, validationResult } from 'express-validator';
import gravatar from 'gravatar';
import { Request, Response, NextFunction } from 'express';
import { RequestWithUser } from '@/interfaces/users.interface';
import { sendMail } from '@utils/sendMail';

export const get_get_user = async (req: RequestWithUser, res: Response) => {
    const { password, resetPassword, refreshToken, ...data } = req.user._doc;
    res.json(data)
}

export const post_create_user = [

    body('name', 'What is your name???').trim().isLength({ min: 1 }).escape(),
    body('email').notEmpty().isEmail(),
    body('new_password').notEmpty().isLength({ min: 6 }),

    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(422).json(errors.array());

        try {
            const { name, email, new_password, img } = req.body;
            const found_user = await User.findOne({ email: email }).exec();
            if (found_user) return res.status(409).json({ msg: 'User already exists' });
            const avatar = gravatar.url(email, { s: '100', r: 'pg', d: 'retro' }, true);
            const user = new User({
                name: name,
                email: email,
                password: new_password,
                avatar: avatar || img || ''
            });
            await user.save();
            const mailOptions: [string, string, string, string] = [
                email,
                'Account Creation',
                `Welcome to Esusu Confirm`,
                `<p>Dear ${email.split('@')[0]}, Welcome to Esusu Confirm, we are excited to have you onboard</p>`
            ];
            await sendMail(...mailOptions);
            const { password, resetPassword, refreshToken, ...data } = user._doc;
            res.json(data);
        } catch (error) {
            next(error)
        }
    }
];

export const put_update_user = [
    async (req: Request, res: Response, next: NextFunction) => {
        res.send('Not yet implemented')
    }
]

export const delete_delete_user = async (req: Request, res: Response, next: NextFunction) => {
    res.send('Not yet implemented')
}