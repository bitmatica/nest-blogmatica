import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNonceColumn1588976410119 implements MigrationInterface {
    name = 'AddNonceColumn1588976410119'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" ADD "nonce" character varying NOT NULL`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "o_auth_token" DROP COLUMN "nonce"`, undefined);
    }

}
