import { Schema, model } from "mongoose";
import { ISavingsGroup } from "@interfaces/savingsGroups.interface";

const SavingsGroupSchema = new Schema<ISavingsGroup>({
    groupName: { type: String, required: true },
    groupAdmin: { type: Schema.Types.ObjectId, required: true },
    groupMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    groupType: { type: String, enum: ['Public', 'Private'], default: 'Public' }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export default model<ISavingsGroup>("SavingsGroup", SavingsGroupSchema);