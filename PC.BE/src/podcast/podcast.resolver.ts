import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateEpisodePodcastDto } from './dto/create.podcast.dto';
import { UpdatePodcastEpisodeDto } from './dto/update.podcast.dto';
import { EpisodePodcastGroupBySeason } from './dto/args.podcast.dto';

// IMPORT SERVICES
import { PodcastService } from './podcast.service';

// IMPORT PROFITS SCHEMA
import { Podcast } from './schema/podcast.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  normalizeCreatePodcastDto,
  validateEpisodeId,
  validateUpdatePodcastDto,
} from './podcast.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Podcast)
export class PodcastResolver {
  constructor(private podcastsService: PodcastService) {}

  @Mutation(() => Podcast)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updatePodcastEpisode(
    @Args('UpdatePodcastEpisodeDto')
    updatePodcastEpisodeDto: UpdatePodcastEpisodeDto,
  ) {
    const normalizedDto = validateUpdatePodcastDto(updatePodcastEpisodeDto);
    return this.podcastsService.updatePodcastEpisode(normalizedDto);
  }

  @Mutation(() => Podcast)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createPodcastEpisode(
    @Args('CreateEpisodePodcastDto')
    createEpisodePodcastDto: CreateEpisodePodcastDto,
  ) {
    const normalizedDto = normalizeCreatePodcastDto(createEpisodePodcastDto);
    return this.podcastsService.createPodcastEpisode(normalizedDto);
  }

  @Mutation(() => Podcast)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  clonePodcast(@Args('episodeID') episodeID: string) {
    const normalizedId = validateEpisodeId(episodeID);
    return this.podcastsService.clonePodcastEpisode(normalizedId);
  }

  @Mutation(() => Podcast)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishPodcast(@Args('episodeID') episodeID: string) {
    const normalizedId = validateEpisodeId(episodeID);
    return this.podcastsService.changePodcastEpisodeStatus(
      normalizedId,
      'publish',
    );
  }

  @Mutation(() => Podcast)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftPodcast(@Args('episodeID') episodeID: string) {
    const normalizedId = validateEpisodeId(episodeID);
    return this.podcastsService.changePodcastEpisodeStatus(
      normalizedId,
      'draft',
    );
  }

  @Mutation(() => Podcast)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  removePodcast(@Args('episodeID') episodeID: string) {
    const normalizedId = validateEpisodeId(episodeID);
    return this.podcastsService.removePodcastEpisode(normalizedId);
  }

  @Query(() => [EpisodePodcastGroupBySeason])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  episodePodcastGroupBySeason(
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.podcastsService.episodePodcastGroupBySeason(findAll);
  }

  @Query(() => [Podcast])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findEpisodePodcastBySeason(
    @Args('seasonID') seasonID: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.podcastsService.findEpisodePodcastBySeason(seasonID, findAll);
  }

  @Query(() => Podcast)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findEpisodePodcastById(@Args('episodeID') episodeID: string) {
    const normalizedId = validateEpisodeId(episodeID);
    return this.podcastsService.findEpisodePodcastById(normalizedId);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueEpisodeSlug(@Args('Slug') slug: string) {
    return this.podcastsService.findUniqueSlug(slug);
  }
}
