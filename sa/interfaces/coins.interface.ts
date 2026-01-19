import type { ImageDetailInterface } from "./detailed-image.interface";

export interface CoinPriceInterface {
  buy: string;
  sell: string;
}

export interface CoinInterface {
  _id?: string;
  logo: string;
  logoImageDetail?: ImageDetailInterface | null;
  name: string;
  prefix: string;
  price: CoinPriceInterface;
}
