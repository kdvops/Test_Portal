import type { CategoriesInterface } from "./categories.interface";
import type { TargetInterface } from "./targets.interface";

export interface ProductsHeaderInterface {
  cards: Array<CategoriesInterface>;
  deposits: Array<CategoriesInterface>;
  accounts: Array<CategoriesInterface>;
  loans: Array<CategoriesInterface>;
  global: Array<CategoriesInterface>;
}

export interface HeaderOptions {
  show: boolean;
  absolute: boolean;
  notifications: Array<any>;
  seasons: Array<CategoriesInterface>;
  products: ProductsHeaderInterface;
  about: Array<CategoriesInterface>;
  targets: Array<TargetInterface>;
  // KEY: VALUE
  [key: string]: any;
}
