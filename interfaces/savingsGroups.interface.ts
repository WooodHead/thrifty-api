import { Document, Types } from "mongoose";

interface IGroupMember {
    memberName: Types.ObjectId;
    dateJoined: Date;
}

export interface ISavingsGroup extends Document {
    groupName: string;
    groupAdmin: Types.ObjectId;
    groupType: string;
    groupMembers : IGroupMember[];
}