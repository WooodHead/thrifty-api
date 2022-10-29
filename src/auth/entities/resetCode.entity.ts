import { Column, Entity } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { AbstractEntity } from '@common/entities/abstract.entity';


@Entity()
export class ResetCode extends AbstractEntity {

    @Column('varchar', {
        length: 255,
        nullable: false,
        unique: true
    })
    email: string;

    @Column('varchar', { nullable: false })
    code: string;

    @Column('timestamp without time zone', { nullable: false })
    expiry: Date;

    public async generateResetCode(): Promise<string> {
        const verificationCode = randomBytes(3).toString('hex').toUpperCase();
        this.code = await hash(verificationCode, 10);
        this.expiry = new Date(Date.now() + 300000);
        await this.save();
        return verificationCode;
    }

    public async verifyResetCode(code: string): Promise<boolean> {
        const validCode = await compare(code, this.code);
        const codeNotExpired = (Date.now() - new Date(this.expiry).getTime()) < 300000;
        return (validCode && codeNotExpired);
    }
}