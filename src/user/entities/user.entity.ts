import { Entity, Column, BeforeInsert, OneToOne } from 'typeorm';
import { ParentEntity } from 'src/utils/parent.entity';
import { hash } from 'bcrypt';
import { Exclude } from 'class-transformer';
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

    @OneToOne(() => SavingsGroup, savingsGroup => savingsGroup.groupAdmin)
    groupAdmin: SavingsGroup;


    @Column({ type: "simple-json", nullable: true, default: {} })
    resetPassword: IResetPassword;

    @Column({ type: "simple-json", nullable: true, default: {} })
    refreshToken: IRefreshToken;

    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10);
    }
}
