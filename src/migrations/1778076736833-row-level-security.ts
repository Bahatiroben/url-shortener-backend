import { MigrationInterface, QueryRunner } from "typeorm";

export class RowLevelSecurity1778076736833 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable RLS on url_mappings table
        await queryRunner.query(`ALTER TABLE url_mappings ENABLE ROW LEVEL SECURITY;`);

        // Create policy to allow access only to the current team's URL mappings
        // User must belong to the team (member or owner)
        await queryRunner.query(`
            CREATE POLICY url_mappings_team_isolation ON url_mappings
            USING (
                teamId = current_setting('app.current_team_id')::uuid
                AND (
                    EXISTS (
                        SELECT 1 FROM team_members 
                        WHERE teamId = current_setting('app.current_team_id')::uuid
                        AND userId = current_setting('app.current_user_id')::uuid
                    )
                    OR
                    EXISTS (
                        SELECT 1 FROM teams 
                        WHERE id = current_setting('app.current_team_id')::uuid
                        AND ownerId = current_setting('app.current_user_id')::uuid
                    )
                )
            )
            WITH CHECK (
                teamId = current_setting('app.current_team_id')::uuid
                AND (
                    EXISTS (
                        SELECT 1 FROM team_members 
                        WHERE teamId = current_setting('app.current_team_id')::uuid
                        AND userId = current_setting('app.current_user_id')::uuid
                    )
                    OR
                    EXISTS (
                        SELECT 1 FROM teams 
                        WHERE id = current_setting('app.current_team_id')::uuid
                        AND ownerId = current_setting('app.current_user_id')::uuid
                    )
                )
            );
        `);

        // Set policy to RESTRICTIVE to ensure default deny
        await queryRunner.query(`ALTER TABLE url_mappings FORCE ROW LEVEL SECURITY;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the policy
        await queryRunner.query(`DROP POLICY IF EXISTS url_mappings_team_isolation ON url_mappings;`);

        // Disable RLS
        await queryRunner.query(`ALTER TABLE url_mappings DISABLE ROW LEVEL SECURITY;`);
    }

}
