import {MigrationInterface, QueryRunner} from "typeorm";

export class AddExpiryToAuthSession1591300683393 implements MigrationInterface {
    name = 'AddExpiryToAuthSession1591300683393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
        await queryRunner.query(`ALTER TABLE "auth_session" ADD "expiry" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`UPDATE "auth_session" SET "expiry" = now()`);
        await queryRunner.query(`ALTER TABLE "auth_session" ALTER COLUMN "expiry" SET NOT NULL`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auth_session" DROP COLUMN "expiry"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshToken" character varying`);
    }

}
