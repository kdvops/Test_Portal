import { Field, InputType } from '@nestjs/graphql';
import { SeoPageMetaInput } from 'src/common/types/seo.type';

@InputType()
export class CreateSeoPageDto {
  @Field(() => String)
  path: string;

  @Field(() => SeoPageMetaInput)
  meta: SeoPageMetaInput;
}

@InputType()
export class CreateSeoPagesDto {
  @Field(() => [CreateSeoPageDto])
  pages: CreateSeoPageDto[];
}
