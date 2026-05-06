import { MigrationInterface, QueryRunner } from "typeorm";

export class RowLevelSecurity1778076736833 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Enable RLS on url_mappings table
        await queryRunner.query(`ALTER TABLE url_mappings ENABLE ROW LEVEL SECURITY;`);

        // Create policy for url_mappings - User must belong to the team (member or owner)
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

        // Enable RLS on teams table
        await queryRunner.query(`ALTER TABLE teams ENABLE ROW LEVEL SECURITY;`);

        // Create policy for teams - Users can only see teams they own or are members of
        await queryRunner.query(`
            CREATE POLICY teams_isolation ON teams
            USING (
                id = current_setting('app.current_team_id')::uuid
                AND (
                    ownerId = current_setting('app.current_user_id')::uuid
                    OR EXISTS (
                        SELECT 1 FROM team_members 
                        WHERE teamId = id
                        AND userId = current_setting('app.current_user_id')::uuid
                    )
                )
            )
            WITH CHECK (
                id = current_setting('app.current_team_id')::uuid
                AND ownerId = current_setting('app.current_user_id')::uuid
            );
        `);

        // Enable RLS on team_members table
        await queryRunner.query(`ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;`);

        // Create policy for team_members - Users can only see members of teams they belong to
        await queryRunner.query(`
            CREATE POLICY team_members_isolation ON team_members
            USING (
                teamId = current_setting('app.current_team_id')::uuid
                AND (
                    EXISTS (
                        SELECT 1 FROM team_members tm
                        WHERE tm.teamId = current_setting('app.current_team_id')::uuid
                        AND tm.userId = current_setting('app.current_user_id')::uuid
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
                        SELECT 1 FROM teams 
                        WHERE id = current_setting('app.current_team_id')::uuid
                        AND ownerId = current_setting('app.current_user_id')::uuid
                    )
                )
            );
        `);

        // Enable RLS on clicks table
        await queryRunner.query(`ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;`);

        // Create policy for clicks - Users can only see clicks for URLs in their team
        await queryRunner.query(`
            CREATE POLICY clicks_team_isolation ON clicks
            USING (
                EXISTS (
                    SELECT 1 FROM url_mappings um
                    WHERE um.shortKey = clicks.shortKey
                    AND um.teamId = current_setting('app.current_team_id')::uuid
                    AND (
                        EXISTS (
                            SELECT 1 FROM team_members 
                            WHERE teamId = um.teamId
                            AND userId = current_setting('app.current_user_id')::uuid
                        )
                        OR
                        EXISTS (
                            SELECT 1 FROM teams 
                            WHERE id = um.teamId
                            AND ownerId = current_setting('app.current_user_id')::uuid
                        )
                    )
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM url_mappings um
                    WHERE um.shortKey = clicks.shortKey
                    AND um.teamId = current_setting('app.current_team_id')::uuid
                    AND (
                        EXISTS (
                            SELECT 1 FROM team_members 
                            WHERE teamId = um.teamId
                            AND userId = current_setting('app.current_user_id')::uuid
                        )
                        OR
                        EXISTS (
                            SELECT 1 FROM teams 
                            WHERE id = um.teamId
                            AND ownerId = current_setting('app.current_user_id')::uuid
                        )
                    )
                )
            );
        `);

        // Set policy to RESTRICTIVE to ensure default deny on all tables
        await queryRunner.query(`ALTER TABLE url_mappings FORCE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE teams FORCE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE team_members FORCE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE clicks FORCE ROW LEVEL SECURITY;`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop all policies
        await queryRunner.query(`DROP POLICY IF EXISTS url_mappings_team_isolation ON url_mappings;`);
        await queryRunner.query(`DROP POLICY IF EXISTS teams_isolation ON teams;`);
        await queryRunner.query(`DROP POLICY IF EXISTS team_members_isolation ON team_members;`);
        await queryRunner.query(`DROP POLICY IF EXISTS clicks_team_isolation ON clicks;`);

        // Disable RLS on all tables
        await queryRunner.query(`ALTER TABLE url_mappings DISABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE teams DISABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;`);
        await queryRunner.query(`ALTER TABLE clicks DISABLE ROW LEVEL SECURITY;`);
    }

}
