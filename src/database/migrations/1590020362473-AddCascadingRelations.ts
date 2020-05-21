import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCascadingRelations1590020362473 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment"
                DROP CONSTRAINT "FK_94a85bb16d24033a2afdd5df060"`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "comment"
                ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    )

    await queryRunner.query(
      `ALTER TABLE "comment"
                DROP CONSTRAINT "FK_276779da446413a0d79598d4fbd"`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "comment"
                ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    )

    await queryRunner.query(
      `ALTER TABLE "post"
                DROP CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0"`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "post"
                ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "comment"
                ADD CONSTRAINT "FK_276779da446413a0d79598d4fbd" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "comment"
                ADD CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    )
    await queryRunner.query(
      `ALTER TABLE "post"
                ADD CONSTRAINT "FK_c6fb082a3114f35d0cc27c518e0" FOREIGN KEY ("authorId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    )
  }
}
