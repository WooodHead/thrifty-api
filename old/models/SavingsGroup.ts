// import { Schema, model } from "mongoose";
// import { ISavingsGroup } from "@interfaces/savingsGroups.interface";

// const SavingsGroupSchema = new Schema<ISavingsGroup>({
//     groupName: { type: String, required: true },
//     groupAdmin: { type: Schema.Types.ObjectId, required: true },
//     groupMembers: [
//         {
//             memberName: { type: Schema.Types.ObjectId, ref: 'User' },
//             dateJoined: { type: Date, default: new Date(Date.now()) }
//         }
//     ],
//     groupType: { type: String, enum: ['Public', 'Private'], default: 'Public' }
// }, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

// export default model<ISavingsGroup>("SavingsGroup", SavingsGroupSchema);