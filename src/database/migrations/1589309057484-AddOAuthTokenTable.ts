import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOAuthTokenTable1589309057484 implements MigrationInterface {
    name = 'AddOAuthTokenTable1589309057484'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "o_auth_token_provider_enum" AS ENUM('GUSTO', 'ASANA', 'GOOGLE', 'ZOOM', 'SLACK', 'HUBSPOT')`, undefined);
        await queryRunner.query(`CREATE TABLE "o_auth_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "provider" "o_auth_token_provider_enum" NOT NULL, "nonce" character varying NOT NULL, "accessToken" character varying, "refreshToken" character varying, "tokenType" character varying, "tokenCreatedAt" integer, "expiresIn" integer, CONSTRAINT "PK_f627e7380e58f41d1157094c0d3" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ADD CONSTRAINT "FK_cacccc1796e11c9350fc1544328" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" DROP CONSTRAINT "FK_cacccc1796e11c9350fc1544328"`, undefined);
        await queryRunner.query(`DROP TABLE "o_auth_token"`, undefined);
        await queryRunner.query(`DROP TYPE "o_auth_token_provider_enum"`, undefined);
    }

}
