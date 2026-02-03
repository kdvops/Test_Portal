import { ObjectType, Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE TEXT FOR SLIDER
@InputType()
export class FeaturesInput {
  @Field(() => String)
  text: string;

  @Field(() => String)
  align: string;

  @Field(() => String)
  size: string;

  @Field(() => String)
  color: string;

  @Field(() => String)
  weight: string;
}

@ObjectType()
export class FeaturesType {
  @Field(() => String)
  text: string;

  @Field(() => String)
  align: string;

  @Field(() => String)
  size: string;

  @Field(() => String)
  color: string;

  @Field(() => String)
  weight: string;
}

// OBJECTS TYPES FEATURE BUTTON FOR SLIDER
@InputType()
export class FeaturesButtonInput {
  @Field(() => Boolean)
  enabled: boolean;

  @Field(() => String)
  link: string;

  @Field(() => String)
  text: string;

  @Field(() => String)
  align: string;

  @Field(() => String)
  color: string;

  @Field(() => String)
  weight: string;

  @Field(() => String)
  background: string;
}

@ObjectType()
export class FeaturesButtonType {
  @Field(() => Boolean)
  enabled: boolean;

  @Field(() => String)
  link: string;

  @Field(() => String)
  text: string;

  @Field(() => String)
  align: string;

  @Field(() => String)
  color: string;

  @Field(() => String)
  weight: string;

  @Field(() => String)
  background: string;
}
