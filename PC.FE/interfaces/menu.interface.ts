import type { CategoriesInterface } from "./categories.interface";
import type { EnterpriseInterface } from "./enterprise.interface";
import type { PodcastGroupEpisodesBySeasonInterface } from "./podcast.interface";
import type { ProductInterface } from "./products.interface";

export interface DefaultMenuInterface {
  name: string;
  to: string;
  icon: string;
}

export interface OptionsMenuInterface {
  route: string;
  current: any;
  color?: string;
  default: DefaultMenuInterface;
  items: Array<ProductInterface> | Array<CategoriesInterface>;
}
