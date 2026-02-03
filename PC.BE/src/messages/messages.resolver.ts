import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateMessagesDto } from './dto/create.messages.dto';
import { UpdateMessagesDto } from './dto/update.messages.dto';
import { ArgsMessages, MessagesPostType } from './dto/args.messages.dto';

// IMPORT SERVICES
import { MessagesService } from './messages.service';

// IMPORT USER SCHEMA
import { Messages } from './schema/messages.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  normalizeCreateMessagesDto,
  validateArgsMessages,
  validateMessagesId,
  validateUpdateMessagesDto,
} from './messages.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Messages)
export class MessagesResolver {
  constructor(private messagesService: MessagesService) {}

  @Mutation(() => Messages)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateMessages(
    @Args('UpdateMessagesDto') updateMessagesDto: UpdateMessagesDto,
  ) {
    const normalizedDto = validateUpdateMessagesDto(updateMessagesDto);
    return this.messagesService.updateMessages(normalizedDto);
  }

  @Mutation(() => Messages)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createMessages(
    @Args('CreateMessagesDto') createMessagesDto: CreateMessagesDto,
  ) {
    const normalizedDto = normalizeCreateMessagesDto(createMessagesDto);
    return this.messagesService.createMessages(normalizedDto);
  }

  @Mutation(() => Messages)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeMessages(@Args('MessagesID') messagesID: string) {
    const normalizedId = validateMessagesId(messagesID);
    return this.messagesService.removeMessages(normalizedId);
  }

  @Query(() => [MessagesPostType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findMessagesAndDownloadFile(
    @Args('ArgsMessages') argsMessages: ArgsMessages,
  ) {
    validateArgsMessages(argsMessages);
    return this.messagesService.findMessagesAndDownloadFile(argsMessages);
  }

  @Query(() => [MessagesPostType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findMessages(@Args('ArgsMessages') argsMessages: ArgsMessages) {
    validateArgsMessages(argsMessages);
    return this.messagesService.findMessages(argsMessages);
  }

  @Query(() => MessagesPostType)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findMessagesById(@Args('MessagesID') messagesID: string) {
    const normalizedId = validateMessagesId(messagesID);
    return this.messagesService.findMessagesById(normalizedId);
  }
}
