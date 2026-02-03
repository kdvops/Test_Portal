import { Field, ObjectType } from '@nestjs/graphql';
import { SeoPageType } from 'src/common/types/seo.type';

@ObjectType()
export class SeoPages {
  @Field(() => [SeoPageType])
  pages: SeoPageType[];
}
