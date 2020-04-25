import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUsers1587767897796 implements MigrationInterface {
  name = 'AddUsers1587767897796'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "user"
                             (
                                 "id"        uuid              NOT NULL DEFAULT uuid_generate_v4(),
                                 "createdAt" TIMESTAMP         NOT NULL DEFAULT now(),
                                 "updatedAt" TIMESTAMP         NOT NULL DEFAULT now(),
                                 "email"     character varying NOT NULL,
                                 CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
                             )`, undefined)
    await queryRunner.query(`ALTER TABLE "post"
        ADD "authorId" uuid NOT NULL`, undefined)
    await queryRunner.query(`ALTER TABLE "post"
        ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "post"
        DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`, undefined)
    await queryRunner.query(`ALTER TABLE "post"
        DROP COLUMN "authorId"`, undefined)
    await queryRunner.query(`DROP TABLE "user"`, undefined)
  }

}
