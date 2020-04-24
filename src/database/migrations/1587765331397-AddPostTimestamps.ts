import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPostTimestamps1587765331397 implements MigrationInterface {
    name = 'AddPostTimestamps1587765331397'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "base_model" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6858b0bfee6d486b76e323b3e9b" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "post" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined);
        await queryRunner.query(`ALTER TABLE "post" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "updatedAt"`, undefined);
        await queryRunner.query(`ALTER TABLE "post" DROP COLUMN "createdAt"`, undefined);
        await queryRunner.query(`DROP TABLE "base_model"`, undefined);
    }

}
