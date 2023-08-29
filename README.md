# Briskett 🥩

A delicious Tezos wallet interface for Trezor.

## Build Setup

Tne project uses [Nuxt 2](https://v2.nuxt.com/). 
Run the following to get the web app going.

```bash
# install dependencies
$ yarn

# serve with hot reload at http://localhost:3000
$ yarn watch

# generate static project
$ yarn build

# launch web server (after building)
$ yarn start
```

## Trezor Connect Setup

For the local development, there must be a local Trezor service
running. To accomplish that, follow the steps below.

Clone this repo:
https://github.com/trezor/connect

```bash
# Now run the following commands to start up a dev server
yarn
yarn predev
yarn dev
```
