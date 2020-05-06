import {MigrationInterface, QueryRunner} from "typeorm";

export class AddOAuthTokenTable1588745006071 implements MigrationInterface {
    name = 'AddOAuthTokenTable1588745006071'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "o_auth_token_provider_enum" AS ENUM('gusto', 'asana', 'google')`, undefined);
        await queryRunner.query(`CREATE TABLE "o_auth_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "provider" "o_auth_token_provider_enum" NOT NULL, "accessToken" character varying NOT NULL, "refreshToken" character varying NOT NULL, "expiresIn" integer NOT NULL, "tokenType" character varying NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_f627e7380e58f41d1157094c0d3" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "o_auth_token" ADD CONSTRAINT "FK_cacccc1796e11c9350fc1544328" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" DROP CONSTRAINT "FK_cacccc1796e11c9350fc1544328"`, undefined);
        await queryRunner.query(`DROP TABLE "o_auth_token"`, undefined);
        await queryRunner.query(`DROP TYPE "o_auth_token_provider_enum"`, undefined);
    }

}
