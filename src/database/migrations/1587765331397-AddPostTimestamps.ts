import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPostTimestamps1587765331397 implements MigrationInterface {
  name = 'AddPostTimestamps1587765331397'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post"
        ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined)
    await queryRunner.query(`ALTER TABLE "post"
        ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post"
        DROP COLUMN "updatedAt"`, undefined)
    await queryRunner.query(`ALTER TABLE "post"
        DROP COLUMN "createdAt"`, undefined)
  }

}
