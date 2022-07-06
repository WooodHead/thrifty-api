import {MigrationInterface, QueryRunner} from "typeorm";

export class addContributeFundsToSavingsGroup1657117066566 implements MigrationInterface {
    name = 'addContributeFundsToSavingsGroup1657117066566'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_savings_group" ADD "contributedFunds" numeric NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_to_savings_group" DROP COLUMN "contributedFunds"`);
    }

}
