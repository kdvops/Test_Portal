import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';

// IMPORT MODULES
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';
import { SlidersModule } from './sliders/sliders.module';
import { PromotionsModule } from './promotions/promotions.module';
import { CategoriesModule } from './categories/categories.module';
import { FeaturesModule } from './features/features.module';
import { ProfitsModule } from './profits/profits.module';
import { PodcastModule } from './podcast/podcast.module';
import { ProductsModule } from './products/products.module';
import { SectionsModule } from './sections/sections.module';
import { CoinsModule } from './coins/coins.module';
import { LocationsModule } from './locations/locations.module';
import { FinanciallyModule } from './financially/financially.module';
import { ShortcutsModule } from './shortcuts/shortcuts.module';
import { BusinessModule } from './business/business.module';
import { RegulatoryModule } from './regulatory/regulatory.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { InsuranceModule } from './insurance/insurance.module';
import { FormsModule } from './forms/forms.module';
import { MessagesModule } from './messages/messages.module';
import { AzureBlobStorageModule } from './azure-blob-storage/azure-blob-storage.module';
import { PopupModule } from './popup/popup.module';
import { ConfigModule } from '@nestjs/config';
import { AdjudicatedModule } from './adjudicated/adjudicated.module';
import { ProuserModule } from './prouser/prouser.module';
import { SearchModule } from './search/search.module';

// IMPORT JSON OBJECT
// import { GraphQLJSONObject } from 'graphql-type-json';

// IMPORT SCALARS
import { DateTimeScalar } from './common/scalars/date-time.scalars';
import { ObjectIdScalar } from './common/scalars/object-id.scalar';
import { Types } from 'mongoose';
import { ChannelsModule } from './channels/channels.module';
import { SeoPageModule } from './seoPage/seoPage.module';
import { TargetsModule } from './targets/targets.module';
import { PostsModule } from './posts/posts.module';
import { graphqlLoggerPlugin } from './plugins/graphql-logger.plugin';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // resolvers: { JSON: GraphQLJSONObject },
      driver: ApolloDriver,
      playground: false,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      plugins: [graphqlLoggerPlugin()],
      buildSchemaOptions: {
        scalarsMap: [{ type: Types.ObjectId, scalar: ObjectIdScalar }],
      },
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    // CONFIG MODULE MONGOOSE
    MongooseModule.forRoot(process.env.MONO_DB_CONNECTION_STRING_ENV),

    // SET MODULES
    UserModule,
    SlidersModule,
    PromotionsModule,
    AuthenticationModule,
    CategoriesModule,
    FeaturesModule,
    ProfitsModule,
    PodcastModule,
    ProductsModule,
    SectionsModule,
    CoinsModule,
    LocationsModule,
    FinanciallyModule,
    ShortcutsModule,
    RegulatoryModule,
    BusinessModule,
    EnterpriseModule,
    InsuranceModule,
    FormsModule,
    MessagesModule,
    AzureBlobStorageModule,
    PopupModule,
    AdjudicatedModule,
    ProuserModule,
    SearchModule,
    ChannelsModule,
    SeoPageModule,
    TargetsModule,
    PostsModule,
  ],
  providers: [DateTimeScalar],
})
export class AppModule {}
