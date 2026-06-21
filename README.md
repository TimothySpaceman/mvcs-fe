# MVCS Frontend

This repo contains MVCS Frontend application.

## Requirements

- Node.js + npm
- If building the image:
- - Docker
- - Bash
- - jq — [Mac](https://formulae.brew.sh/formula/jq): `brew install jq` | [Linux](https://stedolan.github.io/jq/download/):
  `apt install jq` | [Windows](https://stedolan.github.io/jq/download/): `winget install jqlang.jq`

## Dev Deployment

Install all workspace dependencies from the repo root:

```sh
npm install
```

Make sure you have all env variables set up in `.env`:

- NEXT_PUBLIC_API_HOST
- API_URL (used for server-side calls, fallbacks to NEXT_PUBLIC_API_HOST)

Then run the app:

```sh
cd next-app && npm run dev
```


## Prod Deployment

Make sure you have all env variables set up in `.env`:

- NEXT_PUBLIC_API_HOST

Provide these env variables in the environment, via docker CLI params, in compose.yml etc:

- API_URL

## Scripts

- `./scripts/ensure_env.sh` - Checks if required env variables are present in `.env`
- `./scripts/build.sh` - Builds the Next.js App image using version from `package.json`

To deploy, build image (`./scripts/build.sh`) and run it as standalone or within Docker Compose project