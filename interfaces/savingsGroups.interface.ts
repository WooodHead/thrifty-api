import { Document, Types } from "mongoose";

export interface ISavingsGroup extends Document {
    groupName: string;
    groupAdmin: Types.ObjectId;
    groupType: string;
    groupMembers : Types.ObjectId[];
}