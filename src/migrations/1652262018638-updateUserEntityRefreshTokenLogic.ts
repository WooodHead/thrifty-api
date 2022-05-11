import {MigrationInterface, QueryRunner} from "typeorm";

export class updateUserEntityRefreshTokenLogic1652262018638 implements MigrationInterface {
    name = 'updateUserEntityRefreshTokenLogic1652262018638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."user_roles_enum" RENAME TO "user_roles_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."user_roles_enum" AS ENUM('guest', 'user', 'admin', 'super_admin')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roles" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roles" TYPE "public"."user_roles_enum"[] USING "roles"::"text"::"public"."user_roles_enum"[]`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roles" SET DEFAULT '{user}'`);
        await queryRunner.query(`DROP TYPE "public"."user_roles_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshToken" jsonb DEFAULT '{}'`);
        await queryRunner.query(`CREATE TYPE "public"."user_roles_enum_old" AS ENUM('user', 'admin', 'super-admin')`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roles" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roles" TYPE "public"."user_roles_enum_old"[] USING "roles"::"text"::"public"."user_roles_enum_old"[]`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "roles" SET DEFAULT '{user}'`);
        await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."user_roles_enum_old" RENAME TO "user_roles_enum"`);
    }

}
