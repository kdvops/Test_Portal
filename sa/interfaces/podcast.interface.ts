// IMPORT INTERFACES
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";

export interface PodcastGroupEpisodesBySeasonInterface {
  season: CategoriesInterface;
  episodes: Array<PodcastEpisodesInterface>;
}

export interface PodcastEpisodesInterface {
  _id?: string;
  title: string;
  season: string;
  description: string;
  disabled: boolean;
  link: string;
  cover?: string;
  coverImageDetail?: ImageDetailInterface | null;
  createdAt?: string;
}
