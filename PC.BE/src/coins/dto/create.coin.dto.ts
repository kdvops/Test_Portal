import { Field, InputType } from '@nestjs/graphql';
import { ImageDetailInput } from 'src/common/types/common.type';

@InputType()
class PriceCoinsInput {
  @Field(() => String)
  buy: string;

  @Field(() => String)
  sell: string;
}

@InputType()
export class CreateCoinDto {
  @Field(() => String)
  name: string;

  @Field(() => PriceCoinsInput)
  price: PriceCoinsInput;

  @Field(() => String)
  prefix: string;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => ImageDetailInput, { nullable: true })
  logoImageDetail: ImageDetailInput;
}
