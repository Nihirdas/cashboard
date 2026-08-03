import { demoPortfolio } from "@/lib/demo/data";
import type { TradingProvider } from "@/lib/providers/types";

export const demoTrading: TradingProvider = {
  name: "demo",
  async getPortfolio() {
    return demoPortfolio();
  },
};
