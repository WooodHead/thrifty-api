import {MigrationInterface, QueryRunner} from "typeorm";

export class removedParentEntityLinks1651840084836 implements MigrationInterface {
    name = 'removedParentEntityLinks1651840084836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "avatar" character varying, "personalKey" character varying, "isActive" boolean NOT NULL DEFAULT true, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "resetPassword" jsonb DEFAULT '{}', "refreshToken" jsonb DEFAULT '{}', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_to_savings_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" uuid NOT NULL, "savingsGroupId" uuid NOT NULL, "dateAdded" TIMESTAMP NOT NULL, CONSTRAINT "PK_92a5680977be60d4532c03a9840" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."savings_group_grouptype_enum" AS ENUM('Public', 'Private')`);
        await queryRunner.query(`CREATE TABLE "savings_group" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "groupName" character varying NOT NULL, "groupType" "public"."savings_group_grouptype_enum" NOT NULL DEFAULT 'Public', "groupAdminId" uuid, CONSTRAINT "PK_cea11af08922581b47be782d389" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "savings_group_group_members_user" ("savingsGroupId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_345e2396f675a60313f4d2d6b48" PRIMARY KEY ("savingsGroupId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8e2a1097aebba07665a240843c" ON "savings_group_group_members_user" ("savingsGroupId") `);
        await queryRunner.query(`CREATE INDEX "IDX_093e3f64c6e4e3fd0a4be164ed" ON "savings_group_group_members_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user_to_savings_group" ADD CONSTRAINT "FK_9c0d7cc0476333162b2b56e7fe8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_to_savings_group" ADD CONSTRAINT "FK_e18e43d839d418430242306bc13" FOREIGN KEY ("savingsGroupId") REFERENCES "savings_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "savings_group" ADD CONSTRAINT "FK_a6420263e1b3bf715533ef8a03f" FOREIGN KEY ("groupAdminId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "savings_group_group_members_user" ADD CONSTRAINT "FK_8e2a1097aebba07665a240843c9" FOREIGN KEY ("savingsGroupId") REFERENCES "savings_group"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "savings_group_group_members_user" ADD CONSTRAINT "FK_093e3f64c6e4e3fd0a4be164edd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "savings_group_group_members_user" DROP CONSTRAINT "FK_093e3f64c6e4e3fd0a4be164edd"`);
        await queryRunner.query(`ALTER TABLE "savings_group_group_members_user" DROP CONSTRAINT "FK_8e2a1097aebba07665a240843c9"`);
        await queryRunner.query(`ALTER TABLE "savings_group" DROP CONSTRAINT "FK_a6420263e1b3bf715533ef8a03f"`);
        await queryRunner.query(`ALTER TABLE "user_to_savings_group" DROP CONSTRAINT "FK_e18e43d839d418430242306bc13"`);
        await queryRunner.query(`ALTER TABLE "user_to_savings_group" DROP CONSTRAINT "FK_9c0d7cc0476333162b2b56e7fe8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_093e3f64c6e4e3fd0a4be164ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e2a1097aebba07665a240843c"`);
        await queryRunner.query(`DROP TABLE "savings_group_group_members_user"`);
        await queryRunner.query(`DROP TABLE "savings_group"`);
        await queryRunner.query(`DROP TYPE "public"."savings_group_grouptype_enum"`);
        await queryRunner.query(`DROP TABLE "user_to_savings_group"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
