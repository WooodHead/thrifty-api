import {MigrationInterface, QueryRunner} from "typeorm";

export class addLastLoginToUserEntity1651932921586 implements MigrationInterface {
    name = 'addLastLoginToUserEntity1651932921586'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "lastLogin" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastLogin"`);
    }

}
