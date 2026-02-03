import type { CoinInterface } from "./coins.interface";

export interface DrawerCalculatorsPropsInterface {
  show: boolean;
  type: "exchange" | "calculator";
  coins?: Array<CoinInterface>;
}
