import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUserPasswordAndEmailConstraint1588113081656 implements MigrationInterface {
  name = 'AddUserPasswordAndEmailConstraint1588113081656'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "passwordHash" character varying NOT NULL`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email")`,
      undefined,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22"`,
      undefined,
    )
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "passwordHash"`, undefined)
  }
}
