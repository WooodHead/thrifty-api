import { Entity, Column, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '@common/entities/abstract.entity';
import { UserToSavingsGroup } from '@common/entities/user-to-savingsgroup.entity';
import { User } from '@user/entities/user.entity';
import { GroupType } from '../interfaces/savings-group.interface';


@Entity()
export class SavingsGroup extends AbstractEntity {

    @Column('varchar', { unique: true })
    groupName: string;

    @Column('enum', { enum: GroupType, default: GroupType.PUBLIC })
    groupType: GroupType;

    @Column('varchar', { nullable: true, length: 255 })
    groupDescription: string;

    @ManyToOne(() => User, (user) => user.groupAdmin)
    groupAdmin: User;

    @OneToMany(() => UserToSavingsGroup, userToSavingsGroup => userToSavingsGroup.savingsGroup, {
        cascade: ['remove']
    })
    public groupMembers!: UserToSavingsGroup[];

}
