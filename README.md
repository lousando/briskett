# Briskett 🥩

A delicious Tezos wallet interface for Trezor.

## Dependencies 🧱

- Node >= 20.x
- PNPM >= 8.x
- The [Astro](https://astro.build/) Web Framework
- The [SolidJs](https://www.solidjs.com/) Component Framework

## Setup 🛠️

### .env

Start by running the following command to create an `.env` file to keep your secrets.

```bash
cp .env.example .env
```

From there, go ahead and populate the `.env` file.
It is populated with comments to help get you find what you need.

### Web Server 🌎

Run the following to get the web app going.

```bash
# install dependencies
$ pnpm i

# serve with hot reload at http://localhost:4321
$ pnpm watch

# Extras
# ======

# optional - generate static project
$ pnpm build

# optional - launch web server (after building)
$ pnpm preview
```
