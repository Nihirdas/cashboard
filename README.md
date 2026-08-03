# 💸 Cashboard

**An open-source personal finance dashboard for your bank accounts and investments — in one place.**

Stop copy-pasting balances into a spreadsheet. Cashboard pulls your bank accounts (EU/UK open banking) and your investment portfolio into a single, self-hosted dashboard: net worth over time, spending by category, and live portfolio P/L.

It **runs on realistic demo data out of the box** — clone it, run it, and you have a working dashboard in about a minute. Connect your real accounts whenever you're ready.

![License: MIT](https://img.shields.io/badge/license-MIT-green) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

<!-- Add a screenshot here once deployed: ![Cashboard overview](docs/overview.png) -->

---

## Features

- **Overview** — net-worth tile with month-over-month change, cash & investments split, spending this month, and a 12-month net-worth chart.
- **Accounts** — every bank account, balance, and institution at a glance.
- **Transactions** — searchable, filterable feed across all your accounts.
- **Portfolio** — holdings with unrealised P/L, total return, and allocation.
- **Demo-first & privacy-safe** — no real data or secrets in the repo; your accounts live only in your own `.env.local`.

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Recharts. Deploys free on Vercel.

## Quick start

```bash
git clone https://github.com/Nihirdas/cashboard.git
cd cashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). That's it — you're looking at the demo dataset.

## Connecting your real data

Cashboard keeps data sources behind a small **provider interface**, so going from demo to real is a config change, not a rewrite:

```
src/lib/providers/
├── types.ts              # the data model + BankProvider / TradingProvider
├── index.ts              # picks demo vs. real based on DEMO_MODE
├── bank/
│   ├── demo.ts           # seed data (default)
│   └── gocardless.ts     # real EU/UK bank data  ← implement this
└── trading/
    ├── demo.ts           # seed data (default)
    └── alpaca.ts         # real portfolio         ← implement this
```

1. Copy `.env.example` to `.env.local`.
2. Get free keys — [GoCardless Bank Account Data](https://bankaccountdata.gocardless.com/) (banks) and [Alpaca](https://alpaca.markets/) (investments, paper trading).
3. Implement the two stubbed providers (each file documents the exact API calls).
4. Set `DEMO_MODE=false`.

Because bank connections use open banking (PSD2), Cashboard never sees your banking credentials — you approve access on your bank's own consent screen.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nihirdas/cashboard)

Point a domain (or a subdomain like `cashboard.example.eu`) at the Vercel project and you're live.

## Roadmap

- [x] **v1** — dashboard on demo data (overview, accounts, transactions, portfolio)
- [ ] **v2** — live GoCardless bank connection
- [ ] **v3** — spending budgets, recurring-payment detection, persisted net-worth history
- [ ] **v4** — multi-user login so others can run it with their own accounts

## License

MIT — see [LICENSE](LICENSE). Built as an open-source showcase; contributions welcome.
