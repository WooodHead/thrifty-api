import { MigrationInterface, QueryRunner } from "typeorm";

export class RemodeledUserToSavingsGroup1652364123359
  implements MigrationInterface
{
  name = "RemodeledUserToSavingsGroup1652364123359";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_to_savings_group" ("userToSavingsGroup" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "savingsGroupId" uuid NOT NULL, "dateAdded" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_96ac9c9fa4c994e6eb220f16831" PRIMARY KEY ("userToSavingsGroup"))`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" ADD CONSTRAINT "FK_9c0d7cc0476333162b2b56e7fe8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" ADD CONSTRAINT "FK_e18e43d839d418430242306bc13" FOREIGN KEY ("savingsGroupId") REFERENCES "savings_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" DROP CONSTRAINT "FK_e18e43d839d418430242306bc13"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" DROP CONSTRAINT "FK_9c0d7cc0476333162b2b56e7fe8"`
    );
    await queryRunner.query(`DROP TABLE "user_to_savings_group"`);
  }
}
