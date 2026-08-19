// Core data model for Cashboard.
//
// Everything the UI renders flows through these types. Data sources (demo,
// GoCardless, Alpaca, ...) implement the provider interfaces below, so swapping
// fake data for a real bank or brokerage is a config change — never a rewrite.

export type AccountType = "current" | "savings" | "investment" | "credit";

export interface Account {
  id: string;
  name: string;
  institution: string;
  type: AccountType;
  /** ISO 4217 currency code, e.g. "EUR". */
  currency: string;
  /** Balance in the account currency. Negative for money owed (credit cards). */
  balance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  description: string;
  category: string;
  /** Positive = money in, negative = money out. */
  amount: number;
}

export interface Position {
  symbol: string;
  name: string;
  quantity: number;
  /** Average cost per share. */
  avgPrice: number;
  /** Latest market price per share. */
  lastPrice: number;
}

export interface Portfolio {
  /** Uninvested cash sitting in the brokerage account. */
  cash: number;
  currency: string;
  positions: Position[];
  /** ISO timestamp for when the prices were captured. */
  asOf: string;
}

export interface NetWorthPoint {
  /** ISO date, yyyy-mm-dd (first of the month). */
  date: string;
  netWorth: number;
}

/** A source of bank accounts + transactions (a bank, aggregator, or demo). */
export interface BankProvider {
  readonly name: string;
  getAccounts(): Promise<Account[]>;
  getTransactions(): Promise<Transaction[]>;
  getNetWorthHistory(): Promise<NetWorthPoint[]>;
}

/** A source of investment holdings (a broker or demo). */
export interface TradingProvider {
  readonly name: string;
  getPortfolio(): Promise<Portfolio>;
}

export type AssetKind = "property" | "pension" | "vehicle" | "other";

export interface Asset {
  id: string;
  name: string;
  kind: AssetKind;
  currency: string;
  /** Current estimated market value. */
  value: number;
  /** Outstanding loan/mortgage secured against it (0 / omitted if owned outright). */
  liability?: number;
  purchasePrice?: number;
  purchaseDate?: string; // ISO
  /** Expected annual appreciation, e.g. 0.035 = 3.5%/yr (used by projections). */
  appreciationRate?: number;
}

/** A source of non-bank assets — property, pensions, vehicles, etc. */
export interface AssetProvider {
  readonly name: string;
  getAssets(): Promise<Asset[]>;
}
