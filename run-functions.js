#!/usr/bin/env node

/**
 * Execute Apps Script functions and capture logs
 * Uses Google Apps Script Execution API with clasp credentials
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

async function getAccessToken() {
  try {
    // Get access token from gcloud (clasp uses gcloud under the hood)
    const { stdout } = await execPromise('gcloud auth print-access-token', {
      timeout: 10000
    });
    return stdout.trim();
  } catch (error) {
    console.error('Failed to get access token. Make sure you\'re logged in:');
    console.error('  gcloud auth login');
    process.exit(1);
  }
}

async function executeFunction(scriptId, functionName, token) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Executing: ${functionName}`);
  console.log(`${'='.repeat(60)}`);

  const url = `https://script.googleapis.com/v1/scripts/${scriptId}:run`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        function: functionName,
        devMode: true
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✓ Function executed successfully`);

      if (result.response && result.response.result !== undefined) {
        console.log('\nReturn value:', result.response.result);
      }

      if (result.response && result.response.result instanceof Array) {
        console.log('\nLogs:');
        result.response.result.forEach(line => console.log('  ' + line));
      }

      return true;
    } else if (result.error) {
      console.error(`✗ Error: ${result.error.message}`);
      if (result.error.details) {
        console.error('\nDetails:');
        result.error.details.forEach(detail => {
          console.error(`  - ${detail.detail}`);
        });
      }
      return false;
    } else {
      console.error('✗ Unknown error:', result);
      return false;
    }
  } catch (error) {
    console.error('✗ Request failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('OCI Instance Monitor - Apps Script Function Runner\n');

  const scriptId = '17Dxik6f8vIKrLfZTiNuWGwxdMH5dp6lsnu4MRxikAB3lK61-S2NfGf0G';
  console.log(`Script ID: ${scriptId}\n`);

  // Get token
  console.log('Authenticating...');
  const token = await getAccessToken();
  console.log('✓ Authenticated\n');

  // Run functions in sequence
  const functions = ['debugOciSignature', 'testOciCall'];

  for (const fn of functions) {
    const success = await executeFunction(scriptId, fn, token);
    if (!success && fn === 'debugOciSignature') {
      console.log('\n⚠ Stopping - fix credentials first before testing restart');
      break;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Done');
  console.log('='.repeat(60));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
