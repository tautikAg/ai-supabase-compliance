import { SUPABASE_KNOWLEDGE } from './knowledge';

interface SecurityContext {
  mfa?: { status: string };
  rls?: { compliant: boolean };
  pitr?: { status: string };
}

export const generatePrompt = (query: string, context?: SecurityContext): string => {
  // Find relevant knowledge sections based on query keywords
  const getRelevantKnowledge = (q: string) => {
    const keywords = {
      rls: ['rls', 'row', 'security', 'policy', 'policies'],
      mfa: ['mfa', '2fa', 'factor', 'authentication'],
      pitr: ['pitr', 'backup', 'recovery', 'restore']
    };

    const sections: string[] = [];
    if (keywords.rls.some(k => q.toLowerCase().includes(k))) sections.push('rls');
    if (keywords.mfa.some(k => q.toLowerCase().includes(k))) sections.push('mfa');
    if (keywords.pitr.some(k => q.toLowerCase().includes(k))) sections.push('pitr');
    
    return sections.length ? sections : ['rls', 'mfa', 'pitr']; // Default to all if no matches
  };

  const relevantSections = getRelevantKnowledge(query);
  const knowledgeBase = relevantSections.reduce((acc, section) => {
    acc[section] = SUPABASE_KNOWLEDGE[section as keyof typeof SUPABASE_KNOWLEDGE];
    return acc;
  }, {} as any);

  return `You are a Supabase security expert. Use this knowledge to provide brief, actionable answers:

KNOWLEDGE BASE:
${JSON.stringify(knowledgeBase, null, 2)}

${context ? `CURRENT STATUS:
- MFA: ${context.mfa?.status || 'Unknown'}
- RLS: ${context.rls?.compliant ? 'Enabled' : 'Disabled'}
- PITR: ${context.pitr?.status || 'Unknown'}` : ''}

QUERY: ${query}

Provide a concise response with:
1. Numbered action steps (max 3)
2. Relevant code example
3. One-line security note

Format as:
## Steps
1. [First step]
2. [Second step]
3. [Third step]

## Example
\`\`\`sql
[Code example]
\`\`\`

## Security Note
[Brief security implication]`;
}; 