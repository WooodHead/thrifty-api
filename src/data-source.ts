import { DataSource } from 'typeorm';
import { AdminUserEntity } from 'nestjs-admin';
import { User } from './user/entities/user.entity';
import { Account } from './account/entities/account.entity';
import { Transaction } from './transaction/entities/transaction.entity';
import { SavingsGroup } from './savings-group/entities/savings-group.entity';
import { UserToSavingsGroup } from './common/entities/user-to-savingsgroup.entity';
import { ConfigService } from '@nestjs/config';
import configuration from './config/configuration';


const configService = new ConfigService(configuration);

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_DATABASE'),
    entities: [
        Account,
        SavingsGroup,
        Transaction,
        User,
        UserToSavingsGroup,
        AdminUserEntity
    ],
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
    logging: false,
    ssl: {
        rejectUnauthorized: false
    }
});

export const entityManager = AppDataSource.manager;