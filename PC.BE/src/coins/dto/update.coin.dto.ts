import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@InputType()
class CoinsPictureInputUpdate {
  @Field(() => String)
  img: string;

  @Field(() => String)
  filetype: string;
}

@InputType()
class PriceCoinsInputUpdate {
  @Field(() => String)
  buy: string;

  @Field(() => String)
  sell: string;
}

@InputType()
class UpdateCoin {
  @Field(() => String)
  name: string;

  @Field(() => PriceCoinsInputUpdate)
  price: PriceCoinsInputUpdate;

  @Field(() => String)
  prefix: string;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  logoImageDetail: ImageDetailInputUpdate;
}

@InputType()
export class UpdateCoinDto {
  @Field(() => Types.ObjectId)
  coinID: Types.ObjectId;

  @Field(() => UpdateCoin)
  coin: UpdateCoin;

  @Field(() => [CoinsPictureInputUpdate], { nullable: true })
  newUploadLogo?: CoinsPictureInputUpdate[];
}
