import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRefreshTokenToUser1589914065582 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" ADD "refreshToken" character varying`,
            undefined,
          )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`, undefined)
    }

}
