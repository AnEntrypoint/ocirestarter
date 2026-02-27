# OCI Restarter

Simple tool for hard restarting OCI instances via the command line, with optional automated health monitoring via Google Apps Script.

## Setup (CLI Tool)

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with your instance details:

```
OCI_INSTANCE_ID=ocid1.instance.oc1...
OCI_INSTANCE_NAME=your-instance-name
```

3. OCI credentials must be configured in `~/.oci/config`:

```
[DEFAULT]
user=ocid1.user.oc1...
fingerprint=xx:xx:xx...
tenancy=ocid1.tenancy.oc1...
region=af-johannesburg-1
key_file=/home/user/.oci/my-api-key.pem
```

The private key must be stored at `~/.oci/my-api-key.pem` with permissions `600`.

## Usage (CLI)

```bash
node restart.js
```

Prompts for confirmation before executing a hard restart (RESET action).

## Google Apps Script Setup (Automated Monitoring)

Automated health monitoring of `l-inc.co.za` with automatic restart on 3 consecutive failures.

### Prerequisites

1. **Google Account** with Sheets and Apps Script access
2. **OCI API Credentials** (from OCI Console → Your Profile → API Keys):
   - Tenancy OCID
   - User OCID
   - Fingerprint
   - Private Key (PEM format)
3. **OCI Instance Details**:
   - Instance OCID
   - Instance Region (e.g., `af-johannesburg-1`)

### Quick Start

1. **Update OCI Details in Code.gs**:
   ```bash
   clasp open
   ```
   - Edit the `CONFIG` object (lines 1-8) with your Instance OCID and region

2. **Create Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com) → New spreadsheet
   - Save the spreadsheet ID from the URL

3. **Deploy Credentials**:
   - In Apps Script editor, find `setupOciCredentials()` function (line 145)
   - Replace placeholder values with your OCI credentials
   - Click **Run** and authorize the script
   - Credentials are now stored securely in Google's Properties Service

4. **Set Up Monitoring**:
   - Run the `setupTrigger()` function in Apps Script
   - Authorize when prompted
   - Monitoring now runs every minute

5. **Verify**:
   - Run `checkWebsite()` manually to test
   - Check execution logs for `Website UP` or `Website DOWN`
   - Logs appear in the "Restart Log" sheet

### How It Works

- **Every minute**: Apps Script calls `checkWebsite()` to check `l-inc.co.za`
- **Track failures**: Counts consecutive failures
- **After 3 failures**: Calls OCI REST API to restart the instance
- **Cooldown**: Pauses monitoring for 10 minutes after restart
- **Reset counter**: Counter resets when website comes back UP

### Configuration

Edit the `CONFIG` object in `Code.gs`:
- `URL`: Website to monitor
- `FAILURE_THRESHOLD`: Number of failures before restart (default: 3)
- `PAUSE_MINUTES`: Cooldown after restart (default: 10)
- `OCI_REGION`: Your OCI region
- `INSTANCE_ID`: Your OCI instance OCID
- `LOG_SHEET_NAME`: Sheet for logging restarts

### Troubleshooting

- **"OCI credentials not configured"**: Re-run `setupOciCredentials()` with correct values
- **Trigger not running**: Check **Triggers** panel - ensure enabled
- **Restart not triggering**: Manually run `checkWebsite()` 3+ times to test
- **Cannot find `setupOciCredentials`**: Make sure you're in the correct Apps Script project

### Disable/Modify

- **Stop monitoring**: Go to **Triggers** → disable the `checkWebsite` trigger
- **Change interval**: Edit `.everyMinutes(1)` to different interval
- **Change threshold**: Edit `FAILURE_THRESHOLD` in CONFIG
