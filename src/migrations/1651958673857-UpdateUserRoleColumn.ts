import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserRoleColumn1651958673857 implements MigrationInterface {
  name = "UpdateUserRoleColumn1651958673857";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "role" TO "roles"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_role_enum" RENAME TO "user_roles_enum"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "roles"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_roles_enum" ADD VALUE IF NOT EXISTS 'super-admin'`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "roles" "public"."user_roles_enum" array NOT NULL DEFAULT '{user}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "roles"`);
    await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "roles" "public"."user_roles_enum"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_roles_enum" RENAME TO "user_role_enum"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" RENAME COLUMN "roles" TO "role"`
    );
  }
}
