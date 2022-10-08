import { MigrationInterface, QueryRunner } from "typeorm";

export class SplitTransactionsToCreditAndDebitOnAccountEntity1665220439961 implements MigrationInterface {
    name = 'SplitTransactionsToCreditAndDebitOnAccountEntity1665220439961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_savings_group" ALTER COLUMN "contributedFunds" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_savings_group" ALTER COLUMN "contributedFunds" TYPE numeric`);
    }

}
