export const SUPABASE_KNOWLEDGE = {
  rls: {
    setup: `alter table "table_name" enable row level security;`,
    policies: {
      select: `create policy "policy_name" on table_name 
        for select using ( auth.uid() = user_id );`,
      insert: `create policy "policy_name" on table_name 
        for insert with check ( auth.uid() = user_id );`,
      update: `create policy "policy_name" on table_name 
        for update using ( auth.uid() = user_id );`,
      delete: `create policy "policy_name" on table_name 
        for delete using ( auth.uid() = user_id );`
    },
    bestPractices: [
      'Enable RLS on all public tables',
      'Use auth.uid() for user-specific policies',
      'Add indexes on policy columns',
      'Minimize joins in policies',
      'Always specify roles (to authenticated/anon)'
    ]
  },

  mfa: {
    setup: {
      enrollment: 'supabase.auth.mfa.enroll()',
      challenge: 'supabase.auth.mfa.challenge()',
      verify: 'supabase.auth.mfa.verify()'
    },
    policies: {
      requireMFA: `create policy "require_mfa" on table_name
        as restrictive
        for all
        using ((auth.jwt()->>'aal')::text = 'aal2');`
    },
    bestPractices: [
      'Implement both enrollment and verification flows',
      'Use aal2 level for sensitive operations',
      'Add fallback mechanisms for recovery',
      'Store MFA state securely'
    ]
  },

  pitr: {
    requirements: [
      'Pro plan or higher',
      'Small compute add-on minimum',
      'Sufficient storage for WAL'
    ],
    features: [
      'Point-in-time recovery up to 7 days',
      'WAL archiving every 2 minutes',
      'Daily physical backups'
    ],
    bestPractices: [
      'Monitor WAL storage usage',
      'Regular recovery testing',
      'Document recovery procedures',
      'Set appropriate retention period'
    ]
  }
}; 