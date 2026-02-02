#!/usr/bin/env node
const { execSync } = require('child_process');
const readline = require('readline');

const INSTANCE_ID = 'REDACTED_INSTANCE_ID';
const INSTANCE_NAME = 'REDACTED_INSTANCE_NAME';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function hardRestart() {
  try {
    console.log(`\n⚡ Hard Restarting: ${INSTANCE_NAME}`);
    console.log(`   Instance ID: ${INSTANCE_ID}`);
    console.log(`   Action: RESET (immediate power cycle)\n`);

    const confirm = await question('Continue? (yes/no): ');
    if (confirm.toLowerCase() !== 'yes') {
      console.log('Cancelled.\n');
      rl.close();
      return;
    }

    console.log('\n🔄 Initiating hard restart...\n');

    const cmd = `oci compute instance action --instance-id ${INSTANCE_ID} --action RESET`;
    const result = execSync(cmd, { encoding: 'utf-8' });
    const data = JSON.parse(result);

    console.log(`✅ Hard restart initiated!\n`);
    console.log(`State: ${data.data['lifecycle-state']}`);
    console.log(`Display Name: ${data.data['display-name']}`);
    console.log(`Last Updated: ${data.data['time-created']}\n`);

    rl.close();
  } catch (error) {
    console.error(`\n❌ Error: Failed to restart instance\n`);
    if (error.stderr) {
      console.error(`Details: ${error.stderr}`);
    }
    rl.close();
    process.exit(1);
  }
}

hardRestart();
