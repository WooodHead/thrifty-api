import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { AdminUserEntity } from 'nestjs-admin';
import { User } from './user/entities/user.entity';
import { Account } from './account/entities/account.entity';
import { Transaction } from './transaction/entities/transaction.entity';
import { SavingsGroup } from './savings-group/entities/savings-group.entity';
import { UserToSavingsGroup } from './common/entities/user-to-savingsgroup.entity';

config()

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.TYPEORM_HOST,
    port: +process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [
        Account,
        SavingsGroup,
        Transaction,
        User,
        UserToSavingsGroup,
        AdminUserEntity
    ],
    migrations: ['dist/migrations/*.js'],
    migrationsTableName: 'migrations_history',
    synchronize: false,
    logging: false,
    ssl: {
        rejectUnauthorized: false
    }
});

export const entityManager = AppDataSource.manager;