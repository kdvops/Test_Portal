import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Categories } from 'src/categories/schema/categories.schema';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

// IMPORT SCHEMA SECTIONS
import { Sections } from 'src/sections/schema/sections.schema';

@InputType()
export class ArgsProuser {
  @Field(() => String)
  category: string;

  @Field(() => String)
  search: string;
}

@ObjectType()
export class ProuserValidateDocumentType {
  @Field(() => String, { nullable: true })
  TIPO_IDENTIFICACION?: string;

  @Field(() => String, { nullable: true })
  NUMERO_IDENTIFICACION?: string;

  @Field(() => String, { nullable: true })
  DESCRIPCION?: string;

  @Field(() => String, { nullable: true })
  NOMBRE?: string;

  @Field(() => String, { nullable: true })
  APELLIDO?: string;

  @Field(() => String, { nullable: true })
  FECHA?: string;

  @Field(() => String, { nullable: true })
  HORA?: string;

  @Field(() => String, { nullable: true })
  NOMBRE_DESTINATARIO?: string;

  @Field(() => String, { nullable: true })
  PERSONA_FIRMA?: string;

  @Field(() => String, { nullable: true })
  CODIGO_TIPO_IDENTIFICACION?: number;

  @Field(() => String, { nullable: true })
  CODIGO_VALIDACION?: number;
}

@ObjectType()
export class ProuserByGroupType {
  @Field(() => Categories)
  category: Categories;

  @Field(() => [ProuserPostType])
  prouser: ProuserPostType[];
}

@ObjectType()
export class ProuserPostType {
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  slug: string;

  @Field(() => String, { nullable: true })
  link?: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

  @Field(() => Categories)
  category: Categories;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => ImageDetailType, { nullable: true })
  bannerImageDetail: ImageDetailType;
  
  @Field(() => ImageDetailType, { nullable: true })
  thumbnailImageDetail: ImageDetailType;
  
  @Field(() => ImageDetailType, { nullable: true })
  responsiveImageDetail: ImageDetailType;
  
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [Sections])
  sections: Sections[];

  @Field(() => Date)
  createdAt: Date;
}
