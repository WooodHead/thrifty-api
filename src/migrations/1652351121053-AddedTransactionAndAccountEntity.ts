import {MigrationInterface, QueryRunner} from "typeorm";

export class AddedTransactionAndAccountEntity1652351121053 implements MigrationInterface {
    name = 'AddedTransactionAndAccountEntity1652351121053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."transaction_transactiontype_enum" AS ENUM('INSTANT TRANSFER', 'BILL PAYMENT')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_transactionmode_enum" AS ENUM('DEBIT', 'CREDIT')`);
        await queryRunner.query(`CREATE TYPE "public"."transaction_transactionstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'FAILED', 'SUCCESSFUL', 'REVERSED', 'REVERSAL-REQUESTED', 'REVERSAL-APPROVED', 'REVERSAL-REJECTED', 'REVERSAL-CANCELLED', 'REVERSAL-FAILED', 'REVERSAL-SUCCESSFUL')`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "transactionDate" TIME NOT NULL, "description" character varying(255) NOT NULL DEFAULT '', "transactionAmount" numeric(15,2) NOT NULL DEFAULT '0', "transactionCharges" numeric(15,2) NOT NULL DEFAULT '0', "transactionType" "public"."transaction_transactiontype_enum" NOT NULL DEFAULT 'BILL PAYMENT', "transactionMode" "public"."transaction_transactionmode_enum" NOT NULL DEFAULT 'DEBIT', "transactionStatus" "public"."transaction_transactionstatus_enum" NOT NULL DEFAULT 'PENDING', "accountBalance" numeric(15,2) NOT NULL DEFAULT '0', "toExternalAccount" jsonb, "transactionRef" character varying(255), "userId" uuid, "fromAccountId" uuid, "toInternalAccountId" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."account_accounttype_enum" AS ENUM('CORPORATE_CURRENT', 'CORPORATE_DOMICILIARY', 'CORPORATE_SAVINGS', 'INDIVIDUAL_CURRENT', 'INDIVIDUAL_DOMICILIARY', 'INDIVIDUAL_SAVINGS', 'GROUP_CURRENT', 'GROUP_SAVINGS', 'JOINT_CURRENT', 'JOINT_SAVINGS')`);
        await queryRunner.query(`CREATE TYPE "public"."account_accountcurrency_enum" AS ENUM('NGN', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY')`);
        await queryRunner.query(`CREATE TYPE "public"."account_accountstatus_enum" AS ENUM('ACTIVE', 'DORMANT', 'SUSPENDED')`);
        await queryRunner.query(`CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" integer NOT NULL, "accountNumber" integer NOT NULL, "accountName" character varying NOT NULL, "accountType" "public"."account_accounttype_enum" NOT NULL DEFAULT 'INDIVIDUAL_SAVINGS', "accountCurrency" "public"."account_accountcurrency_enum" NOT NULL DEFAULT 'NGN', "accountStatus" "public"."account_accountstatus_enum" NOT NULL DEFAULT 'ACTIVE', "accountBalance" numeric(15,2) NOT NULL DEFAULT '0', "bookBalance" numeric(15,2) NOT NULL DEFAULT '0', CONSTRAINT "UQ_ee66d482ebdf84a768a7da36b08" UNIQUE ("accountNumber"), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_roles_enum" AS ENUM('ADMIN', 'GUEST', 'SUPER_ADMIN', 'SYSTEM_ADMIN', 'USER')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "roles" "public"."user_roles_enum" array NOT NULL DEFAULT '{USER}'`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_605baeb040ff0fae995404cea37" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_1d251b00f7fc5ea00cb48623dbd" FOREIGN KEY ("fromAccountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "transaction" ADD CONSTRAINT "FK_93a62aca5c0a25a6a5407051d42" FOREIGN KEY ("toInternalAccountId") REFERENCES "account"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_93a62aca5c0a25a6a5407051d42"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_1d251b00f7fc5ea00cb48623dbd"`);
        await queryRunner.query(`ALTER TABLE "transaction" DROP CONSTRAINT "FK_605baeb040ff0fae995404cea37"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "roles"`);
        await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TYPE "public"."account_accountstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."account_accountcurrency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."account_accounttype_enum"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_transactionstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_transactionmode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."transaction_transactiontype_enum"`);
    }

}
