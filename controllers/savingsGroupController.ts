import SavingsGroup from "@/models/SavingsGroup";
import { body } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "@interfaces/users.interface";
import { formatGroupMembers, handleValidationErrors } from "@utils/lib";

export const get_all_savings_group = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const allSavingsGroups = await SavingsGroup.find({}).exec();
        res.json(allSavingsGroups);
    } catch (error) {
        next(error);
    }
}


export const get_get_savings_group = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const savingsGroup = await SavingsGroup.findById(req.params.id).exec();
        if (!savingsGroup) return res.status(404).json({ msg: 'Savings group not found' });
        res.json(savingsGroup);
    } catch (error) {
        next(error);
    }
};

export const post_create_savings_group = [
    (req: Request, res: Response, next: NextFunction) => formatGroupMembers(req, res, next),

    body('groupName', 'Savings Group Name required').trim().isLength({ min: 1 }).escape(),

    async (req: RequestWithUser, res: Response, next: NextFunction) => {

        // Check for validation errors
        handleValidationErrors(req, res);

        // Check request is coming from a Group Admin
        const { isGroupAdmin } = req.user;
        if (!isGroupAdmin) return res.status(403).json({ msg: 'You are not authorized to create a savings group' });

        // Check if group name already exists
        const { groupName } = req.body;
        const found_group = await SavingsGroup.findOne({ groupName: groupName }).exec();
        if (found_group) return res.status(409).json({ msg: 'Savings group already exists' });

        // Create new savings group
        try {
            const { groupName, groupMembers } = req.body;
            const { _id } = req.user

            const savingsGroup = new SavingsGroup({
                groupName: groupName,
                groupAdmin: _id,
                groupMembers: groupMembers
            });
            await savingsGroup.save();
            res.json(savingsGroup);
        } catch (error) {
            next(error);
        }
    }
];

export const put_add_savings_group_member = [
    (req: Request, res: Response, next: NextFunction) => formatGroupMembers(req, res, next),

    async (req: RequestWithUser, res: Response, next: NextFunction) => {

        // Check request is coming from a Group Admin
        const { isGroupAdmin } = req.user;
        if (!isGroupAdmin) return res.status(403).json({ msg: 'You are not authorized to add a member to this savings group' });

        // Check if group name already exists
        const { groupName } = req.body;
        const found_group = await SavingsGroup.findOne({ groupName: groupName }).exec();
        if (!found_group) return res.status(404).json({ msg: 'Savings group not found' });

        // Add member to group
        try {
            const { groupMembers } = req.body;
            const { _id } = req.user;
            await SavingsGroup.updateOne({ _id: found_group._id }, { $push: { groupMembers: groupMembers } }).exec();
            res.json({ msg: 'Member added to savings group' });
        } catch (error) {
            next(error);
        }
    }
]