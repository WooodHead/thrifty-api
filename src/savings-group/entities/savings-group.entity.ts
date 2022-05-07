import { Entity, Column, ManyToOne, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { AbstractEntity } from '../../common/entities/abstract.entity';
import { UserToSavingsGroup } from '../../common/entities/user-to-savingsgroup.entity';
import { User } from '../../user/entities/user.entity';
import { GroupType } from '../interfaces/savings-group.interface';

@Entity()
export class SavingsGroup extends AbstractEntity {

    @Column()
    groupName: string;

    @ManyToOne(() => User, (user) => user.groupAdmin, { eager: true })
    groupAdmin: User;

    @ManyToMany(() => User, (user) => user.groups, { eager: true })
    @JoinTable()
    groupMembers: User[];

    @OneToMany(() => UserToSavingsGroup, userToSavingsGroup => userToSavingsGroup.savingsGroup)
    public userToSavingsGroup!: UserToSavingsGroup[];

    @Column({ type: "enum", enum: GroupType, default: GroupType.PUBLIC })
    groupType: GroupType;
}
