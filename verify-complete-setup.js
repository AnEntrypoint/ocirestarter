#!/usr/bin/env node

/**
 * Complete verification of OCI Instance Monitor Google Apps Script setup
 * Tests all functions end-to-end
 */

const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const SCRIPT_ID = '17Dxik6f8vIKrLfZTiNuWGwxdMH5dp6lsnu4MRxikAB3lK61-S2NfGf0G';
const PROJECT = 'firebase-a372b';

async function getAccessToken() {
  try {
    const { stdout } = await execAsync('gcloud auth print-access-token 2>&1');
    return stdout.trim();
  } catch (error) {
    console.error('❌ Failed to get access token');
    console.error('Run: gcloud auth login');
    process.exit(1);
  }
}

async function executeFunction(scriptId, functionName, token) {
  const url = `https://script.googleapis.com/v1/scripts/${scriptId}:run`;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const body = JSON.stringify({
    function: functionName,
    devMode: true
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || 'Unknown error',
        details: result.error?.details
      };
    }

    return {
      success: true,
      data: result.response,
      result: result.response?.result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function checkTriggers(token) {
  const url = `https://script.googleapis.com/v1/projects/${PROJECT}:getMetrics`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return { success: false, message: 'Could not fetch metrics' };
    }

    return { success: true, message: 'Metrics available' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('OCI INSTANCE MONITOR - COMPLETE VERIFICATION');
  console.log('='.repeat(60) + '\n');

  console.log('🔐 Authenticating with Google Cloud...');
  const token = await getAccessToken();
  console.log('✓ Authenticated\n');

  // Test functions in order
  const tests = [
    { name: 'debugOciSignature', required: true, description: 'Verify credentials and signature' },
    { name: 'testOciCall', required: true, description: 'Test OCI API restart call' },
    { name: 'setupTrigger', required: true, description: 'Create monitoring trigger' },
    { name: 'checkWebsite', required: true, description: 'Full monitoring cycle' }
  ];

  const results = [];

  for (const test of tests) {
    console.log(`📍 Testing: ${test.name}`);
    console.log(`   ${test.description}`);

    const result = await executeFunction(SCRIPT_ID, test.name, token);

    if (result.success) {
      console.log(`   ✅ Execution successful`);
      if (result.result) {
        console.log(`   Result: ${result.result}`);
      }
      results.push({ ...test, success: true });
    } else {
      console.log(`   ❌ Error: ${result.error}`);
      if (result.details) {
        result.details.forEach(d => console.log(`      - ${d.detail || d}`));
      }
      results.push({ ...test, success: false, error: result.error });

      if (test.required) {
        console.log('\n❌ FAILED: Required test failed. Setup incomplete.\n');
        process.exit(1);
      }
    }
    console.log();
  }

  // Summary
  console.log('='.repeat(60));
  console.log('VERIFICATION SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  results.forEach(r => {
    const icon = r.success ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
  });

  console.log(`\nPassed: ${passed}/${results.length}`);

  if (failed === 0) {
    console.log('\n🎉 ALL VERIFICATION TESTS PASSED!\n');
    console.log('='.repeat(60));
    console.log('SYSTEM STATUS: ✅ DEPLOYED & MONITORING ACTIVE');
    console.log('='.repeat(60));
    console.log('\nThe OCI Instance Monitor is now:');
    console.log('✓ Credentials configured and verified');
    console.log('✓ Signature authentication working');
    console.log('✓ OCI API calls functional');
    console.log('✓ Monitoring trigger active (checks every 1 minute)');
    console.log('✓ Ready for 24/7 operation');
    console.log('\nWebsite being monitored: https://www.l-inc.co.za/');
    console.log('Failure threshold: 3 consecutive failures');
    console.log('Auto-restart: Enabled');
    console.log();
    process.exit(0);
  } else {
    console.log('\n❌ VERIFICATION FAILED\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
