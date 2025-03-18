# BTS.id Backend Developer Technical Test

## Tech Stack

- Node.js
- TypeScript
- Hono
- Prisma
- Zod

## Requirements

- Node.js
- PNPM

## Installation

1. Clone the repository

```bash
git clone https://github.com/tfkhdyt/bts-id-backend-dev-technical-test.git
```

2. Open project directory

```bash
cd bts-id-backend-dev-technical-test
```

3. Make copy of `.env.example` file and rename it to `.env`

```bash
cp .env.example .env
```

4. Install dependencies

```bash
pnpm install
```

5. Run migration

```bash
# development
pnmm prisma migrate dev

# production
pnpm prisma migrate deploy
```

6. Run the server

```bash
# development
pnpm dev

# production
pnpm build
pnpm start
```
