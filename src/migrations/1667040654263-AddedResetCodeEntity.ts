import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedResetCodeEntity1667040654263 implements MigrationInterface {
  name = "AddedResetCodeEntity1667040654263";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_1d251b00f7fc5ea00cb48623dbd"`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_93a62aca5c0a25a6a5407051d42"`
    );
    await queryRunner.query(
      `CREATE TABLE "reset_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "email" character varying(255) NOT NULL, "code" character varying NOT NULL, "expiry" TIMESTAMP NOT NULL, CONSTRAINT "UQ_eb6f98028e96220d804d08578ca" UNIQUE ("email"), CONSTRAINT "PK_7b147e6247103d32851a3832c88" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP COLUMN "fromAccountId"`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP COLUMN "toInternalAccountId"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "resetPassword"`);
    await queryRunner.query(`ALTER TABLE "transaction" ADD "accountId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "savings_group" ADD CONSTRAINT "UQ_4651f5fc023fd270366bb910661" UNIQUE ("groupName")`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" ALTER COLUMN "contributedFunds" TYPE numeric`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_3d6e89b14baa44a71870450d14d" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_3d6e89b14baa44a71870450d14d"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_to_savings_group" ALTER COLUMN "contributedFunds" TYPE numeric`
    );
    await queryRunner.query(
      `ALTER TABLE "savings_group" DROP CONSTRAINT "UQ_4651f5fc023fd270366bb910661"`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP COLUMN "accountId"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "resetPassword" jsonb DEFAULT '{}'`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "toInternalAccountId" uuid`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD "fromAccountId" uuid`
    );
    await queryRunner.query(`DROP TABLE "reset_code"`);
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_93a62aca5c0a25a6a5407051d42" FOREIGN KEY ("toInternalAccountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_1d251b00f7fc5ea00cb48623dbd" FOREIGN KEY ("fromAccountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
