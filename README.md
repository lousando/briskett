# Briskett 🥩

A delicious Tezos wallet interface for Trezor.

## Setup

### .env

Start by running the following command to create an `.env` file to keep your secrets.

```bash
cp .env.example .env
```

From there, go ahead and populate the `.env` file.
The following is a breakdown of some of the environment variables

```yaml
# optional - The TZ Pro API endpoint and API key
# These are used to fetch wallet data such as transactions and current balance.
# Go here to claim a free key: https://docs.tzpro.io/intro/access
NUXT_ENV_TZPRO_URL=""
NUXT_ENV_TZPRO_API_KEY=""

# required - An RPC node to use. This is the server where your transactions will be sent.
# You may provide the URL of your own personal Tezos RPC Node or use one of the free community
# run nodes available here: https://tezostaquito.io/docs/rpc_nodes/
NUXT_ENV_TAQUITO_RPC_URL=""

# optional - For easier debugging wallet data without needing to connect a Trezor device.
# NOTE: For testing Sending and Delegation features, a Trezor device is still required.
NUXT_ENV_INITIAL_CONNECTED_ADDRESS=""
```

### Web Server

Tne project uses [Nuxt 2](https://v2.nuxt.com/). 
Run the following to get the web app going.

```bash
# install dependencies
$ yarn

# serve with hot reload at http://localhost:3000
$ yarn watch

# Extras
# ======

# optional - generate static project
$ yarn build

# optional - launch web server (after building)
$ yarn start
```
