import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedDescriptionColumnToSavingsGroup1652370033957
  implements MigrationInterface
{
  name = "AddedDescriptionColumnToSavingsGroup1652370033957";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "savings_group" ADD "groupDescription" character varying(255)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "savings_group" DROP COLUMN "groupDescription"`
    );
  }
}
