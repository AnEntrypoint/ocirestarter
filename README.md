# OCI Restarter

Simple tool for hard restarting OCI instances via the command line.

## Usage

```bash
node restart.js
```

Prompts for confirmation before executing a hard restart (RESET action).

## Setup

OCI credentials must be configured in `~/.oci/config`:

```
[DEFAULT]
user=ocid1.user.oc1...
fingerprint=xx:xx:xx...
tenancy=ocid1.tenancy.oc1...
region=af-johannesburg-1
key_file=/home/user/.oci/my-api-key.pem
```

The private key must be stored at `~/.oci/my-api-key.pem` with permissions `600`.

## Configuration

Edit the `INSTANCE_ID` and `INSTANCE_NAME` variables in `restart.js` to target different instances.
