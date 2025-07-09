import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1752024939552 implements MigrationInterface {
  name = 'Init1752024939552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "production" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "production" DROP COLUMN "isActive"`);
  }
}
