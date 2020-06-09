import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPlaidItemTable1591667033349 implements MigrationInterface {
  name = 'AddPlaidItemTable1591667033349'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "plaid_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "itemId" character varying NOT NULL, "accessToken" bytea NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_74131b4c5292d7f6f1a7ad168e6" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "plaid_item" ADD CONSTRAINT "FK_627fd79db2ac5e145672b3e1449" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "plaid_item" DROP CONSTRAINT "FK_627fd79db2ac5e145672b3e1449"`,
    )
    await queryRunner.query(`DROP TABLE "plaid_item"`)
  }
}
