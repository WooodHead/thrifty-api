import User from "@models/User";
import { body } from "express-validator";
import { handleValidationErrors } from "@utils/lib";
import { RequestWithUser } from "@interfaces/users.interface";
import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

export const put_add_savings_to_group = [
    body("amountToSave").isNumeric().withMessage("Amount must be a number").custom(value => {
        if (parseFloat(value) < 1) {
            throw new Error("Amount must be greater than 0");
        }
        return true;
    }),

    async (req: RequestWithUser, res: Response, next: NextFunction) => {
        handleValidationErrors(req, res);

        try {
            const { amountToSave } = req.body;
            const { id } = req.params;
            const user = await User.findById(req.user._id).exec();
            if (!user) return res.status(404).json({ msg: "User not found" });

            // Check if user is a member of this group
            const gid = new Types.ObjectId(id);
            const found_group = user.savingsGroups.find(group => group.savingsGroup.equals(gid));
            if (!found_group) return res.status(403).json({ msg: "You are not a member of this savings group" });

            // Save the new savings amount
            found_group.amountSaved += amountToSave;
            await user.save();
            res.json({ msg: "Savings amount added successfully" });

        } catch (error) {
            next(error);
        }
    }
]