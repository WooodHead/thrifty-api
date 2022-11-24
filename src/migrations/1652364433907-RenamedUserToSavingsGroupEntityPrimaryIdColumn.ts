import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamedUserToSavingsGroupEntityPrimaryIdColumn1652364433907
  implements MigrationInterface
{
  name = "RenamedUserToSavingsGroupEntityPrimaryIdColumn1652364433907";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" RENAME COLUMN "userToSavingsGroup" TO "userToSavingsGroupId"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" RENAME CONSTRAINT "PK_96ac9c9fa4c994e6eb220f16831" TO "PK_555a76ead6abc87e3946e561de4"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" RENAME CONSTRAINT "PK_555a76ead6abc87e3946e561de4" TO "PK_96ac9c9fa4c994e6eb220f16831"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" RENAME COLUMN "userToSavingsGroupId" TO "userToSavingsGroup"`
    );
  }
}
