import { Entity, Column } from 'typeorm';
import { AbstractEntity } from '@common/entities/abstract.entity';


@Entity()
export class FeatureFlag extends AbstractEntity {

    @Column({ unique: true })
    name: string;

    @Column({ default: false })
    isEnabled: boolean;
}
