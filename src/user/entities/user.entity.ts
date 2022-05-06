import { Entity, Column, BeforeInsert, OneToMany, ManyToMany } from 'typeorm';
import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';
import { ParentEntity } from '../../common/entities/parent.entity';
import { UserToSavingsGroup } from '../../common/entities/user-to-savingsgroup.entity';
import { IRefreshToken, IResetPassword, Role } from '../interfaces/user.interface';
import { SavingsGroup } from '../../savings-group/entities/savings-group.entity';

@Entity()
export class User extends ParentEntity {

    @Column('varchar', { length: 255, nullable: false })
    email: string;

    @Exclude()
    @Column('varchar', { length: 255, nullable: false })
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true })
    personalKey: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: "enum", enum: Role, default: Role.USER })
    role: Role;

    @OneToMany(() => SavingsGroup, (savingsGroup) => savingsGroup.groupAdmin)
    groupAdmin: SavingsGroup[];

    @ManyToMany(() => SavingsGroup, (savingsGroup) => savingsGroup.groupMembers)
    groups: SavingsGroup[];

    @OneToMany(() => UserToSavingsGroup, userToSavingsGroup => userToSavingsGroup.user)
    public userToSavingsGroup!: UserToSavingsGroup[];

    @Column({ type: "jsonb", nullable: true, default: {} })
    resetPassword: IResetPassword;

    @Column({ type: "jsonb", nullable: true, default: {} })
    refreshToken: IRefreshToken;

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10);
    }
}
