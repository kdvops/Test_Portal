import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateChannelDto } from './dto/create.channel.dto';
import { UpdateChannelDto } from './dto/update.channels.dto';
import {
  ArgsChannels,
  ChannelsByGroupType,
  ChannelsPostType,
} from './dto/args.channels.dto';

// IMPORT SERVICES
import { ChannelsService } from './channels.service';

// IMPORT USER SCHEMA
import { Channels } from './schema/channels.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SlugChannelsInterceptor } from './interceptor/channels.slug.interceptor';
import {
  normalizeCreateChannelDto,
  validateArgsChannels,
  validateChannelId,
  validateUpdateChannelDto,
} from './channels.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Channels)
export class ChannelsResolver {
  constructor(private channelsService: ChannelsService) {}

  @Mutation(() => Channels)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateChannel(
    @Args('UpdateChannelDto') updateChannelDto: UpdateChannelDto,
  ) {
    const normalizedDto = validateUpdateChannelDto(updateChannelDto);
    return this.channelsService.updateChannel(normalizedDto);
  }

  @Mutation(() => Channels)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createChannel(
    @Args('CreateChannelDto') createChannelDto: CreateChannelDto,
  ) {
    const normalizedDto = normalizeCreateChannelDto(createChannelDto);
    return this.channelsService.createChannel(normalizedDto);
  }

  @Mutation(() => Channels)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneChannel(@Args('ChannelID') channelID: string) {
    const normalizedId = validateChannelId(channelID);
    return this.channelsService.cloneChannel(normalizedId);
  }

  @Mutation(() => Channels)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishChannel(@Args('ChannelID') channelID: string) {
    const normalizedId = validateChannelId(channelID);
    return this.channelsService.changeChannelStatus(normalizedId, 'publish');
  }

  @Mutation(() => Channels)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftChannel(@Args('ChannelID') channelID: string) {
    const normalizedId = validateChannelId(channelID);
    return this.channelsService.changeChannelStatus(normalizedId, 'draft');
  }

  @Mutation(() => Channels)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeChannel(@Args('ChannelID') channelID: string) {
    const normalizedId = validateChannelId(channelID);
    return this.channelsService.removeChannel(normalizedId);
  }

  @UseInterceptors(SlugChannelsInterceptor)
  @Query(() => [ChannelsPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findChannelsByCategory(
    @Args('Category') category: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.channelsService.findChannelsByCategory(category, findAll);
  }

  @UseInterceptors(SlugChannelsInterceptor)
  @Query(() => [ChannelsPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findChannels(@Args('ArgsChannels') argsChannels: ArgsChannels) {
    validateArgsChannels(argsChannels);
    return this.channelsService.findChannels(argsChannels);
  }

  @UseInterceptors(SlugChannelsInterceptor)
  @Query(() => [ChannelsByGroupType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findChannelsGroupByType(    
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.channelsService.findChannelsGroupByType(findAll);
  }

  @UseInterceptors(SlugChannelsInterceptor)
  @Query(() => [ChannelsPostType])
  // @Roles(RolesUser.admin)
  async findChannelsPostPublic(    
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.channelsService.findChannelsPost(findAll);
  }

  @UseInterceptors(SlugChannelsInterceptor)
  @Query(() => [ChannelsPostType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findChannelsPost(    
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.channelsService.findChannelsPost(findAll);
  }

  @UseInterceptors(SlugChannelsInterceptor)
  @Query(() => ChannelsPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findChannelById(@Args('ChannelID') channelID: string) {
    const normalizedId = validateChannelId(channelID);
    return this.channelsService.findChannelById(normalizedId);
  }

  @UseInterceptors(SlugChannelsInterceptor)
  @Query(() => ChannelsPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findChannelsBySlug(@Args('Slug') slug: string) {
    return this.channelsService.findChannelsBySlug(slug);
  }
      
  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueChannelSlug(@Args('Slug') slug: string) {
    return this.channelsService.findUniqueSlug(slug);
  }
}
