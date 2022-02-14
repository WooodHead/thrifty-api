import SavingsGroup from "@/models/SavingsGroup";
import { body } from "express-validator";
import { Types } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "@interfaces/users.interface";
import { formatGroupMembers, handleValidationErrors } from "@utils/lib";
import { sendMail } from "@utils/sendMail";

export const get_get_all_savings_group = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const allSavingsGroups = await SavingsGroup.find({}).exec();
        res.json(allSavingsGroups);
    } catch (error) {
        next(error);
    }
};

export const get_search_savings_group = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const { search } = req.query;
        const allSavingsGroups = await SavingsGroup.find({
            name: { $regex: search, $options: "i" },
        }).exec();
        res.json(allSavingsGroups);
    } catch (error) {
        next(error);
    }
};

export const get_get_savings_group_by_id = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const savingsGroup = await SavingsGroup.findById(req.params.id).exec();
        if (!savingsGroup) return res.status(404).json({ msg: 'Savings group not found' });
        res.json(savingsGroup);
    } catch (error) {
        next(error);
    }
};

export const get_get_all_savings_group_members = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const groupId = new Types.ObjectId(req.params.id);
        const found_group = await SavingsGroup.findById(groupId).exec();
        if (!found_group) return res.status(404).json({ msg: 'Savings group not found' });

        // Check if user is the group admin
        const _id = new Types.ObjectId(req.user._id);
        if (!found_group.groupAdmin.equals(_id)) return res.status(403).json({ msg: 'You are not authorized to list members of this group' });

        const all_members = await found_group.populate('groupMembers.memberName');
        res.json(all_members.groupMembers);

    } catch (error) {
        next(error)
    }
}

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

        // Check if group name exists
        const found_group = await SavingsGroup.findById(req.params.id).exec();
        if (!found_group) return res.status(404).json({ msg: 'Savings group not found' });

        // Check if user is already a member of the group
        const userId = new Types.ObjectId(req.user._id);
        if (found_group.groupMembers.some(member => member.memberName.equals(userId))) return res.status(409).json({ msg: 'User already a member of the group' });

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
];

export const put_remove_savings_group_member = [
    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        try {
            // Check if Savings Group exists
            const found_group = await SavingsGroup.findById(req.params.id).exec();
            if (!found_group) return res.status(404).json({ msg: 'Savings group not found' });

            // Check if user is already a member of the group
            const userId = new Types.ObjectId(req.user._id);
            if (!found_group.groupMembers.some(member => member.memberName.equals(userId))) return res.status(409).json({ msg: 'User is not a member of tbis group' });

            // Remove member from group
            found_group.groupMembers = found_group.groupMembers.filter(member => !member.memberName.equals(userId));
            await found_group.save();
        } catch (error) {
            next(error);
        }
    }
];

export const delete_delete_savings_group = async (req: RequestWithUser, res: Response, next: NextFunction) => {

    try {
        const id = new Types.ObjectId(req.params.id);
        const found_group = await SavingsGroup.findById(id).exec();
        if (!found_group) return res.status(404).json({ msg: 'Savings group not found' });

        // Check if user is the group admin
        const _id = new Types.ObjectId(req.user._id);
        if (!found_group.groupAdmin.equals(_id)) return res.status(403).json({ msg: 'You are not authorized to delete this group' });

        // Delete group
        await SavingsGroup.deleteOne({ _id: id }).exec();
        res.json({ msg: 'Savings group deleted' });
    } catch (error) {
        next(error);
    }
};

export const post_send_group_invitation = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
        const { groupId, email } = req.body;
        const found_group = await SavingsGroup.findById(groupId).exec();
        if (!found_group) return res.status(404).json({ msg: 'Savings group not found' });

        // Check if user is the group admin
        const _id = new Types.ObjectId(req.user._id);
        if (!found_group.groupAdmin.equals(_id)) return res.status(403).json({ msg: 'You are not authorized to send an invitation for this group' });

        // Check if user is already a member of the group
        if (found_group.groupMembers.some(member => member.memberName.equals(email))) return res.status(409).json({ msg: 'User is already a member of this group' });

        // Send invitation
        const mailOptions: [string, string, string, string] = [
            email,
            'Invitation to join Savings Group',
            `You have been invited to join the savings group ${found_group.groupName}`,
            `<p>We would like you to join our savings group</p>`
        ];
        await sendMail(...mailOptions);
    } catch (error) {
        next(error);
    }
}