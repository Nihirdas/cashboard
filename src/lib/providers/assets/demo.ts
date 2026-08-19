import { demoAssets } from "@/lib/demo/data";
import type { AssetProvider } from "@/lib/providers/types";

export const demoAssetProvider: AssetProvider = {
  name: "demo",
  async getAssets() {
    return demoAssets;
  },
};
