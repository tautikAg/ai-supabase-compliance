import { SupabaseService } from '../services/supabase.service';
import { SQL_COMMANDS } from '../constants/sql-commands';

const MANAGEMENT_KEY = 'sbp_15a7e0cd67ac0d85487a417b29fc89bd1badfb8a';
const PROJECT_REF = 'vssizoqhrxccqpczhgpc';

async function testSQLFunctions() {
  try {
    console.log('Starting SQL function tests...');
    
    // Initialize SupabaseService
    const supabaseService = new SupabaseService({
      url: 'https://vssizoqhrxccqpczhgpc.supabase.co',
      serviceKey: process.env.SUPABASE_SERVICE_KEY || 'your-service-key',
    });

    // Set management key
    supabaseService.setManagementApiKey(MANAGEMENT_KEY);
    console.log('Management key set successfully');

    // Test SQL functions one by one
    console.log('\nTesting GET_ALL_TABLES function...');
    try {
      const result = await supabaseService.executeSQL(PROJECT_REF, SQL_COMMANDS.GET_ALL_TABLES);
      console.log('✅ GET_ALL_TABLES function created successfully');
      console.log('Result:', result);
    } catch (error) {
      console.error('❌ GET_ALL_TABLES failed:', error);
    }

    console.log('\nTesting GET_RLS_STATUS function...');
    try {
      const result = await supabaseService.executeSQL(PROJECT_REF, SQL_COMMANDS.GET_RLS_STATUS);
      console.log('✅ GET_RLS_STATUS function created successfully');
      console.log('Result:', result);
    } catch (error) {
      console.error('❌ GET_RLS_STATUS failed:', error);
    }

    console.log('\nTesting ENABLE_RLS_FOR_TABLE function...');
    try {
      const result = await supabaseService.executeSQL(PROJECT_REF, SQL_COMMANDS.ENABLE_RLS_FOR_TABLE);
      console.log('✅ ENABLE_RLS_FOR_TABLE function created successfully');
      console.log('Result:', result);
    } catch (error) {
      console.error('❌ ENABLE_RLS_FOR_TABLE failed:', error);
    }

    console.log('\nTesting ENABLE_MFA_FOR_USER function...');
    try {
      const result = await supabaseService.executeSQL(PROJECT_REF, SQL_COMMANDS.ENABLE_MFA_FOR_USER);
      console.log('✅ ENABLE_MFA_FOR_USER function created successfully');
      console.log('Result:', result);
    } catch (error) {
      console.error('❌ ENABLE_MFA_FOR_USER failed:', error);
    }

    console.log('\nTesting CHECK_RLS_STATUS function...');
    try {
      const result = await supabaseService.executeSQL(PROJECT_REF, SQL_COMMANDS.CHECK_RLS_STATUS);
      console.log('✅ CHECK_RLS_STATUS function created successfully');
      console.log('Result:', result);
    } catch (error) {
      console.error('❌ CHECK_RLS_STATUS failed:', error);
    }

    // Test the complete enableMFA process
    console.log('\nTesting complete enableMFA process...');
    try {
      await supabaseService.enableMFA(PROJECT_REF);
      console.log('✅ Complete MFA process succeeded');
    } catch (error) {
      console.error('❌ Complete MFA process failed:', error);
    }

    // Test the complete enableRLS process
    console.log('\nTesting complete enableRLS process...');
    try {
      await supabaseService.enableRLS(PROJECT_REF);
      console.log('✅ Complete RLS process succeeded');
    } catch (error) {
      console.error('❌ Complete RLS process failed:', error);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
console.log('Starting tests...');
testSQLFunctions().catch(console.error); 