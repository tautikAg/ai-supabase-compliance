export const SQL_COMMANDS = {
  GET_ALL_TABLES: `
    CREATE OR REPLACE FUNCTION get_all_tables()
    RETURNS TABLE (
      table_name text,
      has_rls boolean,
      policies jsonb
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        t.tablename AS table_name,
        has_rls(t.tablename::regclass) AS has_rls,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'name', p.policyname,
              'command', p.cmd,
              'roles', p.roles
            )
          ) FILTER (WHERE p.policyname IS NOT NULL),
          '[]'::jsonb
        ) AS policies
      FROM pg_tables t
      LEFT JOIN pg_policies p 
        ON t.schemaname = p.schemaname AND t.tablename = p.tablename
      WHERE t.schemaname = 'public'
      GROUP BY t.tablename;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to get tables: %', SQLERRM;
    END;
    $$;`,

  GET_RLS_STATUS: `
    CREATE OR REPLACE FUNCTION get_rls_status()
    RETURNS TABLE (
      table_name text,
      rls_enabled boolean
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        t.tablename AS table_name,
        has_rls(t.tablename::regclass) AS rls_enabled
      FROM pg_tables t
      WHERE t.schemaname = 'public';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to get RLS status: %', SQLERRM;
    END;
    $$;`,

  ENABLE_RLS_FOR_TABLE: `
    CREATE OR REPLACE FUNCTION enable_rls_for_table(target_table text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- Check if the table exists in the public schema
      IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename = target_table
      ) THEN
        RAISE EXCEPTION 'Table % does not exist in public schema', target_table;
      END IF;

      -- Enable row level security on the table
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', target_table);
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to enable RLS for table %: %', target_table, SQLERRM;
    END;
    $$;`,

  ENABLE_MFA_FOR_USER: `
    CREATE OR REPLACE FUNCTION enable_mfa_for_user(user_id uuid)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      -- Check if auth schema exists
      IF NOT EXISTS (
        SELECT FROM information_schema.schemata 
        WHERE schema_name = 'auth'
      ) THEN
        RAISE EXCEPTION 'auth schema does not exist';
      END IF;

      -- Check if user exists
      IF NOT EXISTS (
        SELECT FROM auth.users 
        WHERE id = user_id
      ) THEN
        RAISE EXCEPTION 'User % does not exist', user_id;
      END IF;

      UPDATE auth.users
      SET raw_app_meta_data = 
        COALESCE(raw_app_meta_data, '{}'::jsonb) || 
        '{"mfa_enabled": true}'::jsonb
      WHERE id = user_id;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to enable MFA for user %: %', user_id, SQLERRM;
    END;
    $$;`,

  CHECK_RLS_STATUS: `
    CREATE OR REPLACE FUNCTION check_rls_status()
    RETURNS TABLE (
      compliant boolean,
      details text
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      total_tables int;
      rls_enabled_tables int;
    BEGIN
      SELECT 
        COUNT(*),
        COUNT(*) FILTER (WHERE has_rls(tablename::regclass))
      INTO total_tables, rls_enabled_tables
      FROM pg_tables
      WHERE schemaname = 'public';

      RETURN QUERY
      SELECT
        CASE WHEN total_tables = rls_enabled_tables THEN true ELSE false END,
        CASE 
          WHEN total_tables = 0 THEN 'No tables found in public schema'
          WHEN total_tables = rls_enabled_tables THEN 'All tables have RLS enabled'
          ELSE format('%s of %s tables have RLS enabled', rls_enabled_tables, total_tables)
        END;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to check RLS status: %', SQLERRM;
    END;
    $$;`,

  GET_PITR_STATUS: `
    CREATE OR REPLACE FUNCTION get_pitr_status()
    RETURNS TABLE (
      project_id text,
      project_name text,
      pitr_enabled boolean,
      retention_period text
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        p.id::text as project_id,
        p.name::text as project_name,
        p.pitr_enabled::boolean,
        p.retention_period::text
      FROM projects p
      WHERE p.deleted_at IS NULL;
    END;
    $$;`
}; 