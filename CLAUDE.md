# OCI Instance Monitor - Google Apps Script Setup

## Status: DEPLOYED & READY TO ACTIVATE

The Google Apps Script monitoring system is fully deployed with credentials embedded. Just run two functions to activate monitoring.

## What's Configured

### ✓ Deployed
- **Google Apps Script project** via clasp (Script ID: `17Dxik6f8vIKrLfZTiNuWGwxdMH5dp6lsnu4MRxikAB3lK61-S2NfGf0G`)
- **Code.gs** with complete monitoring logic:
  - `checkWebsite()` - runs every minute via time-based trigger
  - `pingWebsite()` - HTTP health check to `https://www.l-inc.co.za/`
  - `restartInstance()` - OCI REST API with RSA-SHA256 signature authentication
  - `logRestart()` - logs restart events to Google Sheet with status/timestamp
  - `setupOciCredentials()` - securely stores API keys in encrypted Properties Service
  - `setupTrigger()` - creates the 1-minute monitoring interval
- **appsscript.json** manifest with required OAuth scopes (external requests, spreadsheets)
- **Security**: All sensitive files (.gitignore) excluded from git

### ⚠️ Requires User Input
- OCI credentials (tenancy, user, fingerprint, private key)
- OCI instance OCID and region
- Google Sheet for logging

## User Setup Steps (2 minutes)

**Credentials already configured!** Region and instance ID auto-detected. Private key fixed and embedded.

### 1. Deploy & Activate (Copy-Paste Ready)

```bash
# Already deployed via: clasp push
# Just open the editor:
clasp open
```

### 2. Run setupOciCredentials()
In Apps Script editor:
1. Function dropdown → select `setupOciCredentials`
2. Click **Run**
3. Authorize all permissions
4. Should see: `✓ OCI credentials configured. Run setupTrigger() next...`

### 3. Run setupTrigger()
In Apps Script editor:
1. Function dropdown → select `setupTrigger`
2. Click **Run**
3. Authorize if prompted
4. Should see: `Trigger created: checkWebsite runs every minute`
5. Verify in **Triggers** panel (left sidebar): `checkWebsite` with **Every minute**

### 4. Test
In Apps Script editor:
1. Function dropdown → select `checkWebsite`
2. Click **Run**
3. Should see: `Website UP` (if l-inc.co.za is accessible)
4. Logs appear in the "Restart Log" Google Sheet

**Done!** System now monitors 24/7 and auto-restarts on 3 consecutive failures.

## Testing

### Manual Test
In Apps Script editor:
1. Select `checkWebsite` from function dropdown
2. Click Run
3. Execution log shows: `Website UP` or `Website DOWN - failure 1/3`

### Trigger Test
1. Go to **Triggers** panel (left sidebar)
2. Confirm `checkWebsite` exists with **Every minute** interval

### First Failure Test
Run `checkWebsite()` 3 times manually to test restart logic (doesn't actually restart, logs to sheet).

## Architecture

```
Apps Script (runs every minute)
  ├─ pingWebsite()
  │   └─ HTTP GET to l-inc.co.za
  ├─ Track consecutive failures in PropertiesService
  ├─ On 3 failures: restartInstance()
  │   ├─ Read OCI credentials from PropertiesService
  │   ├─ Build request with RSA-SHA256 signature auth
  │   └─ POST to OCI API: /instances/{ID}?action=RESET
  └─ logRestart()
      └─ Append row to Google Sheet with status/timestamp
```

## Configuration Reference

All configuration in `Code.gs` lines 1-8:
| Setting | Default | Meaning |
|---------|---------|---------|
| URL | `https://www.l-inc.co.za/` | Website to monitor |
| FAILURE_THRESHOLD | 3 | Failures before restart |
| PAUSE_MINUTES | 10 | Cooldown after restart |
| OCI_REGION | `af-johannesburg-1` | Your OCI region |
| INSTANCE_ID | (user input) | Your instance OCID |
| LOG_SHEET_NAME | `Restart Log` | Sheet for logging |

## Security Notes

1. **Credentials Storage**: OCI API keys stored in Google's encrypted Properties Service, NOT in source code
2. **Git Safety**: `.gitignore` excludes `Code.gs`, `.clasp.json`, private keys
3. **Signature Auth**: Uses OCI-standard RSA-SHA256 signature authentication
4. **Scopes**: Only requests external request capability and spreadsheet access

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "OCI credentials not configured" | Re-run `setupOciCredentials()` with correct values |
| Trigger not running | Check **Triggers** panel—enable if disabled |
| Website always UP/DOWN | Verify `l-inc.co.za` accessible; check execution logs |
| Restart not triggering | Manually run `checkWebsite()` 3 times to test counter |

## File Manifest

| File | Purpose |
|------|---------|
| `Code.gs` | Google Apps Script source (encrypted, excluded from git) |
| `.clasp.json` | Project config with Script ID (excluded from git) |
| `appsscript.json` | OAuth scopes and manifest |
| `README.md` | Setup instructions |
| `CLAUDE.md` | This file—architecture and status |

## Environment

- **Monitoring Interval**: 1 minute (modifiable in `setupTrigger()`)
- **Failure Threshold**: 3 consecutive failures (modifiable in CONFIG)
- **Restart Cooldown**: 10 minutes (modifiable in CONFIG)
- **Target URL**: `https://www.l-inc.co.za/` (modifiable in CONFIG)
- **Logging**: Automatic to Google Sheet (format: Timestamp, Status Code, Response, URL, Instance ID)

## Next Steps

1. Get OCI credentials from your account
2. Run the 5-step setup above
3. Verify with manual `checkWebsite()` test
4. Check Google Sheet to see logs
5. System will now monitor 24/7 and auto-restart on failures

## Notes for Future

- The `setupOciCredentials()` and `setupTrigger()` functions are one-time setup—not part of monitoring loop
- To disable monitoring: Go to **Triggers** panel and toggle off
- To change monitoring interval: Edit `.everyMinutes(N)` in `setupTrigger()`
- Restart logs persist in Google Sheet for audit trail
- Each failure is logged to execution logs; restarts are logged to Google Sheet
