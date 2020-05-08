import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateOAuthTableColumns1588963219160 implements MigrationInterface {
    name = 'UpdateOAuthTableColumns1588963219160'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" RENAME COLUMN "createdAt" TO "tokenCreatedAt"`, undefined);
        await queryRunner.query(`ALTER TYPE "public"."o_auth_token_provider_enum" RENAME TO "o_auth_token_provider_enum_old"`, undefined);
        await queryRunner.query(`CREATE TYPE "o_auth_token_provider_enum" AS ENUM('GUSTO', 'ASANA', 'GOOGLE', 'ZOOM', 'SLACK', 'HUBSPOT')`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "provider" TYPE "o_auth_token_provider_enum" USING "provider"::"text"::"o_auth_token_provider_enum"`, undefined);
        await queryRunner.query(`DROP TYPE "o_auth_token_provider_enum_old"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "o_auth_token_provider_enum_old" AS ENUM('gusto', 'asana', 'google')`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ALTER COLUMN "provider" TYPE "o_auth_token_provider_enum_old" USING "provider"::"text"::"o_auth_token_provider_enum_old"`, undefined);
        await queryRunner.query(`DROP TYPE "o_auth_token_provider_enum"`, undefined);
        await queryRunner.query(`ALTER TYPE "o_auth_token_provider_enum_old" RENAME TO  "o_auth_token_provider_enum"`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" RENAME COLUMN "tokenCreatedAt" TO "createdAt"`, undefined);
    }

}
