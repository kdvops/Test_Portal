import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateCoinDto } from './dto/create.coin.dto';
import { UpdateCoinDto } from './dto/update.coin.dto';

// IMPORT SERVICES
import { CoinsService } from './coins.service';

// IMPORT USER SCHEMA
import { Coins } from './schema/coins.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  normalizeCreateCoinDto,
  validateCoinId,
  validateUpdateCoinDto,
} from './coins.validation';

@Resolver(() => Coins)
export class CoinsResolver {
  constructor(private coinsService: CoinsService) {}

  @Mutation(() => Coins)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateCoin(@Args('UpdateCoinDto') updateCoinDto: UpdateCoinDto) {
    const normalizedDto = validateUpdateCoinDto(updateCoinDto);
    return this.coinsService.updateCoin(normalizedDto);
  }

  @Mutation(() => Coins)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeCoin(@Args('CoinID') coinID: string) {
    const normalizedId = validateCoinId(coinID);
    return this.coinsService.removeCoin(normalizedId);
  }

  @Mutation(() => Coins)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createCoin(@Args('CreateCoinDto') createCoinDto: CreateCoinDto) {
    const normalizedDto = normalizeCreateCoinDto(createCoinDto);
    return this.coinsService.createCoins(normalizedDto);
  }

  @Query(() => [Coins])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async coins() {
    return this.coinsService.coins();
  }

  @Query(() => Coins)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findCoinById(@Args('CoinID') coinID: string) {
    const normalizedId = validateCoinId(coinID);
    return this.coinsService.findCoinById(normalizedId);
  }
}
