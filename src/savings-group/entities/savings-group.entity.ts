import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, VersionColumn, OneToOne, JoinColumn } from 'typeorm';
import { ParentEntity } from 'src/utils/parent.entity';
import { User } from '../../user/entities/user.entity';
import { GroupType } from '../interfaces/savings-group.interface';

@Entity()
export class SavingsGroup extends ParentEntity {

    @Column()
    groupName: string;

    @OneToOne(() => User, { eager: true })
    @JoinColumn()
    groupAdmin: User;

    @Column("simple-json", { nullable: true })
    groupMembers: {
        memberName: string;
        dateJoined: Date;
    };

    @Column({ type: "enum", enum: GroupType, default: GroupType.PUBLIC })
    groupType: GroupType;
}
