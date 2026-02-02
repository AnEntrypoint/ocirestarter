# OCI Restarter

Simple tool for hard restarting OCI instances via the command line.

## Setup

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

## Usage

```bash
node restart.js
```

Prompts for confirmation before executing a hard restart (RESET action).
