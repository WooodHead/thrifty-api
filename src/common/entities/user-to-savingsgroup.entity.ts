import { Entity, Column, ManyToOne } from "typeorm";
import { ParentEntity } from "./parent.entity";
import { User } from "../../user/entities/user.entity";
import { SavingsGroup } from "../../savings-group/entities/savings-group.entity";


@Entity()
export class UserToSavingsGroup extends ParentEntity {

    @Column()
    public userId!: string;

    @Column()
    public savingsGroupId!: string;

    @Column()
    public dateAdded!: Date

    @ManyToOne(() => User, (user) => user.userToSavingsGroup)
    public user!: User

    @ManyToOne(() => SavingsGroup, (savingsGroup) => savingsGroup.userToSavingsGroup)
    public savingsGroup!: SavingsGroup
}