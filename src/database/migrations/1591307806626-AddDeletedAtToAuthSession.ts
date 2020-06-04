import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDeletedAtToAuthSession1591307806626 implements MigrationInterface {
    name = 'AddDeletedAtToAuthSession1591307806626'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_session" ADD "deletedAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_session" DROP COLUMN "deletedAt"`);
    }

}
