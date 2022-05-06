import {MigrationInterface, QueryRunner} from "typeorm";

export class createAdminUser1651305553927 implements MigrationInterface {
    name = 'createAdminUser1651305553927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "img" TO "productImage"`);
        await queryRunner.query(`CREATE TABLE "adminUser" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(50) NOT NULL, "password" character varying(128) NOT NULL, CONSTRAINT "UQ_58bd2b086488ba1ba90847a192e" UNIQUE ("username"), CONSTRAINT "PK_f155e50a944f2658dc1ccb477a2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "adminUser"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "productImage" TO "img"`);
    }

}
