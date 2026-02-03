// IMPORT INTERFACES
import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";

export interface NewCoverEpisode {
  img?: string;
  filetype?: string;
}

export interface PodcastGroupEpisodesBySeasonInterface {
  season: CategoriesInterface;
  episodes: Array<PodcastEpisodesInterface>;
}

export interface PodcastEpisodesInterface {
  _id?: string;
  status?: 'draft' | 'publish' | 'trash';
  title: string;
  slug: string;
  season: string;
  description: string;
  disabled: boolean;
  link: string;
  cover?: string;  
  coverImageDetail?: ImageDetailInterface | null;
}
