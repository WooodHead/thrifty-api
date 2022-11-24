import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCascadeOptionUserToSavingsGroup1652372220371
  implements MigrationInterface
{
  name = "AddedCascadeOptionUserToSavingsGroup1652372220371";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" DROP CONSTRAINT "FK_9c0d7cc0476333162b2b56e7fe8"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" DROP CONSTRAINT "FK_e18e43d839d418430242306bc13"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" ADD CONSTRAINT "FK_9c0d7cc0476333162b2b56e7fe8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" ADD CONSTRAINT "FK_e18e43d839d418430242306bc13" FOREIGN KEY ("savingsGroupId") REFERENCES "savings_group"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" DROP CONSTRAINT "FK_e18e43d839d418430242306bc13"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" DROP CONSTRAINT "FK_9c0d7cc0476333162b2b56e7fe8"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" ADD CONSTRAINT "FK_e18e43d839d418430242306bc13" FOREIGN KEY ("savingsGroupId") REFERENCES "savings_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" ADD CONSTRAINT "FK_9c0d7cc0476333162b2b56e7fe8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
