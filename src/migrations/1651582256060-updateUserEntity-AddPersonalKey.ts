import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUserEntityAddPersonalKey1651582256060 implements MigrationInterface {
    name = 'updateUserEntityAddPersonalKey1651582256060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "personalKey" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "personalKey"`);
    }

}
