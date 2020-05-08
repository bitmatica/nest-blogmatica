import {MigrationInterface, QueryRunner} from "typeorm";

export class MakeOAuthColumnsNullable1588963726672 implements MigrationInterface {
    name = 'MakeOAuthColumnsNullable1588963726672'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "accessToken" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "refreshToken" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "tokenType" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "tokenCreatedAt" DROP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "expiresIn" DROP NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "expiresIn" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "tokenCreatedAt" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "tokenType" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "refreshToken" SET NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "accessToken" SET NOT NULL`, undefined);
    }

}
