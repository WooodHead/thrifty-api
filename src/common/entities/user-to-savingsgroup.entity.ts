import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { SavingsGroup } from '../../savings-group/entities/savings-group.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class UserToSavingsGroup {

    @Exclude()
    @PrimaryGeneratedColumn('uuid')
    public userToSavingsGroupId!: string;

    @Column()
    public userId!: string;

    @Exclude()
    @Column()
    public savingsGroupId!: string;

    @CreateDateColumn()
    public dateAdded!: Date;

    @Column('decimal', { default: 0, scale: 2 })
    public contributedFunds!: number;

    @ManyToOne(() => User, (user) => user.savingsGroups, { onDelete: 'CASCADE' })
    public user!: User

    @ManyToOne(() => SavingsGroup, (savingsGroup) => savingsGroup.groupMembers, { onDelete: 'CASCADE' })
    public savingsGroup!: SavingsGroup
}