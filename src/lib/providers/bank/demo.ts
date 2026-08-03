import {
  demoAccounts,
  demoNetWorthHistory,
  demoTransactions,
} from "@/lib/demo/data";
import type { BankProvider } from "@/lib/providers/types";

export const demoBank: BankProvider = {
  name: "demo",
  async getAccounts() {
    return demoAccounts;
  },
  async getTransactions() {
    return demoTransactions;
  },
  async getNetWorthHistory() {
    return demoNetWorthHistory();
  },
};
