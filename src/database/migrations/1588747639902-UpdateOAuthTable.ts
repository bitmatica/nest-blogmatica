import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateOAuthTable1588747639902 implements MigrationInterface {
    name = 'UpdateOAuthTable1588747639902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" DROP COLUMN "updatedAt"`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" DROP COLUMN "createdAt"`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ADD "createdAt" integer NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" DROP COLUMN "createdAt"`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`, undefined);
    }

}
